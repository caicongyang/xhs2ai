#!/bin/bash

echo "===== 开始构建后端服务镜像 ====="

# 进入server目录
cd server || { echo "无法进入server目录"; exit 1; }

# 构建Docker镜像
echo "构建xhs2ai-server镜像..."
docker build -t xhs2ai-server:latest .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 后端服务镜像构建成功！"
else
    echo "❌ 后端服务镜像构建失败，请检查错误信息"
    exit 1
fi

# 返回项目根目录
cd ..

echo "现在可以使用以下命令启动服务："
echo "docker-compose up -d" 