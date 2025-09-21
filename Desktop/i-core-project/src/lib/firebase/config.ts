import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 既存Firebase設定を環境変数から読み込み（完全保護）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 既存Firebaseプロジェクトに安全に接続
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 接続確認用関数（既存データに影響なし）
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string; projectId?: string }> => {
  try {
    // 既存のFirestoreプロジェクトに安全な接続テスト
    const testCollection = 'l-core-connection-test';
    const { doc, setDoc, deleteDoc, collection } = await import('firebase/firestore');

    // l-core専用テストドキュメント作成（既存データと完全分離）
    const testDocRef = doc(collection(db, testCollection), `test-${Date.now()}`);
    await setDoc(testDocRef, {
      timestamp: new Date(),
      message: 'l-core safe connection test',
      version: '1.0.0'
    });

    // テストデータは即削除（痕跡を残さない）
    await deleteDoc(testDocRef);

    const projectId = firebaseConfig.projectId;
    console.log('✅ Firebase接続成功（既存設定活用・影響なし）:', projectId);

    return {
      success: true,
      message: `既存Firebaseプロジェクト "${projectId}" との接続を確認しました。既存データへの影響はありません。`,
      projectId
    };
  } catch (error: any) {
    console.error('❌ Firebase接続エラー:', error);
    return {
      success: false,
      message: `Firebase接続エラー: ${error.message}。既存設定を確認してください。`
    };
  }
};

// Firebase設定検証関数
export const validateFirebaseConfig = (): { valid: boolean; missing: string[] } => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missing = requiredKeys.filter(key => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing
  };
};

// l-core専用コレクション定義（既存データと完全分離）
export const L_CORE_COLLECTIONS = {
  ORGANIZATIONS: 'l-core-organizations',
  STORES: 'l-core-stores',
  USERS: 'l-core-users',
  MESSAGES: 'l-core-messages',
  CAMPAIGNS: 'l-core-campaigns',
  ANALYTICS: 'l-core-analytics',
  LLM_MODELS: 'l-core-llm-models',
  SYSTEM_CONFIG: 'l-core-system-config'
} as const;