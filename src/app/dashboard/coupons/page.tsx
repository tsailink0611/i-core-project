'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import Link from 'next/link'

// Force dynamic rendering (Firebase requires client-side only)
export const dynamic = 'force-dynamic'

interface Coupon {
  id: string
  storeId: string
  name: string
  description: string
  code: string
  totalIssued: number
  totalUsed: number
  expiresAt: Date
  createdAt: Date
}

interface CouponUsage {
  id: string
  couponId: string
  couponCode: string
  userId: string
  userName?: string
  usedAt: Date
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [usageHistory, setUsageHistory] = useState<CouponUsage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    expiresAt: '',
  })

  // Load coupons on mount
  useEffect(() => {
    loadCoupons()
    loadUsageHistory()
  }, [])

  const loadCoupons = async () => {
    try {
      // TODO: 実際はログイン中のstoreIdでフィルター
      const storeId = 'demo_store_001'

      const q = query(
        collection(db, 'coupons'),
        where('storeId', '==', storeId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const couponData: Coupon[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiresAt: doc.data().expiresAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      } as Coupon))

      setCoupons(couponData)
    } catch (error) {
      console.error('クーポン読み込みエラー:', error)
    }
  }

  const loadUsageHistory = async () => {
    try {
      const storeId = 'demo_store_001'

      const q = query(
        collection(db, 'coupon_usage'),
        where('storeId', '==', storeId),
        orderBy('usedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const usageData: CouponUsage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        usedAt: doc.data().usedAt?.toDate(),
      } as CouponUsage))

      setUsageHistory(usageData)
    } catch (error) {
      console.error('使用履歴読み込みエラー:', error)
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const storeId = 'demo_store_001' // TODO: 実際のstoreIdを取得

      await addDoc(collection(db, 'coupons'), {
        storeId,
        name: formData.name,
        description: formData.description,
        code: formData.code,
        totalIssued: 0,
        totalUsed: 0,
        expiresAt: Timestamp.fromDate(new Date(formData.expiresAt)),
        createdAt: Timestamp.now(),
      })

      alert('クーポンを作成しました！')
      setFormData({ name: '', description: '', code: '', expiresAt: '' })
      setShowCreateForm(false)
      loadCoupons()
    } catch (error) {
      console.error('クーポン作成エラー:', error)
      alert('クーポンの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const usageRate = (coupon: Coupon) => {
    if (coupon.totalIssued === 0) return 0
    return Math.round((coupon.totalUsed / coupon.totalIssued) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-purple-600 hover:text-purple-800 mb-4 inline-block"
          >
            ← ダッシュボードに戻る
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🎫 クーポン管理
              </h1>
              <p className="text-gray-600">
                クーポンの作成・配信・使用履歴を管理します
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              ➕ 新規クーポン作成
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">新規クーポン作成</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    クーポン名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: 10月限定ドリンク無料"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    クーポンコード
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="例: OCTOBER2025"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例: 対象ドリンク1杯が無料になるクーポンです"
                  rows={3}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効期限
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isLoading ? '作成中...' : '✓ クーポンを作成'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coupons List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 クーポン一覧</h2>

            {coupons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">まだクーポンがありません</p>
                <p className="text-sm mt-2">「新規クーポン作成」ボタンから作成してください</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{coupon.name}</h3>
                        <p className="text-sm text-gray-600">{coupon.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          コード: <span className="font-mono font-bold">{coupon.code}</span>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                        {usageRate(coupon)}%
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        <span className="text-gray-600">
                          発行: <span className="font-bold">{coupon.totalIssued}</span>
                        </span>
                        <span className="text-gray-600">
                          使用: <span className="font-bold text-green-600">{coupon.totalUsed}</span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        期限: {coupon.expiresAt?.toLocaleDateString('ja-JP')}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all"
                        style={{ width: `${usageRate(coupon)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 使用履歴</h2>

            {usageHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">まだ使用履歴がありません</p>
                <p className="text-sm mt-2">お客様がクーポンを使用すると、ここに表示されます</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {usageHistory.map((usage) => (
                  <div key={usage.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {usage.userName || usage.userId}
                        </p>
                        <p className="text-sm text-gray-600">
                          クーポン: {usage.couponCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          ✓ 使用済み
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {usage.usedAt?.toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 ヒント:</strong> クーポンを作成したら、テンプレートページでクーポンメッセージを作成し、LINEで配信しましょう。お客様が「クーポンを使う」ボタンを押すと、自動的に使用履歴がここに記録されます。
          </p>
        </div>
      </div>
    </div>
  )
}
