# 使用较新的Node.js版本
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装额外的构建工具
RUN apk add --no-cache libc6-compat python3 make g++

# 设置构建环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 确保目录存在
RUN mkdir -p public
RUN mkdir -p out

# 输出版本信息用于调试
RUN echo "Node version:" && node -v
RUN echo "NPM version:" && npm -v

# 复制源代码
COPY . . 