#!/bin/bash
# 環境変数セットアップスクリプト

echo "Creating .env.local from 1Password..."
echo "Please paste your environment variables from 1Password:"
echo ""
echo "NEXT_PUBLIC_FIREBASE_API_KEY=..."
echo "LINE_CHANNEL_ACCESS_TOKEN=..."
echo "OPENAI_API_KEY=..."
echo ""
read -p "Press Enter when ready..."

# 1Passwordからコピーした内容を.env.localに保存
cat > .env.local

echo "✅ .env.local created successfully!"
