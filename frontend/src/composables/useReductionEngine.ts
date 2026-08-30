import { computed, type Ref } from 'vue'

import type {
  GeneratedRow,
  MatchItem,
  Outcome,
  ReductionSettings,
} from '@/types/reducer'

const outcomes: Outcome[] = ['1', 'X', '2']

export function useReductionEngine(
  matches: Ref<MatchItem[]>,
  settings: ReductionSettings,
) {
  const mathematicalRowCount = computed(() => {
    if (matches.value.length === 0) {
      return 0
    }

    return matches.value.reduce((total, match) => {
      const selectedCount = outcomes.filter((outcome) => {
        return match.outcomes[outcome].selected
      }).length

      return total * selectedCount
    }, 1)
  })

  function generateReducedRows(): GeneratedRow[] {
    const allRows = generateAllRows()

    return allRows.filter((row) => {
      return (
        satisfiesOutcomeReduction(row) &&
        satisfiesColourReduction(row) &&
        satisfiesPointReduction(row)
      )
    })
  }

  function generateAllRows(): GeneratedRow[] {
    const rows: GeneratedRow[] = []
    const currentOutcomes: Outcome[] = []

    function generate(matchIndex: number): void {
      if (matchIndex === matches.value.length) {
        rows.push(
          createGeneratedRow([...currentOutcomes]),
        )

        return
      }

      const match = matches.value[matchIndex]

      if (!match) {
        return
      }

      for (const outcome of outcomes) {
        if (!match.outcomes[outcome].selected) {
          continue
        }

        currentOutcomes.push(outcome)

        generate(matchIndex + 1)

        currentOutcomes.pop()
      }
    }

    generate(0)

    return rows
  }

  function createGeneratedRow(
    rowOutcomes: Outcome[],
  ): GeneratedRow {
    let totalPoints = 0

    for (
      let matchIndex = 0;
      matchIndex < rowOutcomes.length;
      matchIndex++
    ) {
      const outcome = rowOutcomes[matchIndex]
      const match = matches.value[matchIndex]

      if (!outcome || !match) {
        continue
      }

      const configuration =
        match.outcomes[outcome]

      totalPoints += configuration.points ?? 0

    }

    return {
      outcomes: rowOutcomes,
      totalPoints,
    }
  }

  function satisfiesOutcomeReduction(
    row: GeneratedRow,
  ): boolean {
    for (const outcome of outcomes) {
      const range =
        settings.outcomeLimits[outcome]

      if (!range.enabled) {
        continue
      }

      const count = row.outcomes.filter(
        (currentOutcome) =>
          currentOutcome === outcome,
      ).length

      if (
        range.min !== null &&
        count < range.min
      ) {
        return false
      }

      if (
        range.max !== null &&
        count > range.max
      ) {
        return false
      }
    }

    return true
  }

  function satisfiesColourReduction(
    row: GeneratedRow,
  ): boolean {
    for (const colour of Object.values(
      settings.colours,
    )) {
      if (!colour.enabled) {
        continue
      }

      let hits = 0

      for (
        let matchIndex = 0;
        matchIndex < row.outcomes.length;
        matchIndex++
      ) {
        const outcome =
          row.outcomes[matchIndex]

        const match =
          matches.value[matchIndex]

        if (!outcome || !match) {
          continue
        }

        const configuration =
          match.outcomes[outcome]

        if (
          configuration.colours.includes(
            colour.id,
          )
        ) {
          hits++
        }
      }

      if (
        hits < colour.min ||
        hits > colour.max
      ) {
        return false
      }
    }

    return true
  }

  function satisfiesPointReduction(
    row: GeneratedRow,
  ): boolean {
    if (!settings.points.enabled) {
      return true
    }

    if (
      settings.points.min === null ||
      settings.points.max === null
    ) {
      return false
    }

    return (
      row.totalPoints >= settings.points.min &&
      row.totalPoints <= settings.points.max
    )
  }

  return {
    mathematicalRowCount,
    generateReducedRows,
  }
}