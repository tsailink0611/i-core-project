import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            l-core
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI駆動LINEマーケティング自動化プラットフォーム
          </p>
          <p className="text-lg text-gray-500 mb-12">
            既存Firebase・LINE設定を完全活用したエンタープライズレベルSaaSシステム
          </p>

          {/* ステータス表示 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚀 プロジェクト状況
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800">✅ 完了済み</h3>
                <ul className="text-sm text-green-700 mt-2">
                  <li>• Next.js 14 + TypeScript</li>
                  <li>• Firebase統合準備</li>
                  <li>• LLMモデル管理</li>
                  <li>• マルチテナント設計</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800">🔄 進行中</h3>
                <ul className="text-sm text-blue-700 mt-2">
                  <li>• セットアップフロー</li>
                  <li>• 接続テスト機能</li>
                  <li>• UI/UXコンポーネント</li>
                  <li>• 分析ダッシュボード</li>
                </ul>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-x-4">
            <Link
              href="/setup"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              セットアップ開始
            </Link>
            <Link
              href="/dashboard"
              className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              ダッシュボード
            </Link>
          </div>

          {/* 機能紹介 */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                既存システム保護
              </h3>
              <p className="text-gray-600">
                Firebase・LINE設定への影響ゼロで安全統合
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                AI自動化
              </h3>
              <p className="text-gray-600">
                動的LLMモデル管理・メッセージ自動生成
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                高度分析
              </h3>
              <p className="text-gray-600">
                リアルタイム分析・詳細レポート機能
              </p>
            </div>
          </div>

          {/* 技術スタック */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              技術スタック
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Next.js 14', 'TypeScript', 'Tailwind CSS v3.4.0', 'Firebase', 'LINE API', 'OpenAI'].map((tech) => (
                <span
                  key={tech}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}