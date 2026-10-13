'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Category } from '@/types'

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onSubmit: (title: string, category: string, dueDate: string, subTasks: string[]) => void
}

export default function TodoModal({ isOpen, onClose, categories, onSubmit }: TodoModalProps) {
  const [title, setTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [subInputs, setSubInputs] = useState<string[]>([''])

  if (!isOpen) return null

  const handleAddSubInput = () => setSubInputs([...subInputs, ''])
  const handleSubInputChange = (index: number, val: string) => {
    const next = [...subInputs]
    next[index] = val
    setSubInputs(next)
  }
  const handleRemoveSubInput = (index: number) => {
    setSubInputs(subInputs.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const validSubTasks = subInputs.filter((s) => s.trim() !== '')
    onSubmit(title.trim(), selectedCategory, dueDate, validSubTasks)

    setTitle('')
    setSelectedCategory('')
    setDueDate('')
    setSubInputs([''])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">새 할 일 추가</h3>

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
                    value={sub}
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
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}