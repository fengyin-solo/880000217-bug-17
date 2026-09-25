<script setup>
import PanelSection from '../components/common/PanelSection.vue'
import TaskTable from '../components/restoration/TaskTable.vue'
import { useRestorationTasks } from '../composables/useRestorationTasks'

const {
  scope,
  scopes,
  scopeCounts,
  rows,
  loading,
  isEmpty,
  highRiskCount,
  setScope,
  retry,
} = useRestorationTasks()
</script>

<template>
  <div class="view-stack">
    <PanelSection title="任务清单" badge="按风险排序">
      <div class="task-toolbar">
        <div class="scope-switch" role="tablist" aria-label="查询范围">
          <button
            v-for="item in scopes"
            :key="item.key"
            type="button"
            role="tab"
            :aria-selected="scope === item.key"
            :disabled="loading && scope === item.key"
            :class="['scope-chip', { 'scope-chip--active': scope === item.key }]"
            @click="setScope(item.key)"
          >
            {{ item.label }}
            <span class="scope-count">{{ scopeCounts[item.key] }}</span>
          </button>
        </div>

        <!-- 与修复总览共用同一份查询口径：此处高风险数与总览卡片始终一致 -->
        <p class="task-summary">
          当前范围 {{ rows.length }} 条 · 高风险任务
          <strong>{{ highRiskCount }}</strong> 条
        </p>
      </div>

      <div v-if="loading" class="task-state">
        <span class="state-spinner" aria-hidden="true"></span>
        正在查询任务…
      </div>

      <div v-else-if="isEmpty" class="task-state task-state--empty">
        <p>当前查询范围没有任务记录。</p>
        <button type="button" class="retry-button" @click="retry">
          重新查询
        </button>
      </div>

      <TaskTable v-else :rows="rows" />
    </PanelSection>
  </div>
</template>

<style scoped>
.view-stack {
  display: grid;
}

.task-toolbar {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.scope-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.scope-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid rgba(79, 57, 32, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #6a5439;
  font: inherit;
  cursor: pointer;
}

.scope-chip:disabled {
  opacity: 0.6;
  cursor: progress;
}

.scope-chip--active {
  background: #5d4322;
  border-color: #5d4322;
  color: #fff8eb;
}

.scope-count {
  min-width: 1.4em;
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(93, 67, 34, 0.12);
  font-size: 0.8rem;
  text-align: center;
}

.scope-chip--active .scope-count {
  background: rgba(255, 248, 235, 0.22);
}

.task-summary {
  margin: 0;
  color: #6a5439;
  font-size: 0.92rem;
}

.task-summary strong {
  color: #913d2f;
}

.task-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 16px;
  border: 1px dashed rgba(121, 88, 47, 0.3);
  border-radius: 18px;
  color: #6a5439;
  background: rgba(255, 255, 255, 0.5);
}

.task-state--empty {
  flex-direction: column;
  gap: 14px;
}

.task-state--empty p {
  margin: 0;
}

.state-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(93, 67, 34, 0.25);
  border-top-color: #5d4322;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.retry-button {
  padding: 9px 18px;
  border: none;
  border-radius: 999px;
  background: #5d4322;
  color: #fff8eb;
  font: inherit;
  cursor: pointer;
}

.retry-button:disabled {
  opacity: 0.6;
  cursor: progress;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
