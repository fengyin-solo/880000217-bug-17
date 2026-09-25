import { computed } from 'vue'

import { restorationBatches, restorationEnvironment } from '../data/restorationData'
import { useRestorationTasks } from './useRestorationTasks'

export function useRestorationOverview() {
  const { highRiskCount, ownerCount } = useRestorationTasks()

  const batchCount = computed(() => restorationBatches.length)
  const environmentCount = computed(() => restorationEnvironment.length)

  return {
    batchCount,
    highRiskCount,
    environmentCount,
    ownerCount,
  }
}
