import { supabase } from '../lib/supabaseClient'
import { Todo, Category, Note } from '@/types'

// ==========================================
// 1. 카테고리 (Categories)
// ==========================================

export async function fetchCategories(type: 'todo' | 'note' = 'todo'): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('fetchCategories error:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('fetchCategories unexpected error:', err)
    return []
  }
}

export async function addCategory(name: string, type: 'todo' | 'note' = 'todo'): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, type }])
      .select()
      .single()

    if (error) {
      alert(`[카테고리 추가 실패]\n${error.message}`)
      console.error('addCategory error:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('addCategory unexpected error:', err)
    return null
  }
}

export async function updateCategory(id: string, name: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)

    if (error) {
      alert(`[카테고리 수정 실패]\n${error.message}`)
      console.error('updateCategory error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('updateCategory unexpected error:', err)
    return false
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      alert(`[카테고리 삭제 실패]\n${error.message}`)
      console.error('deleteCategory error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('deleteCategory unexpected error:', err)
    return false
  }
}

// ==========================================
// 2. 할 일 (Todos)
// ==========================================

export async function fetchTodos(): Promise<Todo[]> {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetchTodos error:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('fetchTodos unexpected error:', err)
    return []
  }
}

export async function addTodo(
  title: string,
  category: string,
  subTasks: string[],
  dueDate: string | null = null
): Promise<Todo | null> {
  try {
    const formattedSubTasks = subTasks.map((st, idx) => ({
      id: `${Date.now()}-${idx}`,
      title: st,
      completed: false,
    }))

    const { data, error } = await supabase
      .from('todos')
      .insert([
        {
          title,
          category,
          due_date: dueDate,
          sub_tasks: formattedSubTasks,
          completed: false,
        },
      ])
      .select()
      .single()

    if (error) {
      alert(`[할 일 추가 실패]\n${error.message}`)
      console.error('addTodo error:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('addTodo unexpected error:', err)
    return null
  }
}

export async function updateTodoCategory(id: string, category: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('todos')
      .update({ category })
      .eq('id', id)

    if (error) {
      console.error('updateTodoCategory error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('updateTodoCategory unexpected error:', err)
    return false
  }
}

export async function toggleTodoComplete(id: string, currentCompleted: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !currentCompleted })
      .eq('id', id)

    if (error) {
      console.error('toggleTodoComplete error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('toggleTodoComplete unexpected error:', err)
    return false
  }
}

export async function updateSubTasks(id: string, subTasks: any[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('todos')
      .update({ sub_tasks: subTasks })
      .eq('id', id)

    if (error) {
      console.error('updateSubTasks error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('updateSubTasks unexpected error:', err)
    return false
  }
}

export async function deleteTodoPermanently(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (error) {
      console.error('deleteTodoPermanently error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('deleteTodoPermanently unexpected error:', err)
    return false
  }
}

// ==========================================
// 3. 기획 & 노트 (Notes)
// ==========================================

export async function fetchNotes(): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetchNotes error:', error)
      alert(`[노트 불러오기 실패]\n${error.message}\nSupabase 테이블 생성을 확인해 주세요.`)
      return []
    }
    return data || []
  } catch (err) {
    console.error('fetchNotes unexpected error:', err)
    return []
  }
}

export async function addNote(
  title: string,
  category: string,
  content: string
): Promise<Note | null> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          title,
          category,
          content,
        },
      ])
      .select()
      .single()

    if (error) {
      alert(`[노트 저장 실패]\n${error.message}`)
      console.error('addNote error:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('addNote unexpected error:', err)
    return null
  }
}

export async function updateNote(
  id: string,
  title: string,
  category: string,
  content: string
): Promise<Note | null> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ title, category, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      alert(`[노트 수정 실패]\n${error.message}`)
      console.error('updateNote error:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('updateNote unexpected error:', err)
    return null
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
      alert(`[노트 삭제 실패]\n${error.message}`)
      console.error('deleteNote error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('deleteNote unexpected error:', err)
    return false
  }
}

// ==========================================
// 4. 타임블록 (Time Blocks)
// ==========================================

export const fetchTimeBlocks = async (date?: string) => {
  try {
    let query = supabase.from('time_blocks').select('*')

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query

    if (error) {
      console.error('fetchTimeBlocks error:', error.message || JSON.stringify(error))
      return []
    }

    return data || []
  } catch (err) {
    console.error('fetchTimeBlocks exception:', err)
    return []
  }
}

export async function addTimeBlock(
  title: string,
  startHour: number,
  endHour: number,
  color: string
) {
  try {
    const { data, error } = await supabase
      .from('time_blocks')
      .insert([{ title, start_hour: startHour, end_hour: endHour, color }])
      .select()
      .single()

    if (error) {
      alert(`[타임블록 DB 저장 실패]\n에러 메시지: ${error.message}\n코드: ${error.code}`)
      console.error('addTimeBlock error:', error)
      return null
    }
    return data
  } catch (err: any) {
    alert(`[시스템 오류] ${err.message || err}`)
    console.error('addTimeBlock unexpected error:', err)
    return null
  }
}

export async function deleteTimeBlock(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('time_blocks').delete().eq('id', id)
    if (error) {
      alert(`[타임블록 삭제 실패]\n${error.message}`)
      console.error('deleteTimeBlock error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('deleteTimeBlock unexpected error:', err)
    return false
  }
}

// ==========================================
// 5. 데이터 백업 & 복원 (Export / Import)
// ==========================================

export async function exportAllData() {
  try {
    const [categories, todos, notes, timeBlocks] = await Promise.all([
      fetchCategories(),
      fetchTodos(),
      fetchNotes(),
      fetchTimeBlocks(),
    ])

    return {
      version: '1.0',
      exported_at: new Date().toISOString(),
      categories,
      todos,
      notes,
      timeBlocks,
    }
  } catch (err) {
    console.error('exportAllData error:', err)
    return null
  }
}

export async function importAllData(parsedData: any): Promise<boolean> {
  try {
    if (!parsedData || !parsedData.todos || !parsedData.categories) {
      throw new Error('Invalid JSON format')
    }

    await supabase.from('todos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('notes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('time_blocks').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    if (parsedData.categories.length > 0) {
      const catInserts = parsedData.categories.map((c: any) => ({
        name: c.name,
        type: c.type || 'todo',
      }))
      await supabase.from('categories').insert(catInserts)
    }

    if (parsedData.todos.length > 0) {
      const todoInserts = parsedData.todos.map((t: any) => ({
        title: t.title,
        category: t.category,
        due_date: t.due_date,
        sub_tasks: t.sub_tasks || [],
        completed: t.completed || false,
      }))
      await supabase.from('todos').insert(todoInserts)
    }

    if (parsedData.notes && parsedData.notes.length > 0) {
      const noteInserts = parsedData.notes.map((n: any) => ({
        title: n.title,
        category: n.category,
        content: n.content,
      }))
      await supabase.from('notes').insert(noteInserts)
    }

    if (parsedData.timeBlocks && parsedData.timeBlocks.length > 0) {
      const blockInserts = parsedData.timeBlocks.map((b: any) => ({
        title: b.title,
        start_hour: b.start_hour,
        end_hour: b.end_hour,
        color: b.color,
      }))
      await supabase.from('time_blocks').insert(blockInserts)
    }

    return true
  } catch (err) {
    console.error('importAllData error:', err)
    return false
  }
}