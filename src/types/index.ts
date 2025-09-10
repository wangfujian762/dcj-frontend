// DCJ 任务管理系统 - 类型定义

// ==================== 基础类型 ====================

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Archive {
  id: string;
  userId: string;
  archiveName: string;
  archiveNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== 任务相关类型 ====================

export type TaskType = 'single_row' | 'double_row';
export type TaskStatus = 'active' | 'completed' | 'archived';

export interface Task {
  id: string;
  userId: string;
  archiveId: string;
  taskType: TaskType;
  taskName: string;
  description?: string;
  status: TaskStatus;
  primaryTag?: string;
  secondaryTag?: string;
  businessType?: string;
  parentTaskId?: string;
  priority: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  taskId: string;
  recordSequence: number;
  isFocus?: boolean;
  recordText: string;
  recordType: 'start' | 'progress' | 'complete' | 'archive' | 'terminate';
  timeText: string;
  prefixText: string;
  primaryTag?: string;
  secondaryTag?: string;
  businessType?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== 仓库任务类型 ====================

export interface WarehouseTask {
  id: string;
  userId: string;
  taskText: string;
  primaryTag?: string;
  secondaryTag?: string;
  businessType?: string;
  priority: number;
  displayStatus: 'normal' | 'highlighted' | 'dimmed';
  parentTaskId?: string;
  depth: number;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== 标签选项类型 ====================

export interface PrimaryTagOption {
  id: string;
  tagName: string;
  tagIcon: string;
  tagColor: string;
  sortOrder: number;
  isSystemDefault: boolean;
  createdAt: string;
}

export interface SecondaryTagOption {
  id: string;
  tagName: string;
  tagColor: string;
  sortOrder: number;
  parentCategory?: string;
  isSystemDefault: boolean;
  createdAt: string;
}

// ==================== 编辑状态类型 ====================

export type EditState = 
  | 'normal_start'     // 普通启动状态
  | 'creative_start'   // 创造启动状态
  | 'restart_start'    // 重启启动状态
  | 'node'             // 节点状态
  | 'supplement'       // 补充状态
  | 'archive'          // 存档状态
  | 'terminate';       // 终止状态

export interface EditRowState {
  taskId: string;
  currentState: EditState;
  prefixText: string;
  cachedText: string;
  components: {
    textEditEnabled: boolean;
    tagButtonsEnabled: boolean;
    clockEnabled: boolean;
    prefixVisible: boolean;
    focusEnabled: boolean;
    showArchiveOptions: boolean;
    showTimeClock: boolean;
  };
  lastChangeReason: string;
  lastChangeTime: string;
}

// ==================== 特殊编辑行类型 ====================

export type SpecialEditRowType = 'flow' | 'interrupt' | 'error';

export interface SpecialEditRow {
  id: string;
  type: SpecialEditRowType;
  taskId: string;
  prefixText: string;
  businessTypeText: string;
  operationText: string;
  isVisible: boolean;
  isSecondState?: boolean;
  timerStartTime?: string;
  timerRunning?: boolean;
  createdAt: string;
}

// ==================== 组件状态类型 ====================

export interface ComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComponentState {
  isVisible: boolean;
  isEnabled: boolean;
  isExpanded?: boolean;
  isFocused?: boolean;
  isSelected?: boolean;
}

// ==================== UI交互类型 ====================

export interface DropdownOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
  customizable?: boolean;
}

export interface TagSelection {
  primary?: string;
  secondary?: string;
  businessType?: string;
}

export interface ClockDisplay {
  type: 'realtime' | 'timer';
  format: 'HH:mm:ss' | 'XXmin XXs';
  value: string;
  isRunning: boolean;
  color?: string;
}

// ==================== API响应类型 ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  archives?: T[];
  tasks?: T[];
  records?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== 事件类型 ====================

export interface UserAction {
  type: string;
  payload: any;
  timestamp: string;
  userId: string;
}

export interface TaskOperation {
  type: 'create' | 'update' | 'complete' | 'archive' | 'delete';
  taskId: string;
  operationData: any;
  result: any;
}

// ==================== Store状态类型 ====================

export interface AppState {
  user: User | null;
  currentArchive: Archive | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  focusTask: Task | null;
  taskRecords: TaskRecord[];
  editRowState: EditRowState | null;
  specialEditRows: SpecialEditRow[];
}

export interface WarehouseState {
  warehouseTasks: WarehouseTask[];
  selectedTask: WarehouseTask | null;
  expandedTasks: Set<string>;
  isExpanded: boolean;
}

export interface TagState {
  primaryTags: PrimaryTagOption[];
  secondaryTags: SecondaryTagOption[];
  businessTypes: string[];
  selectedTags: TagSelection;
}

// ==================== API 请求类型 ====================

export interface CreateTaskOperationRequest {
  operationType: 'start' | 'progress' | 'complete' | 'archive' | 'terminate';
  taskText: string;
  prefixText?: string;
  primaryTag?: string;
  secondaryTag?: string;
  businessType?: string;
}

// ==================== Vue Ref 类型 ====================

export type Ref<T> = import('vue').Ref<T>
