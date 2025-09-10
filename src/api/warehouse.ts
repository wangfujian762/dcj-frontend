// 仓库任务相关API

import { apiClient } from './client'
import type { WarehouseTask, ApiResponse, PaginatedResponse } from '@/types'

interface CreateWarehouseTaskRequest {
  taskText: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
  priority?: number
  parentTaskId?: string
}

interface UpdateWarehouseTaskRequest {
  taskText?: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
  priority?: number
  displayStatus?: 'normal' | 'highlighted' | 'dimmed'
}

interface WarehouseTaskQueryParams {
  search?: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
  displayStatus?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

interface ReorderTaskData {
  taskId: string
  newPriority: number
  newParentTaskId?: string
}

interface BatchUpdateRequest {
  taskIds: string[]
  updateData: UpdateWarehouseTaskRequest
}

export const warehouseApi = {
  // 获取仓库任务列表
  getWarehouseTasks(params?: WarehouseTaskQueryParams): Promise<ApiResponse<PaginatedResponse<WarehouseTask>>> {
    return apiClient.get('/warehouse-tasks', params)
  },

  // 获取单个仓库任务
  getWarehouseTask(taskId: string): Promise<ApiResponse<WarehouseTask>> {
    return apiClient.get(`/warehouse-tasks/${taskId}`)
  },

  // 创建仓库任务
  createWarehouseTask(taskData: CreateWarehouseTaskRequest): Promise<ApiResponse<WarehouseTask>> {
    return apiClient.post('/warehouse-tasks', taskData)
  },

  // 更新仓库任务
  updateWarehouseTask(taskId: string, updateData: UpdateWarehouseTaskRequest): Promise<ApiResponse<WarehouseTask>> {
    return apiClient.put(`/warehouse-tasks/${taskId}`, updateData)
  },

  // 删除仓库任务
  deleteWarehouseTask(taskId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/warehouse-tasks/${taskId}`)
  },

  // 提取仓库任务到运转面板
  extractTask(taskId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/warehouse-tasks/${taskId}/extract`)
  },

  // 完成仓库任务
  completeWarehouseTask(taskId: string): Promise<ApiResponse<WarehouseTask>> {
    return apiClient.post(`/warehouse-tasks/${taskId}/complete`)
  },

  // 重新排序仓库任务
  reorderWarehouseTasks(reorderData: ReorderTaskData[]): Promise<ApiResponse<void>> {
    return apiClient.post('/warehouse-tasks/reorder', { tasks: reorderData })
  },

  // 批量更新仓库任务
  batchUpdateWarehouseTasks(batchData: BatchUpdateRequest): Promise<ApiResponse<{ updatedCount: number }>> {
    return apiClient.post('/warehouse-tasks/batch-update', batchData)
  },

  // 批量删除仓库任务
  batchDeleteWarehouseTasks(taskIds: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    return apiClient.post('/warehouse-tasks/batch-delete', { taskIds })
  },

  // 同步显示状态
  syncDisplayStatus(): Promise<ApiResponse<{ syncedCount: number }>> {
    return apiClient.post('/warehouse-tasks/sync-display-status')
  },

  // 获取仓库统计信息
  getWarehouseStats(): Promise<ApiResponse<{
    totalTasks: number
    tasksByStatus: Record<string, number>
    tasksByTag: Record<string, number>
    tasksByDepth: Record<number, number>
  }>> {
    return apiClient.get('/warehouse-tasks/stats')
  },

  // 清理已完成的任务
  cleanupCompletedTasks(): Promise<ApiResponse<{ cleanedCount: number }>> {
    return apiClient.post('/warehouse-tasks/cleanup')
  }
}

