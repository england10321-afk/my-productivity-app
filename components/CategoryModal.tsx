import React, { useState } from 'react'
import { Category } from '../types'
import { X, Trash2 } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  categories: Category[]
  onClose: () => void
  onAddCategory: (name: string, color: string) => void
  onDeleteCategory: (id: string) => void
  getColorClasses: (catName: string) => { badge: string; block: string }
}

export default function CategoryModal({
  isOpen,
  categories,
  onClose,
  onAddCategory,
  onDeleteCategory,
  getColorClasses,
}: CategoryModalProps) {
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('indigo')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    onAddCategory(newCatName.trim(), newCatColor)
    setNewCatName('')
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">카테고리 관리</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="카테고리명..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
          />
          <select
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="px-2 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="blue">파랑 (Blue)</option>
            <option value="emerald">초록 (Emerald)</option>
            <option value="amber">주황 (Amber)</option>
            <option value="rose">빨강 (Rose)</option>
            <option value="purple">보라 (Purple)</option>
            <option value="indigo">남색 (Indigo)</option>
          </select>
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl">
            추가
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className={`px-2.5 py-1 rounded-lg border font-medium ${getColorClasses(c.name).badge}`}>
                {c.name}
              </span>
              <button onClick={() => onDeleteCategory(c.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}