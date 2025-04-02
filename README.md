# XHS2AI - AI内容生成平台

## 项目简介

XHS2AI是一个利用AI模型生成图片、视频、封面和文本内容的综合平台，支持小红书和微信公众号等多平台内容创作。

## Docker部署指南

### 前置要求

- Docker Engine (20.10+)
- Docker Compose (3.8+)
- Git
- Node.js 18+ (仅用于构建前端)

### 快速部署

#### 1. 克隆仓库

```bash
git clone https://github.com/caicongyang/xhs2ai.git
cd xhs2ai
```

#### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑`.env`文件，填入所需的API密钥和配置：

```
# LLM API配置
LLM_API_KEY=your_actual_api_key
LLM_BASE_URL=your_actual_api_base_url

# 其他配置
# ...
```

#### 3. 构建前端静态文件

本项目前端使用Next.js构建，然后导出为纯静态文件，无需运行Node.js服务器。

```bash
# 添加执行权限
chmod +x build-frontend.sh

# 运行构建脚本
./build-frontend.sh
```

构建脚本会在`web/out`目录中生成静态文件，这些文件将通过Docker卷挂载到Nginx容器中。

#### 4. 构建和启动服务

**构建并启动所有服务：**

```bash
# 构建所有服务镜像
docker-compose build

# 启动所有服务
docker-compose up -d
```

**只构建和启动特定服务：**

```bash
# 只构建server服务
docker-compose build server

# 只构建并启动server服务
docker-compose up -d --build server
```

**重新构建并启动所有服务：**

```bash
# 停止现有容器，重新构建并启动
docker-compose down && docker-compose up -d --build
```

**修改代码后重新构建：**

```bash
# 1. 修改前端代码后重新构建静态文件
./build-frontend.sh

# 2. 修改后端代码后重新构建server服务
docker-compose build server
docker-compose up -d server

# 3. 修改Nginx配置后重启nginx服务
docker-compose up -d --no-deps nginx
```

**清除缓存并完全重建：**

```bash
# 停止所有容器，删除所有镜像和卷，然后重新构建
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**查看日志：**

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f server
```

#### 5. 访问应用

- 网页界面: http://localhost:8081
- API文档: http://localhost:8081/api/docs

### 开发环境配置

开发环境支持热重载，便于开发调试：

```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 仅启动前端开发环境
cd web && npm run dev

# 仅启动后端开发环境
docker-compose -f docker-compose.dev.yml up -d server
```

### Docker服务说明

本项目包含以下Docker服务：

| 服务 | 描述 | 暴露端口 |
|-----|------|---------|
| `server` | Python FastAPI后端服务 | 内部8000端口 |
| `nginx` | Nginx网关和反向代理(提供静态前端文件) | 外部8081端口 |

### 数据持久化

项目使用以下数据卷保证数据持久化：

- `server_outputs`: 存储生成的输出文件
- `server_templates`: 存储模板文件
- `server_images`: 存储生成的图片
- `server_videos`: 存储海螺生成的视频
- `server_videos2`: 存储其他视频

### 常见问题与解决方案

#### 前端问题

如果出现前端页面无法访问或样式加载错误：

1. 检查`web/out`目录是否已正确生成静态文件
2. 重新运行`./build-frontend.sh`构建前端
3. 确保Nginx容器能正确访问这些文件

#### 权限问题

如果遇到挂载卷的权限问题，请运行：

```bash
sudo chown -R $(id -u):$(id -g) ./server/outputs ./server/templates
```

#### 端口冲突

如果8081端口已被占用，可在`docker-compose.yml`中修改端口映射：

```yaml
nginx:
  ports:
    - "8080:80"  # 将8081改为其他可用端口
```

#### 重启服务

更新代码或配置后重启服务：

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart server
```

#### 静态资源500错误

如果遇到静态资源加载出现500错误：

1. 检查Nginx配置中的静态资源路径是否正确
2. 确认`web/out`目录是否正确挂载到Nginx容器
3. 重建前端服务：
```bash
./build-frontend.sh
docker-compose restart nginx
```

### 健康检查与监控

查看服务状态：

```bash
docker-compose ps
```

### 性能优化建议

1. 生产环境中为Docker分配足够的CPU和内存资源
2. 可根据访问量适当增加Nginx工作进程数量
3. 考虑对生成的静态资源使用CDN加速

## 系统功能

- **封面生成**：支持小红书封面和微信公众号封面生成
- **内容重写**：AI内容优化和改写
- **标题生成**：生成吸引人的内容标题
- **图片生成**：基于AI模型生成图片
- **视频生成**：支持文本转视频和图片转视频

## 许可证

[MIT License](LICENSE)
