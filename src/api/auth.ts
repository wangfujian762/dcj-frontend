// 认证相关API

import { apiClient } from './client'
import type { User, ApiResponse } from '@/types'

interface LoginRequest {
  username: string
  password: string
  archiveNumber?: string
}

interface LoginResponse {
  user: User
  token: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

export const authApi = {
  // 用户登录
  login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/auth/login', credentials)
  },

  // 用户注册
  register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return apiClient.post('/auth/register', userData)
  },

  // 获取用户信息
  getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get('/auth/profile')
  },

  // 刷新token
  refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post('/auth/refresh')
  },

  // 登出
  logout(): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/logout')
  }
}
