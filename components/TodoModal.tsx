'use client'

import React, { useState, useEffect } from 'react'
import { X, Clock } from 'lucide-react'
import { Category, Todo, SubTask } from '@/types'

interface SubTaskDraft {
  id?: string
  title: string
  completed: boolean
}

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  initialCategory?: string
  editingTodo?: Todo | null
  onSubmit: (
    title: string,
    category: string,
    dueDate: string,
    subTasks: string[],
    startTime: string,
    dueTime: string
  ) => void
  onUpdate?: (
    id: string,
    updates: {
      title: string
      category: string
      due_date: string | null
      start_time: string | null
      due_time: string | null
      sub_tasks: SubTask[]
    }
  ) => void
}

export default function TodoModal({
  isOpen,
  onClose,
  categories,
  initialCategory = '',
  editingTodo = null,
  onSubmit,
  onUpdate,
}: TodoModalProps) {
  const [title, setTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [useTimeSetting, setUseTimeSetting] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [subInputs, setSubInputs] = useState<SubTaskDraft[]>([{ title: '', completed: false }])

  // 모달이 열릴 때 추가/수정 모드 및 초기 카테고리 세팅
  useEffect(() => {
    if (!isOpen) return

    if (editingTodo) {
      setTitle(editingTodo.title)
      setSelectedCategory(editingTodo.category || '')
      setDueDate(editingTodo.due_date || '')
      const hasExistingTime = Boolean(editingTodo.start_time || editingTodo.due_time)
      setUseTimeSetting(hasExistingTime)
      setStartTime(editingTodo.start_time || '')
      setDueTime(editingTodo.due_time || '')
      setSubInputs(
        editingTodo.sub_tasks && editingTodo.sub_tasks.length > 0
          ? editingTodo.sub_tasks.map((st) => ({
              id: st.id,
              title: st.title,
              completed: st.completed,
            }))
          : [{ title: '', completed: false }]
      )
    } else {
      setTitle('')
      setSelectedCategory(initialCategory || '')
      setDueDate('')
      setUseTimeSetting(false)
      setStartTime('')
      setDueTime('')
      setSubInputs([{ title: '', completed: false }])
    }
  }, [isOpen, editingTodo, initialCategory])

  if (!isOpen) return null

  const handleAddSubInput = () =>
    setSubInputs([...subInputs, { title: '', completed: false }])

  const handleSubInputChange = (index: number, val: string) => {
    const next = [...subInputs]
    next[index] = { ...next[index], title: val }
    setSubInputs(next)
  }

  const handleRemoveSubInput = (index: number) => {
    setSubInputs(subInputs.filter((_, i) => i !== index))
  }

  const handleToggleTimeSetting = (checked: boolean) => {
    setUseTimeSetting(checked)
    if (!checked) {
      setStartTime('')
      setDueTime('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const finalStartTime = useTimeSetting && startTime ? startTime : ''
    const finalDueTime = useTimeSetting && dueTime ? dueTime : ''

    if (editingTodo && onUpdate) {
      const formattedSubTasks: SubTask[] = subInputs
        .filter((s) => s.title.trim() !== '')
        .map((s, idx) => ({
          id: s.id || `${Date.now()}-${idx}`,
          title: s.title.trim(),
          completed: s.completed,
        }))

      onUpdate(editingTodo.id, {
        title: title.trim(),
        category: selectedCategory,
        due_date: dueDate || null,
        start_time: finalStartTime || null,
        due_time: finalDueTime || null,
        sub_tasks: formattedSubTasks,
      })
    } else {
      const validSubTasks = subInputs
        .map((s) => s.title.trim())
        .filter((t) => t !== '')
      onSubmit(title.trim(), selectedCategory, dueDate, validSubTasks, finalStartTime, finalDueTime)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">
          {editingTodo ? '할 일 수정' : '새 할 일 추가'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block uppercase tracking-wider">
              할 일 제목
            </label>
            <input
              type="text"
              placeholder="예: 토익스피킹 Part 3 모의고사 풀이"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="input h-12 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block uppercase tracking-wider">
                카테고리 지정
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select h-12 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="">수집함 (미분류)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block uppercase tracking-wider">
                마감기한 (선택)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input h-12 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* 선택적 시작시간 / 마감시간 설정 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-indigo-500" />
                시간 설정 (시작 / 마감시간 선택)
              </span>
              <input
                type="checkbox"
                checked={useTimeSetting}
                onChange={(e) => handleToggleTimeSetting(e.target.checked)}
                className="toggle toggle-sm toggle-primary"
              />
            </label>

            {useTimeSetting && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      시작 시간 (선택)
                    </span>
                    {startTime && (
                      <button
                        type="button"
                        onClick={() => setStartTime('')}
                        className="text-[10px] text-slate-400 hover:text-rose-500"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input h-10 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl text-xs px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      마감 시간 (선택)
                    </span>
                    {dueTime && (
                      <button
                        type="button"
                        onClick={() => setDueTime('')}
                        className="text-[10px] text-slate-400 hover:text-rose-500"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="input h-10 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl text-xs px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                세부 하위 항목 (선택)
              </label>
              <button
                type="button"
                onClick={handleAddSubInput}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline transition"
              >
                + 항목 추가
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {subInputs.map((sub, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder={`세부 항목 ${idx + 1} (예: 1회차 오답노트 작성)`}
                    value={sub.title}
                    onChange={(e) => handleSubInputChange(idx, e.target.value)}
                    className="input h-11 flex-1 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl text-xs px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                  {subInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubInput(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn h-12 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="btn h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition"
            >
              {editingTodo ? '수정 저장' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}