import { Todo } from '@/types'

export type SortOption = 'dueDate' | 'alphabetical' | 'latest'

export function sortTodos(todos: Todo[], sortBy: SortOption): Todo[] {
  return [...todos].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }

    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title, 'ko')
    }

    if (sortBy === 'latest') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    }

    return 0
  })
}

export function filterTodos(todos: Todo[], searchQuery: string): Todo[] {
  if (!searchQuery.trim()) return todos

  const query = searchQuery.toLowerCase().trim()
  return todos.filter((todo) => {
    const titleMatch = todo.title.toLowerCase().includes(query)
    const subTaskMatch = (todo.sub_tasks || []).some((st) =>
      st.title.toLowerCase().includes(query)
    )
    return titleMatch || subTaskMatch
  })
}