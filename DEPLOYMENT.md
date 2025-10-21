# デプロイメントガイド

このプロジェクトはVercelを使用した自動デプロイを推奨します。

## 🚀 セットアップ手順（初回のみ、10分）

### 1. Vercelアカウント作成

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」→「Continue with GitHub」
3. GitHubアカウントで認証

### 2. プロジェクト連携

1. Vercel Dashboard → 「Add New Project」
2. GitHubから `i-core-project` を選択
3. 「Import」をクリック

### 3. 環境変数設定

**重要:** Vercelダッシュボードで以下の環境変数を設定してください。

#### Firebase設定（Public）
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
NEXT_PUBLIC_FIREBASE_APP_ID=your_value
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_value
```

#### API Keys（Secret）
```
LINE_CHANNEL_ACCESS_TOKEN=your_value
LINE_CHANNEL_SECRET=your_value
OPENAI_API_KEY=your_value
NEXT_PUBLIC_LINE_LIFF_ID=your_value
NEXTAUTH_SECRET=your_value
```

**設定方法:**
- Vercel Dashboard → Settings → Environment Variables
- 各変数を追加（Production / Preview / Development すべてにチェック）

### 4. デプロイ

「Deploy」ボタンをクリック → 自動デプロイ開始（2-3分）

---

## 🌍 デプロイ環境

| ブランチ | 環境 | URL例 | 用途 |
|---------|------|-------|------|
| `main` | 本番 | `i-core-project.vercel.app` | 実際のサービス |
| `develop` | ステージング | `i-core-project-git-develop.vercel.app` | 統合テスト |
| `feature/xxx` | プレビュー | `i-core-project-git-feature-xxx.vercel.app` | 機能確認 |

---

## 📋 デプロイフロー

### 通常の開発

```bash
# 1. feature ブランチで開発
git checkout -b feature/new-feature
# コーディング...

# 2. コミット・プッシュ
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. 自動的にプレビュー環境にデプロイされる
# → GitHub の PR に Vercel bot が URL を投稿
```

### developへのマージ

```bash
# 1. PR作成・レビュー
# GitHub上でPR作成

# 2. CI通過を確認
# GitHub Actions の緑チェックを確認

# 3. developにマージ
# → 自動的にステージング環境にデプロイ
```

### 本番リリース

```bash
# 1. developからmainへPR
# 最終確認

# 2. mainにマージ
# → 自動的に本番環境にデプロイ
```

---

## 🔧 トラブルシューティング

### ビルドエラーが発生した場合

1. **ローカルでビルド確認**
   ```bash
   npm run build
   ```

2. **環境変数を確認**
   - Vercel Dashboard → Settings → Environment Variables
   - すべて設定されているか確認

3. **ログを確認**
   - Vercel Dashboard → Deployments → 失敗したデプロイをクリック
   - Build Logs を確認

### 環境変数が読み込まれない

- `NEXT_PUBLIC_` で始まる変数はクライアント側でも使用可能
- それ以外はサーバーサイドのみ
- 変更後は再デプロイが必要

---

## 💡 ベストプラクティス

### 1. ブランチ戦略

```
main (本番)
  ↑
develop (ステージング)
  ↑
feature/xxx (プレビュー)
```

### 2. デプロイ前チェックリスト

- [ ] CI（GitHub Actions）が通っている
- [ ] プレビュー環境で動作確認済み
- [ ] 環境変数が正しく設定されている
- [ ] ビルドエラーがない

### 3. ロールバック

問題が発生した場合、Vercel Dashboard から即座に前のバージョンに戻せます：

1. Deployments → 正常だったバージョンを選択
2. 「Promote to Production」をクリック

---

## 📊 モニタリング

Vercel Dashboardで以下を確認できます：

- **アクセス解析**: ページビュー、ユニークユーザー
- **パフォーマンス**: ページ読み込み速度
- **エラーログ**: ランタイムエラーの詳細
- **ビルドログ**: デプロイ履歴

---

## 🔒 セキュリティ

- 環境変数は暗号化されて保存
- `.env.local` はGitHubにpushしない（`.gitignore`で保護済み）
- 本番環境の環境変数は別途設定

---

## 🆘 サポート

- Vercel Documentation: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
