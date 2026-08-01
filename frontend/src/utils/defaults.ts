import type {
  ColourReductions,
  MatchItem,
  MatchOutcomes,
  Outcome,
  ReductionSettings,
} from '@/types/reducer'

function createOutcomeConfiguration(
  outcome: Outcome,
  selected: boolean,
) {
  return {
    outcome,
    selected,
    odds: null,
    percentage: null,
    points: null,
    colours: [],
  }
}

export function createDefaultOutcomes(): MatchOutcomes {
  return {
    '1': createOutcomeConfiguration('1', true),
    X: createOutcomeConfiguration('X', false),
    '2': createOutcomeConfiguration('2', false),
  }
}

export function createEmptyMatch(): MatchItem {
  return {
    id: crypto.randomUUID(),
    homeTeam: '',
    awayTeam: '',
    startTime: '',
    outcomes: createDefaultOutcomes(),
  }
}

function createDefaultColours(): ColourReductions {
  return {
    blue: {
      id: 'blue',
      name: 'Blue',
      enabled: false,
      min: 0,
      max: 0,
    },

    yellow: {
      id: 'yellow',
      name: 'Yellow',
      enabled: false,
      min: 0,
      max: 0,
    },

    red: {
      id: 'red',
      name: 'Red',
      enabled: false,
      min: 0,
      max: 0,
    },

    green: {
      id: 'green',
      name: 'Green',
      enabled: false,
      min: 0,
      max: 0,
    },
  }
}

export function createDefaultReductionSettings(
  matchCount = 1,
): ReductionSettings {
  return {
    outcomeLimits: {
      '1': {
        enabled: false,
        min: 0,
        max: matchCount,
      },

      X: {
        enabled: false,
        min: 0,
        max: matchCount,
      },

      '2': {
        enabled: false,
        min: 0,
        max: matchCount,
      },
    },

    colours: createDefaultColours(),

    points: {
      enabled: false,
      min: null,
      max: null,
    },

    totalOdds: {
      enabled: false,
      min: null,
      max: null,
    },
  }
}