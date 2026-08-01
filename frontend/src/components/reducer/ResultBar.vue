<script setup lang="ts">
defineProps<{
  mathematicalRowCount: number
  reducedRowCount: number
  hasGenerated: boolean
}>()

const emit = defineEmits<{
  generate: []
  reset: []
  downloadCsv: []
  downloadText: []
}>()

function formatNumber(value: number): string {
  return new Intl.NumberFormat('sv-SE').format(value)
}
</script>

<template>
  <footer class="result-bar">
    <div class="result-bar-content">
      <section class="system-summary">
        <div class="summary-block">
          <span class="summary-label">
            Full system
          </span>

          <div class="summary-value-row">
            <strong>
              {{ formatNumber(mathematicalRowCount) }}
            </strong>

            <span>rows</span>
          </div>
        </div>

        <div class="summary-arrow" aria-hidden="true">
          →
        </div>

        <div class="summary-block reduced">
          <span class="summary-label">
            Reduced system
          </span>

          <div class="summary-value-row">
            <strong>
              {{ formatNumber(reducedRowCount) }}
            </strong>

            <span>rows</span>
          </div>
        </div>

        <div class="reduction-rate">
          <span>Reduction</span>

          <strong>
            {{
              mathematicalRowCount > 0
                ? Math.round(
                    (1 -
                      reducedRowCount /
                        mathematicalRowCount) *
                      100,
                  )
                : 0
            }}%
          </strong>
        </div>
      </section>

      <section class="result-actions">
        <button
          type="button"
          class="action-button secondary"
          @click="emit('reset')"
        >
          Reset
        </button>

        <button
          type="button"
          class="action-button primary"
          :disabled="mathematicalRowCount === 0"
          @click="emit('generate')"
        >
          Generate system
        </button>

        <button
          type="button"
          class="action-button download"
          :disabled="!hasGenerated"
          @click="emit('downloadCsv')"
        >
          Download CSV
        </button>

        <button
          type="button"
          class="action-button download"
          :disabled="!hasGenerated"
          @click="emit('downloadText')"
        >
          Download TXT
        </button>
      </section>
    </div>
  </footer>
</template>

<style scoped>
.result-bar {
  position: fixed;
  z-index: 100;
  right: 0;
  bottom: 0;
  left: 0;
  border-top: 1px solid #405762;
  background: rgb(29 44 53 / 96%);
  box-shadow: 0 -0.8rem 2rem rgb(0 0 0 / 22%);
  backdrop-filter: blur(14px);
}

.result-bar-content {
  display: flex;
  max-width: 1650px;
  min-height: 6.2rem;
  margin: 0 auto;
  padding: 0.85rem 1rem;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
}

.system-summary {
  display: flex;
  min-width: 0;
  gap: 1rem;
  align-items: center;
}

.summary-block {
  min-width: 8rem;
}

.summary-label {
  display: block;
  margin-bottom: 0.25rem;
  color: #879ba5;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.summary-value-row {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
}

.summary-value-row strong {
  color: #ffffff;
  font-size: 1.45rem;
  line-height: 1;
}

.summary-value-row span {
  color: #8fa3ad;
  font-size: 0.7rem;
}

.summary-block.reduced .summary-value-row strong {
  color: #55dbc4;
}

.summary-arrow {
  color: #5d7480;
  font-size: 1.2rem;
}

.reduction-rate {
  display: flex;
  min-width: 6.2rem;
  padding: 0.55rem 0.7rem;
  flex-direction: column;
  align-items: center;
  border: 1px solid #465f6b;
  border-radius: 0.45rem;
  background: #263842;
}

.reduction-rate span {
  color: #8297a1;
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
}

.reduction-rate strong {
  margin-top: 0.15rem;
  color: #55dbc4;
  font-size: 1rem;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: flex-end;
}

.action-button {
  min-height: 2.6rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 0.42rem;
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 800;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    opacity 150ms ease;
}

.action-button.secondary {
  border-color: #526873;
  background: #2d404a;
  color: #b8c7cd;
}

.action-button.secondary:hover {
  border-color: #6d8490;
  color: #ffffff;
}

.action-button.primary {
  border-color: #55dbc4;
  background: #55dbc4;
  color: #17343a;
}

.action-button.primary:hover:not(:disabled) {
  border-color: #7be7d4;
  background: #7be7d4;
}

.action-button.download {
  border-color: #536b77;
  background: #344a55;
  color: #d1dde1;
}

.action-button.download:hover:not(:disabled) {
  border-color: #55dbc4;
  color: #ffffff;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.action-button:focus-visible {
  outline: 2px solid #55dbc4;
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .result-bar-content {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .system-summary {
    justify-content: center;
  }

  .result-actions {
    justify-content: center;
  }
}

@media (max-width: 580px) {
  .system-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .summary-arrow {
    display: none;
  }

  .reduction-rate {
    grid-column: 1 / -1;
    width: 100%;
  }

  .result-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .action-button {
    width: 100%;
  }
}
</style>