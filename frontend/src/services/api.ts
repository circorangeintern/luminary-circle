import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

export interface MarketPrice {
  id: string
  market: string
  location: string
  product: string
  price: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
  reports: number
  isCheapest?: boolean
  isHighest?: boolean
}

export interface PriceSubmission {
  market: string
  product: string
  price: number
  unit: string
  reporter?: string
}

export interface PriceEntry {
  date: string
  market: string
  price: number
}

export async function fetchPrices(product: string): Promise<MarketPrice[]> {
  const { data } = await api.get<MarketPrice[]>('/prices', { params: { product } })
  return data
}

export async function fetchTrend(product: string, period?: string): Promise<PriceEntry[]> {
  const { data } = await api.get<PriceEntry[]>('/trends', { params: { product, period } })
  return data
}

export async function submitPrice(payload: PriceSubmission): Promise<void> {
  await api.post('/prices', payload)
}

export default api
