<template>
  <div class="dcj-login-page">
    <div class="dcj-login-container">
      <!-- 标题 -->
      <div class="dcj-login-header">
        <h1 class="dcj-login-title">DCJ 任务管理系统</h1>
        <p class="dcj-login-subtitle">高效管理，专注执行</p>
      </div>
      
      <!-- 登录表单 -->
      <form class="dcj-login-form" @submit.prevent="handleLogin">
        <div class="dcj-form-group">
          <label>用户名</label>
          <input
            v-model="loginForm.username"
            type="text"
            class="dcj-form-input"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="dcj-form-group">
          <label>密码</label>
          <div class="dcj-password-group">
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
        
        <div class="dcj-form-group">
          <label>存档号（可选）</label>
          <input
            v-model="loginForm.archiveNumber"
            type="text"
            class="dcj-form-input"
            placeholder="请输入存档号"
          />
          <p class="dcj-form-help">
            关于存档：存档是您的任务数据容器。如果输入的存档号不存在，登录后将自动创建新存档。
          </p>
        </div>
        
        <button
          type="submit"
          class="dcj-login-button"
          :disabled="isLoading || !isFormValid"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        
        <div v-if="errorMessage" class="dcj-error-message">
          {{ errorMessage }}
        </div>
        
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
            <label>用户名</label>
            <input
              v-model="registerForm.username"
              type="text"
              class="dcj-form-input"
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div class="dcj-form-group">
            <label>邮箱</label>
            <input
              v-model="registerForm.email"
              type="email"
              class="dcj-form-input"
              placeholder="请输入邮箱"
              required
            />
          </div>
          
          <div class="dcj-form-group">
            <label>密码</label>
            <input
              v-model="registerForm.password"
              type="password"
              class="dcj-form-input"
              placeholder="请输入密码"
              required
            />
          </div>
          
          <button
            type="submit"
            class="dcj-login-button"
            :disabled="isRegisterLoading || !isRegisterFormValid"
          >
            {{ isRegisterLoading ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单数据
const loginForm = ref({
  username: '',
  password: '',
  archiveNumber: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: ''
})

// 状态
const isLoading = ref(false)
const isRegisterLoading = ref(false)
const showPassword = ref(false)
const showRegister = ref(false)
const errorMessage = ref('')

// 验证
const isFormValid = computed(() => {
  return loginForm.value.username.length > 0 && 
         loginForm.value.password.length > 0
})

const isRegisterFormValid = computed(() => {
  return registerForm.value.username.length > 0 &&
         registerForm.value.email.length > 0 &&
         registerForm.value.password.length > 0
})

// 登录处理
const handleLogin = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存token（模拟）
    localStorage.setItem('dcj_token', 'demo_token_' + Date.now())
    
    // 跳转到主页面
    router.push('/')
    
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败'
  } finally {
    isLoading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  if (!isRegisterFormValid.value) return
  
  isRegisterLoading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 注册成功
    showRegister.value = false
    alert('注册成功！请使用新账号登录。')
    
    // 自动填充用户名
    loginForm.value.username = registerForm.value.username
    
  } catch (error: any) {
    console.error('注册失败:', error)
  } finally {
    isRegisterLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.dcj-login-page {
  @include flex-center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, $color-bg-primary 0%, $color-bg-secondary 100%);
}

.dcj-login-container {
  width: 400px;
  background: rgba(12, 95, 130, 0.9);
  border: 1px solid rgba(187, 255, 224, 0.2);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.dcj-login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .dcj-login-title {
    font-size: 28px;
    font-weight: 700;
    color: rgb(187, 255, 224);
    margin-bottom: 8px;
  }
  
  .dcj-login-subtitle {
    color: rgb(211, 211, 211);
    font-size: 16px;
  }
}

.dcj-login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dcj-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  label {
    font-size: 14px;
    font-weight: 500;
    color: rgb(187, 255, 224);
  }
}

.dcj-form-input {
  height: 40px;
  padding: 0 16px;
  background: rgba(16, 111, 152, 0.5);
  border: 1px solid rgba(187, 255, 224, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: rgb(187, 255, 224);
    background: rgba(16, 111, 152, 0.8);
  }
  
  &::placeholder {
    color: rgb(128, 128, 128);
  }
}

.dcj-password-group {
  position: relative;
  
  .dcj-form-input {
    padding-right: 60px;
  }
  
  .dcj-password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgb(187, 255, 224);
    font-size: 12px;
    cursor: pointer;
  }
}

.dcj-form-help {
  font-size: 12px;
  color: rgb(128, 128, 128);
  line-height: 1.4;
  margin-top: 4px;
}

.dcj-login-button {
  height: 44px;
  background: rgb(187, 255, 224);
  color: rgb(8, 79, 108);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgb(207, 255, 244);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dcj-error-message {
  padding: 12px;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 4px;
  color: rgb(255, 0, 0);
  font-size: 14px;
  text-align: center;
}

.dcj-login-footer {
  text-align: center;
  font-size: 14px;
  color: rgb(128, 128, 128);
  
  .dcj-link-button {
    background: none;
    border: none;
    color: rgb(187, 255, 224);
    cursor: pointer;
    text-decoration: underline;
    margin-left: 8px;
  }
}

.dcj-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  @include flex-center;
  z-index: 1000;
}

.dcj-modal {
  width: 400px;
  background: rgba(12, 95, 130, 0.95);
  border: 1px solid rgba(187, 255, 224, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.dcj-modal-header {
  @include flex-between;
  padding: 20px;
  border-bottom: 1px solid rgba(187, 255, 224, 0.2);
  
  h2 {
    font-size: 18px;
    color: rgb(187, 255, 224);
    margin: 0;
  }
  
  .dcj-modal-close {
    width: 24px;
    height: 24px;
    @include flex-center;
    background: none;
    border: none;
    color: rgb(211, 211, 211);
    font-size: 16px;
    cursor: pointer;
    border-radius: 50%;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.dcj-register-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

