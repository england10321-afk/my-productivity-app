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
// 4. 데이터 백업 & 복원 (Export / Import)
// ==========================================

export async function exportAllData() {
  try {
    const [categories, todos, notes] = await Promise.all([
      fetchCategories(),
      fetchTodos(),
      fetchNotes(),
    ])

    return {
      version: '1.0',
      exported_at: new Date().toISOString(),
      categories,
      todos,
      notes,
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

    return true
  } catch (err) {
    console.error('importAllData error:', err)
    return false
  }
}