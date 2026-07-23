const STORAGE_KEY = 'price_reports'

interface Report {
  product: string
  market: string
  count: number
}

function getReports(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveReports(reports: Report[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

export function getReportCount(product: string, market: string): number {
  const reports = getReports()
  const found = reports.find(
    (r) => r.product === product && r.market === market,
  )
  return found?.count ?? 0
}

export function addReport(product: string, market: string): number {
  const reports = getReports()
  const idx = reports.findIndex(
    (r) => r.product === product && r.market === market,
  )
  if (idx >= 0) {
    reports[idx].count += 1
  } else {
    reports.push({ product, market, count: 1 })
  }
  saveReports(reports)
  return reports[idx >= 0 ? idx : reports.length - 1].count
}
