import axios from 'axios'
import type { AxiosInstance } from 'axios'

const TOKEN_KEY = 'access_token'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function generateSessionId(): string {
  let stored = localStorage.getItem('session_id')
  if (!stored) {
    stored = crypto.randomUUID()
    localStorage.setItem('session_id', stored)
  }
  return stored
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Session-Id'] = generateSessionId()
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  },
)

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ----- Types -----

interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface UserDto {
  id: string
  displayName: string
  phone: string
  role: 'USER' | 'ADMIN'
}

export interface AuthDataDto {
  user: UserDto
  accessToken: string
}

export interface ErrorDetailDto {
  field: string
  message: string
}

export interface ErrorBodyDto {
  code: string
  message: string
  details?: ErrorDetailDto[]
}

export interface ErrorResponseDto {
  success: false
  error: ErrorBodyDto
}

export interface UnitDto {
  id: string
  label: string
}

export interface ItemDto {
  id: string
  name: string
  localNames: string[]
  units: UnitDto[]
}

export interface MarketDto {
  id: string
  name: string
  lga: string
  state: string
}

export interface CreatePriceDto {
  itemId: string
  unitId: string
  marketId: string
  price: number
  note?: string
}

export interface PriceItemDto {
  id: string
  name: string
}

export interface PriceUnitDto {
  id: string
  label: string
}

export interface PriceMarketDto {
  id: string
  name: string
  lga: string
  state: string
}

export interface PriceDto {
  id: string
  item: PriceItemDto
  unit: PriceUnitDto
  market: PriceMarketDto
  price: number
  note: string | null
  status: string
  source: 'REAL_USER' | 'TEAM_TEST' | 'SEED_DEMO'
  isStale: boolean
  isFlagged: boolean
  flagCount: number
  submitterDisplayName: string
  createdAt: string
}

export interface PriceQueryResult {
  items: PriceDto[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// ----- API calls -----

export async function register(displayName: string, phone: string, password: string): Promise<AuthDataDto> {
  const { data } = await api.post<ApiResponse<AuthDataDto>>('/auth/register', { displayName, phone, password })
  return data.data
}

export async function login(phone: string, password: string): Promise<AuthDataDto> {
  const { data } = await api.post<ApiResponse<AuthDataDto>>('/auth/login', { phone, password })
  return data.data
}

export async function fetchMe(): Promise<UserDto> {
  const { data } = await api.get<ApiResponse<UserDto>>('/auth/me')
  return data.data
}

export async function fetchItems(): Promise<ItemDto[]> {
  const { data } = await api.get<ApiResponse<{ items: ItemDto[] }>>('/items')
  return data.data.items
}

export async function fetchMarkets(): Promise<MarketDto[]> {
  const { data } = await api.get<ApiResponse<{ markets: MarketDto[] }>>('/markets')
  return data.data.markets
}

export interface PriceQueryParams {
  itemId?: string
  unitId?: string
  marketId?: string
  page?: number
  pageSize?: number
}

export async function fetchPrices(params: PriceQueryParams = {}): Promise<PriceQueryResult> {
  const { data } = await api.get<ApiResponse<PriceQueryResult>>('/prices', { params })
  return data.data
}

export async function submitPrice(payload: CreatePriceDto): Promise<PriceDto> {
  const { data } = await api.post<ApiResponse<{ price: PriceDto }>>('/prices', payload)
  return data.data.price
}

// ----- Compare endpoint (pre-computed isCheapest) -----

export interface ComparePriceEntry {
  id: string
  item: PriceItemDto
  unit: PriceUnitDto
  market: PriceMarketDto
  price: number
  note: string | null
  status: string
  source: 'REAL_USER' | 'TEAM_TEST' | 'SEED_DEMO'
  isStale: boolean
  isFlagged: boolean
  flagCount: number
  submitterDisplayName: string
  createdAt: string
  isCheapest: boolean
}

export interface CompareResult {
  items: ComparePriceEntry[]
  comparisonPossible: boolean
}

interface RawPriceData {
  id: string
  item: PriceItemDto
  unit: PriceUnitDto
  market: PriceMarketDto
  price: number
  note: string | null
  status: string
  source: 'REAL_USER' | 'TEAM_TEST' | 'SEED_DEMO'
  isStale: boolean
  isFlagged: boolean
  flagCount: number
  submitterDisplayName: string
  createdAt: string
}

export async function fetchComparePrices(itemId: string, unitId: string): Promise<CompareResult> {
  const { data } = await api.get<ApiResponse<{
    comparison: { market: PriceMarketDto; latestPrice: RawPriceData; isCheapest: boolean }[]
    comparisonPossible: boolean
  }>>('/markets/compare', { params: { itemId, unitId } })
  const raw = data.data
  return {
    items: raw.comparison.map((c) => ({ ...c.latestPrice, isCheapest: c.isCheapest })),
    comparisonPossible: raw.comparisonPossible,
  }
}

// ----- Trend endpoint -----

export interface TrendPoint {
  price: number
  createdAt: string
}

export interface TrendResponse {
  item: PriceItemDto
  unit: PriceUnitDto
  market: PriceMarketDto
  direction: 'UP' | 'DOWN' | 'STABLE' | 'INSUFFICIENT_DATA'
  sampleSize: number
  latest: PriceDto | null
  points: TrendPoint[]
}

export async function fetchTrend(itemId: string, unitId: string, marketId: string): Promise<TrendResponse> {
  const { data } = await api.get<ApiResponse<TrendResponse>>(`/items/${itemId}/trend`, {
    params: { unitId, marketId },
  })
  return data.data
}

// ----- Flag endpoint -----

export interface FlagResponse {
  flagId: string
  submissionId: string
  flagCount: number
  submissionStatus: 'ACTIVE' | 'UNDER_REVIEW' | 'REMOVED'
}

export async function flagPrice(priceId: string, reason: 'WRONG_PRICE' | 'OUTDATED' | 'OTHER'): Promise<FlagResponse> {
  const { data } = await api.post<ApiResponse<FlagResponse>>(`/prices/${priceId}/flag`, { reason })
  return data.data
}

// ----- Market request endpoint -----

export interface MarketRequestDto {
  id: string
  proposedName: string
  lga: string
  state: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED'
  createdAt: string
  reviewedAt: string | null
}

export async function createMarketRequest(proposedName: string, lga: string, state: string): Promise<MarketRequestDto> {
  const { data } = await api.post<ApiResponse<MarketRequestDto>>('/market-requests', { proposedName, lga, state })
  return data.data
}

// ----- Events / analytics -----

export interface IncomingEvent {
  clientEventId: string
  name: string
  sessionId: string
  screenName?: string
  responseStatus?: string
  errorCode?: string
  deviceType?: 'MOBILE' | 'TABLET' | 'DESKTOP'
  properties?: Record<string, unknown>
  occurredAt: string
}

export interface EventsResult {
  accepted: number
  duplicates: number
  rejected: number
}

export async function submitEvents(events: IncomingEvent[]): Promise<EventsResult> {
  const { data } = await api.post<ApiResponse<EventsResult>>('/events', { events })
  return data.data
}

export default api
