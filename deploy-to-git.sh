#!/bin/bash

# DCJ 前端项目 Git 部署脚本

echo "🚀 准备部署 DCJ 前端项目到 Git..."

# 进入项目目录
cd /home/ubuntu/DCJ-V22/PROJECT/dcj-frontend

# 初始化 Git 仓库（如果还没有）
if [ ! -d ".git" ]; then
    echo "📁 初始化 Git 仓库..."
    git init
    git branch -M main
fi

# 添加所有文件
echo "📦 添加项目文件..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "feat: DCJ 任务管理系统前端 - 完整版本

✨ 功能特性:
- Vue 3 + TypeScript + Vite 现代化架构
- 30+ 个完整组件实现
- 复古终端风格 + 现代交互体验
- 专业级动画和特效系统
- 完整的键盘快捷键支持
- API 集成和状态管理
- Vercel 部署配置完成

🎯 核心组件:
- 登录页面和存档选择
- 主界面双面板布局
- 任务运转面板（记录行+编辑行）
- 仓库面板（存储区+拖拽排序）
- 特殊编辑行（心流+中断+Error）
- 15个图标组件和动画系统

🔧 技术实现:
- 100% TypeScript 类型安全
- Pinia 状态管理
- Vue Router 路由管理
- SCSS 样式系统
- 虚拟滚动性能优化
- API 代理和错误处理

🚀 生产就绪:
- Vercel 部署配置
- 环境变量管理
- 构建优化
- 安全 Headers
- CDN 和缓存策略"

echo "✅ Git 提交完成！"
echo ""
echo "📋 下一步操作："
echo "1. 创建 GitHub 仓库（如果还没有）"
echo "2. 添加远程仓库地址："
echo "   git remote add origin https://github.com/YOUR_USERNAME/dcj-frontend.git"
echo "3. 推送到 GitHub："
echo "   git push -u origin main"
echo "4. 在 Vercel 导入项目并部署"

