from typing import Optional, Dict, List, Union, Any
import os
import requests
import time
import json
from datetime import datetime
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

class VideoQuality(str, Enum):
    """视频质量枚举"""
    STANDARD = "standard"  # 标准质量
    HIGH = "high"  # 高质量

class VideoFormat(str, Enum):
    """视频格式枚举"""
    MP4 = "mp4"  # MP4格式
    GIF = "gif"  # GIF格式

class VideoContentType(str, Enum):
    """视频内容类型枚举"""
    FASHION = "fashion"         # 时尚
    LIFESTYLE = "lifestyle"     # 生活方式
    FOOD = "food"               # 食物
    TRAVEL = "travel"           # 旅行
    EDUCATION = "education"     # 教育
    TECH = "tech"               # 科技
    HEALTH = "health"           # 健康
    BEAUTY = "beauty"           # 美妆
    ENTERTAINMENT = "entertainment"  # 娱乐
    SPORT = "sport"             # 运动
    CULTURE = "culture"         # 文化
    BUSINESS = "business"       # 商业
    NEWS = "news"               # 新闻
    GAME = "game"               # 游戏
    PET = "pet"                 # 宠物
    MUSIC = "music"             # 音乐

class MiniMaxiVideoGenerator:
    """使用MiniMaxi(海螺)API生成视频的类"""
    
    def __init__(self):
        """初始化视频生成器"""
        self.api_key = os.getenv("MINIMAXI_API_KEY")
        self.base_url = "https://api.minimaxi.com/v1"
        self.video_generation_endpoint = "/videos/generation"
        self.video_query_endpoint = "/videos/generation/{task_id}"
        
        if not self.api_key:
            raise ValueError("MINIMAXI_API_KEY environment variable not set")
        
        # 创建视频输出目录
        self.output_dir = "minimaxi_videos"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _get_headers(self) -> Dict[str, str]:
        """获取API请求头"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    def generate_video(self, 
                      prompt: str,
                      negative_prompt: Optional[str] = None,
                      images: Optional[List[str]] = None,
                      duration: Optional[int] = None,
                      content_type: Optional[Union[str, VideoContentType]] = None,
                      quality: Union[str, VideoQuality] = VideoQuality.STANDARD,
                      format: Union[str, VideoFormat] = VideoFormat.MP4,
                      webhook_url: Optional[str] = None,
                      seed: Optional[int] = None) -> Dict[str, Any]:
        """
        生成视频
        
        Args:
            prompt: 视频生成的提示词
            negative_prompt: 负面提示词，指定不想出现的内容
            images: 参考图片URL列表（可选）
            duration: 视频时长，单位秒（可选）
            content_type: 视频内容类型（可选）
            quality: 视频质量，默认为standard
            format: 视频格式，默认为mp4
            webhook_url: 回调通知URL（可选）
            seed: 随机种子，用于复现结果（可选）
            
        Returns:
            包含任务ID的字典
        """
        # 转换枚举为字符串
        if isinstance(quality, VideoQuality):
            quality = quality.value
            
        if isinstance(format, VideoFormat):
            format = format.value
            
        if isinstance(content_type, VideoContentType):
            content_type = content_type.value
        
        # 构建请求参数
        payload = {
            "prompt": prompt,
            "quality": quality,
            "format": format
        }
        
        # 添加可选参数
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt
            
        if images:
            payload["images"] = images
            
        if duration:
            payload["duration"] = duration
            
        if content_type:
            payload["content_type"] = content_type
            
        if webhook_url:
            payload["webhook_url"] = webhook_url
            
        if seed is not None:
            payload["seed"] = seed
        
        try:
            # 发送请求
            response = requests.post(
                f"{self.base_url}{self.video_generation_endpoint}",
                headers=self._get_headers(),
                json=payload
            )
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            error_msg = f"视频生成请求失败: {str(e)}"
            if hasattr(e, 'response') and e.response:
                error_msg += f"\n状态码: {e.response.status_code}"
                error_msg += f"\n响应内容: {e.response.text}"
            
            print(error_msg)
            return {"error": error_msg}
    
    def query_task(self, task_id: str) -> Dict[str, Any]:
        """
        查询任务状态
        
        Args:
            task_id: 任务ID
            
        Returns:
            任务状态信息
        """
        try:
            response = requests.get(
                f"{self.base_url}{self.video_query_endpoint.format(task_id=task_id)}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            error_msg = f"查询任务状态失败: {str(e)}"
            if hasattr(e, 'response') and e.response:
                error_msg += f"\n状态码: {e.response.status_code}"
                error_msg += f"\n响应内容: {e.response.text}"
            
            print(error_msg)
            return {"error": error_msg}
    
    def is_generation_completed(self, task_id: str) -> bool:
        """
        检查视频生成任务是否已完成
        
        Args:
            task_id: 任务ID
            
        Returns:
            如果任务已完成，返回True；否则返回False
        """
        try:
            result = self.query_task(task_id)
            return result.get("status") == "success"
        except Exception as e:
            print(f"检查任务状态失败: {str(e)}")
            return False
    
    def wait_for_result(self, task_id: str, polling_interval: int = 5, timeout: int = 600) -> Dict[str, Any]:
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
                raise TimeoutError(f"任务 {task_id} 在 {timeout} 秒后超时")
            
            result = self.query_task(task_id)
            status = result.get("status")
            
            if status == "success":
                return result
            elif status == "failed":
                raise Exception(f"任务 {task_id} 失败: {result.get('message', '未知错误')}")
            
            print(f"任务 {task_id} 当前状态: {status}, 等待中...")
            time.sleep(polling_interval)
    
    def download_video(self, video_url: str, output_path: Optional[str] = None) -> str:
        """
        下载生成的视频
        
        Args:
            video_url: 视频URL
            output_path: 保存路径，如果不提供则自动生成
            
        Returns:
            视频保存的完整路径
        """
        if not output_path:
            # 从URL获取文件名
            file_name = os.path.basename(video_url.split('?')[0])
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 如果没有文件名或扩展名，使用默认值
            if not file_name or '.' not in file_name:
                file_name = f"video_{timestamp}.mp4"
                
            output_path = os.path.join(self.output_dir, file_name)
        
        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        try:
            # 下载文件
            response = requests.get(video_url, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"视频成功下载到: {output_path}")
            return output_path
        except requests.RequestException as e:
            error_msg = f"下载视频失败: {str(e)}"
            print(error_msg)
            return ""

def main():
    """示例使用方法"""
    generator = MiniMaxiVideoGenerator()
    
    # 示例1: 仅使用文本提示词生成视频
    result1 = generator.generate_video(
        prompt="一只猫咪在阳光下玩耍，高清摄影风格",
        content_type=VideoContentType.PET,
        quality=VideoQuality.STANDARD,
        format=VideoFormat.MP4
    )
    
    if "task_id" in result1:
        task_id = result1["task_id"]
        print(f"任务已提交，ID: {task_id}")
        
        try:
            # 等待视频生成完成
            result = generator.wait_for_result(task_id)
            
            if "video_url" in result:
                # 下载视频
                video_url = result["video_url"]
                output_path = generator.download_video(video_url)
                print(f"视频已保存至: {output_path}")
            else:
                print(f"无法获取视频URL: {result}")
        except Exception as e:
            print(f"等待任务结果时出错: {e}")
    else:
        print(f"任务提交失败: {result1}")
    
    # 示例2: 使用图片参考生成视频
    result2 = generator.generate_video(
        prompt="将图片转换为一个生动的短视频，添加轻柔的移动效果",
        images=["https://example.com/sample-image.jpg"],  # 替换为实际图片URL
        duration=5,
        quality=VideoQuality.HIGH,
        format=VideoFormat.MP4
    )
    
    if "task_id" in result2:
        print(f"图片转视频任务已提交，ID: {result2['task_id']}")
        # 这里可以添加等待和下载逻辑，与示例1类似
    else:
        print(f"图片转视频任务提交失败: {result2}")

if __name__ == "__main__":
    main() 