<template>
  <div class="dcj-warehouse-storage-area">
    <!-- 存储区域 -->
    <div 
      class="dcj-storage-container"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <!-- 存储行列表 -->
      <template v-for="task in visibleTasks" :key="task.id">
        <StorageRow
          :task="task"
          :is-expanded="expandedTasks.has(task.id)"
          :has-children="hasChildren(task)"
          @toggle-expand="$emit('toggle-expand', task.id)"
          @update-text="updateTaskText(task.id, $event)"
          @extract="$emit('extract', task)"
          @complete="$emit('complete', task)"
          @delete="$emit('delete', task)"
          @drag-start="handleDragStart(task, $event)"
          @drag-end="handleDragEnd"
        />
        
        <!-- 行间占位组件 -->
        <div 
          v-if="shouldShowSeparator(task)"
          class="dcj-storage-separator"
        ></div>
      </template>
      
      <!-- 空状态提示 -->
      <div v-if="visibleTasks.length === 0" class="dcj-storage-empty">
        <div class="dcj-storage-empty__icon">📦</div>
        <div class="dcj-storage-empty__text">仓库暂无任务</div>
        <div class="dcj-storage-empty__hint">在上方编辑框中输入任务并点击入库</div>
      </div>
    </div>
    
    <!-- 滚动条 -->
    <div class="dcj-storage-scrollbar"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WarehouseTask } from '@/types'
import StorageRow from './StorageRow.vue'

interface Props {
  warehouseTasks: WarehouseTask[]
  expandedTasks: Set<string>
}

interface Emits {
  (e: 'toggle-expand', taskId: string): void
  (e: 'update-task', taskId: string, text: string): void
  (e: 'extract', task: WarehouseTask): void
  (e: 'complete', task: WarehouseTask): void
  (e: 'delete', task: WarehouseTask): void
  (e: 'reorder', tasks: WarehouseTask[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const draggedTask = ref<WarehouseTask | null>(null)
const dragOverTask = ref<WarehouseTask | null>(null)

// 计算可见任务（考虑展开/收起状态）
const visibleTasks = computed(() => {
  const result: WarehouseTask[] = []
  
  const addTaskAndChildren = (task: WarehouseTask) => {
    result.push(task)
    
    // 如果任务展开，添加其子任务
    if (props.expandedTasks.has(task.id)) {
      const children = props.warehouseTasks
        .filter(t => t.parentTaskId === task.id)
        .sort((a, b) => a.priority - b.priority)
      
      children.forEach(child => addTaskAndChildren(child))
    }
  }
  
  // 添加顶级任务（没有父任务的任务）
  const topLevelTasks = props.warehouseTasks
    .filter(task => !task.parentTaskId)
    .sort((a, b) => a.priority - b.priority)
  
  topLevelTasks.forEach(task => addTaskAndChildren(task))
  
  return result
})

// 检查任务是否有子任务
const hasChildren = (task: WarehouseTask): boolean => {
  return props.warehouseTasks.some(t => t.parentTaskId === task.id)
}

// 是否应该显示分隔符
const shouldShowSeparator = (task: WarehouseTask): boolean => {
  const taskIndex = visibleTasks.value.findIndex(t => t.id === task.id)
  return taskIndex < visibleTasks.value.length - 1
}

// 更新任务文本
const updateTaskText = (taskId: string, text: string) => {
  emit('update-task', taskId, text)
}

// 拖拽开始
const handleDragStart = (task: WarehouseTask, event: DragEvent) => {
  draggedTask.value = task
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify({
      taskId: task.id,
      type: 'warehouse-task'
    }))
  }
}

// 拖拽结束
const handleDragEnd = () => {
  draggedTask.value = null
  dragOverTask.value = null
}

// 处理拖放
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!draggedTask.value) return
  
  try {
    const data = event.dataTransfer?.getData('application/json')
    if (data) {
      const dropData = JSON.parse(data)
      
      if (dropData.type === 'warehouse-task' && dropData.taskId) {
        // 计算新的排序
        const reorderedTasks = calculateNewOrder(draggedTask.value, dragOverTask.value)
        emit('reorder', reorderedTasks)
      }
    }
  } catch (error) {
    console.error('拖放处理失败:', error)
  }
  
  handleDragEnd()
}

// 计算新的排序
const calculateNewOrder = (draggedTask: WarehouseTask, targetTask: WarehouseTask | null): WarehouseTask[] => {
  // 这里实现任务重排序逻辑
  // 根据拖拽的目标位置重新计算priority
  const tasks = [...props.warehouseTasks]
  
  if (targetTask) {
    const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id)
    const targetIndex = tasks.findIndex(t => t.id === targetTask.id)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // 移动任务到新位置
      const [movedTask] = tasks.splice(draggedIndex, 1)
      tasks.splice(targetIndex, 0, movedTask)
      
      // 重新分配priority
      tasks.forEach((task, index) => {
        task.priority = index + 1
      })
    }
  }
  
  return tasks
}
</script>

<style lang="scss" scoped>
.dcj-warehouse-storage-area {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.dcj-storage-container {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-sm $spacing-md;
  padding-right: $spacing-md + $scrollbar-width; // 为滚动条留出空间
}

.dcj-storage-separator {
  height: $row-gap;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(187, 255, 224, 0.1) 50%,
    transparent 100%
  );
  margin: 0 $spacing-sm;
}

.dcj-storage-empty {
  @include flex-center;
  flex-direction: column;
  height: 200px;
  color: $color-text-muted;
  
  &__icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
    opacity: 0.5;
  }
  
  &__text {
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-sm;
  }
  
  &__hint {
    font-size: $font-size-sm;
    opacity: 0.7;
    text-align: center;
    line-height: 1.4;
  }
}

.dcj-storage-scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  width: $scrollbar-width;
  height: 100%;
  background: rgba(187, 255, 224, 0.1);
  border-radius: $border-radius-sm;
}

// 拖拽时的视觉反馈
.dcj-storage-container {
  &.drag-over {
    background: rgba(187, 255, 224, 0.05);
  }
}

// 拖拽目标指示器
.dcj-storage-row {
  &.drag-target-above::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: $color-component-primary;
    border-radius: 1px;
  }
  
  &.drag-target-below::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: $color-component-primary;
    border-radius: 1px;
  }
}

// 树形结构的视觉连接线
.dcj-storage-row {
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(187, 255, 224, 0.2);
    margin-left: calc(var(--depth) * 39px + 15px);
  }
  
  // 为不同深度的任务设置不同的连接线样式
  &[data-depth="1"]::before {
    background: rgba(187, 255, 224, 0.3);
  }
  
  &[data-depth="2"]::before {
    background: rgba(187, 255, 224, 0.4);
  }
  
  &[data-depth="3"]::before {
    background: rgba(187, 255, 224, 0.5);
  }
}
</style>

