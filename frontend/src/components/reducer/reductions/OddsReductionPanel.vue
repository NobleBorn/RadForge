<script setup lang="ts">
import type { NumericRange } from '@/types/reducer'

const props = defineProps<{
  modelValue: NumericRange
}>()

const emit = defineEmits<{
  'update:modelValue': [range: NumericRange]
}>()

function toggleEnabled(): void {
  emit('update:modelValue', {
    ...props.modelValue,
    enabled: !props.modelValue.enabled,
    min: props.modelValue.min ?? 1,
    max: props.modelValue.max ?? 100000,
  })
}

function updateValue(
  field: 'min' | 'max',
  value: string,
): void {
  const normalizedValue = value
    .trim()
    .replace(',', '.')

  if (normalizedValue === '') {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: null,
    })

    return
  }

  const parsedValue = Number(normalizedValue)

  if (!Number.isFinite(parsedValue)) {
    return
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [field]: Math.max(parsedValue, 0),
  })
}

function hasInvalidRange(): boolean {
  if (!props.modelValue.enabled) {
    return false
  }

  if (
    props.modelValue.min === null ||
    props.modelValue.max === null
  ) {
    return true
  }

  return props.modelValue.min > props.modelValue.max
}

function resetRange(): void {
  emit('update:modelValue', {
    enabled: false,
    min: null,
    max: null,
  })
}

function formatExampleOdds(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<template>
  <section class="odds-reduction-panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">
          Reduction method
        </p>

        <h3>Total odds reduction</h3>

        <p class="panel-description">
          Multiply the selected odds in every row and keep only
          rows whose combined odds fall inside the selected range.
        </p>
      </div>

      <label class="toggle-control">
        <input
          :checked="modelValue.enabled"
          type="checkbox"
          aria-label="Enable total odds reduction"
          @change="toggleEnabled"
        />

        <span class="toggle-track">
          <span class="toggle-thumb" />
        </span>
      </label>
    </header>

    <div class="panel-content">
      <div class="explanation-box">
        <span class="explanation-icon">
          ×
        </span>

        <div>
          <strong>How it works</strong>

          <p>
            The odds for the selected outcome in every match are
            multiplied together. A row is kept only when the
            result is between the minimum and maximum total odds.
          </p>
        </div>
      </div>

      <div class="range-fields">
        <label class="number-field">
          <span>Minimum total odds</span>

          <input
            :value="modelValue.min ?? ''"
            type="number"
            min="0"
            step="0.01"
            placeholder="1.00"
            :disabled="!modelValue.enabled"
            @input="
              updateValue(
                'min',
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>

        <div class="range-separator">
          to
        </div>

        <label class="number-field">
          <span>Maximum total odds</span>

          <input
            :value="modelValue.max ?? ''"
            type="number"
            min="0"
            step="0.01"
            placeholder="100000.00"
            :disabled="!modelValue.enabled"
            @input="
              updateValue(
                'max',
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>
      </div>

      <p
        v-if="hasInvalidRange()"
        class="validation-message"
      >
        Enter both values and make sure the minimum is not greater
        than the maximum.
      </p>

      <div class="example-box">
        <div class="example-heading">
          Example
        </div>

        <div class="example-row">
          <span>Match 1 selected odds</span>
          <strong>{{ formatExampleOdds(1.8) }}</strong>
        </div>

        <div class="example-row">
          <span>Match 2 selected odds</span>
          <strong>{{ formatExampleOdds(2.1) }}</strong>
        </div>

        <div class="example-row">
          <span>Match 3 selected odds</span>
          <strong>{{ formatExampleOdds(1.6) }}</strong>
        </div>

        <div class="example-total">
          <span>Total row odds</span>

          <strong>
            {{ formatExampleOdds(1.8 * 2.1 * 1.6) }}
          </strong>
        </div>
      </div>

      <div class="warning-box">
        <span class="warning-icon">
          !
        </span>

        <p>
          Every selected outcome should have a valid odds value
          when this reduction method is enabled.
        </p>
      </div>
    </div>

    <footer class="panel-footer">
      <span>
        Missing or invalid odds will make a row fail the odds
        reduction.
      </span>

      <button
        type="button"
        class="reset-button"
        @click="resetRange"
      >
        Reset
      </button>
    </footer>
  </section>
</template>

<style scoped>
.odds-reduction-panel {
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
  max-width: 35rem;
  margin: 0.35rem 0 0;
  color: #9fb1ba;
  font-size: 0.75rem;
  line-height: 1.45;
}

.toggle-control {
  position: relative;
  display: flex;
  flex-shrink: 0;
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
  width: 2.7rem;
  height: 1.45rem;
  border: 1px solid #50656f;
  border-radius: 999px;
  background: #22333c;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
}

.toggle-thumb {
  position: absolute;
  top: 0.16rem;
  left: 0.17rem;
  width: 0.98rem;
  height: 0.98rem;
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
  transform: translateX(1.2rem);
}

.toggle-control input:focus-visible + .toggle-track {
  outline: 2px solid #55dbc4;
  outline-offset: 2px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
}

.explanation-box,
.warning-box {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.45rem;
}

.explanation-box {
  border: 1px solid #465e69;
  background: #293b45;
}

.warning-box {
  border: 1px solid #6d5c3d;
  background: #403927;
}

.explanation-icon,
.warning-icon {
  display: grid;
  width: 1.45rem;
  height: 1.45rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 800;
}

.explanation-icon {
  background: #55dbc4;
  color: #17353b;
}

.warning-icon {
  background: #ffd267;
  color: #3f3212;
}

.explanation-box strong {
  color: #e6f1f3;
  font-size: 0.72rem;
}

.explanation-box p,
.warning-box p {
  margin: 0.2rem 0 0;
  font-size: 0.68rem;
  line-height: 1.45;
}

.explanation-box p {
  color: #92a6af;
}

.warning-box p {
  color: #d3c59b;
}

.range-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 0.8rem;
  align-items: end;
}

.number-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.number-field span {
  color: #9eb0b8;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.number-field input {
  width: 100%;
  height: 2.5rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid #506671;
  border-radius: 0.4rem;
  outline: none;
  background: #344a55;
  color: #ffffff;
  font-size: 0.8rem;
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

.range-separator {
  padding-bottom: 0.7rem;
  color: #7f939d;
  font-size: 0.68rem;
}

.validation-message {
  margin: -0.3rem 0 0;
  color: #ff949a;
  font-size: 0.65rem;
}

.example-box {
  overflow: hidden;
  border: 1px solid #40545f;
  border-radius: 0.45rem;
  background: #293b45;
}

.example-heading {
  padding: 0.5rem 0.65rem;
  border-bottom: 1px solid #40545f;
  color: #8297a1;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.example-row,
.example-total {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0.65rem;
  color: #9fb0b8;
  font-size: 0.68rem;
}

.example-row {
  border-bottom: 1px solid #374b55;
}

.example-row strong {
  color: #d8e5e8;
}

.example-total {
  background: #304751;
  color: #c7d5da;
}

.example-total strong {
  color: #55dbc4;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.65rem 0.8rem;
  border-top: 1px solid #40545f;
  background: #293b45;
  color: #8297a1;
  font-size: 0.65rem;
}

.reset-button {
  padding: 0.35rem 0.6rem;
  border: 1px solid #506671;
  border-radius: 0.35rem;
  background: #344a55;
  color: #b7c6cc;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 700;
}

.reset-button:hover {
  border-color: #55dbc4;
  color: #ffffff;
}

@media (max-width: 520px) {
  .range-fields {
    grid-template-columns: 1fr;
  }

  .range-separator {
    display: none;
  }

  .panel-footer {
    align-items: flex-start;
  }
}
</style>