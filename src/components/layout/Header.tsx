'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface NavigationItem {
  href: string
  label: string
  isActive?: boolean
}

interface HeaderProps {
  title?: string
  navigation?: NavigationItem[]
  actions?: React.ReactNode
}

const defaultNavigation: NavigationItem[] = [
  { href: '/dashboard', label: '概要' },
  { href: '/dashboard/messages', label: 'メッセージ' },
  { href: '/dashboard/templates', label: 'テンプレート' },
  { href: '/dashboard/analytics', label: '分析' },
  { href: '/dashboard/settings', label: '設定' }
]

export function Header({
  title = 'l-core',
  navigation = defaultNavigation,
  actions
}: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              {title}
            </Link>
            <nav className="ml-8 flex space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {actions || (
              <>
                <Button asChild>
                  <Link href="/dashboard/messages/new">
                    新規メッセージ
                  </Link>
                </Button>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}