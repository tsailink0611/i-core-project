'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ChatBubbleLeftRightIcon, DocumentMagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'チャット分析', href: '/', icon: ChatBubbleLeftRightIcon, current: true },
  { name: '文書検索', href: '/search', icon: DocumentMagnifyingGlassIcon, current: false },
  { name: 'データ可視化', href: '/charts', icon: ChartBarIcon, current: false },
]

const companies = [
  { name: 'トヨタ自動車', count: 9 },
  { name: '三菱UFJフィナンシャル・グループ', count: 2 },
  { name: '武田薬品工業', count: 3 },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                    <span className="sr-only">サイドバーを閉じる</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-72 md:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}

function SidebarContent() {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 py-4 border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center">
        <h2 className="text-lg font-semibold text-gray-900">IR分析ダッシュボード</h2>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                      item.current
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
                    }`}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        item.current ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          
          <li>
            <div className="text-xs font-semibold leading-6 text-gray-400">分析対象企業</div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {companies.map((company) => (
                <li key={company.name}>
                  <div className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white text-gray-400 border-gray-200 group-hover:border-primary-600 group-hover:text-primary-600">
                      {company.count}
                    </span>
                    <span className="truncate">{company.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="rounded-lg bg-primary-50 p-4">
              <div className="text-sm text-primary-700">
                <strong>システム状態</strong>
              </div>
              <div className="mt-2 text-xs text-primary-600">
                • Vector DB: 稼働中<br/>
                • AgentCore: 接続中<br/>
                • 分析済み文書: 14件
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}