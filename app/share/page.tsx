'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  FolderUp,
  Send,
  Upload,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  Search,
  X,
  File,
} from 'lucide-react'
import { SharedItem } from '@/types'
import * as plannerService from '@/services/plannerService'
import NavigationDock from '@/components/NavigationDock'

export default function SharePage() {
  const [items, setItems] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)

  // 텍스트 입력 상태
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [isSendingText, setIsSendingText] = useState(false)

  // 파일 업로드 상태
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // 필터 & 검색 & UI 상태
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'pdf'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    const fetched = await plannerService.fetchSharedItems()
    setItems(fetched)
    setLoading(false)
  }

  // 텍스트 / 링크 전송
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!textContent.trim() || isSendingText) return

    setIsSendingText(true)
    const created = await plannerService.addSharedText(textContent, textTitle)
    if (created) {
      setItems((prev) => [created, ...prev])
      setTextTitle('')
      setTextContent('')
    }
    setIsSendingText(false)
  }

  // 파일 업로드 처리 (다중 파일 지원)
  const handleFilesUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (files.length === 0) return

    setIsUploadingFile(true)
    for (const file of files) {
      const created = await plannerService.uploadSharedFile(file)
      if (created) {
        setItems((prev) => [created, ...prev])
      }
    }
    setIsUploadingFile(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Ctrl+V 클립보드 이미지 바로 붙여넣기 업로드
  const handlePaste = async (e: React.ClipboardEvent) => {
    const clipboardFiles = e.clipboardData?.files
    if (clipboardFiles && clipboardFiles.length > 0) {
      e.preventDefault()
      await handleFilesUpload(clipboardFiles)
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesUpload(e.dataTransfer.files)
    }
  }

  // 텍스트 복사
  const handleCopyText = async (item: SharedItem) => {
    if (!item.content) return
    try {
      await navigator.clipboard.writeText(item.content)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 2000)
    } catch {
      alert('복사에 실패했습니다.')
    }
  }

  // 파일 다운로드
  const handleDownloadFile = async (item: SharedItem) => {
    if (!item.file_url) return
    try {
      const response = await fetch(item.file_url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = item.title || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(item.file_url, '_blank')
    }
  }

  // 항목 삭제
  const handleDeleteItem = async (item: SharedItem) => {
    if (!confirm('이 자료를 삭제하시겠습니까?')) return
    const success = await plannerService.deleteSharedItem(item)
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    }
  }

  // 파일 크기 포맷
  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // URL 자동 링크 렌더링
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline break-all hover:text-indigo-700"
          >
            {part}
          </a>
        )
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>
    })
  }

  // 필터링
  const filteredItems = items.filter((item) => {
    const matchesType =
      filterType === 'all' ||
      (filterType === 'pdf'
        ? item.type === 'pdf' || item.type === 'file'
        : item.type === filterType)

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q))

    return matchesType && matchesSearch
  })

  return (
    <div
      onPaste={handlePaste}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 pb-32"
    >
      {/* 헤더 */}
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <FolderUp className="w-6 h-6 text-indigo-500" /> 기기 간 자료 공유함
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          PC, 태블릿, 스마트폰 어디서든 텍스트·링크·이미지·PDF를 올리고 바로 내려받으세요. (이미지 붙여넣기 Ctrl+V 지원)
        </p>
      </header>

      {/* 상단 전송 패널 (텍스트 전송 + 파일 업로드) */}
      <section className="max-w-7xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 좌측: 텍스트 & 링크 빠른 전송 */}
        <form
          onSubmit={handleSendText}
          className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" /> 텍스트 / 링크 보내기
            </span>
            <input
              type="text"
              placeholder="제목 (선택)"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              className="input input-xs w-44 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <textarea
            rows={3}
            placeholder="다른 기기로 보낼 텍스트나 URL 주소를 붙여넣으세요... (Ctrl + Enter로 즉시 전송)"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleSendText()
              }
            }}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!textContent.trim() || isSendingText}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSendingText ? '전송 중...' : '텍스트 전송'}
            </button>
          </div>
        </form>

        {/* 우측: PDF / 이미지 / 파일 업로드 영역 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-5 rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {isUploadingFile ? '파일 업로드 중...' : 'PDF · 이미지 파일 올리기'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            클릭하여 파일 선택, 드래그 앤 드롭, 또는 스크린샷 붙여넣기(Ctrl+V)
          </p>
        </div>
      </section>

      {/* 필터 및 검색 바 */}
      <section className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `전체 (${items.length})` },
            { id: 'text', label: '텍스트/링크' },
            { id: 'image', label: '이미지' },
            { id: 'pdf', label: 'PDF/파일' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="파일명 또는 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-9 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </section>

      {/* 공유 자료 목록 */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-16">자료를 불러오는 중...</p>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <FolderUp className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              공유된 자료가 없습니다.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              위 입력창에서 텍스트를 전송하거나 PDF·이미지를 올려보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between gap-3"
              >
                {/* 카드 상단 타입 뱃지 & 삭제 버튼 */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                        item.type === 'text'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : item.type === 'image'
                            ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.type === 'text' && <FileText className="w-3 h-3" />}
                      {item.type === 'image' && <ImageIcon className="w-3 h-3" />}
                      {(item.type === 'pdf' || item.type === 'file') && <File className="w-3 h-3" />}
                      {item.type === 'text'
                        ? '텍스트'
                        : item.type === 'image'
                          ? '이미지'
                          : item.type === 'pdf'
                            ? 'PDF'
                            : '파일'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString('ko-KR', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        title="삭제"
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 타입별 본문 영역 */}
                  {item.type === 'text' && (
                    <div className="space-y-1.5">
                      {item.title && (
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {item.title}
                        </h3>
                      )}
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl max-h-40 overflow-y-auto leading-relaxed">
                        {item.content ? renderTextWithLinks(item.content) : ''}
                      </p>
                    </div>
                  )}

                  {item.type === 'image' && item.file_url && (
                    <div className="space-y-2">
                      <div
                        onClick={() => setPreviewImageUrl(item.file_url!)}
                        className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 cursor-zoom-in group"
                      >
                        <img
                          src={item.file_url}
                          alt={item.title || '공유 이미지'}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate font-medium">{item.title}</span>
                        <span className="font-mono shrink-0 ml-2">
                          {formatBytes(item.file_size)}
                        </span>
                      </div>
                    </div>
                  )}

                  {(item.type === 'pdf' || item.type === 'file') && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {formatBytes(item.file_size)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 카드 하단 액션 버튼 */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {item.type === 'text' ? (
                    <button
                      type="button"
                      onClick={() => handleCopyText(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>텍스트 복사</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      {item.file_url && (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>열기</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>다운로드</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 이미지 크게 보기 모달 */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImageUrl}
            alt="확대 이미지"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}

      <NavigationDock activeTab="share" />
    </div>
  )
}