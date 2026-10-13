'use client'

import React, { useState, useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import {
  Calendar,
  Clock,
  Download,
  Plus,
  Trash2,
  CheckSquare,
  Sparkles,
} from 'lucide-react'
import { Todo } from '@/types'
import * as plannerService from '@/services/plannerService'
import NavigationDock from '@/components/NavigationDock'

interface TimeBlock {
  id: string
  title: string
  startHour: number // 0 ~ 23
  endHour: number // 1 ~ 24
  color: string
}

const COLOR_OPTIONS = [
  'bg-indigo-500 text-white',
  'bg-blue-500 text-white',
  'bg-emerald-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-purple-500 text-white',
]

export default function DailyPlannerPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)

  // 시간 블록 추가 폼 상태
  const [blockTitle, setBlockTitle] = useState('')
  const [startHour, setStartHour] = useState<number>(9)
  const [endHour, setEndHour] = useState<number>(10)
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0])

  const plannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const fetchedTodos = await plannerService.fetchTodos()
    setTodos(fetchedTodos.filter((t) => !t.completed))
    setLoading(false)
  }

  // 타임 블록 추가
  const handleAddTimeBlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockTitle.trim()) return
    if (startHour >= endHour) {
      alert('종료 시간은 시작 시간보다 뒤여야 합니다.')
      return
    }

    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      title: blockTitle.trim(),
      startHour,
      endHour,
      color: selectedColor,
    }

    setTimeBlocks([...timeBlocks, newBlock])
    setBlockTitle('')
  }

  // 할 일을 시간 블록에 즉시 할당
  const handleAssignTodoToTime = (todoTitle: string) => {
    setBlockTitle(todoTitle)
  }

  // 타임 블록 삭제
  const handleDeleteBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter((b) => b.id !== id))
  }

  // 이미지로 내보내기 (Export as PNG)
  const handleExportImage = async () => {
    if (!plannerRef.current) return

    try {
      const dataUrl = await toPng(plannerRef.current, { cacheBust: true, quality: 0.95 })
      const link = document.createElement('a')
      const today = new Date().toISOString().split('T')[0]
      link.download = `daily_planner_${today}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('이미지 저장 실패:', err)
      alert('이미지 저장 중 오류가 발생했습니다.')
    }
  }

  const hours = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 ~ 23:00

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 pb-32">
      {/* 헤더 */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-indigo-500" /> 일간 플래너 & 타임테이블
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            할 일을 원하는 시간대에 가볍게 할당하고 깔끔한 이미지로 저장하세요.
          </p>
        </div>

        <button
          onClick={handleExportImage}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition transform active:scale-95"
        >
          <Download className="w-4 h-4" /> 이미지로 내보내기 (PNG)
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* [좌측: 할 일 목록 & 일정 추가 폼] */}
        <section className="lg:col-span-4 space-y-6">
          {/* 시간 블록 추가 카드 */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" /> 시간 일정 배치
            </h2>

            <form onSubmit={handleAddTimeBlock} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  일정 이름
                </label>
                <input
                  type="text"
                  placeholder="일정 제목 (또는 밑의 할 일 클릭)"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  className="input input-sm w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    시작 시간
                  </label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="select select-sm w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h < 10 ? `0${h}` : h}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    종료 시간
                  </label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="select select-sm w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  >
                    {hours
                      .filter((h) => h > startHour)
                      .concat(24)
                      .map((h) => (
                        <option key={h} value={h}>
                          {h < 10 ? `0${h}` : h}:00
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* 색상 선택 */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  테마 색상
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full ${color.split(' ')[0]} ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                      } transition`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                타임테이블에 추가
              </button>
            </form>
          </div>

          {/* 미완료 할 일 목록 */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-500" /> 내 할 일 클릭하여 불러오기
            </h2>
            <p className="text-[11px] text-slate-400 mb-3">
              클릭하면 위의 일정 입력창으로 제목이 자동 입력됩니다.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">남은 할 일이 없습니다.</p>
              ) : (
                todos.map((todo) => (
                  <button
                    key={todo.id}
                    onClick={() => handleAssignTodoToTime(todo.title)}
                    className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition truncate flex items-center justify-between"
                  >
                    <span>{todo.title}</span>
                    <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* [우측: 이미지로 캡처될 타임테이블 캔버스] */}
        <section className="lg:col-span-8">
          <div
            ref={plannerRef}
            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            {/* 타임테이블 상단 제목 */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" /> Daily Planner
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
              </div>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
                Focus Mode
              </span>
            </div>

            {/* 타임 슬롯 렌더링 */}
            <div className="space-y-1 relative">
              {hours.map((hour) => {
                const blocksInThisHour = timeBlocks.filter(
                  (b) => b.startHour <= hour && b.endHour > hour
                )

                return (
                  <div
                    key={hour}
                    className="flex items-center h-11 border-b border-slate-100 dark:border-slate-800/80 group text-xs"
                  >
                    <span className="w-16 font-mono text-slate-400 text-[11px] shrink-0">
                      {hour < 10 ? `0${hour}` : hour}:00
                    </span>

                    <div className="flex-1 h-full flex items-center gap-1.5 pl-2 relative">
                      {timeBlocks
                        .filter((b) => b.startHour === hour)
                        .map((block) => (
                          <div
                            key={block.id}
                            style={{
                              height: `${(block.endHour - block.startHour) * 44 - 4}px`,
                            }}
                            className={`absolute top-0.5 left-2 right-2 z-10 ${block.color} rounded-xl px-3 py-2 shadow-sm flex items-start justify-between transition-all`}
                          >
                            <div>
                              <p className="font-bold text-xs">{block.title}</p>
                              <p className="text-[10px] opacity-80 font-mono">
                                {block.startHour}:00 - {block.endHour}:00
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-1 hover:bg-black/20 rounded-md transition"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <NavigationDock activeTab="planner" />
    </div>
  )
}