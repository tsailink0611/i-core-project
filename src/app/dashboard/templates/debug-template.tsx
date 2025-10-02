// デバッグ用：テンプレート読み込みテスト
'use client'

import { useEffect } from 'react'
import { getBusinessTemplate } from '@/lib/templates/businessTemplates'

export default function DebugTemplate() {
  useEffect(() => {
    console.log('=== DEBUG: Testing getBusinessTemplate ===')
    const template = getBusinessTemplate('サロン・美容', '美容院・ヘアサロン', '一般美容院')
    console.log('Result:', template)
    
    if (template) {
      alert(`テンプレート読み込み成功！\n店舗名: ${template.storeName}\n特徴: ${template.features}`)
    } else {
      alert('テンプレート読み込み失敗！')
    }
  }, [])

  return <div className="p-8"><h1>Debug Template Page</h1></div>
}
