FROM nginx:alpine

# 安装必要的工具
RUN apk add --no-cache curl

# 创建必要的目录
RUN mkdir -p /usr/share/nginx/html/outputs \
    && mkdir -p /usr/share/nginx/html/templates \
    && mkdir -p /usr/share/nginx/html/magazine_cards \
    && chown -R nginx:nginx /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# 复制静态文件
COPY outputs/ /usr/share/nginx/html/outputs/
COPY templates/ /usr/share/nginx/html/templates/
COPY magazine_cards/ /usr/share/nginx/html/magazine_cards/

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 