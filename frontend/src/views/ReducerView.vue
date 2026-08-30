<script setup lang="ts">
import { reactive, ref } from 'vue'

import DistributionPanel from '@/components/reducer/analysis/DistributionPanel.vue'
import MatchList from '@/components/reducer/MatchList.vue'
import ReductionDashboard from '@/components/reducer/reductions/ReductionDashboard.vue'
import ResultBar from '@/components/reducer/ResultBar.vue'

import { useOutcomeDistribution } from '@/composables/useOutcomeDistribution'
import { useReductionEngine } from '@/composables/useReductionEngine'

import {
  downloadRowsAsCsv,
  downloadRowsAsText,
} from '@/utils/download'

import {
  createDefaultReductionSettings,
  createEmptyMatch,
} from '@/utils/defaults'

import type {
  ColourId,
  GeneratedRow,
  MatchItem,
  ReductionSettings,
} from '@/types/reducer'

const matches = ref<MatchItem[]>([
  createEmptyMatch(),
])

const settings = reactive<ReductionSettings>(
  createDefaultReductionSettings(matches.value.length),
)

const reducedRows = ref<GeneratedRow[]>([])

const activeColour = ref<ColourId | null>(null)

const {
  mathematicalRowCount,
  generateReducedRows,
} = useReductionEngine(matches, settings)

const {
  distributions,
  overallPercentages,
} = useOutcomeDistribution(
  matches,
  reducedRows,
)

function generateSystem(): void {
  reducedRows.value = generateReducedRows()
}

function downloadCsv(): void {
  if (reducedRows.value.length === 0) {
    return
  }

  downloadRowsAsCsv(
    matches.value,
    reducedRows.value,
  )
}

function downloadText(): void {
  if (reducedRows.value.length === 0) {
    return
  }

  downloadRowsAsText(
    reducedRows.value,
  )
}

function updateMatches(
  updatedMatches: MatchItem[],
): void {
  matches.value = updatedMatches

  normalizeSettingsToMatchCount(
    updatedMatches.length,
  )

  clearGeneratedRows()
}

function updateSettings(
  updatedSettings: ReductionSettings,
): void {
  settings.outcomeLimits = updatedSettings.outcomeLimits
  settings.colours = updatedSettings.colours
  settings.points = updatedSettings.points

  clearGeneratedRows()
}

function updateActiveColour(
  colour: ColourId | null,
): void {
  activeColour.value = colour
}

function clearGeneratedRows(): void {
  reducedRows.value = []
}

function normalizeSettingsToMatchCount(
  matchCount: number,
): void {
  const safeMatchCount = Math.max(matchCount, 0)

  for (const outcome of ['1', 'X', '2'] as const) {
    const range = settings.outcomeLimits[outcome]

    if (range.min !== null) {
      range.min = Math.min(
        range.min,
        safeMatchCount,
      )
    }

    if (range.max !== null) {
      range.max = Math.min(
        range.max,
        safeMatchCount,
      )
    }
  }

  for (const colour of Object.values(settings.colours)) {
    colour.min = Math.min(
      colour.min,
      safeMatchCount,
    )

    colour.max = Math.min(
      colour.max,
      safeMatchCount,
    )
  }
}

function resetSystem(): void {
  matches.value = [
    createEmptyMatch(),
  ]

  const defaultSettings =
    createDefaultReductionSettings(1)

  settings.outcomeLimits =
    defaultSettings.outcomeLimits

  settings.colours =
    defaultSettings.colours

  settings.points =
    defaultSettings.points

  activeColour.value = null
  reducedRows.value = []
}
</script>

<template>
  <main class="reducer-view">
    <header class="application-header">
      <div class="brand">
        <div class="brand-mark">
          RF
        </div>

        <div>
          <p class="brand-eyebrow">
            Reduced system generator
          </p>

          <h1>RadForge</h1>
        </div>
      </div>

      <div class="header-summary">
        <div class="summary-item">
          <span>Matches</span>

          <strong>
            {{ matches.length }}
          </strong>
        </div>

        <div class="summary-item">
          <span>Full system</span>

          <strong>
            {{ mathematicalRowCount }}
          </strong>
        </div>

        <div class="summary-item">
          <span>Reduced rows</span>

          <strong>
            {{ reducedRows.length }}
          </strong>
        </div>
      </div>
    </header>

    <section class="workspace">
      <section class="match-column">
        <MatchList
          :model-value="matches"
          :active-colour="activeColour"
          @update:model-value="updateMatches"
        />
      </section>

      <section class="control-column">
        <ReductionDashboard
          :model-value="settings"
          :active-colour="activeColour"
          :match-count="matches.length"
          @update:model-value="updateSettings"
          @update:active-colour="updateActiveColour"
        />

        <DistributionPanel
          :matches="matches"
          :distributions="distributions"
          :overall-percentages="overallPercentages"
          :has-generated-rows="reducedRows.length > 0"
        />
      </section>
    </section>

    <ResultBar
      :mathematical-row-count="mathematicalRowCount"
      :reduced-row-count="reducedRows.length"
      :has-generated="reducedRows.length > 0"
      @generate="generateSystem"
      @reset="resetSystem"
      @download-csv="downloadCsv"
      @download-text="downloadText"
    />
  </main>
</template>

<style scoped>
.reducer-view {
  min-height: 100vh;
  padding-bottom: 7rem;
  background:
    linear-gradient(
      180deg,
      #1e2e37 0,
      #1a2932 13rem,
      #21343d 100%
    );
  color: #eef7f8;
}

.application-header {
  position: sticky;
  z-index: 40;
  top: 0;
  display: flex;
  min-height: 4.5rem;
  padding: 0.75rem 1.2rem;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
  border-bottom: 1px solid #3b505b;
  background: rgb(31 47 56 / 94%);
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 12%);
  backdrop-filter: blur(14px);
}

.brand {
  display: flex;
  min-width: 0;
  gap: 0.75rem;
  align-items: center;
}

.brand-mark {
  display: grid;
  width: 2.6rem;
  height: 2.6rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #67ddca;
  border-radius: 0.5rem;
  background: #55dbc4;
  color: #17343a;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.03em;
}

.brand-eyebrow {
  margin: 0 0 0.1rem;
  color: #6fdccb;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.brand h1 {
  margin: 0;
  color: #ffffff;
  font-size: 1.15rem;
  line-height: 1.1;
}

.header-summary {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.summary-item {
  display: flex;
  min-width: 6.2rem;
  padding: 0.45rem 0.65rem;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #405762;
  border-radius: 0.45rem;
  background: #293c46;
}

.summary-item span {
  color: #8fa3ad;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
}

.summary-item strong {
  margin-top: 0.15rem;
  color: #ffffff;
  font-size: 0.9rem;
}

.workspace {
  display: grid;
  grid-template-columns:
    minmax(25rem, 0.9fr)
    minmax(34rem, 1.3fr);
  gap: 0.8rem;
  max-width: 1650px;
  margin: 0 auto;
  padding: 0.8rem;
  align-items: start;
}

.match-column,
.control-column {
  min-width: 0;
}

.control-column {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

@media (max-width: 1150px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .application-header {
    position: static;
    flex-direction: column;
    align-items: stretch;
  }

  .header-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .summary-item {
    min-width: 0;
  }

  .workspace {
    padding: 0.55rem;
  }
}

@media (max-width: 520px) {
  .reducer-view {
    padding-bottom: 11rem;
  }

  .header-summary {
    grid-template-columns: 1fr;
  }
}
</style>