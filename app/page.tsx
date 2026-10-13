'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus,
  CheckSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Settings,
  Calendar,
  Download,
  Upload,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import { Category, Todo } from '@/types'
import * as plannerService from '@/services/plannerService'
import NavigationDock from '@/components/NavigationDock'
import TodoCard from '@/components/TodoCard'
import TodoModal from '@/components/TodoModal'
import CategoryManageModal from '@/components/CategoryManageModal'
import { sortTodos, filterTodos, SortOption } from '@/utils/sort'

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // 검색 및 정렬 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('dueDate')

  // 모달 및 서브 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCatManageModalOpen, setIsCatManageModalOpen] = useState(false)
  const [expandedTodoIds, setExpandedTodoIds] = useState<string[]>([])
  const [showCompleted, setShowCompleted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [fetchedTodos, fetchedCats] = await Promise.all([
      plannerService.fetchTodos(),
      plannerService.fetchCategories('todo'),
    ])
    setTodos(fetchedTodos)
    setCategories(fetchedCats)
    setLoading(false)
  }

  // 백업 & 복원
  const handleExportData = async () => {
    const data = await plannerService.exportAllData()
    if (!data) return alert('데이터 백업 생성 실패')

    const today = new Date().toISOString().split('T')[0]
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`
    const a = document.createElement('a')
    a.href = jsonString
    a.download = `productivity_backup_${today}.json`
    a.click()
  }

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('현재 저장된 데이터가 백업본으로 전체 교체됩니다. 진행하시겠습니까?')) {
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string)
        const success = await plannerService.importAllData(parsed)
        if (success) {
          alert('복원 성공!')
          loadData()
        }
      } catch (err) {
        alert('올바르지 않은 백업 파일 형식입니다.')
      }
      if (e.target) e.target.value = ''
    }
    reader.readAsText(file)
  }

  // 할 일 추가
  const handleAddTodoSubmit = async (
    title: string,
    category: string,
    dueDate: string,
    subTasks: string[]
  ) => {
    const created = await plannerService.addTodo(title, category, subTasks, dueDate || null)
    if (created) setTodos([created, ...todos])
  }

  // 드래그 앤 드롭
  const handleCategoryChange = async (todoId: string, newCategory: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, category: newCategory } : t))
    )
    await plannerService.updateTodoCategory(todoId, newCategory)
  }

  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result
    if (!destination) return
    const newCat = destination.droppableId === 'inbox' ? '' : destination.droppableId
    handleCategoryChange(draggableId, newCat)
  }

  // 상태 관리
  const handleToggleComplete = async (todo: Todo) => {
    const success = await plannerService.toggleTodoComplete(todo.id, todo.completed)
    if (success) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: !todo.completed } : t))
      )
    }
  }

  const handleDeletePermanently = async (id: string) => {
    const success = await plannerService.deleteTodoPermanently(id)
    if (success) setTodos(todos.filter((t) => t.id !== id))
  }

  const handleToggleSubTask = async (todo: Todo, subTaskId: string) => {
    const nextSubTasks = (todo.sub_tasks || []).map((st) =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    )
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, sub_tasks: nextSubTasks } : t))
    )
    await plannerService.updateSubTasks(todo.id, nextSubTasks)
  }

  const toggleAccordion = (id: string) => {
    setExpandedTodoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // 카테고리 CRUD
  const handleAddCategory = async (name: string) => {
    const created = await plannerService.addCategory(name, 'todo')
    if (created) setCategories([...categories, created])
  }

  const handleUpdateCategory = async (cat: Category, newName: string) => {
    const success = await plannerService.updateCategory(cat.id, newName)
    if (success) {
      setTodos((prev) =>
        prev.map((t) => (t.category === cat.name ? { ...t, category: newName } : t))
      )
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, name: newName } : c))
      )
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까? 소속 항목은 수집함으로 이동합니다.`)) {
      return
    }
    const success = await plannerService.deleteCategory(cat.id)
    if (success) {
      setTodos((prev) =>
        prev.map((t) => (t.category === cat.name ? { ...t, category: '' } : t))
      )
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    }
  }

  // 데이터 필터링 & 정렬 연산
  const filteredTodos = filterTodos(todos, searchQuery)
  const activeTodos = filteredTodos.filter((t) => !t.completed)
  const completedTodos = filteredTodos.filter((t) => t.completed)
  const inboxTodos = sortTodos(
    activeTodos.filter((t) => !t.category || t.category === ''),
    sortBy
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 pb-32">
      {/* 헤더 */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">전체 할 일 (Backlog)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            할 일을 우측 수집함에서 좌측 카테고리 블록으로 자유롭게 드래그하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportFileChange}
            className="hidden"
          />

          <button
            onClick={handleExportData}
            title="모든 데이터 JSON 저장"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" /> 백업
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="백업 파일 불러오기"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shadow-sm transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" /> 복원
          </button>

          <button
            onClick={() => setIsCatManageModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shadow-sm transition"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-500" /> 카테고리 관리
          </button>
        </div>
      </header>

      {/* [검색 & 정렬 바] */}
      <section className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="할 일 제목 또는 서브태스크 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-9 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="select select-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="dueDate">마감일 임박순 (D-Day)</option>
            <option value="alphabetical">가나다순</option>
            <option value="latest">최신 생성순</option>
          </select>
        </div>
      </section>

      {/* 칸반 보드 */}
      <DragDropContext onDragEnd={onDragEnd}>
        <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* [좌측: 카테고리 목록] */}
          <section className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const catTodos = sortTodos(
                activeTodos.filter((t) => t.category === cat.name),
                sortBy
              )

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[220px] flex flex-col transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      {cat.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{catTodos.length}개</span>
                  </div>

                  <Droppable droppableId={cat.name}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 space-y-2 bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 min-h-[150px]"
                      >
                        {catTodos.map((todo, index) => (
                          <TodoCard
                            key={todo.id}
                            todo={todo}
                            index={index}
                            isExpanded={expandedTodoIds.includes(todo.id)}
                            toggleAccordion={toggleAccordion}
                            handleToggleComplete={handleToggleComplete}
                            handleToggleSubTask={handleToggleSubTask}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </section>

          {/* [우측: 수집함] */}
          <section className="md:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                <CheckSquare className="w-4 h-4 text-indigo-500" /> 수집함 (미분류)
              </h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg font-mono">
                {inboxTodos.length}
              </span>
            </div>

            <Droppable droppableId="inbox">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 space-y-2 bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 min-h-[400px]"
                >
                  {inboxTodos.map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleComplete(todo)}
                                className="checkbox checkbox-xs checkbox-primary cursor-pointer"
                              />
                              <span className="text-xs font-medium text-slate-800 dark:text-slate-100">
                                {todo.title}
                              </span>
                            </div>
                          </div>

                          {todo.due_date && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                              <Calendar className="w-3 h-3" />
                              <span>{todo.due_date}까지</span>
                            </div>
                          )}

                          <select
                            value={todo.category || ''}
                            onChange={(e) => handleCategoryChange(todo.id, e.target.value)}
                            className="select select-xs w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-[11px]"
                          >
                            <option value="">-- 카테고리 선택 --</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </section>
        </main>
      </DragDropContext>

      {/* 완료 보관함 */}
      <section className="max-w-7xl mx-auto mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition mb-4"
        >
          {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          완료된 항목 ({completedTodos.length}개)
        </button>

        {showCompleted && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {completedTodos.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">완료된 항목이 없습니다.</p>
            ) : (
              completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="p-3 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-70 hover:opacity-100 transition"
                >
                  <span className="text-xs line-through text-slate-500">{todo.title}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleComplete(todo)}
                      title="복원하기"
                      className="p-1 hover:text-indigo-500 text-slate-400 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePermanently(todo.id)}
                      title="영구 삭제"
                      className="p-1 hover:text-red-500 text-slate-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* 플로팅 + 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-8 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        title="새 할 일 추가"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* 모달 */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSubmit={handleAddTodoSubmit}
      />

      <CategoryManageModal
        isOpen={isCatManageModalOpen}
        onClose={() => setIsCatManageModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <NavigationDock activeTab="todos" />
    </div>
  )
}