# 和粋 WASUI - Japanese Confectionery Website

治一郎の公式サイトをモデルとした日本の菓子店ウェブサイトのフルスタック実装

## 🌸 プロジェクト概要

和粋（WASUI）は、伝統的な日本の和菓子店のための現代的なウェブサイトです。治一郎の公式オンラインショップのデザインと機能性を忠実に再現しながら、独自のブランディングを施しています。

## 📱 ページ構成

- **ホームページ** - ヒーロースライダー、商品紹介、ニュースバナー
- **私たちについて** - パララックス効果、動画セクション、会社の歴史
- **商品一覧** - カテゴリフィルター、カート機能、商品詳細モーダル
- **ギフト** - シーン別ギフト選択、カスタマイズ機能
- **お知らせ** - ニュース検索、フィルター、ニュースレター登録
- **お問い合わせ** - 3ステップフォーム、FAQ、店舗情報
- **お客様の声** - レビューシステム、評価投稿機能

## 🎨 デザイン特徴

- **色彩**: 緑系メインカラー（#2d5f3f）とゴールドアクセント（#d4af37）
- **フォント**: Noto Sans JP / Noto Serif JP
- **レイアウト**: CSS Grid & Flexbox によるレスポンシブデザイン
- **アニメーション**: CSS transitions とIntersection Observer API

## ⚡ 技術的特徴

### フロントエンド
- **HTML5** - セマンティックマークアップ
- **CSS3** - カスタムプロパティ、Grid、Flexbox
- **Vanilla JavaScript** - モダンJS機能（ES6+）

### インタラクティブ機能
- スクロール連動アニメーション
- 動的フィルタリングシステム
- モーダルウィンドウ
- フォームバリデーション
- ローカルストレージ活用
- レスポンシブナビゲーション

### パフォーマンス最適化
- 遅延読み込み対応
- CSS/JS最適化
- 画像最適化準備
- SEO対応メタタグ

## 🚀 デプロイ情報

- **GitHub Pages**: [リポジトリ](https://github.com/tsailink0611/test-wa-suits-site)
- **Vercel**: [ライブサイト](https://test-wa-suits-site-yu3j.vercel.app)

## 📁 ファイル構造

```
test-wa-suits-site/
├── index.html                 # ホームページ
├── favicon.ico               # サイトアイコン
├── vercel.json              # Vercelデプロイ設定
├── assets/
│   ├── css/
│   │   ├── style.css        # メインスタイル
│   │   ├── about.css        # About ページ専用CSS
│   │   ├── products.css     # 商品ページ専用CSS
│   │   ├── gifts.css        # ギフトページ専用CSS
│   │   ├── news.css         # ニュースページ専用CSS
│   │   ├── contact.css      # コンタクトページ専用CSS
│   │   └── reviews.css      # レビューページ専用CSS
│   └── js/
│       ├── main.js          # メインJavaScript
│       ├── about.js         # About ページ機能
│       ├── products.js      # 商品ページ機能
│       ├── gifts.js         # ギフトページ機能
│       ├── news.js          # ニュースページ機能
│       ├── contact.js       # コンタクトページ機能
│       └── reviews.js       # レビューページ機能
└── pages/
    ├── about.html           # 私たちについて
    ├── products.html        # 商品一覧
    ├── gifts.html           # ギフト
    ├── news.html            # お知らせ
    ├── contact.html         # お問い合わせ
    └── reviews.html         # お客様の声
```

## 🎯 実装の特徴

### 1. 忠実なデザイン再現
治一郎の公式サイトのレイアウト、色彩、タイポグラフィを詳細に分析し、和粋ブランドとして再構築

### 2. レスポンシブ対応
モバイルファースト設計で、全デバイスで最適な表示を実現

### 3. インタラクティブ体験
ユーザーエンゲージメントを高める多様なインタラクション要素

### 4. パフォーマンス重視
軽量化とロード時間最適化によるユーザビリティ向上

## 📊 技術スタック

- **マークアップ**: HTML5
- **スタイリング**: CSS3 (Custom Properties, Grid, Flexbox)
- **スクリプト**: Vanilla JavaScript (ES6+)
- **フォント**: Google Fonts (Noto Sans JP, Noto Serif JP)
- **ホスティング**: Vercel
- **バージョン管理**: Git / GitHub

## 🔧 開発・デプロイ

```bash
# クローン
git clone https://github.com/tsailink0611/test-wa-suits-site.git

# ローカル開発
# 任意のローカルサーバーで起動
# 例: Live Server, http-server など

# デプロイ
# Vercelに自動デプロイ設定済み
```

## 📝 ライセンス

このプロジェクトは学習・デモ目的で作成されました。
実際の治一郎ブランドとは関係ありません。

---

🤖 **Generated with [Claude Code](https://claude.ai/code)**

Co-Authored-By: Claude <noreply@anthropic.com>