# Dify ワークフロー設定ガイド

## 概要

このディレクトリには、不動産LINE-Dify統合システムのDifyワークフロー設定ファイルが含まれています。

- **real_estate_search_workflow.yml**: 6つのナレッジベースを並列検索する賃貸物件検索ワークフロー

## ワークフロー構成

### アーキテクチャ

```
[ユーザー質問]
    ↓
[Start Node]
    ↓ (並列6本)
    ├─→ [SUUMO物件検索]
    ├─→ [自社管理物件検索]
    ├─→ [元付け業者物件検索]
    ├─→ [会社情報検索]
    ├─→ [サービス情報検索]
    └─→ [その他情報検索]
         ↓ (全6本)
    [ナレッジ結合 Template]
         ↓
    [LLM 回答生成]
         ↓
    [Answer 直接返信]
```

### ノード説明

#### 1. Start Node (開始)
- ユーザーからの質問テキストを受け取る
- 変数: `query` (最大1000文字)

#### 2-7. Knowledge Retrieval Nodes (ナレッジ検索 × 6)
6つのナレッジベースを**並列**で検索:

| ノードID | ナレッジベース | 説明 | Top-K |
|---------|-------------|------|-------|
| kb_suumo | SUUMO物件 | SUUMO掲載物件情報 | 5 |
| kb_jissha | 自社管理物件 | 自社で管理する物件情報 | 5 |
| kb_mototsuke | 元付け業者物件 | 提携業者の物件情報 | 5 |
| kb_company | 会社情報 | 会社概要・沿革・実績 | 3 |
| kb_service | サービス情報 | 契約手続き・FAQ・費用 | 3 |
| kb_other | その他 | 上記以外の情報 | 2 |

**検索設定:**
- **Reranking**: 有効 (GPT-4使用)
- **Score Threshold**: 0.7 (70%以上の関連性)
- **Retrieval Mode**: multiple (マルチウェイリコール)

#### 8. Template Node (ナレッジ結合)
- 6つのナレッジ検索結果をJinja2テンプレートで整形・結合
- カテゴリ別にセクション分けして出力
- スコアとタイトルを表示

#### 9. LLM Node (回答生成)
- モデル: GPT-4
- Temperature: 0.3 (精度重視)
- Max Tokens: 2000
- システムプロンプトで賃貸AIアシスタントの役割を設定

#### 10. Answer Node (直接返信)
- LLMの生成した回答をユーザーに返す

## インポート手順

### 方法1: Dify UI からインポート

1. **Difyダッシュボードにログイン**
   ```
   https://your-dify-instance.com/
   ```

2. **スタジオページへ移動**
   - 左メニューから「Studio」を選択

3. **DSLファイルをインポート**
   - 画面右上の「Import DSL File」ボタンをクリック
   - `real_estate_search_workflow.yml` を選択してアップロード

4. **バージョン互換性確認**
   - Dify v0.6以上が必要
   - 互換性警告が出た場合はDifyをアップグレード

### 方法2: URLから直接インポート

1. **ファイルをGitHubやクラウドストレージに配置**

2. **Raw URLを取得**
   ```
   例: https://raw.githubusercontent.com/your-repo/real_estate_search_workflow.yml
   ```

3. **Dify UIで「Import from URL」を選択**
   - URLを入力してインポート

## 環境変数設定

ワークフローインポート後、以下の環境変数を設定する必要があります:

| 環境変数名 | 説明 | 取得方法 |
|----------|------|---------|
| `DIFY_DATASET_SUUMO` | SUUMO物件ナレッジベースID | Difyコンソール > Knowledge > SUUMO物件 > Settings > Dataset ID |
| `DIFY_DATASET_JISSHA` | 自社管理物件ナレッジベースID | 同上 |
| `DIFY_DATASET_MOTOTSUKE` | 元付け業者物件ナレッジベースID | 同上 |
| `DIFY_DATASET_COMPANY` | 会社情報ナレッジベースID | 同上 |
| `DIFY_DATASET_SERVICE` | サービス情報ナレッジベースID | 同上 |
| `DIFY_DATASET_OTHER` | その他ナレッジベースID | 同上 |

### 環境変数設定手順

1. **Difyダッシュボードでナレッジベースを作成**
   - Knowledge > Create Dataset
   - 各カテゴリ用に6つのデータセットを作成

2. **Dataset IDをコピー**
   - 各ナレッジベース > Settings > Dataset ID をコピー

3. **ワークフロー環境変数に設定**
   - Studio > ワークフロー選択 > Settings > Environment Variables
   - 各環境変数に対応するDataset IDをペースト

4. **保存して公開**
   - Save > Publish

## ナレッジベース作成

### ステップ1: 6つのデータセットを作成

Difyコンソールで以下のナレッジベースを作成:

```bash
1. SUUMO物件
2. 自社管理物件
3. 元付け業者物件
4. 会社情報
5. サービス情報
6. その他
```

### ステップ2: インデックス設定

各ナレッジベースで推奨設定:

- **Indexing Technique**: High Quality
- **Retrieval Method**: Hybrid (Vector + Keyword)
- **Embedding Model**: text-embedding-3-large
- **Chunk Size**: 800 tokens
- **Chunk Overlap**: 100 tokens

### ステップ3: ドキュメントアップロード

**自動アップロード (推奨):**
- Google Drive監視スクリプト (`google_drive/drive_watcher.py`) が自動的にアップロード
- フォルダ構造に基づいて自動振り分け

**手動アップロード:**
1. Knowledge > 対応するデータセットを選択
2. Upload Files
3. `demo_data/` フォルダから対応するファイルをアップロード

## テスト方法

### 1. Dify Studio でテスト

1. **ワークフローを開く**
   - Studio > 不動産LINE検索システム

2. **デバッグモードで実行**
   - 画面右上の「Debug」ボタンをクリック
   - テスト質問を入力:
     ```
     渋谷駅から徒歩10分以内の1LDK物件を探しています
     ```

3. **各ノードの出力を確認**
   - 6つのナレッジ検索結果
   - Template結合結果
   - LLM最終回答

### 2. API経由でテスト

```bash
curl -X POST 'https://api.dify.ai/v1/workflows/run' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "inputs": {
      "query": "初期費用を抑えられる物件はありますか?"
    },
    "response_mode": "blocking",
    "user": "test-user-001"
  }'
```

## パフォーマンス最適化

### 並列処理の効果

- **従来方式 (逐次検索)**: 6ナレッジベース × 2秒 = 12秒
- **並列処理**: max(2秒) = 2秒
- **速度向上**: 6倍

### スコアリング調整

関連性が低い結果が多い場合:
```yaml
score_threshold: 0.7  # → 0.8 に引き上げ
```

検索結果が少なすぎる場合:
```yaml
top_k: 5  # → 10 に増やす
score_threshold: 0.7  # → 0.6 に下げる
```

### Reranking モデル選択

- **精度重視**: gpt-4 (現在設定)
- **速度重視**: gpt-3.5-turbo
- **コスト重視**: cohere-rerank-multilingual-v3.0

## トラブルシューティング

### エラー1: "Dataset not found"

**原因**: 環境変数のDataset IDが間違っている

**解決策:**
1. Difyコンソールで正しいDataset IDを確認
2. ワークフロー設定で環境変数を更新
3. ワークフローを再公開

### エラー2: "No results found in knowledge base"

**原因**: ナレッジベースが空、またはインデックス未完了

**解決策:**
1. Knowledge > Dataset を確認
2. ドキュメントがアップロードされているか確認
3. Indexing Statusが "Completed" になっているか確認

### エラー3: "Model not configured"

**原因**: LLMモデル(GPT-4)が設定されていない

**解決策:**
1. Settings > Model Providers > OpenAI
2. API Keyを設定
3. GPT-4モデルを有効化

### エラー4: "Reranking model not available"

**原因**: Rerankingモデルが設定されていない

**解決策:**
- ワークフローYAMLで `reranking_enable: false` に変更
- または Settings > Model Providers で Rerankingモデルを設定

## カスタマイズ

### システムプロンプト変更

LLM Nodeの `prompt_template` セクションを編集:

```yaml
- role: system
  text: |
    あなたは[会社名]の賃貸物件検索AIアシスタントです。
    # カスタムプロンプトをここに記述
```

### 検索パラメータ調整

各Knowledge Retrieval Nodeで:

```yaml
multiple_retrieval_config:
  top_k: 5  # 取得件数
  score_threshold: 0.7  # 関連性閾値 (0.0-1.0)
  reranking_enable: true  # Reranking有効化
```

### ナレッジベース追加

新しいナレッジベースを追加する場合:

1. 新しいKnowledge Retrieval Nodeを追加
2. Start → 新ノード の edge を追加
3. 新ノード → Template の edge を追加
4. Template の variables に新ノード結果を追加
5. Template の template セクションに新セクション追加

## ベストプラクティス

### 1. ナレッジベース管理

- **定期更新**: 週1回、古い物件情報を削除
- **品質管理**: アップロード前にファイル内容を確認
- **一貫性**: ファイル命名規則を統一

### 2. プロンプト設計

- **具体的**: 曖昧な指示を避ける
- **例示**: Few-shot examples を含める
- **制約**: 回答形式や長さを明示

### 3. モニタリング

- **ログ確認**: Dify Logs で検索精度を監視
- **フィードバック**: ユーザーからの評価を収集
- **A/Bテスト**: プロンプトやパラメータを実験

## 参考リンク

- [Dify公式ドキュメント](https://docs.dify.ai/)
- [Workflow DSL仕様](https://docs.dify.ai/en/guides/workflow/export_import)
- [Knowledge Base API](https://docs.dify.ai/en/guides/knowledge-base/)
- [Dify GitHub](https://github.com/langgenius/dify)

## 更新履歴

- **2025-10-05**: 初版作成 (6ナレッジベース並列検索ワークフロー)
