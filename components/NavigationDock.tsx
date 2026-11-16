'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Calendar, CheckSquare, BookOpen, FolderUp, ShieldCheck } from 'lucide-react'
import BackupModal from './BackupModal'

interface NavigationDockProps {
  activeTab: 'todos' | 'calendar' | 'notes' | 'share' | string
  onRestored?: () => void
}

export default function NavigationDock({ activeTab, onRestored }: NavigationDockProps) {
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)

  const navItems = [
    {
      id: 'todos',
      label: '할 일',
      href: '/',
      icon: CheckSquare,
    },
    {
      id: 'calendar',
      label: '캘린더',
      href: '/calendar',
      icon: Calendar,
    },
    {
      id: 'notes',
      label: '노트',
      href: '/notes',
      icon: BookOpen,
    },
    {
      id: 'share',
      label: '자료함',
      href: '/share',
      icon: FolderUp,
    },
  ]

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
        <nav className="flex items-center gap-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-2 rounded-3xl shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0" />

          {/* 백업 / 복원 전용 버튼 */}
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shrink-0"
            title="데이터 전체 백업 및 복원"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">백업/복원</span>
          </button>
        </nav>
      </div>

      {/* 백업 모달 */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestored={onRestored}
      />
    </>
  )
}