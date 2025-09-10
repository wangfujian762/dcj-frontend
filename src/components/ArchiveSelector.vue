<template>
  <div class="dcj-archive-selector">
    <!-- 更换存档按钮 -->
    <button 
      class="dcj-archive-button"
      @click="showSelector = true"
    >
      <IconArchive size="small" />
      <span class="dcj-archive-button__text">
        {{ currentArchive?.archiveNumber || '选择存档' }}
      </span>
    </button>
    
    <!-- 存档选择框 -->
    <Teleport to="body">
      <div 
        v-if="showSelector" 
        class="dcj-modal-overlay"
        @click="showSelector = false"
      >
        <div class="dcj-archive-modal" @click.stop>
          <div class="dcj-modal-header">
            <h3>选择存档</h3>
            <button 
              class="dcj-modal-close"
              @click="showSelector = false"
            >
              ×
            </button>
          </div>
          
          <div class="dcj-archive-content">
            <!-- 存档列表 -->
            <div class="dcj-archive-list">
              <div
                v-for="archive in archives"
                :key="archive.id"
                :class="[
                  'dcj-archive-item',
                  { 'dcj-archive-item--active': archive.id === currentArchive?.id }
                ]"
                @click="selectArchive(archive)"
              >
                <div class="dcj-archive-item__info">
                  <div class="dcj-archive-item__number">{{ archive.archiveNumber }}</div>
                  <div class="dcj-archive-item__name">{{ archive.archiveName }}</div>
                  <div class="dcj-archive-item__date">
                    {{ formatDate(archive.updatedAt) }}
                  </div>
                </div>
                <div class="dcj-archive-item__status">
                  <span v-if="archive.isActive" class="dcj-status-badge dcj-status-badge--active">
                    当前
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 创建新存档 -->
            <div class="dcj-archive-create">
              <h4>创建新存档</h4>
              <form @submit.prevent="createArchive">
                <div class="dcj-form-group">
                  <input
                    v-model="newArchive.archiveName"
                    type="text"
                    class="dcj-form-input"
                    placeholder="存档名称"
                    required
                  />
                </div>
                <div class="dcj-form-group">
                  <input
                    v-model="newArchive.archiveNumber"
                    type="text"
                    class="dcj-form-input"
                    placeholder="存档编号"
                    required
                  />
                </div>
                <button
                  type="submit"
                  class="dcj-create-button"
                  :disabled="!isCreateFormValid || isCreating"
                >
                  {{ isCreating ? '创建中...' : '创建存档' }}
                </button>
              </form>
              
              <div v-if="createErrorMessage" class="dcj-error-message">
                {{ createErrorMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Archive } from '@/types'
import { IconArchive } from '@/components/icons'
import { useArchiveStore } from '@/stores/archive'

const archiveStore = useArchiveStore()

// 状态管理
const showSelector = ref(false)
const isCreating = ref(false)
const createErrorMessage = ref('')

// 新存档表单
const newArchive = ref({
  archiveName: '',
  archiveNumber: ''
})

// 计算属性
const archives = computed(() => archiveStore.archives)
const currentArchive = computed(() => archiveStore.currentArchive)

const isCreateFormValid = computed(() => {
  return newArchive.value.archiveName.length > 0 && 
         newArchive.value.archiveNumber.length > 0
})

// 选择存档
const selectArchive = async (archive: Archive) => {
  try {
    await archiveStore.switchArchive(archive.id)
    showSelector.value = false
    
    // 触发初始化流程
    await archiveStore.initializeArchive()
    
  } catch (error: any) {
    alert(`切换存档失败: ${error.message}`)
  }
}

// 创建新存档
const createArchive = async () => {
  if (!isCreateFormValid.value) return
  
  isCreating.value = true
  createErrorMessage.value = ''
  
  try {
    await archiveStore.createArchive({
      archiveName: newArchive.value.archiveName,
      archiveNumber: newArchive.value.archiveNumber
    })
    
    // 清空表单
    newArchive.value = {
      archiveName: '',
      archiveNumber: ''
    }
    
    showSelector.value = false
    
  } catch (error: any) {
    createErrorMessage.value = error.message || '创建存档失败'
  } finally {
    isCreating.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时加载存档列表
onMounted(async () => {
  try {
    await archiveStore.loadArchives()
  } catch (error) {
    console.error('加载存档列表失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.dcj-archive-button {
  @include flex-start;
  @include button-base;
  height: 33px;
  padding: 0 $spacing-sm;
  gap: $spacing-xs;
  min-width: 120px;
  
  &__text {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    @include text-ellipsis;
  }
}

.dcj-archive-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: rgba(12, 95, 130, 0.95);
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-lg;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.dcj-modal-header {
  @include flex-between;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
  
  h3 {
    font-size: $font-size-lg;
    color: $color-component-primary;
    margin: 0;
  }
  
  .dcj-modal-close {
    width: 32px;
    height: 32px;
    @include flex-center;
    background: none;
    border: none;
    color: $color-text-secondary;
    font-size: 20px;
    cursor: pointer;
    border-radius: 50%;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.dcj-archive-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.dcj-archive-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  max-height: 300px;
  overflow-y: auto;
}

.dcj-archive-item {
  @include flex-between;
  padding: $spacing-md;
  background: rgba(16, 111, 152, 0.3);
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $duration-fast $ease-in-out-smooth;
  
  &:hover {
    background: rgba(16, 111, 152, 0.5);
    border-color: $border-color-active;
  }
  
  &--active {
    background: rgba(187, 255, 224, 0.1);
    border-color: $color-component-primary;
  }
  
  &__info {
    flex: 1;
    
    .dcj-archive-item__number {
      font-size: $font-size-md;
      font-weight: $font-weight-bold;
      color: $color-component-primary;
      margin-bottom: $spacing-xs;
    }
    
    .dcj-archive-item__name {
      font-size: $font-size-sm;
      color: $color-text-primary;
      margin-bottom: $spacing-xs;
    }
    
    .dcj-archive-item__date {
      font-size: $font-size-xs;
      color: $color-text-muted;
    }
  }
  
  &__status {
    flex-shrink: 0;
  }
}

.dcj-status-badge {
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  
  &--active {
    background: $color-success;
    color: white;
  }
}

.dcj-archive-create {
  border-top: 1px solid $border-color;
  padding-top: $spacing-lg;
  
  h4 {
    font-size: $font-size-md;
    color: $color-component-primary;
    margin-bottom: $spacing-md;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
  
  .dcj-form-group {
    display: flex;
    flex-direction: column;
  }
  
  .dcj-form-input {
    height: 36px;
    padding: 0 $spacing-sm;
    background: rgba(16, 111, 152, 0.5);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    outline: none;
    
    &:focus {
      border-color: $color-component-primary;
      background: rgba(16, 111, 152, 0.8);
    }
    
    &::placeholder {
      color: $color-text-muted;
    }
  }
  
  .dcj-create-button {
    height: 36px;
    background: $color-success;
    color: white;
    border: none;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:hover:not(:disabled) {
      background: darken($color-success, 10%);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
