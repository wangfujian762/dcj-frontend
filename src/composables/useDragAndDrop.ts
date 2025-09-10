// 拖拽功能的组合式API

import { ref, computed } from 'vue'

interface DragItem {
  id: string
  type: string
  data: any
}

interface DropTarget {
  id: string
  element: HTMLElement
  accepts: string[]
  onDrop: (item: DragItem, target: DropTarget) => void
}

export function useDragAndDrop() {
  const isDragging = ref(false)
  const dragItem = ref<DragItem | null>(null)
  const dragElement = ref<HTMLElement | null>(null)
  const dropTargets = ref<Map<string, DropTarget>>(new Map())
  const currentDropTarget = ref<DropTarget | null>(null)

  // 开始拖拽
  const startDrag = (
    item: DragItem,
    element: HTMLElement,
    event: DragEvent
  ) => {
    isDragging.value = true
    dragItem.value = item
    dragElement.value = element
    
    // 设置拖拽数据
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/json', JSON.stringify(item))
      
      // 创建拖拽预览
      const dragImage = element.cloneNode(true) as HTMLElement
      dragImage.style.transform = 'rotate(5deg)'
      dragImage.style.opacity = '0.8'
      event.dataTransfer.setDragImage(dragImage, 0, 0)
    }
    
    // 添加拖拽样式
    element.classList.add('dcj-dragging')
    document.body.classList.add('dcj-drag-active')
  }

  // 结束拖拽
  const endDrag = () => {
    if (dragElement.value) {
      dragElement.value.classList.remove('dcj-dragging')
    }
    
    document.body.classList.remove('dcj-drag-active')
    
    isDragging.value = false
    dragItem.value = null
    dragElement.value = null
    currentDropTarget.value = null
  }

  // 注册拖放目标
  const registerDropTarget = (target: DropTarget) => {
    dropTargets.value.set(target.id, target)
    
    // 添加事件监听器
    target.element.addEventListener('dragenter', handleDragEnter)
    target.element.addEventListener('dragover', handleDragOver)
    target.element.addEventListener('dragleave', handleDragLeave)
    target.element.addEventListener('drop', handleDrop)
  }

  // 注销拖放目标
  const unregisterDropTarget = (targetId: string) => {
    const target = dropTargets.value.get(targetId)
    if (target) {
      target.element.removeEventListener('dragenter', handleDragEnter)
      target.element.removeEventListener('dragover', handleDragOver)
      target.element.removeEventListener('dragleave', handleDragLeave)
      target.element.removeEventListener('drop', handleDrop)
      dropTargets.value.delete(targetId)
    }
  }

  // 处理拖拽进入
  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    
    const targetElement = event.currentTarget as HTMLElement
    const target = findTargetByElement(targetElement)
    
    if (target && canAcceptDrop(target)) {
      currentDropTarget.value = target
      targetElement.classList.add('dcj-drop-target')
    }
  }

  // 处理拖拽悬停
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    
    const target = currentDropTarget.value
    if (target && canAcceptDrop(target)) {
      event.dataTransfer!.dropEffect = 'move'
    } else {
      event.dataTransfer!.dropEffect = 'none'
    }
  }

  // 处理拖拽离开
  const handleDragLeave = (event: DragEvent) => {
    const targetElement = event.currentTarget as HTMLElement
    
    // 检查是否真的离开了目标区域
    const rect = targetElement.getBoundingClientRect()
    const { clientX, clientY } = event
    
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      targetElement.classList.remove('dcj-drop-target')
      currentDropTarget.value = null
    }
  }

  // 处理拖放
  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    
    const targetElement = event.currentTarget as HTMLElement
    const target = findTargetByElement(targetElement)
    
    targetElement.classList.remove('dcj-drop-target')
    
    if (target && dragItem.value && canAcceptDrop(target)) {
      target.onDrop(dragItem.value, target)
    }
    
    endDrag()
  }

  // 根据元素查找目标
  const findTargetByElement = (element: HTMLElement): DropTarget | null => {
    for (const target of dropTargets.value.values()) {
      if (target.element === element) {
        return target
      }
    }
    return null
  }

  // 检查是否可以接受拖放
  const canAcceptDrop = (target: DropTarget): boolean => {
    if (!dragItem.value) return false
    return target.accepts.includes(dragItem.value.type)
  }

  // 获取拖拽预览位置
  const getDragPreviewPosition = (event: DragEvent) => {
    return {
      x: event.clientX,
      y: event.clientY
    }
  }

  return {
    isDragging,
    dragItem,
    currentDropTarget,
    startDrag,
    endDrag,
    registerDropTarget,
    unregisterDropTarget,
    getDragPreviewPosition
  }
}

// 拖拽排序功能
export function useDragSort<T extends { id: string }>(
  items: Ref<T[]>,
  onReorder: (newItems: T[]) => void
) {
  const draggedIndex = ref<number | null>(null)
  const dragOverIndex = ref<number | null>(null)

  const startSort = (index: number, event: DragEvent) => {
    draggedIndex.value = index
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(index))
    }
  }

  const handleSortDragOver = (index: number, event: DragEvent) => {
    event.preventDefault()
    dragOverIndex.value = index
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const handleSortDrop = (dropIndex: number, event: DragEvent) => {
    event.preventDefault()
    
    if (draggedIndex.value === null) return
    
    const newItems = [...items.value]
    const draggedItem = newItems[draggedIndex.value]
    
    // 移除拖拽项
    newItems.splice(draggedIndex.value, 1)
    
    // 插入到新位置
    const insertIndex = dropIndex > draggedIndex.value ? dropIndex - 1 : dropIndex
    newItems.splice(insertIndex, 0, draggedItem)
    
    // 触发重排序回调
    onReorder(newItems)
    
    // 重置状态
    draggedIndex.value = null
    dragOverIndex.value = null
  }

  const endSort = () => {
    draggedIndex.value = null
    dragOverIndex.value = null
  }

  return {
    draggedIndex,
    dragOverIndex,
    startSort,
    handleSortDragOver,
    handleSortDrop,
    endSort
  }
}

