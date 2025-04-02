from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import os
import uuid
import shutil
from enum import Enum
import logging
import json
import time
from datetime import datetime

# 导入各个功能模块
from minimaxi_image_generator import MiniMaxiImageGenerator, ImageModel, ImageSize, ImageStyle, ImageFormat
from minimaxi_video_generator import MiniMaxiVideoGenerator, VideoQuality, VideoFormat, VideoContentType
from keling_video_generator import VideoGenerator as KlingVideoGenerator
from keling_image_generator import ImageGenerator as KlingImageGenerator, ImageStyle as KlingImageStyle, ImageRatio
from cover_generator import CoverGenerator, CoverStyle
from url_content_rewriter import UrlContentRewriter
from title_rewriter import TitleRewriter
from content_style_rewriter import ContentStyleRewriter

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI 内容生成服务",
    description="提供图片生成、视频生成、封面生成、内容改写等功能",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建输出目录
os.makedirs("outputs", exist_ok=True)

# 任务状态存储
task_storage = {}

class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Task(BaseModel):
    task_id: str
    status: TaskStatus
    created_at: str
    completed_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# API请求模型
class MiniMaxiImageRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    model: str = "sd-xl"
    style: Optional[str] = None
    size: str = "1024x1024"
    format: str = "png"
    width: Optional[int] = None
    height: Optional[int] = None
    guidance_scale: Optional[float] = None
    num_images: int = 1
    seed: Optional[int] = None
    reference_images: Optional[List[str]] = None

class KlingImageRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    ratio: str = "1:1"
    style: Optional[str] = None
    steps: int = 25
    seed: Optional[int] = None
    model: str = "kling-xi"
    guidance_scale: float = 7.0

class MiniMaxiVideoRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    images: Optional[List[str]] = None
    duration: Optional[int] = None
    content_type: Optional[str] = None
    quality: str = "standard"
    format: str = "mp4"
    seed: Optional[int] = None

class KlingVideoFromTextRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    duration: int = 3
    width: int = 512
    height: int = 512
    fps: int = 24
    guidance_scale: float = 7.0
    num_inference_steps: int = 50
    seed: Optional[int] = None
    model: str = "kling-svd"
    style: Optional[str] = None
    output_format: str = "mp4"
    quality: str = "medium"

class KlingVideoFromImageRequest(BaseModel):
    image_url: str
    prompt: Optional[str] = None
    negative_prompt: Optional[str] = None
    duration: int = 3
    fps: int = 24
    motion_bucket_id: int = 127
    guidance_scale: float = 7.0
    num_inference_steps: int = 50
    seed: Optional[int] = None
    model: str = "kling-i2v"
    output_format: str = "mp4"
    quality: str = "medium"

class WechatCoverRequest(BaseModel):
    title: str
    emoji_url: Optional[str] = None
    style: str = "default"

class XiaohongshuCoverRequest(BaseModel):
    content: str
    account_name: str
    slogan: Optional[str] = None
    style: str = "default"

class ContentRewriteRequest(BaseModel):
    content: str
    tone: Optional[str] = None
    length: Optional[str] = None

class TitleRewriteRequest(BaseModel):
    title: str
    style: Optional[str] = None

class ContentStyleRewriteRequest(BaseModel):
    content: str
    style: str

class UrlContentRewriteRequest(BaseModel):
    url: str = Field(description="需要重写的文章URL")

# 实例化各个生成器
minimaxi_image_generator = MiniMaxiImageGenerator()
minimaxi_video_generator = MiniMaxiVideoGenerator()
kling_image_generator = KlingImageGenerator()
kling_video_generator = KlingVideoGenerator()
cover_generator = CoverGenerator()
url_content_rewriter = UrlContentRewriter()
title_rewriter = TitleRewriter()
content_style_rewriter = ContentStyleRewriter()

# 辅助函数
def generate_task_id():
    return str(uuid.uuid4())

def store_task(task_id: str, status: TaskStatus = TaskStatus.PENDING):
    task = Task(
        task_id=task_id,
        status=status,
        created_at=datetime.now().isoformat()
    )
    task_storage[task_id] = task
    return task

def update_task_status(task_id: str, status: TaskStatus, result=None, error=None):
    if task_id in task_storage:
        task = task_storage[task_id]
        task.status = status
        if status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
            task.completed_at = datetime.now().isoformat()
        if result:
            task.result = result
        if error:
            task.error = error
        task_storage[task_id] = task
        return task
    return None

# 海螺图像生成API
@app.post("/api/minimaxi/images/generate", response_model=Dict[str, str])
async def generate_minimaxi_image(request: MiniMaxiImageRequest, background_tasks: BackgroundTasks):
    """生成图像（使用海螺API）"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            result = minimaxi_image_generator.generate_image(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                model=request.model,
                style=request.style,
                size=request.size,
                format=request.format,
                width=request.width,
                height=request.height,
                guidance_scale=request.guidance_scale,
                num_images=request.num_images,
                seed=request.seed,
                reference_images=request.reference_images
            )
            
            if "error" in result:
                update_task_status(task_id, TaskStatus.FAILED, error=result["error"])
                return
                
            if "task_id" in result:
                # 异步任务，需要等待结果
                try:
                    generation_result = minimaxi_image_generator.wait_for_result(result["task_id"])
                    if "images" in generation_result:
                        # 下载图像
                        image_paths = minimaxi_image_generator.download_all_images(
                            generation_result, 
                            prefix=f"minimaxi_{task_id}"
                        )
                        
                        # 构建结果
                        images_info = []
                        for i, path in enumerate(image_paths):
                            # 获取相对路径
                            rel_path = os.path.relpath(path)
                            images_info.append({
                                "index": i,
                                "url": generation_result["images"][i].get("url", ""),
                                "local_path": rel_path
                            })
                            
                        update_task_status(
                            task_id, 
                            TaskStatus.COMPLETED, 
                            result={"images": images_info}
                        )
                    else:
                        update_task_status(
                            task_id, 
                            TaskStatus.FAILED, 
                            error="No images in generation result"
                        )
                except Exception as e:
                    update_task_status(task_id, TaskStatus.FAILED, error=str(e))
            else:
                update_task_status(task_id, TaskStatus.FAILED, error="Failed to submit task")
        except Exception as e:
            logger.error(f"Error processing image generation task: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

# Kling图像生成API
@app.post("/api/kling/images/generate", response_model=Dict[str, str])
async def generate_kling_image(request: KlingImageRequest, background_tasks: BackgroundTasks):
    """生成图像（使用Kling API）"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            result = kling_image_generator.generate_image(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                ratio=request.ratio,
                style=request.style,
                steps=request.steps,
                seed=request.seed,
                model=request.model,
                guidance_scale=request.guidance_scale
            )
            
            if "error" in result:
                update_task_status(task_id, TaskStatus.FAILED, error=result["error"])
                return
                
            # Kling API返回直接结果
            if "url" in result:
                # 下载图像
                output_path = os.path.join(kling_image_generator.output_dir, f"kling_{task_id}.png")
                local_path = kling_image_generator._save_image_from_url(result["url"], request.prompt)
                
                update_task_status(
                    task_id, 
                    TaskStatus.COMPLETED, 
                    result={
                        "url": result["url"],
                        "local_path": os.path.relpath(local_path)
                    }
                )
            else:
                update_task_status(task_id, TaskStatus.FAILED, error="No URL in result")
        except Exception as e:
            logger.error(f"Error processing image generation task: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

# 海螺视频生成API
@app.post("/api/minimaxi/videos/generate", response_model=Dict[str, str])
async def generate_minimaxi_video(request: MiniMaxiVideoRequest, background_tasks: BackgroundTasks):
    """生成视频（使用海螺API）"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            result = minimaxi_video_generator.generate_video(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                images=request.images,
                duration=request.duration,
                content_type=request.content_type,
                quality=request.quality,
                format=request.format,
                seed=request.seed
            )
            
            if "error" in result:
                update_task_status(task_id, TaskStatus.FAILED, error=result["error"])
                return
                
            if "task_id" in result:
                # 异步任务，需要等待结果
                try:
                    video_result = minimaxi_video_generator.wait_for_result(result["task_id"])
                    if "video_url" in video_result:
                        # 下载视频
                        output_path = os.path.join(
                            minimaxi_video_generator.output_dir, 
                            f"minimaxi_video_{task_id}.{request.format}"
                        )
                        video_path = minimaxi_video_generator.download_video(video_result["video_url"], output_path)
                        
                        update_task_status(
                            task_id, 
                            TaskStatus.COMPLETED, 
                            result={
                                "video_url": video_result["video_url"],
                                "local_path": os.path.relpath(video_path)
                            }
                        )
                    else:
                        update_task_status(
                            task_id, 
                            TaskStatus.FAILED, 
                            error="No video URL in result"
                        )
                except Exception as e:
                    update_task_status(task_id, TaskStatus.FAILED, error=str(e))
            else:
                update_task_status(task_id, TaskStatus.FAILED, error="Failed to submit task")
        except Exception as e:
            logger.error(f"Error processing video generation task: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

# Kling文本到视频API
@app.post("/api/kling/videos/text-to-video", response_model=Dict[str, str])
async def generate_kling_text_to_video(request: KlingVideoFromTextRequest, background_tasks: BackgroundTasks):
    """生成视频（使用Kling API从文本）"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            result = kling_video_generator.generate_video_from_text(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                duration=request.duration,
                width=request.width,
                height=request.height,
                fps=request.fps,
                guidance_scale=request.guidance_scale,
                num_inference_steps=request.num_inference_steps,
                seed=request.seed,
                model=request.model,
                style=request.style,
                output_format=request.output_format,
                quality=request.quality
            )
            
            # 等待结果
            try:
                video_result = kling_video_generator.wait_for_result(result.task_id)
                if kling_video_generator.is_generation_completed(result.task_id):
                    # 下载视频
                    output_path = os.path.join(
                        kling_video_generator.output_dir, 
                        f"kling_t2v_{task_id}.{request.output_format}"
                    )
                    video_path = kling_video_generator.download_video(video_result.video_url, output_path)
                    
                    update_task_status(
                        task_id, 
                        TaskStatus.COMPLETED, 
                        result={
                            "video_url": video_result.video_url,
                            "local_path": os.path.relpath(video_path)
                        }
                    )
                else:
                    update_task_status(
                        task_id, 
                        TaskStatus.FAILED, 
                        error=f"Task failed with status: {video_result.status}"
                    )
            except Exception as e:
                update_task_status(task_id, TaskStatus.FAILED, error=str(e))
        except Exception as e:
            logger.error(f"Error processing text-to-video task: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

# Kling图像到视频API
@app.post("/api/kling/videos/image-to-video", response_model=Dict[str, str])
async def generate_kling_image_to_video(request: KlingVideoFromImageRequest, background_tasks: BackgroundTasks):
    """生成视频（使用Kling API从图像）"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            result = kling_video_generator.generate_video_from_image(
                image_url=request.image_url,
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                duration=request.duration,
                fps=request.fps,
                motion_bucket_id=request.motion_bucket_id,
                guidance_scale=request.guidance_scale,
                num_inference_steps=request.num_inference_steps,
                seed=request.seed,
                model=request.model,
                output_format=request.output_format,
                quality=request.quality
            )
            
            # 等待结果
            try:
                video_result = kling_video_generator.wait_for_result(result.task_id)
                if kling_video_generator.is_generation_completed(result.task_id):
                    # 下载视频
                    output_path = os.path.join(
                        kling_video_generator.output_dir, 
                        f"kling_i2v_{task_id}.{request.output_format}"
                    )
                    video_path = kling_video_generator.download_video(video_result.video_url, output_path)
                    
                    update_task_status(
                        task_id, 
                        TaskStatus.COMPLETED, 
                        result={
                            "video_url": video_result.video_url,
                            "local_path": os.path.relpath(video_path)
                        }
                    )
                else:
                    update_task_status(
                        task_id, 
                        TaskStatus.FAILED, 
                        error=f"Task failed with status: {video_result.status}"
                    )
            except Exception as e:
                update_task_status(task_id, TaskStatus.FAILED, error=str(e))
        except Exception as e:
            logger.error(f"Error processing image-to-video task: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

# 微信公众号封面生成API
@app.post("/api/covers/wechat", response_model=Dict[str, str])
async def generate_wechat_cover(request: WechatCoverRequest, background_tasks: BackgroundTasks):
    """生成微信公众号封面HTML"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            html_file = cover_generator.generate_wechat_cover(
                title=request.title,
                emoji_url=request.emoji_url,
                style=request.style
            )
            
            update_task_status(
                task_id, 
                TaskStatus.COMPLETED, 
                result={
                    "html_file": html_file,
                    "local_path": os.path.relpath(html_file)
                }
            )
        except Exception as e:
            logger.error(f"Error generating WeChat cover: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

# 小红书封面生成API
@app.post("/api/covers/xiaohongshu", response_model=Dict[str, str])
async def generate_xiaohongshu_cover(request: XiaohongshuCoverRequest, background_tasks: BackgroundTasks):
    """生成小红书封面HTML"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            html_file = cover_generator.generate_xiaohongshu_cover(
                content=request.content,
                account_name=request.account_name,
                slogan=request.slogan,
                style=request.style
            )
            
            update_task_status(
                task_id, 
                TaskStatus.COMPLETED, 
                result={
                    "html_file": html_file,
                    "local_path": os.path.relpath(html_file)
                }
            )
        except Exception as e:
            logger.error(f"Error generating Xiaohongshu cover: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

# url内容重写API
@app.post("/api/rewrite/url", response_model=Dict[str, Any])
def rewrite_url_content(request: UrlContentRewriteRequest):
    """重写URL文章内容"""
    try:
        result = url_content_rewriter.process_url(url=request.url)
        return {
            "success": True,
            "result": {
                "title": result.title,
                "content": result.content
            }
        }
    except Exception as e:
        logger.error(f"Error rewriting URL content: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"处理URL内容时发生错误: {str(e)}"
        )

# 标题重写API
@app.post("/api/rewrite/title", response_model=Dict[str, Any])
def rewrite_title(request: TitleRewriteRequest):
    """重写标题"""
    try:
        # 确保 style 参数存在，默认为 'mimeng'
        style = request.style if request.style else 'mimeng'
        
        # 使用 title_rewriter 重写标题
        rewritten_title = title_rewriter.rewrite_title(
            content=request.title,
            style=style
        )
        
        return {
            "success": True,
            "rewritten_title": rewritten_title
        }
    except Exception as e:
        logger.error(f"Error rewriting title: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"重写标题时发生错误: {str(e)}"
        )

# 内容风格重写API
@app.post("/api/rewrite/style", response_model=Dict[str, Any])
def rewrite_content_style(request: ContentStyleRewriteRequest):
    """以特定风格重写内容"""
    try:
        result = content_style_rewriter.rewrite_content(
            content=request.content,
            style=request.style
        )
        return {"success": True, "styled_content": result}
    except Exception as e:
        logger.error(f"Error applying style to content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 任务状态查询API
@app.get("/api/tasks/{task_id}", response_model=Task)
def get_task_status(task_id: str):
    """查询任务状态"""
    if task_id in task_storage:
        return task_storage[task_id]
    raise HTTPException(status_code=404, detail="Task not found")

# 获取文件内容API
@app.get("/api/files/{file_path:path}")
def get_file(file_path: str):
    """获取生成的文件内容"""
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

# 列出所有可用的封面风格
@app.get("/api/covers/styles", response_model=Dict[str, List[Dict[str, str]]])
def list_cover_styles():
    """获取所有可用的封面风格"""
    styles = []
    for style in CoverStyle:
        styles.append({
            "id": style.value,
            "name": style.name,
            "description": str(style)
        })
    return {"styles": styles}

# 列出所有可用的图像模型和风格
@app.get("/api/images/options", response_model=Dict[str, Any])
def list_image_options():
    """获取所有可用的图像生成选项"""
    # 海螺图像选项
    minimaxi_models = []
    for model in ImageModel:
        minimaxi_models.append({
            "id": model.value,
            "name": model.name
        })
    
    minimaxi_styles = []
    for style in ImageStyle:
        minimaxi_styles.append({
            "id": style.value,
            "name": style.name
        })
    
    minimaxi_sizes = []
    for size in ImageSize:
        minimaxi_sizes.append({
            "id": size.value,
            "name": size.name
        })
    
    # Kling图像选项
    kling_styles = []
    for style in KlingImageStyle:
        kling_styles.append({
            "id": style.value,
            "name": style.name
        })
    
    kling_ratios = []
    for ratio in ImageRatio:
        kling_ratios.append({
            "id": ratio.value,
            "name": ratio.name
        })
    
    return {
        "minimaxi": {
            "models": minimaxi_models,
            "styles": minimaxi_styles,
            "sizes": minimaxi_sizes,
            "formats": [{"id": fmt.value, "name": fmt.name} for fmt in ImageFormat]
        },
        "kling": {
            "styles": kling_styles,
            "ratios": kling_ratios
        }
    }

# 提供健康检查接口
@app.get("/health")
def health_check():
    """API健康状态检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 主页
@app.get("/")
def home():
    """API主页"""
    return {
        "name": "AI 内容生成服务",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 