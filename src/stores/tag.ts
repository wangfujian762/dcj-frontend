import { defineStore } from 'pinia'
import type { PrimaryTagOption, SecondaryTagOption, DropdownOption } from '@/types'
import { tagApi } from '@/api/tag'

interface TagState {
  primaryTags: PrimaryTagOption[]
  secondaryTags: SecondaryTagOption[]
  businessTypes: string[]
  isLoading: boolean
  error: string | null
}

export const useTagStore = defineStore('tag', {
  state: (): TagState => ({
    primaryTags: [],
    secondaryTags: [],
    businessTypes: [],
    isLoading: false,
    error: null
  }),

  getters: {
    // 转换为下拉选项格式
    primaryTagOptions: (state): DropdownOption[] => {
      return state.primaryTags.map(tag => ({
        id: tag.id,
        label: tag.tagName,
        value: tag.tagName,
        icon: tag.tagName, // 图标名称与标签名称相同
        color: tag.tagColor,
        disabled: false
      }))
    },

    secondaryTagOptions: (state): DropdownOption[] => {
      return state.secondaryTags.map(tag => ({
        id: tag.id,
        label: tag.tagName,
        value: tag.tagName,
        color: tag.tagColor,
        disabled: false,
        customizable: !tag.isSystemDefault
      }))
    },

    businessTypeOptions: (state): DropdownOption[] => {
      return state.businessTypes.map((type, index) => ({
        id: `business-${index}`,
        label: type,
        value: type,
        disabled: false
      }))
    },

    // 根据父类别获取二级标签选项
    getSecondaryTagsByCategory: (state) => (category?: string): DropdownOption[] => {
      let filteredTags = state.secondaryTags
      
      if (category) {
        filteredTags = state.secondaryTags.filter(tag => tag.parentCategory === category)
      }
      
      return filteredTags.map(tag => ({
        id: tag.id,
        label: tag.tagName,
        value: tag.tagName,
        color: tag.tagColor,
        disabled: false,
        customizable: !tag.isSystemDefault
      }))
    },

    // 获取系统预设标签
    systemPrimaryTags: (state) => {
      return state.primaryTags.filter(tag => tag.isSystemDefault)
    },

    systemSecondaryTags: (state) => {
      return state.secondaryTags.filter(tag => tag.isSystemDefault)
    },

    // 获取用户自定义标签
    customSecondaryTags: (state) => {
      return state.secondaryTags.filter(tag => !tag.isSystemDefault)
    }
  },

  actions: {
    // 加载所有标签选项
    async loadTagOptions() {
      this.isLoading = true
      this.error = null
      
      try {
        // 并行加载所有标签数据
        const [primaryResponse, secondaryResponse, businessResponse] = await Promise.all([
          tagApi.getPrimaryTagOptions(),
          tagApi.getSecondaryTagOptions(),
          tagApi.getBusinessTypeOptions()
        ])
        
        if (primaryResponse.success && primaryResponse.data) {
          this.primaryTags = primaryResponse.data.tags
        }
        
        if (secondaryResponse.success && secondaryResponse.data) {
          this.secondaryTags = secondaryResponse.data.tags
        }
        
        if (businessResponse.success && businessResponse.data) {
          this.businessTypes = businessResponse.data.types
        }
        
      } catch (error: any) {
        this.error = error.message || '加载标签选项失败'
        console.error('加载标签选项失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 创建自定义二级标签
    async createCustomSecondaryTag(tagName: string, parentCategory?: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await tagApi.createSecondaryTagOption({
          tagName,
          tagColor: '#dbdbdb',
          parentCategory,
          sortOrder: this.secondaryTags.length + 1
        })
        
        if (response.success && response.data) {
          this.secondaryTags.push(response.data)
          return response.data
        } else {
          throw new Error(response.error?.message || '创建自定义标签失败')
        }
      } catch (error: any) {
        this.error = error.message || '创建自定义标签失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 删除自定义二级标签
    async deleteCustomSecondaryTag(tagId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await tagApi.deleteSecondaryTagOption(tagId)
        
        if (response.success) {
          this.secondaryTags = this.secondaryTags.filter(tag => tag.id !== tagId)
          return true
        } else {
          throw new Error(response.error?.message || '删除自定义标签失败')
        }
      } catch (error: any) {
        this.error = error.message || '删除自定义标签失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 更新标签选项
    async updateTagOption(tagId: string, updateData: Partial<PrimaryTagOption | SecondaryTagOption>) {
      this.isLoading = true
      this.error = null
      
      try {
        // 根据标签类型选择相应的API
        const isPrimaryTag = this.primaryTags.some(tag => tag.id === tagId)
        
        let response
        if (isPrimaryTag) {
          response = await tagApi.updatePrimaryTagOption(tagId, updateData)
        } else {
          response = await tagApi.updateSecondaryTagOption(tagId, updateData)
        }
        
        if (response.success && response.data) {
          // 更新本地状态
          if (isPrimaryTag) {
            const index = this.primaryTags.findIndex(tag => tag.id === tagId)
            if (index !== -1) {
              this.primaryTags[index] = response.data
            }
          } else {
            const index = this.secondaryTags.findIndex(tag => tag.id === tagId)
            if (index !== -1) {
              this.secondaryTags[index] = response.data
            }
          }
          
          return response.data
        } else {
          throw new Error(response.error?.message || '更新标签选项失败')
        }
      } catch (error: any) {
        this.error = error.message || '更新标签选项失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 同步标签选项
    async syncTagOptions() {
      try {
        const response = await tagApi.syncTagOptions()
        
        if (response.success) {
          // 重新加载标签数据
          await this.loadTagOptions()
          return response.data
        }
      } catch (error: any) {
        console.error('同步标签选项失败:', error)
      }
    },

    // 获取标签使用统计
    async getTagStats() {
      try {
        const response = await tagApi.getTagStats()
        
        if (response.success && response.data) {
          return response.data
        }
      } catch (error: any) {
        console.error('获取标签统计失败:', error)
      }
      
      return null
    },

    // 清除错误状态
    clearError() {
      this.error = null
    },

    // 重置状态
    reset() {
      this.primaryTags = []
      this.secondaryTags = []
      this.businessTypes = []
      this.isLoading = false
      this.error = null
    }
  }
})

