import axios from 'axios'
import type {
  PredictionHistoryResponse,
  PredictionPreviewResponse,
} from '../types/prediction'

export const AUTH_TOKEN_STORAGE_KEY = 'mintai.authToken'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export type AuthPayload = {
  email: string
  password: string
}

export type RegisterPayload = AuthPayload & {
  name: string
}

export type UserProfile = {
  _id: string
  allowTrainingData: boolean
  createdAt?: string
  dailyUsageCount: number
  email: string
  lastUsageReset: string
  name: string
  plan: 'free' | 'pro'
  updatedAt?: string
}

export type AuthResponse = {
  message: string
  token: string
  user: UserProfile
}

export type ProfileResponse = {
  user: UserProfile
}

export type UsageLimit = {
  limit: number
  plan: 'free' | 'pro'
  remaining: number
  resetAt: string
  used: number
}

export type UsageLimitResponse = {
  usage: UsageLimit
}

export type UpdateProfilePayload = {
  allowTrainingData?: boolean
  email?: string
  name?: string
  password?: string
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export function getAuthToken() {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)
      ?.message

    return typeof message === 'string' ? message : error.message
  }

  return 'Something went wrong. Please try again.'
}

export async function loginUser(payload: AuthPayload) {
  const response = await apiClient.post<AuthResponse>('/user/login', payload)

  return response.data
}

export async function registerUser(payload: RegisterPayload) {
  const response = await apiClient.post<AuthResponse>('/user/register', payload)

  return response.data
}

export async function getProfile() {
  const response = await apiClient.get<ProfileResponse>('/user/profile')

  return response.data
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.put<ProfileResponse & { message: string }>(
    '/user/profile',
    payload,
  )

  return response.data
}

export async function getUsageLimit() {
  const response = await apiClient.get<UsageLimitResponse>('/user/usage-limit')

  return response.data
}

export async function postPrediction<TResponse>(formData: FormData) {
  const response = await apiClient.post<TResponse>('/predict', formData)

  return response.data
}

export async function getPredictionPreview() {
  const response = await apiClient.get<PredictionPreviewResponse>(
    '/predict/preview',
  )

  return response.data
}

export async function getPredictions(page = 1, limit = 10) {
  const response = await apiClient.get<PredictionHistoryResponse>('/predict', {
    params: { limit, page },
  })

  return response.data
}

export async function updatePredictionFeedback(
  predictionId: string,
  isCorrect: boolean,
) {
  const response = await apiClient.patch<{ message: string }>(
    `/predict/${predictionId}/feedback`,
    { isCorrect },
  )

  return response.data
}
