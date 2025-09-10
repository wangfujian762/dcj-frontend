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
          <IconExpand v-if="!warehouseExpanded" />
          <IconCollapse v-else />
        </button>
        
        <!-- 仓库面板标题 -->
        <div v-if="warehouseExpanded" class="dcj-warehouse-title">
          任务仓库
        </div>
        
        <!-- 更换存档按钮 -->
        <ArchiveSelector />
      </div>
      
      <!-- 仓库面板内容 -->
      <div v-if="warehouseExpanded" class="dcj-warehouse-content">
        <!-- 仓库编辑行 -->
        <WarehouseEditRow
          v-model:text="warehouseEditText"
          v-model:primary-tag="warehouseEditPrimaryTag"
          v-model:secondary-tag="warehouseEditSecondaryTag"
          :primary-tag-options="primaryTagOptions"
          :secondary-tag-options="secondaryTagOptions"
          @save="handleWarehouseSave"
          @operation="handleWarehouseOperation"
        />
        
        <!-- 仓库存储区 -->
        <WarehouseStorageArea
          :warehouse-tasks="warehouseTasks"
          :expanded-tasks="expandedTasks"
          @toggle-expand="toggleTaskExpand"
          @extract="handleExtractTask"
          @complete="handleCompleteTask"
          @delete="handleDeleteTask"
          @reorder="handleReorderTasks"
        />
      </div>
    </div>
    
    <!-- 任务运转面板 -->
    <div class="dcj-operation-panel">
      <!-- 运转面板头部装饰 -->
      <div class="dcj-operation-header">
        <div class="dcj-operation-decoration"></div>
      </div>
      
      <!-- 运转面板内容 -->
      <div class="dcj-operation-content">
        <!-- 记录行区域 -->
        <div class="dcj-records-area">
          <RecordRow
            v-for="record in taskRecords"
            :key="record.id"
            :record="record"
            :is-focus="record.id === focusRecordId"
            :is-sticky="getStickyState(record)"
            :is-date-row="isDateRecord(record)"
            :is-unfinished-task-row="isUnfinishedTaskRecord(record)"
            @archive="handleArchiveRecord(record)"
            @terminate="handleTerminateRecord(record)"
          />
        </div>
        
        <!-- 记录行与编辑行间的装饰线 -->
        <div class="dcj-records-edit-separator"></div>
        
        <!-- 编辑行A -->
        <EditRow
          type="a"
          v-model:text="editRowA.text"
          v-model:primary-tag="editRowA.primaryTag"
          v-model:secondary-tag="editRowA.secondaryTag"
          v-model:business-type="editRowA.businessType"
          :prefix-text="editRowA.prefixText"
          :primary-tag-options="primaryTagOptions"
          :secondary-tag-options="secondaryTagOptions"
          :business-type-options="businessTypeOptions"
          :disabled="editRowA.disabled"
          @operation="handleEditRowAOperation"
          @focus="handleEditRowFocus('a')"
          @blur="handleEditRowBlur('a')"
        />
        
        <!-- 编辑行B -->
        <EditRow
          type="b"
          v-model:text="editRowB.text"
          v-model:primary-tag="editRowB.primaryTag"
          v-model:secondary-tag="editRowB.secondaryTag"
          v-model:business-type="editRowB.businessType"
          :prefix-text="editRowB.prefixText"
          :primary-tag-options="primaryTagOptions"
          :secondary-tag-options="secondaryTagOptions"
          :business-type-options="businessTypeOptions"
          :disabled="editRowB.disabled"
          :timer-start-time="editRowB.timerStartTime"
          :is-focus-mode="editRowB.isFocusMode"
          :clock-running="editRowB.clockRunning"
          :show-clock="hasFocusTask"
          @operation="handleEditRowBOperation"
          @focus="handleEditRowFocus('b')"
          @blur="handleEditRowBlur('b')"
        />
        
        <!-- 特殊编辑行 -->
        <SpecialEditRow
          v-for="specialRow in specialEditRows"
          :key="specialRow.id"
          :type="specialRow.type"
          :prefix-text="specialRow.prefixText"
          :is-visible="specialRow.isVisible"
          :is-second-state="specialRow.type === 'flow' && specialRow.isSecondState"
          :timer-start-time="specialRow.timerStartTime"
          :timer-running="specialRow.timerRunning"
          @operation="handleSpecialRowOperation(specialRow)"
        />
      </div>
      
      <!-- 滚动条 -->
      <div class="dcj-scrollbar dcj-scrollbar--vertical"></div>
      <div class="dcj-scrollbar dcj-scrollbar--horizontal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TaskRecord, WarehouseTask, DropdownOption, SpecialEditRow as SpecialEditRowType } from '@/types'

// 组件导入
import ArchiveSelector from '@/components/ArchiveSelector.vue'
import RecordRow from '@/components/RecordRow.vue'
import EditRow from '@/components/EditRow.vue'
import SpecialEditRow from '@/components/SpecialEditRow.vue'
import WarehouseEditRow from '@/components/WarehouseEditRow.vue'
import WarehouseStorageArea from '@/components/WarehouseStorageArea.vue'
import { IconExpand, IconCollapse } from '@/components/icons'

// Store导入
import { useTaskStore } from '@/stores/task'
import { useWarehouseStore } from '@/stores/warehouse'
import { useTagStore } from '@/stores/tag'

const taskStore = useTaskStore()
const warehouseStore = useWarehouseStore()
const tagStore = useTagStore()

// 面板状态
const warehouseExpanded = ref(true)

// 仓库编辑行状态
const warehouseEditText = ref('')
const warehouseEditPrimaryTag = ref('')
const warehouseEditSecondaryTag = ref('')

// 编辑行状态
const editRowA = ref({
  text: '',
  primaryTag: '',
  secondaryTag: '',
  businessType: '',
  prefixText: '',
  disabled: false
})

const editRowB = ref({
  text: '',
  primaryTag: '',
  secondaryTag: '',
  businessType: '',
  prefixText: '',
  disabled: false,
  timerStartTime: 0,
  isFocusMode: false,
  clockRunning: true
})

// 计算属性
const taskRecords = computed(() => taskStore.taskRecords)
const warehouseTasks = computed(() => warehouseStore.warehouseTasks)
const expandedTasks = computed(() => warehouseStore.expandedTasks)
const specialEditRows = computed(() => taskStore.specialEditRows)
const focusRecordId = computed(() => taskStore.focusTask?.id)
const hasFocusTask = computed(() => !!taskStore.focusTask)

const primaryTagOptions = computed(() => tagStore.primaryTagOptions)
const secondaryTagOptions = computed(() => tagStore.secondaryTagOptions)
const businessTypeOptions = computed(() => tagStore.businessTypeOptions)

// 方法
const toggleWarehouse = () => {
  warehouseExpanded.value = !warehouseExpanded.value
}

// 获取记录行的粘性状态
const getStickyState = (record: TaskRecord): boolean => {
  return isDateRecord(record) || isUnfinishedTaskRecord(record)
}

// 判断是否为日期记录行
const isDateRecord = (record: TaskRecord): boolean => {
  return record.recordType === 'date'
}

// 判断是否为未完结任务记录行
const isUnfinishedTaskRecord = (record: TaskRecord): boolean => {
  return record.task?.isCompleted === false
}

// 仓库面板事件处理
const handleWarehouseSave = async () => {
  // 处理仓库任务保存
  console.log('仓库保存:', warehouseEditText.value)
}

const handleWarehouseOperation = async () => {
  // 处理仓库运转操作
  console.log('仓库运转:', warehouseEditText.value)
}

const toggleTaskExpand = (taskId: string) => {
  warehouseStore.toggleTaskExpand(taskId)
}

const handleExtractTask = async (task: WarehouseTask) => {
  await warehouseStore.extractTask(task.id)
}

const handleCompleteTask = async (task: WarehouseTask) => {
  await warehouseStore.completeTask(task.id)
}

const handleDeleteTask = async (task: WarehouseTask) => {
  await warehouseStore.deleteTask(task.id)
}

const handleReorderTasks = async (tasks: WarehouseTask[]) => {
  await warehouseStore.reorderTasks(tasks)
}

// 运转面板事件处理
const handleEditRowAOperation = async () => {
  await taskStore.executeOperation({
    type: 'create',
    rowType: 'a',
    text: editRowA.value.text,
    primaryTag: editRowA.value.primaryTag,
    secondaryTag: editRowA.value.secondaryTag,
    businessType: editRowA.value.businessType
  })
}

const handleEditRowBOperation = async () => {
  await taskStore.executeOperation({
    type: 'create',
    rowType: 'b',
    text: editRowB.value.text,
    primaryTag: editRowB.value.primaryTag,
    secondaryTag: editRowB.value.secondaryTag,
    businessType: editRowB.value.businessType
  })
}

const handleEditRowFocus = (rowType: 'a' | 'b') => {
  console.log(`编辑行${rowType}获得焦点`)
}

const handleEditRowBlur = (rowType: 'a' | 'b') => {
  console.log(`编辑行${rowType}失去焦点`)
}

const handleArchiveRecord = async (record: TaskRecord) => {
  await taskStore.archiveRecord(record.id)
}

const handleTerminateRecord = async (record: TaskRecord) => {
  await taskStore.terminateRecord(record.id)
}

const handleSpecialRowOperation = async (specialRow: SpecialEditRowType) => {
  await taskStore.handleSpecialRowOperation(specialRow.id, specialRow.type)
}

// 组件挂载时初始化数据
onMounted(async () => {
  try {
    // 加载标签选项
    await tagStore.loadTagOptions()
    
    // 加载任务记录
    await taskStore.loadTaskRecords()
    
    // 加载仓库任务
    await warehouseStore.loadWarehouseTasks()
    
  } catch (error) {
    console.error('初始化数据失败:', error)
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
  width: $warehouse-panel-width;
  height: 100vh;
  background: $color-bg-secondary;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  transition: width $duration-normal $ease-in-out-smooth;
  
  &--collapsed {
    width: $warehouse-panel-collapsed-width;
    
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
}

.dcj-warehouse-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dcj-operation-panel {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.dcj-operation-header {
  height: 54px;
  background: $color-bg-tertiary;
  border-bottom: 1px solid $border-color;
  
  .dcj-operation-decoration {
    height: 100%;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(187, 255, 224, 0.1) 50%,
      transparent 100%
    );
  }
}

.dcj-operation-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  padding-bottom: $spacing-lg; // 为特殊编辑行留出空间
}

.dcj-records-area {
  min-height: 0;
  flex-shrink: 0;
}

.dcj-records-edit-separator {
  height: 10px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(187, 255, 224, 0.1) 50%,
    transparent 100%
  );
  margin: 0 $spacing-sm;
}

.dcj-scrollbar {
  background: rgba(187, 255, 224, 0.1);
  
  &--vertical {
    position: absolute;
    top: 54px;
    right: 0;
    width: $scrollbar-width;
    bottom: 0;
  }
  
  &--horizontal {
    position: absolute;
    bottom: 0;
    left: 0;
    right: $scrollbar-width;
    height: $scrollbar-width;
  }
}

// 面板展开/收起动画
.dcj-warehouse-panel {
  transition: width $duration-normal $ease-in-out-smooth;
}

// 响应式布局
@media (max-width: $breakpoint-lg) {
  .dcj-main-page {
    flex-direction: column;
  }
  
  .dcj-warehouse-panel {
    width: 100% !important;
    height: auto;
    max-height: 40vh;
    
    &--collapsed {
      height: 54px;
    }
  }
  
  .dcj-operation-panel {
    flex: 1;
    min-height: 60vh;
  }
}
</style>
