<template>
  <div 
    :class="[
      'dcj-storage-row',
      { 'dcj-storage-row--dragging': isDragging }
    ]"
    :style="{ paddingLeft: `${indentWidth}px` }"
  >
    <!-- 缩进占位组件 -->
    <div 
      class="dcj-storage-row__indent"
      :style="{ width: `${indentWidth}px` }"
    ></div>
    
    <!-- 拖拽柄 -->
    <div 
      class="dcj-storage-row__drag-handle"
      @mousedown="startDrag"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      draggable="true"
    >
      <IconDragHandle size="small" />
    </div>
    
    <!-- 展开/收起按钮 -->
    <button
      :class="[
        'dcj-storage-row__expand-button',
        'dcj-button',
        'dcj-button--small',
        { 'dcj-storage-row__expand-button--hidden': !hasChildren }
      ]"
      @click="toggleExpand"
    >
      <IconChevronDown v-if="isExpanded" size="small" />
      <IconChevronRight v-else size="small" />
    </button>
    
    <!-- 信息容器 -->
    <div class="dcj-storage-row__content">
      <!-- 一级标签 -->
      <div class="dcj-storage-row__primary-tag">
        <component 
          :is="getPrimaryTagIcon(task.primaryTag)"
          size="small"
          :color="getPrimaryTagColor(task.primaryTag)"
        />
      </div>
      
      <!-- 二级标签 -->
      <div 
        v-if="task.secondaryTag && task.primaryTag === '信息'"
        class="dcj-storage-row__secondary-tag"
      >
        {{ task.secondaryTag }}
      </div>
      
      <!-- 任务文本编辑框 -->
      <input
        v-model="taskText"
        type="text"
        class="dcj-storage-row__text-input"
        :class="{
          'dcj-storage-row__text-input--highlighted': task.displayStatus === 'highlighted',
          'dcj-storage-row__text-input--dimmed': task.displayStatus === 'dimmed'
        }"
        @input="updateTaskText"
        @blur="saveTaskText"
        @keyup.enter="saveTaskText"
      />
      
      <!-- 操作按钮组 -->
      <div class="dcj-storage-row__actions">
        <!-- 提取按钮 -->
        <button
          class="dcj-storage-row__action-button dcj-button dcj-button--small"
          @click="$emit('extract')"
          title="提取到运转面板"
        >
          <IconOperation size="small" />
        </button>
        
        <!-- 完工按钮 -->
        <button
          class="dcj-storage-row__action-button dcj-button dcj-button--small"
          @click="$emit('complete')"
          title="标记为完工"
        >
          <IconComplete size="small" />
        </button>
        
        <!-- 清理/删除按钮 -->
        <button
          class="dcj-storage-row__action-button dcj-button dcj-button--small"
          @click="$emit('delete')"
          title="删除任务"
        >
          <IconDelete size="small" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WarehouseTask } from '@/types'
import { 
  IconDragHandle, 
  IconChevronDown, 
  IconChevronRight,
  IconOperation,
  IconComplete,
  IconDelete,
  PRIMARY_TAG_ICONS
} from '@/components/icons'

interface Props {
  task: WarehouseTask
  isExpanded: boolean
  hasChildren: boolean
}

interface Emits {
  (e: 'toggle-expand'): void
  (e: 'update-text', text: string): void
  (e: 'extract'): void
  (e: 'complete'): void
  (e: 'delete'): void
  (e: 'drag-start', event: DragEvent): void
  (e: 'drag-end', event: DragEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskText = ref(props.task.taskText)
const isDragging = ref(false)

// 计算缩进宽度（基于任务深度）
const indentWidth = computed(() => {
  const baseIndent = 39 // 基础缩进宽度
  return props.task.depth * baseIndent
})

// 获取一级标签图标
const getPrimaryTagIcon = (tagName?: string) => {
  if (!tagName) return 'IconInfo'
  return PRIMARY_TAG_ICONS[tagName as keyof typeof PRIMARY_TAG_ICONS] || 'IconInfo'
}

// 获取一级标签颜色
const getPrimaryTagColor = (tagName?: string): string => {
  const colorMap: Record<string, string> = {
    '信息': '#dbdbdb',
    '机械': '#dbdbdb',
    '混沌': '#dbdbdb',
    '摸鱼': '#dbdbdb'
  }
  return colorMap[tagName || ''] || '#dbdbdb'
}

// 切换展开状态
const toggleExpand = () => {
  if (props.hasChildren) {
    emit('toggle-expand')
  }
}

// 更新任务文本
const updateTaskText = () => {
  emit('update-text', taskText.value)
}

// 保存任务文本
const saveTaskText = () => {
  if (taskText.value !== props.task.taskText) {
    emit('update-text', taskText.value)
  }
}

// 拖拽相关
const startDrag = () => {
  isDragging.value = true
}

const handleDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('drag-start', event)
  
  // 设置拖拽数据
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.task.id)
  }
}

const handleDragEnd = (event: DragEvent) => {
  isDragging.value = false
  emit('drag-end', event)
}

// 监听任务文本变化
watch(() => props.task.taskText, (newValue) => {
  taskText.value = newValue
})
</script>

<style lang="scss" scoped>
.dcj-storage-row {
  @include flex-start;
  height: 50px;
  margin-bottom: $row-gap;
  position: relative;
  transition: all $duration-fast $ease-in-out-smooth;
  
  &--dragging {
    opacity: 0.7;
    transform: rotate(2deg);
    z-index: 1000;
    box-shadow: $box-shadow-lg;
  }
  
  &__indent {
    flex-shrink: 0;
    height: 100%;
    // 宽度通过style动态设置
  }
  
  &__drag-handle {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    @include flex-center;
    cursor: grab;
    background: rgba(187, 255, 224, 0.1);
    border-radius: $border-radius-sm;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:hover {
      background: rgba(187, 255, 224, 0.2);
    }
    
    &:active {
      cursor: grabbing;
      background: rgba(187, 255, 224, 0.3);
    }
  }
  
  &__expand-button {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    @include flex-center;
    background: rgba(187, 255, 224, 0.1);
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:hover:not(&--hidden) {
      background: rgba(187, 255, 224, 0.2);
      transform: scale(1.1);
    }
    
    &--hidden {
      visibility: hidden;
      pointer-events: none;
    }
  }
  
  &__content {
    @include flex-start;
    flex: 1;
    min-width: 0;
    height: 100%;
    gap: $spacing-sm;
    padding-left: $spacing-sm;
  }
  
  &__primary-tag {
    width: $tag-primary-width;
    height: $tag-primary-height;
    flex-shrink: 0;
    @include flex-center;
    background: rgba(187, 255, 224, 0.1);
    border-radius: $border-radius-sm;
  }
  
  &__secondary-tag {
    width: $tag-secondary-width;
    height: $tag-secondary-height;
    flex-shrink: 0;
    @include flex-center;
    background: rgba(187, 255, 224, 0.1);
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
  }
  
  &__text-input {
    flex: 1;
    min-width: 0;
    height: $component-height-standard;
    padding: 0 $spacing-sm;
    background: rgba(8, 79, 108, 0.3);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    outline: none;
    color: $color-text-primary;
    font-size: $font-size-md;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:focus {
      background: rgba(8, 79, 108, 0.6);
      border-color: $color-component-primary;
      box-shadow: 0 0 0 2px rgba(187, 255, 224, 0.2);
    }
    
    &::placeholder {
      color: $color-text-muted;
    }
    
    // 显示状态样式
    &--highlighted {
      background: rgba(255, 255, 0, 0.1);
      border-color: rgba(255, 255, 0, 0.5);
    }
    
    &--dimmed {
      opacity: 0.6;
      background: rgba(128, 128, 128, 0.1);
    }
  }
  
  &__actions {
    display: flex;
    gap: $spacing-xs;
    flex-shrink: 0;
  }
  
  &__action-button {
    width: 30px;
    height: 30px;
    @include flex-center;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:first-child {
      background: rgba(0, 149, 255, 0.8);
      
      &:hover {
        background: rgba(0, 149, 255, 1);
      }
    }
    
    &:nth-child(2) {
      background: rgba(0, 255, 0, 0.8);
      
      &:hover {
        background: rgba(0, 255, 0, 1);
      }
    }
    
    &:last-child {
      background: rgba(255, 0, 0, 0.8);
      
      &:hover {
        background: rgba(255, 0, 0, 1);
      }
    }
  }
}

// 行间占位组件样式
.dcj-storage-row + .dcj-storage-row::before {
  content: '';
  position: absolute;
  top: -#{$row-gap / 2};
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(187, 255, 224, 0.1) 50%,
    transparent 100%
  );
}
</style>

