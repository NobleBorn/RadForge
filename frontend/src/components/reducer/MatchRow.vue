<script setup lang="ts">
import type {
  ColourId,
  MatchItem,
  Outcome,
  OutcomeConfiguration,
} from '@/types/reducer'

const props = defineProps<{
  match: MatchItem
  matchNumber: number

  /**
   * The colour currently selected in the colour-reduction panel.
   * When null, colour assignment is disabled.
   */
  activeColour?: ColourId | null
}>()

const emit = defineEmits<{
  update: [match: MatchItem]
  remove: [id: string]
}>()

const outcomes: Outcome[] = ['1', 'X', '2']

function emitUpdatedMatch(
  changes: Partial<MatchItem>,
): void {
  emit('update', {
    ...props.match,
    ...changes,
  })
}

function updateHomeTeam(value: string): void {
  emitUpdatedMatch({
    homeTeam: value,
  })
}

function updateAwayTeam(value: string): void {
  emitUpdatedMatch({
    awayTeam: value,
  })
}

function updateStartTime(value: string): void {
  emitUpdatedMatch({
    startTime: value,
  })
}

function updateOutcome(
  outcome: Outcome,
  changes: Partial<OutcomeConfiguration>,
): void {
  emitUpdatedMatch({
    outcomes: {
      ...props.match.outcomes,

      [outcome]: {
        ...props.match.outcomes[outcome],
        ...changes,
      },
    },
  })
}

function selectedOutcomeCount(): number {
  return outcomes.filter(
    (outcome) => props.match.outcomes[outcome].selected,
  ).length
}

function toggleOutcome(outcome: Outcome): void {
  const configuration = props.match.outcomes[outcome]

  /*
   * Every match must contain at least one selected outcome.
   */
  if (
    configuration.selected &&
    selectedOutcomeCount() === 1
  ) {
    return
  }

  updateOutcome(outcome, {
    selected: !configuration.selected,
  })
}

function toggleActiveColour(outcome: Outcome): void {
  if (!props.activeColour) {
    return
  }

  const configuration = props.match.outcomes[outcome]

  const colourAlreadyAssigned =
    configuration.colours.includes(props.activeColour)

  const updatedColours = colourAlreadyAssigned
    ? configuration.colours.filter(
        (colour) => colour !== props.activeColour,
      )
    : [
        ...configuration.colours,
        props.activeColour,
      ]

  updateOutcome(outcome, {
    colours: updatedColours,
  })
}

function updateOdds(
  outcome: Outcome,
  value: string,
): void {
  updateOutcome(outcome, {
    odds: parseOptionalNumber(value),
  })
}

function updatePercentage(
  outcome: Outcome,
  value: string,
): void {
  const parsedValue = parseOptionalNumber(value)

  if (parsedValue === null) {
    updateOutcome(outcome, {
      percentage: null,
    })

    return
  }

  updateOutcome(outcome, {
    percentage: Math.min(
      Math.max(parsedValue, 0),
      100,
    ),
  })
}

function updatePoints(
  outcome: Outcome,
  value: string,
): void {
  const parsedValue = parseOptionalNumber(value)

  if (parsedValue === null) {
    updateOutcome(outcome, {
      points: null,
    })

    return
  }

  updateOutcome(outcome, {
    points: Math.max(
      Math.round(parsedValue),
      0,
    ),
  })
}

function parseOptionalNumber(
  value: string,
): number | null {
  const normalizedValue = value
    .trim()
    .replace(',', '.')

  if (normalizedValue === '') {
    return null
  }

  const parsedValue = Number(normalizedValue)

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null
}

function removeMatch(): void {
  emit('remove', props.match.id)
}

function colourClass(colour: ColourId): string {
  return `colour-${colour}`
}
</script>

<template>
  <article class="match-row">
    <header class="match-header">
      <span class="match-number">
        {{ matchNumber }}
      </span>

      <div class="team-fields">
        <input
          :value="match.homeTeam"
          class="team-input"
          type="text"
          placeholder="Home team"
          :aria-label="`Home team for match ${matchNumber}`"
          @input="
            updateHomeTeam(
              ($event.target as HTMLInputElement).value,
            )
          "
        />

        <span class="team-separator">
          -
        </span>

        <input
          :value="match.awayTeam"
          class="team-input"
          type="text"
          placeholder="Away team"
          :aria-label="`Away team for match ${matchNumber}`"
          @input="
            updateAwayTeam(
              ($event.target as HTMLInputElement).value,
            )
          "
        />
      </div>

      <input
        :value="match.startTime"
        class="start-time-input"
        type="datetime-local"
        :aria-label="`Start time for match ${matchNumber}`"
        @input="
          updateStartTime(
            ($event.target as HTMLInputElement).value,
          )
        "
      />

      <button
        type="button"
        class="remove-button"
        :aria-label="`Remove match ${matchNumber}`"
        title="Remove match"
        @click="removeMatch"
      >
        ×
      </button>
    </header>

    <div class="match-content">
      <div class="data-labels" aria-hidden="true">
        <span>Odds</span>
        <span>Percent</span>
        <span>Points</span>
      </div>

      <div class="outcome-grid">
        <section
          v-for="outcome in outcomes"
          :key="outcome"
          class="outcome-column"
          :class="{
            selected: match.outcomes[outcome].selected,
          }"
        >
          <button
            type="button"
            class="outcome-select-button"
            :class="{
              selected: match.outcomes[outcome].selected,
            }"
            :aria-pressed="match.outcomes[outcome].selected"
            :aria-label="`Toggle outcome ${outcome} for match ${matchNumber}`"
            @click="toggleOutcome(outcome)"
          >
            {{ outcome }}
          </button>

          <label class="value-field">
            <span class="mobile-label">Odds</span>

            <input
              :value="match.outcomes[outcome].odds ?? ''"
              type="number"
              min="1"
              step="0.01"
              placeholder="—"
              :aria-label="`Odds for outcome ${outcome}`"
              @input="
                updateOdds(
                  outcome,
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>

          <label class="value-field">
            <span class="mobile-label">Percent</span>

            <div class="input-with-suffix">
              <input
                :value="
                  match.outcomes[outcome].percentage ?? ''
                "
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="—"
                :aria-label="`Percentage for outcome ${outcome}`"
                @input="
                  updatePercentage(
                    outcome,
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />

              <span>%</span>
            </div>
          </label>

          <label class="value-field">
            <span class="mobile-label">Points</span>

            <input
              :value="match.outcomes[outcome].points ?? ''"
              type="number"
              min="0"
              step="1"
              placeholder="—"
              :aria-label="`Points for outcome ${outcome}`"
              @input="
                updatePoints(
                  outcome,
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>

          <button
            type="button"
            class="colour-assignment"
            :class="{
              disabled: !activeColour,
              assigned:
                activeColour &&
                match.outcomes[outcome].colours.includes(
                  activeColour,
                ),
            }"
            :disabled="!activeColour"
            :aria-label="
              activeColour
                ? `Toggle ${activeColour} colour for outcome ${outcome}`
                : 'Select a colour group first'
            "
            @click="toggleActiveColour(outcome)"
          >
            <span
              v-if="activeColour"
              class="active-colour-dot"
              :class="colourClass(activeColour)"
            />

            <span>
              {{
                activeColour
                  ? match.outcomes[outcome].colours.includes(
                      activeColour,
                    )
                    ? 'Assigned'
                    : 'Add colour'
                  : 'No colour selected'
              }}
            </span>
          </button>

          <div
            v-if="match.outcomes[outcome].colours.length > 0"
            class="assigned-colours"
            aria-label="Assigned colour groups"
          >
            <span
              v-for="colour in match.outcomes[outcome].colours"
              :key="colour"
              class="colour-dot"
              :class="colourClass(colour)"
              :title="colour"
            />
          </div>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped>
.match-row {
  overflow: hidden;
  border: 1px solid #40525e;
  border-radius: 0.55rem;
  background: #30424d;
  color: #eef7f8;
}

.match-header {
  display: grid;
  grid-template-columns:
    2rem
    minmax(0, 1fr)
    minmax(10rem, auto)
    2rem;
  gap: 0.55rem;
  align-items: center;
  min-height: 2.4rem;
  padding: 0.35rem 0.45rem;
  background: #3b505c;
}

.match-number {
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
}

.team-fields {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    minmax(0, 1fr);
  gap: 0.35rem;
  align-items: center;
}

.team-input {
  width: 100%;
  min-width: 0;
  padding: 0.25rem 0.35rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  outline: none;
  background: transparent;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
}

.team-input::placeholder {
  color: #9fb0ba;
}

.team-input:hover,
.team-input:focus {
  border-color: #607783;
  background: #293a44;
}

.team-separator {
  color: #9fb0ba;
}

.start-time-input {
  width: 100%;
  padding: 0.25rem 0.35rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  outline: none;
  background: transparent;
  color: #aebdc5;
  font-size: 0.72rem;
}

.start-time-input:hover,
.start-time-input:focus {
  border-color: #607783;
  background: #293a44;
}

.start-time-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.65;
}

.remove-button {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
  place-items: center;
  border-radius: 0.35rem;
  background: transparent;
  color: #9fb0ba;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
}

.remove-button:hover {
  background: #563b42;
  color: #ff7a81;
}

.match-content {
  display: grid;
  grid-template-columns: 4.8rem minmax(0, 1fr);
  min-height: 9rem;
}

.data-labels {
  display: grid;
  grid-template-rows: repeat(3, 2rem);
  gap: 0.3rem;
  align-content: start;
  padding: 2.9rem 0.45rem 0.5rem;
  color: #9fb0ba;
  font-size: 0.68rem;
}

.data-labels span {
  display: flex;
  align-items: center;
}

.outcome-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.35rem;
  padding: 0.4rem;
}

.outcome-column {
  position: relative;
  display: grid;
  grid-template-rows: 2.3rem repeat(3, 2rem) auto;
  gap: 0.3rem;
  min-width: 0;
  padding: 0.35rem;
  border: 1px solid #40525e;
  border-radius: 0.45rem;
  background: #293a44;
}

.outcome-column.selected {
  border-color: #55dbc4;
}

.outcome-select-button {
  display: grid;
  width: 100%;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 0.4rem;
  background: #22323b;
  color: #60727d;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 800;
}

.outcome-select-button:hover {
  border-color: #5b727e;
}

.outcome-select-button.selected {
  border-color: #55dbc4;
  background: #55dbc4;
  color: #17323a;
}

.value-field {
  display: block;
  min-width: 0;
}

.value-field input {
  width: 100%;
  height: 2rem;
  min-width: 0;
  padding: 0.25rem 0.35rem;
  border: 1px solid #465b67;
  border-radius: 0.35rem;
  outline: none;
  background: #344954;
  color: #f5fbfc;
  font-size: 0.75rem;
  text-align: center;
}

.value-field input::placeholder {
  color: #738792;
}

.value-field input:focus {
  border-color: #55dbc4;
}

.input-with-suffix {
  position: relative;
}

.input-with-suffix input {
  padding-right: 1.2rem;
}

.input-with-suffix span {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  color: #91a4ae;
  font-size: 0.68rem;
  transform: translateY(-50%);
  pointer-events: none;
}

.mobile-label {
  display: none;
}

.colour-assignment {
  display: flex;
  min-height: 1.8rem;
  padding: 0.3rem 0.4rem;
  justify-content: center;
  gap: 0.35rem;
  align-items: center;
  border: 1px solid #465b67;
  border-radius: 0.35rem;
  background: #344954;
  color: #b7c5cb;
  cursor: pointer;
  font-size: 0.65rem;
}

.colour-assignment:hover:not(:disabled) {
  border-color: #6f8793;
}

.colour-assignment.assigned {
  border-color: #55dbc4;
  background: #284d4b;
  color: #eafffb;
}

.colour-assignment.disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.active-colour-dot,
.colour-dot {
  display: inline-block;
  width: 0.65rem;
  height: 0.65rem;
  flex: 0 0 auto;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.assigned-colours {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: flex;
  gap: 0.2rem;
}

.colour-blue {
  border-color: #18c9ea;
  background: #18c9ea;
}

.colour-yellow {
  border-color: #ffd21c;
  background: #ffd21c;
}

.colour-red {
  border-color: #ff624f;
  background: #ff624f;
}

.colour-green {
  border-color: #16c777;
  background: #16c777;
}

@media (max-width: 780px) {
  .match-header {
    grid-template-columns: 2rem minmax(0, 1fr) 2rem;
  }

  .start-time-input {
    grid-column: 2;
  }

  .remove-button {
    grid-column: 3;
    grid-row: 1 / span 2;
  }

  .match-content {
    grid-template-columns: 1fr;
  }

  .data-labels {
    display: none;
  }

  .mobile-label {
    display: block;
    margin-bottom: 0.15rem;
    color: #8fa2ac;
    font-size: 0.6rem;
  }

  .outcome-column {
    grid-template-rows: auto;
  }

  .value-field input {
    height: 2.2rem;
  }
}

@media (max-width: 540px) {
  .team-fields {
    grid-template-columns: 1fr;
  }

  .team-separator {
    display: none;
  }

  .outcome-grid {
    grid-template-columns: 1fr;
  }

  .assigned-colours {
    top: 0.75rem;
  }
}
</style>