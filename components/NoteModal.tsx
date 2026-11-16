'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Pin,
  Heading1,
  Bold,
  List,
  CheckSquare,
  Minus,
  ListTodo,
  Eye,
  Pencil,
} from 'lucide-react'
import { Category, Note } from '@/types'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  initialNote: Note | null
  initialMode?: 'preview' | 'edit'
  onSubmit: (
    title: string,
    category: string,
    content: string,
    id?: string,
    isPinned?: boolean
  ) => Promise<void> | void
  onSendToTodo: (taskTitle: string) => Promise<void> | void
}

export default function NoteModal({
  isOpen,
  onClose,
  categories,
  initialNote,
  initialMode = 'preview',
  onSubmit,
  onSendToTodo,
}: NoteModalProps) {
  const [title, setTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)

  const [mode, setMode] = useState<'preview' | 'edit'>('edit')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isOpen) return

    if (initialNote) {
      setTitle(initialNote.title)
      setSelectedCategory(initialNote.category || '')
      setContent(initialNote.content || '')
      setIsPinned(Boolean(initialNote.is_pinned))
      setMode(initialMode)
    } else {
      setTitle('')
      setSelectedCategory('')
      setContent('')
      setIsPinned(false)
      setMode('edit')
    }
    setCopied(false)
    setToastMessage(null)
  }, [isOpen, initialNote, initialMode])

  if (!isOpen) return null

  const showFeedback = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 2200)
  }

  // 본문 원클릭 복사
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('클립보드 복사에 실패했습니다.')
    }
  }

  // 서식 & 체크리스트 툴바 삽입
  const insertSyntax = (type: 'heading' | 'bold' | 'list' | 'checklist' | 'divider') => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selectedText = content.slice(start, end)
    const before = content.slice(0, start)
    const after = content.slice(end)
    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n')

    let inserted = ''
    let cursorOffset = 0

    switch (type) {
      case 'heading': {
        const prefix = (needsLeadingNewline ? '\n' : '') + '# '
        inserted = prefix + (selectedText || '')
        cursorOffset = inserted.length
        break
      }
      case 'bold': {
        const target = selectedText || '굵은 텍스트'
        inserted = `**${target}**`
        cursorOffset = selectedText ? inserted.length : 2
        break
      }
      case 'list': {
        const prefix = (needsLeadingNewline ? '\n' : '') + '- '
        inserted = prefix + (selectedText || '')
        cursorOffset = inserted.length
        break
      }
      case 'checklist': {
        const prefix = (needsLeadingNewline ? '\n' : '') + '- [ ] '
        inserted = prefix + (selectedText || '')
        cursorOffset = inserted.length
        break
      }
      case 'divider': {
        inserted = (needsLeadingNewline ? '\n' : '') + '---\n'
        cursorOffset = inserted.length
        break
      }
    }

    const nextContent = before + inserted + after
    setContent(nextContent)

    requestAnimationFrame(() => {
      el.focus()
      const nextPos = start + cursorOffset
      el.setSelectionRange(nextPos, nextPos)
    })
  }

  // 편집 모드에서 선택한 텍스트 또는 현재 줄을 할 일(Todo)로 바로 전송
  const handleSendEditorSelectionToTodo = async () => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    let targetText = content.slice(start, end).trim()

    if (!targetText) {
      const lineStart = content.lastIndexOf('\n', start - 1) + 1
      const rawLineEnd = content.indexOf('\n', start)
      const lineEnd = rawLineEnd === -1 ? content.length : rawLineEnd
      targetText = content.slice(lineStart, lineEnd).trim()
    }

    const cleaned = cleanMarkdownPrefix(targetText)
    if (!cleaned || cleaned === '---') {
      alert('할 일로 보낼 문장을 선택하거나 해당 줄에 커서를 두세요.')
      return
    }

    await onSendToTodo(cleaned)
    showFeedback(`'${cleaned}' 항목을 할 일 수집함으로 보냈습니다.`)
  }

  const cleanMarkdownPrefix = (line: string) => {
    return line
      .replace(/^- \[[ xX]\]\s*/, '')
      .replace(/^[-*]\s+/, '')
      .replace(/^#{1,3}\s+/, '')
      .replace(/\*\*/g, '')
      .trim()
  }

  // 읽기 모드에서 체크리스트 클릭 시 즉시 상태 반전 및 자동 저장
  const handleToggleChecklistLine = async (lineIndex: number) => {
    const lines = content.split('\n')
    const line = lines[lineIndex]
    if (!line) return

    if (/^- \[ \]/.test(line)) {
      lines[lineIndex] = line.replace(/^- \[ \]/, '- [x]')
    } else if (/^- \[[xX]\]/.test(line)) {
      lines[lineIndex] = line.replace(/^- \[[xX]\]/, '- [ ]')
    } else {
      return
    }

    const nextContent = lines.join('\n')
    setContent(nextContent)

    if (initialNote) {
      await onSubmit(title.trim() || initialNote.title, selectedCategory, nextContent, initialNote.id, isPinned)
    }
  }

  // **굵은 글씨** 안전 렌더링
  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return <React.Fragment key={i}>{part}</React.Fragment>
    })
  }

  // 읽기 모드 본문 렌더링
  const renderPreviewContent = () => {
    if (!content.trim()) {
      return <p className="text-sm text-slate-400">내용이 없습니다. 상단 '편집' 버튼을 눌러 작성해 보세요.</p>
    }

    const lines = content.split('\n')
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          const trimmed = line.trim()

          if (trimmed === '') {
            return <div key={idx} className="h-3" />
          }

          if (trimmed === '---') {
            return <hr key={idx} className="my-4 border-slate-200 dark:border-slate-800" />
          }

          // 체크리스트 (- [ ] 또는 - [x])
          const checkMatch = line.match(/^- \[([ xX])\]\s*(.*)$/)
          if (checkMatch) {
            const isChecked = checkMatch[1].toLowerCase() === 'x'
            const itemText = checkMatch[2]
            return (
              <div
                key={idx}
                className="group flex items-start justify-between gap-2 py-1 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleChecklistLine(idx)}
                    className="checkbox checkbox-xs checkbox-primary mt-1 cursor-pointer"
                  />
                  <span
                    className={`text-sm leading-relaxed break-words ${
                      isChecked
                        ? 'line-through text-slate-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {renderInlineBold(itemText)}
                  </span>
                </label>

                {itemText.trim() && (
                  <button
                    type="button"
                    onClick={async () => {
                      const clean = cleanMarkdownPrefix(itemText)
                      await onSendToTodo(clean)
                      showFeedback(`'${clean}' 항목을 할 일로 보냈습니다.`)
                    }}
                    title="할 일 목록으로 보내기"
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg flex items-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>할 일로</span>
                  </button>
                )}
              </div>
            )
          }

          // 제목 (#, ##, ###)
          const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)
          if (headingMatch) {
            const level = headingMatch[1].length
            const headingText = headingMatch[2]
            const headingClass =
              level === 1
                ? 'text-xl font-bold mt-4 mb-1 text-slate-900 dark:text-white'
                : level === 2
                  ? 'text-lg font-bold mt-3 mb-1 text-slate-800 dark:text-slate-100'
                  : 'text-base font-bold mt-2 mb-1 text-slate-800 dark:text-slate-100'

            return (
              <div
                key={idx}
                className="group flex items-center justify-between gap-2 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className={headingClass}>{renderInlineBold(headingText)}</div>
                {headingText.trim() && (
                  <button
                    type="button"
                    onClick={async () => {
                      const clean = cleanMarkdownPrefix(headingText)
                      await onSendToTodo(clean)
                      showFeedback(`'${clean}' 항목을 할 일로 보냈습니다.`)
                    }}
                    title="할 일 목록으로 보내기"
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg flex items-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>할 일로</span>
                  </button>
                )}
              </div>
            )
          }

          // 일반 불릿 목록 (- 또는 *)
          const bulletMatch = line.match(/^[-*]\s+(.*)$/)
          if (bulletMatch) {
            const bulletText = bulletMatch[1]
            return (
              <div
                key={idx}
                className="group flex items-start justify-between gap-2 py-0.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed flex-1 min-w-0">
                  <span className="text-indigo-500 font-bold mt-0.5">•</span>
                  <span className="break-words">{renderInlineBold(bulletText)}</span>
                </div>
                {bulletText.trim() && (
                  <button
                    type="button"
                    onClick={async () => {
                      const clean = cleanMarkdownPrefix(bulletText)
                      await onSendToTodo(clean)
                      showFeedback(`'${clean}' 항목을 할 일로 보냈습니다.`)
                    }}
                    title="할 일 목록으로 보내기"
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg flex items-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>할 일로</span>
                  </button>
                )}
              </div>
            )
          }

          // 일반 텍스트 줄
          return (
            <div
              key={idx}
              className="group flex items-start justify-between gap-2 py-0.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
            >
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words flex-1 min-w-0">
                {renderInlineBold(line)}
              </p>
              <button
                type="button"
                onClick={async () => {
                  const clean = cleanMarkdownPrefix(line)
                  await onSendToTodo(clean)
                  showFeedback(`'${clean}' 항목을 할 일로 보냈습니다.`)
                }}
                title="할 일 목록으로 보내기"
                className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg flex items-center gap-1 shrink-0 transition cursor-pointer"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>할 일로</span>
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await onSubmit(title.trim(), selectedCategory, content, initialNote?.id, isPinned)
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-3 sm:p-6'
      }`}
    >
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all ${
          isFullscreen
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-3xl max-h-[90vh] rounded-3xl'
        }`}
      >
        {/* 상단 컨트롤 바 */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 sm:px-7 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {/* 읽기 / 편집 모드 전환 탭 */}
            {initialNote && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    mode === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  보기
                </button>
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    mode === 'edit'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  편집
                </button>
              </div>
            )}
            {!initialNote && (
              <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                새 노트 작성
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* 상단 고정 토글 */}
            <button
              type="button"
              onClick={() => setIsPinned((prev) => !prev)}
              title={isPinned ? '상단 고정 해제' : '목록 상단에 고정'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isPinned
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-700'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isPinned ? '고정됨' : '고정'}</span>
            </button>

            {/* 원클릭 본문 복사 */}
            <button
              type="button"
              onClick={handleCopyContent}
              title="본문 전체 복사"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">복사</span>
                </>
              )}
            </button>

            {/* 전체 화면(크게 보기) 전환 */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? '기본 크기로 축소' : '전체 화면으로 크게 보기'}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 닫기 */}
            <button
              type="button"
              onClick={onClose}
              title="닫기"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 알림 토스트 (할 일 전송 완료 시 표시) */}
        {toastMessage && (
          <div className="mx-5 sm:mx-7 mt-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 본문 영역: 보기 모드 vs 편집 모드 */}
        {mode === 'preview' ? (
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-5">
            <div>
              {selectedCategory && (
                <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 mb-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-lg">
                  {selectedCategory}
                </span>
              )}
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {title}
              </h2>
              {initialNote?.created_at && (
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  작성일: {new Date(initialNote.created_at).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              {renderPreviewContent()}
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4 flex flex-col">
              {/* 제목 & 카테고리 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="노트 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                    className="input h-11 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="select h-11 w-full bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl text-xs px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    <option value="">카테고리 없음</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 서식 & 체크리스트 & 할 일 전송 툴바 */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertSyntax('heading')}
                    title="제목 삽입 (#)"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Heading1 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>제목</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSyntax('bold')}
                    title="굵게 (**텍스트**)"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Bold className="w-3.5 h-3.5 text-indigo-500" />
                    <span>굵게</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSyntax('list')}
                    title="목록 (- )"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5 text-indigo-500" />
                    <span>목록</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSyntax('checklist')}
                    title="체크리스트 (- [ ])"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>체크박스</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSyntax('divider')}
                    title="구분선 (---)"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 text-indigo-500" />
                    <span>구분선</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendEditorSelectionToTodo}
                  title="드래그한 문장 또는 현재 줄을 할 일 수집함으로 보냅니다"
                  className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>선택/현재 줄 할 일로 보내기</span>
                </button>
              </div>

              {/* 본문 입력창 */}
              <textarea
                ref={textareaRef}
                placeholder="내용을 자유롭게 작성하세요. 상단 툴바로 제목, 굵게, 체크박스를 쉽게 넣을 수 있습니다."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm p-4 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition ${
                  isFullscreen ? 'min-h-[55vh]' : 'min-h-[260px]'
                }`}
              />
            </div>

            {/* 하단 저장/취소 바 */}
            <div className="flex justify-end gap-2.5 px-5 sm:px-7 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="btn h-11 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                취소
              </button>
              <button
                type="submit"
                className="btn h-11 px-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
              >
                {initialNote ? '수정 저장' : '노트 저장'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}