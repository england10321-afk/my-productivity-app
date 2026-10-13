'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { Todo } from '../../types'
import * as plannerService from '../../services/plannerService'
import NavigationDock from '../../components/NavigationDock'

export default function DailyLogPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const fetched = await plannerService.fetchTodos()
    setTodos(fetched)
    setLoading(false)
  }

  // 날짜 변경 함수
  const handleDateChange = (offset: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + offset)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  // 할 일 완료 토글
  const handleToggleComplete = async (todo: Todo) => {
    const success = await plannerService.toggleTodoComplete(todo.id, todo.completed)
    if (success) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: !todo.completed } : t))
      )
    }
  }

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 pb-32">
      <header className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">하루 기록</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          수행한 할 일들을 점검하고 오늘의 실행 결과를 확인하세요.
        </p>

        {/* 날짜 선택 컨트롤러 */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm font-bold shadow-sm">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{selectedDate}</span>
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 실행 내역 리스트 */}
      <main className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-sm">오늘의 실행 목록</h2>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
            {completedCount} / {todos.length} 개 완료
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">불러오는 중...</p>
        ) : todos.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">등록된 할 일이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                onClick={() => handleToggleComplete(todo)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  todo.completed
                    ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  )}
                  <div>
                    <span
                      className={`text-sm font-medium block ${
                        todo.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {todo.title}
                    </span>
                    {todo.category && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        [{todo.category}]
                      </span>
                    )}
                  </div>
                </div>

                {/* 하위 항목 요약 표시 */}
                {todo.sub_tasks && todo.sub_tasks.length > 0 && (
                  <span className="text-xs text-slate-400 font-mono">
                    {todo.sub_tasks.filter((s) => s.completed).length}/{todo.sub_tasks.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <NavigationDock activeTab="log" />
    </div>
  )
}