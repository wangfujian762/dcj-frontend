<template>
  <div 
    :class="[
      'dcj-special-edit-row',
      `dcj-special-edit-row--${type}`
    ]"
    v-show="isVisible"
  >
    <!-- 时钟组件 -->
    <div class="dcj-special-edit-row__clock">
      <Clock
        v-if="showTimer"
        type="timer"
        :start-time="timerStartTime"
        :is-focus-mode="type === 'flow' && isSecondState"
        :is-running="timerRunning"
      />
    </div>
    
    <!-- 前缀文本 -->
    <PrefixText
      :text="prefixText"
      context="special"
      class="dcj-special-edit-row__prefix"
    />
    
    <!-- 业务类型文本 -->
    <div class="dcj-special-edit-row__business-type">
      {{ businessTypeText }}
    </div>
    
    <!-- 运转文本 -->
    <div class="dcj-special-edit-row__text selectable">
      {{ operationText }}
    </div>
    
    <!-- 运转按钮 -->
    <button
      class="dcj-special-edit-row__operation-button dcj-button"
      @click="$emit('operation')"
    >
      <IconOperation size="small" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpecialEditRowType } from '@/types'
import Clock from './Clock.vue'
import PrefixText from './PrefixText.vue'
import { IconOperation } from '@/components/icons'

interface Props {
  type: SpecialEditRowType
  prefixText: string
  isVisible?: boolean
  isSecondState?: boolean
  timerStartTime?: number
  timerRunning?: boolean
}

interface Emits {
  (e: 'operation'): void
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true,
  isSecondState: false,
  timerStartTime: 0,
  timerRunning: false
})

const emit = defineEmits<Emits>()

// 是否显示计时器
const showTimer = computed(() => {
  return props.type === 'flow' && props.isSecondState
})

// 业务类型文本
const businessTypeText = computed(() => {
  switch (props.type) {
    case 'flow':
      return '专注'
    case 'interrupt':
      return '中断'
    case 'error':
      return 'Error'
    default:
      return ''
  }
})

// 运转文本内容
const operationText = computed(() => {
  switch (props.type) {
    case 'flow':
      if (props.isSecondState) {
        return '高燃专注ing，体温冷却后，点按运转以完成对本次燃烧的采样'
      }
      return '长时间无操作，可能已经进入了专注的工作状态，无瑕顾及任务管理'
    
    case 'interrupt':
      return '长时间无操作，可能不得已被其他事件打断。变化是工作的常态，计划以外的活动也值得被记录'
    
    case 'error':
      return '长时间无操作，可能是认知资源过载导致的分心走神，这是一个常见故障'
    
    default:
      return ''
  }
})
</script>

<style lang="scss" scoped>
.dcj-special-edit-row {
  @include flex-start;
  height: $component-height-large;
  padding: 0 $spacing-sm;
  gap: $spacing-sm;
  border-top: 1px solid rgba(187, 255, 224, 0.1);
  position: relative;
  
  &--flow {
    background: rgba(0, 255, 0, 0.05);
    border-left: 3px solid rgba(0, 255, 0, 0.5);
  }
  
  &--interrupt {
    background: rgba(255, 165, 0, 0.05);
    border-left: 3px solid rgba(255, 165, 0, 0.5);
  }
  
  &--error {
    background: rgba(255, 0, 0, 0.05);
    border-left: 3px solid rgba(255, 0, 0, 0.5);
  }
  
  &__clock {
    width: $clock-width;
    height: $clock-height;
    flex-shrink: 0;
    @include flex-center;
  }
  
  &__prefix {
    flex-shrink: 0;
  }
  
  &__business-type {
    width: 50px;
    flex-shrink: 0;
    text-align: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-secondary;
  }
  
  &__text {
    flex: 1;
    min-width: 0;
    height: $component-height-standard;
    line-height: $component-height-standard;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    cursor: text;
    padding-right: 60px; // 为运转按钮留出空间
  }
  
  &__operation-button {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: $button-standard-width;
    height: $component-height-standard;
    z-index: 10;
    
    .dcj-special-edit-row--flow & {
      background: rgba(0, 255, 0, 0.8);
      
      &:hover {
        background: rgba(0, 255, 0, 1);
      }
    }
    
    .dcj-special-edit-row--interrupt & {
      background: rgba(255, 165, 0, 0.8);
      
      &:hover {
        background: rgba(255, 165, 0, 1);
      }
    }
    
    .dcj-special-edit-row--error & {
      background: rgba(255, 0, 0, 0.8);
      
      &:hover {
        background: rgba(255, 0, 0, 1);
      }
    }
  }
}

// 特殊编辑行的出现动画
.dcj-special-edit-row {
  animation: special-row-appear $duration-normal $ease-in-out-smooth;
}

@keyframes special-row-appear {
  0% {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    max-height: $component-height-large;
  }
}
</style>
