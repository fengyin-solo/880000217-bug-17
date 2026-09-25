import { computed, ref } from 'vue'

import {
  fetchRestorationTasks,
  fetchRestorationTasksFresh,
} from '../services/restorationTaskService'
import {
  DEFAULT_TASK_SCOPE,
  TASK_SCOPES,
  queryTasks,
} from '../utils/restorationQueries'

const MAX_ATTEMPTS = 3
const RETRY_GAP_MS = 120

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 模块级单例：总览与任务清单共享同一份数据和同一个查询范围，
// 从任务清单返回总览（或反向切换）时不会重建状态，旧计数无从残留。
const tasks = ref([])
const scope = ref(DEFAULT_TASK_SCOPE)
const loading = ref(false)
const loaded = ref(false)
const error = ref('')

let requestToken = 0
let activePromise = null

export function useRestorationTasks() {
  const scopedTasks = computed(() => queryTasks(tasks.value, { scope: scope.value }))

  const highRiskTasks = computed(() =>
    queryTasks(tasks.value, { scope: scope.value, highRiskOnly: true }),
  )

  const highRiskCount = computed(() => highRiskTasks.value.length)

  const isEmpty = computed(
    () => loaded.value && !loading.value && scopedTasks.value.length === 0,
  )

  function setScope(nextScope) {
    if (!TASK_SCOPES[nextScope] || nextScope === scope.value) {
      return
    }
    // 同步切换：计数全部由 computed 从共享数据推导，不存在上一范围的旧值停留。
    scope.value = nextScope
  }

  function loadTasks() {
    // 重复提交：已有进行中的查询时直接复用，不并发打第二次请求。
    if (activePromise) {
      return activePromise
    }

    loading.value = true
    error.value = ''
    const token = ++requestToken

    activePromise = (async () => {
      let result = []
      try {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
          result =
            attempt === 1
              ? await fetchRestorationTasks()
              : await fetchRestorationTasksFresh()
          if (result.length > 0) {
            break
          }
          // 空结果：等待后重试；重试用尽仍为空则以空列表收尾，由界面引导手动重试。
          await wait(RETRY_GAP_MS)
        }

        // 较新的请求已经发出时丢弃过期响应，避免旧数据覆盖新结果。
        if (token === requestToken) {
          tasks.value = result
          loaded.value = true
        }
      } catch {
        if (token === requestToken) {
          error.value = '任务查询失败，请重试'
        }
      } finally {
        if (token === requestToken) {
          loading.value = false
          activePromise = null
        }
      }

      return result
    })()

    return activePromise
  }

  // 手动重试（空结果或失败后）：强制走一次全新请求。
  function retryTasks() {
    if (activePromise) {
      return activePromise
    }
    loaded.value = false
    return loadTasks()
  }

  return {
    scope,
    tasks,
    scopedTasks,
    highRiskTasks,
    highRiskCount,
    loading,
    loaded,
    error,
    isEmpty,
    setScope,
    loadTasks,
    retryTasks,
  }
}
