// DCJ 任务管理系统 - API客户端

import type { ApiResponse } from '@/types'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// HTTP客户端类
class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  // 设置认证token
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`
    } else {
      delete this.defaultHeaders['Authorization']
    }
  }

  // 获取完整URL
  private getFullURL(endpoint: string): string {
    return `${this.baseURL}${endpoint}`
  }

  // 处理响应
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    
    let data: any
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = { message: await response.text() }
    }

    if (!response.ok) {
      // 如果是401错误，清除本地token
      if (response.status === 401) {
        localStorage.removeItem('dcj_token')
        // 可以在这里触发登出逻辑
      }
      
      throw {
        status: response.status,
        message: data.message || data.error?.message || `HTTP ${response.status}`,
        data
      }
    }

    return data
  }

  // GET请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(this.getFullURL(endpoint))
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]))
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.defaultHeaders
    })

    return this.handleResponse<T>(response)
  }

  // POST请求
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'POST',
      headers: this.defaultHeaders,
      body: body ? JSON.stringify(body) : undefined
    })

    return this.handleResponse<T>(response)
  }

  // PUT请求
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'PUT',
      headers: this.defaultHeaders,
      body: body ? JSON.stringify(body) : undefined
    })

    return this.handleResponse<T>(response)
  }

  // PATCH请求
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'PATCH',
      headers: this.defaultHeaders,
      body: body ? JSON.stringify(body) : undefined
    })

    return this.handleResponse<T>(response)
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'DELETE',
      headers: this.defaultHeaders
    })

    return this.handleResponse<T>(response)
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL)

// 设置请求拦截器（设置token）
const token = localStorage.getItem('dcj_token')
if (token) {
  apiClient.setAuthToken(token)
}

// 响应拦截器（全局错误处理）
const originalHandleResponse = (apiClient as any).handleResponse
;(apiClient as any).handleResponse = async function<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return await originalHandleResponse.call(this, response)
  } catch (error: any) {
    // 全局错误处理
    console.error('API请求错误:', error)
    
    // 可以在这里添加全局错误提示
    if (error.status === 401) {
      // 未授权，可能需要重新登录
      console.warn('用户未授权，请重新登录')
    } else if (error.status >= 500) {
      // 服务器错误
      console.error('服务器错误，请稍后重试')
    }
    
    throw error
  }
}

export default apiClient
