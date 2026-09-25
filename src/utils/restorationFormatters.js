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

  return map[risk] ?? map.low
}

export const MISSING_TEXT = '待补录'

export function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function displayText(value, fallback = MISSING_TEXT) {
  return hasText(value) ? value : fallback
}
