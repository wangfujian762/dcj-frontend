<template>
  <div id="app" class="dcj-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 简化的应用初始化
onMounted(() => {
  // 检查是否有token
  const token = localStorage.getItem('dcj_token')
  
  if (token && router.currentRoute.value.path === '/login') {
    router.push('/')
  } else if (!token && router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
})
</script>

<style lang="scss">
.dcj-app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-bg-primary;
}
</style>
