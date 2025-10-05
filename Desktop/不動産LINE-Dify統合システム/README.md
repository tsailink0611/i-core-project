# 不動産LINE-Dify統合システム

**賃貸物件検索AIアシスタント - LINE × Dify × Google Drive**

## 概要

LINEメッセージングAPIとDify AIを統合し、賃貸物件検索・問い合わせに自動応答するシステムです。
Google Driveから自動的にナレッジベースを更新し、常に最新の物件情報を提供します。

### 主要機能

✅ **LINE Bot**: ユーザーからの質問に24時間自動応答
✅ **Dify AI**: 6つのナレッジベースを並列検索して高精度回答
✅ **Google Drive連携**: フォルダ構造に基づいて自動振り分け・アップロード
✅ **リアルタイム更新**: 10分間隔で新規/更新ファイルを自動検出

### システムアーキテクチャ

```
[クライアント]
     ↓ ファイルアップロード
[Google Drive] (フォルダ別管理)
     ↓ 10分間隔監視
[Google Drive Watcher] (Python)
     ↓ 自動振り分け
[Dify 6つのナレッジベース]
  ├─ SUUMO物件
  ├─ 自社管理物件
  ├─ 元付け業者物件
  ├─ 会社情報
  ├─ サービス情報
  └─ その他
     ↓ 並列検索
[Dify Workflow] (YAML DSL)
     ↓ LLM回答生成
[LINE Bot] (Flask + Python)
     ↓ メッセージ送信
[エンドユーザー] (LINE)
```

## ディレクトリ構成

```
不動産LINE-Dify統合システム/
├── README.md                    # このファイル
├── .env.template               # 環境変数テンプレート
├── demo_data/                  # デモ用ナレッジ資料
│   ├── 1_物件情報/
│   │   ├── SUUMO物件/          # SUUMO掲載物件 (6ファイル)
│   │   ├── 自社管理物件/        # 自社管理物件 (6ファイル)
│   │   └── 元付け業者物件/      # 提携業者物件 (6ファイル)
│   ├── 2_会社情報/             # 会社概要・沿革 (5ファイル)
│   └── 3_サービス情報/         # 契約・FAQ (5ファイル)
├── google_drive/               # Google Drive監視スクリプト
│   ├── drive_watcher.py        # メイン監視スクリプト
│   └── drive_state.json        # 処理状態管理 (自動生成)
├── dify_workflow/              # Difyワークフロー設定
│   ├── real_estate_search_workflow.yml  # ワークフローDSL
│   └── README.md               # セットアップガイド
└── line_bot/                   # LINE Botアプリケーション
    ├── app.py                  # メインアプリケーション
    ├── requirements.txt        # Python依存関係
    └── README.md               # セットアップガイド
```

## クイックスタート

### 必要要件

- **Google Cloud Platform**: サービスアカウント + Drive API有効化
- **Dify アカウント**: SaaS版またはセルフホスト (v0.6+)
- **LINE Developers**: Messaging APIチャネル
- **Hostinger VPS**: Ubuntu 20.04+ (または任意のLinuxサーバー)
- **Python**: 3.9+

### セットアップ手順

詳細は各コンポーネントのREADMEを参照してください:

1. **[Dify Workflow](dify_workflow/README.md)** - ワークフローYAMLインポート
2. **[Google Drive Watcher](google_drive/README.md)** - 自動同期スクリプト設定
3. **[LINE Bot](line_bot/README.md)** - LINE Bot実装とデプロイ

## 技術スタック

- **言語**: Python 3.9+
- **Webフレームワーク**: Flask + Gunicorn
- **LINE SDK**: line-bot-sdk
- **Google API**: google-api-python-client
- **AI**: Dify (GPT-4)
- **Webサーバー**: Nginx
- **OS**: Ubuntu 20.04+
- **VPS**: Hostinger

## ライセンス

MIT License

## 更新履歴

- **2025-10-05**: 初版リリース (v1.0.0)
  - Google Drive自動同期
  - Dify 6ナレッジベース並列検索
  - LINE Bot実装
  - Hostinger VPSデプロイ対応
