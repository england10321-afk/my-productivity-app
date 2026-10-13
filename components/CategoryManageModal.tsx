'use client'

import React, { useState } from 'react'
import { X, Settings, Edit2, Trash2 } from 'lucide-react'
import { Category } from '@/types'

interface CategoryManageModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onAddCategory: (name: string) => void
  onUpdateCategory: (cat: Category, newName: string) => void
  onDeleteCategory: (cat: Category) => void
}

export default function CategoryManageModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManageModalProps) {
  const [newCatName, setNewCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatName, setEditingCatName] = useState('')

  if (!isOpen) return null

  const handleAdd = () => {
    if (!newCatName.trim()) return
    onAddCategory(newCatName.trim())
    setNewCatName('')
  }

  const handleUpdate = (cat: Category) => {
    if (!editingCatName.trim()) return
    onUpdateCategory(cat, editingCatName.trim())
    setEditingCatId(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-8 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold mb-6 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-500" /> 카테고리 관리
        </h3>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="새 카테고리 이름 입력 (예: 프로젝트, 공모전)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="input h-12 flex-1 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl text-sm px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="btn h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold px-6 transition"
          >
            추가
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 border-t border-slate-100 dark:border-slate-800 pt-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition"
            >
              {editingCatId === cat.id ? (
                <input
                  type="text"
                  value={editingCatName}
                  onChange={(e) => setEditingCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat)}
                  autoFocus
                  className="input h-10 flex-1 bg-white dark:bg-slate-900 border-indigo-500 rounded-xl text-sm px-3 mr-3 focus:outline-none"
                />
              ) : (
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 pl-1">
                  {cat.name}
                </span>
              )}

              <div className="flex items-center gap-2">
                {editingCatId === cat.id ? (
                  <button
                    onClick={() => handleUpdate(cat)}
                    className="btn h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium"
                  >
                    저장
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCatId(cat.id)
                      setEditingCatName(cat.name)
                    }}
                    title="이름 수정"
                    className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-600 rounded-xl transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onDeleteCategory(cat)}
                  title="삭제"
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-500 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="btn h-11 px-7 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}