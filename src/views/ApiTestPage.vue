<template>
  <div class="dcj-api-test-page">
    <div class="dcj-page-header">
      <h1>🔧 DCJ API 连接测试</h1>
      <p>验证前端与后端API的连接状态和功能完整性</p>
    </div>
    
    <!-- API测试组件 -->
    <ApiTest />
    
    <!-- 连接信息 -->
    <div class="dcj-connection-info">
      <h3>📡 连接配置信息</h3>
      <div class="dcj-info-grid">
        <div class="dcj-info-item">
          <label>前端地址:</label>
          <span>{{ frontendUrl }}</span>
        </div>
        <div class="dcj-info-item">
          <label>后端API:</label>
          <span>{{ apiBaseUrl }}</span>
        </div>
        <div class="dcj-info-item">
          <label>代理配置:</label>
          <span>Vite Proxy: /api → {{ proxyTarget }}</span>
        </div>
        <div class="dcj-info-item">
          <label>环境:</label>
          <span>{{ isDev ? '开发环境' : '生产环境' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="dcj-quick-actions">
      <h3>⚡ 快速操作</h3>
      <div class="dcj-action-buttons">
        <button @click="goToLogin" class="dcj-action-button">
          🔐 前往登录页面
        </button>
        <button @click="goToMain" class="dcj-action-button">
          🏠 前往主界面
        </button>
        <button @click="checkBackendStatus" class="dcj-action-button">
          🔍 检查后端状态
        </button>
        <button @click="openApiDocs" class="dcj-action-button">
          📚 API文档
        </button>
      </div>
    </div>
    
    <!-- 状态显示 -->
    <div v-if="backendStatus" class="dcj-backend-status">
      <h3>🖥️ 后端服务状态</h3>
      <div class="dcj-status-grid">
        <div class="dcj-status-item">
          <label>服务状态:</label>
          <span :class="backendStatus.healthy ? 'status-good' : 'status-error'">
            {{ backendStatus.healthy ? '✅ 正常' : '❌ 异常' }}
          </span>
        </div>
        <div class="dcj-status-item">
          <label>响应时间:</label>
          <span>{{ backendStatus.responseTime }}ms</span>
        </div>
        <div class="dcj-status-item">
          <label>服务版本:</label>
          <span>{{ backendStatus.version || 'v1.0.0' }}</span>
        </div>
        <div class="dcj-status-item">
          <label>数据库:</label>
          <span :class="backendStatus.database ? 'status-good' : 'status-error'">
            {{ backendStatus.database ? '✅ 连接正常' : '❌ 连接异常' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ApiTest from '@/components/ApiTest.vue'
import { apiClient } from '@/api/client'

const router = useRouter()
const backendStatus = ref<any>(null)

const frontendUrl = computed(() => {
  return `${window.location.protocol}//${window.location.host}`
})

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL || '/api/v1'
})

const proxyTarget = computed(() => {
  return 'http://129.226.130.92:3000'
})

const isDev = computed(() => {
  return import.meta.env.DEV
})

const goToLogin = () => {
  router.push('/login')
}

const goToMain = () => {
  router.push('/')
}

const checkBackendStatus = async () => {
  const startTime = Date.now()
  
  try {
    const response = await apiClient.get('/health')
    const endTime = Date.now()
    
    backendStatus.value = {
      healthy: true,
      responseTime: endTime - startTime,
      version: response.data?.version,
      database: response.data?.database === 'connected',
      timestamp: new Date().toLocaleString()
    }
  } catch (error) {
    const endTime = Date.now()
    
    backendStatus.value = {
      healthy: false,
      responseTime: endTime - startTime,
      error: error.message,
      database: false,
      timestamp: new Date().toLocaleString()
    }
  }
}

const openApiDocs = () => {
  window.open('http://129.226.130.92:3000/api-docs', '_blank')
}

onMounted(() => {
  checkBackendStatus()
})
</script>

<style lang="scss" scoped>
.dcj-api-test-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding: $spacing-xl;
}

.dcj-page-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  h1 {
    color: $color-component-primary;
    margin-bottom: $spacing-sm;
  }
  
  p {
    color: $color-text-secondary;
    font-size: $font-size-md;
  }
}

.dcj-connection-info,
.dcj-quick-actions,
.dcj-backend-status {
  background: $color-bg-secondary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-xl;
  
  h3 {
    color: $color-component-primary;
    margin-bottom: $spacing-md;
  }
}

.dcj-info-grid,
.dcj-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-md;
}

.dcj-info-item,
.dcj-status-item {
  @include flex-between;
  padding: $spacing-sm;
  background: $color-bg-primary;
  border-radius: $border-radius-sm;
  
  label {
    font-weight: $font-weight-bold;
    color: $color-text-primary;
  }
  
  span {
    color: $color-text-secondary;
    font-family: $font-family-mono;
    font-size: $font-size-sm;
  }
}

.dcj-action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.dcj-action-button {
  padding: $spacing-sm $spacing-md;
  background: $color-component-tertiary;
  color: $color-bg-primary;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  font-weight: $font-weight-bold;
  transition: all $duration-fast $ease-in-out-smooth;
  
  &:hover {
    background: $color-component-primary;
    transform: translateY(-2px);
  }
}

.status-good {
  color: #00ff00 !important;
}

.status-error {
  color: #ff0000 !important;
}
</style>

