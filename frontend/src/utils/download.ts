import type {
  GeneratedRow,
  MatchItem,
} from '@/types/reducer'

function createFilename(
  extension: 'csv' | 'txt',
): string {
  const now = new Date()

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return `reduced-system-${date}.${extension}`
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], {
    type: mimeType,
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export function downloadRowsAsCsv(
  matches: MatchItem[],
  rows: GeneratedRow[],
): void {
  if (rows.length === 0) {
    throw new Error(
      'There are no generated rows to download.',
    )
  }

  const header = matches
    .map((_, index) => `Match ${index + 1}`)
    .join(',')

  const body = rows
    .map((row) => row.outcomes.join(','))
    .join('\n')

  const content = `\uFEFF${header}\n${body}`

  downloadFile(
    content,
    createFilename('csv'),
    'text/csv;charset=utf-8',
  )
}

export function downloadRowsAsText(
  rows: GeneratedRow[],
): void {
  if (rows.length === 0) {
    throw new Error(
      'There are no generated rows to download.',
    )
  }

  const content = rows
    .map((row) => {
      return row.outcomes.join(';')
    })
    .join('\n')

  downloadFile(
    content,
    createFilename('txt'),
    'text/plain;charset=utf-8',
  )
}