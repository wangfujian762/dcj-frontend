// 存档相关API

import { apiClient } from './client'
import type { Archive, ApiResponse, PaginatedResponse } from '@/types'

interface CreateArchiveRequest {
  archiveName: string
  archiveNumber: string
}

interface UpdateArchiveRequest {
  archiveName?: string
  archiveNumber?: string
}

interface ArchiveQueryParams {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

interface InitializeRequest {
  currentDate: string
}

export const archiveApi = {
  // 获取存档列表
  getArchives(params?: ArchiveQueryParams): Promise<ApiResponse<PaginatedResponse<Archive>>> {
    return apiClient.get('/archives', params)
  },

  // 获取单个存档
  getArchive(archiveId: string): Promise<ApiResponse<Archive>> {
    return apiClient.get(`/archives/${archiveId}`)
  },

  // 获取当前存档
  getCurrentArchive(): Promise<ApiResponse<Archive>> {
    return apiClient.get('/archives/current')
  },

  // 创建存档
  createArchive(archiveData: CreateArchiveRequest): Promise<ApiResponse<Archive>> {
    return apiClient.post('/archives', archiveData)
  },

  // 更新存档
  updateArchive(archiveId: string, updateData: UpdateArchiveRequest): Promise<ApiResponse<Archive>> {
    return apiClient.put(`/archives/${archiveId}`, updateData)
  },

  // 删除存档
  deleteArchive(archiveId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/archives/${archiveId}`)
  },

  // 切换存档
  switchArchive(archiveId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/archives/${archiveId}/switch`)
  },

  // 初始化存档
  initializeArchive(initData: InitializeRequest): Promise<ApiResponse<void>> {
    return apiClient.post('/initialize', initData)
  }
}
