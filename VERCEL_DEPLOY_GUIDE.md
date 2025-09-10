# Vercel 部署详细指南

## 📋 用户信息
- **GitHub用户名**: wangfujian762
- **仓库名**: dcj-frontend  
- **Vercel账号**: wangfujian762@gmail.com
- **Vercel用户名**: wangfujian762-9512

## 🚀 部署步骤

### 1. GitHub 仓库创建 ✅
已配置远程仓库: https://github.com/wangfujian762/dcj-frontend.git

### 2. 推送代码到 GitHub
创建 GitHub 仓库后，执行：
```bash
cd /home/ubuntu/DCJ-V22/PROJECT/dcj-frontend
./push-to-github.sh
```

### 3. Vercel 项目导入

#### 3.1 访问 Vercel 控制台
- 打开: https://vercel.com/dashboard
- 使用账号 wangfujian762@gmail.com 登录

#### 3.2 导入项目
1. 点击 **"New Project"**
2. 选择 **"Import Git Repository"**
3. 如果没看到仓库，点击 **"Adjust GitHub App Permissions"**
4. 找到并选择 **"wangfujian762/dcj-frontend"**
5. 点击 **"Import"**

#### 3.3 项目配置
```
Project Name: dcj-frontend
Framework Preset: Vue.js (自动检测)
Root Directory: ./
Build Command: npm run build (自动检测)
Output Directory: dist (自动检测)
Install Command: npm install (自动检测)
```

#### 3.4 环境变量配置
在 "Environment Variables" 部分添加：

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://minstep.cn/api/v1` |
| `VITE_APP_TITLE` | `DCJ 任务管理系统` |
| `VITE_APP_VERSION` | `1.0.0` |

#### 3.5 部署
1. 点击 **"Deploy"**
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后会显示项目地址

## 🔗 预期结果

### 部署地址
- **主域名**: https://dcj-frontend-[random].vercel.app
- **预览地址**: https://dcj-frontend-git-main-wangfujian762.vercel.app

### 自定义域名（可选）
如需自定义域名，在项目设置中添加：
- 建议: `app.minstep.cn` 或 `dcj.minstep.cn`

## 🛠️ 部署后验证

访问以下页面确认功能：

1. **主页**: https://your-domain.vercel.app
   - 应显示登录界面
   - 终端动画效果正常

2. **API测试页**: https://your-domain.vercel.app/api-test
   - API连接状态显示
   - 后端服务响应正常

3. **主应用**: 登录后访问主界面
   - 双面板布局正常
   - 组件交互正常
   - 快捷键功能正常

## 🔧 故障排除

### 构建失败
- 检查构建日志中的错误信息
- 确认所有依赖都在 package.json 中
- 检查 TypeScript 编译错误

### API 请求失败
- 确认后端服务 https://minstep.cn/api/v1 可访问
- 检查 CORS 配置
- 验证环境变量设置

### 页面无法访问
- 检查路由配置
- 确认 vercel.json 配置正确
- 查看 Vercel 函数日志

## 📈 持续部署

每次推送到 main 分支时，Vercel 会自动：
1. 检测代码变更
2. 自动构建项目
3. 部署到生产环境
4. 发送部署通知

## 🎯 性能优化

Vercel 自动提供：
- ✅ CDN 全球加速
- ✅ 自动 HTTPS
- ✅ 图片优化
- ✅ 静态资源缓存
- ✅ 边缘函数支持

## 📊 监控和分析

可在 Vercel 控制台查看：
- 部署历史
- 访问统计
- 性能指标
- 错误日志

