<template>
  <div class="dcj-api-test">
    <div class="dcj-test-header">
      <h3>🔌 API连接测试</h3>
      <button @click="runTests" :disabled="testing" class="dcj-test-button">
        {{ testing ? '测试中...' : '开始测试' }}
      </button>
    </div>
    
    <div class="dcj-test-results">
      <div 
        v-for="test in testResults"
        :key="test.name"
        :class="[
          'dcj-test-item',
          `dcj-test-item--${test.status}`
        ]"
      >
        <div class="dcj-test-name">{{ test.name }}</div>
        <div class="dcj-test-status">
          <span v-if="test.status === 'pending'">⏳</span>
          <span v-else-if="test.status === 'success'">✅</span>
          <span v-else-if="test.status === 'error'">❌</span>
        </div>
        <div v-if="test.message" class="dcj-test-message">{{ test.message }}</div>
        <div v-if="test.data" class="dcj-test-data">
          <pre>{{ JSON.stringify(test.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiClient } from '@/api/client'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  data?: any
}

const testing = ref(false)
const testResults = ref<TestResult[]>([])

const runTests = async () => {
  testing.value = true
  testResults.value = [
    { name: '健康检查', status: 'pending' },
    { name: '用户注册', status: 'pending' },
    { name: '用户登录', status: 'pending' },
    { name: '获取存档列表', status: 'pending' },
    { name: '创建存档', status: 'pending' }
  ]

  // 测试1: 健康检查
  try {
    const response = await apiClient.get('/health')
    testResults.value[0].status = 'success'
    testResults.value[0].message = '后端服务正常运行'
    testResults.value[0].data = response
  } catch (error: any) {
    testResults.value[0].status = 'error'
    testResults.value[0].message = error.message || '连接失败'
  }

  // 测试2: 用户注册
  try {
    const testUser = {
      username: 'test_' + Date.now(),
      password: 'Test123!@#',
      email: `test_${Date.now()}@example.com`
    }
    
    const response = await apiClient.post('/auth/register', testUser)
    testResults.value[1].status = 'success'
    testResults.value[1].message = '用户注册成功'
    testResults.value[1].data = { userId: response.data?.user?.id }
  } catch (error: any) {
    testResults.value[1].status = 'error'
    testResults.value[1].message = error.message || '注册失败'
  }

  // 测试3: 用户登录
  try {
    const loginData = {
      username: 'testuser',
      password: 'Test123!@#'
    }
    
    const response = await apiClient.post('/auth/login', loginData)
    testResults.value[2].status = 'success'
    testResults.value[2].message = '用户登录成功'
    testResults.value[2].data = { 
      token: response.data?.token ? '***已获取***' : null,
      user: response.data?.user
    }
    
    // 设置token用于后续测试
    if (response.data?.token) {
      apiClient.setAuthToken(response.data.token)
    }
  } catch (error: any) {
    testResults.value[2].status = 'error'
    testResults.value[2].message = error.message || '登录失败'
  }

  // 测试4: 获取存档列表
  try {
    const response = await apiClient.get('/archives')
    testResults.value[3].status = 'success'
    testResults.value[3].message = `获取到 ${response.data?.archives?.length || 0} 个存档`
    testResults.value[3].data = response.data?.archives?.slice(0, 2) // 只显示前2个
  } catch (error: any) {
    testResults.value[3].status = 'error'
    testResults.value[3].message = error.message || '获取存档失败'
  }

  // 测试5: 创建存档
  try {
    const archiveData = {
      archiveNumber: 'TEST' + Date.now(),
      archiveName: '测试存档_' + new Date().toLocaleString()
    }
    
    const response = await apiClient.post('/archives', archiveData)
    testResults.value[4].status = 'success'
    testResults.value[4].message = '存档创建成功'
    testResults.value[4].data = response.data?.archive
  } catch (error: any) {
    testResults.value[4].status = 'error'
    testResults.value[4].message = error.message || '创建存档失败'
  }

  testing.value = false
}

// 页面加载时自动运行测试
runTests()
</script>

<style lang="scss" scoped>
.dcj-api-test {
  padding: $spacing-lg;
  background: $color-bg-secondary;
  border-radius: $border-radius-lg;
  max-width: 800px;
  margin: 0 auto;
}

.dcj-test-header {
  @include flex-between;
  margin-bottom: $spacing-lg;
  
  h3 {
    color: $color-component-primary;
    margin: 0;
  }
}

.dcj-test-button {
  padding: $spacing-sm $spacing-md;
  background: $color-component-primary;
  color: $color-bg-primary;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  font-weight: $font-weight-bold;
  
  &:hover:not(:disabled) {
    background: lighten($color-component-primary, 10%);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.dcj-test-results {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.dcj-test-item {
  padding: $spacing-md;
  background: $color-bg-primary;
  border-radius: $border-radius-sm;
  border-left: 4px solid;
  
  &--pending {
    border-left-color: #ffa500;
  }
  
  &--success {
    border-left-color: #00ff00;
  }
  
  &--error {
    border-left-color: #ff0000;
  }
}

.dcj-test-name {
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin-bottom: $spacing-xs;
}

.dcj-test-status {
  font-size: $font-size-lg;
  margin-bottom: $spacing-xs;
}

.dcj-test-message {
  color: $color-text-secondary;
  font-size: $font-size-sm;
  margin-bottom: $spacing-xs;
}

.dcj-test-data {
  background: rgba(0, 0, 0, 0.2);
  border-radius: $border-radius-sm;
  padding: $spacing-sm;
  
  pre {
    margin: 0;
    font-family: $font-family-mono;
    font-size: $font-size-xs;
    color: $color-component-secondary;
    overflow-x: auto;
  }
}
</style>

