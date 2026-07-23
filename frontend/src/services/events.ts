import { submitEvents } from './api'
import type { IncomingEvent } from './api'

const BATCH_SIZE = 10
const FLUSH_INTERVAL = 5000

let queue: IncomingEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null

function getDeviceType(): 'MOBILE' | 'TABLET' | 'DESKTOP' {
  const w = window.innerWidth
  if (w < 768) return 'MOBILE'
  if (w < 1024) return 'TABLET'
  return 'DESKTOP'
}

function getSessionId(): string {
  let id = localStorage.getItem('session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('session_id', id)
  }
  return id
}

function push(event: Omit<IncomingEvent, 'clientEventId' | 'sessionId' | 'occurredAt' | 'deviceType'>) {
  queue.push({
    clientEventId: crypto.randomUUID(),
    sessionId: getSessionId(),
    deviceType: getDeviceType(),
    occurredAt: new Date().toISOString(),
    ...event,
  })
  if (queue.length >= BATCH_SIZE) {
    flush()
  } else if (!timer) {
    timer = setTimeout(flush, FLUSH_INTERVAL)
  }
}

function flush() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (queue.length === 0) return
  const batch = queue.splice(0, BATCH_SIZE)
  submitEvents(batch).catch(() => {})
}

window.addEventListener('beforeunload', flush)

export function trackScreenView(screenName: string) {
  push({ name: 'screen_viewed', screenName, responseStatus: 'SUCCESS' })
}

export function trackApiError(screenName: string, errorCode: string) {
  push({ name: 'api_error_encountered', screenName, responseStatus: 'SERVER_ERROR', errorCode })
}

export function trackComparisonView(marketsDisplayed: number) {
  push({ name: 'comparison_viewed', screenName: 'comparison', responseStatus: marketsDisplayed > 0 ? 'SUCCESS' : 'EMPTY', properties: { marketsDisplayed } })
}

export function trackTrendView(hasData: boolean) {
  push({ name: hasData ? 'trend_viewed' : 'trend_insufficient_data_viewed', screenName: 'trend', responseStatus: hasData ? 'SUCCESS' : 'EMPTY' })
}

export function trackPriceSubmission() {
  push({ name: 'price_submission_started', screenName: 'submit', responseStatus: 'SUCCESS' })
}

export function trackSignupStarted() {
  push({ name: 'signup_started', screenName: 'create-account' })
}
