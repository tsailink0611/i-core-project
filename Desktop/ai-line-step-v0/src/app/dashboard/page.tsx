'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Shop, UI_TEXT, Campaign } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // 店舗情報を取得
        const shopDoc = await getDoc(doc(db, 'shops', user.uid));
        if (shopDoc.exists()) {
          setShop(shopDoc.data() as Shop);
        }
        // モック配信履歴（実際はGoogleドライブから取得）
        setCampaigns([
          {
            id: '1',
            date: '2025-01-15',
            content: '週末限定！お得なセットメニューをご用意しました🍽️',
            result: '開封率: 45%',
            status: 'sent'
          },
          {
            id: '2',
            date: '2025-01-10',
            content: '新年明けましておめでとうございます🎍',
            result: '開封率: 62%',
            status: 'sent'
          }
        ]);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!user || !shop) {
    return null;
  }

  const thisMonthCampaigns = campaigns.filter(c =>
    new Date(c.date).getMonth() === new Date().getMonth()
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {UI_TEXT.TITLE_DASHBOARD}
              </h1>
              <p className="text-sm text-gray-600">{shop.name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{thisMonthCampaigns}</div>
            <div className="text-gray-600">今月の配信数</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">53%</div>
            <div className="text-gray-600">平均開封率</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">single</div>
            <div className="text-gray-600">現在のプラン</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Link href="/dashboard/campaigns/new">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg text-lg">
              {UI_TEXT.BUTTON_CREATE_NEW}
            </button>
          </Link>
        </div>

        {/* Campaign History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">配信履歴</h2>
          </div>
          <div className="divide-y">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">
                        {new Date(campaign.date).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="text-gray-900 mb-2">{campaign.content}</div>
                      {campaign.result && (
                        <div className="text-sm text-green-600">{campaign.result}</div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status === 'sent' ? '配信済み' : '下書き'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                まだ配信履歴がありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}