'use client'

import React, { useState, useRef } from 'react'
import { X, Download, Upload, ShieldCheck, AlertTriangle, FileJson } from 'lucide-react'
import * as plannerService from '@/services/plannerService'

interface BackupModalProps {
  isOpen: boolean
  onClose: () => void
  onRestored?: () => void
}

export default function BackupModal({ isOpen, onClose, onRestored }: BackupModalProps) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // 📥 1. 전체 데이터 백업 (JSON 다운로드)
  const handleExport = async () => {
    try {
      setExporting(true)
      const backupData = await plannerService.exportAllData()

      if (!backupData) {
        alert('데이터를 내보내는 중 오류가 발생했습니다.')
        return
      }

      const jsonString = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const today = new Date().toISOString().split('T')[0]
      const link = document.createElement('a')
      link.href = url
      link.download = `planner_backup_${today}.json`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      alert('백업 파일 생성 중 오류가 발생했습니다.')
    } finally {
      setExporting(false)
    }
  }

  // 📤 2. 백업 파일 선택 및 복원 실행
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('경고: 복원 시 현재 데이터베이스의 모든 데이터가 백업 파일의 내용으로 덮어씌워집니다.\n정말 복원하시겠습니까?')) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      setImporting(true)
      const fileText = await file.text()
      const parsedData = JSON.parse(fileText)

      const success = await plannerService.importAllData(parsedData)

      if (success) {
        alert('데이터 복원이 완벽하게 완료되었습니다!')
        if (onRestored) {
          onRestored()
        } else {
          window.location.reload()
        }
        onClose()
      } else {
        alert('데이터 복원에 실패했습니다. 올바른 백업 JSON 파일인지 확인해 주세요.')
      }
    } catch (err) {
      console.error('Import error:', err)
      alert('파일을 읽는 중 오류가 발생했습니다. 올바른 JSON 형식 파일인지 확인해 주세요.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              전체 데이터 백업 & 복원
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              모든 데이터(할 일, 노트, 타임블록, 카테고리)를 백업합니다.
            </p>
          </div>
        </div>

        <div className="space-y-4 my-6">
          {/* 백업 내보내기 영역 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-indigo-500" /> 백업 파일 다운로드 (Export)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  현재 DB의 모든 데이터를 단일 `.json` 파일로 안전하게 컴퓨터에 보관합니다.
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {exporting ? '백업 파일 생성 중...' : '전체 데이터 백업 다운로드 (.json)'}
            </button>
          </div>

          {/* 복원 불러오기 영역 */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  백업 파일 복원 (Import)
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-0.5">
                  보관 중인 `.json` 파일로 DB 데이터를 복구합니다. (기존 데이터가 대체됩니다)
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {importing ? '데이터 복원 진행 중...' : '백업 파일 선택하여 복원하기'}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}