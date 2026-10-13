'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import { Plus, CheckSquare, Calendar as CalendarIcon, Download, Trash2, ChevronLeft, ChevronRight, Settings, X } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function Home() {
  // 날짜 상태
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // 카테고리 목록 상태
  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([
    { id: '1', name: '공부', color: 'blue' },
    { id: '2', name: '운동', color: 'emerald' },
    { id: '3', name: '일반', color: 'amber' },
  ])
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('indigo')
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)

  // 1. 할 일 백로그 상태
  const [todos, setTodos] = useState<any[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [category, setCategory] = useState('공부')
  const [loading, setLoading] = useState(true)

  // 2. 타임블록 상태
  const [timeBlocks, setTimeBlocks] = useState<any[]>([])
  const [selectedTodoId, setSelectedTodoId] = useState<string>('custom')
  const [blockTitle, setBlockTitle] = useState('')
  const [blockCategory, setBlockCategory] = useState('공부')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  // 3. 내보내기용 Ref
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  // 카테고리 불러오기
  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
    if (data && data.length > 0) {
      setCategories(data)
      setCategory(data[0].name)
      setBlockCategory(data[0].name)
    }
  }

  // 데이터 불러오기
  const fetchData = async () => {
    setLoading(true)
    const { data: todosData } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: blocksData } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('date', selectedDate)
      .order('start_time', { ascending: true })

    setTodos(todosData || [])
    setTimeBlocks(blocksData || [])
    setLoading(false)
  }

  // --- [카테고리 관리 기능] ---
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newCatName.trim(), color: newCatColor }])
      .select()

    if (error) {
      alert('이미 존재하는 카테고리이거나 오류가 발생했습니다.')
    } else if (data) {
      setCategories([...categories, data[0]])
      setNewCatName('')
    }
  }

  const deleteCategory = async (id: string, name: string) => {
    if (categories.length <= 1) {
      alert('최소 하나 이상의 카테고리가 필요합니다.')
      return
    }
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  // 색상 스타일에 따른 클래스 매핑
  const getColorClasses = (catName: string) => {
    const cat = categories.find(c => c.name === catName)
    const color = cat?.color || 'indigo'

    const colorMap: Record<string, { badge: string; block: string }> = {
      blue: {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        block: 'bg-blue-100 text-blue-900 border-blue-300',
      },
      emerald: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        block: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      },
      amber: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        block: 'bg-amber-100 text-amber-900 border-amber-300',
      },
      rose: {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        block: 'bg-rose-100 text-rose-900 border-rose-300',
      },
      purple: {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        block: 'bg-purple-100 text-purple-900 border-purple-300',
      },
      indigo: {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        block: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      },
    }

    return colorMap[color] || colorMap.indigo
  }

  const changeDate = (days: number) => {
    const curr = new Date(selectedDate)
    curr.setDate(curr.getDate() + days)
    setSelectedDate(curr.toISOString().split('T')[0])
  }

  // --- [할 일 백로그] ---
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: newTodo, category, completed: false }])
      .select()

    if (error) {
      alert('할 일 등록 중 오류가 발생했습니다.')
    } else if (data) {
      setTodos([...data, ...todos])
      setNewTodo('')
    }
  }

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !currentStatus })
      .eq('id', id)

    if (!error) {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentStatus } : t))
    }
  }

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (!error) {
      setTodos(todos.filter(t => t.id !== id))
    }
  }

  // --- [타임블록] ---
  const handleSelectTodo = (todoId: string) => {
    setSelectedTodoId(todoId)
    if (todoId === 'custom') {
      setBlockTitle('')
      setBlockCategory(categories[0]?.name || '공부')
    } else {
      const selected = todos.find(t => t.id === todoId)
      if (selected) {
        setBlockTitle(selected.title)
        setBlockCategory(selected.category || categories[0]?.name || '공부')
      }
    }
  }

  const addTimeBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockTitle.trim()) return

    const newBlock = {
      title: blockTitle,
      category: blockCategory,
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
    }

    const { data, error } = await supabase
      .from('time_blocks')
      .insert([newBlock])
      .select()

    if (error) {
      alert('타임블록 등록 중 오류가 발생했습니다.')
    } else if (data) {
      setTimeBlocks([...timeBlocks, ...data].sort((a, b) => a.start_time.localeCompare(b.start_time)))
      setBlockTitle('')
      setSelectedTodoId('custom')
    }
  }

  const deleteTimeBlock = async (id: string) => {
    const { error } = await supabase.from('time_blocks').delete().eq('id', id)
    if (!error) {
      setTimeBlocks(timeBlocks.filter(b => b.id !== id))
    }
  }

  // --- [이미지 내보내기] ---
  const exportAsImage = async () => {
    if (!dashboardRef.current) return
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2 })
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `대시보드_${selectedDate}.png`
      link.click()
    } catch (err) {
      alert('이미지 저장 중 오류가 발생했습니다.')
    }
  }

  const hours = Array.from({ length: 18 }, (_, i) => {
    const h = i + 6
    return h < 10 ? `0${h}:00` : `${h}:00`
  })

  const activeTodos = todos.filter(t => !t.completed)
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div ref={dashboardRef} className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 relative">
      {/* 상단 헤더 */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">생산성 & 타임블로킹 대시보드</h1>
          <p className="text-sm text-slate-500 mt-1">맞춤 카테고리 기반 개인 플래너</p>
        </div>

        {/* 날짜 선택 컨트롤러 */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => changeDate(-1)}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 px-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition ml-1"
            >
              오늘
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
          >
            <Settings className="w-4 h-4" /> 카테고리 관리
          </button>

          <button
            onClick={exportAsImage}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
          >
            <Download className="w-4 h-4" /> 이미지로 내보내기
          </button>
        </div>
      </header>

      {/* 메인 레이아웃 (2열) */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* 1. 할 일 백로그 (4컬럼) */}
        <section className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[750px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold">할 일 백로그</h2>
            </div>
          </div>

          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="새 할 일 입력..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition">
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-8">불러오는 중...</p>
            ) : todos.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">등록된 할 일이 없습니다.</p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id, todo.completed)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                    <span className={`text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {todo.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 border rounded-lg font-medium ${getColorClasses(todo.category).badge}`}>
                      {todo.category}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. 타임블록 일정표 (7컬럼) */}
        <section className="md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[750px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold">타임블록 일정표</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">선택일: {selectedDate}</span>
          </div>

          {/* 타임블록 생성 폼 */}
          <form onSubmit={addTimeBlock} className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex gap-2">
              <select
                value={selectedTodoId}
                onChange={(e) => handleSelectTodo(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium focus:outline-none"
              >
                <option value="custom">-- 백로그 선택 (또는 직접 입력) --</option>
                {activeTodos.map(todo => (
                  <option key={todo.id} value={todo.id}>
                    [{todo.category}] {todo.title}
                  </option>
                ))}
              </select>

              {selectedTodoId === 'custom' && (
                <>
                  <input
                    type="text"
                    placeholder="블록 제목 직접 입력..."
                    value={blockTitle}
                    onChange={(e) => setBlockTitle(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <select
                    value={blockCategory}
                    onChange={(e) => setBlockCategory(e.target.value)}
                    className="px-2 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-xs text-slate-500">시간:</span>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-xs text-slate-400">~</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>

              <button
                type="submit"
                className="ml-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
              >
                블록 등록
              </button>
            </div>
          </form>

          {/* 타임라인 영역 */}
          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl p-2 space-y-1 bg-slate-50/50">
            {hours.map((hour) => {
              const matchedBlocks = timeBlocks.filter(b => b.start_time <= hour && b.end_time > hour)
              return (
                <div key={hour} className="flex gap-3 text-xs min-h-[36px] items-center border-b border-slate-100 last:border-b-0 px-2 py-1">
                  <span className="w-12 text-slate-400 font-mono">{hour}</span>
                  <div className="flex-1 flex gap-2 flex-wrap">
                    {matchedBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md font-medium border ${getColorClasses(block.category).block}`}
                      >
                        <span>{block.title}</span>
                        <span className="text-[10px] opacity-75">({block.start_time}~{block.end_time})</span>
                        <button
                          onClick={() => deleteTimeBlock(block.id)}
                          className="opacity-60 hover:opacity-100 hover:text-red-600 ml-1 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </main>

      {/* 카테고리 관리 모달 (팝업) */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">카테고리 관리</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 신규 카테고리 추가 */}
            <form onSubmit={addCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="카테고리명..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
              />
              <select
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="px-2 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="blue">파랑 (Blue)</option>
                <option value="emerald">초록 (Emerald)</option>
                <option value="amber">주황 (Amber)</option>
                <option value="rose">빨강 (Rose)</option>
                <option value="purple">보라 (Purple)</option>
                <option value="indigo">남색 (Indigo)</option>
              </select>
              <button type="submit" className="px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl">
                추가
              </button>
            </form>

            {/* 카테고리 목록 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className={`px-2.5 py-1 rounded-lg border font-medium ${getColorClasses(c.name).badge}`}>
                    {c.name}
                  </span>
                  <button
                    onClick={() => deleteCategory(c.id, c.name)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}