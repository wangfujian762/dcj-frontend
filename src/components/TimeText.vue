<template>
  <div 
    :class="[
      'dcj-time-text',
      timeColorClass
    ]"
  >
    {{ displayTime }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  time: string | number | Date
  type: 'timestamp' | 'duration' | 'date'
}

const props = defineProps<Props>()

// 格式化显示时间
const displayTime = computed(() => {
  switch (props.type) {
    case 'timestamp':
      return formatTimestamp(props.time)
    case 'duration':
      return formatDuration(props.time as number)
    case 'date':
      return formatDate(props.time)
    default:
      return String(props.time)
  }
})

// 根据时长计算颜色类
const timeColorClass = computed(() => {
  if (props.type === 'duration') {
    const seconds = Number(props.time)
    return getDurationColorClass(seconds)
  }
  return 'dcj-time-text--default'
})

// 格式化时间戳为 HH:mm:ss
const formatTimestamp = (time: string | number | Date): string => {
  const date = new Date(time)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 格式化时长为 XXmin XXs 或 XXs
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}min ${remainingSeconds}s`
}

// 格式化日期为 20XX-XX-XX
const formatDate = (time: string | number | Date): string => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 根据时长获取颜色类（植物生长过程配色）
const getDurationColorClass = (seconds: number): string => {
  if (seconds <= 60) {
    return 'dcj-time-text--tender'        // 1s-1min: 嫩绿色
  } else if (seconds <= 180) {
    return 'dcj-time-text--green-yellow'  // 1min1s-3min: 绿黄色
  } else if (seconds <= 360) {
    return 'dcj-time-text--light-yellow'  // 3min1s-6min: 浅黄色
  } else {
    return 'dcj-time-text--golden'        // 6min1s+: 金黄色
  }
}
</script>

<style lang="scss" scoped>
.dcj-time-text {
  @include flex-center;
  width: $clock-width;
  height: $component-height-standard;
  flex-shrink: 0;
  font-family: $font-family-mono;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  user-select: text;
  
  &--default {
    color: $color-text-primary;
  }
  
  // 时长颜色系统（植物生长过程）
  &--tender {
    color: $color-time-tender; // 嫩绿色 1s-1min
  }
  
  &--green-yellow {
    color: $color-time-green-yellow; // 绿黄色 1min1s-3min
  }
  
  &--light-yellow {
    color: $color-time-light-yellow; // 浅黄色 3min1s-6min
  }
  
  &--golden {
    color: $color-time-golden; // 金黄色 6min1s+
  }
}
</style>
