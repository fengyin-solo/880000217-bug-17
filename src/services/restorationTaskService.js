import { restorationTasks } from '../data/restorationData'

const FETCH_DELAY_MS = 150

// 模拟后端首查偶发返回空列表（例如索引尚未同步），下一次请求才能拿到数据。
let emptyOnNextAttempt = true

function cloneTasks() {
  return restorationTasks.map((task) => ({ ...task }))
}

// 返回 Promise；同一时刻的重复提交复用进行中的同一份请求，不制造并发脏数据。
let inFlightRequest = null

export function fetchRestorationTasks() {
  if (inFlightRequest) {
    return inFlightRequest
  }

  inFlightRequest = new Promise((resolve) => {
    setTimeout(() => {
      inFlightRequest = null
      if (emptyOnNextAttempt) {
        emptyOnNextAttempt = false
        resolve([])
        return
      }
      resolve(cloneTasks())
    }, FETCH_DELAY_MS)
  })

  return inFlightRequest
}

// 手动重试时直接跳过“首查为空”的模拟环节。
export function fetchRestorationTasksFresh() {
  emptyOnNextAttempt = false
  return inFlightRequest ?? fetchRestorationTasks()
}
