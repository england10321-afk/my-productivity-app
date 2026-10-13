import React, { useState } from 'react'
import { Todo, Category } from '../types'
import { Plus, CheckSquare, Trash2 } from 'lucide-react'

interface TodoBacklogProps {
  todos: Todo[]
  categories: Category[]
  loading: boolean
  onAddTodo: (title: string, category: string) => void
  onToggleComplete: (id: string, currentStatus: boolean) => void
  onDeleteTodo: (id: string) => void
  getColorClasses: (catName: string) => { badge: string; block: string }
}

export default function TodoBacklog({
  todos,
  categories,
  loading,
  onAddTodo,
  onToggleComplete,
  onDeleteTodo,
  getColorClasses,
}: TodoBacklogProps) {
  const [newTodo, setNewTodo] = useState('')
  const [category, setCategory] = useState(categories[0]?.name || '공부')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    onAddTodo(newTodo.trim(), category)
    setNewTodo('')
  }

  return (
    <section className="md:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col h-[750px]">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">할 일 백로그</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <fieldset className="fieldset bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-2xl border p-4 w-full">
          <legend className="fieldset-legend text-xs font-semibold px-2 text-slate-500 dark:text-slate-400">새 할 일 추가</legend>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="label text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">할 일 제목</label>
              <input
                type="text"
                placeholder="예: 리액트 공부하기"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="input input-sm w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none"
              />
            </div>

            <div className="w-28">
              <label className="label text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select select-sm w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </fieldset>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-8">불러오는 중...</p>
        ) : todos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">등록된 할 일이 없습니다.</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition group"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggleComplete(todo.id, todo.completed)}
                  className="checkbox checkbox-sm checkbox-primary cursor-pointer"
                />
                <span className={`text-sm ${todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                  {todo.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 border rounded-lg font-medium ${getColorClasses(todo.category).badge}`}>
                  {todo.category}
                </span>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}