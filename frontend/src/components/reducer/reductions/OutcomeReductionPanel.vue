<script setup lang="ts">
import type {
  NumericRange,
  Outcome,
  OutcomeReductionLimits,
} from '@/types/reducer'

const props = defineProps<{
  modelValue: OutcomeReductionLimits
  matchCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [limits: OutcomeReductionLimits]
}>()

interface OutcomeDefinition {
  outcome: Outcome
  label: string
}

const outcomeDefinitions: OutcomeDefinition[] = [
  {
    outcome: '1',
    label: 'Home wins',
  },
  {
    outcome: 'X',
    label: 'Draws',
  },
  {
    outcome: '2',
    label: 'Away wins',
  },
]

function cloneLimits(): OutcomeReductionLimits {
  return {
    '1': {
      ...props.modelValue['1'],
    },
    X: {
      ...props.modelValue.X,
    },
    '2': {
      ...props.modelValue['2'],
    },
  }
}

function toggleEnabled(outcome: Outcome): void {
  const updatedLimits = cloneLimits()
  const currentRange = updatedLimits[outcome]

  updatedLimits[outcome] = {
    ...currentRange,
    enabled: !currentRange.enabled,
    min: currentRange.min ?? 0,
    max: currentRange.max ?? props.matchCount,
  }

  emit('update:modelValue', updatedLimits)
}

function updateRange(
  outcome: Outcome,
  field: 'min' | 'max',
  value: string,
): void {
  const parsedValue = Number(value)

  if (!Number.isInteger(parsedValue)) {
    return
  }

  const safeValue = Math.min(
    Math.max(parsedValue, 0),
    props.matchCount,
  )

  const updatedLimits = cloneLimits()

  updatedLimits[outcome] = {
    ...updatedLimits[outcome],
    [field]: safeValue,
  }

  emit('update:modelValue', updatedLimits)
}

function getRange(outcome: Outcome): NumericRange {
  return props.modelValue[outcome]
}

function hasInvalidRange(outcome: Outcome): boolean {
  const range = getRange(outcome)

  if (!range.enabled) {
    return false
  }

  if (range.min === null || range.max === null) {
    return true
  }

  return range.min > range.max
}

function enableAll(): void {
  const updatedLimits = cloneLimits()

  for (const definition of outcomeDefinitions) {
    const currentRange = updatedLimits[definition.outcome]

    updatedLimits[definition.outcome] = {
      ...currentRange,
      enabled: true,
      min: currentRange.min ?? 0,
      max: currentRange.max ?? props.matchCount,
    }
  }

  emit('update:modelValue', updatedLimits)
}

function disableAll(): void {
  const updatedLimits = cloneLimits()

  for (const definition of outcomeDefinitions) {
    updatedLimits[definition.outcome] = {
      ...updatedLimits[definition.outcome],
      enabled: false,
    }
  }

  emit('update:modelValue', updatedLimits)
}
</script>

<template>
  <section class="outcome-reduction-panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">
          Reduction method
        </p>

        <h3>1X2 reduction</h3>

        <p class="panel-description">
          Limit how many home wins, draws and away wins each
          generated row may contain.
        </p>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="small-button"
          @click="enableAll"
        >
          Enable all
        </button>

        <button
          type="button"
          class="small-button muted"
          @click="disableAll"
        >
          Disable all
        </button>
      </div>
    </header>

    <div class="table-heading" aria-hidden="true">
      <span>Outcome</span>
      <span>Active</span>
      <span>Minimum</span>
      <span>Maximum</span>
    </div>

    <div class="outcome-ranges">
      <div
        v-for="definition in outcomeDefinitions"
        :key="definition.outcome"
        class="range-row"
        :class="{
          enabled: getRange(definition.outcome).enabled,
          invalid: hasInvalidRange(definition.outcome),
        }"
      >
        <div class="outcome-information">
          <span class="outcome-badge">
            {{ definition.outcome }}
          </span>

          <span class="outcome-label">
            {{ definition.label }}
          </span>
        </div>

        <label class="toggle-control">
          <input
            :checked="getRange(definition.outcome).enabled"
            type="checkbox"
            :aria-label="`Enable ${definition.label} reduction`"
            @change="toggleEnabled(definition.outcome)"
          />

          <span class="toggle-track">
            <span class="toggle-thumb" />
          </span>
        </label>

        <label class="number-field">
          <span class="mobile-label">Minimum</span>

          <input
            :value="getRange(definition.outcome).min ?? 0"
            type="number"
            min="0"
            :max="matchCount"
            :disabled="!getRange(definition.outcome).enabled"
            :aria-label="`Minimum ${definition.label}`"
            @input="
              updateRange(
                definition.outcome,
                'min',
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>

        <label class="number-field">
          <span class="mobile-label">Maximum</span>

          <input
            :value="
              getRange(definition.outcome).max ??
              matchCount
            "
            type="number"
            min="0"
            :max="matchCount"
            :disabled="!getRange(definition.outcome).enabled"
            :aria-label="`Maximum ${definition.label}`"
            @input="
              updateRange(
                definition.outcome,
                'max',
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>

        <p
          v-if="hasInvalidRange(definition.outcome)"
          class="validation-message"
        >
          Minimum cannot be greater than maximum.
        </p>
      </div>
    </div>

    <footer class="panel-footer">
      <span>
        Available range:
        <strong>0–{{ matchCount }}</strong>
      </span>

      <span>
        Disabled outcomes do not affect the reduction.
      </span>
    </footer>
  </section>
</template>

<style scoped>
.outcome-reduction-panel {
  overflow: hidden;
  border: 1px solid #40545f;
  border-radius: 0.55rem;
  background: #2d404b;
  color: #eaf4f6;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #40545f;
  background: #354b57;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: #55dbc4;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
}

.panel-description {
  max-width: 34rem;
  margin: 0.35rem 0 0;
  color: #9fb1ba;
  font-size: 0.75rem;
  line-height: 1.45;
}

.header-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
}

.small-button {
  min-height: 2rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid #57717d;
  border-radius: 0.35rem;
  background: #2b3d47;
  color: #d9e6e9;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 700;
}

.small-button:hover {
  border-color: #55dbc4;
  color: #ffffff;
}

.small-button.muted {
  color: #a4b4bb;
}

.table-heading,
.range-row {
  display: grid;
  grid-template-columns:
    minmax(8rem, 1fr)
    4.5rem
    5.5rem
    5.5rem;
  gap: 0.55rem;
  align-items: center;
}

.table-heading {
  padding: 0.55rem 0.8rem;
  border-bottom: 1px solid #3b4f5a;
  background: #293b45;
  color: #8297a1;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.table-heading span:not(:first-child) {
  text-align: center;
}

.outcome-ranges {
  display: flex;
  flex-direction: column;
}

.range-row {
  position: relative;
  min-height: 4rem;
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid #3b4f5a;
  background: #2d404b;
  opacity: 0.68;
  transition:
    background-color 150ms ease,
    opacity 150ms ease;
}

.range-row:last-child {
  border-bottom: 0;
}

.range-row.enabled {
  background: #304751;
  opacity: 1;
}

.range-row.invalid {
  padding-bottom: 2rem;
  border-left: 3px solid #ff676f;
}

.outcome-information {
  display: flex;
  min-width: 0;
  gap: 0.65rem;
  align-items: center;
}

.outcome-badge {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #5c737e;
  border-radius: 0.35rem;
  background: #243640;
  color: #b8c8ce;
  font-size: 0.82rem;
  font-weight: 800;
}

.range-row.enabled .outcome-badge {
  border-color: #55dbc4;
  background: #55dbc4;
  color: #17353b;
}

.outcome-label {
  overflow: hidden;
  color: #dbe7ea;
  font-size: 0.75rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toggle-control {
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.toggle-control input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.toggle-track {
  position: relative;
  display: block;
  width: 2.3rem;
  height: 1.25rem;
  border: 1px solid #50656f;
  border-radius: 999px;
  background: #22333c;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
}

.toggle-thumb {
  position: absolute;
  top: 0.15rem;
  left: 0.16rem;
  width: 0.83rem;
  height: 0.83rem;
  border-radius: 50%;
  background: #82949d;
  transition:
    transform 150ms ease,
    background-color 150ms ease;
}

.toggle-control input:checked + .toggle-track {
  border-color: #55dbc4;
  background: #24594f;
}

.toggle-control input:checked
  + .toggle-track
  .toggle-thumb {
  background: #55dbc4;
  transform: translateX(1rem);
}

.toggle-control input:focus-visible + .toggle-track {
  outline: 2px solid #55dbc4;
  outline-offset: 2px;
}

.number-field {
  display: block;
  min-width: 0;
}

.number-field input {
  width: 100%;
  height: 2.1rem;
  padding: 0.3rem;
  border: 1px solid #506671;
  border-radius: 0.35rem;
  outline: none;
  background: #344a55;
  color: #ffffff;
  font-size: 0.75rem;
  text-align: center;
}

.number-field input:focus {
  border-color: #55dbc4;
}

.number-field input:disabled {
  cursor: not-allowed;
  background: #293a43;
  color: #657983;
  opacity: 0.65;
}

.mobile-label {
  display: none;
}

.validation-message {
  position: absolute;
  right: 0.8rem;
  bottom: 0.4rem;
  margin: 0;
  color: #ff949a;
  font-size: 0.62rem;
}

.panel-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.65rem 0.8rem;
  border-top: 1px solid #40545f;
  background: #293b45;
  color: #8297a1;
  font-size: 0.65rem;
}

.panel-footer strong {
  color: #bdcbd0;
}

@media (max-width: 620px) {
  .panel-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .small-button {
    flex: 1;
  }

  .table-heading {
    display: none;
  }

  .range-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.7rem;
  }

  .toggle-control {
    justify-content: flex-end;
  }

  .number-field {
    grid-column: span 1;
  }

  .mobile-label {
    display: block;
    margin-bottom: 0.2rem;
    color: #81959f;
    font-size: 0.58rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .validation-message {
    position: static;
    grid-column: 1 / -1;
  }

  .range-row.invalid {
    padding-bottom: 0.65rem;
  }
}
</style>