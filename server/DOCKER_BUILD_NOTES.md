# 服务器Docker构建注意事项

## 常见问题与解决方案

### 1. PIL/Pillow库缺失问题

**问题描述**：Docker容器运行时提示`ModuleNotFoundError: No module named 'PIL'`错误。

```
ModuleNotFoundError: No module named 'PIL'
Traceback (most recent call last):
  ...
  File "/app/minimaxi_image_generator.py", line 8, in <module>
    from PIL import Image
ModuleNotFoundError: No module named 'PIL'
```

**解决方案**：

1. 在`requirements.txt`中添加Pillow库：
   ```
   pillow==10.0.0
   ```

2. 在Dockerfile中安装必要的系统依赖：
   ```dockerfile
   RUN apt-get update && apt-get install -y --no-install-recommends \
       build-essential \
       libffi-dev \
       # 图像处理相关依赖
       zlib1g-dev \
       libjpeg-dev \
       libpng-dev \
       libtiff-dev \
       libfreetype6-dev \
       libwebp-dev \
       # 清理
       && apt-get clean \
       && rm -rf /var/lib/apt/lists/*
   ```

### 2. src目录结构适配

**问题描述**：重构代码将Python源文件移动到src子目录，需要调整Dockerfile和docker-compose.yml

**解决方案**：

1. 修改Dockerfile，调整文件复制和启动命令：
   ```dockerfile
   # 复制src目录到容器
   COPY src/ ./src/
   
   # 设置Python路径
   ENV PYTHONPATH=/app:$PYTHONPATH
   
   # 修改启动命令
   CMD ["uvicorn", "src.api_service:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. 修改docker-compose.yml中的volumes挂载：
   ```yaml
   volumes:
     - ./server/src:/app/src
     - ./server/.env:/app/.env
     - server_outputs:/app/outputs
     - server_templates:/app/templates
     - server_images:/app/generated_images
     - server_videos:/app/minimaxi_videos
     - server_videos2:/app/videos
   ```

3. 设置环境变量确保Python能找到模块：
   ```yaml
   environment:
     - PYTHONPATH=/app
   ```

### 3. 其他可能的Python依赖问题

如果遇到其他Python依赖模块缺失的问题，记得按照以下步骤处理：

1. 明确识别缺少的Python包
2. 将缺少的包添加到`requirements.txt`
3. 如果该包需要系统级依赖，在Dockerfile中添加相应的`apt-get install`命令
4. 重新构建Docker镜像

## 构建与运行

构建并启动容器：
```bash
docker-compose up -d --build
```

仅重新构建后端服务：
```bash
docker-compose build server
docker-compose up -d server
```

查看服务日志：
```bash
docker-compose logs -f server
``` 