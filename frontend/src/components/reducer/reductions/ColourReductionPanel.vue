<script setup lang="ts">
import type {
  ColourId,
  ColourReductions,
} from '@/types/reducer'

const props = defineProps<{
  modelValue: ColourReductions
  activeColour: ColourId | null
  matchCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [colours: ColourReductions]
  'update:activeColour': [colour: ColourId | null]
}>()

interface ColourDefinition {
  id: ColourId
  label: string
}

const colourDefinitions: ColourDefinition[] = [
  {
    id: 'blue',
    label: 'Blue',
  },
  {
    id: 'yellow',
    label: 'Yellow',
  },
  {
    id: 'red',
    label: 'Red',
  },
  {
    id: 'green',
    label: 'Green',
  },
]

function cloneColours(): ColourReductions {
  return {
    blue: {
      ...props.modelValue.blue,
    },
    yellow: {
      ...props.modelValue.yellow,
    },
    red: {
      ...props.modelValue.red,
    },
    green: {
      ...props.modelValue.green,
    },
  }
}

function toggleEnabled(colour: ColourId): void {
  const updatedColours = cloneColours()
  const current = updatedColours[colour]

  updatedColours[colour] = {
    ...current,
    enabled: !current.enabled,
    min: Math.min(current.min, props.matchCount),
    max: Math.min(
      current.max || props.matchCount,
      props.matchCount,
    ),
  }

  if (
    !updatedColours[colour].enabled &&
    props.activeColour === colour
  ) {
    emit('update:activeColour', null)
  }

  emit('update:modelValue', updatedColours)
}

function selectActiveColour(colour: ColourId): void {
  if (!props.modelValue[colour].enabled) {
    return
  }

  emit(
    'update:activeColour',
    props.activeColour === colour ? null : colour,
  )
}

function updateRange(
  colour: ColourId,
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

  const updatedColours = cloneColours()

  updatedColours[colour] = {
    ...updatedColours[colour],
    [field]: safeValue,
  }

  emit('update:modelValue', updatedColours)
}

function hasInvalidRange(colour: ColourId): boolean {
  const reduction = props.modelValue[colour]

  return (
    reduction.enabled &&
    reduction.min > reduction.max
  )
}

function enableAll(): void {
  const updatedColours = cloneColours()

  for (const definition of colourDefinitions) {
    const current = updatedColours[definition.id]

    updatedColours[definition.id] = {
      ...current,
      enabled: true,
      min: Math.min(current.min, props.matchCount),
      max: Math.min(
        current.max || props.matchCount,
        props.matchCount,
      ),
    }
  }

  emit('update:modelValue', updatedColours)
}

function disableAll(): void {
  const updatedColours = cloneColours()

  for (const definition of colourDefinitions) {
    updatedColours[definition.id] = {
      ...updatedColours[definition.id],
      enabled: false,
    }
  }

  emit('update:modelValue', updatedColours)
  emit('update:activeColour', null)
}
</script>

<template>
  <section class="colour-reduction-panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">
          Reduction method
        </p>

        <h3>Colour reduction</h3>

        <p class="panel-description">
          Create colour groups, assign outcomes to them and
          restrict how many hits each generated row may contain.
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

    <div class="instruction-box">
      <span class="instruction-number">1</span>

      <span>
        Enable a colour group.
      </span>

      <span class="instruction-number">2</span>

      <span>
        Select it as the active colour.
      </span>

      <span class="instruction-number">3</span>

      <span>
        Assign it to outcomes in the match list.
      </span>
    </div>

    <div class="table-heading" aria-hidden="true">
      <span>Colour</span>
      <span>Active</span>
      <span>Assign</span>
      <span>Minimum</span>
      <span>Maximum</span>
    </div>

    <div class="colour-rows">
      <div
        v-for="definition in colourDefinitions"
        :key="definition.id"
        class="colour-row"
        :class="{
          enabled: modelValue[definition.id].enabled,
          selected: activeColour === definition.id,
          invalid: hasInvalidRange(definition.id),
        }"
      >
        <div class="colour-information">
          <span
            class="colour-dot"
            :class="`colour-${definition.id}`"
          />

          <span class="colour-name">
            {{ definition.label }}
          </span>
        </div>

        <label class="toggle-control">
          <input
            :checked="modelValue[definition.id].enabled"
            type="checkbox"
            :aria-label="`Enable ${definition.label} colour reduction`"
            @change="toggleEnabled(definition.id)"
          />

          <span class="toggle-track">
            <span class="toggle-thumb" />
          </span>
        </label>

        <button
          type="button"
          class="assign-button"
          :class="{
            active: activeColour === definition.id,
          }"
          :disabled="!modelValue[definition.id].enabled"
          @click="selectActiveColour(definition.id)"
        >
          {{
            activeColour === definition.id
              ? 'Selected'
              : 'Select'
          }}
        </button>

        <label class="number-field">
          <span class="mobile-label">
            Minimum
          </span>

          <input
            :value="modelValue[definition.id].min"
            type="number"
            min="0"
            :max="matchCount"
            :disabled="!modelValue[definition.id].enabled"
            :aria-label="`Minimum ${definition.label} hits`"
            @input="
              updateRange(
                definition.id,
                'min',
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>

        <label class="number-field">
          <span class="mobile-label">
            Maximum
          </span>

          <input
            :value="modelValue[definition.id].max"
            type="number"
            min="0"
            :max="matchCount"
            :disabled="!modelValue[definition.id].enabled"
            :aria-label="`Maximum ${definition.label} hits`"
            @input="
              updateRange(
                definition.id,
                'max',
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>

        <p
          v-if="hasInvalidRange(definition.id)"
          class="validation-message"
        >
          Minimum cannot be greater than maximum.
        </p>
      </div>
    </div>

    <footer class="panel-footer">
      <span>
        Active assignment:
        <strong>
          {{ activeColour ?? 'none' }}
        </strong>
      </span>

      <span>
        One outcome may belong to several colour groups.
      </span>
    </footer>
  </section>
</template>

<style scoped>
.colour-reduction-panel {
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

.instruction-box {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr)
    auto minmax(0, 1fr)
    auto minmax(0, 1fr);
  gap: 0.45rem;
  align-items: center;
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid #3d515c;
  background: #293b45;
  color: #9fb0b8;
  font-size: 0.65rem;
}

.instruction-number {
  display: grid;
  width: 1.2rem;
  height: 1.2rem;
  place-items: center;
  border: 1px solid #4f6974;
  border-radius: 50%;
  background: #344b56;
  color: #55dbc4;
  font-size: 0.6rem;
  font-weight: 800;
}

.table-heading,
.colour-row {
  display: grid;
  grid-template-columns:
    minmax(7rem, 1fr)
    4rem
    5rem
    5.3rem
    5.3rem;
  gap: 0.55rem;
  align-items: center;
}

.table-heading {
  padding: 0.55rem 0.8rem;
  border-bottom: 1px solid #3b4f5a;
  background: #263841;
  color: #8297a1;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.table-heading span:not(:first-child) {
  text-align: center;
}

.colour-rows {
  display: flex;
  flex-direction: column;
}

.colour-row {
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

.colour-row:last-child {
  border-bottom: 0;
}

.colour-row.enabled {
  background: #304751;
  opacity: 1;
}

.colour-row.selected {
  box-shadow: inset 3px 0 0 #55dbc4;
}

.colour-row.invalid {
  padding-bottom: 2rem;
}

.colour-information {
  display: flex;
  gap: 0.65rem;
  align-items: center;
}

.colour-dot {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgb(255 255 255 / 6%);
}

.colour-name {
  color: #dbe7ea;
  font-size: 0.75rem;
  font-weight: 700;
}

.colour-blue {
  background: #18c9ea;
}

.colour-yellow {
  background: #ffd21c;
}

.colour-red {
  background: #ff624f;
}

.colour-green {
  background: #16c777;
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

.assign-button {
  min-height: 2rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid #506671;
  border-radius: 0.35rem;
  background: #344a55;
  color: #aebec5;
  cursor: pointer;
  font-size: 0.67rem;
  font-weight: 700;
}

.assign-button:hover:not(:disabled) {
  border-color: #55dbc4;
  color: #ffffff;
}

.assign-button.active {
  border-color: #55dbc4;
  background: #24594f;
  color: #eafffb;
}

.assign-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.number-field {
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
  color: #c8d6db;
  text-transform: capitalize;
}

@media (max-width: 720px) {
  .panel-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .small-button {
    flex: 1;
  }

  .instruction-box {
    grid-template-columns: auto 1fr;
  }

  .table-heading {
    display: none;
  }

  .colour-row {
    grid-template-columns:
      minmax(0, 1fr)
      auto;
    gap: 0.7rem;
  }

  .assign-button,
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

  .colour-row.invalid {
    padding-bottom: 0.65rem;
  }
}
</style>