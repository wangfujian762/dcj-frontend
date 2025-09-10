<template>
  <svg
    :class="['dcj-icon', `dcj-icon--${size}`, { 'dcj-icon--clickable': clickable }]"
    :width="iconSize"
    :height="iconSize"
    :viewBox="viewBox"
    :style="{ color: color }"
    @click="handleClick"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  color?: string
  viewBox?: string
  clickable?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: '#dbdbdb',
  viewBox: '0 0 1024 1024',
  clickable: false
})

const emit = defineEmits<Emits>()

const iconSize = computed(() => {
  switch (props.size) {
    case 'small': return 16
    case 'medium': return 24
    case 'large': return 32
    default: return 24
  }
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.dcj-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  transition: all 0.2s ease;
  
  &--clickable {
    cursor: pointer;
    
    &:hover {
      transform: scale(1.1);
      filter: brightness(1.2);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  &--small {
    width: 16px;
    height: 16px;
  }
  
  &--medium {
    width: 24px;
    height: 24px;
  }
  
  &--large {
    width: 32px;
    height: 32px;
  }
}
</style>