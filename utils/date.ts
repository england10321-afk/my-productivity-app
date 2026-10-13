export interface DDayInfo {
  text: string
  status: 'OVERDUE' | 'TODAY' | 'URGENT' | 'NORMAL' | 'FAR'
  diffDays: number
}

export function calculateDDay(dueDateStr: string | null | undefined): DDayInfo | null {
  if (!dueDateStr) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(dueDateStr)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: `마감 지남 (D+${Math.abs(diffDays)})`,
      status: 'OVERDUE',
      diffDays,
    }
  }

  if (diffDays === 0) {
    return { text: 'D-Day', status: 'TODAY', diffDays }
  }

  if (diffDays <= 3) {
    return { text: `D-${diffDays}`, status: 'URGENT', diffDays }
  }

  if (diffDays <= 30) {
    return { text: `D-${diffDays}`, status: 'NORMAL', diffDays }
  }

  return { text: `${dueDateStr}까지`, status: 'FAR', diffDays }
}