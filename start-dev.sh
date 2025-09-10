#!/bin/bash

# DCJ 前端开发服务器启动脚本

echo "🚀 启动DCJ前端开发服务器..."

# 切换到项目目录
cd /home/ubuntu/DCJ-V22/PROJECT/dcj-frontend

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 停止可能运行的服务
pkill -f "vite" 2>/dev/null || true
sleep 2

# 设置环境变量
export HOST=0.0.0.0
export PORT=5173

# 启动开发服务器
echo "🌐 启动服务器 http://0.0.0.0:5173"
npm run dev -- --host 0.0.0.0 --port 5173 --open

