#!/bin/bash
# プライベートGistから .env.local を復元

echo "🔄 Restoring .env.local from private Gist..."

# i-core-env という名前のGistを検索
GIST_ID=$(gh gist list --secret | grep "i-core-env" | awk '{print $1}')

if [ -z "$GIST_ID" ]; then
  echo "❌ No backup found. Run backup-env.sh first."
  exit 1
fi

# Gistから復元
gh gist view $GIST_ID --raw > .env.local

echo "✅ .env.local restored successfully!"
echo ""
echo "You can now run:"
echo "  npm install"
echo "  npm run dev"
