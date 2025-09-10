// 任务相关API

import { apiClient } from './client'
import type { Task, TaskRecord, EditRowState, ApiResponse, PaginatedResponse } from '@/types'

interface CreateTaskRequest {
  archiveId: string
  taskType: 'single_row' | 'double_row'
  taskName: string
  description?: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
  parentTaskId?: string
}

interface UpdateTaskRequest {
  taskName?: string
  description?: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
  status?: 'active' | 'completed' | 'archived'
  priority?: number
}

interface TaskQueryParams {
  search?: string
  status?: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
  parentTaskId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

interface CreateTaskOperationRequest {
  taskId?: string
  operationType: string
  taskText: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
}

interface UpdateEditRowStateRequest {
  newState: string
  taskText?: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
}

interface SpecialEditRowOperationRequest {
  operationType: string
  timestamp: string
  operationData?: any
}

export const taskApi = {
  // 获取任务列表
  getTasks(params?: TaskQueryParams): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get('/tasks', params)
  },

  // 获取单个任务
  getTask(taskId: string): Promise<ApiResponse<Task>> {
    return apiClient.get(`/tasks/${taskId}`)
  },

  // 创建任务
  createTask(taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return apiClient.post('/tasks', taskData)
  },

  // 更新任务
  updateTask(taskId: string, updateData: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return apiClient.put(`/tasks/${taskId}`, updateData)
  },

  // 删除任务
  deleteTask(taskId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tasks/${taskId}`)
  },

  // 完成任务
  completeTask(taskId: string, completionData?: any): Promise<ApiResponse<Task>> {
    return apiClient.post(`/tasks/${taskId}/complete`, completionData)
  },

  // 设置焦点任务
  setFocusTask(taskId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/tasks/${taskId}/focus`)
  },

  // 获取任务记录
  getTaskRecords(params?: { taskId?: string; limit?: number; offset?: number }): Promise<ApiResponse<PaginatedResponse<TaskRecord>>> {
    return apiClient.get('/task-records', params)
  },

  // 创建任务记录
  createTaskRecord(recordData: {
    taskId: string
    recordText: string
    recordType: string
    primaryTag?: string
    secondaryTag?: string
    businessType?: string
  }): Promise<ApiResponse<TaskRecord>> {
    return apiClient.post('/task-records', recordData)
  },

  // 创建类运转操作
  createTaskOperation(operationData: CreateTaskOperationRequest): Promise<ApiResponse<any>> {
    return apiClient.post('/operations/create-task', operationData)
  },

  // 完结类运转操作
  completeTaskOperation(operationData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/operations/complete-task', operationData)
  },

  // 获取编辑行状态
  getEditRowState(taskId: string): Promise<ApiResponse<EditRowState>> {
    return apiClient.get(`/operations/edit-state/current`, { taskId })
  },

  // 更新编辑行状态
  updateEditRowState(taskId: string, stateData: UpdateEditRowStateRequest): Promise<ApiResponse<EditRowState>> {
    return apiClient.post('/operations/edit-state', {
      taskId,
      ...stateData
    })
  },

  // 获取前缀文本
  getPrefixText(taskId: string): Promise<ApiResponse<{ prefixText: string }>> {
    return apiClient.get(`/operations/prefix/${taskId}`)
  },

  // 批量更新前缀文本
  batchUpdatePrefixText(taskIds: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return apiClient.post('/operations/prefix/batch-update', { taskIds })
  },

  // 获取特殊编辑行
  getSpecialEditRows(): Promise<ApiResponse<{ rows: SpecialEditRow[] }>> {
    return apiClient.get('/special-edit-rows')
  },

  // 处理特殊编辑行操作
  handleSpecialEditRowOperation(rowId: string, operationData: SpecialEditRowOperationRequest): Promise<ApiResponse<any>> {
    return apiClient.post(`/special-edit-rows/${rowId}/handle`, operationData)
  },

  // 存档任务记录
  archiveTaskRecord(recordId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/task-records/${recordId}/archive`)
  },

  // 终止任务记录
  terminateTaskRecord(recordId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/task-records/${recordId}/terminate`)
  },

  // 获取任务统计
  getTaskStats(): Promise<ApiResponse<{
    totalTasks: number
    activeTasks: number
    completedTasks: number
    tasksByType: Record<string, number>
    tasksByTag: Record<string, number>
  }>> {
    return apiClient.get('/statistics/tasks')
  }
}

