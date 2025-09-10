# DCJ 任务管理系统 - 前端

一个现代化的任务管理系统前端应用，基于 Vue 3 + TypeScript + Vite 构建。

## ✨ 特性

- 🎨 **现代化设计** - 复古终端风格 + 现代交互体验
- ⚡ **高性能** - Vue 3 Composition API + Vite 构建
- 🛡️ **类型安全** - 100% TypeScript 覆盖
- 🎭 **动画效果** - 专业级动画和特效系统
- ⌨️ **快捷键** - 完整的键盘快捷键支持
- 📱 **响应式** - 适配不同屏幕尺寸

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📦 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue.js 官方路由
- **SCSS** - CSS 预处理器

## 🏗️ 项目结构

```
src/
├── components/          # 可复用组件
│   ├── icons/          # 图标组件
│   ├── animations/     # 动画组件
│   └── ...
├── views/              # 页面组件
├── stores/             # Pinia 状态管理
├── api/                # API 服务层
├── composables/        # 组合式 API
├── types/              # TypeScript 类型定义
├── styles/             # 全局样式
└── utils/              # 工具函数
```

## 🔧 配置

### 环境变量

- `VITE_API_BASE_URL` - 后端 API 基础地址
- `VITE_APP_TITLE` - 应用标题
- `VITE_APP_VERSION` - 应用版本

### 构建配置

项目使用 Vite 进行构建，配置文件为 `vite.config.ts`。

## 🚀 部署

### Vercel 部署

项目已配置 Vercel 部署，推送到 Git 仓库后自动部署。

### 手动部署

```bash
# 构建项目
npm run build

# 部署 dist 目录到静态服务器
```

## 📄 许可证

MIT License

