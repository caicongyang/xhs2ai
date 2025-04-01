# AI 内容生成服务 API

这是一个基于FastAPI的HTTP服务，集成了多种AI内容生成功能，包括图片生成、视频生成、封面设计和内容改写。

## 功能特点

- **图像生成**：支持海螺(MiniMaxi)和Kling两种API的图像生成
- **视频生成**：支持文本到视频、图像到视频的转换
- **封面设计**：支持微信公众号和小红书平台的封面设计
- **内容改写**：支持文本内容改写、标题变体生成和风格化改写
- **异步任务处理**：所有耗时操作都在后台处理，支持任务状态查询
- **完整API文档**：自动生成的交互式API文档

## 安装依赖

```bash
pip install fastapi uvicorn python-dotenv requests pillow pydantic
```

## 环境变量配置

在项目根目录创建`.env`文件，添加以下内容：

```
# LLM API配置（用于封面生成和内容改写）
LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=your_llm_api_base_url

# 海螺API配置
MINIMAXI_API_KEY=your_minimaxi_api_key

# Kling API配置
KLING_API_KEY=your_kling_api_key
```

## 启动服务

```bash
# 基本启动
python start_api_server.py

# 指定端口
python start_api_server.py --port 8080

# 开发模式（自动重载）
python start_api_server.py --reload

# 生产模式（多进程）
python start_api_server.py --workers 4
```

## API 接口说明

### 图像生成

- `POST /api/minimaxi/images/generate` - 使用海螺API生成图像
- `POST /api/kling/images/generate` - 使用Kling API生成图像

### 视频生成

- `POST /api/minimaxi/videos/generate` - 使用海螺API生成视频
- `POST /api/kling/videos/text-to-video` - 使用Kling API从文本生成视频
- `POST /api/kling/videos/image-to-video` - 使用Kling API从图像生成视频

### 封面生成

- `POST /api/covers/wechat` - 生成微信公众号封面
- `POST /api/covers/xiaohongshu` - 生成小红书封面

### 内容改写

- `POST /api/rewrite/content` - 改写内容
- `POST /api/rewrite/title` - 生成标题变体
- `POST /api/rewrite/style` - 风格化内容改写

### 其他接口

- `GET /api/tasks/{task_id}` - 查询任务状态
- `GET /api/files/{file_path}` - 获取生成的文件
- `GET /api/covers/styles` - 获取可用的封面风格
- `GET /api/images/options` - 获取图像生成选项
- `GET /health` - 健康检查
- `GET /docs` - API文档

## 使用示例

### 1. 生成图像

```bash
curl -X 'POST' \
  'http://localhost:8000/api/minimaxi/images/generate' \
  -H 'Content-Type: application/json' \
  -d '{
  "prompt": "一只可爱的小猫在向日葵旁边，阳光明媚，高清写实风格",
  "model": "sd-xl",
  "style": "realistic",
  "size": "1024x1024",
  "num_images": 1
}'
```

### 2. 生成小红书封面

```bash
curl -X 'POST' \
  'http://localhost:8000/api/covers/xiaohongshu' \
  -H 'Content-Type: application/json' \
  -d '{
  "content": "分享10个提高工作效率的实用技巧，让你的工作更轻松！",
  "account_name": "效率研究所",
  "slogan": "让工作更高效",
  "style": "soft_tech"
}'
```

### 3. 改写内容

```bash
curl -X 'POST' \
  'http://localhost:8000/api/rewrite/content' \
  -H 'Content-Type: application/json' \
  -d '{
  "content": "人工智能正在快速发展，影响了我们的生活方式。",
  "language": "zh",
  "tone": "professional"
}'
```

## 更多信息

访问 `http://localhost:8000/docs` 查看完整的API文档和请求示例。 