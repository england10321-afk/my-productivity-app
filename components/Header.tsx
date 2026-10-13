import React, { useState } from 'react'
import { Calendar as CalendarIcon, Download, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

interface HeaderProps {
  selectedDate: string
  onChangeDate: (days: number) => void
  onSelectDate: (date: string) => void
  onOpenCatModal: () => void
  onExportImage: () => void
}

export default function Header({
  selectedDate,
  onChangeDate,
  onSelectDate,
  onOpenCatModal,
  onExportImage,
}: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const todayStr = new Date().toISOString().split('T')[0]

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">생산성 & 타임블로킹 대시보드</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">맞춤 카테고리 기반 개인 플래너</p>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onChangeDate(-1)}
          className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-2">
          <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          />
        </div>

        <button
          onClick={() => onChangeDate(1)}
          className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {selectedDate !== todayStr && (
          <button
            onClick={() => onSelectDate(todayStr)}
            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg transition ml-1"
          >
            오늘
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* 💡 라이트 모드일 때 해 / 다크 모드일 때 달 표시 */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center justify-center"
          title={isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
        >
          {isDarkMode ? (
            /* 다크 모드 상태 (어두운 화면) -> 달 아이콘만 표시 */
            <svg
              className="h-5 w-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          ) : (
            /* 라이트 모드 상태 (밝은 화면) -> 해 아이콘만 표시 */
            <svg
              className="h-5 w-5 fill-current text-amber-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
          )}
        </button>

        <button
          onClick={onOpenCatModal}
          className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition"
        >
          <Settings className="w-4 h-4" /> 카테고리 관리
        </button>

        <button
          onClick={onExportImage}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4" /> 이미지로 내보내기
        </button>
      </div>
    </header>
  )
}