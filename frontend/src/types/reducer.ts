export type Outcome = '1' | 'X' | '2'

export type ColourId =
  | 'blue'
  | 'yellow'
  | 'red'
  | 'green'

export interface NumericRange {
  enabled: boolean
  min: number | null
  max: number | null
}

export interface OutcomeConfiguration {
  outcome: Outcome
  selected: boolean

  /**
   * Decimal odds entered manually by the user.
   * Example: 2.35
   */
  odds: number | null

  /**
   * Optional percentage entered manually.
   * Example: 45 means 45%.
   */
  percentage: number | null

  /**
   * Points used by point reduction.
   */
  points: number | null

  /**
   * One outcome can belong to several colour groups.
   */
  colours: ColourId[]
}

export type MatchOutcomes = Record<
  Outcome,
  OutcomeConfiguration
>

export interface MatchItem {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string
  outcomes: MatchOutcomes
}

export interface ColourReduction {
  id: ColourId
  name: string
  enabled: boolean
  min: number
  max: number
}

export type ColourReductions = Record<
  ColourId,
  ColourReduction
>

export interface OutcomeReductionLimits {
  '1': NumericRange
  X: NumericRange
  '2': NumericRange
}

export interface ReductionSettings {
  outcomeLimits: OutcomeReductionLimits
  colours: ColourReductions
  points: NumericRange
}

export interface GeneratedRow {
  outcomes: Outcome[]
  totalPoints: number
}

export interface OutcomeDistribution {
  matchId: string
  matchIndex: number
  percentages: Record<Outcome, number>
}