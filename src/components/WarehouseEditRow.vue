<template>
  <div class="dcj-warehouse-edit-row">
    <!-- 一级标签按钮 -->
    <TagButton
      type="primary"
      :selected-value="primaryTag"
      :options="primaryTagOptions"
      @select="$emit('update:primaryTag', $event)"
      class="dcj-warehouse-edit-row__primary-tag"
    />
    
    <!-- 二级标签按钮 -->
    <TagButton
      v-show="showSecondaryTag"
      type="secondary"
      :selected-value="secondaryTag"
      :options="filteredSecondaryTagOptions"
      :disabled="!enableSecondaryTag"
      @select="$emit('update:secondaryTag', $event)"
      @add-custom="$emit('add-custom-secondary-tag', $event)"
      @delete-option="$emit('delete-secondary-tag', $event)"
      class="dcj-warehouse-edit-row__secondary-tag"
    />
    
    <!-- 文本编辑框 -->
    <input
      v-model="inputText"
      type="text"
      class="dcj-warehouse-edit-row__text-input"
      placeholder="输入仓库任务..."
      @input="$emit('update:text', inputText)"
      @keyup.enter="handleOperation"
      @keyup.ctrl.enter="handleSave"
    />
    
    <!-- 入库按钮 -->
    <button
      class="dcj-warehouse-edit-row__save-button dcj-button dcj-button--small"
      :disabled="!canSave"
      @click="handleSave"
      title="入库 (Ctrl+Enter)"
    >
      <IconSave size="small" />
    </button>
    
    <!-- 运转按钮 -->
    <button
      class="dcj-warehouse-edit-row__operation-button dcj-button dcj-button--small"
      :disabled="!canOperate"
      @click="handleOperation"
      title="运转 (Enter)"
    >
      <IconOperation size="small" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DropdownOption } from '@/types'
import TagButton from './TagButton.vue'
import { IconSave, IconOperation } from '@/components/icons'

interface Props {
  text: string
  primaryTag: string
  secondaryTag: string
  primaryTagOptions: DropdownOption[]
  secondaryTagOptions: DropdownOption[]
}

interface Emits {
  (e: 'update:text', value: string): void
  (e: 'update:primaryTag', value: string): void
  (e: 'update:secondaryTag', value: string): void
  (e: 'add-custom-secondary-tag', value: string): void
  (e: 'delete-secondary-tag', optionId: string): void
  (e: 'save'): void
  (e: 'operation'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputText = ref(props.text)

// 是否显示二级标签
const showSecondaryTag = computed(() => {
  return props.primaryTag === '信息'
})

// 二级标签是否启用
const enableSecondaryTag = computed(() => {
  if (!showSecondaryTag.value) return false
  
  // 禁用'重启'、'创造'类的二级标签选项
  const disabledTypes = ['重启', '创造']
  return !disabledTypes.includes(props.secondaryTag)
})

// 过滤后的二级标签选项
const filteredSecondaryTagOptions = computed(() => {
  return props.secondaryTagOptions.filter(option => {
    const disabledTypes = ['重启', '创造']
    return !disabledTypes.includes(option.value)
  })
})

// 是否可以保存
const canSave = computed(() => {
  return inputText.value.trim().length > 0 && props.primaryTag.length > 0
})

// 是否可以执行运转操作
const canOperate = computed(() => {
  return inputText.value.trim().length > 0 && props.primaryTag.length > 0
})

// 处理保存操作
const handleSave = () => {
  if (canSave.value) {
    emit('save')
  }
}

// 处理运转操作
const handleOperation = () => {
  if (canOperate.value) {
    emit('operation')
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
.dcj-warehouse-edit-row {
  @include flex-start;
  height: 50px;
  padding: 0 $spacing-md;
  gap: $spacing-sm;
  background: rgba(16, 111, 152, 0.3);
  border-bottom: 1px solid $border-color;
  
  &__primary-tag {
    flex-shrink: 0;
  }
  
  &__secondary-tag {
    flex-shrink: 0;
    transition: all $duration-fast $ease-in-out-smooth;
  }
  
  &__text-input {
    flex: 1;
    min-width: 0;
    height: $component-height-standard;
    padding: 0 $spacing-sm;
    background: rgba(8, 79, 108, 0.5);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    outline: none;
    color: $color-text-primary;
    font-size: $font-size-md;
    font-family: $font-family-primary;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:focus {
      background: rgba(8, 79, 108, 0.8);
      border-color: $color-component-primary;
      box-shadow: 0 0 0 2px rgba(187, 255, 224, 0.2);
    }
    
    &::placeholder {
      color: $color-text-muted;
    }
  }
  
  &__save-button {
    flex-shrink: 0;
    background: rgba(0, 149, 255, 0.8);
    
    &:hover:not(:disabled) {
      background: rgba(0, 149, 255, 1);
      transform: scale(1.05);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &__operation-button {
    flex-shrink: 0;
    background: $color-component-primary;
    color: $color-bg-primary;
    
    &:hover:not(:disabled) {
      background: lighten($color-component-primary, 10%);
      transform: scale(1.05);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 仓库编辑行的特殊动画效果
.dcj-warehouse-edit-row {
  &:focus-within {
    background: rgba(16, 111, 152, 0.5);
    border-bottom-color: $color-component-primary;
  }
}
</style>

