#!/usr/bin/env python
import uvicorn
import os
import argparse

# 添加参数解析
parser = argparse.ArgumentParser(description='启动AI内容生成服务API')
parser.add_argument('--host', type=str, default='0.0.0.0', help='服务器监听地址')
parser.add_argument('--port', type=int, default=8000, help='服务器监听端口')
parser.add_argument('--reload', action='store_true', help='是否启用热重载功能')
parser.add_argument('--workers', type=int, default=1, help='工作进程数量')
parser.add_argument('--log-level', type=str, default='info', help='日志级别')

args = parser.parse_args()

# 确保当前路径正确，方便导入模块
if __name__ == "__main__":
    # 添加当前路径到Python路径
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    print(f"启动AI内容生成服务API服务器:")
    print(f"- 地址: {args.host}")
    print(f"- 端口: {args.port}")
    print(f"- 热重载: {'启用' if args.reload else '禁用'}")
    print(f"- 工作进程: {args.workers}")
    print(f"- 日志级别: {args.log_level}")
    print(f"- 访问API文档: http://{args.host if args.host != '0.0.0.0' else 'localhost'}:{args.port}/docs")
    print(f"- 健康检查: http://{args.host if args.host != '0.0.0.0' else 'localhost'}:{args.port}/health")
    print("按Ctrl+C终止服务器...")
    
    # 启动API服务器
    uvicorn.run(
        "api_service:app", 
        host=args.host, 
        port=args.port, 
        reload=args.reload,
        workers=args.workers,
        log_level=args.log_level
    ) 