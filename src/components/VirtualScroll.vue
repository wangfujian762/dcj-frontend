<template>
  <div 
    ref="containerRef"
    class="dcj-virtual-scroll"
    @scroll="handleScroll"
  >
    <!-- 总高度占位 -->
    <div 
      class="dcj-virtual-scroll-spacer"
      :style="{ height: `${totalHeight}px` }"
    ></div>
    
    <!-- 可见项目容器 -->
    <div 
      class="dcj-virtual-scroll-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item)"
        :style="{ height: `${itemHeight}px` }"
        class="dcj-virtual-scroll-item"
      >
        <slot 
          :item="item" 
          :index="item.index"
          :is-visible="true"
        />
      </div>
    </div>
    
    <!-- 滚动指示器 -->
    <div v-if="showScrollIndicator" class="dcj-scroll-indicator">
      <div class="dcj-scroll-thumb" :style="scrollThumbStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface VirtualScrollItem {
  index: number
  data: any
}

interface Props {
  items: any[]
  itemHeight: number
  containerHeight?: number
  overscan?: number
  getItemKey?: (item: any) => string | number
  showScrollIndicator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  containerHeight: 400,
  overscan: 5,
  getItemKey: (item: any) => item.id || item.index,
  showScrollIndicator: true
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(props.containerHeight)

// 计算总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

// 计算可见范围
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = Math.min(
    start + Math.ceil(containerHeight.value / props.itemHeight),
    props.items.length
  )
  
  return {
    start: Math.max(0, start - props.overscan),
    end: Math.min(props.items.length, end + props.overscan)
  }
})

// 计算可见项目
const visibleItems = computed((): VirtualScrollItem[] => {
  const { start, end } = visibleRange.value
  const items: VirtualScrollItem[] = []
  
  for (let i = start; i < end; i++) {
    items.push({
      index: i,
      data: props.items[i]
    })
  }
  
  return items
})

// 计算偏移量
const offsetY = computed(() => {
  return visibleRange.value.start * props.itemHeight
})

// 滚动条样式
const scrollThumbStyle = computed(() => {
  const thumbHeight = Math.max(
    (containerHeight.value / totalHeight.value) * containerHeight.value,
    20
  )
  const thumbTop = (scrollTop.value / totalHeight.value) * containerHeight.value
  
  return {
    height: `${thumbHeight}px`,
    transform: `translateY(${thumbTop}px)`
  }
})

// 处理滚动
const handleScroll = () => {
  if (!containerRef.value) return
  scrollTop.value = containerRef.value.scrollTop
}

// 滚动到指定项目
const scrollToItem = (index: number, align: 'start' | 'center' | 'end' = 'start') => {
  if (!containerRef.value) return
  
  let targetScrollTop = index * props.itemHeight
  
  if (align === 'center') {
    targetScrollTop -= containerHeight.value / 2 - props.itemHeight / 2
  } else if (align === 'end') {
    targetScrollTop -= containerHeight.value - props.itemHeight
  }
  
  targetScrollTop = Math.max(0, Math.min(targetScrollTop, totalHeight.value - containerHeight.value))
  
  containerRef.value.scrollTo({
    top: targetScrollTop,
    behavior: 'smooth'
  })
}

// 滚动到顶部
const scrollToTop = () => {
  containerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

// 滚动到底部
const scrollToBottom = () => {
  containerRef.value?.scrollTo({ top: totalHeight.value, behavior: 'smooth' })
}

// 更新容器高度
const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

// 暴露方法
defineExpose({
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  updateContainerHeight
})

// 监听容器尺寸变化
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateContainerHeight()
  
  if (window.ResizeObserver && containerRef.value) {
    resizeObserver = new ResizeObserver(updateContainerHeight)
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// 监听项目数量变化
watch(() => props.items.length, () => {
  // 如果滚动位置超出范围，调整到底部
  if (scrollTop.value > totalHeight.value - containerHeight.value) {
    scrollToBottom()
  }
})
</script>

<style lang="scss" scoped>
.dcj-virtual-scroll {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.dcj-virtual-scroll-spacer {
  width: 100%;
  pointer-events: none;
}

.dcj-virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.dcj-virtual-scroll-item {
  width: 100%;
  overflow: hidden;
}

.dcj-scroll-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.dcj-scroll-thumb {
  width: 100%;
  background: rgba(187, 255, 224, 0.5);
  border-radius: 4px;
  transition: background $duration-fast $ease-in-out-smooth;
  will-change: transform;
}

// 优化滚动性能
.dcj-virtual-scroll {
  // 启用硬件加速
  transform: translateZ(0);
  
  // 优化滚动
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.dcj-virtual-scroll-content {
  // 启用硬件加速
  transform: translateZ(0);
}
</style>

