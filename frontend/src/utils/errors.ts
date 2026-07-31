import type { AxiosError } from 'axios'
import type { ErrorResponseDto } from '../services/api'

export function getApiError(err: unknown): string {
  const axiosErr = err as AxiosError<ErrorResponseDto>
  if (axiosErr.response?.data?.error?.message) {
    return axiosErr.response.data.error.message
  }
  if ((err as Error)?.message) {
    return (err as Error).message
  }
  return 'Something went wrong. Please try again.'
}

export function getApiErrorCode(err: unknown): string | undefined {
  const axiosErr = err as AxiosError<ErrorResponseDto>
  return axiosErr.response?.data?.error?.code
}
