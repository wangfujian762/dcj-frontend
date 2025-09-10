import { defineStore } from 'pinia'
import type { Archive } from '@/types'
import { archiveApi } from '@/api/archive'

interface CreateArchiveRequest {
  archiveName: string
  archiveNumber: string
}

interface ArchiveState {
  archives: Archive[]
  currentArchive: Archive | null
  isLoading: boolean
  error: string | null
}

export const useArchiveStore = defineStore('archive', {
  state: (): ArchiveState => ({
    archives: [],
    currentArchive: null,
    isLoading: false,
    error: null
  }),

  getters: {
    currentArchiveId: (state) => state.currentArchive?.id,
    archiveCount: (state) => state.archives.length,
    hasArchives: (state) => state.archives.length > 0
  },

  actions: {
    // 加载存档列表
    async loadArchives() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await archiveApi.getArchives()
        
        if (response.success && response.data) {
          this.archives = response.data.archives
          
          // 查找当前激活的存档
          const activeArchive = this.archives.find(archive => archive.isActive)
          if (activeArchive) {
            this.currentArchive = activeArchive
          }
        }
      } catch (error: any) {
        this.error = error.message || '加载存档列表失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 获取当前存档
    async getCurrentArchive() {
      try {
        const response = await archiveApi.getCurrentArchive()
        
        if (response.success && response.data) {
          this.currentArchive = response.data
          return response.data
        }
      } catch (error: any) {
        console.error('获取当前存档失败:', error)
      }
      
      return null
    },

    // 创建存档
    async createArchive(archiveData: CreateArchiveRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await archiveApi.createArchive(archiveData)
        
        if (response.success && response.data) {
          const newArchive = response.data
          this.archives.push(newArchive)
          
          // 自动切换到新创建的存档
          await this.switchArchive(newArchive.id)
          
          return newArchive
        } else {
          throw new Error(response.error?.message || '创建存档失败')
        }
      } catch (error: any) {
        this.error = error.message || '创建存档失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 切换存档
    async switchArchive(archiveId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await archiveApi.switchArchive(archiveId)
        
        if (response.success) {
          // 更新本地状态
          this.archives.forEach(archive => {
            archive.isActive = archive.id === archiveId
          })
          
          this.currentArchive = this.archives.find(archive => archive.id === archiveId) || null
          
          return true
        } else {
          throw new Error(response.error?.message || '切换存档失败')
        }
      } catch (error: any) {
        this.error = error.message || '切换存档失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 更新存档
    async updateArchive(archiveId: string, updateData: Partial<Archive>) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await archiveApi.updateArchive(archiveId, updateData)
        
        if (response.success && response.data) {
          const index = this.archives.findIndex(archive => archive.id === archiveId)
          if (index !== -1) {
            this.archives[index] = response.data
          }
          
          if (this.currentArchive?.id === archiveId) {
            this.currentArchive = response.data
          }
          
          return response.data
        } else {
          throw new Error(response.error?.message || '更新存档失败')
        }
      } catch (error: any) {
        this.error = error.message || '更新存档失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 删除存档
    async deleteArchive(archiveId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await archiveApi.deleteArchive(archiveId)
        
        if (response.success) {
          // 从列表中移除
          this.archives = this.archives.filter(archive => archive.id !== archiveId)
          
          // 如果删除的是当前存档，清空当前存档
          if (this.currentArchive?.id === archiveId) {
            this.currentArchive = null
          }
          
          return true
        } else {
          throw new Error(response.error?.message || '删除存档失败')
        }
      } catch (error: any) {
        this.error = error.message || '删除存档失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 初始化存档（触发初始化流程）
    async initializeArchive() {
      if (!this.currentArchive) return
      
      try {
        const response = await archiveApi.initializeArchive({
          currentDate: new Date().toISOString().split('T')[0]
        })
        
        if (response.success) {
          console.log('存档初始化成功')
          return true
        }
      } catch (error: any) {
        console.error('存档初始化失败:', error)
      }
      
      return false
    },

    // 清除错误状态
    clearError() {
      this.error = null
    },

    // 重置状态
    reset() {
      this.archives = []
      this.currentArchive = null
      this.isLoading = false
      this.error = null
    }
  }
})
