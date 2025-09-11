#!/bin/bash

echo "🚀 推送 DCJ 前端项目到 GitHub..."

cd /home/ubuntu/DCJ-V22/PROJECT/dcj-frontend

echo "📡 推送到 GitHub 仓库..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ 代码推送成功！"
    echo ""
    echo "🔗 GitHub 仓库地址:"
    echo "   https://github.com/wangfujian762/dcj-frontend"
    echo ""
    echo "📋 下一步："
    echo "1. 访问 https://vercel.com"
    echo "2. 点击 'New Project'"
    echo "3. 选择 'Import Git Repository'"
    echo "4. 选择 wangfujian762/dcj-frontend"
    echo "5. 配置环境变量并部署"
    echo ""
    echo "🎯 项目将自动部署到:"
    echo "   https://dcj-frontend-[random].vercel.app"
else
    echo "❌ 推送失败，请检查："
    echo "1. GitHub 仓库是否已创建"
    echo "2. 网络连接是否正常"
    echo "3. Git 配置是否正确"
fi


