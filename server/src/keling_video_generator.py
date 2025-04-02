from typing import Optional, Dict, List, Union
import os
import requests
import time
from datetime import datetime
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from enum import Enum

load_dotenv()

class VideoGenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class VideoGenerationRequest(BaseModel):
    task_id: str = Field(description="任务ID")
    status: VideoGenerationStatus = Field(description="任务状态")
    created_at: str = Field(description="创建时间")

class VideoGenerationResult(BaseModel):
    task_id: str = Field(description="任务ID")
    status: VideoGenerationStatus = Field(description="任务状态")
    video_url: Optional[str] = Field(description="生成的视频URL")
    created_at: str = Field(description="创建时间")
    completed_at: Optional[str] = Field(description="完成时间")

class VideoGenerator:
    def __init__(self):
        self.api_key = os.getenv("KLING_API_KEY")
        self.base_url = "https://api.klingai.com"
        self.text_to_video_endpoint = "/v1/text-to-video"
        self.image_to_video_endpoint = "/v1/image-to-video"
        self.task_status_endpoint = "/v1/tasks/{task_id}"
        
        # 支持的模型列表
        self.t2v_models = ["kling-svd"]  # 文本到视频模型
        self.i2v_models = ["kling-i2v"]  # 图像到视频模型
        
        # 支持的视频风格列表
        self.video_styles = [
            "none",           # 无风格
            "anime",          # 动漫风格
            "cinematic",      # 电影风格
            "realistic",      # 写实风格
            "watercolor"      # 水彩风格
        ]
        
        if not self.api_key:
            raise ValueError("KLING_API_KEY not found in environment variables")
        
        # 创建视频输出目录
        self.output_dir = "videos"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _get_headers(self) -> Dict[str, str]:
        """获取API请求头"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_video_from_text(self, 
                                prompt: str, 
                                negative_prompt: Optional[str] = None,
                                duration: int = 3,
                                width: int = 512,
                                height: int = 512,
                                fps: int = 24,
                                guidance_scale: float = 7.0,
                                num_inference_steps: int = 50,
                                seed: Optional[int] = None,
                                model: str = "kling-svd",
                                style: Optional[str] = None,
                                output_format: str = "mp4",
                                quality: str = "medium") -> VideoGenerationRequest:
        """
        根据文本提示词生成视频
        
        Args:
            prompt: 视频生成的提示词
            negative_prompt: 负面提示词，指定不希望出现的内容
            duration: 生成视频的长度(秒)
            width: 视频宽度(像素)
            height: 视频高度(像素)
            fps: 每秒帧数
            guidance_scale: 提示词引导强度
            num_inference_steps: 推理步数
            seed: 随机种子，用于复现结果
            model: 使用的模型，默认为"kling-svd"
            style: 视频风格
            output_format: 输出视频格式，默认为"mp4"
            quality: 视频质量，可选值为"low"、"medium"、"high"，默认为"medium"
            
        Returns:
            视频生成请求信息，包含任务ID
        """
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "duration": duration,
            "width": width,
            "height": height,
            "fps": fps,
            "guidance_scale": guidance_scale,
            "num_inference_steps": num_inference_steps,
            "seed": seed,
            "model": model,
            "output_format": output_format,
            "quality": quality
        }
        
        if style:
            payload["style"] = style
            
        # 移除None值
        payload = {k: v for k, v in payload.items() if v is not None}
        
        response = requests.post(
            f"{self.base_url}{self.text_to_video_endpoint}",
            headers=self._get_headers(),
            json=payload
        )
        response.raise_for_status()
        
        result = response.json()
        return VideoGenerationRequest(
            task_id=result["task_id"],
            status=VideoGenerationStatus.PENDING,
            created_at=result.get("created_at", datetime.now().isoformat())
        )
    
    def generate_video_from_image(self,
                                 image_url: str,
                                 prompt: Optional[str] = None,
                                 negative_prompt: Optional[str] = None,
                                 duration: int = 3,
                                 fps: int = 24,
                                 motion_bucket_id: int = 127,
                                 guidance_scale: float = 7.0,
                                 num_inference_steps: int = 50,
                                 seed: Optional[int] = None,
                                 model: str = "kling-i2v",
                                 output_format: str = "mp4",
                                 quality: str = "medium") -> VideoGenerationRequest:
        """
        根据图片生成视频
        
        Args:
            image_url: 输入图片的URL
            prompt: 视频生成的提示词
            negative_prompt: 负面提示词，指定不希望出现的内容
            duration: 生成视频的长度(秒)
            fps: 每秒帧数
            motion_bucket_id: 动作强度，范围0-255，值越大动作越激烈
            guidance_scale: 提示词引导强度
            num_inference_steps: 推理步数
            seed: 随机种子，用于复现结果
            model: 使用的模型，默认为"kling-i2v"
            output_format: 输出视频格式，默认为"mp4"
            quality: 视频质量，可选值为"low"、"medium"、"high"，默认为"medium"
            
        Returns:
            视频生成请求信息，包含任务ID
        """
        payload = {
            "image_url": image_url,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "duration": duration,
            "fps": fps,
            "motion_bucket_id": motion_bucket_id,
            "guidance_scale": guidance_scale,
            "num_inference_steps": num_inference_steps,
            "seed": seed,
            "model": model,
            "output_format": output_format,
            "quality": quality
        }
        
        # 移除None值
        payload = {k: v for k, v in payload.items() if v is not None}
        
        response = requests.post(
            f"{self.base_url}{self.image_to_video_endpoint}",
            headers=self._get_headers(),
            json=payload
        )
        response.raise_for_status()
        
        result = response.json()
        return VideoGenerationRequest(
            task_id=result["task_id"],
            status=VideoGenerationStatus.PENDING,
            created_at=result.get("created_at", datetime.now().isoformat())
        )
    
    def get_task_status(self, task_id: str) -> VideoGenerationResult:
        """
        获取任务状态
        
        Args:
            task_id: 任务ID
            
        Returns:
            任务状态信息
        """
        response = requests.get(
            f"{self.base_url}{self.task_status_endpoint.format(task_id=task_id)}",
            headers=self._get_headers()
        )
        response.raise_for_status()
        
        result = response.json()
        return VideoGenerationResult(
            task_id=result["task_id"],
            status=result["status"],
            video_url=result.get("video_url"),
            created_at=result.get("created_at", ""),
            completed_at=result.get("completed_at")
        )
    
    def wait_for_result(self, task_id: str, polling_interval: int = 5, timeout: int = 300) -> VideoGenerationResult:
        """
        等待任务完成并获取结果
        
        Args:
            task_id: 任务ID
            polling_interval: 轮询间隔(秒)
            timeout: 超时时间(秒)
            
        Returns:
            视频生成结果
        """
        start_time = time.time()
        while True:
            if time.time() - start_time > timeout:
                raise TimeoutError(f"Task {task_id} timed out after {timeout} seconds")
            
            result = self.get_task_status(task_id)
            if result.status in [VideoGenerationStatus.COMPLETED, VideoGenerationStatus.FAILED]:
                return result
            
            time.sleep(polling_interval)
    
    def is_generation_completed(self, task_id: str) -> bool:
        """
        检查视频生成任务是否已完成
        
        Args:
            task_id: 任务ID
            
        Returns:
            如果任务已完成，返回True；否则返回False
        """
        try:
            result = self.get_task_status(task_id)
            return result.status == VideoGenerationStatus.COMPLETED
        except Exception:
            return False
    
    def download_video(self, video_url: str, output_path: str) -> str:
        """
        下载生成的视频
        
        Args:
            video_url: 视频URL
            output_path: 保存路径
            
        Returns:
            视频保存的完整路径
        """
        # 创建保存目录
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        response = requests.get(video_url, stream=True)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return output_path

def main():
    """示例使用方法"""
    generator = VideoGenerator()
    
    print(f"支持的文本到视频模型: {generator.t2v_models}")
    print(f"支持的图像到视频模型: {generator.i2v_models}")
    print(f"支持的视频风格: {generator.video_styles}")
    
    # 文本生成视频示例
    text_task = generator.generate_video_from_text(
        prompt="A beautiful sunset over the ocean, cinematic style, high quality",
        duration=5,
        width=768,
        height=432,
        model="kling-svd",
        style="cinematic",
        quality="high",
        output_format="mp4"
    )
    print(f"文本生成视频任务已提交，任务ID: {text_task.task_id}")
    
    # 监控任务状态并下载结果
    try:
        text_result = generator.wait_for_result(text_task.task_id, timeout=600)
        if generator.is_generation_completed(text_task.task_id):
            output_path = os.path.join(generator.output_dir, f"text_to_video_{text_task.task_id}.mp4")
            generator.download_video(text_result.video_url, output_path)
            print(f"文本生成视频已完成，并保存到: {output_path}")
        else:
            print(f"文本生成视频任务失败: {text_result.status}")
    except TimeoutError as e:
        print(f"等待文本生成视频超时: {e}")
    
    # 图片生成视频示例
    image_url = "https://example.com/sample-image.jpg"  # 替换为实际图片URL
    image_task = generator.generate_video_from_image(
        image_url=image_url,
        prompt="Make the image come alive with gentle movement",
        duration=3,
        motion_bucket_id=150,
        model="kling-i2v",
        quality="high",
        output_format="mp4"
    )
    print(f"图片生成视频任务已提交，任务ID: {image_task.task_id}")
    
    # 监控任务状态并下载结果
    try:
        image_result = generator.wait_for_result(image_task.task_id, timeout=600)
        if generator.is_generation_completed(image_task.task_id):
            output_path = os.path.join(generator.output_dir, f"image_to_video_{image_task.task_id}.mp4")
            generator.download_video(image_result.video_url, output_path)
            print(f"图片生成视频已完成，并保存到: {output_path}")
        else:
            print(f"图片生成视频任务失败: {image_result.status}")
    except TimeoutError as e:
        print(f"等待图片生成视频超时: {e}")

if __name__ == "__main__":
    main()