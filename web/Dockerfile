# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# 安装额外的构建工具
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Ensure public directory exists
RUN mkdir -p public

# 添加调试信息
RUN echo "Building Next.js application..."
RUN ls -la src/pages

# 设置构建环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the app (增加输出)
RUN npm run build
RUN echo "Build completed. Checking output directory:"
RUN ls -la .next/server/pages

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create public directory
RUN mkdir -p public

# Copy only necessary files for production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.js ./next.config.js

# Copy node_modules (only production dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy public directory (if exists)
COPY --from=builder /app/public ./public

# Copy the entire .next directory for simplicity
COPY --from=builder /app/.next ./.next

# Expose Next.js port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"] 