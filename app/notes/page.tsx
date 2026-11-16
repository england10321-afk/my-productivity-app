'use client'

import React, { useState, useEffect } from 'react'
import { Plus, BookOpen, Trash2, Edit2, Search, Settings, Pin } from 'lucide-react'
import { Note, Category } from '@/types'
import * as plannerService from '@/services/plannerService'
import NavigationDock from '@/components/NavigationDock'
import NoteModal from '@/components/NoteModal'
import CategoryManageModal from '@/components/CategoryManageModal'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // 검색 및 카테고리 필터 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 모달 상태
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isCatManageModalOpen, setIsCatManageModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [modalInitialMode, setModalInitialMode] = useState<'preview' | 'edit'>('preview')

  useEffect(() => {
    loadData()
  }, [])

  // 상단 고정 우선 + 최신순 정렬 헬퍼
  const sortNotesList = (list: Note[]) => {
    return [...list].sort((a, b) => {
      const pinDiff = Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned))
      if (pinDiff !== 0) return pinDiff
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })
  }

  const loadData = async () => {
    setLoading(true)
    const [fetchedNotes, fetchedCats] = await Promise.all([
      plannerService.fetchNotes(),
      plannerService.fetchCategories('note'),
    ])
    setNotes(sortNotesList(fetchedNotes))
    setCategories(fetchedCats)
    setLoading(false)
  }

  // 노트 저장 (추가 / 수정)
  const handleSaveNote = async (
    title: string,
    category: string,
    content: string,
    id?: string,
    isPinned?: boolean
  ) => {
    if (id) {
      const updated = await plannerService.updateNote(id, title, category, content, isPinned)
      if (updated) {
        setNotes((prev) => sortNotesList(prev.map((n) => (n.id === id ? updated : n))))
        setEditingNote(updated)
      } else {
        alert('노트 수정 실패: Supabase DB 연결 및 테이블 상태를 확인하세요.')
      }
    } else {
      const created = await plannerService.addNote(title, category, content, Boolean(isPinned))
      if (created) {
        setNotes((prev) => sortNotesList([created, ...prev]))
      } else {
        alert('노트 저장 실패: Supabase DB 연결 및 테이블 상태를 확인하세요.')
      }
    }
  }

  // 상단 고정 토글
  const handleTogglePin = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    const currentPinned = Boolean(note.is_pinned)
    const success = await plannerService.toggleNotePin(note.id, currentPinned)
    if (success) {
      setNotes((prev) =>
        sortNotesList(
          prev.map((n) => (n.id === note.id ? { ...n, is_pinned: !currentPinned } : n))
        )
      )
    }
  }

  // 노트 내용을 할 일(Todo) 수집함으로 바로 추가
  const handleSendLineToTodo = async (taskTitle: string) => {
    await plannerService.addTodo(taskTitle, '', [], null, null, null)
  }

  // 노트 삭제
  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('이 노트를 삭제하시겠습니까?')) return
    const success = await plannerService.deleteNote(id)
    if (success) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } else {
      alert('노트 삭제에 실패했습니다.')
    }
  }

  // 카테고리 CRUD
  const handleAddCategory = async (name: string) => {
    const created = await plannerService.addCategory(name, 'note')
    if (created) setCategories([...categories, created])
  }

  const handleUpdateCategory = async (cat: Category, newName: string) => {
    const success = await plannerService.updateCategory(cat.id, newName)
    if (success) {
      setNotes((prev) =>
        prev.map((n) => (n.category === cat.name ? { ...n, category: newName } : n))
      )
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, name: newName } : c))
      )
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) return
    const success = await plannerService.deleteCategory(cat.id)
    if (success) {
      setNotes((prev) =>
        prev.map((n) => (n.category === cat.name ? { ...n, category: '' } : n))
      )
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    }
  }

  // 필터링된 노트 목록
  const filteredNotes = notes.filter((note) => {
    const matchesCategory =
      selectedCategory === 'all' || note.category === selectedCategory
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      note.title.toLowerCase().includes(query) ||
      (note.content && note.content.toLowerCase().includes(query))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 pb-32">
      {/* 헤더 */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-500" /> 노트 보관함
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            노트 카드를 클릭하면 전체 내용을 크게 보고 체크리스트를 관리할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatManageModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-500" /> 카테고리 관리
          </button>
        </div>
      </header>

      {/* 검색 및 카테고리 필터 바 */}
      <section className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="노트 제목 또는 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-9 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            전체 ({notes.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 노트 카드 목록 */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-16">노트를 불러오는 중...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              등록된 노트가 없습니다.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              우측 하단 '+' 버튼을 눌러 첫 노트를 작성해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setEditingNote(note)
                  setModalInitialMode('preview')
                  setIsNoteModalOpen(true)
                }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition flex flex-col justify-between h-64 cursor-pointer ${
                  note.is_pinned
                    ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-200/60 dark:ring-amber-900/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-1 flex items-center gap-1.5">
                      {note.is_pinned && (
                        <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                      <span className="truncate">{note.title}</span>
                    </h3>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {note.category && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-lg">
                          {note.category}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(e, note)}
                        title={note.is_pinned ? '상단 고정 해제' : '상단에 고정'}
                        className={`p-1 rounded-lg transition cursor-pointer ${
                          note.is_pinned
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-6 whitespace-pre-wrap leading-relaxed">
                    {note.content || '내용이 없습니다.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                  <span className="text-[10px] font-mono text-slate-400">
                    {note.created_at
                      ? new Date(note.created_at).toLocaleDateString('ko-KR')
                      : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingNote(note)
                        setModalInitialMode('edit')
                        setIsNoteModalOpen(true)
                      }}
                      title="바로 편집"
                      className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      title="삭제"
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 플로팅 추가 버튼 */}
      <button
        onClick={() => {
          setEditingNote(null)
          setModalInitialMode('edit')
          setIsNoteModalOpen(true)
        }}
        className="fixed bottom-20 right-8 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        title="새 노트 작성"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* 노트 작성/수정/보기 모달 */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false)
          setEditingNote(null)
        }}
        categories={categories}
        initialNote={editingNote}
        initialMode={modalInitialMode}
        onSubmit={handleSaveNote}
        onSendToTodo={handleSendLineToTodo}
      />

      {/* 카테고리 관리 모달 */}
      <CategoryManageModal
        isOpen={isCatManageModalOpen}
        onClose={() => setIsCatManageModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <NavigationDock activeTab="notes" />
    </div>
  )
}