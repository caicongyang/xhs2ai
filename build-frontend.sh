#!/bin/bash

echo "===== 开始构建前端静态文件 ====="

# 进入web目录
cd web || { echo "无法进入web目录"; exit 1; }

# 安装依赖
echo "安装Node.js依赖..."
npm ci

# 构建静态文件
echo "构建Next.js静态文件..."
npm run build

# 检查构建结果
if [ -f "out/index.html" ]; then
    echo "✅ 前端静态文件构建成功！"
    echo "构建文件位置: $(pwd)/out/"
    ls -la out/
else
    echo "❌ 前端静态文件构建失败，请检查错误信息"
    exit 1
fi

# 返回项目根目录
cd ..

echo "现在可以使用以下命令启动服务："
echo "docker-compose up -d" 