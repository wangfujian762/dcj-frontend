<template>
  <div 
    :class="[
      'dcj-prefix-text',
      `dcj-prefix-text--${context}`,
      prefixColorClass
    ]"
    :style="{ width: `${prefixWidth}px` }"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  context: 'record' | 'edit-a' | 'edit-b' | 'special'
  isFocus?: boolean
  isCompleted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFocus: false,
  isCompleted: false
})

// 计算前缀文本宽度（基于字符数量）
const prefixWidth = computed(() => {
  // 每个字符大约占用8px宽度（等宽字体）
  const charWidth = 8
  const padding = 16 // 左右各8px padding
  return Math.max(props.text.length * charWidth + padding, 40) // 最小宽度40px
})

// 根据长度和上下文计算颜色类
const prefixColorClass = computed(() => {
  const textLength = props.text.length
  
  // 记录行的颜色逻辑
  if (props.context === 'record') {
    if (props.isFocus) {
      // 焦点行根据长度显示特殊颜色
      return getPrefixColorByLength(textLength)
    } else if (props.isCompleted) {
      return 'dcj-prefix-text--completed'
    } else {
      return 'dcj-prefix-text--uncompleted'
    }
  }
  
  // 编辑行A和B根据长度显示特殊颜色
  if (props.context === 'edit-a' || props.context === 'edit-b') {
    return getPrefixColorByLength(textLength)
  }
  
  // 特殊编辑行使用默认颜色
  return 'dcj-prefix-text--default'
})

// 根据长度获取颜色类（游戏装备品质配色）
const getPrefixColorByLength = (length: number): string => {
  const cycle = Math.floor((length - 4) / 4) % 6
  const position = (length - 4) % 24
  
  if (position < 4) return 'dcj-prefix-text--white'      // 长度4: 纯白色
  if (position < 8) return 'dcj-prefix-text--green'      // 长度8: 绿色
  if (position < 12) return 'dcj-prefix-text--blue'      // 长度12: 蓝色
  if (position < 16) return 'dcj-prefix-text--purple'    // 长度16: 紫色
  if (position < 20) return 'dcj-prefix-text--orange'    // 长度20: 橙色
  return 'dcj-prefix-text--red'                          // 长度24: 红色
}
</script>

<style lang="scss" scoped>
.dcj-prefix-text {
  @include flex-center;
  height: $component-height-large;
  padding: 0 $spacing-xs;
  font-weight: $font-weight-bold;
  font-size: $font-size-sm;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: text;
  flex-shrink: 0;
  
  // 上下文样式
  &--record {
    // 记录行前缀
  }
  
  &--edit-a,
  &--edit-b {
    // 编辑行前缀
  }
  
  &--special {
    // 特殊编辑行前缀
  }
  
  // 状态颜色
  &--uncompleted {
    color: $color-text-muted; // 未完结任务：黯淡灰白
  }
  
  &--completed {
    color: $color-text-secondary; // 已完结任务：醒目灰白
  }
  
  &--default {
    color: $color-text-primary;
  }
  
  // 游戏装备品质配色系统
  &--white {
    color: $color-prefix-white; // 纯白色
  }
  
  &--green {
    color: $color-prefix-green; // 绿色
  }
  
  &--blue {
    color: $color-prefix-blue; // 蓝色
  }
  
  &--purple {
    color: $color-prefix-purple; // 紫色
  }
  
  &--orange {
    color: $color-prefix-orange; // 橙色
  }
  
  &--red {
    color: $color-prefix-red; // 红色
  }
}
</style>
