import type {
  GeneratedRow,
  MatchItem,
  Outcome,
} from '@/types/reducer'

function escapeCsvValue(value: string): string {
  const escapedValue = value.replaceAll('"', '""')

  return `"${escapedValue}"`
}

function createMatchLabel(
  match: MatchItem,
  index: number,
): string {
  const homeTeam = match.homeTeam.trim()
  const awayTeam = match.awayTeam.trim()

  if (homeTeam && awayTeam) {
    return `${homeTeam} - ${awayTeam}`
  }

  if (homeTeam) {
    return homeTeam
  }

  if (awayTeam) {
    return awayTeam
  }

  return `Match ${index + 1}`
}

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

function formatNumber(
  value: number,
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
}

function outcomeAt(
  row: GeneratedRow,
  matchIndex: number,
): Outcome | '' {
  return row.outcomes[matchIndex] ?? ''
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

  const matchHeaders = matches.map((match, index) => {
    return escapeCsvValue(
      createMatchLabel(match, index),
    )
  })

  const header = [
    'Row',
    ...matchHeaders,
    'Total points',
    'Total odds',
  ].join(',')

  const body = rows
    .map((row, rowIndex) => {
      const outcomeValues = matches.map(
        (_, matchIndex) => {
          return escapeCsvValue(
            outcomeAt(row, matchIndex),
          )
        },
      )

      return [
        rowIndex + 1,
        ...outcomeValues,
        row.totalPoints,
        row.totalOdds.toFixed(2),
      ].join(',')
    })
    .join('\n')

  /*
   * The UTF-8 byte-order mark helps Excel recognise
   * Swedish characters correctly.
   */
  const content = `\uFEFF${header}\n${body}`

  downloadFile(
    content,
    createFilename('csv'),
    'text/csv;charset=utf-8',
  )
}

export function downloadRowsAsText(
  matches: MatchItem[],
  rows: GeneratedRow[],
): void {
  if (rows.length === 0) {
    throw new Error(
      'There are no generated rows to download.',
    )
  }

  const matchSection = matches
    .map((match, index) => {
      const label = createMatchLabel(match, index)

      return `${index + 1}. ${label}`
    })
    .join('\n')

  const rowSection = rows
    .map((row, rowIndex) => {
      const outcomes = row.outcomes.join(';')

      return [
        rowIndex + 1,
        outcomes,
        `points=${row.totalPoints}`,
        `odds=${formatNumber(row.totalOdds)}`,
      ].join(';')
    })
    .join('\n')

  const content = [
    'CUSTOM 1X2 REDUCED SYSTEM',
    '',
    `Matches: ${matches.length}`,
    `Rows: ${rows.length}`,
    '',
    'MATCHES',
    matchSection,
    '',
    'REDUCED ROWS',
    rowSection,
  ].join('\n')

  downloadFile(
    content,
    createFilename('txt'),
    'text/plain;charset=utf-8',
  )
}