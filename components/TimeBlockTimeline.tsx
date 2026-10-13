import React, { useState } from 'react'
import { TimeBlock, Todo, Category } from '../types'
import { Calendar as CalendarIcon } from 'lucide-react'

interface TimeBlockTimelineProps {
  selectedDate: string
  timeBlocks: TimeBlock[]
  activeTodos: Todo[]
  categories: Category[]
  onAddTimeBlock: (block: Omit<TimeBlock, 'id'>) => void
  onDeleteTimeBlock: (id: string) => void
  getColorClasses: (catName: string) => { badge: string; block: string }
}

export default function TimeBlockTimeline({
  selectedDate,
  timeBlocks,
  activeTodos,
  categories,
  onAddTimeBlock,
  onDeleteTimeBlock,
  getColorClasses,
}: TimeBlockTimelineProps) {
  const [selectedTodoId, setSelectedTodoId] = useState<string>('custom')
  const [blockTitle, setBlockTitle] = useState('')
  const [blockCategory, setBlockCategory] = useState(categories[0]?.name || '공부')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  const hours = Array.from({ length: 18 }, (_, i) => {
    const h = i + 6
    return h < 10 ? `0${h}:00` : `${h}:00`
  })

  const handleSelectTodo = (todoId: string) => {
    setSelectedTodoId(todoId)
    if (todoId === 'custom') {
      setBlockTitle('')
      setBlockCategory(categories[0]?.name || '공부')
    } else {
      const selected = activeTodos.find((t) => t.id === todoId)
      if (selected) {
        setBlockTitle(selected.title)
        setBlockCategory(selected.category || categories[0]?.name || '공부')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockTitle.trim()) return

    onAddTimeBlock({
      title: blockTitle,
      category: blockCategory,
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
    })

    setBlockTitle('')
    setSelectedTodoId('custom')
  }

  return (
    <section className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col h-[750px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">타임블록 일정표</h2>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">선택일: {selectedDate}</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <fieldset className="fieldset bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-2xl border p-4 w-full">
          <legend className="fieldset-legend text-xs font-semibold px-2 text-slate-500 dark:text-slate-400">타임블록 일정 추가</legend>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="label text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">할 일 백로그 선택</label>
                <select
                  value={selectedTodoId}
                  onChange={(e) => handleSelectTodo(e.target.value)}
                  className="select select-sm w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none text-xs"
                >
                  <option value="custom">-- 백로그 선택 (또는 직접 입력) --</option>
                  {activeTodos.map((todo) => (
                    <option key={todo.id} value={todo.id}>
                      [{todo.category}] {todo.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTodoId === 'custom' && (
                <>
                  <div className="flex-1">
                    <label className="label text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">직접 입력 제목</label>
                    <input
                      type="text"
                      placeholder="일정 제목 입력..."
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                      className="input input-sm w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none text-xs"
                    />
                  </div>
                  <div className="w-28">
                    <label className="label text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">카테고리</label>
                    <select
                      value={blockCategory}
                      onChange={(e) => setBlockCategory(e.target.value)}
                      className="select select-sm w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-end justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex gap-2 items-center">
                <div>
                  <label className="label text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">시작 시간</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="select select-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs"
                  >
                    {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <span className="text-xs text-slate-400 mt-5">~</span>
                <div>
                  <label className="label text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">종료 시간</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="select select-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs"
                  >
                    {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl px-5">
                블록 등록
              </button>
            </div>
          </div>
        </fieldset>
      </form>

      <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1 bg-slate-50/50 dark:bg-slate-950/40">
        {hours.map((hour) => {
          const matchedBlocks = timeBlocks.filter((b) => b.start_time <= hour && b.end_time > hour)
          return (
            <div key={hour} className="flex gap-3 text-xs min-h-[36px] items-center border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 px-2 py-1">
              <span className="w-12 text-slate-400 dark:text-slate-500 font-mono">{hour}</span>
              <div className="flex-1 flex gap-2 flex-wrap">
                {matchedBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md font-medium border ${getColorClasses(block.category).block}`}
                  >
                    <span>{block.title}</span>
                    <span className="text-[10px] opacity-75">({block.start_time}~{block.end_time})</span>
                    <button
                      onClick={() => onDeleteTimeBlock(block.id)}
                      className="opacity-60 hover:opacity-100 hover:text-red-600 ml-1 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}