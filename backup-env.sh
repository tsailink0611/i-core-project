#!/bin/bash
# .env.local をプライベートGistにバックアップ

echo "📦 Backing up .env.local to private Gist..."

# Gistに保存（初回のみ新規作成、2回目以降は更新）
GIST_ID=$(gh gist list --secret | grep "i-core-env" | awk '{print $1}')

if [ -z "$GIST_ID" ]; then
  # 新規作成
  gh gist create .env.local --secret --desc "i-core-env"
  echo "✅ Created new private Gist"
else
  # 既存を更新
  gh gist edit $GIST_ID .env.local
  echo "✅ Updated existing Gist: $GIST_ID"
fi

echo ""
echo "To restore on another PC:"
echo "  gh gist view <GIST_ID> --raw > .env.local"
