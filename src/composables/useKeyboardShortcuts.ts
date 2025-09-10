// 键盘快捷键功能组合式API

import { onMounted, onUnmounted } from 'vue'

interface ShortcutAction {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  description: string
  action: () => void
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutAction[]) {
  const handleKeyDown = (event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.action()
        break
      }
    }
  }

  const matchesShortcut = (event: KeyboardEvent, shortcut: ShortcutAction): boolean => {
    // 检查主键
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
      return false
    }

    // 检查修饰键
    const modifiers = shortcut.modifiers || []
    
    const hasCtrl = modifiers.includes('ctrl')
    const hasAlt = modifiers.includes('alt')
    const hasShift = modifiers.includes('shift')
    const hasMeta = modifiers.includes('meta')

    return (
      event.ctrlKey === hasCtrl &&
      event.altKey === hasAlt &&
      event.shiftKey === hasShift &&
      event.metaKey === hasMeta
    )
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown
  }
}

// DCJ系统专用快捷键
export function useDCJShortcuts(callbacks: {
  // 运转操作
  operateEditRowA?: () => void
  operateEditRowB?: () => void
  
  // 仓库操作
  saveToWarehouse?: () => void
  operateWarehouse?: () => void
  
  // 焦点操作
  archiveFocusTask?: () => void
  terminateFocusTask?: () => void
  
  // 面板操作
  toggleWarehouse?: () => void
  
  // 导航操作
  scrollToTop?: () => void
  scrollToBottom?: () => void
  
  // 编辑操作
  focusEditRowA?: () => void
  focusEditRowB?: () => void
}) {
  const shortcuts: ShortcutAction[] = [
    // 运转操作快捷键
    {
      key: 'Enter',
      description: '执行编辑行A运转操作',
      action: () => callbacks.operateEditRowA?.()
    },
    {
      key: 'Enter',
      modifiers: ['shift'],
      description: '执行编辑行B运转操作',
      action: () => callbacks.operateEditRowB?.()
    },
    
    // 仓库操作快捷键
    {
      key: 'Enter',
      modifiers: ['ctrl'],
      description: '保存到仓库',
      action: () => callbacks.saveToWarehouse?.()
    },
    {
      key: 's',
      modifiers: ['ctrl'],
      description: '仓库运转操作',
      action: () => callbacks.operateWarehouse?.()
    },
    
    // 焦点任务操作快捷键
    {
      key: 'a',
      modifiers: ['ctrl'],
      description: '存档焦点任务',
      action: () => callbacks.archiveFocusTask?.()
    },
    {
      key: 't',
      modifiers: ['ctrl'],
      description: '终止焦点任务',
      action: () => callbacks.terminateFocusTask?.()
    },
    
    // 面板操作快捷键
    {
      key: 'w',
      modifiers: ['ctrl'],
      description: '切换仓库面板',
      action: () => callbacks.toggleWarehouse?.()
    },
    
    // 导航快捷键
    {
      key: 'Home',
      description: '滚动到顶部',
      action: () => callbacks.scrollToTop?.()
    },
    {
      key: 'End',
      description: '滚动到底部',
      action: () => callbacks.scrollToBottom?.()
    },
    
    // 编辑焦点快捷键
    {
      key: '1',
      modifiers: ['alt'],
      description: '焦点到编辑行A',
      action: () => callbacks.focusEditRowA?.()
    },
    {
      key: '2',
      modifiers: ['alt'],
      description: '焦点到编辑行B',
      action: () => callbacks.focusEditRowB?.()
    },
    
    // ESC取消操作
    {
      key: 'Escape',
      description: '取消当前操作',
      action: () => {
        // 关闭所有下拉框和模态框
        document.querySelectorAll('.dcj-dropdown, .dcj-modal-overlay').forEach(el => {
          (el as HTMLElement).style.display = 'none'
        })
      }
    }
  ]

  useKeyboardShortcuts(shortcuts)

  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      modifiers: s.modifiers || [],
      description: s.description
    }))
  }
}

// 快捷键帮助组件数据
export function getShortcutHelp() {
  return [
    {
      category: '运转操作',
      shortcuts: [
        { keys: ['Enter'], description: '编辑行A运转' },
        { keys: ['Shift', 'Enter'], description: '编辑行B运转' }
      ]
    },
    {
      category: '仓库操作',
      shortcuts: [
        { keys: ['Ctrl', 'Enter'], description: '保存到仓库' },
        { keys: ['Ctrl', 'S'], description: '仓库运转操作' }
      ]
    },
    {
      category: '焦点任务',
      shortcuts: [
        { keys: ['Ctrl', 'A'], description: '存档焦点任务' },
        { keys: ['Ctrl', 'T'], description: '终止焦点任务' }
      ]
    },
    {
      category: '界面控制',
      shortcuts: [
        { keys: ['Ctrl', 'W'], description: '切换仓库面板' },
        { keys: ['Home'], description: '滚动到顶部' },
        { keys: ['End'], description: '滚动到底部' },
        { keys: ['Alt', '1'], description: '焦点编辑行A' },
        { keys: ['Alt', '2'], description: '焦点编辑行B' },
        { keys: ['Esc'], description: '取消操作' }
      ]
    }
  ]
}

