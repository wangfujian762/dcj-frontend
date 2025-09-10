<template>
  <div class="dcj-main-page">
    <!-- 键盘快捷键帮助 -->
    <ShortcutHelp 
      :visible="showShortcutHelp"
      @close="showShortcutHelp = false"
    />
    
    <!-- 仓库面板 -->
    <div 
      :class="[
        'dcj-warehouse-panel',
        { 'dcj-warehouse-panel--collapsed': !warehouseExpanded }
      ]"
    >
      <!-- 仓库面板头部 -->
      <div class="dcj-warehouse-header">
        <!-- 展开/收起按钮 -->
        <button 
          class="dcj-warehouse-toggle dcj-button dcj-button--small"
          @click="toggleWarehouse"
        >
          <span class="dcj-toggle-icon">
            {{ warehouseExpanded ? '◀◀' : '▶▶' }}
          </span>
        </button>
        
        <!-- 仓库面板标题 -->
        <div v-if="warehouseExpanded" class="dcj-warehouse-title">
          任务仓库 ({{ warehouseTasks.length }})
        </div>
        
        <!-- 存档信息 -->
        <div class="dcj-archive-info">
          <button class="dcj-archive-button" @click="showArchiveSelector = true">
            📁 {{ currentArchive }}
          </button>
        </div>
      </div>
      
      <!-- 仓库面板内容 -->
      <Transition name="warehouse-content">
        <div v-if="warehouseExpanded" class="dcj-warehouse-content">
          <!-- 仓库编辑行 -->
          <div class="dcj-warehouse-edit-section">
            <div class="dcj-warehouse-edit-row">
              <!-- 一级标签选择 -->
              <div class="dcj-tag-selector">
                <button 
                  class="dcj-tag-button dcj-tag-button--primary"
                  @click="showPrimaryTagDropdown = !showPrimaryTagDropdown"
                >
                  <span class="dcj-tag-icon">{{ getPrimaryTagIcon(warehouseEdit.primaryTag) }}</span>
                </button>
                
                <!-- 一级标签下拉框 -->
                <div v-if="showPrimaryTagDropdown" class="dcj-tag-dropdown">
                  <div
                    v-for="tag in primaryTagOptions"
                    :key="tag.value"
                    class="dcj-tag-option"
                    @click="selectPrimaryTag(tag.value)"
                  >
                    <span class="dcj-tag-icon">{{ getPrimaryTagIcon(tag.value) }}</span>
                    <span>{{ tag.label }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 二级标签选择（仅当一级标签为'信息'时显示） -->
              <div 
                v-show="warehouseEdit.primaryTag === '信息'"
                class="dcj-tag-selector"
              >
                <button 
                  class="dcj-tag-button dcj-tag-button--secondary"
                  @click="showSecondaryTagDropdown = !showSecondaryTagDropdown"
                >
                  {{ warehouseEdit.secondaryTag || '二级' }}
                </button>
                
                <!-- 二级标签下拉框 -->
                <div v-if="showSecondaryTagDropdown" class="dcj-tag-dropdown dcj-tag-dropdown--secondary">
                  <!-- 系统预设选项 -->
                  <div
                    v-for="tag in systemSecondaryTags"
                    :key="tag.value"
                    class="dcj-tag-option"
                    @click="selectSecondaryTag(tag.value)"
                  >
                    <span>{{ tag.label }}</span>
                    <span class="dcj-tag-system-mark">系统</span>
                  </div>
                  
                  <!-- 用户自定义选项 -->
                  <div
                    v-for="tag in customSecondaryTags"
                    :key="tag.value"
                    class="dcj-tag-option dcj-tag-option--custom"
                    @click="selectSecondaryTag(tag.value)"
                  >
                    <span>{{ tag.label }}</span>
                    <button 
                      class="dcj-delete-tag"
                      @click.stop="deleteCustomTag(tag.id)"
                    >
                      ×
                    </button>
                  </div>
                  
                  <!-- 自定义输入框 -->
                  <div class="dcj-custom-tag-input">
                    <input
                      v-model="customTagInput"
                      class="dcj-custom-input"
                      placeholder="2个汉字"
                      maxlength="2"
                      @keyup.enter="addCustomTag"
                    />
                    <button 
                      class="dcj-add-tag"
                      :disabled="!isValidCustomTag"
                      @click="addCustomTag"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 文本输入框 -->
              <input
                ref="warehouseInputRef"
                v-model="warehouseEdit.text"
                class="dcj-warehouse-text-input"
                placeholder="输入仓库任务..."
                @keyup.enter="handleWarehouseOperation"
                @keyup.ctrl.enter="handleWarehouseSave"
              />
              
              <!-- 操作按钮 -->
              <button 
                class="dcj-button dcj-button--save"
                :disabled="!canSave"
                @click="handleWarehouseSave"
                title="入库 (Ctrl+Enter)"
              >
                💾
              </button>
              
              <button 
                class="dcj-button dcj-button--operation"
                :disabled="!canOperate"
                @click="handleWarehouseOperation"
                title="运转 (Enter)"
              >
                🔄
              </button>
            </div>
          </div>
          
          <!-- 仓库存储区 -->
          <div class="dcj-warehouse-storage">
            <div class="dcj-storage-header">
              <span>存储任务 ({{ visibleWarehouseTasks.length }})</span>
              <div class="dcj-storage-controls">
                <button class="dcj-button dcj-button--small" @click="expandAllTasks">全部展开</button>
                <button class="dcj-button dcj-button--small" @click="collapseAllTasks">全部收起</button>
              </div>
            </div>
            
            <div 
              ref="storageAreaRef"
              class="dcj-storage-area"
              @drop="handleTaskDrop"
              @dragover.prevent
            >
              <TransitionGroup name="storage-row" tag="div">
                <div
                  v-for="task in visibleWarehouseTasks"
                  :key="task.id"
                  :class="[
                    'dcj-storage-row',
                    { 
                      'dcj-storage-row--dragging': draggedTaskId === task.id,
                      'dcj-storage-row--drop-target': dropTargetId === task.id
                    }
                  ]"
                  :style="{ paddingLeft: `${task.depth * 39}px` }"
                  @dragstart="startTaskDrag(task, $event)"
                  @dragend="endTaskDrag"
                  @dragenter="handleTaskDragEnter(task, $event)"
                  @dragleave="handleTaskDragLeave"
                  draggable="true"
                >
                  <!-- 拖拽柄 -->
                  <div class="dcj-drag-handle">⋮⋮</div>
                  
                  <!-- 展开/收起按钮 -->
                  <button
                    v-if="hasChildTasks(task.id)"
                    class="dcj-expand-button"
                    @click="toggleTaskExpand(task.id)"
                  >
                    {{ expandedTasks.has(task.id) ? '▼' : '▶' }}
                  </button>
                  <div v-else class="dcj-expand-placeholder"></div>
                  
                  <!-- 标签显示 -->
                  <div class="dcj-task-tags">
                    <span class="dcj-tag-primary">{{ getPrimaryTagIcon(task.primaryTag) }}</span>
                    <span 
                      v-if="task.secondaryTag"
                      class="dcj-tag-secondary"
                    >
                      {{ task.secondaryTag }}
                    </span>
                  </div>
                  
                  <!-- 任务文本 -->
                  <input
                    v-model="task.taskText"
                    :class="[
                      'dcj-task-text-input',
                      `dcj-task-text-input--${task.displayStatus}`
                    ]"
                    @blur="updateTaskText(task)"
                    @keyup.enter="updateTaskText(task)"
                  />
                  
                  <!-- 操作按钮 -->
                  <div class="dcj-task-actions">
                    <button 
                      class="dcj-action-button dcj-action-button--extract"
                      @click="extractTask(task)"
                      title="提取"
                    >
                      ↗
                    </button>
                    <button 
                      class="dcj-action-button dcj-action-button--complete"
                      @click="completeTask(task)"
                      title="完工"
                    >
                      ✓
                    </button>
                    <button 
                      class="dcj-action-button dcj-action-button--delete"
                      @click="deleteTask(task)"
                      title="删除"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </TransitionGroup>
              
              <!-- 空状态 -->
              <div v-if="visibleWarehouseTasks.length === 0" class="dcj-empty-warehouse">
                <div class="dcj-empty-icon">📦</div>
                <div class="dcj-empty-text">仓库暂无任务</div>
                <div class="dcj-empty-hint">在上方输入任务内容并点击入库</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- 任务运转面板 -->
    <div class="dcj-operation-panel">
      <!-- 运转面板头部 -->
      <div class="dcj-operation-header">
        <div class="dcj-operation-decoration">
          <span class="dcj-operation-title">DCJ 任务运转面板</span>
          <div class="dcj-operation-stats">
            记录: {{ taskRecords.length }} | 焦点: {{ focusTask?.taskName || '无' }}
          </div>
        </div>
      </div>
      
      <!-- 运转面板内容 -->
      <StickyScroll
        :date-rows="dateRows"
        :unfinished-task-rows="unfinishedTaskRows"
        class="dcj-operation-content"
      >
        <!-- 记录行区域 -->
        <div class="dcj-records-area">
          <RecordRowAnimation
            v-for="record in taskRecords"
            :key="record.id"
            :trigger="record.isNew"
            :intensity="record.animationIntensity"
          >
            <div 
              :class="[
                'dcj-record-row',
                {
                  'dcj-record-row--focus': record.isFocus,
                  'dcj-record-row--date': record.isDateRow,
                  'dcj-record-row--unfinished': record.isUnfinishedTask
                }
              ]"
            >
              <!-- 时间文本 -->
              <div 
                :class="[
                  'dcj-time-text',
                  getTimeColorClass(record.duration)
                ]"
              >
                {{ formatTime(record.timeText, record.timeType) }}
              </div>
              
              <!-- 前缀文本 -->
              <div 
                :class="[
                  'dcj-prefix-text',
                  getPrefixColorClass(record.prefixText, record.isFocus, record.isCompleted)
                ]"
                :style="{ width: `${calculatePrefixWidth(record.prefixText)}px` }"
              >
                {{ record.prefixText }}
              </div>
              
              <!-- 业务类型 -->
              <div v-if="record.businessType" class="dcj-business-type">
                {{ record.businessType }}
              </div>
              
              <!-- 标签显示 -->
              <div v-if="record.primaryTag" class="dcj-tag-primary">
                {{ getPrimaryTagIcon(record.primaryTag) }}
              </div>
              
              <div v-if="record.secondaryTag" class="dcj-tag-secondary">
                {{ record.secondaryTag }}
              </div>
              
              <!-- 运转文本 -->
              <div class="dcj-record-text selectable">
                {{ record.recordText }}
              </div>
              
              <!-- 焦点行操作按钮 -->
              <div v-if="record.isFocus" class="dcj-record-actions">
                <button 
                  class="dcj-action-button dcj-action-button--archive"
                  @click="archiveFocusTask"
                >
                  📁
                </button>
                <button 
                  class="dcj-action-button dcj-action-button--terminate"
                  @click="terminateFocusTask"
                >
                  ❌
                </button>
              </div>
            </div>
          </RecordRowAnimation>
        </div>
        
        <!-- 记录行与编辑行分隔 -->
        <div class="dcj-separator"></div>
        
        <!-- 编辑行A -->
        <div class="dcj-edit-row dcj-edit-row--a">
          <div class="dcj-clock dcj-clock--realtime">{{ currentTime }}</div>
          <div 
            class="dcj-prefix-text"
            :class="getPrefixColorClass(editRowA.prefixText, false, false)"
          >
            {{ editRowA.prefixText }}
          </div>
          
          <button 
            class="dcj-business-button"
            @click="showBusinessTypeDropdown = !showBusinessTypeDropdown"
          >
            {{ editRowA.businessType || '类型' }}
          </button>
          
          <button 
            class="dcj-tag-button dcj-tag-button--primary"
            @click="showEditAPrimaryTag = !showEditAPrimaryTag"
          >
            {{ getPrimaryTagIcon(editRowA.primaryTag) }}
          </button>
          
          <button 
            v-show="editRowA.primaryTag === '信息'"
            class="dcj-tag-button dcj-tag-button--secondary"
            @click="showEditASecondaryTag = !showEditASecondaryTag"
          >
            {{ editRowA.secondaryTag || '二级' }}
          </button>
          
          <input
            ref="editRowAInputRef"
            v-model="editRowA.text"
            class="dcj-edit-input"
            :class="{ 'dcj-edit-input--disabled': editRowA.disabled }"
            :disabled="editRowA.disabled"
            placeholder="输入运转文本..."
            @keyup.enter="handleEditRowAOperation"
            @focus="handleEditRowFocus('a')"
            @blur="handleEditRowBlur('a')"
          />
          
          <button 
            class="dcj-operation-button"
            :disabled="!canOperateA"
            @click="handleEditRowAOperation"
          >
            🔄
          </button>
        </div>
        
        <!-- 编辑行B -->
        <div class="dcj-edit-row dcj-edit-row--b">
          <div 
            :class="[
              'dcj-clock',
              'dcj-clock--timer',
              { 'dcj-clock--focus': isFocusMode }
            ]"
          >
            {{ timerDisplay }}
          </div>
          
          <div 
            class="dcj-prefix-text"
            :class="getPrefixColorClass(editRowB.prefixText, false, false)"
          >
            {{ editRowB.prefixText }}
          </div>
          
          <button class="dcj-business-button">{{ editRowB.businessType || '类型' }}</button>
          <button class="dcj-tag-button dcj-tag-button--primary">{{ getPrimaryTagIcon(editRowB.primaryTag) }}</button>
          <button 
            v-show="editRowB.primaryTag === '信息'"
            class="dcj-tag-button dcj-tag-button--secondary"
          >
            {{ editRowB.secondaryTag || '二级' }}
          </button>
          
          <input
            ref="editRowBInputRef"
            v-model="editRowB.text"
            class="dcj-edit-input"
            :class="{ 'dcj-edit-input--disabled': editRowB.disabled }"
            :disabled="editRowB.disabled"
            placeholder="输入运转文本..."
            @keyup.enter="handleEditRowBOperation"
            @keyup.shift.enter="handleEditRowBOperation"
            @focus="handleEditRowFocus('b')"
            @blur="handleEditRowBlur('b')"
          />
          
          <button 
            class="dcj-operation-button"
            :disabled="!canOperateB"
            @click="handleEditRowBOperation"
          >
            🔄
          </button>
        </div>
        
        <!-- 特殊编辑行 -->
        <TransitionGroup name="special-row" tag="div" class="dcj-special-rows">
          <div
            v-for="specialRow in visibleSpecialRows"
            :key="specialRow.id"
            :class="[
              'dcj-special-edit-row',
              `dcj-special-edit-row--${specialRow.type}`
            ]"
          >
            <div 
              :class="[
                'dcj-clock',
                { 'dcj-clock--hidden': specialRow.type !== 'flow' || !specialRow.isSecondState }
              ]"
            >
              <span v-if="specialRow.type === 'flow' && specialRow.isSecondState" class="dcj-focus-timer">
                {{ timerDisplay }}
              </span>
            </div>
            
            <div class="dcj-prefix-text">{{ specialRow.prefixText }}</div>
            <div class="dcj-business-type">{{ getSpecialBusinessType(specialRow.type) }}</div>
            <div class="dcj-special-text">{{ getSpecialText(specialRow.type, specialRow.isSecondState) }}</div>
            
            <button 
              class="dcj-operation-button dcj-operation-button--special"
              @click="handleSpecialRowOperation(specialRow)"
            >
              🔄
            </button>
          </div>
        </TransitionGroup>
      </StickyScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDCJShortcuts } from '@/composables/useKeyboardShortcuts'
import { useDragAndDrop } from '@/composables/useDragAndDrop'
import ShortcutHelp from '@/components/ShortcutHelp.vue'
import StickyScroll from '@/components/animations/StickyScroll.vue'
import RecordRowAnimation from '@/components/animations/RecordRowAnimation.vue'

// 响应式数据
const warehouseExpanded = ref(true)
const showShortcutHelp = ref(false)
const showArchiveSelector = ref(false)
const showPrimaryTagDropdown = ref(false)
const showSecondaryTagDropdown = ref(false)
const showBusinessTypeDropdown = ref(false)
const showEditAPrimaryTag = ref(false)
const showEditASecondaryTag = ref(false)

// 表单数据
const warehouseEdit = ref({
  text: '',
  primaryTag: '',
  secondaryTag: '',
  businessType: ''
})

const editRowA = ref({
  text: '',
  prefixText: '编辑行A前缀',
  primaryTag: '',
  secondaryTag: '',
  businessType: '',
  disabled: false
})

const editRowB = ref({
  text: '',
  prefixText: '编辑行B前缀',
  primaryTag: '',
  secondaryTag: '',
  businessType: '',
  disabled: false
})

const customTagInput = ref('')
const currentTime = ref('')
const timerSeconds = ref(0)
const isFocusMode = ref(false)

// 引用
const warehouseInputRef = ref<HTMLInputElement>()
const editRowAInputRef = ref<HTMLInputElement>()
const editRowBInputRef = ref<HTMLInputElement>()
const storageAreaRef = ref<HTMLElement>()

// 拖拽状态
const draggedTaskId = ref<string | null>(null)
const dropTargetId = ref<string | null>(null)
const expandedTasks = ref<Set<string>>(new Set())

// 模拟数据
const currentArchive = ref('DEMO001')
const focusTask = ref<any>(null)

const warehouseTasks = ref([
  {
    id: '1',
    taskText: '示例仓库任务1 - 这是一个较长的任务描述用于测试文本显示效果',
    primaryTag: '信息',
    secondaryTag: '重要',
    depth: 0,
    displayStatus: 'normal',
    parentTaskId: null
  },
  {
    id: '2',
    taskText: '子任务示例',
    primaryTag: '机械',
    secondaryTag: '',
    depth: 1,
    displayStatus: 'highlighted',
    parentTaskId: '1'
  },
  {
    id: '3',
    taskText: '另一个任务',
    primaryTag: '混沌',
    secondaryTag: '',
    depth: 0,
    displayStatus: 'dimmed',
    parentTaskId: null
  }
])

const taskRecords = ref([
  {
    id: '1',
    timeText: '14:30:25',
    timeType: 'timestamp',
    prefixText: '前缀示例',
    businessType: '工作',
    primaryTag: '信息',
    secondaryTag: '重要',
    recordText: '这是一条任务记录，展示了完整的记录行布局和样式效果',
    isFocus: false,
    isDateRow: false,
    isUnfinishedTask: false,
    isCompleted: false,
    duration: 125,
    isNew: false,
    animationIntensity: 'medium'
  },
  {
    id: '2',
    timeText: '14:32:18',
    timeType: 'timestamp',
    prefixText: '更长的前缀文本示例',
    businessType: '学习',
    primaryTag: '机械',
    secondaryTag: '',
    recordText: '这是焦点记录行，右侧显示存档和终止按钮，前缀文本根据长度显示不同颜色',
    isFocus: true,
    isDateRow: false,
    isUnfinishedTask: true,
    isCompleted: false,
    duration: 285,
    isNew: false,
    animationIntensity: 'high'
  }
])

const specialEditRows = ref([
  {
    id: 'flow-1',
    type: 'flow',
    prefixText: '心流前缀',
    isSecondState: true,
    isVisible: true
  }
])

// 标签选项数据
const primaryTagOptions = ref([
  { label: '信息', value: '信息', icon: '🔗' },
  { label: '机械', value: '机械', icon: '⚙️' },
  { label: '混沌', value: '混沌', icon: '🌀' },
  { label: '摸鱼', value: '摸鱼', icon: '🐟' }
])

const systemSecondaryTags = ref([
  { label: '重要', value: '重要' },
  { label: '紧急', value: '紧急' },
  { label: '普通', value: '普通' }
])

const customSecondaryTags = ref([
  { id: 'custom-1', label: '自定义', value: '自定义' }
])

// 计算属性
const visibleWarehouseTasks = computed(() => {
  const result: any[] = []
  
  const addTaskAndChildren = (task: any) => {
    result.push(task)
    
    if (expandedTasks.value.has(task.id)) {
      const children = warehouseTasks.value
        .filter(t => t.parentTaskId === task.id)
        .sort((a, b) => a.taskText.localeCompare(b.taskText))
      
      children.forEach(child => addTaskAndChildren(child))
    }
  }
  
  warehouseTasks.value
    .filter(task => !task.parentTaskId)
    .forEach(task => addTaskAndChildren(task))
  
  return result
})

const dateRows = computed(() => {
  return taskRecords.value
    .filter(record => record.isDateRow)
    .map(record => ({ id: record.id, date: record.timeText }))
})

const unfinishedTaskRows = computed(() => {
  return taskRecords.value
    .filter(record => record.isUnfinishedTask)
    .map(record => ({ id: record.id, taskId: record.id }))
})

const timerDisplay = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60)
  const seconds = timerSeconds.value % 60
  return minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`
})

const visibleSpecialRows = computed(() => {
  return specialEditRows.value
    .filter(row => row.isVisible)
    .sort((a, b) => {
      const order = { flow: 1, interrupt: 2, error: 3 }
      return order[a.type] - order[b.type]
    })
})

const canSave = computed(() => {
  return warehouseEdit.value.text.trim().length > 0 && warehouseEdit.value.primaryTag.length > 0
})

const canOperate = computed(() => {
  return warehouseEdit.value.text.trim().length > 0
})

const canOperateA = computed(() => {
  return editRowA.value.text.trim().length > 0 && !editRowA.value.disabled
})

const canOperateB = computed(() => {
  return editRowB.value.text.trim().length > 0 && !editRowB.value.disabled
})

const isValidCustomTag = computed(() => {
  return /^[\u4e00-\u9fa5]{2}$/.test(customTagInput.value)
})

// 方法实现
const toggleWarehouse = () => {
  warehouseExpanded.value = !warehouseExpanded.value
}

const getPrimaryTagIcon = (tagName: string): string => {
  const iconMap: Record<string, string> = {
    '信息': '🔗',
    '机械': '⚙️',
    '混沌': '🌀',
    '摸鱼': '🐟'
  }
  return iconMap[tagName] || '🏷️'
}

const formatTime = (time: string, type: string): string => {
  if (type === 'duration') {
    const seconds = parseInt(time)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}min ${remainingSeconds}s` : `${remainingSeconds}s`
  }
  return time
}

const getTimeColorClass = (duration?: number): string => {
  if (!duration) return ''
  
  if (duration <= 60) return 'dcj-time--tender'
  if (duration <= 180) return 'dcj-time--green-yellow'
  if (duration <= 360) return 'dcj-time--light-yellow'
  return 'dcj-time--golden'
}

const getPrefixColorClass = (prefix: string, isFocus: boolean, isCompleted: boolean): string => {
  if (isFocus) {
    const length = prefix.length
    const cycle = Math.floor((length - 4) / 4) % 6
    const position = (length - 4) % 24
    
    if (position < 4) return 'dcj-prefix--white'
    if (position < 8) return 'dcj-prefix--green'
    if (position < 12) return 'dcj-prefix--blue'
    if (position < 16) return 'dcj-prefix--purple'
    if (position < 20) return 'dcj-prefix--orange'
    return 'dcj-prefix--red'
  }
  
  return isCompleted ? 'dcj-prefix--completed' : 'dcj-prefix--uncompleted'
}

const calculatePrefixWidth = (text: string): number => {
  return Math.max(text.length * 8 + 16, 40)
}

const getSpecialBusinessType = (type: string): string => {
  const typeMap: Record<string, string> = {
    flow: '专注',
    interrupt: '中断',
    error: 'Error'
  }
  return typeMap[type] || ''
}

const getSpecialText = (type: string, isSecondState?: boolean): string => {
  if (type === 'flow') {
    return isSecondState 
      ? '高燃专注ing，体温冷却后，点按运转以完成对本次燃烧的采样'
      : '长时间无操作，可能已经进入了专注的工作状态，无瑕顾及任务管理'
  }
  if (type === 'interrupt') {
    return '长时间无操作，可能不得已被其他事件打断。变化是工作的常态，计划以外的活动也值得被记录'
  }
  if (type === 'error') {
    return '长时间无操作，可能是认知资源过载导致的分心走神，这是一个常见故障'
  }
  return ''
}

// 事件处理
const selectPrimaryTag = (tagValue: string) => {
  warehouseEdit.value.primaryTag = tagValue
  showPrimaryTagDropdown.value = false
  
  if (tagValue !== '信息') {
    warehouseEdit.value.secondaryTag = ''
  }
}

const selectSecondaryTag = (tagValue: string) => {
  warehouseEdit.value.secondaryTag = tagValue
  showSecondaryTagDropdown.value = false
}

const addCustomTag = () => {
  if (isValidCustomTag.value) {
    customSecondaryTags.value.push({
      id: `custom-${Date.now()}`,
      label: customTagInput.value,
      value: customTagInput.value
    })
    warehouseEdit.value.secondaryTag = customTagInput.value
    customTagInput.value = ''
    showSecondaryTagDropdown.value = false
  }
}

const deleteCustomTag = (tagId: string) => {
  customSecondaryTags.value = customSecondaryTags.value.filter(tag => tag.id !== tagId)
}

const handleWarehouseSave = () => {
  if (canSave.value) {
    console.log('保存到仓库:', warehouseEdit.value)
    // 这里会调用API
  }
}

const handleWarehouseOperation = () => {
  if (canOperate.value) {
    console.log('仓库运转:', warehouseEdit.value)
    // 这里会调用API
  }
}

const handleEditRowAOperation = () => {
  if (canOperateA.value) {
    // 添加新记录行（带动画）
    const newRecord = {
      id: `record-${Date.now()}`,
      timeText: currentTime.value,
      timeType: 'timestamp',
      prefixText: '新记录前缀',
      businessType: editRowA.value.businessType || '工作',
      primaryTag: editRowA.value.primaryTag || '信息',
      secondaryTag: editRowA.value.secondaryTag,
      recordText: editRowA.value.text,
      isFocus: false,
      isDateRow: false,
      isUnfinishedTask: false,
      isCompleted: false,
      duration: 0,
      isNew: true,
      animationIntensity: 'high'
    }
    
    taskRecords.value.push(newRecord)
    editRowA.value.text = ''
    
    // 重置计时器
    timerSeconds.value = 0
  }
}

const handleEditRowBOperation = () => {
  if (canOperateB.value) {
    console.log('编辑行B运转:', editRowB.value.text)
    editRowB.value.text = ''
    timerSeconds.value = 0
  }
}

const handleEditRowFocus = (rowType: 'a' | 'b') => {
  console.log(`编辑行${rowType}获得焦点`)
}

const handleEditRowBlur = (rowType: 'a' | 'b') => {
  console.log(`编辑行${rowType}失去焦点`)
}

const archiveFocusTask = () => {
  console.log('存档焦点任务')
}

const terminateFocusTask = () => {
  console.log('终止焦点任务')
}

const hasChildTasks = (taskId: string): boolean => {
  return warehouseTasks.value.some(task => task.parentTaskId === taskId)
}

const toggleTaskExpand = (taskId: string) => {
  if (expandedTasks.value.has(taskId)) {
    expandedTasks.value.delete(taskId)
  } else {
    expandedTasks.value.add(taskId)
  }
}

const expandAllTasks = () => {
  warehouseTasks.value.forEach(task => {
    if (hasChildTasks(task.id)) {
      expandedTasks.value.add(task.id)
    }
  })
}

const collapseAllTasks = () => {
  expandedTasks.value.clear()
}

// 拖拽处理
const startTaskDrag = (task: any, event: DragEvent) => {
  draggedTaskId.value = task.id
  
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', task.id)
  }
}

const endTaskDrag = () => {
  draggedTaskId.value = null
  dropTargetId.value = null
}

const handleTaskDragEnter = (task: any, event: DragEvent) => {
  if (draggedTaskId.value !== task.id) {
    dropTargetId.value = task.id
  }
}

const handleTaskDragLeave = () => {
  dropTargetId.value = null
}

const handleTaskDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (draggedTaskId.value && dropTargetId.value) {
    console.log(`移动任务 ${draggedTaskId.value} 到 ${dropTargetId.value}`)
    // 这里实现重排序逻辑
  }
  
  endTaskDrag()
}

const updateTaskText = (task: any) => {
  console.log('更新任务文本:', task.id, task.taskText)
}

const extractTask = (task: any) => {
  console.log('提取任务:', task.id)
}

const completeTask = (task: any) => {
  console.log('完成任务:', task.id)
}

const deleteTask = (task: any) => {
  const index = warehouseTasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    warehouseTasks.value.splice(index, 1)
  }
}

const handleSpecialRowOperation = (specialRow: any) => {
  console.log('特殊编辑行操作:', specialRow.type)
}

// 时钟更新
const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  timerSeconds.value++
}

// 快捷键设置
useDCJShortcuts({
  operateEditRowA: handleEditRowAOperation,
  operateEditRowB: handleEditRowBOperation,
  saveToWarehouse: handleWarehouseSave,
  operateWarehouse: handleWarehouseOperation,
  archiveFocusTask: archiveFocusTask,
  terminateFocusTask: terminateFocusTask,
  toggleWarehouse: toggleWarehouse,
  scrollToTop: () => {
    const container = document.querySelector('.dcj-operation-content')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
  scrollToBottom: () => {
    const container = document.querySelector('.dcj-operation-content')
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  },
  focusEditRowA: () => editRowAInputRef.value?.focus(),
  focusEditRowB: () => editRowBInputRef.value?.focus()
})

// 生命周期
let timeInterval: number | null = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // 显示快捷键帮助的快捷键
  document.addEventListener('keydown', (event) => {
    if (event.key === 'F1' || event.key === '?') {
      event.preventDefault()
      showShortcutHelp.value = !showShortcutHelp.value
    }
  })
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
// 主页面布局
.dcj-main-page {
  @include flex-start;
  width: 100vw;
  height: 100vh;
  background: $color-bg-primary;
  overflow: hidden;
}

// 仓库面板样式
.dcj-warehouse-panel {
  width: 731px;
  height: 100vh;
  background: $color-bg-secondary;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  transition: width $duration-normal $ease-in-out-smooth;
  position: relative;
  
  &--collapsed {
    width: 67px;
    
    .dcj-warehouse-content {
      opacity: 0;
      pointer-events: none;
    }
    
    .dcj-warehouse-title {
      display: none;
    }
  }
}

.dcj-warehouse-header {
  @include flex-between;
  height: 54px;
  padding: 0 $spacing-md;
  border-bottom: 1px solid $border-color;
  background: $color-bg-tertiary;
  
  .dcj-warehouse-toggle {
    @include flex-center;
    width: 52px;
    height: 33px;
    background: rgba(187, 255, 224, 0.1);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &:hover {
      background: rgba(187, 255, 224, 0.2);
      transform: scale(1.05);
    }
    
    .dcj-toggle-icon {
      font-family: $font-family-mono;
      font-size: $font-size-sm;
      color: $color-component-primary;
    }
  }
  
  .dcj-warehouse-title {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-component-primary;
    transition: opacity $duration-fast $ease-in-out-smooth;
  }
  
  .dcj-archive-button {
    @include flex-center;
    height: 33px;
    padding: 0 $spacing-sm;
    background: rgba(187, 255, 224, 0.1);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    cursor: pointer;
    font-size: $font-size-sm;
    
    &:hover {
      background: rgba(187, 255, 224, 0.2);
    }
  }
}

// 仓库内容区域
.dcj-warehouse-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity $duration-fast $ease-in-out-smooth;
}

.dcj-warehouse-edit-section {
  border-bottom: 1px solid $border-color;
}

.dcj-warehouse-edit-row {
  @include flex-start;
  height: 50px;
  padding: 0 $spacing-md;
  gap: $spacing-sm;
  background: rgba(16, 111, 152, 0.3);
  
  .dcj-tag-selector {
    position: relative;
    flex-shrink: 0;
  }
  
  .dcj-tag-button {
    @include flex-center;
    height: 30px;
    background: rgba(187, 255, 224, 0.1);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &--primary {
      width: 30px;
    }
    
    &--secondary {
      width: 50px;
      font-size: $font-size-sm;
    }
    
    &:hover {
      background: rgba(187, 255, 224, 0.2);
    }
  }
  
  .dcj-warehouse-text-input {
    flex: 1;
    height: 30px;
    padding: 0 $spacing-sm;
    background: rgba(8, 79, 108, 0.5);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    outline: none;
    
    &:focus {
      background: rgba(8, 79, 108, 0.8);
      border-color: $color-component-primary;
    }
  }
  
  .dcj-button--save {
    background: rgba(0, 149, 255, 0.8);
    
    &:hover:not(:disabled) {
      background: rgba(0, 149, 255, 1);
    }
  }
  
  .dcj-button--operation {
    background: $color-component-primary;
    color: $color-bg-primary;
    
    &:hover:not(:disabled) {
      background: lighten($color-component-primary, 10%);
    }
  }
}

// 存储区域样式
.dcj-warehouse-storage {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dcj-storage-header {
  @include flex-between;
  height: 40px;
  padding: 0 $spacing-md;
  background: rgba(16, 111, 152, 0.2);
  border-bottom: 1px solid $border-color;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  
  .dcj-storage-controls {
    display: flex;
    gap: $spacing-xs;
    
    .dcj-button {
      height: 24px;
      padding: 0 $spacing-xs;
      font-size: $font-size-xs;
    }
  }
}

.dcj-storage-area {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-sm;
}

.dcj-storage-row {
  @include flex-start;
  height: 50px;
  margin-bottom: $spacing-sm;
  gap: $spacing-sm;
  background: rgba(16, 111, 152, 0.1);
  border-radius: $border-radius-sm;
  transition: all $duration-fast $ease-in-out-smooth;
  
  &--dragging {
    opacity: 0.7;
    transform: rotate(2deg);
    z-index: 1000;
  }
  
  &--drop-target {
    background: rgba(187, 255, 224, 0.2);
    border: 2px solid $color-component-primary;
  }
  
  .dcj-drag-handle {
    width: 30px;
    height: 30px;
    @include flex-center;
    cursor: grab;
    color: $color-text-muted;
    
    &:hover {
      color: $color-component-primary;
    }
  }
  
  .dcj-expand-button,
  .dcj-expand-placeholder {
    width: 30px;
    height: 30px;
    @include flex-center;
    background: none;
    border: none;
    color: $color-text-secondary;
    cursor: pointer;
    
    &:hover {
      color: $color-component-primary;
    }
  }
  
  .dcj-task-tags {
    @include flex-start;
    gap: $spacing-xs;
    
    .dcj-tag-primary {
      width: 30px;
      height: 30px;
      @include flex-center;
      background: rgba(187, 255, 224, 0.1);
      border-radius: $border-radius-sm;
    }
    
    .dcj-tag-secondary {
      height: 30px;
      padding: 0 $spacing-sm;
      @include flex-center;
      background: rgba(187, 255, 224, 0.1);
      border-radius: $border-radius-sm;
      font-size: $font-size-sm;
    }
  }
  
  .dcj-task-text-input {
    flex: 1;
    height: 30px;
    padding: 0 $spacing-sm;
    background: rgba(8, 79, 108, 0.3);
    border: 1px solid transparent;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    outline: none;
    
    &:focus {
      background: rgba(8, 79, 108, 0.6);
      border-color: $color-component-primary;
    }
    
    &--highlighted {
      background: rgba(255, 255, 0, 0.1);
      border-color: rgba(255, 255, 0, 0.5);
    }
    
    &--dimmed {
      opacity: 0.6;
    }
  }
  
  .dcj-task-actions {
    @include flex-start;
    gap: $spacing-xs;
  }
  
  .dcj-action-button {
    width: 30px;
    height: 30px;
    @include flex-center;
    border: none;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: all $duration-fast $ease-in-out-smooth;
    
    &--extract {
      background: rgba(0, 149, 255, 0.8);
      
      &:hover {
        background: rgba(0, 149, 255, 1);
        transform: scale(1.1);
      }
    }
    
    &--complete {
      background: rgba(0, 255, 0, 0.8);
      
      &:hover {
        background: rgba(0, 255, 0, 1);
        transform: scale(1.1);
      }
    }
    
    &--delete {
      background: rgba(255, 0, 0, 0.8);
      
      &:hover {
        background: rgba(255, 0, 0, 1);
        transform: scale(1.1);
      }
    }
  }
}

// 运转面板样式
.dcj-operation-panel {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dcj-operation-header {
  height: 54px;
  background: $color-bg-tertiary;
  border-bottom: 1px solid $border-color;
  @include flex-center;
  
  .dcj-operation-decoration {
    @include flex-between;
    width: 100%;
    padding: 0 $spacing-lg;
    
    .dcj-operation-title {
      font-size: $font-size-md;
      font-weight: $font-weight-bold;
      color: $color-component-primary;
    }
    
    .dcj-operation-stats {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }
}

// 记录行和编辑行样式
.dcj-records-area {
  padding: $spacing-sm;
}

.dcj-record-row {
  @include flex-start;
  height: 34px;
  margin-bottom: 2px;
  gap: $spacing-sm;
  position: relative;
  
  &--focus {
    background: rgba(187, 255, 224, 0.05);
    border-left: 3px solid $color-component-primary;
  }
  
  &--date {
    background: rgba(187, 255, 224, 0.08);
    font-weight: $font-weight-bold;
  }
  
  &--unfinished {
    background: rgba(255, 165, 0, 0.05);
    border-left: 2px solid rgba(255, 165, 0, 0.5);
  }
}

.dcj-separator {
  height: 10px;
  margin: 0 $spacing-sm;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(187, 255, 224, 0.1) 50%,
    transparent 100%
  );
}

.dcj-edit-row {
  @include flex-start;
  height: 34px;
  margin-bottom: 2px;
  gap: $spacing-sm;
  padding: 0 $spacing-sm;
  background: rgba(187, 255, 224, 0.02);
  position: relative;
  
  &--a {
    border-bottom: 1px solid rgba(187, 255, 224, 0.1);
  }
  
  &--b {
    margin-bottom: $spacing-sm;
  }
}

.dcj-clock {
  width: 136px;
  height: 30px;
  @include flex-center;
  font-family: $font-family-mono;
  font-size: $font-size-sm;
  background: rgba(187, 255, 224, 0.1);
  border-radius: $border-radius-sm;
  
  &--realtime {
    color: $color-text-primary;
  }
  
  &--timer {
    color: $color-text-primary;
    
    &.dcj-clock--focus {
      color: $color-focus-clock;
      font-weight: $font-weight-bold;
    }
  }
  
  &--hidden {
    color: transparent;
  }
}

// 时间和前缀文本样式
.dcj-time-text {
  width: 136px;
  @include flex-center;
  font-family: $font-family-mono;
  font-size: $font-size-sm;
  
  &.dcj-time--tender { color: $color-time-tender; }
  &.dcj-time--green-yellow { color: $color-time-green-yellow; }
  &.dcj-time--light-yellow { color: $color-time-light-yellow; }
  &.dcj-time--golden { color: $color-time-golden; }
}

.dcj-prefix-text {
  @include flex-center;
  font-weight: $font-weight-bold;
  font-size: $font-size-sm;
  min-width: 40px;
  
  &.dcj-prefix--white { color: $color-prefix-white; }
  &.dcj-prefix--green { color: $color-prefix-green; }
  &.dcj-prefix--blue { color: $color-prefix-blue; }
  &.dcj-prefix--purple { color: $color-prefix-purple; }
  &.dcj-prefix--orange { color: $color-prefix-orange; }
  &.dcj-prefix--red { color: $color-prefix-red; }
  &.dcj-prefix--completed { color: $color-text-secondary; }
  &.dcj-prefix--uncompleted { color: $color-text-muted; }
}

// 其他组件样式
.dcj-business-type {
  width: 50px;
  text-align: center;
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.dcj-tag-primary,
.dcj-tag-secondary {
  @include flex-center;
  height: 30px;
  background: rgba(187, 255, 224, 0.1);
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
}

.dcj-tag-primary {
  width: 30px;
}

.dcj-tag-secondary {
  width: 50px;
}

.dcj-record-text {
  flex: 1;
  color: $color-text-primary;
  user-select: text;
  cursor: text;
  @include text-ellipsis;
}

.dcj-edit-input {
  flex: 1;
  height: 30px;
  padding: 0 $spacing-sm;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $border-radius-sm;
  color: $color-text-primary;
  outline: none;
  
  &:focus {
    background: rgba(187, 255, 224, 0.1);
    border-color: $color-component-primary;
  }
  
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dcj-operation-button {
  position: absolute;
  right: $spacing-md;
  width: 50px;
  height: 30px;
  @include flex-center;
  background: $color-component-primary;
  color: $color-bg-primary;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  font-weight: $font-weight-bold;
  
  &:hover:not(:disabled) {
    background: lighten($color-component-primary, 10%);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--special {
    position: static;
    width: 50px;
  }
}

// 特殊编辑行样式
.dcj-special-edit-row {
  @include flex-start;
  height: 34px;
  margin-bottom: 2px;
  gap: $spacing-sm;
  padding: 0 $spacing-sm;
  border-left: 3px solid;
  
  &--flow {
    background: rgba(0, 255, 0, 0.05);
    border-left-color: rgba(0, 255, 0, 0.5);
  }
  
  &--interrupt {
    background: rgba(255, 165, 0, 0.05);
    border-left-color: rgba(255, 165, 0, 0.5);
  }
  
  &--error {
    background: rgba(255, 0, 0, 0.05);
    border-left-color: rgba(255, 0, 0, 0.5);
  }
  
  .dcj-special-text {
    flex: 1;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    user-select: text;
  }
  
  .dcj-focus-timer {
    color: $color-focus-clock;
    font-weight: $font-weight-bold;
  }
}

// 下拉框样式
.dcj-tag-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: $z-index-dropdown;
  background: $color-bg-tertiary;
  border: 1px solid $border-color-active;
  border-radius: $border-radius-sm;
  box-shadow: $box-shadow-lg;
  min-width: 120px;
  
  &--secondary {
    min-width: 200px;
  }
}

.dcj-tag-option {
  @include flex-start;
  height: 32px;
  padding: 0 $spacing-sm;
  gap: $spacing-xs;
  cursor: pointer;
  transition: background $duration-fast $ease-in-out-smooth;
  
  &:hover {
    background: rgba(187, 255, 224, 0.1);
  }
  
  &--custom {
    .dcj-delete-tag {
      margin-left: auto;
      width: 16px;
      height: 16px;
      @include flex-center;
      background: $color-error;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 10px;
      cursor: pointer;
    }
  }
}

.dcj-tag-system-mark {
  margin-left: auto;
  font-size: $font-size-xs;
  color: $color-text-muted;
  background: rgba(128, 128, 128, 0.2);
  padding: 2px 6px;
  border-radius: $border-radius-sm;
}

.dcj-custom-tag-input {
  @include flex-start;
  padding: $spacing-sm;
  gap: $spacing-xs;
  border-top: 1px solid $border-color;
  
  .dcj-custom-input {
    flex: 1;
    height: 24px;
    padding: 0 $spacing-xs;
    background: rgba(8, 79, 108, 0.5);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    outline: none;
    font-size: $font-size-sm;
  }
  
  .dcj-add-tag {
    height: 24px;
    padding: 0 $spacing-xs;
    background: $color-success;
    color: white;
    border: none;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    cursor: pointer;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 动画效果
.warehouse-content-enter-active,
.warehouse-content-leave-active {
  transition: all $duration-normal $ease-in-out-smooth;
}

.warehouse-content-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.warehouse-content-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.storage-row-enter-active,
.storage-row-leave-active {
  transition: all $duration-normal $ease-in-out-smooth;
}

.storage-row-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.storage-row-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.special-row-enter-active,
.special-row-leave-active {
  transition: all $duration-normal $ease-in-out-smooth;
}

.special-row-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.special-row-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

// 空状态样式
.dcj-empty-warehouse {
  @include flex-center;
  flex-direction: column;
  height: 200px;
  color: $color-text-muted;
  
  .dcj-empty-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }
  
  .dcj-empty-text {
    font-size: $font-size-md;
    margin-bottom: $spacing-sm;
  }
  
  .dcj-empty-hint {
    font-size: $font-size-sm;
    opacity: 0.7;
  }
}
</style>

