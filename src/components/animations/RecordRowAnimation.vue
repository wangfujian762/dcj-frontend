<template>
  <div 
    :class="[
      'dcj-record-animation',
      { 'dcj-record-animation--active': isActive }
    ]"
  >
    <slot />
    
    <!-- 火花特效容器 -->
    <div v-if="showSparks" class="dcj-sparks-container">
      <div
        v-for="spark in sparks"
        :key="spark.id"
        :class="['dcj-spark', `dcj-spark--${spark.type}`]"
        :style="{
          left: `${spark.x}px`,
          top: `${spark.y}px`,
          animationDelay: `${spark.delay}ms`,
          animationDuration: `${spark.duration}ms`
        }"
      ></div>
    </div>
    
    <!-- 光环效果 -->
    <div v-if="showGlow" class="dcj-glow-effect"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  trigger: boolean
  intensity?: 'low' | 'medium' | 'high'
  sparkCount?: number
}

interface Spark {
  id: number
  x: number
  y: number
  type: 'star' | 'dot' | 'line'
  delay: number
  duration: number
}

const props = withDefaults(defineProps<Props>(), {
  intensity: 'medium',
  sparkCount: 12
})

const isActive = ref(false)
const showSparks = ref(false)
const showGlow = ref(false)
const sparks = ref<Spark[]>([])

// 根据强度计算参数
const animationParams = computed(() => {
  switch (props.intensity) {
    case 'low':
      return { sparkCount: 8, duration: 400, glowDuration: 300 }
    case 'high':
      return { sparkCount: 20, duration: 800, glowDuration: 600 }
    default:
      return { sparkCount: 12, duration: 600, glowDuration: 450 }
  }
})

// 生成随机火花
const generateSparks = (): Spark[] => {
  const sparkArray: Spark[] = []
  const { sparkCount } = animationParams.value
  
  for (let i = 0; i < sparkCount; i++) {
    sparkArray.push({
      id: i,
      x: Math.random() * 300 - 150, // -150px 到 +150px
      y: Math.random() * 200 - 100, // -100px 到 +100px
      type: ['star', 'dot', 'line'][Math.floor(Math.random() * 3)] as 'star' | 'dot' | 'line',
      delay: Math.random() * 200,
      duration: 300 + Math.random() * 200 // 300-500ms
    })
  }
  
  return sparkArray
}

// 触发动画
const triggerAnimation = async () => {
  if (isActive.value) return // 防止重复触发
  
  isActive.value = true
  showGlow.value = true
  
  // 生成火花
  sparks.value = generateSparks()
  showSparks.value = true
  
  // 等待动画完成
  await nextTick()
  
  setTimeout(() => {
    showGlow.value = false
  }, animationParams.value.glowDuration)
  
  setTimeout(() => {
    showSparks.value = false
    isActive.value = false
    sparks.value = []
  }, animationParams.value.duration)
}

// 监听触发器
watch(() => props.trigger, (newValue) => {
  if (newValue) {
    triggerAnimation()
  }
})

// 暴露触发方法
defineExpose({
  triggerAnimation
})
</script>

<style lang="scss" scoped>
.dcj-record-animation {
  position: relative;
  overflow: visible;
  
  &--active {
    animation: record-pop 300ms $ease-in-out-smooth;
  }
}

.dcj-sparks-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
  width: 0;
  height: 0;
}

.dcj-spark {
  position: absolute;
  pointer-events: none;
  
  &--star {
    width: 4px;
    height: 4px;
    background: $color-component-primary;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: spark-star-fly var(--duration, 400ms) ease-out forwards;
  }
  
  &--dot {
    width: 3px;
    height: 3px;
    background: $color-component-primary;
    border-radius: 50%;
    animation: spark-dot-fly var(--duration, 400ms) ease-out forwards;
  }
  
  &--line {
    width: 8px;
    height: 1px;
    background: linear-gradient(to right, $color-component-primary, transparent);
    animation: spark-line-fly var(--duration, 400ms) ease-out forwards;
  }
}

.dcj-glow-effect {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: radial-gradient(
    ellipse at center,
    rgba(187, 255, 224, 0.4) 0%,
    rgba(187, 255, 224, 0.2) 50%,
    transparent 100%
  );
  border-radius: $border-radius-md;
  animation: glow-pulse 450ms ease-out forwards;
  pointer-events: none;
  z-index: -1;
}

// 记录行弹出动画
@keyframes record-pop {
  0% {
    transform: scale(0.95) translateY(10px);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05) translateY(-2px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

// 火花飞行动画
@keyframes spark-star-fly {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(0.5);
  }
  50% {
    opacity: 0.8;
    transform: translate(var(--x, 0px), var(--y, 0px)) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--x, 0px) * 1.5), calc(var(--y, 0px) * 1.5)) scale(0.2);
  }
}

@keyframes spark-dot-fly {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x, 0px), var(--y, 0px)) scale(0.3);
  }
}

@keyframes spark-line-fly {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x, 0px), var(--y, 0px)) rotate(90deg);
  }
}

// 光环脉冲动画
@keyframes glow-pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}
</style>

