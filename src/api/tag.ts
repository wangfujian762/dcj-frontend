// 标签选项相关API

import { apiClient } from './client'
import type { PrimaryTagOption, SecondaryTagOption, ApiResponse, PaginatedResponse } from '@/types'

interface CreatePrimaryTagRequest {
  tagName: string
  tagIcon: string
  tagColor: string
  sortOrder: number
}

interface CreateSecondaryTagRequest {
  tagName: string
  tagColor: string
  sortOrder: number
  parentCategory?: string
}

interface TagQueryParams {
  search?: string
  context?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const tagApi = {
  // 获取一级标签选项
  getPrimaryTagOptions(params?: TagQueryParams): Promise<ApiResponse<{ tags: PrimaryTagOption[] }>> {
    return apiClient.get('/tag-options/primary', params)
  },

  // 获取二级标签选项
  getSecondaryTagOptions(params?: TagQueryParams): Promise<ApiResponse<{ tags: SecondaryTagOption[] }>> {
    return apiClient.get('/tag-options/secondary', params)
  },

  // 获取业务类型选项
  getBusinessTypeOptions(params?: TagQueryParams): Promise<ApiResponse<{ types: string[] }>> {
    return apiClient.get('/tag-options/business-types', params)
  },

  // 创建一级标签选项
  createPrimaryTagOption(tagData: CreatePrimaryTagRequest): Promise<ApiResponse<PrimaryTagOption>> {
    return apiClient.post('/tag-options/primary', tagData)
  },

  // 创建二级标签选项
  createSecondaryTagOption(tagData: CreateSecondaryTagRequest): Promise<ApiResponse<SecondaryTagOption>> {
    return apiClient.post('/tag-options/secondary', tagData)
  },

  // 更新一级标签选项
  updatePrimaryTagOption(tagId: string, updateData: Partial<CreatePrimaryTagRequest>): Promise<ApiResponse<PrimaryTagOption>> {
    return apiClient.put(`/tag-options/primary/${tagId}`, updateData)
  },

  // 更新二级标签选项
  updateSecondaryTagOption(tagId: string, updateData: Partial<CreateSecondaryTagRequest>): Promise<ApiResponse<SecondaryTagOption>> {
    return apiClient.put(`/tag-options/secondary/${tagId}`, updateData)
  },

  // 删除一级标签选项
  deletePrimaryTagOption(tagId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tag-options/primary/${tagId}`)
  },

  // 删除二级标签选项
  deleteSecondaryTagOption(tagId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tag-options/secondary/${tagId}`)
  },

  // 同步标签选项
  syncTagOptions(): Promise<ApiResponse<{ syncedCount: number }>> {
    return apiClient.post('/tag-options/sync')
  },

  // 获取标签统计信息
  getTagStats(): Promise<ApiResponse<{
    primaryTagStats: Array<{ tagName: string; count: number }>
    secondaryTagStats: Array<{ tagName: string; count: number }>
    businessTypeStats: Array<{ typeName: string; count: number }>
  }>> {
    return apiClient.get('/tag-options/stats')
  },

  // 批量更新标签选项
  batchUpdateTagOptions(updates: Array<{
    tagId: string
    updateData: any
  }>): Promise<ApiResponse<{ updatedCount: number }>> {
    return apiClient.post('/tag-options/batch-update', { updates })
  },

  // 清理未使用的标签选项
  cleanupUnusedTags(): Promise<ApiResponse<{ cleanedCount: number }>> {
    return apiClient.post('/tag-options/cleanup')
  }
}

