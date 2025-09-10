// DCJ 任务管理系统 - 图标组件索引

export { default as IconBase } from './IconBase.vue'
export { default as IconInfo } from './IconInfo.vue'
export { default as IconMechanical } from './IconMechanical.vue'
export { default as IconChaos } from './IconChaos.vue'
export { default as IconFish } from './IconFish.vue'
export { default as IconExpand } from './IconExpand.vue'
export { default as IconCollapse } from './IconCollapse.vue'
export { default as IconSave } from './IconSave.vue'
export { default as IconOperation } from './IconOperation.vue'
export { default as IconDragHandle } from './IconDragHandle.vue'
export { default as IconChevronDown } from './IconChevronDown.vue'
export { default as IconChevronRight } from './IconChevronRight.vue'
export { default as IconComplete } from './IconComplete.vue'
export { default as IconDelete } from './IconDelete.vue'
export { default as IconArchive } from './IconArchive.vue'

// 一级标签图标映射
export const PRIMARY_TAG_ICONS = {
  '信息': 'IconInfo',
  '机械': 'IconMechanical', 
  '混沌': 'IconChaos',
  '摸鱼': 'IconFish'
} as const

// 功能按钮图标映射
export const FUNCTION_ICONS = {
  expand: 'IconExpand',
  collapse: 'IconCollapse',
  save: 'IconSave',
  operation: 'IconOperation',
  dragHandle: 'IconDragHandle',
  chevronDown: 'IconChevronDown',
  chevronRight: 'IconChevronRight',
  complete: 'IconComplete',
  delete: 'IconDelete',
  archive: 'IconArchive'
} as const

export type PrimaryTagIconType = keyof typeof PRIMARY_TAG_ICONS
export type FunctionIconType = keyof typeof FUNCTION_ICONS
