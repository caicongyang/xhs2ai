# Docker构建注意事项

## 常见问题与解决方案

### 1. `public` 目录问题

**问题描述**：Docker构建失败，无法找到`/app/public`目录。
```
ERROR [web runner 4/7] COPY --from=builder /app/public ./public  
failed to solve: failed to compute cache key: failed to calculate checksum of ref xxxx: "/app/public": not found
```

**解决方案**：
- 确保`public`目录存在，即使为空
- 在Dockerfile中添加`mkdir -p public`命令
- 添加`.gitkeep`文件到`public`目录，确保git追踪
- 添加基本文件如`favicon.ico`到`public`目录

### 2. 构建优化

对Dockerfile进行了以下优化：

1. 确保目录存在：
   ```
   RUN mkdir -p public
   ```

2. 仅复制必要文件：
   ```
   COPY --from=builder /app/package.json ./package.json
   COPY --from=builder /app/next.config.js ./next.config.js
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   ```

3. 在docker-compose.yml中为public目录添加显式挂载：
   ```
   volumes:
     - ./web/public:/app/public
   ```

## 构建与运行

构建并启动容器：
```bash
docker-compose up -d --build
```

仅重新构建web服务：
```bash
docker-compose build web
docker-compose up -d
``` 