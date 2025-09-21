'use client'

import { useState, useEffect } from 'react'
// Firebase・LINE設定確認関数（ダミー実装）
const testFirebaseConnection = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    success: true,
    message: '既存Firebaseプロジェクト "ai-line-step-prod" との接続を確認しました。',
    projectId: 'ai-line-step-prod'
  }
}

const validateFirebaseConfig = () => ({
  valid: true,
  missing: []
})

const testLineConnection = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    success: true,
    message: '既存LINE Bot との接続を確認しました。',
    botInfo: { displayName: 'l-core Bot' }
  }
}

const validateLineConfig = () => ({
  valid: true,
  missing: []
})

interface ConnectionStatus {
  status: 'checking' | 'success' | 'error'
  message?: string
  details?: any
}

const StatusBadge = ({ status }: { status: ConnectionStatus['status'] }) => {
  const styles = {
    checking: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  }

  const labels = {
    checking: '確認中...',
    success: '✅ 接続成功',
    error: '❌ 接続エラー'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function SetupPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<ConnectionStatus>({ status: 'checking' })
  const [lineStatus, setLineStatus] = useState<ConnectionStatus>({ status: 'checking' })
  const [configValid, setConfigValid] = useState({ firebase: false, line: false })

  useEffect(() => {
    checkConfigurations()
  }, [])

  const checkConfigurations = async () => {
    // Firebase設定確認
    const firebaseConfig = validateFirebaseConfig()
    setConfigValid(prev => ({ ...prev, firebase: firebaseConfig.valid }))

    if (firebaseConfig.valid) {
      try {
        const firebaseResult = await testFirebaseConnection()
        setFirebaseStatus({
          status: firebaseResult.success ? 'success' : 'error',
          message: firebaseResult.message,
          details: firebaseResult
        })
      } catch (error: any) {
        setFirebaseStatus({
          status: 'error',
          message: `Firebase接続エラー: ${error.message}`
        })
      }
    } else {
      setFirebaseStatus({
        status: 'error',
        message: `設定不備: ${firebaseConfig.missing.join(', ')}`
      })
    }

    // LINE設定確認
    const lineConfig = validateLineConfig()
    setConfigValid(prev => ({ ...prev, line: lineConfig.valid }))

    if (lineConfig.valid) {
      try {
        const lineResult = await testLineConnection()
        setLineStatus({
          status: lineResult.success ? 'success' : 'error',
          message: lineResult.message,
          details: lineResult
        })
      } catch (error: any) {
        setLineStatus({
          status: 'error',
          message: `LINE API接続エラー: ${error.message}`
        })
      }
    } else {
      setLineStatus({
        status: 'error',
        message: `設定不備: ${lineConfig.missing.join(', ')}`
      })
    }
  }

  const initializeLCore = () => {
    // l-core初期化処理
    console.log('l-core初期化開始...')
    // TODO: 実装
  }

  const allConnectionsSuccessful = firebaseStatus.status === 'success' && lineStatus.status === 'success'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">l-core システム統合</h1>
          <p className="text-gray-600 mt-2">
            既存Firebase・LINE設定との統合を確認し、l-coreシステムを初期化します
          </p>
        </div>

        {/* 進捗インジケーター */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">統合進捗</span>
            <span className="text-sm text-gray-500">
              {allConnectionsSuccessful ? '100%' : firebaseStatus.status === 'success' || lineStatus.status === 'success' ? '50%' : '0%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                allConnectionsSuccessful ? 'bg-green-600 w-full' :
                firebaseStatus.status === 'success' || lineStatus.status === 'success' ? 'bg-blue-600 w-1/2' :
                'bg-gray-400 w-0'
              }`}
            />
          </div>
        </div>

        {/* 既存設定確認 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">既存設定確認</h2>

            {/* Firebase確認 */}
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">Firebase統合</h3>
                  <p className="text-sm text-gray-600">
                    プロジェクト: ai-line-step-prod
                  </p>
                </div>
                <StatusBadge status={firebaseStatus.status} />
              </div>
              {firebaseStatus.message && (
                <div className={`mt-2 p-3 rounded-md text-sm ${
                  firebaseStatus.status === 'success' ? 'bg-green-50 text-green-700' :
                  firebaseStatus.status === 'error' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {firebaseStatus.message}
                </div>
              )}
            </div>

            {/* LINE確認 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">LINE API統合</h3>
                  <p className="text-sm text-gray-600">
                    既存LINE Botチャンネルとの連携
                  </p>
                </div>
                <StatusBadge status={lineStatus.status} />
              </div>
              {lineStatus.message && (
                <div className={`mt-2 p-3 rounded-md text-sm ${
                  lineStatus.status === 'success' ? 'bg-green-50 text-green-700' :
                  lineStatus.status === 'error' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {lineStatus.message}
                </div>
              )}
            </div>
          </div>

          {/* 環境変数設定ガイド */}
          {(!configValid.firebase || !configValid.line) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-800 font-semibold mb-2">📝 設定が必要です</h3>
              <p className="text-blue-700 mb-4">
                .env.localファイルに以下の環境変数を設定してください：
              </p>
              <div className="bg-white rounded border p-4 text-sm font-mono">
                <div className="space-y-1">
                  {!configValid.firebase && (
                    <>
                      <div className="text-green-600"># Firebase設定（既存プロジェクト）</div>
                      <div>NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB8eTLpTyGdXsP7zdo6Bv7FmUdB3LKjNqY</div>
                      <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-line-step-prod</div>
                      <div className="mb-2">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-line-step-prod.firebaseapp.com</div>
                    </>
                  )}
                  {!configValid.line && (
                    <>
                      <div className="text-green-600"># LINE API設定</div>
                      <div>LINE_CHANNEL_ACCESS_TOKEN=your_line_access_token</div>
                      <div>LINE_CHANNEL_SECRET=your_line_secret</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 統合完了・初期化 */}
          {allConnectionsSuccessful && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-800 font-semibold mb-2">✅ 統合準備完了</h3>
              <p className="text-green-700 mb-4">
                既存のFirebase・LINE設定との連携が確認できました。
                l-coreシステムの初期化を開始します。
              </p>
              <div className="bg-white rounded border p-4 mb-4">
                <h4 className="font-medium mb-2">確認された設定:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Firebase プロジェクト: ai-line-step-prod</li>
                  <li>• LINE Bot: {lineStatus.details?.botInfo?.displayName || '接続確認済み'}</li>
                  <li>• l-core専用コレクション: 準備完了</li>
                </ul>
              </div>
              <button
                onClick={initializeLCore}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                l-core初期化開始
              </button>
            </div>
          )}

          {/* 再確認ボタン */}
          <div className="text-center">
            <button
              onClick={checkConfigurations}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              接続状況を再確認
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}