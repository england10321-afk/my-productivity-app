import { supabase } from '../lib/supabaseClient'
import { Todo, Category, Note, SubTask, SharedItem } from '@/types'

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
  dueDate: string | null = null,
  startTime: string | null = null,
  dueTime: string | null = null
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
          start_time: startTime,
          due_time: dueTime,
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

export async function updateTodo(
  id: string,
  updates: {
    title: string
    category: string
    due_date: string | null
    start_time: string | null
    due_time: string | null
    sub_tasks: SubTask[]
  }
): Promise<Todo | null> {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      alert(`[할 일 수정 실패]\n${error.message}`)
      console.error('updateTodo error:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('updateTodo unexpected error:', err)
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

export async function deleteCompletedTodos(): Promise<boolean> {
  try {
    const { error } = await supabase.from('todos').delete().eq('completed', true)

    if (error) {
      alert(`[완료 항목 일괄 삭제 실패]\n${error.message}`)
      console.error('deleteCompletedTodos error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('deleteCompletedTodos unexpected error:', err)
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
      .order('is_pinned', { ascending: false })
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
  content: string,
  isPinned: boolean = false
): Promise<Note | null> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          title,
          category,
          content,
          is_pinned: isPinned,
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
  content: string,
  isPinned?: boolean
): Promise<Note | null> {
  try {
    const payload: any = {
      title,
      category,
      content,
      updated_at: new Date().toISOString(),
    }
    if (typeof isPinned === 'boolean') {
      payload.is_pinned = isPinned
    }

    const { data, error } = await supabase
      .from('notes')
      .update(payload)
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

export async function toggleNotePin(id: string, currentPinned: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notes')
      .update({ is_pinned: !currentPinned })
      .eq('id', id)

    if (error) {
      alert(`[노트 고정 변경 실패]\n${error.message}`)
      console.error('toggleNotePin error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('toggleNotePin unexpected error:', err)
    return false
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
        start_time: t.start_time || null,
        due_time: t.due_time || null,
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
        is_pinned: n.is_pinned || false,
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

// ==========================================
// 6. 기기 간 자료 공유함 (Shared Items)
// ==========================================

export async function fetchSharedItems(): Promise<SharedItem[]> {
  try {
    const { data, error } = await supabase
      .from('shared_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetchSharedItems error:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('fetchSharedItems unexpected error:', err)
    return []
  }
}

export async function addSharedText(
  content: string,
  title: string = ''
): Promise<SharedItem | null> {
  try {
    const { data, error } = await supabase
      .from('shared_items')
      .insert([
        {
          type: 'text',
          title: title.trim() || null,
          content: content.trim(),
        },
      ])
      .select()
      .single()

    if (error) {
      alert(`[텍스트 전송 실패]\n${error.message}`)
      console.error('addSharedText error:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('addSharedText unexpected error:', err)
    return null
  }
}

export async function uploadSharedFile(file: File): Promise<SharedItem | null> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('shared-files')
      .upload(safePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      alert(`[파일 업로드 실패]\n${uploadError.message}`)
      console.error('uploadSharedFile storage error:', uploadError)
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from('shared-files')
      .getPublicUrl(safePath)

    let itemType: 'image' | 'pdf' | 'file' = 'file'
    if (file.type.startsWith('image/')) {
      itemType = 'image'
    } else if (file.type === 'application/pdf' || ext === 'pdf') {
      itemType = 'pdf'
    }

    const { data, error: dbError } = await supabase
      .from('shared_items')
      .insert([
        {
          type: itemType,
          title: file.name,
          file_url: publicUrlData.publicUrl,
          file_path: safePath,
          file_size: file.size,
        },
      ])
      .select()
      .single()

    if (dbError) {
      alert(`[파일 정보 저장 실패]\n${dbError.message}`)
      console.error('uploadSharedFile db error:', dbError)
      return null
    }

    return data
  } catch (err) {
    console.error('uploadSharedFile unexpected error:', err)
    return null
  }
}

export async function deleteSharedItem(item: SharedItem): Promise<boolean> {
  try {
    if (item.file_path) {
      await supabase.storage.from('shared-files').remove([item.file_path])
    }

    const { error } = await supabase.from('shared_items').delete().eq('id', item.id)

    if (error) {
      alert(`[자료 삭제 실패]\n${error.message}`)
      console.error('deleteSharedItem error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('deleteSharedItem unexpected error:', err)
    return false
  }
}