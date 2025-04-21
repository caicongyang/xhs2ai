from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, File, UploadFile, Form, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import os
import uuid
import shutil
import base64
import io
import re
from enum import Enum
import logging
import json
import time
from datetime import datetime

# 导入各个功能模块 - 使用方式二：利用__init__.py的包导入方式
try:
    # 尝试使用相对导入，从当前包导入所有模块
    from . import (
        MiniMaxiImageGenerator, ImageModel, ImageSize, ImageStyle, ImageFormat,
        MiniMaxiVideoGenerator, VideoQuality, VideoFormat, VideoContentType,
        KlingVideoGenerator, KlingImageGenerator, KlingImageStyle, ImageRatio,
        CoverGenerator, CoverStyle,
        UrlContentRewriter, TitleRewriter, ContentStyleRewriter,
        get_magazine_card_generator, MagazineCardRequest, MagazineStyle, MagazineCardResponse
    )
except ImportError:
    # 如果相对导入失败，尝试从src包导入
    try:
        import sys
        from pathlib import Path
        # 添加server目录到Python路径
        sys.path.append(str(Path(__file__).parent.parent))
        
        from src import (
            MiniMaxiImageGenerator, ImageModel, ImageSize, ImageStyle, ImageFormat,
            MiniMaxiVideoGenerator, VideoQuality, VideoFormat, VideoContentType,
            KlingVideoGenerator, KlingImageGenerator, KlingImageStyle, ImageRatio,
            CoverGenerator, CoverStyle,
            UrlContentRewriter, TitleRewriter, ContentStyleRewriter,
            get_magazine_card_generator, MagazineCardRequest, MagazineStyle, MagazineCardResponse
        )
    except ImportError as e:
        logging.error(f"导入模块失败: {e}")
        raise

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

# 添加静态文件服务
app.mount("/magazine_cards", StaticFiles(directory="magazine_cards"), name="magazine_cards")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/files/uploads", StaticFiles(directory="uploads"), name="files_uploads")

# 创建输出目录
os.makedirs("outputs", exist_ok=True)
os.makedirs("uploads", exist_ok=True)  # 确保上传目录存在

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

class MagazineCardBase64Request(BaseModel):
    content: str
    style: Optional[str] = None
    qr_code_url: Optional[str] = None
    product_image_url: Optional[str] = None
    product_price: Optional[str] = None
    product_description: Optional[str] = None
    qr_code_base64: Optional[str] = None
    product_image_base64: Optional[str] = None

# 实例化各个生成器
minimaxi_image_generator = MiniMaxiImageGenerator()
minimaxi_video_generator = MiniMaxiVideoGenerator()
kling_image_generator = KlingImageGenerator()
kling_video_generator = KlingVideoGenerator()
cover_generator = CoverGenerator()
url_content_rewriter = UrlContentRewriter()
title_rewriter = TitleRewriter()
content_style_rewriter = ContentStyleRewriter()
magazine_card_generator = get_magazine_card_generator()

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

# 修改杂志卡片生成接口支持文件上传
@app.post("/api/magazine-cards/generate", response_model=Dict[str, str])
async def generate_magazine_card(
    request: MagazineCardRequest,
    background_tasks: BackgroundTasks
):
    """生成杂志风格卡片"""
    task_id = generate_task_id()
    store_task(task_id)
    
    def process_task():
        try:
            update_task_status(task_id, TaskStatus.PROCESSING)
            
            generator = get_magazine_card_generator()
            response = generator.generate_card(request)
            
            # 日志记录文件路径
            logger.info(f"杂志卡片生成完成: {response.file_path}")
            
            update_task_status(
                task_id, 
                TaskStatus.COMPLETED, 
                result={
                    "card_id": response.card_id,
                    "style": response.style,
                    "html_path": response.file_path
                }
            )
        except Exception as e:
            logger.error(f"生成杂志卡片失败: {str(e)}")
            update_task_status(task_id, TaskStatus.FAILED, error=str(e))
    
    background_tasks.add_task(process_task)
    return {"task_id": task_id}

@app.get("/api/magazine-cards/styles", response_model=List[Dict[str, str]])
def list_magazine_styles():
    """列出所有可用的杂志卡片风格"""
    return magazine_card_generator.list_styles()

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
    # 检查文件是否存在，先直接检查原始路径
    if os.path.exists(file_path) and os.path.isfile(file_path):
        logger.info(f"文件找到(原始路径): {file_path}")
        return FileResponse(file_path)
    
    # 尝试检查相对于当前工作目录的路径
    current_dir = os.getcwd()
    absolute_path = os.path.join(current_dir, file_path)
    if os.path.exists(absolute_path) and os.path.isfile(absolute_path):
        logger.info(f"文件找到(绝对路径): {absolute_path}")
        return FileResponse(absolute_path)
    
    # 尝试去除可能的前导斜杠
    cleaned_path = file_path.lstrip('/')
    if os.path.exists(cleaned_path) and os.path.isfile(cleaned_path):
        logger.info(f"文件找到(清理路径): {cleaned_path}")
        return FileResponse(cleaned_path)
    
    # 尝试outputs目录下的路径
    outputs_path = os.path.join("outputs", cleaned_path)
    if os.path.exists(outputs_path) and os.path.isfile(outputs_path):
        logger.info(f"文件找到(outputs路径): {outputs_path}")
        return FileResponse(outputs_path)
    
    # 尝试magazine_cards目录
    magazine_cards_path = os.path.join("magazine_cards", os.path.basename(cleaned_path))
    if os.path.exists(magazine_cards_path) and os.path.isfile(magazine_cards_path):
        logger.info(f"文件找到(magazine_cards路径): {magazine_cards_path}")
        return FileResponse(magazine_cards_path)
    
    # 尝试templates目录
    templates_path = os.path.join("templates", os.path.basename(cleaned_path))
    if os.path.exists(templates_path) and os.path.isfile(templates_path):
        logger.info(f"文件找到(templates路径): {templates_path}")
        return FileResponse(templates_path)
    
    # 输出调试信息
    logger.error(f"文件未找到: 原始路径={file_path}")
    logger.error(f"尝试路径: 绝对路径={absolute_path}, 清理路径={cleaned_path}, outputs路径={outputs_path}")
    logger.error(f"尝试路径: magazine_cards路径={magazine_cards_path}, templates路径={templates_path}")
    logger.info(f"当前工作目录: {current_dir}")
    
    raise HTTPException(status_code=404, detail=f"File not found: {file_path}")

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

# 文件上传API
@app.post("/api/upload", response_model=Dict[str, str])
async def upload_file(
    qr_code: Optional[UploadFile] = File(None),
    product_image: Optional[UploadFile] = File(None)
):
    """处理文件上传"""
    result = {}
    
    try:
        # 创建上传目录
        upload_dir = os.path.join("uploads", datetime.now().strftime("%Y%m%d"))
        os.makedirs(upload_dir, exist_ok=True)
        
        # 处理二维码文件
        if qr_code:
            filename = f"qr_{uuid.uuid4()}{os.path.splitext(qr_code.filename)[1]}"
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, "wb") as f:
                content = await qr_code.read()
                f.write(content)
            
            result["qr_code_url"] = f"/uploads/{datetime.now().strftime('%Y%m%d')}/{filename}"
        
        # 处理产品图片
        if product_image:
            filename = f"product_{uuid.uuid4()}{os.path.splitext(product_image.filename)[1]}"
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, "wb") as f:
                content = await product_image.read()
                f.write(content)
            
            result["product_image_url"] = f"/uploads/{datetime.now().strftime('%Y%m%d')}/{filename}"
        
        return result
        
    except Exception as e:
        logger.error(f"文件上传失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 