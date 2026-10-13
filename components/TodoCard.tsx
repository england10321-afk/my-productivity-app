'use client'

import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { ChevronDown, ChevronUp, Calendar, AlertCircle } from 'lucide-react'
import { Todo } from '@/types'
import { calculateDDay } from '@/utils/date'

interface TodoCardProps {
  todo: Todo
  index: number
  isExpanded: boolean
  toggleAccordion: (id: string) => void
  handleToggleComplete: (todo: Todo) => void
  handleToggleSubTask: (todo: Todo, subTaskId: string) => void
}

export default function TodoCard({
  todo,
  index,
  isExpanded,
  toggleAccordion,
  handleToggleComplete,
  handleToggleSubTask,
}: TodoCardProps) {
  const subTasks = todo.sub_tasks || []
  const completedSubCount = subTasks.filter((st) => st.completed).length
  const ddayInfo = calculateDDay(todo.due_date)

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

  return (
    <Draggable key={todo.id} draggableId={todo.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col gap-2.5"
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

            {subTasks.length > 0 && (
              <button
                onClick={() => toggleAccordion(todo.id)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-500 font-mono transition shrink-0"
              >
                <span>
                  {completedSubCount}/{subTasks.length}
                </span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

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