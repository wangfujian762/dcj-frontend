import { defineStore } from 'pinia'
import type { Task, TaskRecord, EditRowState, SpecialEditRow } from '@/types'
import { taskApi } from '@/api/task'

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

interface TaskOperationRequest {
  type: 'create' | 'complete' | 'archive' | 'terminate'
  rowType?: 'a' | 'b'
  text: string
  primaryTag?: string
  secondaryTag?: string
  businessType?: string
}

interface TaskState {
  tasks: Task[]
  taskRecords: TaskRecord[]
  currentTask: Task | null
  focusTask: Task | null
  editRowState: EditRowState | null
  specialEditRows: SpecialEditRow[]
  isLoading: boolean
  error: string | null
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    taskRecords: [],
    currentTask: null,
    focusTask: null,
    editRowState: null,
    specialEditRows: [],
    isLoading: false,
    error: null
  }),

  getters: {
    // 获取活跃任务
    activeTasks: (state) => {
      return state.tasks.filter(task => task.status === 'active')
    },

    // 获取已完成任务
    completedTasks: (state) => {
      return state.tasks.filter(task => task.status === 'completed')
    },

    // 获取焦点任务的记录
    focusTaskRecords: (state) => {
      if (!state.focusTask) return []
      return state.taskRecords.filter(record => record.taskId === state.focusTask!.id)
    },

    // 获取当前编辑状态
    currentEditState: (state) => state.editRowState?.currentState,

    // 检查是否有特殊编辑行
    hasSpecialEditRows: (state) => state.specialEditRows.length > 0,

    // 按类型获取特殊编辑行
    getSpecialEditRowByType: (state) => (type: 'flow' | 'interrupt' | 'error') => {
      return state.specialEditRows.find(row => row.type === type && row.isVisible)
    }
  },

  actions: {
    // 加载任务列表
    async loadTasks() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await taskApi.getTasks()
        
        if (response.success && response.data) {
          this.tasks = response.data.tasks
        }
      } catch (error: any) {
        this.error = error.message || '加载任务失败'
        console.error('加载任务失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 加载任务记录
    async loadTaskRecords() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await taskApi.getTaskRecords()
        
        if (response.success && response.data) {
          this.taskRecords = response.data.records
          
          // 查找焦点任务
          const focusRecord = this.taskRecords.find(record => record.isFocus)
          if (focusRecord) {
            this.focusTask = this.tasks.find(task => task.id === focusRecord.taskId) || null
          }
        }
      } catch (error: any) {
        this.error = error.message || '加载任务记录失败'
        console.error('加载任务记录失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 创建任务
    async createTask(taskData: CreateTaskRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await taskApi.createTask(taskData)
        
        if (response.success && response.data) {
          this.tasks.push(response.data)
          
          // 重新加载任务记录以获取自动创建的记录
          await this.loadTaskRecords()
          
          return response.data
        } else {
          throw new Error(response.error?.message || '创建任务失败')
        }
      } catch (error: any) {
        this.error = error.message || '创建任务失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 执行运转操作
    async executeOperation(operationData: TaskOperationRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        let response
        
        switch (operationData.type) {
          case 'create':
            response = await taskApi.createTaskOperation(operationData)
            break
          case 'complete':
            response = await taskApi.completeTaskOperation(operationData)
            break
          default:
            throw new Error(`不支持的操作类型: ${operationData.type}`)
        }
        
        if (response.success) {
          // 重新加载相关数据
          await this.loadTaskRecords()
          await this.loadEditRowState()
          
          return response.data
        } else {
          throw new Error(response.error?.message || '执行操作失败')
        }
      } catch (error: any) {
        this.error = error.message || '执行操作失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 加载编辑行状态
    async loadEditRowState() {
      if (!this.focusTask) return
      
      try {
        const response = await taskApi.getEditRowState(this.focusTask.id)
        
        if (response.success && response.data) {
          this.editRowState = response.data
        }
      } catch (error: any) {
        console.error('加载编辑行状态失败:', error)
      }
    },

    // 更新编辑行状态
    async updateEditRowState(taskId: string, newState: string, stateData: any) {
      try {
        const response = await taskApi.updateEditRowState(taskId, {
          newState,
          ...stateData
        })
        
        if (response.success && response.data) {
          this.editRowState = response.data
          
          // 重新加载特殊编辑行
          await this.loadSpecialEditRows()
          
          return response.data
        }
      } catch (error: any) {
        console.error('更新编辑行状态失败:', error)
        throw error
      }
    },

    // 加载特殊编辑行
    async loadSpecialEditRows() {
      try {
        const response = await taskApi.getSpecialEditRows()
        
        if (response.success && response.data) {
          this.specialEditRows = response.data.rows
        }
      } catch (error: any) {
        console.error('加载特殊编辑行失败:', error)
      }
    },

    // 处理特殊编辑行操作
    async handleSpecialRowOperation(rowId: string, rowType: 'flow' | 'interrupt' | 'error') {
      try {
        const response = await taskApi.handleSpecialEditRowOperation(rowId, {
          operationType: rowType,
          timestamp: new Date().toISOString()
        })
        
        if (response.success) {
          // 重新加载相关数据
          await this.loadTaskRecords()
          await this.loadSpecialEditRows()
          
          return response.data
        }
      } catch (error: any) {
        console.error('处理特殊编辑行操作失败:', error)
        throw error
      }
    },

    // 存档记录
    async archiveRecord(recordId: string) {
      try {
        const response = await taskApi.archiveTaskRecord(recordId)
        
        if (response.success) {
          await this.loadTaskRecords()
          return response.data
        }
      } catch (error: any) {
        console.error('存档记录失败:', error)
        throw error
      }
    },

    // 终止记录
    async terminateRecord(recordId: string) {
      try {
        const response = await taskApi.terminateTaskRecord(recordId)
        
        if (response.success) {
          await this.loadTaskRecords()
          return response.data
        }
      } catch (error: any) {
        console.error('终止记录失败:', error)
        throw error
      }
    },

    // 设置焦点任务
    setFocusTask(task: Task | null) {
      this.focusTask = task
    },

    // 清除错误状态
    clearError() {
      this.error = null
    },

    // 重置状态
    reset() {
      this.tasks = []
      this.taskRecords = []
      this.currentTask = null
      this.focusTask = null
      this.editRowState = null
      this.specialEditRows = []
      this.isLoading = false
      this.error = null
    }
  }
})

