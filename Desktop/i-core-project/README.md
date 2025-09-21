# l-core - AI駆動LINEマーケティングシステム

## 🎯 プロジェクト概要

l-coreは、LSTEPの代替となるAI駆動LINEマーケティング自動化プラットフォームです。
既存のFirebase・LINE設定を完全活用し、エンタープライズレベルのマルチテナントSaaSシステムとして構築されています。

### 主要特徴
- 🔒 **既存システム完全保護**: Firebase・LINE設定への影響ゼロ
- 🤖 **動的LLMモデル管理**: ChatGPT、Claude等の将来モデルに完全対応
- 🏢 **マルチテナント対応**: 個人〜エンタープライズまで対応
- ⚡ **リアルタイム分析**: 高度な分析・レポート機能
- 🛡️ **エンタープライズセキュリティ**: 暗号化・権限管理完備

## 🛠 技術スタック

```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript (strict mode)
UI: Tailwind CSS v3.4.0
Database: Firebase Firestore (既存プロジェクト活用)
Authentication: Firebase Auth (既存設定活用)
Storage: Firebase Storage (既存設定活用)
AI: 動的LLMモデル管理システム
Messaging: LINE Messaging API (既存設定活用)
Deployment: Vercel対応
Package Manager: npm
```

## 📁 プロジェクト構造

```
/src
├── components/          # UIコンポーネント
│   ├── common/         # 共通コンポーネント
│   ├── setup/          # セットアップ画面
│   ├── dashboard/      # ダッシュボード
│   ├── messages/       # メッセージ管理
│   ├── account/        # アカウント管理
│   └── admin/          # 管理者機能
├── lib/                # ライブラリ・ユーティリティ
│   ├── firebase/       # Firebase統合（既存設定活用）
│   ├── line/           # LINE API統合（既存設定活用）
│   ├── llm/            # LLMモデル管理
│   ├── integration/    # 既存システム統合
│   └── utils/          # ユーティリティ関数
└── app/                # Next.js App Router
    ├── setup/          # 初期設定
    ├── dashboard/      # メインダッシュボード
    ├── admin/          # 管理者画面
    └── api/            # API エンドポイント
```

## 🚀 セットアップ

### 1. 環境変数設定

`.env.local`ファイルを作成し、既存のFirebase・LINE設定を設定してください：

```bash
# 既存Firebase設定（そのまま使用）
NEXT_PUBLIC_FIREBASE_API_KEY=your_existing_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_existing_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_existing_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_existing_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_existing_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_existing_app_id

# 既存LINE設定（そのまま使用）
LINE_CHANNEL_ACCESS_TOKEN=your_existing_line_access_token
LINE_CHANNEL_SECRET=your_existing_line_secret
NEXT_PUBLIC_LINE_LIFF_ID=your_existing_liff_id

# LLM API設定（新規）
OPENAI_API_KEY=your_openai_api_key
```

### 2. 依存関係インストール

```bash
npm install
```

### 3. 開発サーバー起動

```bash
npm run dev
```

### 4. 初期設定

`http://localhost:3000/setup` にアクセスして、既存システムとの統合を確認してください。

## 🔧 開発ガイド

### コミット規則
- 機能実装単位でコミット
- コミットメッセージは日本語・具体的に記述
- 既存システムへの影響がないことを確認後にコミット

### ブランチ戦略
- `main`: 本番環境（保護）
- `develop`: 開発環境（メイン作業ブランチ）
- `feature/*`: 機能開発ブランチ

### 型安全性
- TypeScript strict modeを厳守
- 全ての関数・変数に適切な型定義
- zod による実行時型検証

## 📊 データ構造

### Firebase Collections (l-core専用)
- `l-core-organizations`: 組織情報
- `l-core-stores`: 店舗情報
- `l-core-users`: ユーザー情報
- `l-core-messages`: メッセージデータ
- `l-core-campaigns`: キャンペーン情報
- `l-core-analytics`: 分析データ
- `l-core-llm-models`: LLMモデル設定
- `l-core-system-config`: システム設定

## 🛡️ セキュリティ

### データ保護
- 既存Firebaseデータへの影響完全防止
- l-core専用コレクションで完全分離
- 暗号化による機密情報保護

### アクセス制御
- Firebase Auth による認証
- ロールベースアクセス制御（RBAC）
- マルチテナント対応権限管理

## 📈 ロードマップ

### Phase 1: 基盤構築 ✅
- Next.js 14 + TypeScript環境
- 既存Firebase・LINE統合
- 基本認証機能

### Phase 2: AI機能 🔄
- 動的LLMモデル管理
- メッセージ自動生成
- コスト管理

### Phase 3: UI/UX 📋
- レスポンシブダッシュボード
- メッセージ作成画面
- 分析レポート画面

### Phase 4: 高度機能 📋
- スケジュール配信
- セグメント管理
- A/Bテスト機能

## 🤝 コントリビューション

1. developブランチから機能ブランチを作成
2. 機能実装・テスト
3. プルリクエスト作成
4. コードレビュー・マージ

## 📄 ライセンス

プロプライエタリライセンス - 商用利用制限あり

## 📞 サポート

技術的な質問やサポートが必要な場合は、開発チームまでお問い合わせください。