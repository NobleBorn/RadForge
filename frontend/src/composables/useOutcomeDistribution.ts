import { computed, type Ref } from 'vue'

import type {
  GeneratedRow,
  MatchItem,
  Outcome,
  OutcomeDistribution,
} from '@/types/reducer'

export function useOutcomeDistribution(
  matches: Ref<MatchItem[]>,
  rows: Ref<GeneratedRow[]>,
) {
  const distributions = computed<OutcomeDistribution[]>(() => {
    return matches.value.map((match, matchIndex) => {
      const counts: Record<Outcome, number> = {
        '1': 0,
        X: 0,
        '2': 0,
      }

      for (const row of rows.value) {
        const outcome = row.outcomes[matchIndex]

        if (outcome) {
          counts[outcome]++
        }
      }

      const rowCount = rows.value.length

      const percentages: Record<Outcome, number> = {
        '1': calculatePercentage(counts['1'], rowCount),
        X: calculatePercentage(counts.X, rowCount),
        '2': calculatePercentage(counts['2'], rowCount),
      }

      return {
        matchId: match.id,
        matchIndex,
        percentages,
      }
    })
  })

  function distributionForMatch(
    matchId: string,
  ): OutcomeDistribution | undefined {
    return distributions.value.find((distribution) => {
      return distribution.matchId === matchId
    })
  }

  function percentageForOutcome(
    matchId: string,
    outcome: Outcome,
  ): number {
    return (
      distributionForMatch(matchId)
        ?.percentages[outcome] ?? 0
    )
  }

  function totalOutcomeCount(outcome: Outcome): number {
    return rows.value.reduce((total, row) => {
      return total + row.outcomes.filter(
        (currentOutcome) => currentOutcome === outcome,
      ).length
    }, 0)
  }

  const overallPercentages = computed<
    Record<Outcome, number>
  >(() => {
    const totalSelections =
      rows.value.length * matches.value.length

    if (totalSelections === 0) {
      return {
        '1': 0,
        X: 0,
        '2': 0,
      }
    }

    return {
      '1': calculatePercentage(
        totalOutcomeCount('1'),
        totalSelections,
      ),

      X: calculatePercentage(
        totalOutcomeCount('X'),
        totalSelections,
      ),

      '2': calculatePercentage(
        totalOutcomeCount('2'),
        totalSelections,
      ),
    }
  })

  return {
    distributions,
    overallPercentages,
    distributionForMatch,
    percentageForOutcome,
  }
}

function calculatePercentage(
  count: number,
  total: number,
): number {
  if (total === 0) {
    return 0
  }

  const percentage = count / total * 100

  return Math.round(percentage * 10) / 10
}