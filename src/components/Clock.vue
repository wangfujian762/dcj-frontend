<template>
  <div 
    :class="[
      'dcj-clock',
      `dcj-clock--${type}`,
      { 'dcj-clock--focus': isFocusMode }
    ]"
  >
    {{ displayTime }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  type: 'realtime' | 'timer'
  startTime?: number
  isFocusMode?: boolean
  isRunning?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'realtime',
  startTime: 0,
  isFocusMode: false,
  isRunning: true
})

const currentTime = ref(new Date())
const timerSeconds = ref(props.startTime)
let intervalId: NodeJS.Timeout | null = null

// 格式化实时时钟显示
const formatRealTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 格式化计时器显示
const formatTimer = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  if (minutes === 0) {
    return `${seconds}s`
  }
  return `${minutes}min ${seconds}s`
}

// 计算显示时间
const displayTime = computed(() => {
  if (props.type === 'realtime') {
    return formatRealTime(currentTime.value)
  } else {
    return formatTimer(timerSeconds.value)
  }
})

// 启动时钟更新
const startClock = () => {
  if (intervalId) return
  
  intervalId = setInterval(() => {
    if (props.type === 'realtime') {
      currentTime.value = new Date()
    } else if (props.type === 'timer' && props.isRunning) {
      timerSeconds.value++
    }
  }, 1000)
}

// 停止时钟更新
const stopClock = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// 重置计时器
const resetTimer = () => {
  timerSeconds.value = 0
}

// 暴露方法供父组件调用
defineExpose({
  resetTimer,
  startClock,
  stopClock
})

onMounted(() => {
  startClock()
})

onUnmounted(() => {
  stopClock()
})

// 监听运行状态变化
watch(() => props.isRunning, (newValue) => {
  if (newValue) {
    startClock()
  } else {
    stopClock()
  }
})
</script>

<style lang="scss" scoped>
.dcj-clock {
  @include flex-center;
  width: $clock-width;
  height: $clock-height;
  font-family: $font-family-mono;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  background: $color-bg-secondary;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  color: $color-text-primary;
  user-select: text;
  
  &--realtime {
    color: $color-text-primary;
  }
  
  &--timer {
    color: $color-text-primary;
    
    &.dcj-clock--focus {
      color: $color-focus-clock;
      font-weight: $font-weight-bold;
      border-color: $color-focus-clock;
      box-shadow: 0 0 8px rgba(255, 0, 0, 0.3);
    }
  }
  
  // 特殊编辑行中的时钟（隐藏内容）
  &--hidden-content {
    color: transparent;
  }
}
</style>
