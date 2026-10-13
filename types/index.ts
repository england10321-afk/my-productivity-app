export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Todo {
  id: string
  title: string
  category: string
  completed: boolean
  sub_tasks?: SubTask[]
  due_date?: string | null // YYYY-MM-DD 형식의 마감기한 (선택)
  created_at?: string
}

export interface Category {
  id: string
  name: string
  color?: string
  type?: 'todo' | 'note' // 할 일용 / 메모장용 카테고리 구분
}

export interface DailyLog {
  id: string
  date: string
  completed_todo_ids: string[]
}

export interface Note {
  id: string
  title: string
  content: string
  category: string
  created_at?: string
  updated_at?: string
}