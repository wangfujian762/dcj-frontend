<template>
  <div class="dcj-login-page">
    <div class="dcj-login-container">
      <!-- 标题文案 -->
      <div class="dcj-login-header">
        <h1 class="dcj-login-title">DCJ 任务管理系统</h1>
        <p class="dcj-login-subtitle">高效管理，专注执行</p>
      </div>
      
      <!-- 登录表单 -->
      <form class="dcj-login-form" @submit.prevent="handleLogin">
        <!-- 用户名输入 -->
        <div class="dcj-form-group">
          <label class="dcj-form-label">用户名</label>
          <input
            v-model="loginForm.username"
            type="text"
            class="dcj-form-input"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <!-- 密码输入 -->
        <div class="dcj-form-group">
          <label class="dcj-form-label">密码</label>
          <div class="dcj-password-input">
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="dcj-form-input"
              placeholder="请输入密码"
              required
            />
            <button
              type="button"
              class="dcj-password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </div>
        </div>
        
        <!-- 存档号输入 -->
        <div class="dcj-form-group">
          <label class="dcj-form-label">存档号</label>
          <input
            v-model="loginForm.archiveNumber"
            type="text"
            class="dcj-form-input"
            placeholder="请输入存档号（可选）"
          />
          <p class="dcj-form-help">
            关于存档：存档是您的任务数据容器，您可以创建多个存档来分别管理不同项目或时期的任务。
            如果输入的存档号不存在，登录后将自动创建新存档。
          </p>
        </div>
        
        <!-- 记住登录信息 -->
        <div class="dcj-form-group">
          <label class="dcj-checkbox">
            <input
              v-model="rememberLogin"
              type="checkbox"
              class="dcj-checkbox-input"
            />
            <span class="dcj-checkbox-label">记住登录信息</span>
          </label>
        </div>
        
        <!-- 登录按钮 -->
        <button
          type="submit"
          class="dcj-login-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading">登录中...</span>
          <span v-else>登录</span>
        </button>
        
        <!-- 错误提示 -->
        <div v-if="errorMessage" class="dcj-error-message">
          {{ errorMessage }}
        </div>
        
        <!-- 注册链接 -->
        <div class="dcj-login-footer">
          <span>还没有账号？</span>
          <button type="button" class="dcj-link-button" @click="showRegister = true">
            立即注册
          </button>
        </div>
      </form>
    </div>
    
    <!-- 注册模态框 -->
    <div v-if="showRegister" class="dcj-modal-overlay" @click="showRegister = false">
      <div class="dcj-modal" @click.stop>
        <div class="dcj-modal-header">
          <h2>用户注册</h2>
          <button class="dcj-modal-close" @click="showRegister = false">×</button>
        </div>
        
        <form class="dcj-register-form" @submit.prevent="handleRegister">
          <div class="dcj-form-group">
            <label class="dcj-form-label">用户名</label>
            <input
              v-model="registerForm.username"
              type="text"
              class="dcj-form-input"
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div class="dcj-form-group">
            <label class="dcj-form-label">邮箱</label>
            <input
              v-model="registerForm.email"
              type="email"
              class="dcj-form-input"
              placeholder="请输入邮箱"
              required
            />
          </div>
          
          <div class="dcj-form-group">
            <label class="dcj-form-label">密码</label>
            <input
              v-model="registerForm.password"
              type="password"
              class="dcj-form-input"
              placeholder="请输入密码"
              required
            />
          </div>
          
          <div class="dcj-form-group">
            <label class="dcj-form-label">确认密码</label>
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              class="dcj-form-input"
              placeholder="请再次输入密码"
              required
            />
          </div>
          
          <button
            type="submit"
            class="dcj-login-button"
            :disabled="isRegisterLoading || !isRegisterFormValid"
          >
            <span v-if="isRegisterLoading">注册中...</span>
            <span v-else>注册</span>
          </button>
          
          <div v-if="registerErrorMessage" class="dcj-error-message">
            {{ registerErrorMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 登录表单数据
const loginForm = ref({
  username: '',
  password: '',
  archiveNumber: ''
})

// 注册表单数据
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 状态管理
const isLoading = ref(false)
const isRegisterLoading = ref(false)
const showPassword = ref(false)
const showRegister = ref(false)
const rememberLogin = ref(false)
const errorMessage = ref('')
const registerErrorMessage = ref('')

// 表单验证
const isFormValid = computed(() => {
  return loginForm.value.username.length > 0 && 
         loginForm.value.password.length > 0
})

const isRegisterFormValid = computed(() => {
  return registerForm.value.username.length > 0 &&
         registerForm.value.email.length > 0 &&
         registerForm.value.password.length > 0 &&
         registerForm.value.password === registerForm.value.confirmPassword
})

// 处理登录
const handleLogin = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
      archiveNumber: loginForm.value.archiveNumber || undefined
    })
    
    // 保存登录信息（如果用户选择记住）
    if (rememberLogin.value) {
      localStorage.setItem('dcj_login_info', JSON.stringify({
        username: loginForm.value.username,
        archiveNumber: loginForm.value.archiveNumber
      }))
    }
    
    // 登录成功，跳转到主页面
    router.push('/')
    
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败，请检查用户名和密码'
  } finally {
    isLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!isRegisterFormValid.value) return
  
  isRegisterLoading.value = true
  registerErrorMessage.value = ''
  
  try {
    await authStore.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password
    })
    
    // 注册成功，关闭模态框并显示成功消息
    showRegister.value = false
    alert('注册成功！请使用新账号登录。')
    
    // 自动填充用户名
    loginForm.value.username = registerForm.value.username
    
  } catch (error: any) {
    registerErrorMessage.value = error.message || '注册失败，请重试'
  } finally {
    isRegisterLoading.value = false
  }
}

// 组件挂载时恢复保存的登录信息
onMounted(() => {
  const savedInfo = localStorage.getItem('dcj_login_info')
  if (savedInfo) {
    try {
      const info = JSON.parse(savedInfo)
      loginForm.value.username = info.username || ''
      loginForm.value.archiveNumber = info.archiveNumber || ''
      rememberLogin.value = true
    } catch (error) {
      // 忽略解析错误
    }
  }
})
</script>

<style lang="scss" scoped>
.dcj-login-page {
  @include flex-center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, $color-bg-primary 0%, $color-bg-secondary 100%);
  padding: $spacing-lg;
}

.dcj-login-container {
  width: 100%;
  max-width: 400px;
  background: rgba(12, 95, 130, 0.9);
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $box-shadow-lg;
  backdrop-filter: blur(10px);
}

.dcj-login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  .dcj-login-title {
    font-size: $font-size-xl * 1.5;
    font-weight: $font-weight-bold;
    color: $color-component-primary;
    margin-bottom: $spacing-sm;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .dcj-login-subtitle {
    font-size: $font-size-md;
    color: $color-text-secondary;
  }
}

.dcj-login-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.dcj-form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.dcj-form-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-component-primary;
}

.dcj-form-input {
  height: 40px;
  padding: 0 $spacing-md;
  background: rgba(16, 111, 152, 0.5);
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  color: $color-text-primary;
  font-size: $font-size-md;
  outline: none;
  transition: all $duration-fast $ease-in-out-smooth;
  
  &:focus {
    border-color: $color-component-primary;
    background: rgba(16, 111, 152, 0.8);
    box-shadow: 0 0 0 2px rgba(187, 255, 224, 0.2);
  }
  
  &::placeholder {
    color: $color-text-muted;
  }
}

.dcj-password-input {
  position: relative;
  
  .dcj-form-input {
    padding-right: 60px;
  }
  
  .dcj-password-toggle {
    position: absolute;
    right: $spacing-sm;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: $color-component-primary;
    font-size: $font-size-sm;
    cursor: pointer;
    padding: $spacing-xs;
    
    &:hover {
      color: lighten($color-component-primary, 20%);
    }
  }
}

.dcj-form-help {
  font-size: $font-size-sm;
  color: $color-text-muted;
  line-height: 1.4;
  margin-top: $spacing-xs;
}

.dcj-checkbox {
  @include flex-start;
  gap: $spacing-xs;
  cursor: pointer;
  
  .dcj-checkbox-input {
    width: 16px;
    height: 16px;
    accent-color: $color-component-primary;
  }
  
  .dcj-checkbox-label {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    user-select: none;
  }
}

.dcj-login-button {
  height: 44px;
  background: $color-component-primary;
  color: $color-bg-primary;
  border: none;
  border-radius: $border-radius-md;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  cursor: pointer;
  transition: all $duration-fast $ease-in-out-smooth;
  
  &:hover:not(:disabled) {
    background: lighten($color-component-primary, 10%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(187, 255, 224, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.dcj-error-message {
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: $border-radius-sm;
  color: $color-error;
  font-size: $font-size-sm;
  text-align: center;
}

.dcj-login-footer {
  text-align: center;
  font-size: $font-size-sm;
  color: $color-text-muted;
  
  .dcj-link-button {
    background: none;
    border: none;
    color: $color-component-primary;
    cursor: pointer;
    text-decoration: underline;
    margin-left: $spacing-xs;
    
    &:hover {
      color: lighten($color-component-primary, 20%);
    }
  }
}

// 模态框样式
.dcj-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  @include flex-center;
  z-index: $z-index-modal;
  backdrop-filter: blur(4px);
}

.dcj-modal {
  width: 90%;
  max-width: 400px;
  background: rgba(12, 95, 130, 0.95);
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-lg;
  backdrop-filter: blur(10px);
  animation: modal-appear $duration-normal $ease-in-out-smooth;
}

.dcj-modal-header {
  @include flex-between;
  padding: $spacing-lg $spacing-lg $spacing-md;
  border-bottom: 1px solid $border-color;
  
  h2 {
    font-size: $font-size-lg;
    color: $color-component-primary;
    margin: 0;
  }
  
  .dcj-modal-close {
    width: 32px;
    height: 32px;
    @include flex-center;
    background: none;
    border: none;
    color: $color-text-secondary;
    font-size: 20px;
    cursor: pointer;
    border-radius: 50%;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.dcj-register-form {
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
