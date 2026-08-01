<script setup lang="ts">
import type {
  MatchItem,
  Outcome,
  OutcomeDistribution,
} from '@/types/reducer'

defineProps<{
  matches: MatchItem[]
  distributions: OutcomeDistribution[]
  overallPercentages: Record<Outcome, number>
  hasGeneratedRows: boolean
}>()

const outcomes: Outcome[] = ['1', 'X', '2']

function distributionForMatch(
  distributions: OutcomeDistribution[],
  matchId: string,
): OutcomeDistribution | undefined {
  return distributions.find((distribution) => {
    return distribution.matchId === matchId
  })
}

function percentageFor(
  distributions: OutcomeDistribution[],
  matchId: string,
  outcome: Outcome,
): number {
  return (
    distributionForMatch(distributions, matchId)
      ?.percentages[outcome] ?? 0
  )
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

function createMatchLabel(
  match: MatchItem,
  index: number,
): string {
  const homeTeam = match.homeTeam.trim()
  const awayTeam = match.awayTeam.trim()

  if (homeTeam && awayTeam) {
    return `${homeTeam} - ${awayTeam}`
  }

  if (homeTeam) {
    return homeTeam
  }

  if (awayTeam) {
    return awayTeam
  }

  return `Match ${index + 1}`
}

function outcomeClass(outcome: Outcome): string {
  if (outcome === '1') {
    return 'outcome-one'
  }

  if (outcome === 'X') {
    return 'outcome-draw'
  }

  return 'outcome-two'
}
</script>

<template>
  <section class="distribution-panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">
          System analysis
        </p>

        <h2>Outcome distribution</h2>

        <p>
          See how often each outcome appears in the reduced system.
        </p>
      </div>

      <span
        class="status-badge"
        :class="{ active: hasGeneratedRows }"
      >
        {{
          hasGeneratedRows
            ? 'Generated'
            : 'Waiting for generation'
        }}
      </span>
    </header>

    <div
      v-if="hasGeneratedRows"
      class="panel-content"
    >
      <section class="overall-section">
        <div class="section-heading">
          <div>
            <p class="section-label">
              Complete system
            </p>

            <h3>Overall distribution</h3>
          </div>
        </div>

        <div class="overall-grid">
          <article
            v-for="outcome in outcomes"
            :key="outcome"
            class="overall-card"
            :class="outcomeClass(outcome)"
          >
            <span class="outcome-badge">
              {{ outcome }}
            </span>

            <strong>
              {{ formatPercentage(
                overallPercentages[outcome],
              ) }}%
            </strong>

            <span class="card-label">
              of all selections
            </span>

            <div class="progress-track">
              <span
                class="progress-fill"
                :style="{
                  width: `${overallPercentages[outcome]}%`,
                }"
              />
            </div>
          </article>
        </div>
      </section>

      <section class="matches-section">
        <div class="section-heading">
          <div>
            <p class="section-label">
              Match-by-match
            </p>

            <h3>Distribution per match</h3>
          </div>

          <span class="match-count">
            {{ matches.length }}
            {{ matches.length === 1 ? 'match' : 'matches' }}
          </span>
        </div>

        <div class="distribution-list">
          <article
            v-for="(match, index) in matches"
            :key="match.id"
            class="distribution-row"
          >
            <div class="match-information">
              <span class="match-number">
                {{ index + 1 }}
              </span>

              <div>
                <strong>
                  {{ createMatchLabel(match, index) }}
                </strong>

                <span>
                  Reduced-row outcome frequency
                </span>
              </div>
            </div>

            <div class="outcome-bars">
              <div
                v-for="outcome in outcomes"
                :key="outcome"
                class="outcome-bar-row"
              >
                <span
                  class="small-outcome-badge"
                  :class="outcomeClass(outcome)"
                >
                  {{ outcome }}
                </span>

                <div class="bar-track">
                  <span
                    class="bar-fill"
                    :class="outcomeClass(outcome)"
                    :style="{
                      width: `${percentageFor(
                        distributions,
                        match.id,
                        outcome,
                      )}%`,
                    }"
                  />
                </div>

                <strong>
                  {{
                    formatPercentage(
                      percentageFor(
                        distributions,
                        match.id,
                        outcome,
                      ),
                    )
                  }}%
                </strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-chart">
        <span />
        <span />
        <span />
      </div>

      <h3>No distribution yet</h3>

      <p>
        Generate the reduced system to calculate outcome
        percentages.
      </p>
    </div>
  </section>
</template>

<style scoped>
.distribution-panel {
  overflow: hidden;
  border: 1px solid #3f535f;
  border-radius: 0.6rem;
  background: #293b45;
  color: #edf6f7;
}

.panel-header {
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

.panel-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.1rem;
}

.panel-header p:last-child {
  margin: 0.35rem 0 0;
  color: #9eb0b9;
  font-size: 0.75rem;
}

.status-badge {
  flex-shrink: 0;
  padding: 0.4rem 0.65rem;
  border: 1px solid #536873;
  border-radius: 999px;
  background: #263842;
  color: #8fa2ab;
  font-size: 0.64rem;
  font-weight: 700;
}

.status-badge.active {
  border-color: #55dbc4;
  background: #24594f;
  color: #eafffb;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.9rem;
}

.overall-section,
.matches-section {
  overflow: hidden;
  border: 1px solid #40545f;
  border-radius: 0.5rem;
  background: #2d404b;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.7rem 0.8rem;
  border-bottom: 1px solid #40545f;
  background: #354b57;
}

.section-label {
  margin: 0 0 0.15rem;
  color: #8297a1;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.section-heading h3 {
  margin: 0;
  color: #edf6f7;
  font-size: 0.85rem;
}

.match-count {
  padding: 0.35rem 0.55rem;
  border: 1px solid #506671;
  border-radius: 999px;
  color: #aebec5;
  font-size: 0.62rem;
  font-weight: 700;
}

.overall-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  padding: 0.8rem;
}

.overall-card {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid #435964;
  border-radius: 0.45rem;
  background: #293b45;
}

.overall-card strong {
  color: #ffffff;
  font-size: 1.25rem;
}

.card-label {
  color: #8ea1aa;
  font-size: 0.62rem;
}

.outcome-badge {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 0.35rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.progress-track,
.bar-track {
  overflow: hidden;
  border-radius: 999px;
  background: #22333c;
}

.progress-track {
  height: 0.35rem;
  margin-top: 0.2rem;
}

.progress-fill,
.bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.overall-card.outcome-one .outcome-badge,
.small-outcome-badge.outcome-one,
.progress-fill.outcome-one,
.bar-fill.outcome-one {
  background: #55dbc4;
  color: #17353b;
}

.overall-card.outcome-one .progress-fill {
  background: #55dbc4;
}

.overall-card.outcome-draw .outcome-badge,
.small-outcome-badge.outcome-draw,
.progress-fill.outcome-draw,
.bar-fill.outcome-draw {
  background: #ffd267;
  color: #443412;
}

.overall-card.outcome-draw .progress-fill {
  background: #ffd267;
}

.overall-card.outcome-two .outcome-badge,
.small-outcome-badge.outcome-two,
.progress-fill.outcome-two,
.bar-fill.outcome-two {
  background: #66a9ff;
  color: #142d4c;
}

.overall-card.outcome-two .progress-fill {
  background: #66a9ff;
}

.distribution-list {
  display: flex;
  flex-direction: column;
}

.distribution-row {
  display: grid;
  grid-template-columns: minmax(11rem, 0.8fr) minmax(14rem, 1.2fr);
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0.8rem;
  border-bottom: 1px solid #3b4f5a;
}

.distribution-row:last-child {
  border-bottom: 0;
}

.match-information {
  display: flex;
  min-width: 0;
  gap: 0.65rem;
  align-items: center;
}

.match-number {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #506671;
  border-radius: 0.35rem;
  background: #243640;
  color: #aebec5;
  font-size: 0.68rem;
  font-weight: 800;
}

.match-information div {
  min-width: 0;
}

.match-information strong {
  display: block;
  overflow: hidden;
  color: #e8f1f3;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-information span:last-child {
  display: block;
  margin-top: 0.15rem;
  color: #8297a1;
  font-size: 0.58rem;
}

.outcome-bars {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.outcome-bar-row {
  display: grid;
  grid-template-columns: 1.8rem minmax(0, 1fr) 3.3rem;
  gap: 0.55rem;
  align-items: center;
}

.small-outcome-badge {
  display: grid;
  width: 1.7rem;
  height: 1.4rem;
  place-items: center;
  border-radius: 0.25rem;
  font-size: 0.62rem;
  font-weight: 800;
}

.bar-track {
  height: 0.45rem;
}

.outcome-bar-row strong {
  color: #cbd8dc;
  font-size: 0.63rem;
  text-align: right;
}

.empty-state {
  display: grid;
  min-height: 18rem;
  padding: 2rem;
  place-items: center;
  align-content: center;
  text-align: center;
}

.empty-chart {
  display: flex;
  height: 3.3rem;
  margin-bottom: 0.8rem;
  gap: 0.35rem;
  align-items: flex-end;
}

.empty-chart span {
  width: 0.7rem;
  border-radius: 0.25rem 0.25rem 0 0;
  background: #3f5661;
}

.empty-chart span:nth-child(1) {
  height: 45%;
}

.empty-chart span:nth-child(2) {
  height: 85%;
}

.empty-chart span:nth-child(3) {
  height: 65%;
}

.empty-state h3 {
  margin: 0;
  color: #dce8eb;
  font-size: 0.95rem;
}

.empty-state p {
  max-width: 24rem;
  margin: 0.4rem 0 0;
  color: #8ea1aa;
  font-size: 0.72rem;
  line-height: 1.45;
}

@media (max-width: 720px) {
  .overall-grid {
    grid-template-columns: 1fr;
  }

  .distribution-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .panel-header {
    flex-direction: column;
  }

  .status-badge {
    align-self: flex-start;
  }
}
</style>