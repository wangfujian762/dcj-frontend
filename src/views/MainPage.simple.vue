<template>
  <div class="dcj-main-page">
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
          {{ warehouseExpanded ? '<<' : '>>' }}
        </button>
        
        <!-- 仓库面板标题 -->
        <div v-if="warehouseExpanded" class="dcj-warehouse-title">
          任务仓库
        </div>
        
        <!-- 更换存档按钮 -->
        <div class="dcj-archive-info">
          存档: {{ currentArchive || 'demo' }}
        </div>
      </div>
      
      <!-- 仓库面板内容 -->
      <div v-if="warehouseExpanded" class="dcj-warehouse-content">
        <!-- 仓库编辑行 -->
        <div class="dcj-warehouse-edit-row">
          <div class="dcj-tag-placeholder">🏷️</div>
          <input 
            v-model="warehouseText"
            class="dcj-warehouse-input"
            placeholder="输入仓库任务..."
            @keyup.enter="addWarehouseTask"
          />
          <button class="dcj-button" @click="addWarehouseTask">💾</button>
          <button class="dcj-button" @click="operateWarehouse">🔄</button>
        </div>
        
        <!-- 仓库存储区 -->
        <div class="dcj-warehouse-storage">
          <div 
            v-for="(task, index) in warehouseTasks" 
            :key="index"
            class="dcj-storage-row"
            :style="{ paddingLeft: `${task.depth * 20}px` }"
          >
            <div class="dcj-drag-handle">⋮⋮</div>
            <div class="dcj-expand-button">{{ task.hasChildren ? '▼' : '' }}</div>
            <div class="dcj-tag-placeholder">🏷️</div>
            <input v-model="task.text" class="dcj-task-input" />
            <button class="dcj-button dcj-button--small">↗</button>
            <button class="dcj-button dcj-button--small">✓</button>
            <button class="dcj-button dcj-button--small">🗑</button>
          </div>
          
          <div v-if="warehouseTasks.length === 0" class="dcj-empty-state">
            📦 仓库暂无任务
          </div>
        </div>
      </div>
    </div>
    
    <!-- 任务运转面板 -->
    <div class="dcj-operation-panel">
      <!-- 运转面板头部装饰 -->
      <div class="dcj-operation-header">
        <div class="dcj-operation-decoration">DCJ 任务运转面板</div>
      </div>
      
      <!-- 运转面板内容 -->
      <div class="dcj-operation-content">
        <!-- 记录行区域 -->
        <div class="dcj-records-area">
          <div 
            v-for="(record, index) in taskRecords" 
            :key="index"
            :class="[
              'dcj-record-row',
              { 'dcj-record-row--focus': record.isFocus }
            ]"
          >
            <div class="dcj-time-text">{{ record.time }}</div>
            <div class="dcj-prefix-text" :style="{ color: record.prefixColor }">
              {{ record.prefix }}
            </div>
            <div class="dcj-business-type">{{ record.businessType }}</div>
            <div class="dcj-tag-primary">{{ record.primaryTag }}</div>
            <div class="dcj-tag-secondary">{{ record.secondaryTag }}</div>
            <div class="dcj-record-text">{{ record.text }}</div>
            
            <!-- 焦点行操作按钮 -->
            <div v-if="record.isFocus" class="dcj-record-actions">
              <button class="dcj-button dcj-button--small">📁</button>
              <button class="dcj-button dcj-button--small">❌</button>
            </div>
          </div>
        </div>
        
        <!-- 编辑行A -->
        <div class="dcj-edit-row dcj-edit-row--a">
          <div class="dcj-clock">{{ currentTime }}</div>
          <div class="dcj-prefix-text">{{ editRowA.prefix }}</div>
          <button class="dcj-business-button">{{ editRowA.businessType || '类型' }}</button>
          <button class="dcj-tag-button">{{ editRowA.primaryTag || '🏷️' }}</button>
          <button class="dcj-tag-button">{{ editRowA.secondaryTag || '🏷️' }}</button>
          <input 
            v-model="editRowA.text"
            class="dcj-edit-input"
            placeholder="输入运转文本..."
            @keyup.enter="operateEditRowA"
          />
          <button class="dcj-operation-button" @click="operateEditRowA">🔄</button>
        </div>
        
        <!-- 编辑行B -->
        <div class="dcj-edit-row dcj-edit-row--b">
          <div class="dcj-clock dcj-clock--timer">{{ timerTime }}</div>
          <div class="dcj-prefix-text">{{ editRowB.prefix }}</div>
          <button class="dcj-business-button">{{ editRowB.businessType || '类型' }}</button>
          <button class="dcj-tag-button">{{ editRowB.primaryTag || '🏷️' }}</button>
          <button class="dcj-tag-button">{{ editRowB.secondaryTag || '🏷️' }}</button>
          <input 
            v-model="editRowB.text"
            class="dcj-edit-input"
            placeholder="输入运转文本..."
            @keyup.enter="operateEditRowB"
          />
          <button class="dcj-operation-button" @click="operateEditRowB">🔄</button>
        </div>
        
        <!-- 特殊编辑行 -->
        <div v-for="(specialRow, index) in specialEditRows" :key="index" class="dcj-special-edit-row">
          <div class="dcj-clock">{{ specialRow.type === 'flow' ? timerTime : '' }}</div>
          <div class="dcj-prefix-text">{{ specialRow.prefix }}</div>
          <div class="dcj-business-type">{{ specialRow.businessType }}</div>
          <div class="dcj-special-text">{{ specialRow.text }}</div>
          <button class="dcj-operation-button">🔄</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const warehouseExpanded = ref(true)
const warehouseText = ref('')
const currentArchive = ref('DEMO001')
const currentTime = ref('')
const timerSeconds = ref(0)

// 仓库任务数据
const warehouseTasks = ref([
  { text: '示例仓库任务1', depth: 0, hasChildren: false },
  { text: '示例仓库任务2', depth: 1, hasChildren: true },
  { text: '示例子任务', depth: 2, hasChildren: false }
])

// 任务记录数据
const taskRecords = ref([
  {
    time: '14:30:25',
    prefix: '前缀文本示例',
    prefixColor: '#ffffff',
    businessType: '工作',
    primaryTag: '信息',
    secondaryTag: '重要',
    text: '这是一条示例任务记录，展示记录行的基本布局和样式',
    isFocus: false
  },
  {
    time: '14:32:18',
    prefix: '更长的前缀文本',
    prefixColor: '#00ff00',
    businessType: '学习',
    primaryTag: '机械',
    secondaryTag: '',
    text: '这是焦点记录行，右侧有存档和终止按钮',
    isFocus: true
  }
])

// 编辑行数据
const editRowA = ref({
  text: '',
  prefix: '编辑行A前缀',
  businessType: '',
  primaryTag: '',
  secondaryTag: ''
})

const editRowB = ref({
  text: '',
  prefix: '编辑行B前缀',
  businessType: '',
  primaryTag: '',
  secondaryTag: ''
})

// 特殊编辑行数据
const specialEditRows = ref([
  {
    type: 'flow',
    prefix: '心流前缀',
    businessType: '专注',
    text: '高燃专注ing，体温冷却后，点按运转以完成对本次燃烧的采样'
  }
])

// 计算属性
const timerTime = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60)
  const seconds = timerSeconds.value % 60
  return minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`
})

// 方法
const toggleWarehouse = () => {
  warehouseExpanded.value = !warehouseExpanded.value
}

const addWarehouseTask = () => {
  if (warehouseText.value.trim()) {
    warehouseTasks.value.push({
      text: warehouseText.value,
      depth: 0,
      hasChildren: false
    })
    warehouseText.value = ''
  }
}

const operateWarehouse = () => {
  console.log('仓库运转操作:', warehouseText.value)
}

const operateEditRowA = () => {
  if (editRowA.value.text.trim()) {
    taskRecords.value.push({
      time: currentTime.value,
      prefix: '新记录前缀',
      prefixColor: '#ffffff',
      businessType: editRowA.value.businessType || '工作',
      primaryTag: editRowA.value.primaryTag || '信息',
      secondaryTag: editRowA.value.secondaryTag,
      text: editRowA.value.text,
      isFocus: false
    })
    editRowA.value.text = ''
  }
}

const operateEditRowB = () => {
  console.log('编辑行B运转操作:', editRowB.value.text)
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

let timeInterval: number | null = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
.dcj-main-page {
  @include flex-start;
  width: 100vw;
  height: 100vh;
  background: $color-bg-primary;
  overflow: hidden;
}

.dcj-warehouse-panel {
  width: 731px;
  height: 100vh;
  background: $color-bg-secondary;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  transition: width $duration-normal $ease-in-out-smooth;
  
  &--collapsed {
    width: 67px;
    
    .dcj-warehouse-content {
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
  
  .dcj-warehouse-title {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-component-primary;
  }
  
  .dcj-archive-info {
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }
}

.dcj-warehouse-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dcj-warehouse-edit-row {
  @include flex-start;
  height: 50px;
  padding: 0 $spacing-md;
  gap: $spacing-sm;
  background: rgba(16, 111, 152, 0.3);
  border-bottom: 1px solid $border-color;
  
  .dcj-tag-placeholder {
    width: 30px;
    height: 30px;
    @include flex-center;
    background: rgba(187, 255, 224, 0.1);
    border-radius: $border-radius-sm;
  }
  
  .dcj-warehouse-input {
    flex: 1;
    height: 30px;
    padding: 0 $spacing-sm;
    background: rgba(8, 79, 108, 0.5);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    outline: none;
    
    &:focus {
      border-color: $color-component-primary;
    }
  }
  
  .dcj-button {
    width: 30px;
    height: 30px;
    @include flex-center;
    background: $color-component-tertiary;
    border: none;
    border-radius: $border-radius-sm;
    cursor: pointer;
    
    &:hover {
      background: $color-component-secondary;
    }
  }
}

.dcj-warehouse-storage {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-sm;
}

.dcj-storage-row {
  @include flex-start;
  height: 50px;
  margin-bottom: $spacing-sm;
  gap: $spacing-sm;
  
  .dcj-drag-handle {
    width: 30px;
    height: 30px;
    @include flex-center;
    cursor: grab;
    background: rgba(187, 255, 224, 0.1);
    border-radius: $border-radius-sm;
  }
  
  .dcj-expand-button {
    width: 30px;
    height: 30px;
    @include flex-center;
    background: rgba(187, 255, 224, 0.1);
    border-radius: $border-radius-sm;
  }
  
  .dcj-task-input {
    flex: 1;
    height: 30px;
    padding: 0 $spacing-sm;
    background: rgba(8, 79, 108, 0.3);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    outline: none;
  }
}

.dcj-empty-state {
  @include flex-center;
  height: 100px;
  color: $color-text-muted;
  font-size: $font-size-sm;
}

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
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-component-primary;
  }
}

.dcj-operation-content {
  flex: 1;
  overflow-y: auto;
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
  }
  
  .dcj-time-text {
    width: 136px;
    font-family: $font-family-mono;
    font-size: $font-size-sm;
    color: $color-text-primary;
  }
  
  .dcj-prefix-text {
    min-width: 60px;
    font-weight: $font-weight-bold;
    font-size: $font-size-sm;
  }
  
  .dcj-business-type {
    width: 50px;
    text-align: center;
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }
  
  .dcj-tag-primary,
  .dcj-tag-secondary {
    padding: 2px 8px;
    background: rgba(187, 255, 224, 0.2);
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
  }
  
  .dcj-record-text {
    flex: 1;
    font-size: $font-size-md;
    color: $color-text-primary;
    user-select: text;
    cursor: text;
  }
  
  .dcj-record-actions {
    position: absolute;
    right: $spacing-md;
    display: flex;
    gap: $spacing-xs;
  }
}

.dcj-edit-row {
  @include flex-start;
  height: 34px;
  margin-bottom: 2px;
  gap: $spacing-sm;
  background: rgba(187, 255, 224, 0.02);
  position: relative;
  
  .dcj-clock {
    width: 136px;
    @include flex-center;
    font-family: $font-family-mono;
    font-size: $font-size-sm;
    background: rgba(187, 255, 224, 0.1);
    border-radius: $border-radius-sm;
    
    &--timer {
      color: $color-focus-clock;
      font-weight: $font-weight-bold;
    }
  }
  
  .dcj-business-button,
  .dcj-tag-button {
    height: 30px;
    padding: 0 $spacing-sm;
    background: rgba(187, 255, 224, 0.1);
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    color: $color-text-primary;
    cursor: pointer;
    
    &:hover {
      background: rgba(187, 255, 224, 0.2);
    }
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
    
    &:hover {
      background: lighten($color-component-primary, 10%);
    }
  }
}

.dcj-special-edit-row {
  @include flex-start;
  height: 34px;
  margin-bottom: 2px;
  gap: $spacing-sm;
  background: rgba(0, 255, 0, 0.05);
  border-left: 3px solid rgba(0, 255, 0, 0.5);
  padding-left: $spacing-sm;
  
  .dcj-special-text {
    flex: 1;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    user-select: text;
  }
}
</style>

