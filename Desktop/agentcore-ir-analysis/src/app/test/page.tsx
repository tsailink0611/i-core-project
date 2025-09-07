export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Agentic Document Analysis - Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          この画面が正常に表示されていれば、Next.js + Tailwind CSSは正しく動作しています。
        </p>
        <div className="space-y-2">
          <div className="w-full h-4 bg-blue-200 rounded"></div>
          <div className="w-3/4 h-4 bg-blue-300 rounded"></div>
          <div className="w-1/2 h-4 bg-blue-400 rounded"></div>
        </div>
      </div>
    </div>
  )
}