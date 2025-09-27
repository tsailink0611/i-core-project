import './globals.css'

export const metadata = {
  title: 'L-Core - LINE公式アカウント販促システム',
  description: 'AIを活用したLINE公式アカウントのメッセージ作成・配信システム',
  keywords: 'LINE公式アカウント, AI, メッセージ配信, マーケティング, 販促',
  authors: [{ name: 'L-Core Team' }],
  creator: 'L-Core',
  robots: 'index, follow',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="//api.openai.com" />
      </head>
      <body className="font-sans antialiased">
        <div id="root">
          {children}
        </div>
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Monitor long tasks
              if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                try {
                  const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration, 'ms');
                      }
                    }
                  });
                  observer.observe({ entryTypes: ['longtask'] });
                } catch (e) {
                  console.log('Performance monitoring not available');
                }
              }

              // Monitor resource loading
              if (typeof window !== 'undefined') {
                window.addEventListener('load', () => {
                  try {
                    const resources = performance.getEntriesByType('resource');
                    resources.forEach(resource => {
                      if (resource.duration > 1000) {
                        console.warn('Slow resource:', resource.name, resource.duration, 'ms');
                      }
                    });
                  } catch (e) {
                    console.log('Resource monitoring not available');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
