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

#### 3. 分步构建

我们采用了构建与部署分离的方式，使流程更加可控和稳定。

**构建前端静态文件：**

```bash
# 添加执行权限
chmod +x build-frontend.sh

# 构建前端静态文件
./build-frontend.sh
```

**构建后端服务镜像：**

```bash
# 添加执行权限
chmod +x build-server.sh

# 构建后端服务镜像
./build-server.sh
```

#### 4. 启动服务

构建完成后，使用以下命令启动服务：

```bash
docker-compose up -d
```

这个命令会启动：
- 使用预构建的后端服务镜像
- Nginx服务，提供前端静态文件和代理API请求

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

### 更新应用

当需要更新应用时，只需重新构建对应部分：

**更新前端：**

```bash
# 构建前端静态文件
./build-frontend.sh

# 重启Nginx服务
docker-compose restart nginx
```

**更新后端：**

```bash
# 构建后端服务镜像
./build-server.sh

# 重启服务
docker-compose up -d server
```

### Docker服务说明

本项目包含以下Docker服务：

| 服务 | 描述 | 暴露端口 |
|-----|------|---------|
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

1. **前端构建流程**:
   - 通过`build-frontend.sh`脚本在本地构建静态HTML/CSS/JS文件
   - 构建结果保存在`web/out`目录中

2. **后端构建流程**:
   - 通过`build-server.sh`脚本构建Docker镜像
   - 镜像名称为`xhs2ai-server:latest`

3. **静态文件服务**:
   - Nginx容器直接挂载本地的`web/out`目录
   - 所有前端资源都由Nginx提供服务

4. **API请求处理**:
   - 浏览器中的前端应用向`/api`路径发送请求
   - Nginx服务将这些请求代理到`server`服务
   - `server`服务处理API请求并返回结果

### 常见问题与解决方案

#### 前端构建问题

如果前端构建失败：
```bash
# 检查Node.js版本
node -v  # 应该是v18+

# 手动构建查看详细错误
cd web
npm ci
npm run build
```

#### 后端构建问题

如果后端镜像构建失败：
```bash
# 检查Docker是否正常运行
docker info

# 手动构建查看详细错误
cd server
docker build -t xhs2ai-server:latest .
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
