<template>
  <div 
    :class="[
      'dcj-edit-row',
      `dcj-edit-row--${type}`,
      { 'dcj-edit-row--disabled': disabled }
    ]"
  >
    <!-- 时钟组件 -->
    <Clock
      :type="clockType"
      :start-time="timerStartTime"
      :is-focus-mode="type === 'b' && isFocusMode"
      :is-running="clockRunning"
      class="dcj-edit-row__clock"
    />
    
    <!-- 前缀文本 -->
    <PrefixText
      :text="prefixText"
      :context="type === 'a' ? 'edit-a' : 'edit-b'"
      class="dcj-edit-row__prefix"
    />
    
    <!-- 业务类型按钮 -->
    <TagButton
      type="business"
      :selected-value="selectedBusinessType"
      :options="businessTypeOptions"
      :disabled="disabled"
      @select="$emit('update:businessType', $event)"
      class="dcj-edit-row__business-type"
    />
    
    <!-- 一级标签按钮 -->
    <TagButton
      type="primary"
      :selected-value="selectedPrimaryTag"
      :options="primaryTagOptions"
      :disabled="disabled"
      @select="handlePrimaryTagSelect"
      class="dcj-edit-row__tag-primary"
    />
    
    <!-- 二级标签按钮 -->
    <TagButton
      v-show="showSecondaryTag"
      type="secondary"
      :selected-value="selectedSecondaryTag"
      :options="secondaryTagOptions"
      :disabled="disabled || !enableSecondaryTag"
      @select="$emit('update:secondaryTag', $event)"
      @add-custom="$emit('add-custom-secondary-tag', $event)"
      @delete-option="$emit('delete-secondary-tag', $event)"
      class="dcj-edit-row__tag-secondary"
    />
    
    <!-- 运转文本编辑框 -->
    <input
      v-model="inputText"
      :class="[
        'dcj-edit-row__text-input',
        { 'dcj-edit-row__text-input--disabled': disabled }
      ]"
      :disabled="disabled"
      :placeholder="placeholder"
      @input="$emit('update:text', inputText)"
      @keyup.enter="$emit('operation')"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
    
    <!-- 运转按钮 -->
    <button
      class="dcj-edit-row__operation-button dcj-button"
      :disabled="!canOperate"
      @click="$emit('operation')"
    >
      <IconOperation size="small" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DropdownOption } from '@/types'
import Clock from './Clock.vue'
import PrefixText from './PrefixText.vue'
import TagButton from './TagButton.vue'
import { IconOperation } from '@/components/icons'

interface Props {
  type: 'a' | 'b'
  text: string
  prefixText: string
  selectedPrimaryTag?: string
  selectedSecondaryTag?: string
  selectedBusinessType?: string
  primaryTagOptions: DropdownOption[]
  secondaryTagOptions: DropdownOption[]
  businessTypeOptions: DropdownOption[]
  disabled?: boolean
  placeholder?: string
  timerStartTime?: number
  isFocusMode?: boolean
  clockRunning?: boolean
  showClock?: boolean
}

interface Emits {
  (e: 'update:text', value: string): void
  (e: 'update:primaryTag', value: string): void
  (e: 'update:secondaryTag', value: string): void
  (e: 'update:businessType', value: string): void
  (e: 'add-custom-secondary-tag', value: string): void
  (e: 'delete-secondary-tag', optionId: string): void
  (e: 'operation'): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '输入运转文本...',
  timerStartTime: 0,
  isFocusMode: false,
  clockRunning: true,
  showClock: true
})

const emit = defineEmits<Emits>()

const inputText = ref(props.text)

// 时钟类型
const clockType = computed(() => {
  return props.type === 'a' ? 'realtime' : 'timer'
})

// 是否显示二级标签
const showSecondaryTag = computed(() => {
  return props.selectedPrimaryTag === '信息'
})

// 二级标签是否启用
const enableSecondaryTag = computed(() => {
  if (!showSecondaryTag.value) return false
  
  // 禁用'重启'、'创造'类的二级标签选项
  const disabledTypes = ['重启', '创造']
  return !disabledTypes.includes(props.selectedSecondaryTag || '')
})

// 是否可以执行运转操作
const canOperate = computed(() => {
  return !props.disabled && inputText.value.trim().length > 0
})

// 处理一级标签选择
const handlePrimaryTagSelect = (value: string) => {
  emit('update:primaryTag', value)
  
  // 如果选择的不是'信息'，清空二级标签
  if (value !== '信息') {
    emit('update:secondaryTag', '')
  }
}

// 监听外部text变化
watch(() => props.text, (newValue) => {
  inputText.value = newValue
})

// 监听输入文本变化
watch(inputText, (newValue) => {
  emit('update:text', newValue)
})
</script>

<style lang="scss" scoped>
.dcj-edit-row {
  @include flex-start;
  height: $component-height-large;
  padding: 0 $spacing-sm;
  gap: $spacing-sm;
  position: relative;
  background: rgba(187, 255, 224, 0.02);
  border-bottom: 1px solid rgba(187, 255, 224, 0.1);
  
  &--a {
    // 编辑行A特殊样式
  }
  
  &--b {
    // 编辑行B特殊样式
    margin-top: 1px;
  }
  
  &--disabled {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(128, 128, 128, 0.3);
      pointer-events: none;
      z-index: 5;
    }
    
    .dcj-button,
    .dcj-edit-row__text-input,
    .dcj-tag-button {
      pointer-events: none;
    }
  }
  
  &__clock {
    flex-shrink: 0;
  }
  
  &__prefix {
    flex-shrink: 0;
  }
  
  &__business-type {
    flex-shrink: 0;
  }
  
  &__tag-primary {
    flex-shrink: 0;
  }
  
  &__tag-secondary {
    flex-shrink: 0;
    
    &--hidden {
      display: none;
    }
  }
  
  &__text-input {
    flex: 1;
    min-width: 0;
    height: $component-height-standard;
    padding: 0 $spacing-sm;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $border-radius-sm;
    outline: none;
    color: $color-text-primary;
    font-size: $font-size-md;
    font-family: $font-family-primary;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:focus {
      background: rgba(187, 255, 224, 0.1);
      border-color: $border-color-active;
    }
    
    &::placeholder {
      color: $color-text-muted;
    }
    
    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &__operation-button {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: $button-standard-width;
    height: $component-height-standard;
    z-index: 10;
    background: $color-component-primary;
    color: $color-bg-primary;
    
    &:hover:not(:disabled) {
      background: lighten($color-component-primary, 10%);
      transform: translateY(-50%) scale(1.05);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 编辑行间的装饰分隔线
.dcj-edit-row + .dcj-edit-row::before {
  content: '';
  position: absolute;
  top: -1px;
  left: $spacing-sm;
  right: $spacing-sm;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(187, 255, 224, 0.3) 50%,
    transparent 100%
  );
}
</style>
