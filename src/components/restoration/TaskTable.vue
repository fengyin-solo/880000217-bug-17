<script setup>
import { riskMeta, displayText } from '../../utils/restorationFormatters'

defineProps({
  rows: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['retry'])
</script>

<template>
  <div class="task-table">
    <div class="task-row task-head">
      <span>对象</span>
      <span>阶段</span>
      <span>风险</span>
      <span>负责人</span>
      <span>说明</span>
    </div>

    <div v-if="loading" class="task-row task-state">
      <span class="state-text">任务查询中，请稍候…</span>
    </div>

    <div v-else-if="error" class="task-row task-state">
      <span class="state-text">
        {{ error }}
        <button type="button" class="state-action" @click="emit('retry')">
          重新查询
        </button>
      </span>
    </div>

    <div v-else-if="rows.length === 0" class="task-row task-state">
      <span class="state-text">
        当前范围内暂未查到任务
        <button type="button" class="state-action" @click="emit('retry')">
          重试
        </button>
      </span>
    </div>

    <template v-else>
      <div
        v-for="(row, index) in rows"
        :key="`${row.title}-${index}`"
        class="task-row"
      >
        <span>{{ row.title }}</span>
        <span class="cell--missing" :class="{ 'cell--blank': !row.stage }">
          {{ displayText(row.stage) }}
        </span>
        <span :class="['risk-tag', `risk-tag--${riskMeta(row.risk).tone}`]">
          {{ riskMeta(row.risk).label }}
        </span>
        <span class="cell--missing" :class="{ 'cell--blank': !row.owner }">
          {{ displayText(row.owner) }}
        </span>
        <span>{{ row.note }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task-table {
  overflow: hidden;
  border: 1px solid rgba(79, 57, 32, 0.1);
  border-radius: 18px;
}

.task-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.6fr 0.7fr 1.3fr;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.72);
}

.task-row + .task-row {
  border-top: 1px solid rgba(79, 57, 32, 0.08);
}

.task-head {
  background: #efe1c6;
  color: #775936;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.76rem;
}

.task-state {
  grid-template-columns: 1fr;
  justify-content: start;
  color: #82684b;
}

.state-text {
  font-size: 0.9rem;
}

.state-action {
  margin-left: 10px;
  border: 1px solid rgba(126, 96, 56, 0.4);
  border-radius: 999px;
  padding: 4px 14px;
  background: transparent;
  color: #7e6038;
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
}

.state-action:hover {
  background: #efe2ca;
}

.cell--blank {
  color: #a98b63;
  font-style: italic;
}

.risk-tag {
  display: inline-flex;
  justify-content: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
}

.risk-tag--high {
  background: #efd0c9;
  color: #913d2f;
}

.risk-tag--medium {
  background: #f6e5b9;
  color: #8b6314;
}

.risk-tag--low {
  background: #d9ead9;
  color: #366338;
}

@media (max-width: 900px) {
  .task-table {
    overflow-x: auto;
  }

  .task-row {
    min-width: 780px;
  }
}
</style>
