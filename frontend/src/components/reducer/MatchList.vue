<script setup lang="ts">
import MatchRow from '@/components/reducer/MatchRow.vue'

import type {
  ColourId,
  MatchItem,
} from '@/types/reducer'

import { createEmptyMatch } from '@/utils/defaults'

const props = defineProps<{
  modelValue: MatchItem[]
  activeColour?: ColourId | null
}>()

const emit = defineEmits<{
  'update:modelValue': [matches: MatchItem[]]
}>()

function addMatch(): void {
  emit('update:modelValue', [
    ...props.modelValue,
    createEmptyMatch(),
  ])
}

function updateMatch(updatedMatch: MatchItem): void {
  const updatedMatches = props.modelValue.map((match) => {
    return match.id === updatedMatch.id
      ? updatedMatch
      : match
  })

  emit('update:modelValue', updatedMatches)
}

function removeMatch(id: string): void {
  const updatedMatches = props.modelValue.filter((match) => {
    return match.id !== id
  })

  emit('update:modelValue', updatedMatches)
}

function clearAllMatches(): void {
  emit('update:modelValue', [])
}
</script>

<template>
  <section class="match-list">
    <header class="match-list-header">
      <div class="header-copy">
        <p class="eyebrow">
          Custom coupon
        </p>

        <h2>Matches</h2>

        <p>
          Add your own matches and select the possible
          outcomes for each one.
        </p>
      </div>

      <div class="header-actions">
        <span class="match-count">
          {{ modelValue.length }}
          {{ modelValue.length === 1 ? 'match' : 'matches' }}
        </span>

        <button
          v-if="modelValue.length > 0"
          type="button"
          class="clear-button"
          @click="clearAllMatches"
        >
          Clear
        </button>
      </div>
    </header>

    <div
      v-if="activeColour"
      class="active-colour-banner"
    >
      <span
        class="active-colour-dot"
        :class="`colour-${activeColour}`"
      />

      <span>
        Colour assignment is active:
        <strong>{{ activeColour }}</strong>
      </span>

      <span class="banner-help">
        Click “Add colour” beneath an outcome.
      </span>
    </div>

    <div
      v-if="modelValue.length > 0"
      class="match-rows"
    >
      <MatchRow
        v-for="(match, index) in modelValue"
        :key="match.id"
        :match="match"
        :match-number="index + 1"
        :active-colour="activeColour"
        @update="updateMatch"
        @remove="removeMatch"
      />
    </div>

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">
        +
      </div>

      <h3>No matches added</h3>

      <p>
        Add your first match to start building the system.
      </p>
    </div>

    <button
      type="button"
      class="add-match-button"
      @click="addMatch"
    >
      <span class="add-icon">+</span>
      Add match
    </button>
  </section>
</template>

<style scoped>
.match-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-width: 0;
}

.match-list-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.9rem 1rem;
  border: 1px solid #3f535f;
  border-radius: 0.55rem;
  background: #2f424d;
}

.header-copy {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: #55dbc4;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-copy h2 {
  margin: 0;
  color: #f5fbfc;
  font-size: 1.15rem;
}

.header-copy p:last-child {
  max-width: 35rem;
  margin: 0.35rem 0 0;
  color: #9eb0ba;
  font-size: 0.78rem;
  line-height: 1.45;
}

.header-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.5rem;
  align-items: center;
}

.match-count {
  padding: 0.42rem 0.65rem;
  border: 1px solid #4c626e;
  border-radius: 999px;
  background: #263842;
  color: #c8d5da;
  font-size: 0.72rem;
  font-weight: 700;
}

.clear-button {
  padding: 0.42rem 0.65rem;
  border: 1px solid #5b4a50;
  border-radius: 0.4rem;
  background: #3a3035;
  color: #f08b91;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
}

.clear-button:hover {
  border-color: #d45b65;
  background: #4a333a;
  color: #ffadb2;
}

.active-colour-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  padding: 0.65rem 0.8rem;
  border: 1px solid #4a6570;
  border-radius: 0.5rem;
  background: #263b46;
  color: #c7d4da;
  font-size: 0.75rem;
}

.active-colour-banner strong {
  text-transform: capitalize;
}

.active-colour-dot {
  width: 0.8rem;
  height: 0.8rem;
  flex: 0 0 auto;
  border-radius: 50%;
}

.banner-help {
  color: #8fa3ad;
}

.match-rows {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.empty-state {
  display: grid;
  min-height: 14rem;
  padding: 2rem;
  place-items: center;
  align-content: center;
  border: 1px dashed #4d626d;
  border-radius: 0.55rem;
  background: #293b45;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.7rem;
  place-items: center;
  border: 1px solid #4e6a75;
  border-radius: 50%;
  background: #334b56;
  color: #55dbc4;
  font-size: 1.8rem;
  font-weight: 300;
}

.empty-state h3 {
  margin: 0;
  color: #edf7f8;
  font-size: 1rem;
}

.empty-state p {
  margin: 0.4rem 0 0;
  color: #91a5af;
  font-size: 0.78rem;
}

.add-match-button {
  display: flex;
  width: 100%;
  min-height: 3rem;
  justify-content: center;
  gap: 0.55rem;
  align-items: center;
  border: 1px dashed #4f6b76;
  border-radius: 0.5rem;
  background: #2a3d47;
  color: #b9c8ce;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
}

.add-match-button:hover {
  border-color: #55dbc4;
  background: #304b52;
  color: #e9fffb;
}

.add-icon {
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  border-radius: 50%;
  background: #55dbc4;
  color: #17343a;
  font-size: 1.15rem;
  line-height: 1;
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

@media (max-width: 650px) {
  .match-list-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .active-colour-banner {
    align-items: flex-start;
  }

  .banner-help {
    width: 100%;
    padding-left: 1.25rem;
  }
}
</style>