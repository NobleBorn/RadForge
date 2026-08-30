<script setup lang="ts">
import { computed, ref } from 'vue'

import ColourReductionPanel from '@/components/reducer/reductions/ColourReductionPanel.vue'
import OutcomeReductionPanel from '@/components/reducer/reductions/OutcomeReductionPanel.vue'
import PointsReductionPanel from '@/components/reducer/reductions/PointsReductionPanel.vue'

import type {
  ColourId,
  ColourReductions,
  NumericRange,
  OutcomeReductionLimits,
  ReductionSettings,
} from '@/types/reducer'

type ReductionTab =
  | 'outcomes'
  | 'colours'
  | 'points'

interface TabDefinition {
  id: ReductionTab
  label: string
  shortLabel: string
}

const props = defineProps<{
  modelValue: ReductionSettings
  activeColour: ColourId | null
  matchCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [settings: ReductionSettings]
  'update:activeColour': [colour: ColourId | null]
}>()

const activeTab = ref<ReductionTab>('outcomes')

const tabs: TabDefinition[] = [
  {
    id: 'outcomes',
    label: '1X2 reduction',
    shortLabel: '1X2',
  },
  {
    id: 'colours',
    label: 'Colour reduction',
    shortLabel: 'Colours',
  },
  {
    id: 'points',
    label: 'Point reduction',
    shortLabel: 'Points',
  },
]

const enabledMethodCount = computed<number>(() => {
  let count = 0

  const outcomeReductionEnabled = Object.values(
    props.modelValue.outcomeLimits,
  ).some((range) => range.enabled)

  if (outcomeReductionEnabled) {
    count++
  }

  const colourReductionEnabled = Object.values(
    props.modelValue.colours,
  ).some((colour) => colour.enabled)

  if (colourReductionEnabled) {
    count++
  }

  if (props.modelValue.points.enabled) {
    count++
  }

  return count
})

function cloneSettings(): ReductionSettings {
  return {
    outcomeLimits: {
      '1': {
        ...props.modelValue.outcomeLimits['1'],
      },
      X: {
        ...props.modelValue.outcomeLimits.X,
      },
      '2': {
        ...props.modelValue.outcomeLimits['2'],
      },
    },

    colours: {
      blue: {
        ...props.modelValue.colours.blue,
      },
      yellow: {
        ...props.modelValue.colours.yellow,
      },
      red: {
        ...props.modelValue.colours.red,
      },
      green: {
        ...props.modelValue.colours.green,
      },
    },

    points: {
      ...props.modelValue.points,
    },

  }
}

function updateOutcomeLimits(
  outcomeLimits: OutcomeReductionLimits,
): void {
  const updatedSettings = cloneSettings()

  updatedSettings.outcomeLimits = outcomeLimits

  emit('update:modelValue', updatedSettings)
}

function updateColours(
  colours: ColourReductions,
): void {
  const updatedSettings = cloneSettings()

  updatedSettings.colours = colours

  emit('update:modelValue', updatedSettings)
}

function updatePoints(points: NumericRange): void {
  const updatedSettings = cloneSettings()

  updatedSettings.points = points

  emit('update:modelValue', updatedSettings)
}

function updateActiveColour(
  colour: ColourId | null,
): void {
  emit('update:activeColour', colour)
}

function selectTab(tab: ReductionTab): void {
  activeTab.value = tab
}

function tabIsEnabled(tab: ReductionTab): boolean {
  if (tab === 'outcomes') {
    return Object.values(
      props.modelValue.outcomeLimits,
    ).some((range) => range.enabled)
  }

  if (tab === 'colours') {
    return Object.values(
      props.modelValue.colours,
    ).some((colour) => colour.enabled)
  }

  return props.modelValue.points.enabled
}
</script>

<template>
  <section class="reduction-dashboard">
    <header class="dashboard-header">
      <div>
        <p class="eyebrow">
          System configuration
        </p>

        <h2>Reduction methods</h2>

        <p>
          Combine several reduction methods to control which
          generated rows remain in the final system.
        </p>
      </div>

      <div class="enabled-summary">
        <strong>{{ enabledMethodCount }}</strong>

        <span>
          {{ enabledMethodCount === 1 ? 'method' : 'methods' }}
          enabled
        </span>
      </div>
    </header>

    <nav
      class="reduction-tabs"
      aria-label="Reduction methods"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab-button"
        :class="{
          active: activeTab === tab.id,
          enabled: tabIsEnabled(tab.id),
        }"
        :aria-selected="activeTab === tab.id"
        role="tab"
        @click="selectTab(tab.id)"
      >
        <span class="tab-status" />

        <span class="desktop-label">
          {{ tab.label }}
        </span>

        <span class="mobile-label">
          {{ tab.shortLabel }}
        </span>
      </button>
    </nav>

    <div class="dashboard-content">
      <OutcomeReductionPanel
        v-if="activeTab === 'outcomes'"
        :model-value="modelValue.outcomeLimits"
        :match-count="matchCount"
        @update:model-value="updateOutcomeLimits"
      />

      <ColourReductionPanel
        v-else-if="activeTab === 'colours'"
        :model-value="modelValue.colours"
        :active-colour="activeColour"
        :match-count="matchCount"
        @update:model-value="updateColours"
        @update:active-colour="updateActiveColour"
      />

      <PointsReductionPanel
        v-else
        :model-value="modelValue.points"
        @update:model-value="updatePoints"
      />
    </div>
  </section>
</template>

<style scoped>
.reduction-dashboard {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #3f535f;
  border-radius: 0.6rem;
  background: #293b45;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid #3f535f;
  background: #30444f;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: #55dbc4;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.1rem;
}

.dashboard-header p:last-child {
  max-width: 38rem;
  margin: 0.35rem 0 0;
  color: #9eb0b9;
  font-size: 0.75rem;
  line-height: 1.45;
}

.enabled-summary {
  display: flex;
  min-width: 5.8rem;
  padding: 0.55rem 0.7rem;
  flex-direction: column;
  align-items: center;
  border: 1px solid #4b626d;
  border-radius: 0.45rem;
  background: #263842;
}

.enabled-summary strong {
  color: #55dbc4;
  font-size: 1.15rem;
  line-height: 1;
}

.enabled-summary span {
  margin-top: 0.25rem;
  color: #9eb0b9;
  font-size: 0.62rem;
  white-space: nowrap;
}

.reduction-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid #3f535f;
  background: #243640;
}

.tab-button {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 3rem;
  padding: 0.6rem 0.75rem;
  justify-content: center;
  gap: 0.45rem;
  align-items: center;
  border-right: 1px solid #384c56;
  background: transparent;
  color: #8ea1aa;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
}

.tab-button:last-child {
  border-right: 0;
}

.tab-button:hover {
  background: #2a3e48;
  color: #d8e4e7;
}

.tab-button.active {
  background: #304751;
  color: #ffffff;
}

.tab-button.active::after {
  position: absolute;
  right: 0.65rem;
  bottom: 0;
  left: 0.65rem;
  height: 2px;
  border-radius: 999px;
  background: #55dbc4;
  content: '';
}

.tab-status {
  width: 0.48rem;
  height: 0.48rem;
  flex: 0 0 auto;
  border: 1px solid #637883;
  border-radius: 50%;
  background: #344852;
}

.tab-button.enabled .tab-status {
  border-color: #55dbc4;
  background: #55dbc4;
  box-shadow: 0 0 0 3px rgb(85 219 196 / 10%);
}

.mobile-label {
  display: none;
}

.dashboard-content {
  padding: 0.8rem;
}

@media (max-width: 700px) {
  .dashboard-header {
    align-items: stretch;
  }

  .enabled-summary {
    min-width: 5rem;
  }

  .desktop-label {
    display: none;
  }

  .mobile-label {
    display: inline;
  }

  .tab-button {
    padding-inline: 0.35rem;
  }
}

@media (max-width: 520px) {
  .dashboard-header {
    flex-direction: column;
  }

  .enabled-summary {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 0.4rem;
  }

  .enabled-summary span {
    margin-top: 0;
  }

  .reduction-tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .dashboard-content {
    padding: 0.55rem;
  }
}
</style>