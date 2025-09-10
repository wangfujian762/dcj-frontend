# DCJ 前端 - Vercel 部署指南

## 🚀 Vercel 部署步骤

### 准备工作 ✅

以下文件已经为您准备完成：
- ✅ `vercel.json` - Vercel 部署配置
- ✅ `package.json` - 包含 `vercel-build` 脚本
- ✅ `.gitignore` - Git 忽略规则
- ✅ `README.md` - 项目说明文档

### 部署方法

#### 方法一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /home/ubuntu/DCJ-V22/PROJECT/dcj-frontend
   vercel
   ```

4. **生产部署**
   ```bash
   vercel --prod
   ```

#### 方法二：通过 Git 仓库

1. **推送代码到 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-git-repo-url>
   git push -u origin main
   ```

2. **在 Vercel 控制台导入项目**
   - 访问 https://vercel.com
   - 点击 "New Project"
   - 选择您的 Git 仓库
   - Vercel 会自动检测配置并部署

### 环境变量配置

在 Vercel 控制台中设置以下环境变量：

```
VITE_API_BASE_URL=https://minstep.cn/api/v1
VITE_APP_TITLE=DCJ 任务管理系统
VITE_APP_VERSION=1.0.0
```

### 自定义域名

1. 在 Vercel 项目设置中添加域名
2. 配置 DNS 记录指向 Vercel
3. Vercel 会自动配置 SSL 证书

### 部署后验证

部署完成后，访问以下页面验证功能：

- **主页**: https://your-app.vercel.app
- **登录页**: https://your-app.vercel.app/login
- **API测试**: https://your-app.vercel.app/api-test

### 故障排除

#### 构建失败
- 检查 `package.json` 中的依赖版本
- 确保所有 TypeScript 错误已修复
- 查看 Vercel 构建日志

#### API 请求失败
- 确认后端服务正在运行
- 检查 CORS 配置
- 验证 API 端点地址

#### 路由问题
- 确保 `vercel.json` 中的路由配置正确
- SPA 路由应该重定向到 `index.html`

## 📊 部署状态

- ✅ 项目配置完成
- ✅ 构建测试通过
- ✅ 环境变量配置
- ⏳ 等待部署执行

## 🔗 相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Vue.js 部署指南](https://vuejs.org/guide/best-practices/production-deployment.html)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

