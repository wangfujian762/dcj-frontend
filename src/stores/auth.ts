import { defineStore } from 'pinia'
import type { User, Archive } from '@/types'
import { authApi } from '@/api/auth'

interface LoginRequest {
  username: string
  password: string
  archiveNumber?: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    currentUser: (state) => state.user,
    authToken: (state) => state.token
  },

  actions: {
    // 登录
    async login(credentials: LoginRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authApi.login(credentials)
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true
          
          // 保存token到localStorage
          localStorage.setItem('dcj_token', response.data.token)
          
          return response.data
        } else {
          throw new Error(response.error?.message || '登录失败')
        }
      } catch (error: any) {
        this.error = error.message || '登录失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 注册
    async register(userData: RegisterRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authApi.register(userData)
        
        if (response.success) {
          return response.data
        } else {
          throw new Error(response.error?.message || '注册失败')
        }
      } catch (error: any) {
        this.error = error.message || '注册失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 获取用户信息
    async fetchProfile() {
      if (!this.token) return null
      
      try {
        const response = await authApi.getProfile()
        
        if (response.success && response.data) {
          this.user = response.data.user
          return response.data.user
        }
      } catch (error: any) {
        console.error('获取用户信息失败:', error)
        // 如果token无效，清除认证状态
        if (error.status === 401) {
          this.logout()
        }
      }
      
      return null
    },

    // 登出
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      
      // 清除localStorage中的token
      localStorage.removeItem('dcj_token')
      localStorage.removeItem('dcj_login_info')
    },

    // 初始化认证状态（从localStorage恢复）
    async initializeAuth() {
      const token = localStorage.getItem('dcj_token')
      
      if (token) {
        this.token = token
        this.isAuthenticated = true
        
        // 验证token有效性并获取用户信息
        try {
          await this.fetchProfile()
        } catch (error) {
          // token无效，清除认证状态
          this.logout()
        }
      }
    },

    // 刷新token
    async refreshToken() {
      if (!this.token) return false
      
      try {
        const response = await authApi.refreshToken()
        
        if (response.success && response.data) {
          this.token = response.data.token
          localStorage.setItem('dcj_token', response.data.token)
          return true
        }
      } catch (error) {
        console.error('刷新token失败:', error)
        this.logout()
      }
      
      return false
    },

    // 清除错误状态
    clearError() {
      this.error = null
    }
  }
})
