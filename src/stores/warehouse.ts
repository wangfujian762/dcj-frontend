import { defineStore } from 'pinia'
import type { WarehouseTask } from '@/types'
import { warehouseApi } from '@/api/warehouse'

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

interface WarehouseState {
  warehouseTasks: WarehouseTask[]
  selectedTask: WarehouseTask | null
  expandedTasks: Set<string>
  isLoading: boolean
  error: string | null
}

export const useWarehouseStore = defineStore('warehouse', {
  state: (): WarehouseState => ({
    warehouseTasks: [],
    selectedTask: null,
    expandedTasks: new Set(),
    isLoading: false,
    error: null
  }),

  getters: {
    // 获取顶级任务（没有父任务的任务）
    topLevelTasks: (state) => {
      return state.warehouseTasks
        .filter(task => !task.parentTaskId)
        .sort((a, b) => a.priority - b.priority)
    },

    // 获取指定任务的子任务
    getChildTasks: (state) => (parentId: string) => {
      return state.warehouseTasks
        .filter(task => task.parentTaskId === parentId)
        .sort((a, b) => a.priority - b.priority)
    },

    // 获取任务总数
    totalTasks: (state) => state.warehouseTasks.length,

    // 获取已完成任务数
    completedTasks: (state) => {
      return state.warehouseTasks.filter(task => task.displayStatus === 'completed').length
    }
  },

  actions: {
    // 加载仓库任务
    async loadWarehouseTasks() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await warehouseApi.getWarehouseTasks()
        
        if (response.success && response.data) {
          this.warehouseTasks = response.data.tasks
        }
      } catch (error: any) {
        this.error = error.message || '加载仓库任务失败'
        console.error('加载仓库任务失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 创建仓库任务
    async createWarehouseTask(taskData: CreateWarehouseTaskRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await warehouseApi.createWarehouseTask(taskData)
        
        if (response.success && response.data) {
          this.warehouseTasks.push(response.data)
          return response.data
        } else {
          throw new Error(response.error?.message || '创建仓库任务失败')
        }
      } catch (error: any) {
        this.error = error.message || '创建仓库任务失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 更新仓库任务
    async updateWarehouseTask(taskId: string, updateData: UpdateWarehouseTaskRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await warehouseApi.updateWarehouseTask(taskId, updateData)
        
        if (response.success && response.data) {
          const index = this.warehouseTasks.findIndex(task => task.id === taskId)
          if (index !== -1) {
            this.warehouseTasks[index] = response.data
          }
          return response.data
        } else {
          throw new Error(response.error?.message || '更新仓库任务失败')
        }
      } catch (error: any) {
        this.error = error.message || '更新仓库任务失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 删除仓库任务
    async deleteWarehouseTask(taskId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await warehouseApi.deleteWarehouseTask(taskId)
        
        if (response.success) {
          this.warehouseTasks = this.warehouseTasks.filter(task => task.id !== taskId)
          
          // 如果删除的是选中的任务，清空选中状态
          if (this.selectedTask?.id === taskId) {
            this.selectedTask = null
          }
          
          // 移除展开状态
          this.expandedTasks.delete(taskId)
          
          return true
        } else {
          throw new Error(response.error?.message || '删除仓库任务失败')
        }
      } catch (error: any) {
        this.error = error.message || '删除仓库任务失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 提取任务到运转面板
    async extractTask(taskId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await warehouseApi.extractTask(taskId)
        
        if (response.success) {
          // 从仓库中移除任务
          this.warehouseTasks = this.warehouseTasks.filter(task => task.id !== taskId)
          
          // 清空相关状态
          if (this.selectedTask?.id === taskId) {
            this.selectedTask = null
          }
          this.expandedTasks.delete(taskId)
          
          return response.data
        } else {
          throw new Error(response.error?.message || '提取任务失败')
        }
      } catch (error: any) {
        this.error = error.message || '提取任务失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 完成仓库任务
    async completeTask(taskId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await warehouseApi.completeWarehouseTask(taskId)
        
        if (response.success && response.data) {
          const index = this.warehouseTasks.findIndex(task => task.id === taskId)
          if (index !== -1) {
            this.warehouseTasks[index] = response.data
          }
          return response.data
        } else {
          throw new Error(response.error?.message || '完成任务失败')
        }
      } catch (error: any) {
        this.error = error.message || '完成任务失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 重新排序任务
    async reorderTasks(tasks: WarehouseTask[]) {
      this.isLoading = true
      this.error = null
      
      try {
        const reorderData = tasks.map((task, index) => ({
          taskId: task.id,
          newPriority: index + 1
        }))
        
        const response = await warehouseApi.reorderWarehouseTasks(reorderData)
        
        if (response.success) {
          // 更新本地状态
          this.warehouseTasks = tasks.map((task, index) => ({
            ...task,
            priority: index + 1
          }))
          
          return true
        } else {
          throw new Error(response.error?.message || '重新排序失败')
        }
      } catch (error: any) {
        this.error = error.message || '重新排序失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 切换任务展开状态
    toggleTaskExpand(taskId: string) {
      if (this.expandedTasks.has(taskId)) {
        this.expandedTasks.delete(taskId)
      } else {
        this.expandedTasks.add(taskId)
      }
    },

    // 批量展开/收起
    expandAllTasks() {
      this.warehouseTasks.forEach(task => {
        if (this.getChildTasks(task.id).length > 0) {
          this.expandedTasks.add(task.id)
        }
      })
    },

    collapseAllTasks() {
      this.expandedTasks.clear()
    },

    // 选择任务
    selectTask(task: WarehouseTask | null) {
      this.selectedTask = task
    },

    // 清除错误状态
    clearError() {
      this.error = null
    },

    // 重置状态
    reset() {
      this.warehouseTasks = []
      this.selectedTask = null
      this.expandedTasks.clear()
      this.isLoading = false
      this.error = null
    }
  }
})

