'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react'
import { Todo } from '@/types'
import { calculateDDay } from '@/utils/date'

interface TodoCardProps {
  todo: Todo
  index: number
  isExpanded: boolean
  toggleAccordion: (id: string) => void
  handleToggleComplete: (todo: Todo) => void
  handleToggleSubTask: (todo: Todo, subTaskId: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export default function TodoCard({
  todo,
  index,
  isExpanded,
  toggleAccordion,
  handleToggleComplete,
  handleToggleSubTask,
  onEdit,
  onDelete,
}: TodoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const subTasks = todo.sub_tasks || []
  const completedSubCount = subTasks.filter((st) => st.completed).length
  const ddayInfo = calculateDDay(todo.due_date)
  const hasTime = Boolean(todo.start_time || todo.due_time)

  // 드롭다운 바깥 영역 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // D-Day 상태별 스타일 지정
  const getDDayBadgeStyle = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900'
      case 'TODAY':
        return 'bg-amber-500 text-white font-bold animate-pulse shadow-sm shadow-amber-200 dark:shadow-none'
      case 'URGENT':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900'
      case 'NORMAL':
        return 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-900'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium'
    }
  }

  const formatTimeText = () => {
    if (todo.start_time && todo.due_time) {
      return `${todo.start_time} ~ ${todo.due_time}`
    }
    if (todo.start_time) {
      return `${todo.start_time} 시작`
    }
    return `${todo.due_time} 마감`
  }

  return (
    <Draggable key={todo.id} draggableId={todo.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col gap-2.5 relative"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo)}
                className="checkbox checkbox-xs checkbox-primary cursor-pointer mt-0.5"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {todo.title}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {subTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleAccordion(todo.id)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-500 font-mono transition px-1"
                >
                  <span>
                    {completedSubCount}/{subTasks.length}
                  </span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {/* 점 3개 추가 작업 메뉴 */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen((prev) => !prev)
                  }}
                  title="추가 작업"
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-7 z-30 w-28 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-1 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onEdit(todo)
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition"
                    >
                      <Pencil className="w-3 h-3 text-indigo-500" />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        if (confirm(`'${todo.title}' 항목을 삭제하시겠습니까?`)) {
                          onDelete(todo.id)
                        }
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 시간 설정 뱃지 (선택적으로 설정된 경우에만 표시) */}
          {hasTime && (
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 px-2 py-1 rounded-lg w-fit font-mono">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatTimeText()}</span>
            </div>
          )}

          {/* D-Day & 마감일 표시 바 */}
          {ddayInfo && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Calendar className="w-3 h-3" />
                <span>{todo.due_date}</span>
              </div>

              <span
                className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${getDDayBadgeStyle(
                  ddayInfo.status
                )}`}
              >
                {ddayInfo.status === 'OVERDUE' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                {ddayInfo.text}
              </span>
            </div>
          )}

          {/* 서브태스크 아코디언 */}
          {isExpanded && subTasks.length > 0 && (
            <div className="pl-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              {subTasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 text-[11px]">
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}