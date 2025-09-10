<template>
  <div 
    :class="[
      'dcj-record-row',
      {
        'dcj-record-row--focus': isFocus,
        'dcj-record-row--new': isNew,
        'dcj-record-row--sticky': isSticky,
        'dcj-record-row--date': isDateRow,
        'dcj-record-row--unfinished-task': isUnfinishedTaskRow
      }
    ]"
  >
    <!-- 时间文本 -->
    <TimeText 
      :time="record.createdAt"
      :type="timeType"
      class="dcj-record-row__time"
    />
    
    <!-- 前缀文本 -->
    <PrefixText
      :text="record.prefixText"
      context="record"
      :is-focus="isFocus"
      :is-completed="record.task?.isCompleted"
      class="dcj-record-row__prefix"
    />
    
    <!-- 业务类型文本 -->
    <div 
      v-if="record.businessType"
      class="dcj-record-row__business-type"
    >
      {{ record.businessType }}
    </div>
    
    <!-- 一级标签 -->
    <div 
      v-if="record.primaryTag"
      class="dcj-record-row__tag-primary"
    >
      <component 
        :is="getPrimaryTagIcon(record.primaryTag)"
        size="small"
        :color="getPrimaryTagColor(record.primaryTag)"
      />
    </div>
    
    <!-- 二级标签 -->
    <div 
      v-if="record.secondaryTag"
      class="dcj-record-row__tag-secondary"
    >
      {{ record.secondaryTag }}
    </div>
    
    <!-- 运转文本 -->
    <div class="dcj-record-row__text selectable">
      {{ record.recordText }}
    </div>
    
    <!-- 焦点行操作按钮 -->
    <div v-if="isFocus" class="dcj-record-row__actions">
      <button 
        class="dcj-button dcj-button--small"
        @click="$emit('archive')"
        title="存档"
      >
        <IconArchive size="small" />
      </button>
      <button 
        class="dcj-button dcj-button--small"
        @click="$emit('terminate')"
        title="终止"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TaskRecord } from '@/types'
import TimeText from './TimeText.vue'
import PrefixText from './PrefixText.vue'
import { IconArchive } from '@/components/icons'
import { PRIMARY_TAG_ICONS } from '@/components/icons'

interface Props {
  record: TaskRecord & { task?: { isCompleted: boolean } }
  isFocus?: boolean
  isSticky?: boolean
  isDateRow?: boolean
  isUnfinishedTaskRow?: boolean
}

interface Emits {
  (e: 'archive'): void
  (e: 'terminate'): void
}

const props = withDefaults(defineProps<Props>(), {
  isFocus: false,
  isSticky: false,
  isDateRow: false,
  isUnfinishedTaskRow: false
})

const _emit = defineEmits<Emits>()

const isNew = ref(false)

// 计算时间类型
const timeType = computed(() => {
  if (props.isDateRow) return 'date'
  if (props.record.duration !== undefined) return 'duration'
  return 'timestamp'
})

// 获取一级标签图标组件
const getPrimaryTagIcon = (tagName: string) => {
  return PRIMARY_TAG_ICONS[tagName as keyof typeof PRIMARY_TAG_ICONS] || 'IconInfo'
}

// 获取一级标签颜色
const getPrimaryTagColor = (tagName: string): string => {
  // 可以根据标签名称返回不同颜色
  const colorMap: Record<string, string> = {
    '信息': '#dbdbdb',
    '机械': '#dbdbdb',
    '混沌': '#dbdbdb',
    '摸鱼': '#dbdbdb'
  }
  return colorMap[tagName] || '#dbdbdb'
}

// 组件挂载时触发新增动画
onMounted(() => {
  // 检查是否为新增的记录行
  const createdTime = new Date(props.record.createdAt).getTime()
  const now = Date.now()
  
  // 如果是5秒内创建的记录，显示新增动画
  if (now - createdTime < 5000) {
    isNew.value = true
    
    // 动画结束后移除新增状态
    setTimeout(() => {
      isNew.value = false
    }, 300)
  }
})
</script>

<style lang="scss" scoped>
.dcj-record-row {
  @include flex-start;
  height: $component-height-large;
  padding: 0 $spacing-sm;
  border-bottom: 1px solid rgba(187, 255, 224, 0.1);
  gap: $spacing-sm;
  position: relative;
  
  &--focus {
    background: rgba(187, 255, 224, 0.05);
    border-bottom-color: rgba(187, 255, 224, 0.3);
  }
  
  &--new {
    @include record-row-animation;
  }
  
  &--sticky {
    position: sticky;
    z-index: $z-index-sticky;
    background: $color-bg-primary;
    border-bottom: 2px solid $color-component-primary;
    
    &.dcj-record-row--date {
      top: 0; // 日期行固定在顶部
    }
    
    &.dcj-record-row--unfinished-task {
      top: $component-height-large; // 未完结任务行在日期行下方
    }
  }
  
  &--date {
    font-weight: $font-weight-bold;
    background: rgba(187, 255, 224, 0.08);
  }
  
  &--unfinished-task {
    background: rgba(255, 165, 0, 0.05);
  }
  
  &__time {
    width: $clock-width;
    flex-shrink: 0;
  }
  
  &__prefix {
    flex-shrink: 0;
  }
  
  &__business-type {
    width: 50px;
    flex-shrink: 0;
    text-align: center;
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }
  
  &__tag-primary {
    width: $tag-primary-width;
    height: $tag-primary-height;
    flex-shrink: 0;
    @include flex-center;
  }
  
  &__tag-secondary {
    width: $tag-secondary-width;
    height: $tag-secondary-height;
    flex-shrink: 0;
    @include flex-center;
    background: $color-component-tertiary;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
  
  &__text {
    flex: 1;
    min-width: 0;
    height: $component-height-standard;
    line-height: $component-height-standard;
    @include text-ellipsis;
    font-size: $font-size-md;
    color: $color-text-primary;
    cursor: text;
  }
  
  &__actions {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: $spacing-xs;
    z-index: 10;
    
    .dcj-button {
      width: $button-standard-width;
      height: $component-height-standard;
      font-size: $font-size-sm;
      
      &:first-child {
        background: rgba(0, 149, 255, 0.8);
        
        &:hover {
          background: rgba(0, 149, 255, 1);
        }
      }
      
      &:last-child {
        background: rgba(255, 0, 0, 0.8);
        color: white;
        font-weight: $font-weight-bold;
        
        &:hover {
          background: rgba(255, 0, 0, 1);
        }
      }
    }
  }
}

// 新增记录行的火花特效动画
@keyframes spark-effect {
  0% {
    opacity: 0.8;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

// 记录行弹出动画
@keyframes record-row-pop {
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
</style>
