# LINE Bot 実装ガイド

## 概要

不動産LINE-Dify統合システムのLINE Bot実装。
Dify AIワークフローと連携して、LINEユーザーからの賃貸物件検索・問い合わせに自動応答します。

## アーキテクチャ

```
[LINEユーザー]
    ↓
[LINE Messaging API]
    ↓ Webhook
[Flask アプリ (app.py)]
    ↓ API呼び出し
[Dify ワークフロー]
    ↓ 並列検索
[6つのナレッジベース]
    ↓ 回答生成
[LLM (GPT-4)]
    ↓ 返信
[LINEユーザー]
```

## 主要機能

### 1. Webhook受信
- LINE Messaging APIからのWebhookを受信
- 署名検証によるセキュリティ確保

### 2. Dify連携
- Chat API / Workflow API 対応
- 会話履歴管理 (conversation_id)
- タイムアウト・エラーハンドリング

### 3. 会話管理
- ユーザーごとの会話履歴保持
- `/reset` コマンドで会話リセット
- セッション継続による文脈理解

### 4. ユーザー体験
- クイックリプライボタン
- よくある質問テンプレート
- ヘルプコマンド

## ファイル構成

```
line_bot/
├── app.py                 # メインアプリケーション
├── requirements.txt       # Python依存関係
├── README.md             # このファイル
├── config.py             # 設定管理 (オプション)
├── models.py             # データモデル (オプション)
└── tests/                # テストコード
    ├── test_app.py
    └── test_dify_client.py
```

## セットアップ

### 1. 依存関係インストール

```bash
cd line_bot
pip install -r requirements.txt
```

### 2. 環境変数設定

`.env` ファイルを作成:

```bash
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# Dify API
DIFY_API_KEY=your_dify_api_key
DIFY_API_BASE_URL=https://api.dify.ai/v1
DIFY_APP_ID=your_dify_app_id

# サーバー設定
PORT=8000
HOST=0.0.0.0
DEBUG=false
LOG_LEVEL=INFO
```

### 3. LINE Developers Console 設定

#### 3-1. チャネル作成

1. **LINE Developers にログイン**
   - https://developers.line.biz/console/

2. **新規プロバイダー作成**
   - Provider name: 東京賃貸ホームズ

3. **Messaging API チャネル作成**
   - Channel name: 不動産検索Bot
   - Channel description: 賃貸物件検索AIアシスタント
   - Category: 不動産
   - Subcategory: 賃貸

#### 3-2. Channel Access Token 取得

1. **チャネル基本設定**
   - Channel ID をコピー
   - Channel Secret をコピー → `LINE_CHANNEL_SECRET`

2. **Messaging API設定**
   - 「Channel access token (long-lived)」を発行
   - トークンをコピー → `LINE_CHANNEL_ACCESS_TOKEN`

#### 3-3. Webhook URL 設定

1. **Messaging API設定 > Webhook URL**
   ```
   https://your-domain.com/api/line/webhook
   ```

2. **Webhook 有効化**
   - 「Use webhook」を ON に設定
   - 「Verify」ボタンでテスト (成功すると緑チェック)

3. **応答設定**
   - 「Auto-reply messages」を OFF
   - 「Greeting messages」を OFF (または独自に設定)

#### 3-4. 友だち追加

1. **Messaging API設定 > QR code**
   - QRコードを表示
   - スマホでスキャンして友だち追加

## 起動方法

### 開発環境

```bash
python app.py
```

### 本番環境 (Gunicorn)

```bash
gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 app:app
```

### Systemd サービス

`/etc/systemd/system/line-bot.service`:

```ini
[Unit]
Description=Real Estate LINE Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/real_estate_line_dify/line_bot
Environment="PATH=/opt/real_estate_line_dify/venv/bin"
EnvironmentFile=/opt/real_estate_line_dify/.env
ExecStart=/opt/real_estate_line_dify/venv/bin/gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

起動:

```bash
sudo systemctl daemon-reload
sudo systemctl enable line-bot
sudo systemctl start line-bot
sudo systemctl status line-bot
```

## 使い方

### ユーザー側

1. **友だち追加**
   - QRコードまたは LINE ID で追加

2. **質問送信**
   ```
   渋谷駅から徒歩10分以内の1LDK物件を探しています
   ```

3. **クイックリプライ使用**
   - 「物件を探す」
   - 「初期費用について」
   - 「契約の流れ」
   - 「会社情報」

### コマンド

| コマンド | 説明 |
|---------|------|
| `/help` | ヘルプを表示 |
| `/reset` | 会話をリセット |

## Dify API 連携

### Chat API (チャットアプリの場合)

```python
dify_response = dify_client.chat(
    query=user_message,
    user_id=user_id,
    conversation_id=conversation_id
)

answer = dify_response.get('answer')
conversation_id = dify_response.get('conversation_id')
```

### Workflow API (ワークフローアプリの場合)

```python
dify_response = dify_client.workflow_run(
    query=user_message,
    user_id=user_id
)

answer = dify_response.get('data', {}).get('outputs', {}).get('text')
```

### 切り替え方法

`app.py` の `handle_text_message` 関数内:

```python
# Chatアプリの場合
dify_response = dify_client.chat(...)
answer_text = dify_response.get('answer')

# ワークフローアプリの場合 (コメント解除)
# dify_response = dify_client.workflow_run(...)
# answer_text = dify_response.get('data', {}).get('outputs', {}).get('text')
```

## クイックリプライカスタマイズ

`create_quick_reply_buttons()` 関数を編集:

```python
def create_quick_reply_buttons() -> QuickReply:
    items = [
        QuickReplyButton(
            action=MessageAction(
                label="カスタムボタン",
                text="カスタム質問テキスト"
            )
        ),
        # ... 追加
    ]
    return QuickReply(items=items)
```

## 会話履歴管理

### メモリ内 (開発環境)

現在の実装:

```python
conversation_store = {}  # {user_id: conversation_id}
```

### Redis (本番環境推奨)

```python
import redis

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

def get_user_conversation_id(user_id: str) -> Optional[str]:
    return redis_client.get(f"conversation:{user_id}")

def save_user_conversation_id(user_id: str, conversation_id: str):
    redis_client.setex(
        f"conversation:{user_id}",
        3600,  # 1時間で期限切れ
        conversation_id
    )
```

## エラーハンドリング

### タイムアウト

```python
try:
    response = requests.post(url, json=payload, timeout=30)
except requests.exceptions.Timeout:
    return {
        "answer": "応答に時間がかかっております。再度お試しください。",
        "error": True
    }
```

### Dify API エラー

```python
if response.status_code != 200:
    logger.error(f"Dify API エラー: {response.status_code}")
    return {
        "answer": "システムが混雑しております。",
        "error": True
    }
```

### LINE API エラー

```python
try:
    line_bot_api.reply_message(event.reply_token, message)
except LineBotApiError as e:
    logger.error(f"LINE API エラー: {e}")
```

## ログ管理

### ログレベル

- **DEBUG**: 詳細な実行トレース
- **INFO**: 通常動作ログ (デフォルト)
- **WARNING**: 警告
- **ERROR**: エラー
- **CRITICAL**: 致命的エラー

### ログファイル

```
/var/log/real_estate_line_dify/line_bot.log
```

### ログローテーション

`/etc/logrotate.d/line-bot`:

```
/var/log/real_estate_line_dify/line_bot.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload line-bot > /dev/null 2>&1 || true
    endscript
}
```

## テスト

### ユニットテスト

```bash
pytest tests/ -v --cov=app
```

### Webhook テスト

```bash
curl -X POST http://localhost:8000/api/line/webhook \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: test" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "text",
        "text": "テストメッセージ"
      }
    }]
  }'
```

### ヘルスチェック

```bash
curl http://localhost:8000/health
```

## デバッグ

### ローカル開発

```bash
# ngrok でローカルサーバーを公開
ngrok http 8000

# LINE Developers Console で Webhook URL を ngrok URL に変更
https://xxxx-xx-xx-xx-xx.ngrok.io/api/line/webhook
```

### ログ確認

```bash
# リアルタイムログ監視
tail -f /var/log/real_estate_line_dify/line_bot.log

# エラーのみフィルタ
grep ERROR /var/log/real_estate_line_dify/line_bot.log

# 特定ユーザーのログ
grep "user=U1234567890" /var/log/real_estate_line_dify/line_bot.log
```

## セキュリティ

### 署名検証

```python
# LINE Webhook 署名検証
try:
    handler.handle(body, signature)
except InvalidSignatureError:
    abort(400)
```

### 環境変数保護

```bash
# .env ファイルの権限を制限
chmod 600 .env

# .gitignore に追加
echo ".env" >> .gitignore
```

### レート制限 (推奨)

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.headers.get('X-Line-Userid', 'anonymous'),
    default_limits=["20 per minute", "100 per hour"]
)

@app.route("/api/line/webhook", methods=['POST'])
@limiter.limit("20 per minute")
def webhook():
    # ...
```

## パフォーマンス最適化

### 非同期処理 (推奨)

```python
from flask import Flask
import asyncio
import aiohttp

async def call_dify_async(query, user_id):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            return await response.json()
```

### キャッシュ

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_quick_reply_buttons(category: str) -> QuickReply:
    # カテゴリ別クイックリプライをキャッシュ
    ...
```

## トラブルシューティング

### Webhook が届かない

1. **Webhook URL 確認**
   - HTTPS必須 (HTTPは不可)
   - LINE Developers Console で「Verify」成功するか

2. **ファイアウォール確認**
   ```bash
   sudo ufw allow 8000/tcp
   ```

3. **SSL証明書確認**
   ```bash
   curl -v https://your-domain.com/api/line/webhook
   ```

### Dify API エラー

1. **API Key 確認**
   ```bash
   curl -X POST 'https://api.dify.ai/v1/chat-messages' \
     -H 'Authorization: Bearer YOUR_API_KEY' \
     -H 'Content-Type: application/json'
   ```

2. **App ID 確認**
   - Dify Console > App Settings > App ID

3. **ワークフロー公開確認**
   - ワークフローが Published 状態か

### メモリ不足

```bash
# メモリ使用量確認
free -m

# プロセス確認
ps aux | grep gunicorn

# Worker数を減らす
gunicorn --workers 2 app:app
```

## 参考リンク

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [line-bot-sdk-python](https://github.com/line/line-bot-sdk-python)
- [Dify API ドキュメント](https://docs.dify.ai/)
- [Flask ドキュメント](https://flask.palletsprojects.com/)

## 更新履歴

- **2025-10-05**: 初版作成 (Dify連携、クイックリプライ、会話管理)
