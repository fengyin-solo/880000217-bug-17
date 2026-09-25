<script setup>
import { TASK_SCOPES } from '../../utils/restorationQueries'

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const scopeOptions = Object.values(TASK_SCOPES)
</script>

<template>
  <div class="scope-bar">
    <div class="scope-tabs" role="group" aria-label="高风险任务查询范围">
      <button
        v-for="option in scopeOptions"
        :key="option.key"
        type="button"
        class="scope-tab"
        :class="{ 'scope-tab--active': modelValue === option.key }"
        :title="option.hint"
        :disabled="loading"
        @click="emit('update:modelValue', option.key)"
      >
        {{ option.label }}
      </button>
    </div>
    <p class="scope-hint">{{ TASK_SCOPES[modelValue].hint }}</p>
    <button
      type="button"
      class="scope-refresh"
      :disabled="loading"
      @click="emit('refresh')"
    >
      {{ loading ? '查询中…' : '重新查询' }}
    </button>
  </div>
</template>

<style scoped>
.scope-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px;
  border: 1px solid rgba(79, 57, 32, 0.12);
  border-radius: 18px;
  background: rgba(255, 251, 245, 0.88);
}

.scope-tabs {
  display: inline-flex;
  border-radius: 999px;
  border: 1px solid rgba(79, 57, 32, 0.18);
  overflow: hidden;
}

.scope-tab {
  border: 0;
  padding: 8px 16px;
  background: transparent;
  color: #6a5439;
  font: inherit;
  font-size: 0.86rem;
  cursor: pointer;
}

.scope-tab + .scope-tab {
  border-left: 1px solid rgba(79, 57, 32, 0.18);
}

.scope-tab--active {
  background: #7e6038;
  color: #fff8eb;
}

.scope-tab:disabled {
  cursor: wait;
  opacity: 0.7;
}

.scope-hint {
  margin: 0;
  flex: 1;
  min-width: 180px;
  font-size: 0.8rem;
  color: #82684b;
}

.scope-refresh {
  border: 1px solid rgba(126, 96, 56, 0.4);
  border-radius: 999px;
  padding: 8px 16px;
  background: transparent;
  color: #7e6038;
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;
}

.scope-refresh:hover:not(:disabled) {
  background: #efe2ca;
}

.scope-refresh:disabled {
  cursor: wait;
  opacity: 0.7;
}
</style>
