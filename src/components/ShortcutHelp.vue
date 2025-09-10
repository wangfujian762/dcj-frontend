<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="dcj-shortcut-help-overlay"
      @click="$emit('close')"
    >
      <div class="dcj-shortcut-help-modal" @click.stop>
        <div class="dcj-shortcut-help-header">
          <h3>键盘快捷键</h3>
          <button class="dcj-modal-close" @click="$emit('close')">×</button>
        </div>
        
        <div class="dcj-shortcut-help-content">
          <div 
            v-for="category in shortcutCategories"
            :key="category.category"
            class="dcj-shortcut-category"
          >
            <h4 class="dcj-shortcut-category-title">{{ category.category }}</h4>
            <div class="dcj-shortcut-list">
              <div
                v-for="shortcut in category.shortcuts"
                :key="shortcut.description"
                class="dcj-shortcut-item"
              >
                <div class="dcj-shortcut-keys">
                  <kbd
                    v-for="key in shortcut.keys"
                    :key="key"
                    class="dcj-key"
                  >
                    {{ key }}
                  </kbd>
                </div>
                <div class="dcj-shortcut-description">
                  {{ shortcut.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dcj-shortcut-help-footer">
          <p>按 <kbd class="dcj-key">F1</kbd> 或 <kbd class="dcj-key">?</kbd> 随时查看快捷键帮助</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { getShortcutHelp } from '@/composables/useKeyboardShortcuts'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const shortcutCategories = getShortcutHelp()
</script>

<style lang="scss" scoped>
.dcj-shortcut-help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  @include flex-center;
  z-index: $z-index-modal;
  backdrop-filter: blur(4px);
}

.dcj-shortcut-help-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: $color-bg-secondary;
  border: 1px solid $border-color-active;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-lg;
  display: flex;
  flex-direction: column;
  animation: modal-appear $duration-normal $ease-in-out-smooth;
}

.dcj-shortcut-help-header {
  @include flex-between;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
  
  h3 {
    font-size: $font-size-lg;
    color: $color-component-primary;
    margin: 0;
  }
  
  .dcj-modal-close {
    width: 32px;
    height: 32px;
    @include flex-center;
    background: none;
    border: none;
    color: $color-text-secondary;
    font-size: 20px;
    cursor: pointer;
    border-radius: 50%;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.dcj-shortcut-help-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.dcj-shortcut-category {
  &-title {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-component-primary;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-xs;
    border-bottom: 1px solid $border-color;
  }
}

.dcj-shortcut-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.dcj-shortcut-item {
  @include flex-between;
  padding: $spacing-sm;
  background: rgba(16, 111, 152, 0.3);
  border-radius: $border-radius-sm;
  
  &:hover {
    background: rgba(16, 111, 152, 0.5);
  }
}

.dcj-shortcut-keys {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
}

.dcj-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 $spacing-xs;
  background: $color-component-tertiary;
  color: $color-bg-primary;
  border: 1px solid $color-component-primary;
  border-radius: $border-radius-sm;
  font-family: $font-family-mono;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dcj-shortcut-description {
  color: $color-text-primary;
  font-size: $font-size-sm;
}

.dcj-shortcut-help-footer {
  padding: $spacing-md $spacing-lg;
  border-top: 1px solid $border-color;
  text-align: center;
  
  p {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-text-muted;
  }
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>

