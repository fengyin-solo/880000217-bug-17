import { computed } from 'vue'

import {
  restorationBatches,
  restorationEnvironment,
} from '../data/restorationData'
import { hasText } from '../utils/restorationFormatters'
import { useRestorationTasks } from './useRestorationTasks'

export function useRestorationOverview() {
  const { tasks, highRiskCount } = useRestorationTasks()

  const batchCount = computed(() => restorationBatches.length)
  const environmentCount = computed(() => restorationEnvironment.length)

  // 负责人缺失（null/undefined/空串）的记录不计入修复师人数。
  const ownerCount = computed(
    () => new Set(tasks.value.map((item) => item.owner).filter(hasText)).size,
  )

  return {
    batchCount,
    highRiskCount,
    environmentCount,
    ownerCount,
  }
}
