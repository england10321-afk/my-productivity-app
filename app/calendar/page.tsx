'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
} from 'lucide-react'
import { Category, Todo, SubTask } from '@/types'
import * as plannerService from '@/services/plannerService'
import NavigationDock from '@/components/NavigationDock'
import TodoModal from '@/components/TodoModal'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 로컬 시간 기준 YYYY-MM-DD 포맷 변환 (UTC 시차 오차 방지)
function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const todayKey = useMemo(() => formatDateKey(new Date()), [])
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey(new Date()))
  const [showCompleted, setShowCompleted] = useState<boolean>(true)
  const [showUndated, setShowUndated] = useState<boolean>(false)
  const [expandedTodoIds, setExpandedTodoIds] = useState<string[]>([])

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialDate, setModalInitialDate] = useState('')
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

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

  // 날짜별 할 일 그룹화 및 시간순 정렬
  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {}

    const visibleTodos = showCompleted ? todos : todos.filter((t) => !t.completed)

    visibleTodos.forEach((todo) => {
      if (!todo.due_date) return
      if (!map[todo.due_date]) {
        map[todo.due_date] = []
      }
      map[todo.due_date].push(todo)
    })

    Object.keys(map).forEach((dateKey) => {
      map[dateKey].sort((a, b) => {
        if (a.completed !== b.completed) {
          return Number(a.completed) - Number(b.completed)
        }
        const timeA = a.start_time || a.due_time || '99:99'
        const timeB = b.start_time || b.due_time || '99:99'
        return timeA.localeCompare(timeB)
      })
    })

    return map
  }, [todos, showCompleted])

  // 기한 미지정 할 일 목록
  const undatedTodos = useMemo(() => {
    return todos.filter((t) => !t.due_date && !t.completed)
  }, [todos])

  // 달력 그리드 날짜 배열 계산
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevMonthLastDate = new Date(year, month, 0).getDate()

    const cells: { date: Date; dateKey: string; isCurrentMonth: boolean }[] = []

    // 이전 달 채우기
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i)
      cells.push({ date: d, dateKey: formatDateKey(d), isCurrentMonth: false })
    }

    // 현재 달 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day)
      cells.push({ date: d, dateKey: formatDateKey(d), isCurrentMonth: true })
    }

    // 다음 달 채우기 (7의 배수 맞춤)
    const remaining = (7 - (cells.length % 7)) % 7
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day)
      cells.push({ date: d, dateKey: formatDateKey(d), isCurrentMonth: false })
    }

    return cells
  }, [currentMonth])

  // 월 이동 핸들러
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleGoToday = () => {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(formatDateKey(now))
  }

  const handleSelectCell = (cell: { date: Date; dateKey: string; isCurrentMonth: boolean }) => {
    setSelectedDate(cell.dateKey)
    if (!cell.isCurrentMonth) {
      setCurrentMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1))
    }
  }

  // 선택된 날짜 한국어 표기
  const formattedSelectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    if (!y || !m || !d) return selectedDate
    const dateObj = new Date(y, m - 1, d)
    const weekday = WEEKDAYS[dateObj.getDay()]
    return `${y}년 ${m}월 ${d}일 (${weekday})`
  }, [selectedDate])

  const selectedDateTodos = todosByDate[selectedDate] || []

  // 모달 핸들러
  const handleOpenAddModal = (dateStr: string) => {
    setEditingTodo(null)
    setModalInitialDate(dateStr)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (todo: Todo) => {
    setEditingTodo(todo)
    setModalInitialDate(todo.due_date || selectedDate)
    setIsModalOpen(true)
  }

  const handleAddTodoSubmit = async (
    title: string,
    category: string,
    dueDate: string,
    subTasks: string[],
    startTime: string,
    dueTime: string
  ) => {
    const created = await plannerService.addTodo(
      title,
      category,
      subTasks,
      dueDate || null,
      startTime || null,
      dueTime || null
    )
    if (created) {
      setTodos((prev) => [created, ...prev])
      if (created.due_date) {
        setSelectedDate(created.due_date)
      }
    }
  }

  const handleUpdateTodoSubmit = async (
    id: string,
    updates: {
      title: string
      category: string
      due_date: string | null
      start_time: string | null
      due_time: string | null
      sub_tasks: SubTask[]
    }
  ) => {
    const updated = await plannerService.updateTodo(id, updates)
    if (updated) {
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    const success = await plannerService.toggleTodoComplete(todo.id, todo.completed)
    if (success) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: !todo.completed } : t))
      )
    }
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

  const handleDeleteTodo = async (todo: Todo) => {
    if (!confirm(`'${todo.title}' 항목을 삭제하시겠습니까?`)) return
    const success = await plannerService.deleteTodoPermanently(todo.id)
    if (success) {
      setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    }
  }

  const toggleAccordion = (id: string) => {
    setExpandedTodoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const formatTimeBadge = (todo: Todo) => {
    if (todo.start_time && todo.due_time) return `${todo.start_time} ~ ${todo.due_time}`
    if (todo.start_time) return `${todo.start_time} 시작`
    if (todo.due_time) return `${todo.due_time} 마감`
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 pb-32">
      {/* 헤더 */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-indigo-500" /> 캘린더
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            날짜별로 등록된 할 일과 일정을 한눈에 확인하고 바로 추가하세요.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="toggle toggle-xs toggle-primary"
          />
          <span>완료 항목 표시</span>
        </label>
      </header>

      {/* 메인 레이아웃: 좌측 월간 달력 / 우측 선택 날짜 상세 */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* [좌측: 월간 캘린더 그리드] */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </h2>
              <button
                type="button"
                onClick={handleGoToday}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition cursor-pointer"
              >
                오늘
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="이전 달"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="다음 달"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={`text-center text-xs font-bold py-1.5 ${
                  idx === 0
                    ? 'text-rose-500'
                    : idx === 6
                      ? 'text-indigo-500'
                      : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 셀 그리드 */}
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400">일정을 불러오는 중...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((cell) => {
                const dayTodos = todosByDate[cell.dateKey] || []
                const isToday = cell.dateKey === todayKey
                const isSelected = cell.dateKey === selectedDate
                const dayOfWeek = cell.date.getDay()

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => handleSelectCell(cell)}
                    className={`min-h-[68px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                        : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/30'
                    } ${!cell.isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    {/* 날짜 숫자 */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : dayOfWeek === 0
                              ? 'text-rose-500'
                              : dayOfWeek === 6
                                ? 'text-indigo-500'
                                : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {dayTodos.length > 0 && (
                        <span className="sm:hidden text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                          {dayTodos.length}
                        </span>
                      )}
                    </div>

                    {/* 데스크톱/태블릿 할 일 미리보기 뱃지 */}
                    <div className="hidden sm:flex flex-col gap-1 w-full mt-1 overflow-hidden">
                      {dayTodos.slice(0, 2).map((todo) => (
                        <div
                          key={todo.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium ${
                            todo.completed
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                              : 'bg-indigo-100/80 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {todo.start_time ? `${todo.start_time} ` : ''}
                          {todo.title}
                        </div>
                      ))}
                      {dayTodos.length > 2 && (
                        <span className="text-[10px] text-slate-400 font-semibold pl-1">
                          +{dayTodos.length - 2}개 더보기
                        </span>
                      )}
                    </div>

                    {/* 모바일 도트 표시 */}
                    {dayTodos.length > 0 && (
                      <div className="flex sm:hidden items-center gap-0.5 mt-1">
                        {dayTodos.slice(0, 4).map((t) => (
                          <span
                            key={t.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.completed ? 'bg-slate-300 dark:bg-slate-600' : 'bg-indigo-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* [우측: 선택한 날짜의 할 일 상세 목록] */}
        <section className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    {formattedSelectedDateLabel}
                  </h3>
                  {selectedDate === todayKey && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      오늘
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  등록된 일정 {selectedDateTodos.length}개
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddModal(selectedDate)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>할 일 추가</span>
              </button>
            </div>

            {selectedDateTodos.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-2.5" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  이 날짜에 예정된 할 일이 없습니다.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(selectedDate)}
                  className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + 이 날짜에 새 할 일 등록하기
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateTodos.map((todo) => {
                  const subTasks = todo.sub_tasks || []
                  const completedSubCount = subTasks.filter((st) => st.completed).length
                  const isExpanded = expandedTodoIds.includes(todo.id)
                  const timeBadge = formatTimeBadge(todo)

                  return (
                    <div
                      key={todo.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col gap-2 ${
                        todo.completed
                          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 opacity-70'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleComplete(todo)}
                            className="checkbox checkbox-xs checkbox-primary mt-0.5 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-semibold break-words ${
                                todo.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {todo.title}
                            </p>

                            {/* 카테고리 & 시간 뱃지 */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {todo.category && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {todo.category}
                                </span>
                              )}
                              {timeBadge && (
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {timeBadge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 우측 액션 버튼 */}
                        <div className="flex items-center gap-1 shrink-0">
                          {subTasks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleAccordion(todo.id)}
                              className="flex items-center gap-0.5 text-[11px] font-mono text-slate-400 hover:text-indigo-500 px-1.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              <span>
                                {completedSubCount}/{subTasks.length}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(todo)}
                            title="수정"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTodo(todo)}
                            title="삭제"
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 서브태스크 목록 */}
                      {isExpanded && subTasks.length > 0 && (
                        <div className="pl-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          {subTasks.map((st) => (
                            <label
                              key={st.id}
                              className="flex items-center gap-2 text-[11px] cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => handleToggleSubTask(todo, st.id)}
                                className="checkbox checkbox-xs border-slate-300 cursor-pointer"
                              />
                              <span
                                className={
                                  st.completed
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-700 dark:text-slate-300'
                                }
                              >
                                {st.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 기한 미지정 할 일 (접기/펼치기) */}
          {undatedTodos.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <button
                type="button"
                onClick={() => setShowUndated((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-slate-400" />
                  기한 미지정 할 일 ({undatedTodos.length}개)
                </span>
                {showUndated ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showUndated && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-60 overflow-y-auto">
                  {undatedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                    >
                      <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {todo.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(todo)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                      >
                        날짜 지정
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 할 일 추가/수정 모달 */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTodo(null)
        }}
        categories={categories}
        initialDueDate={modalInitialDate}
        editingTodo={editingTodo}
        onSubmit={handleAddTodoSubmit}
        onUpdate={handleUpdateTodoSubmit}
      />

      <NavigationDock activeTab="calendar" onRestored={loadData} />
    </div>
  )
}