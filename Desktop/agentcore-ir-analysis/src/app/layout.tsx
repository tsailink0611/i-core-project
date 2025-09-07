import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agentic Document Analysis',
  description: 'Universal Document Analysis Platform powered by Amazon Bedrock',
  keywords: ['document analysis', 'financial analysis', 'AI', 'Bedrock', 'agentic'],
  authors: [{ name: 'tsailink0611' }],
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}