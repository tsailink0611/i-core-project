#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LINE Bot アプリケーション

機能:
- LINE Messaging API Webhook受信
- Dify APIとの連携
- 会話履歴管理
- エラーハンドリング
"""

import os
import sys
import logging
import hashlib
import hmac
import json
from typing import Dict, List, Optional
from datetime import datetime

from flask import Flask, request, abort, jsonify
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError, LineBotApiError
from linebot.models import (
    MessageEvent,
    TextMessage,
    TextSendMessage,
    QuickReply,
    QuickReplyButton,
    MessageAction
)
import requests

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/real_estate_line_dify/line_bot.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 環境変数から設定を読み込み
LINE_CHANNEL_ACCESS_TOKEN = os.getenv('LINE_CHANNEL_ACCESS_TOKEN')
LINE_CHANNEL_SECRET = os.getenv('LINE_CHANNEL_SECRET')
DIFY_API_KEY = os.getenv('DIFY_API_KEY')
DIFY_API_BASE_URL = os.getenv('DIFY_API_BASE_URL', 'https://api.dify.ai/v1')
DIFY_APP_ID = os.getenv('DIFY_APP_ID')

# Flask アプリケーション初期化
app = Flask(__name__)

# LINE Bot API 初期化
line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)

# 会話履歴管理 (簡易版 - 本番環境ではRedisやDBを使用)
conversation_store = {}


class DifyClient:
    """Dify API クライアント"""

    def __init__(self, api_key: str, base_url: str, app_id: str):
        """
        初期化

        Args:
            api_key: Dify APIキー
            base_url: Dify APIベースURL
            app_id: Dify アプリケーションID
        """
        self.api_key = api_key
        self.base_url = base_url
        self.app_id = app_id
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def chat(self, query: str, user_id: str, conversation_id: Optional[str] = None) -> Dict:
        """
        Dify チャットAPIを呼び出し

        Args:
            query: ユーザーの質問
            user_id: ユーザーID (LINEユーザーID)
            conversation_id: 会話ID (継続会話の場合)

        Returns:
            Dify APIレスポンス
        """
        try:
            url = f"{self.base_url}/chat-messages"

            payload = {
                "inputs": {
                    "query": query
                },
                "query": query,
                "response_mode": "blocking",
                "user": user_id
            }

            # 継続会話の場合は conversation_id を含める
            if conversation_id:
                payload["conversation_id"] = conversation_id

            logger.info(f"Dify API リクエスト: user={user_id}, query={query[:50]}...")

            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                logger.info(f"Dify API 成功: conversation_id={data.get('conversation_id')}")
                return data
            else:
                logger.error(f"Dify API エラー: {response.status_code} - {response.text}")
                return {
                    "answer": "申し訳ございません。現在システムが混雑しております。しばらくしてから再度お試しください。",
                    "error": True
                }

        except requests.exceptions.Timeout:
            logger.error("Dify API タイムアウト")
            return {
                "answer": "申し訳ございません。応答に時間がかかっております。しばらくしてから再度お試しください。",
                "error": True
            }
        except Exception as e:
            logger.error(f"Dify API 例外: {e}", exc_info=True)
            return {
                "answer": "申し訳ございません。エラーが発生しました。お手数ですが、再度お試しください。",
                "error": True
            }

    def workflow_run(self, query: str, user_id: str) -> Dict:
        """
        Dify ワークフロー実行 (ワークフローアプリの場合)

        Args:
            query: ユーザーの質問
            user_id: ユーザーID

        Returns:
            Dify APIレスポンス
        """
        try:
            url = f"{self.base_url}/workflows/run"

            payload = {
                "inputs": {
                    "query": query
                },
                "response_mode": "blocking",
                "user": user_id
            }

            logger.info(f"Dify Workflow API リクエスト: user={user_id}")

            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                logger.info("Dify Workflow API 成功")
                return data
            else:
                logger.error(f"Dify Workflow API エラー: {response.status_code} - {response.text}")
                return {
                    "data": {
                        "outputs": {
                            "text": "申し訳ございません。現在システムが混雑しております。"
                        }
                    },
                    "error": True
                }

        except Exception as e:
            logger.error(f"Dify Workflow API 例外: {e}", exc_info=True)
            return {
                "data": {
                    "outputs": {
                        "text": "申し訳ございません。エラーが発生しました。"
                    }
                },
                "error": True
            }


# Dify クライアント初期化
dify_client = DifyClient(DIFY_API_KEY, DIFY_API_BASE_URL, DIFY_APP_ID)


def get_user_conversation_id(user_id: str) -> Optional[str]:
    """
    ユーザーの会話IDを取得

    Args:
        user_id: LINEユーザーID

    Returns:
        会話ID (存在しない場合はNone)
    """
    return conversation_store.get(user_id)


def save_user_conversation_id(user_id: str, conversation_id: str):
    """
    ユーザーの会話IDを保存

    Args:
        user_id: LINEユーザーID
        conversation_id: Dify会話ID
    """
    conversation_store[user_id] = conversation_id
    logger.info(f"会話ID保存: user={user_id}, conversation_id={conversation_id}")


def create_quick_reply_buttons() -> QuickReply:
    """
    クイックリプライボタンを作成

    Returns:
        QuickReply オブジェクト
    """
    items = [
        QuickReplyButton(
            action=MessageAction(label="物件を探す", text="渋谷駅から徒歩10分以内の1LDK物件を探しています")
        ),
        QuickReplyButton(
            action=MessageAction(label="初期費用について", text="初期費用を抑えられる物件はありますか?")
        ),
        QuickReplyButton(
            action=MessageAction(label="契約の流れ", text="賃貸契約の流れを教えてください")
        ),
        QuickReplyButton(
            action=MessageAction(label="会社情報", text="御社の営業時間を教えてください")
        ),
        QuickReplyButton(
            action=MessageAction(label="会話をリセット", text="/reset")
        )
    ]
    return QuickReply(items=items)


@app.route("/health", methods=['GET'])
def health_check():
    """ヘルスチェックエンドポイント"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "real-estate-line-bot"
    }), 200


@app.route("/api/line/webhook", methods=['POST'])
def webhook():
    """LINE Webhook エンドポイント"""

    # 署名検証
    signature = request.headers.get('X-Line-Signature')
    if not signature:
        logger.warning("署名ヘッダーが見つかりません")
        abort(400)

    body = request.get_data(as_text=True)
    logger.info(f"Webhook受信: body={body[:100]}...")

    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        logger.error("署名検証失敗")
        abort(400)
    except LineBotApiError as e:
        logger.error(f"LINE Bot API エラー: {e}")
        abort(500)

    return 'OK'


@handler.add(MessageEvent, message=TextMessage)
def handle_text_message(event):
    """
    テキストメッセージハンドラ

    Args:
        event: LINE MessageEvent
    """
    user_id = event.source.user_id
    user_message = event.message.text.strip()

    logger.info(f"メッセージ受信: user={user_id}, message={user_message}")

    try:
        # 会話リセットコマンド
        if user_message in ['/reset', 'リセット', '会話をリセット']:
            if user_id in conversation_store:
                del conversation_store[user_id]
                logger.info(f"会話リセット: user={user_id}")

            reply_message = TextSendMessage(
                text="会話をリセットしました。新しいご質問をどうぞ!",
                quick_reply=create_quick_reply_buttons()
            )
            line_bot_api.reply_message(event.reply_token, reply_message)
            return

        # ヘルプコマンド
        if user_message in ['/help', 'ヘルプ', '使い方']:
            help_text = """【使い方】
🏢 賃貸物件検索システムへようこそ!

■ できること
・物件検索 (エリア、間取り、賃料など)
・初期費用・契約に関する質問
・会社情報・サービス内容の確認

■ 便利な質問例
「渋谷駅から徒歩10分以内の1LDK物件」
「初期費用を抑えられる物件はありますか?」
「賃貸契約の流れを教えてください」

■ コマンド
/reset - 会話をリセット
/help - このヘルプを表示

お気軽にご質問ください!"""

            reply_message = TextSendMessage(
                text=help_text,
                quick_reply=create_quick_reply_buttons()
            )
            line_bot_api.reply_message(event.reply_token, reply_message)
            return

        # 継続会話の場合は conversation_id を取得
        conversation_id = get_user_conversation_id(user_id)

        # Dify API 呼び出し (Chatアプリの場合)
        dify_response = dify_client.chat(
            query=user_message,
            user_id=user_id,
            conversation_id=conversation_id
        )

        # ワークフローアプリの場合は以下を使用:
        # dify_response = dify_client.workflow_run(
        #     query=user_message,
        #     user_id=user_id
        # )

        # 会話IDを保存 (次回の継続会話用)
        if 'conversation_id' in dify_response and not dify_response.get('error'):
            save_user_conversation_id(user_id, dify_response['conversation_id'])

        # 回答テキスト取得
        # Chatアプリの場合
        answer_text = dify_response.get('answer', 'エラーが発生しました')

        # ワークフローアプリの場合は以下を使用:
        # answer_text = dify_response.get('data', {}).get('outputs', {}).get('text', 'エラーが発生しました')

        # 回答をLINEに送信
        reply_message = TextSendMessage(
            text=answer_text,
            quick_reply=create_quick_reply_buttons()
        )

        line_bot_api.reply_message(event.reply_token, reply_message)

        logger.info(f"回答送信完了: user={user_id}")

    except Exception as e:
        logger.error(f"メッセージ処理エラー: {e}", exc_info=True)

        # エラーメッセージを送信
        error_message = TextSendMessage(
            text="申し訳ございません。エラーが発生しました。お手数ですが、再度お試しください。",
            quick_reply=create_quick_reply_buttons()
        )

        try:
            line_bot_api.reply_message(event.reply_token, error_message)
        except LineBotApiError as api_error:
            logger.error(f"エラーメッセージ送信失敗: {api_error}")


def main():
    """メイン関数"""

    # 環境変数チェック
    required_vars = [
        'LINE_CHANNEL_ACCESS_TOKEN',
        'LINE_CHANNEL_SECRET',
        'DIFY_API_KEY',
        'DIFY_APP_ID'
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"環境変数が設定されていません: {', '.join(missing_vars)}")
        sys.exit(1)

    # アプリケーション起動
    port = int(os.getenv('PORT', 8000))
    host = os.getenv('HOST', '0.0.0.0')

    logger.info(f"LINE Bot アプリケーション起動: {host}:{port}")

    app.run(
        host=host,
        port=port,
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )


if __name__ == '__main__':
    main()
