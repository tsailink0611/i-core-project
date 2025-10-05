#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Drive 監視スクリプト（フォルダ別振り分け対応）

機能:
- Google Driveの指定フォルダを10分間隔で監視
- 新規/更新ファイルを検出
- フォルダ構造に基づいてDifyのナレッジベースに自動振り分け
- 対応形式: PDF, Excel, CSV, Word, テキスト

フォルダ構造とナレッジベースのマッピング:
- 1_物件情報/SUUMO物件 → SUUMO物件ナレッジ
- 1_物件情報/自社管理物件 → 自社管理物件ナレッジ
- 1_物件情報/元付け業者物件 → 元付け業者物件ナレッジ
- 2_会社情報 → 会社情報ナレッジ
- 3_サービス情報 → サービス情報ナレッジ
- 4_その他 → その他ナレッジ
"""

import os
import sys
import time
import json
import logging
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/drive_watcher.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 環境変数から設定を読み込み
GOOGLE_CREDENTIALS_PATH = os.getenv('GOOGLE_CREDENTIALS_PATH', './credentials.json')
DIFY_API_KEY = os.getenv('DIFY_API_KEY')
DIFY_API_BASE_URL = os.getenv('DIFY_API_BASE_URL', 'https://api.dify.ai/v1')

# Difyデータセット（ナレッジベース）IDマッピング
KNOWLEDGE_BASE_MAPPING = {
    'SUUMO物件': os.getenv('DIFY_DATASET_SUUMO'),
    '自社管理物件': os.getenv('DIFY_DATASET_JISSHA'),
    '元付け業者物件': os.getenv('DIFY_DATASET_MOTOTSUKE'),
    '会社情報': os.getenv('DIFY_DATASET_COMPANY'),
    'サービス情報': os.getenv('DIFY_DATASET_SERVICE'),
    'その他': os.getenv('DIFY_DATASET_OTHER')
}

# フォルダパスとナレッジベース名のマッピング
FOLDER_TO_KNOWLEDGE = {
    '1_物件情報/SUUMO物件': 'SUUMO物件',
    '1_物件情報/自社管理物件': '自社管理物件',
    '1_物件情報/元付け業者物件': '元付け業者物件',
    '2_会社情報': '会社情報',
    '3_サービス情報': 'サービス情報',
    '4_その他': 'その他'
}

# 監視対象のルートフォルダID
ROOT_FOLDER_ID = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID')

# 対応ファイル形式
SUPPORTED_MIME_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/csv': '.csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'application/vnd.ms-excel': '.xls',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
}

# 状態管理ファイル
STATE_FILE = '/opt/real_estate_line_dify/google_drive/drive_state.json'


class DriveWatcher:
    """Google Drive 監視クラス"""

    def __init__(self):
        """初期化"""
        self.drive_service = self._init_drive_service()
        self.processed_files = self._load_state()
        self.temp_dir = Path('/tmp/drive_watcher')
        self.temp_dir.mkdir(exist_ok=True)

    def _init_drive_service(self):
        """Google Drive APIサービスを初期化"""
        try:
            credentials = service_account.Credentials.from_service_account_file(
                GOOGLE_CREDENTIALS_PATH,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            service = build('drive', 'v3', credentials=credentials)
            logger.info("Google Drive APIサービスを初期化しました")
            return service
        except Exception as e:
            logger.error(f"Google Drive API初期化エラー: {e}")
            raise

    def _load_state(self) -> Dict:
        """前回の処理状態を読み込み"""
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"状態ファイル読み込みエラー: {e}")
        return {}

    def _save_state(self):
        """処理状態を保存"""
        try:
            os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
            with open(STATE_FILE, 'w') as f:
                json.dump(self.processed_files, f, indent=2)
            logger.info("処理状態を保存しました")
        except Exception as e:
            logger.error(f"状態ファイル保存エラー: {e}")

    def _get_folder_path(self, folder_id: str) -> str:
        """フォルダIDからフォルダパスを取得"""
        try:
            path_parts = []
            current_id = folder_id

            while current_id and current_id != ROOT_FOLDER_ID:
                folder = self.drive_service.files().get(
                    fileId=current_id,
                    fields='name,parents'
                ).execute()

                path_parts.insert(0, folder['name'])

                parents = folder.get('parents', [])
                current_id = parents[0] if parents else None

            return '/'.join(path_parts)
        except Exception as e:
            logger.error(f"フォルダパス取得エラー: {e}")
            return ""

    def _determine_knowledge_base(self, folder_path: str) -> Optional[str]:
        """フォルダパスからナレッジベース名を判定"""
        for path_pattern, kb_name in FOLDER_TO_KNOWLEDGE.items():
            if path_pattern in folder_path:
                logger.info(f"フォルダパス '{folder_path}' → ナレッジベース '{kb_name}'")
                return kb_name

        logger.warning(f"マッピング未定義のフォルダパス: {folder_path} → デフォルト 'その他'")
        return 'その他'

    def _list_files_recursive(self, folder_id: str) -> List[Dict]:
        """指定フォルダ配下のファイルを再帰的に取得"""
        all_files = []

        try:
            # フォルダ内のファイルとフォルダを取得
            query = f"'{folder_id}' in parents and trashed=false"
            results = self.drive_service.files().list(
                q=query,
                fields='files(id, name, mimeType, modifiedTime, parents)',
                pageSize=1000
            ).execute()

            items = results.get('files', [])

            for item in items:
                if item['mimeType'] == 'application/vnd.google-apps.folder':
                    # サブフォルダの場合、再帰的に取得
                    all_files.extend(self._list_files_recursive(item['id']))
                elif item['mimeType'] in SUPPORTED_MIME_TYPES:
                    # サポート対象のファイルの場合
                    all_files.append(item)

            return all_files

        except HttpError as e:
            logger.error(f"ファイル一覧取得エラー (フォルダID: {folder_id}): {e}")
            return []

    def _download_file(self, file_id: str, file_name: str) -> Optional[Path]:
        """ファイルをダウンロード"""
        try:
            request = self.drive_service.files().get_media(fileId=file_id)
            file_path = self.temp_dir / file_name

            with open(file_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()

            logger.info(f"ファイルダウンロード完了: {file_name}")
            return file_path

        except Exception as e:
            logger.error(f"ファイルダウンロードエラー ({file_name}): {e}")
            return None

    def _upload_to_dify(self, file_path: Path, dataset_id: str, file_name: str) -> bool:
        """Difyナレッジベースにファイルをアップロード"""
        try:
            url = f"{DIFY_API_BASE_URL}/datasets/{dataset_id}/document/create_by_file"

            headers = {
                'Authorization': f'Bearer {DIFY_API_KEY}'
            }

            with open(file_path, 'rb') as f:
                files = {
                    'file': (file_name, f, 'application/octet-stream')
                }
                data = {
                    'indexing_technique': 'high_quality',
                    'process_rule': {
                        'mode': 'automatic'
                    }
                }

                response = requests.post(
                    url,
                    headers=headers,
                    files=files,
                    data={'data': json.dumps(data)},
                    timeout=300
                )

            if response.status_code in [200, 201]:
                logger.info(f"Difyアップロード成功: {file_name} → データセット {dataset_id}")
                return True
            else:
                logger.error(f"Difyアップロードエラー: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Difyアップロード例外 ({file_name}): {e}")
            return False

    def _file_hash(self, file_id: str, modified_time: str) -> str:
        """ファイルの一意ハッシュ値を生成"""
        return hashlib.md5(f"{file_id}_{modified_time}".encode()).hexdigest()

    def process_files(self):
        """ファイルを処理"""
        logger.info("=" * 60)
        logger.info("ファイル処理を開始します")
        logger.info(f"監視ルートフォルダID: {ROOT_FOLDER_ID}")

        # すべてのファイルを再帰的に取得
        files = self._list_files_recursive(ROOT_FOLDER_ID)
        logger.info(f"検出ファイル数: {len(files)}")

        processed_count = 0
        skipped_count = 0
        error_count = 0

        for file_info in files:
            file_id = file_info['id']
            file_name = file_info['name']
            modified_time = file_info['modifiedTime']
            parents = file_info.get('parents', [])

            # ファイルハッシュで処理済みチェック
            file_hash = self._file_hash(file_id, modified_time)

            if file_hash in self.processed_files:
                skipped_count += 1
                continue

            # フォルダパスを取得
            folder_path = self._get_folder_path(parents[0]) if parents else ""

            # ナレッジベースを判定
            kb_name = self._determine_knowledge_base(folder_path)
            dataset_id = KNOWLEDGE_BASE_MAPPING.get(kb_name)

            if not dataset_id:
                logger.warning(f"ナレッジベースID未設定: {kb_name} - スキップ")
                skipped_count += 1
                continue

            logger.info(f"処理開始: {file_name} ({folder_path} → {kb_name})")

            # ダウンロード
            downloaded_file = self._download_file(file_id, file_name)
            if not downloaded_file:
                error_count += 1
                continue

            # Difyへアップロード
            if self._upload_to_dify(downloaded_file, dataset_id, file_name):
                self.processed_files[file_hash] = {
                    'file_id': file_id,
                    'file_name': file_name,
                    'modified_time': modified_time,
                    'folder_path': folder_path,
                    'knowledge_base': kb_name,
                    'processed_at': datetime.now().isoformat()
                }
                processed_count += 1
            else:
                error_count += 1

            # 一時ファイル削除
            try:
                downloaded_file.unlink()
            except:
                pass

        # 状態保存
        self._save_state()

        logger.info("=" * 60)
        logger.info(f"処理完了 - 処理: {processed_count}, スキップ: {skipped_count}, エラー: {error_count}")
        logger.info("=" * 60)

    def run(self, interval_minutes: int = 10):
        """定期実行"""
        logger.info(f"Google Drive監視を開始します（{interval_minutes}分間隔）")

        while True:
            try:
                self.process_files()
            except Exception as e:
                logger.error(f"予期しないエラー: {e}", exc_info=True)

            logger.info(f"{interval_minutes}分後に次回実行します")
            time.sleep(interval_minutes * 60)


def main():
    """メイン関数"""
    # 環境変数チェック
    required_vars = [
        'GOOGLE_CREDENTIALS_PATH',
        'DIFY_API_KEY',
        'GOOGLE_DRIVE_ROOT_FOLDER_ID',
        'DIFY_DATASET_SUUMO',
        'DIFY_DATASET_JISSHA',
        'DIFY_DATASET_MOTOTSUKE',
        'DIFY_DATASET_COMPANY',
        'DIFY_DATASET_SERVICE',
        'DIFY_DATASET_OTHER'
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"環境変数が設定されていません: {', '.join(missing_vars)}")
        sys.exit(1)

    # 監視開始
    watcher = DriveWatcher()
    watcher.run(interval_minutes=10)


if __name__ == '__main__':
    main()
