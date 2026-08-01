import { computed, type Ref } from 'vue'

import type {
  ColourId,
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
  const mathematicalRowCount = computed<number>(() => {
    if (matches.value.length === 0) {
      return 0
    }

    return matches.value.reduce((total, match) => {
      const selectedOutcomeCount = outcomes.filter((outcome) => {
        return match.outcomes[outcome].selected
      }).length

      return total * selectedOutcomeCount
    }, 1)
  })

  function matchesAreValid(): boolean {
    return (
      matches.value.length > 0 &&
      matches.value.every((match) => {
        return outcomes.some((outcome) => {
          return match.outcomes[outcome].selected
        })
      })
    )
  }

  function settingsAreValid(): boolean {
    return (
      outcomeLimitsAreValid() &&
      colourLimitsAreValid() &&
      numericRangeIsValid(settings.points) &&
      numericRangeIsValid(settings.totalOdds)
    )
  }

  function outcomeLimitsAreValid(): boolean {
    const matchCount = matches.value.length

    return outcomes.every((outcome) => {
      const range = settings.outcomeLimits[outcome]

      if (!range.enabled) {
        return true
      }

      return (
        range.min !== null &&
        range.max !== null &&
        Number.isInteger(range.min) &&
        Number.isInteger(range.max) &&
        range.min >= 0 &&
        range.max <= matchCount &&
        range.min <= range.max
      )
    })
  }

  function colourLimitsAreValid(): boolean {
    const matchCount = matches.value.length

    return Object.values(settings.colours).every((colour) => {
      if (!colour.enabled) {
        return true
      }

      return (
        Number.isInteger(colour.min) &&
        Number.isInteger(colour.max) &&
        colour.min >= 0 &&
        colour.max <= matchCount &&
        colour.min <= colour.max
      )
    })
  }

  function numericRangeIsValid(range: {
    enabled: boolean
    min: number | null
    max: number | null
  }): boolean {
    if (!range.enabled) {
      return true
    }

    return (
      range.min !== null &&
      range.max !== null &&
      Number.isFinite(range.min) &&
      Number.isFinite(range.max) &&
      range.min >= 0 &&
      range.min <= range.max
    )
  }

  function generateReducedRows(): GeneratedRow[] {
    if (!matchesAreValid() || !settingsAreValid()) {
      return []
    }

    const rows: GeneratedRow[] = []
    const currentOutcomes: Outcome[] = []

    const outcomeCounts: Record<Outcome, number> = {
      '1': 0,
      X: 0,
      '2': 0,
    }

    const colourCounts: Record<ColourId, number> = {
      blue: 0,
      yellow: 0,
      red: 0,
      green: 0,
    }

    function generate(
      matchIndex: number,
      totalPoints: number,
      totalOdds: number,
      hasMissingOdds: boolean,
    ): void {
      if (
        exceedsOutcomeMaximums(outcomeCounts) ||
        cannotReachOutcomeMinimums(
          outcomeCounts,
          matches.value.length - matchIndex,
        ) ||
        exceedsColourMaximums(colourCounts) ||
        cannotReachColourMinimums(
          colourCounts,
          matches.value.length - matchIndex,
        ) ||
        exceedsPointMaximum(totalPoints) ||
        exceedsOddsMaximum(totalOdds, hasMissingOdds)
      ) {
        return
      }

      if (matchIndex === matches.value.length) {
        if (
          satisfiesOutcomeLimits(outcomeCounts) &&
          satisfiesColourLimits(colourCounts) &&
          satisfiesPointLimits(totalPoints) &&
          satisfiesOddsLimits(totalOdds, hasMissingOdds)
        ) {
          rows.push({
            outcomes: [...currentOutcomes],
            totalPoints,
            totalOdds,
          })
        }

        return
      }

      const match = matches.value[matchIndex]

      if (!match) {
        return
      }

      for (const outcome of outcomes) {
        const configuration = match.outcomes[outcome]

        if (!configuration.selected) {
          continue
        }

        currentOutcomes.push(outcome)
        outcomeCounts[outcome]++

        for (const colour of configuration.colours) {
          colourCounts[colour]++
        }

        const nextPoints =
          totalPoints + (configuration.points ?? 0)

        const oddsAreValid =
          configuration.odds !== null &&
          Number.isFinite(configuration.odds) &&
          configuration.odds > 0

        const nextMissingOdds =
          hasMissingOdds || !oddsAreValid

        const nextOdds = oddsAreValid
          ? totalOdds * configuration.odds!
          : totalOdds

        generate(
          matchIndex + 1,
          nextPoints,
          nextOdds,
          nextMissingOdds,
        )

        for (const colour of configuration.colours) {
          colourCounts[colour]--
        }

        outcomeCounts[outcome]--
        currentOutcomes.pop()
      }
    }

    generate(0, 0, 1, false)

    return rows
  }

  function exceedsOutcomeMaximums(
    counts: Record<Outcome, number>,
  ): boolean {
    return outcomes.some((outcome) => {
      const range = settings.outcomeLimits[outcome]

      return (
        range.enabled &&
        range.max !== null &&
        counts[outcome] > range.max
      )
    })
  }

  function cannotReachOutcomeMinimums(
    counts: Record<Outcome, number>,
    remainingMatches: number,
  ): boolean {
    return outcomes.some((outcome) => {
      const range = settings.outcomeLimits[outcome]

      return (
        range.enabled &&
        range.min !== null &&
        counts[outcome] + remainingMatches < range.min
      )
    })
  }

  function satisfiesOutcomeLimits(
    counts: Record<Outcome, number>,
  ): boolean {
    return outcomes.every((outcome) => {
      const range = settings.outcomeLimits[outcome]

      if (!range.enabled) {
        return true
      }

      return (
        range.min !== null &&
        range.max !== null &&
        counts[outcome] >= range.min &&
        counts[outcome] <= range.max
      )
    })
  }

  function exceedsColourMaximums(
    counts: Record<ColourId, number>,
  ): boolean {
    return Object.values(settings.colours).some((colour) => {
      return (
        colour.enabled &&
        counts[colour.id] > colour.max
      )
    })
  }

  function cannotReachColourMinimums(
    counts: Record<ColourId, number>,
    remainingMatches: number,
  ): boolean {
    return Object.values(settings.colours).some((colour) => {
      return (
        colour.enabled &&
        counts[colour.id] + remainingMatches < colour.min
      )
    })
  }

  function satisfiesColourLimits(
    counts: Record<ColourId, number>,
  ): boolean {
    return Object.values(settings.colours).every((colour) => {
      if (!colour.enabled) {
        return true
      }

      return (
        counts[colour.id] >= colour.min &&
        counts[colour.id] <= colour.max
      )
    })
  }

  function exceedsPointMaximum(
    totalPoints: number,
  ): boolean {
    return (
      settings.points.enabled &&
      settings.points.max !== null &&
      totalPoints > settings.points.max
    )
  }

  function satisfiesPointLimits(
    totalPoints: number,
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
      totalPoints >= settings.points.min &&
      totalPoints <= settings.points.max
    )
  }

  function exceedsOddsMaximum(
    totalOdds: number,
    hasMissingOdds: boolean,
  ): boolean {
    if (
      !settings.totalOdds.enabled ||
      hasMissingOdds ||
      settings.totalOdds.max === null
    ) {
      return false
    }

    return totalOdds > settings.totalOdds.max
  }

  function satisfiesOddsLimits(
    totalOdds: number,
    hasMissingOdds: boolean,
  ): boolean {
    if (!settings.totalOdds.enabled) {
      return true
    }

    if (
      hasMissingOdds ||
      settings.totalOdds.min === null ||
      settings.totalOdds.max === null
    ) {
      return false
    }

    return (
      totalOdds >= settings.totalOdds.min &&
      totalOdds <= settings.totalOdds.max
    )
  }

  return {
    mathematicalRowCount,
    generateReducedRows,
  }
}