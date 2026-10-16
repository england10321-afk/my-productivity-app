'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Category, Note } from '@/types'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  initialNote?: Note | null
  onSubmit: (title: string, category: string, content: string, id?: string) => void
}

export default function NoteModal({
  isOpen,
  onClose,
  categories,
  initialNote,
  onSubmit,
}: NoteModalProps) {
  const [title, setTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '')
      setSelectedCategory(initialNote.category || '')
      setContent(initialNote.content || '')
    } else {
      setTitle('')
      setSelectedCategory('')
      setContent('')
    }
  }, [initialNote, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit(title.trim(), selectedCategory, content, initialNote?.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">
          {initialNote ? '노트 수정' : '새 노트 작성'}
        </h3>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5 overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block uppercase tracking-wider">
              제목
            </label>
            <input
              type="text"
              placeholder="노트 제목을 입력하세요 (예: 아이디어 메모)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="input h-12 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block uppercase tracking-wider">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select h-12 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            >
              <option value="">미분류 노트</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col min-h-[200px]">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block uppercase tracking-wider">
              내용
            </label>
            <textarea
              placeholder="노트 내용을 자유롭게 기록하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea flex-1 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl text-xs p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none leading-relaxed"
            />
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
              {initialNote ? '수정하기' : '작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}