from typing import Optional, Dict, List, Union, Any
import os
import requests
import time
import json
import base64
from io import BytesIO
from PIL import Image
from datetime import datetime
from enum import Enum
from dotenv import load_dotenv
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

class ImageModel(str, Enum):
    """图像模型枚举"""
    SD_XL = "sd-xl"               # Stable Diffusion XL 模型
    SD_3 = "sd-3"                 # Stable Diffusion 3 模型
    MINIMAXI_DRAWING = "minimaxi-drawing"  # MiniMaxi 绘画模型
    DALLE3 = "dalle3"             # DALL-E 3 模型

class ImageFormat(str, Enum):
    """图像格式枚举"""
    PNG = "png"  # PNG格式
    JPEG = "jpeg"  # JPEG格式

class ImageSize(str, Enum):
    """图像尺寸枚举"""
    SMALL = "1024x1024"      # 1024x1024像素
    MEDIUM = "1536x1536"     # 1536x1536像素
    LARGE = "2048x2048"      # 2048x2048像素
    WIDE = "1536x1024"       # 1536x1024像素(3:2)
    TALL = "1024x1536"       # 1024x1536像素(2:3)
    CUSTOM = "custom"        # 自定义尺寸

class ImageStyle(str, Enum):
    """图像风格枚举"""
    REALISTIC = "realistic"           # 写实风格
    ANIME = "anime"                   # 动漫风格
    ILLUSTRATION = "illustration"     # 插画风格
    WATERCOLOR = "watercolor"         # 水彩风格
    OIL_PAINTING = "oil-painting"     # 油画风格
    SKETCH = "sketch"                 # 素描风格
    CHINESE_PAINTING = "chinese-painting"  # 中国画风格
    NONE = "none"                     # 无特定风格

class MiniMaxiImageGenerator:
    """使用MiniMaxi(海螺)API生成图像的类"""
    
    def __init__(self):
        """初始化图像生成器"""
        self.api_key = os.getenv("MINIMAXI_API_KEY")
        self.base_url = "https://api.minimaxi.com/v1"
        self.image_generation_endpoint = "/images/generation"
        self.image_query_endpoint = "/images/generation/{task_id}"
        self.image_upscale_endpoint = "/images/upscale"
        
        if not self.api_key:
            logger.warning("MINIMAXI_API_KEY 环境变量未设置，请在.env文件中添加")
        
        # 创建图像输出目录
        self.output_dir = "generated_images"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _get_headers(self) -> Dict[str, str]:
        """获取API请求头"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    def generate_image(self, 
                      prompt: str,
                      negative_prompt: Optional[str] = None,
                      model: Union[str, ImageModel] = ImageModel.SD_XL,
                      style: Union[str, ImageStyle] = ImageStyle.NONE,
                      size: Union[str, ImageSize] = ImageSize.SMALL,
                      format: Union[str, ImageFormat] = ImageFormat.PNG,
                      width: Optional[int] = None,
                      height: Optional[int] = None,
                      guidance_scale: Optional[float] = None,
                      num_images: int = 1,
                      webhook_url: Optional[str] = None,
                      seed: Optional[int] = None,
                      reference_images: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        生成图像
        
        Args:
            prompt: 图像生成的提示词
            negative_prompt: 负面提示词，指定不想出现的内容
            model: 使用的模型，默认为SD-XL
            style: 图像风格，默认为无特定风格
            size: 图像尺寸，默认为1024x1024
            format: 图像格式，默认为PNG
            width: 自定义宽度（像素），仅当size为custom时使用
            height: 自定义高度（像素），仅当size为custom时使用
            guidance_scale: 提示词引导强度，默认由系统决定
            num_images: 生成图像的数量，默认为1
            webhook_url: 回调通知URL
            seed: 随机种子，用于复现结果
            reference_images: 参考图片URL列表，用于图像引导
            
        Returns:
            包含任务ID的字典
        """
        # 转换枚举为字符串
        if isinstance(model, ImageModel):
            model = model.value
            
        if isinstance(style, ImageStyle):
            style = style.value
            
        if isinstance(size, ImageSize):
            size = size.value
            
        if isinstance(format, ImageFormat):
            format = format.value
        
        # 构建请求参数
        payload = {
            "prompt": prompt,
            "model": model,
            "format": format,
            "n": num_images
        }
        
        # 处理尺寸
        if size == "custom":
            if not width or not height:
                raise ValueError("使用自定义尺寸时必须提供width和height参数")
            payload["width"] = width
            payload["height"] = height
        else:
            payload["size"] = size
        
        # 添加可选参数
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt
            
        if style != "none":
            payload["style"] = style
            
        if guidance_scale is not None:
            payload["guidance_scale"] = guidance_scale
            
        if webhook_url:
            payload["webhook_url"] = webhook_url
            
        if seed is not None:
            payload["seed"] = seed
            
        if reference_images:
            payload["reference_images"] = reference_images
        
        try:
            # 发送请求
            logger.info(f"发送图像生成请求: {prompt[:50]}...")
            response = requests.post(
                f"{self.base_url}{self.image_generation_endpoint}",
                headers=self._get_headers(),
                json=payload
            )
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            error_msg = f"API请求失败: {str(e)}"
            if hasattr(e, 'response') and e.response:
                logger.error(f"响应状态码: {e.response.status_code}")
                logger.error(f"响应内容: {e.response.text}")
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
                f"{self.base_url}{self.image_query_endpoint.format(task_id=task_id)}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            error_msg = f"查询任务状态失败: {str(e)}"
            if hasattr(e, 'response') and e.response:
                logger.error(f"响应状态码: {e.response.status_code}")
                logger.error(f"响应内容: {e.response.text}")
            return {"error": error_msg}
    
    def is_generation_completed(self, task_id: str) -> bool:
        """
        检查图像生成任务是否已完成
        
        Args:
            task_id: 任务ID
            
        Returns:
            如果任务已完成，返回True；否则返回False
        """
        try:
            result = self.query_task(task_id)
            return result.get("status") == "success"
        except Exception as e:
            logger.error(f"检查任务状态失败: {str(e)}")
            return False
    
    def wait_for_result(self, task_id: str, polling_interval: int = 2, timeout: int = 180) -> Dict[str, Any]:
        """
        等待任务完成并获取结果
        
        Args:
            task_id: 任务ID
            polling_interval: 轮询间隔(秒)
            timeout: 超时时间(秒)
            
        Returns:
            图像生成结果
        """
        start_time = time.time()
        logger.info(f"开始等待任务 {task_id} 完成...")
        
        while True:
            if time.time() - start_time > timeout:
                raise TimeoutError(f"任务 {task_id} 在 {timeout} 秒后超时")
            
            result = self.query_task(task_id)
            status = result.get("status")
            
            if status == "success":
                logger.info(f"任务 {task_id} 已成功完成")
                return result
            elif status == "failed":
                error_msg = f"任务 {task_id} 失败: {result.get('message', '未知错误')}"
                logger.error(error_msg)
                raise Exception(error_msg)
            
            logger.info(f"任务 {task_id} 当前状态: {status}, 继续等待...")
            time.sleep(polling_interval)
    
    def download_image(self, image_url: str, output_path: Optional[str] = None) -> str:
        """
        下载生成的图像
        
        Args:
            image_url: 图像URL
            output_path: 保存路径，如果不提供则自动生成
            
        Returns:
            图像保存的完整路径
        """
        if not output_path:
            # 从URL获取文件名
            file_name = os.path.basename(image_url.split('?')[0])
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 如果没有文件名或扩展名，使用默认值
            if not file_name or '.' not in file_name:
                file_name = f"image_{timestamp}.png"
                
            output_path = os.path.join(self.output_dir, file_name)
        
        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        try:
            # 下载文件
            response = requests.get(image_url, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"图像已保存: {output_path}")
            return output_path
        except requests.RequestException as e:
            logger.error(f"下载图像失败: {str(e)}")
            return ""
    
    def download_all_images(self, result: Dict[str, Any], prefix: Optional[str] = None) -> List[str]:
        """
        下载结果中的所有图像
        
        Args:
            result: 任务查询结果
            prefix: 文件名前缀
            
        Returns:
            保存的图像路径列表
        """
        paths = []
        
        if "images" not in result:
            logger.warning("结果中没有找到图像")
            return paths
        
        for i, image_data in enumerate(result["images"]):
            if "url" not in image_data:
                continue
                
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_prefix = prefix or "image"
            file_name = f"{file_prefix}_{timestamp}_{i+1}.png"
            output_path = os.path.join(self.output_dir, file_name)
            
            image_path = self.download_image(image_data["url"], output_path)
            if image_path:
                paths.append(image_path)
        
        return paths
    
    def upscale_image(self, image_url: str, scale: int = 2) -> Dict[str, Any]:
        """
        放大图像
        
        Args:
            image_url: 需要放大的图像URL
            scale: 放大倍数，支持2、4
            
        Returns:
            包含放大后图像URL的字典
        """
        if scale not in [2, 4]:
            raise ValueError("scale参数只支持2或4")
            
        payload = {
            "image_url": image_url,
            "scale": scale
        }
        
        try:
            response = requests.post(
                f"{self.base_url}{self.image_upscale_endpoint}",
                headers=self._get_headers(),
                json=payload
            )
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            error_msg = f"图像放大请求失败: {str(e)}"
            if hasattr(e, 'response') and e.response:
                logger.error(f"响应状态码: {e.response.status_code}")
                logger.error(f"响应内容: {e.response.text}")
            return {"error": error_msg}

def main():
    """示例使用方法"""
    generator = MiniMaxiImageGenerator()
    
    # 示例1: 使用SD-XL模型生成图像
    result1 = generator.generate_image(
        prompt="一只可爱的小猫在向日葵旁边，阳光明媚，高清写实风格",
        model=ImageModel.SD_XL,
        style=ImageStyle.REALISTIC,
        size=ImageSize.MEDIUM,
        format=ImageFormat.PNG
    )
    
    if "task_id" in result1:
        task_id = result1["task_id"]
        print(f"任务已提交，ID: {task_id}")
        
        try:
            # 等待图像生成完成
            result = generator.wait_for_result(task_id)
            
            # 下载所有生成的图像
            image_paths = generator.download_all_images(result, prefix="cat")
            
            if image_paths:
                print(f"已保存 {len(image_paths)} 张图像:")
                for path in image_paths:
                    print(f"- {path}")
                
                # 尝试放大第一张图片
                if len(image_paths) > 0:
                    first_image_url = result["images"][0]["url"]
                    upscale_result = generator.upscale_image(first_image_url, scale=2)
                    
                    if "url" in upscale_result:
                        upscaled_path = generator.download_image(upscale_result["url"], 
                                                                os.path.join(generator.output_dir, "upscaled_cat.png"))
                        print(f"放大的图像已保存至: {upscaled_path}")
            else:
                print("没有找到可下载的图像")
        except Exception as e:
            print(f"处理任务时出错: {e}")
    else:
        print(f"任务提交失败: {result1}")
    
    # 示例2: 使用参考图像生成
    # 替换为实际的参考图像URL
    reference_image_url = "https://example.com/reference.jpg"
    
    result2 = generator.generate_image(
        prompt="将这张图片转换为动漫风格，保持相同的构图和场景",
        model=ImageModel.MINIMAXI_DRAWING,
        style=ImageStyle.ANIME,
        reference_images=[reference_image_url]
    )
    
    if "task_id" in result2:
        task_id = result2["task_id"]
        print(f"参考图像任务已提交，ID: {task_id}")
        # 这里可以添加等待和下载逻辑，与示例1类似
    else:
        print(f"参考图像任务提交失败: {result2}")

if __name__ == "__main__":
    main() 