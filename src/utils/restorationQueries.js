import { hasText } from '../utils/restorationFormatters'

// 查询范围：all 保留负责人或阶段缺失的记录；assigned 只看已分派负责人的任务。
export const TASK_SCOPES = {
  all: { key: 'all', label: '全部记录', hint: '含负责人或阶段缺失、待补录的任务' },
  assigned: { key: 'assigned', label: '仅已分派', hint: '只统计已分派负责人的任务' },
}

export const DEFAULT_TASK_SCOPE = TASK_SCOPES.all.key

const RISK_ORDER = { high: 0, medium: 1, low: 2 }

export function normalizeTask(task) {
  return {
    title: hasText(task?.title) ? task.title : '未命名任务',
    stage: hasText(task?.stage) ? task.stage : '',
    risk: hasText(task?.risk) ? task.risk : 'low',
    owner: hasText(task?.owner) ? task.owner : '',
    note: hasText(task?.note) ? task.note : '',
  }
}

export function isHighRisk(task) {
  return normalizeTask(task).risk === 'high'
}

// 与查询面板完全相同的范围口径：null / 空字符串等缺失值不会被误判为“已分派”。
export function matchesScope(task, scope = DEFAULT_TASK_SCOPE) {
  if (scope === TASK_SCOPES.assigned.key) {
    return hasText(normalizeTask(task).owner)
  }
  return true
}

// 总览与任务清单共用的唯一查询入口，保证两处口径一致。
export function queryTasks(tasks, { scope = DEFAULT_TASK_SCOPE, highRiskOnly = false } = {}) {
  const source = Array.isArray(tasks) ? tasks : []
  return source
    .map(normalizeTask)
    .filter((task) => matchesScope(task, scope))
    .filter((task) => (highRiskOnly ? isHighRisk(task) : true))
    .sort((a, b) => (RISK_ORDER[a.risk] ?? 99) - (RISK_ORDER[b.risk] ?? 99))
}

// 计数必须复用同一查询结果，而不是各写一份过滤条件。
export function countHighRiskTasks(tasks, scope = DEFAULT_TASK_SCOPE) {
  return queryTasks(tasks, { scope, highRiskOnly: true }).length
}
