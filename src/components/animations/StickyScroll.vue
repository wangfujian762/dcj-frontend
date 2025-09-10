<template>
  <div 
    ref="containerRef"
    class="dcj-sticky-scroll-container"
    @scroll="handleScroll"
  >
    <!-- 粘性日期行容器 -->
    <div class="dcj-sticky-dates">
      <div
        v-for="date in stickyDates"
        :key="date.id"
        :class="[
          'dcj-sticky-date',
          { 'dcj-sticky-date--active': date.isActive }
        ]"
        :style="{ top: '0px' }"
      >
        <slot name="date-row" :date="date" />
      </div>
    </div>
    
    <!-- 粘性未完结任务容器 -->
    <div class="dcj-sticky-tasks">
      <div
        v-for="(task, index) in stickyTasks"
        :key="task.id"
        :class="[
          'dcj-sticky-task',
          { 'dcj-sticky-task--active': task.isActive }
        ]"
        :style="{ top: `${(index + 1) * 34}px` }"
      >
        <slot name="task-row" :task="task" />
      </div>
    </div>
    
    <!-- 普通内容区域 -->
    <div class="dcj-scroll-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface StickyItem {
  id: string
  element?: HTMLElement
  offsetTop: number
  isActive: boolean
  type: 'date' | 'task'
  data: any
}

interface Props {
  dateRows: Array<{ id: string; date: string; element?: HTMLElement }>
  unfinishedTaskRows: Array<{ id: string; taskId: string; element?: HTMLElement }>
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const stickyDates = ref<StickyItem[]>([])
const stickyTasks = ref<StickyItem[]>([])

// 计算当前应该粘性显示的日期
const currentStickyDate = computed(() => {
  return stickyDates.value.find(date => date.isActive)
})

// 计算当前应该粘性显示的未完结任务
const currentStickyTasks = computed(() => {
  return stickyTasks.value.filter(task => task.isActive)
})

// 处理滚动事件
const handleScroll = () => {
  if (!containerRef.value) return
  
  scrollTop.value = containerRef.value.scrollTop
  updateStickyItems()
}

// 更新粘性项目状态
const updateStickyItems = () => {
  updateStickyDates()
  updateStickyTasks()
}

// 更新粘性日期状态
const updateStickyDates = () => {
  let currentActiveDate: StickyItem | null = null
  
  stickyDates.value.forEach(date => {
    date.isActive = false
    
    if (date.offsetTop <= scrollTop.value) {
      if (!currentActiveDate || date.offsetTop > currentActiveDate.offsetTop) {
        currentActiveDate = date
      }
    }
  })
  
  if (currentActiveDate) {
    currentActiveDate.isActive = true
  }
}

// 更新粘性未完结任务状态
const updateStickyTasks = () => {
  const activeTasks: StickyItem[] = []
  
  stickyTasks.value.forEach(task => {
    task.isActive = false
    
    // 检查任务是否应该粘性显示
    const dateRowHeight = 34
    const taskThreshold = scrollTop.value + dateRowHeight
    
    if (task.offsetTop <= taskThreshold) {
      activeTasks.push(task)
    }
  })
  
  // 按位置排序并设置激活状态
  activeTasks
    .sort((a, b) => b.offsetTop - a.offsetTop) // 最近的在前
    .slice(0, 5) // 最多显示5个
    .forEach(task => {
      task.isActive = true
    })
}

// 初始化粘性项目
const initializeStickyItems = () => {
  // 初始化日期行
  stickyDates.value = props.dateRows.map(date => ({
    id: date.id,
    element: date.element,
    offsetTop: date.element?.offsetTop || 0,
    isActive: false,
    type: 'date',
    data: date
  }))
  
  // 初始化未完结任务行
  stickyTasks.value = props.unfinishedTaskRows.map(task => ({
    id: task.id,
    element: task.element,
    offsetTop: task.element?.offsetTop || 0,
    isActive: false,
    type: 'task',
    data: task
  }))
  
  updateStickyItems()
}

// 刷新粘性项目位置
const refreshStickyPositions = () => {
  stickyDates.value.forEach(date => {
    if (date.element) {
      date.offsetTop = date.element.offsetTop
    }
  })
  
  stickyTasks.value.forEach(task => {
    if (task.element) {
      task.offsetTop = task.element.offsetTop
    }
  })
  
  updateStickyItems()
}

// 监听数据变化
watch(() => [props.dateRows, props.unfinishedTaskRows], () => {
  initializeStickyItems()
}, { deep: true })

// 暴露方法
defineExpose({
  refreshStickyPositions,
  initializeStickyItems
})

onMounted(() => {
  initializeStickyItems()
})
</script>

<style lang="scss" scoped>
.dcj-sticky-scroll-container {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.dcj-sticky-dates {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-index-sticky + 2;
  pointer-events: none;
}

.dcj-sticky-date {
  position: absolute;
  width: 100%;
  height: $component-height-large;
  background: $color-bg-primary;
  border-bottom: 2px solid $color-component-primary;
  transition: opacity $duration-fast $ease-in-out-smooth;
  opacity: 0;
  
  &--active {
    opacity: 1;
    pointer-events: auto;
  }
}

.dcj-sticky-tasks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-index-sticky + 1;
  pointer-events: none;
}

.dcj-sticky-task {
  position: absolute;
  width: 100%;
  height: $component-height-large;
  background: rgba(255, 165, 0, 0.1);
  border-bottom: 1px solid rgba(255, 165, 0, 0.3);
  transition: opacity $duration-fast $ease-in-out-smooth;
  opacity: 0;
  
  &--active {
    opacity: 1;
    pointer-events: auto;
  }
}

.dcj-scroll-content {
  position: relative;
  z-index: 1;
}

// 粘性切换动画
.dcj-sticky-date,
.dcj-sticky-task {
  &.sticky-enter-active,
  &.sticky-leave-active {
    transition: all $duration-fast $ease-in-out-smooth;
  }
  
  &.sticky-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  &.sticky-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>

