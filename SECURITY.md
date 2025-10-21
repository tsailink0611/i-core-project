# セキュリティガイド

## 🔑 環境変数の管理

### 基本方針

`.env.local` には機密情報（APIキー、トークン）が含まれます。以下の方針で管理してください：

1. **ローカルPCに保存** - 開発に必要
2. **GitHubには含めない** - `.gitignore`で保護済み
3. **バックアップは任意** - 便利だが必須ではない

---

## 📱 PCが壊れた場合の復旧手順

### オプションA: トークンを再発行（推奨・最も安全）

所要時間: 約15分

1. **プロジェクトをclone**
   ```bash
   git clone https://github.com/tsailink0611/i-core-project.git
   cd i-core-project
   cp .env.local.example .env.local
   ```

2. **LINE設定を取得**
   - [LINE Developers Console](https://developers.line.biz/) にログイン
   - チャネルを選択 → "Messaging API設定"
   - Channel Access Token を再発行
   - Channel Secret をコピー

3. **OpenAI APIキーを取得**
   - [OpenAI Platform](https://platform.openai.com/api-keys) にログイン
   - "Create new secret key" をクリック
   - キーをコピー

4. **Firebase設定を取得**
   - [Firebase Console](https://console.firebase.google.com/) にログイン
   - プロジェクト設定 → "全般" → アプリを選択
   - 設定オブジェクトをコピー

5. **.env.local に貼り付け**
   ```bash
   # .env.local を編集
   nano .env.local
   ```

6. **アプリ起動**
   ```bash
   npm install
   npm run dev
   ```

---

### オプションB: バックアップから復元（便利）

所要時間: 約30秒

**事前準備（初回のみ）:**
```bash
# プライベートGistにバックアップ
./backup-env.sh
```

**復元時:**
```bash
git clone https://github.com/tsailink0611/i-core-project.git
cd i-core-project
./restore-env.sh  # Gistから自動復元
npm install
npm run dev
```

---

## 🔄 トークンのローテーション

### 重要：基本的に再発行は不要です

**トークンの有効期限:**
- LINE Channel Access Token: **無期限**
- OpenAI API Key: **無期限**
- Firebase設定: **永続的**

**つまり:** 一度設定したら、ずっと使い続けられます。

### 再発行が必要なケース

**必須（すぐやる）:**
- 🚨 トークンが漏洩した（GitHubに誤push等）
- 🚨 不正アクセスを検知した

**任意（企業のセキュリティポリシーによる）:**
- 💡 定期的なローテーション（3-6ヶ月ごと）
- 💡 個人開発・小規模チームなら **スキップしてOK**

### 再発行の手順（必要な時のみ）

#### LINE Channel Access Token

1. LINE Developers Console → "Messaging API設定"
2. "再発行" ボタンをクリック
3. 新しいトークンを `.env.local` に設定
4. アプリを再起動

#### OpenAI API Key

1. OpenAI Platform → API Keys
2. 古いキーを "Revoke" で無効化
3. 新しいキーを作成
4. `.env.local` を更新

**注意:** これらは**手動操作が必要**です（自動化不可）

---

## 🚨 トークン漏洩時の対処

万が一、トークンが漏洩した場合：

1. **即座に無効化**
   - LINE: Developer Console で再発行
   - OpenAI: Platform で Revoke

2. **新しいトークンを発行**
   - 上記の手順で新規作成

3. **GitHubの履歴を確認**
   ```bash
   # 過去のコミットに含まれていないか確認
   git log --all --full-history -- .env.local
   ```

4. **必要に応じて対策**
   - GitHubに含まれていた場合: `git filter-branch` で削除
   - 既にpush済みの場合: GitHub Support に連絡

---

## ✅ セキュリティチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] `.env.local.example` にはダミー値のみ記載
- [ ] トークンをSlack/メールで送信していない
- [ ] スクリーンショットに機密情報が写っていない
- [ ] 定期的にトークンをローテーション（3-6ヶ月）
- [ ] 本番環境のトークンは開発環境と分離

---

## 💡 重要な考え方

> **トークンは再発行可能。本当に大切なのはコードとデータ。**

- ✅ ソースコード: GitHubで保護
- ✅ データベース: Firebaseで保護
- ✅ トークン: 再発行可能（15分）

バックアップは便利ですが、**必須ではありません**。
セキュリティと利便性のバランスで判断してください。
