import './globals.css'

export const metadata = {
  title: 'l-core',
  description: 'LINE messaging management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  )
}
