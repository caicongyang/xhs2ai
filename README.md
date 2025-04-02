# XHS2AI - AI内容生成平台

## 项目简介

XHS2AI是一个利用AI模型生成图片、视频、封面和文本内容的综合平台，支持小红书和微信公众号等多平台内容创作。

## Docker部署指南

### 前置要求

- Docker Engine (20.10+)
- Docker Compose (3.8+)
- Git

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

#### 3. 启动服务

```bash
# 启动所有服务（前端、后端和Nginx）
docker-compose up -d
```

这个命令会同时：
- 构建并启动前端Node.js开发服务器（自动热更新）
- 构建并启动后端FastAPI服务
- 启动Nginx服务，提供API代理和统一访问入口

**查看日志：**

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web
docker-compose logs -f server
```

#### 4. 访问应用

- 前端界面: http://localhost:8081
- API文档: http://localhost:8081/api/docs

#### 5. 更新应用

当需要更新应用时，只需拉取最新代码并重启服务：

```bash
# 拉取最新代码
git pull

# 重新构建并启动所有服务
docker-compose up -d --build
```

### Docker服务说明

本项目包含以下Docker服务：

| 服务 | 描述 | 暴露端口 |
|-----|------|---------|
| `web` | Next.js前端开发服务 | 内部3000端口 |
| `server` | Python FastAPI后端服务 | 内部8000端口 |
| `nginx` | Nginx网关和反向代理 | 外部8081端口 |

### 数据持久化

项目使用以下数据卷保证数据持久化：

- `server_outputs`: 存储生成的输出文件
- `server_templates`: 存储模板文件
- `server_images`: 存储生成的图片
- `server_videos`: 存储海螺生成的视频
- `server_videos2`: 存储其他视频

### 工作原理

项目采用前后端分离架构：

1. **前端开发服务**:
   - Node.js运行Next.js开发服务器
   - 支持热更新和实时预览

2. **后端服务**:
   - Python FastAPI提供API接口
   - 处理AI内容生成请求

3. **Nginx代理**:
   - 将前端请求代理到`web`服务
   - 将API请求代理到`server`服务
   - 提供统一的访问入口

### 常见问题与解决方案

#### 服务启动问题

如果服务启动失败，可以查看日志：
```bash
docker-compose logs -f
```

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

### 开发方式

使用此部署方式，前端代码修改会自动热重载，无需手动构建：

1. 修改`web`目录中的前端代码
2. 保存文件后，Next.js开发服务器会自动重新编译
3. 刷新浏览器即可查看更改

后端代码修改后，需要重新构建：

```bash
# 重建并启动后端服务
docker-compose up -d --build server
```

### 系统功能

- **封面生成**：支持小红书封面和微信公众号封面生成
- **内容重写**：AI内容优化和改写
- **标题生成**：生成吸引人的内容标题
- **图片生成**：基于AI模型生成图片
- **视频生成**：支持文本转视频和图片转视频

## 许可证

[MIT License](LICENSE)
