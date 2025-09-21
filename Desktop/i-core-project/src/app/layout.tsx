import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'l-core - AI駆動LINEマーケティングシステム',
  description: 'LSTEPの代替となるAI駆動LINEマーケティング自動化プラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}