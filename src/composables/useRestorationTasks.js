import { computed, ref } from 'vue'

import { restorationTasks } from '../data/restorationData'
import {
  isHighRiskTask,
  isOwnerMissing,
  isStageMissing,
} from '../utils/restorationFormatters'

export const taskScopes = [
  { key: 'all', label: '全部任务' },
  { key: 'high', label: '高风险' },
  { key: 'incomplete', label: '信息待补' },
  { key: 'archived', label: '已归档' },
]

const scopePredicates = {
  // 全部：不做额外过滤
  all: () => true,
  // 高风险：统一走 isHighRiskTask，负责人或阶段缺失也会命中
  high: isHighRiskTask,
  // 信息待补：缺少负责人或缺少阶段的记录仍要能查到
  incomplete: (task) => isOwnerMissing(task) || isStageMissing(task),
  // 已归档：当前没有归档记录，用于演示空结果与重试
  archived: (task) => task.stage === '已归档',
}

// 模拟异步数据源，查询与重试都走同一条通道
function fetchTaskRows(targetScope) {
  const predicate = scopePredicates[targetScope] ?? scopePredicates.all
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(restorationTasks.filter(predicate))
    }, 120)
  })
}

// 模块级单例状态：修复总览与任务清单共用，切换面板也不会重置
const tasks = ref(restorationTasks.map((task) => ({ ...task })))
const scope = ref('all')
const rows = ref([])
const loading = ref(false)
const loadedScope = ref(null)
const lastLoadedAt = ref(null)

let inFlight = null
let pendingRun = false

function countByScope(targetScope) {
  const predicate = scopePredicates[targetScope] ?? scopePredicates.all
  return tasks.value.filter(predicate).length
}

const scopeCounts = computed(() =>
  Object.fromEntries(
    taskScopes.map((item) => [item.key, countByScope(item.key)]),
  ),
)

// 高风险清单与计数只从统一谓词派生，两处视图共用同一份结果
const highRiskTasks = computed(() => tasks.value.filter(isHighRiskTask))
const highRiskCount = computed(() => highRiskTasks.value.length)

// 参与修复师只统计已分派的负责人，null/空串不计入
const ownerCount = computed(
  () =>
    new Set(
      tasks.value
        .map((task) => task.owner)
        .filter(
          (owner) => owner !== null && owner !== undefined && owner !== '',
        ),
    ).size,
)

const isEmpty = computed(
  () => !loading.value && loadedScope.value === scope.value && rows.value.length === 0,
)

function runQuery() {
  // Promise 在同步阶段就挂到 inFlight：重复提交（含同一 tick 内的连点）
  // 一律复用同一个在途 Promise，避免并发查询把列表/计数冲回旧状态
  if (inFlight) {
    pendingRun = true
    return inFlight
  }

  const targetScope = scope.value
  loading.value = true
  const promise = (async () => {
    try {
      const result = await fetchTaskRows(targetScope)
      // 只提交最后一次选定范围的结果，杜绝切换面板后的旧计数残留
      if (scope.value === targetScope) {
        rows.value = result
        loadedScope.value = targetScope
        lastLoadedAt.value = new Date()
      }
      return result
    } finally {
      if (inFlight === promise) {
        inFlight = null
      }
      loading.value = false
      // 在途期间若切换过范围（当前范围还没拿到结果），补查最后一次范围；
      // 同范围的重复提交则直接复用结果，不再额外发请求
      if (pendingRun) {
        pendingRun = false
        if (loadedScope.value !== scope.value) {
          runQuery()
        }
      }
    }
  })()

  inFlight = promise
  return promise
}

function setScope(nextScope) {
  if (!scopePredicates[nextScope] || nextScope === scope.value) {
    return
  }
  scope.value = nextScope
  void runQuery()
}

// 空结果后重试：直接按当前范围重新查询
function retry() {
  return runQuery()
}

// 首次加载即拉取默认范围，保证两个视图进入时数据已就位
void runQuery()

export function useRestorationTasks() {
  return {
    tasks,
    scope,
    scopes: taskScopes,
    scopeCounts,
    rows,
    loading,
    isEmpty,
    lastLoadedAt,
    highRiskTasks,
    highRiskCount,
    ownerCount,
    runQuery,
    setScope,
    retry,
  }
}
