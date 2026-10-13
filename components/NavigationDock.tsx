'use client'

import React from 'react'
import Link from 'next/link'
import { CheckSquare, BookOpen, Clock } from 'lucide-react'

interface NavigationDockProps {
  activeTab: 'todos' | 'log' | 'notes' | 'planner'
}

export default function NavigationDock({ activeTab }: NavigationDockProps) {
  const navItems = [
    {
      id: 'todos',
      label: '할 일 관리',
      href: '/',
      icon: CheckSquare,
    },
    {
      id: 'notes',
      label: '노트/기획',
      href: '/notes',
      icon: BookOpen,
    },
    {
      id: 'planner',
      label: '일간 플래너',
      href: '/planner',
      icon: Clock,
    },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <nav className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}