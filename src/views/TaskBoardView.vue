<script setup>
import { onMounted } from 'vue'

import PanelSection from '../components/common/PanelSection.vue'
import TaskTable from '../components/restoration/TaskTable.vue'
import TaskScopeSwitcher from '../components/restoration/TaskScopeSwitcher.vue'
import { useRestorationTasks } from '../composables/useRestorationTasks'

const {
  scope,
  scopedTasks,
  highRiskCount,
  loading,
  error,
  setScope,
  loadTasks,
  retryTasks,
} = useRestorationTasks()

onMounted(() => {
  loadTasks()
})
</script>

<template>
  <div class="view-stack">
    <TaskScopeSwitcher
      :model-value="scope"
      :loading="loading"
      @update:model-value="setScope"
      @refresh="retryTasks"
    />

    <PanelSection title="任务清单" badge="按风险排序">
      <div class="task-summary">
        <span class="task-summary-count">高风险任务：{{ highRiskCount }} 项</span>
      </div>
      <TaskTable
        :rows="scopedTasks"
        :loading="loading"
        :error="error"
        @retry="retryTasks"
      />
    </PanelSection>
  </div>
</template>

<style scoped>
.view-stack {
  display: grid;
  gap: 16px;
}

.task-summary {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.task-summary-count {
  padding: 6px 12px;
  border-radius: 999px;
  background: #efd0c9;
  color: #913d2f;
  font-size: 0.82rem;
}
</style>
