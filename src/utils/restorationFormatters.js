export function riskMeta(risk) {
  const map = {
    high: {
      label: '高',
      tone: 'high',
    },
    medium: {
      label: '中',
      tone: 'medium',
    },
    low: {
      label: '低',
      tone: 'low',
    },
  }

  // 风险字段缺失或无法识别时不再误判为“低”，用中性标签提示待核实
  return map[risk] ?? { label: '待核实', tone: 'unknown' }
}

export const RISK_HIGH = 'high'

/**
 * 统一的高风险判定口径：只看风险字段本身。
 * 负责人（owner）或阶段（stage）缺失的记录同样会被命中，
 * 总览统计与任务清单筛选都必须走这个谓词，避免两边数量对不上。
 */
export function isHighRiskTask(task) {
  return Boolean(task) && task.risk === RISK_HIGH
}

/** 负责人或阶段尚未登记时的占位文案 */
export function missingOwnerLabel() {
  return '待分派'
}

export function missingStageLabel() {
  return '待补录'
}

export function displayOwner(owner) {
  return owner === null || owner === undefined || owner === ''
    ? missingOwnerLabel()
    : owner
}

export function displayStage(stage) {
  return stage === null || stage === undefined || stage === ''
    ? missingStageLabel()
    : stage
}

export function isOwnerMissing(task) {
  return (
    !task ||
    task.owner === null ||
    task.owner === undefined ||
    task.owner === ''
  )
}

export function isStageMissing(task) {
  return (
    !task ||
    task.stage === null ||
    task.stage === undefined ||
    task.stage === ''
  )
}
