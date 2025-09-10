<template>
  <div class="dcj-state-transition">
    <Transition
      :name="transitionName"
      :duration="transitionDuration"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <slot />
    </Transition>
    
    <!-- 状态指示器 -->
    <div v-if="showStateIndicator" class="dcj-state-indicator">
      <div 
        :class="[
          'dcj-state-badge',
          `dcj-state-badge--${currentState}`
        ]"
      >
        {{ getStateDisplayName(currentState) }}
      </div>
    </div>
    
    <!-- 过渡效果覆盖层 -->
    <div 
      v-if="isTransitioning"
      class="dcj-transition-overlay"
      :class="`dcj-transition-overlay--${transitionType}`"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditState } from '@/types'

interface Props {
  currentState: EditState
  previousState?: EditState
  transitionType?: 'smooth' | 'dramatic' | 'instant'
  showStateIndicator?: boolean
  customDuration?: number
}

interface Emits {
  (e: 'transition-start', from: EditState, to: EditState): void
  (e: 'transition-end', state: EditState): void
}

const props = withDefaults(defineProps<Props>(), {
  transitionType: 'smooth',
  showStateIndicator: false
})

const emit = defineEmits<Emits>()

const isTransitioning = ref(false)

// 计算过渡名称
const transitionName = computed(() => {
  const from = props.previousState
  const to = props.currentState
  
  if (!from || !to) return 'fade'
  
  // 根据状态转换类型选择动画
  if (isCreativeTransition(from, to)) return 'creative-flow'
  if (isTerminationTransition(from, to)) return 'termination'
  if (isArchiveTransition(from, to)) return 'archive-slide'
  if (isRestartTransition(from, to)) return 'restart-bounce'
  
  return 'state-morph'
})

// 计算过渡持续时间
const transitionDuration = computed(() => {
  if (props.customDuration) return props.customDuration
  
  switch (props.transitionType) {
    case 'instant': return 0
    case 'dramatic': return 800
    default: return 400
  }
})

// 判断过渡类型
const isCreativeTransition = (from: EditState, to: EditState): boolean => {
  return to === 'creative_start' || from === 'creative_start'
}

const isTerminationTransition = (from: EditState, to: EditState): boolean => {
  return to === 'terminate'
}

const isArchiveTransition = (from: EditState, to: EditState): boolean => {
  return to === 'archive'
}

const isRestartTransition = (from: EditState, to: EditState): boolean => {
  return to === 'restart_start'
}

// 获取状态显示名称
const getStateDisplayName = (state: EditState): string => {
  const stateNames: Record<EditState, string> = {
    normal_start: '普通启动',
    creative_start: '创造启动',
    restart_start: '重启启动',
    node: '节点状态',
    supplement: '补充状态',
    archive: '存档状态',
    terminate: '终止状态'
  }
  return stateNames[state] || state
}

// 过渡事件处理
const onBeforeEnter = (el: Element) => {
  isTransitioning.value = true
  emit('transition-start', props.previousState!, props.currentState)
}

const onEnter = (el: Element, done: () => void) => {
  // 可以在这里添加自定义进入动画
  setTimeout(done, transitionDuration.value)
}

const onAfterEnter = (el: Element) => {
  isTransitioning.value = false
  emit('transition-end', props.currentState)
}

const onBeforeLeave = (el: Element) => {
  isTransitioning.value = true
}

const onLeave = (el: Element, done: () => void) => {
  // 可以在这里添加自定义离开动画
  setTimeout(done, transitionDuration.value)
}

const onAfterLeave = (el: Element) => {
  isTransitioning.value = false
}
</script>

<style lang="scss" scoped>
.dcj-state-transition {
  position: relative;
  overflow: hidden;
}

.dcj-state-indicator {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  z-index: 100;
  pointer-events: none;
}

.dcj-state-badge {
  padding: $spacing-xs $spacing-sm;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: $border-radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  backdrop-filter: blur(4px);
  
  &--normal_start {
    border-left: 3px solid $color-info;
  }
  
  &--creative_start {
    border-left: 3px solid $color-success;
  }
  
  &--restart_start {
    border-left: 3px solid $color-warning;
  }
  
  &--node {
    border-left: 3px solid $color-component-primary;
  }
  
  &--supplement {
    border-left: 3px solid rgb(200, 12, 200);
  }
  
  &--archive {
    border-left: 3px solid rgb(0, 149, 255);
  }
  
  &--terminate {
    border-left: 3px solid $color-error;
  }
}

.dcj-transition-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 50;
  
  &--dramatic {
    background: radial-gradient(
      circle at center,
      rgba(187, 255, 224, 0.1) 0%,
      transparent 70%
    );
    animation: dramatic-flash 800ms ease-out;
  }
}

// 状态过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity $duration-fast ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.state-morph-enter-active,
.state-morph-leave-active {
  transition: all 400ms $ease-in-out-smooth;
}

.state-morph-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.state-morph-leave-to {
  opacity: 0;
  transform: scale(1.05) translateY(-10px);
}

.creative-flow-enter-active,
.creative-flow-leave-active {
  transition: all 600ms $ease-in-out-smooth;
}

.creative-flow-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-5deg);
  filter: blur(4px);
}

.creative-flow-leave-to {
  opacity: 0;
  transform: scale(1.2) rotate(5deg);
  filter: blur(4px);
}

.termination-enter-active {
  transition: all 300ms ease-in;
}

.termination-leave-active {
  transition: all 300ms ease-out;
}

.termination-enter-from {
  opacity: 0;
  transform: scale(1.1);
  filter: contrast(1.5) saturate(0);
}

.termination-leave-to {
  opacity: 0;
  transform: scale(0.9);
  filter: contrast(0.5) saturate(0);
}

.archive-slide-enter-active,
.archive-slide-leave-active {
  transition: all 500ms $ease-in-out-smooth;
}

.archive-slide-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.archive-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.restart-bounce-enter-active {
  transition: all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.restart-bounce-leave-active {
  transition: all 200ms ease-in;
}

.restart-bounce-enter-from {
  opacity: 0;
  transform: scale(0.3) translateY(-50px);
}

.restart-bounce-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(20px);
}

// 戏剧性闪光动画
@keyframes dramatic-flash {
  0% { opacity: 0; }
  10% { opacity: 0.8; }
  20% { opacity: 0.2; }
  30% { opacity: 0.9; }
  40% { opacity: 0.1; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
</style>

