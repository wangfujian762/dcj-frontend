<template>
  <div 
    :class="[
      'dcj-tag-button',
      `dcj-tag-button--${type}`,
      { 
        'dcj-tag-button--clickable': clickable,
        'dcj-tag-button--hidden': hidden,
        'dcj-tag-button--disabled': disabled
      }
    ]"
    @click="handleClick"
  >
    <!-- 一级标签显示图标 -->
    <component 
      v-if="type === 'primary' && iconComponent" 
      :is="iconComponent"
      :size="iconSize"
      :color="iconColor"
    />
    
    <!-- 二级标签显示文本 -->
    <span v-if="type === 'secondary'" class="dcj-tag-button__text">
      {{ displayText }}
    </span>
    
    <!-- 业务类型显示文本 -->
    <span v-if="type === 'business'" class="dcj-tag-button__text">
      {{ displayText }}
    </span>
  </div>
  
  <!-- 下拉选择框 -->
  <Teleport to="body">
    <div 
      v-if="showDropdown" 
      :class="['dcj-tag-dropdown', `dcj-tag-dropdown--${type}`]"
      :style="dropdownStyle"
    >
      <div 
        v-for="option in options" 
        :key="option.id"
        :class="[
          'dcj-tag-dropdown__option',
          { 
            'dcj-tag-dropdown__option--selected': option.value === selectedValue,
            'dcj-tag-dropdown__option--disabled': option.disabled
          }
        ]"
        @click="selectOption(option)"
      >
        <component 
          v-if="type === 'primary' && option.icon" 
          :is="getIconComponent(option.icon)"
          size="small"
        />
        <span class="dcj-tag-dropdown__option-text">{{ option.label }}</span>
        
        <!-- 删除自定义选项按钮 -->
        <button
          v-if="!option.disabled && option.customizable"
          class="dcj-tag-dropdown__delete"
          @click.stop="deleteOption(option)"
        >
          ×
        </button>
      </div>
      
      <!-- 自定义选项输入框 -->
      <div v-if="type === 'secondary'" class="dcj-tag-dropdown__custom">
        <input
          v-model="customInput"
          class="dcj-tag-dropdown__custom-input"
          :placeholder="customPlaceholder"
          maxlength="2"
          @keyup.enter="addCustomOption"
        />
        <button
          class="dcj-tag-dropdown__custom-add"
          :disabled="!isValidCustomInput"
          @click="addCustomOption"
        >
          添加
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import type { DropdownOption } from '@/types'
import { PRIMARY_TAG_ICONS } from '@/components/icons'

interface Props {
  type: 'primary' | 'secondary' | 'business'
  selectedValue?: string
  options: DropdownOption[]
  clickable?: boolean
  hidden?: boolean
  disabled?: boolean
  placeholder?: string
}

interface Emits {
  (e: 'select', value: string): void
  (e: 'add-custom', value: string): void
  (e: 'delete-option', optionId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  hidden: false,
  disabled: false,
  placeholder: '请选择'
})

const emit = defineEmits<Emits>()

const showDropdown = ref(false)
const customInput = ref('')
const dropdownPosition = ref({ top: 0, left: 0 })

// 计算显示文本
const displayText = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.selectedValue)
  return selectedOption?.label || props.placeholder
})

// 获取图标组件
const iconComponent = computed(() => {
  if (props.type !== 'primary') return null
  const selectedOption = props.options.find(opt => opt.value === props.selectedValue)
  return selectedOption?.icon ? getIconComponent(selectedOption.icon) : null
})

const iconSize = computed(() => {
  return props.type === 'primary' ? 'medium' : 'small'
})

const iconColor = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.selectedValue)
  return selectedOption?.color || '#dbdbdb'
})

// 下拉框样式
const dropdownStyle = computed(() => ({
  top: `${dropdownPosition.value.top}px`,
  left: `${dropdownPosition.value.left}px`
}))

// 自定义输入提示
const customPlaceholder = computed(() => {
  return props.type === 'secondary' ? '2个汉字' : '输入名称'
})

// 验证自定义输入
const isValidCustomInput = computed(() => {
  if (props.type === 'secondary') {
    // 二级标签：必须是2个中文汉字，不能包含标点符号
    return /^[\u4e00-\u9fa5]{2}$/.test(customInput.value)
  }
  return customInput.value.length > 0
})

// 获取图标组件
const getIconComponent = (iconName: string) => {
  return PRIMARY_TAG_ICONS[iconName as keyof typeof PRIMARY_TAG_ICONS] || 'IconInfo'
}

// 处理点击
const handleClick = async (event: MouseEvent) => {
  if (!props.clickable || props.disabled) return
  
  // 计算下拉框位置
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  dropdownPosition.value = {
    top: rect.bottom + 4,
    left: rect.left
  }
  
  showDropdown.value = !showDropdown.value
  
  if (showDropdown.value) {
    // 添加全局点击事件监听器
    await nextTick()
    document.addEventListener('click', handleOutsideClick)
  }
}

// 处理外部点击
const handleOutsideClick = (event: MouseEvent) => {
  const dropdown = document.querySelector('.dcj-tag-dropdown')
  if (dropdown && !dropdown.contains(event.target as Node)) {
    showDropdown.value = false
    document.removeEventListener('click', handleOutsideClick)
  }
}

// 选择选项
const selectOption = (option: DropdownOption) => {
  if (option.disabled) return
  
  emit('select', option.value)
  showDropdown.value = false
  document.removeEventListener('click', handleOutsideClick)
}

// 添加自定义选项
const addCustomOption = () => {
  if (!isValidCustomInput.value) return
  
  emit('add-custom', customInput.value)
  customInput.value = ''
  showDropdown.value = false
  document.removeEventListener('click', handleOutsideClick)
}

// 删除选项
const deleteOption = (option: DropdownOption) => {
  emit('delete-option', option.id)
}

// 组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style lang="scss" scoped>
.dcj-tag-button {
  @include flex-center;
  @include button-base;
  position: relative;
  transition: all $duration-fast $ease-in-out-smooth;
  
  &--primary {
    width: $tag-primary-width;
    height: $tag-primary-height;
  }
  
  &--secondary {
    width: $tag-secondary-width;
    height: $tag-secondary-height;
  }
  
  &--business {
    width: 50px;
    height: $component-height-standard;
  }
  
  &--hidden {
    display: none;
  }
  
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(128, 128, 128, 0.3);
      pointer-events: none;
    }
  }
  
  &__text {
    @include text-ellipsis;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
}

.dcj-tag-dropdown {
  @include component-base;
  position: fixed;
  z-index: $z-index-dropdown;
  box-shadow: $box-shadow-lg;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid $border-color-active;
  
  &--primary {
    width: 120px;
  }
  
  &--secondary {
    width: 210px;
  }
  
  &--business {
    width: 150px;
  }
  
  &__option {
    @include flex-start;
    height: $component-height-standard;
    padding: 0 $spacing-sm;
    cursor: pointer;
    transition: background $duration-fast $ease-in-out-smooth;
    gap: $spacing-xs;
    
    &:hover:not(&--disabled) {
      background: $color-component-secondary;
    }
    
    &--selected {
      background: $color-component-tertiary;
    }
    
    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &-text {
      flex: 1;
      @include text-ellipsis;
      font-size: $font-size-sm;
    }
  }
  
  &__delete {
    width: 16px;
    height: 16px;
    @include flex-center;
    background: $color-error;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    
    &:hover {
      background: darken($color-error, 10%);
    }
  }
  
  &__custom {
    @include flex-start;
    padding: $spacing-sm;
    border-top: 1px solid $border-color;
    gap: $spacing-xs;
    
    &-input {
      flex: 1;
      height: 24px;
      padding: 0 $spacing-xs;
      background: $color-bg-tertiary;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      color: $color-text-primary;
      font-size: $font-size-sm;
      outline: none;
      
      &:focus {
        border-color: $border-color-active;
      }
      
      &::placeholder {
        color: $color-text-muted;
      }
    }
    
    &-add {
      height: 24px;
      padding: 0 $spacing-xs;
      background: $color-success;
      color: white;
      border: none;
      border-radius: $border-radius-sm;
      cursor: pointer;
      font-size: $font-size-sm;
      
      &:hover:not(:disabled) {
        background: darken($color-success, 10%);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
