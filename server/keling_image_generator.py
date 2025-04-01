import os
import json
import base64
import requests
from typing import Optional, Dict, List, Union
from enum import Enum
from dotenv import load_dotenv
from io import BytesIO
from PIL import Image
import logging

load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageStyle(str, Enum):
    """图像生成的风格枚举"""
    REALISTIC = "realistic"  # 写实风格
    ANIME = "anime"  # 动漫风格
    CARTOON = "cartoon"  # 卡通风格
    ILLUSTRATION = "illustration"  # 插画风格
    PAINTING = "painting"  # 绘画风格
    PIXEL_ART = "pixel-art"  # 像素艺术风格
    SKETCH = "sketch"  # 素描风格
    NONE = "none"  # 无特定风格

class ImageRatio(str, Enum):
    """图像比例枚举"""
    SQUARE = "1:1"  # 正方形
    PORTRAIT = "2:3"  # 人像比例
    LANDSCAPE = "3:2"  # 风景比例
    WIDE_SCREEN = "16:9"  # 宽屏比例
    CINEMATIC = "21:9"  # 电影比例
    POSTER = "3:4"  # 海报比例
    LONG_VERTICAL = "9:16"  # 长竖屏比例

class ImageGenerator:
    """使用Kling AI API生成图像的类"""
    def __init__(self):
        """初始化图像生成器"""
        self.api_key = os.getenv("KLING_API_KEY") 
        self.base_url = "https://api.klingai.com/v1/images"
        
        if not self.api_key:
            logger.warning("KLING_API_KEY 环境变量未设置，请在.env文件中添加")
        
        # 检查目录是否存在
        self.output_dir = "generated_images"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_image(self, 
                      prompt: str, 
                      negative_prompt: Optional[str] = None,
                      ratio: Union[str, ImageRatio] = ImageRatio.SQUARE,
                      style: Union[str, ImageStyle] = ImageStyle.NONE,
                      steps: int = 25,
                      seed: Optional[int] = None,
                      model: str = "kling-xi",
                      guidance_scale: float = 7.0,
                      lora_id: Optional[str] = None,
                      lora_strength: Optional[float] = None,
                      controlnet_id: Optional[str] = None,
                      controlnet_image: Optional[str] = None,
                      controlnet_strength: Optional[float] = None,
                      return_format: str = "url",
                      save_to_file: bool = True) -> Dict:
        """
        生成图像
        
        Args:
            prompt: 图像生成的提示词
            negative_prompt: 负面提示词，指定不想出现的内容
            ratio: 图像比例，可以是ImageRatio枚举值或字符串
            style: 图像风格，可以是ImageStyle枚举值或字符串
            steps: 生成步数，影响质量和生成时间
            seed: 随机种子，相同种子可复现结果
            model: 使用的模型名称
            guidance_scale: 引导比例，控制对提示词的遵循程度
            lora_id: LoRA模型ID
            lora_strength: LoRA模型强度
            controlnet_id: ControlNet模型ID
            controlnet_image: ControlNet参考图像
            controlnet_strength: ControlNet强度
            return_format: 返回格式，可选"url"或"b64_json"
            save_to_file: 是否保存图像到文件
            
        Returns:
            包含生成图像信息的字典
        """
        # 转换枚举为字符串
        if isinstance(ratio, ImageRatio):
            ratio = ratio.value
        
        if isinstance(style, ImageStyle):
            style = style.value
            
        # 构建API请求参数
        payload = {
            "prompt": prompt,
            "ratio": ratio,
            "steps": steps,
            "return_format": return_format,
            "model": model,
            "guidance_scale": guidance_scale
        }
        
        # 添加可选参数
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt
        
        if seed is not None:
            payload["seed"] = seed
            
        if style != "none":
            payload["style"] = style
            
        if lora_id:
            payload["lora"] = {
                "id": lora_id,
                "strength": lora_strength or 0.7
            }
            
        if controlnet_id and controlnet_image:
            payload["controlnet"] = {
                "id": controlnet_id,
                "image": controlnet_image,
                "strength": controlnet_strength or 0.7
            }
        
        # API请求头
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        try:
            # 发送请求
            logger.info(f"发送图像生成请求: {prompt[:50]}...")
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            # 保存图像到文件
            if save_to_file and "url" in result:
                self._save_image_from_url(result["url"], prompt)
            elif save_to_file and "b64_json" in result:
                self._save_image_from_b64(result["b64_json"], prompt)
                
            return result
        
        except requests.RequestException as e:
            logger.error(f"API请求失败: {str(e)}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"响应状态码: {e.response.status_code}")
                logger.error(f"响应内容: {e.response.text}")
            return {"error": str(e)}
    
    def _save_image_from_url(self, url: str, prompt: str) -> str:
        """从URL下载并保存图像"""
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            # 生成文件名
            filename = self._generate_filename(prompt)
            filepath = os.path.join(self.output_dir, filename)
            
            # 保存图像
            with open(filepath, 'wb') as f:
                f.write(response.content)
                
            logger.info(f"图像已保存: {filepath}")
            return filepath
        
        except Exception as e:
            logger.error(f"保存图像失败: {str(e)}")
            return ""
    
    def _save_image_from_b64(self, b64_data: str, prompt: str) -> str:
        """从Base64数据保存图像"""
        try:
            # 解码Base64数据
            image_data = base64.b64decode(b64_data)
            
            # 生成文件名
            filename = self._generate_filename(prompt)
            filepath = os.path.join(self.output_dir, filename)
            
            # 保存图像
            with open(filepath, 'wb') as f:
                f.write(image_data)
                
            logger.info(f"图像已保存: {filepath}")
            return filepath
        
        except Exception as e:
            logger.error(f"保存Base64图像失败: {str(e)}")
            return ""
    
    def _generate_filename(self, prompt: str) -> str:
        """生成图像文件名"""
        # 提取提示词的前10个字符作为文件名，移除不允许的字符
        prompt_part = "".join(c for c in prompt[:10] if c.isalnum() or c in " _-")
        prompt_part = prompt_part.strip().replace(" ", "_")
        
        import time
        timestamp = int(time.time())
        return f"img_{timestamp}_{prompt_part}.png"

    def upscale_image(self, 
                     image_url: str,
                     scale: int = 2,
                     save_to_file: bool = True) -> Dict:
        """
        放大图像
        
        Args:
            image_url: 需要放大的图像URL
            scale: 放大倍数，支持2、4
            save_to_file: 是否保存图像到文件
            
        Returns:
            包含放大图像信息的字典
        """
        # 构建API请求参数
        payload = {
            "image": image_url,
            "scale": scale
        }
        
        # API请求头
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        try:
            # 发送请求
            logger.info(f"发送图像放大请求，倍数: {scale}")
            response = requests.post(f"{self.base_url}/upscale", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            # 保存图像到文件
            if save_to_file and "url" in result:
                self._save_image_from_url(result["url"], f"upscale_{scale}x")
                
            return result
        
        except requests.RequestException as e:
            logger.error(f"放大API请求失败: {str(e)}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"响应状态码: {e.response.status_code}")
                logger.error(f"响应内容: {e.response.text}")
            return {"error": str(e)}

def main():
    """示例使用方法"""
    generator = ImageGenerator()
    
    # 示例1: 生成一张写实风格的图像
    result1 = generator.generate_image(
        prompt="一只可爱的猫咪在阳光下玩耍，高清照片",
        style=ImageStyle.REALISTIC,
        ratio=ImageRatio.LANDSCAPE
    )
    print(f"示例1结果: {result1.get('url', result1)}")
    
    # 示例2: 生成一张动漫风格的图像
    result2 = generator.generate_image(
        prompt="未来城市的天空，科幻动漫风格",
        style=ImageStyle.ANIME,
        ratio=ImageRatio.WIDE_SCREEN,
        negative_prompt="低质量，模糊，失真"
    )
    print(f"示例2结果: {result2.get('url', result2)}")
    
    # 示例3: 使用放大功能
    if "url" in result1:
        upscale_result = generator.upscale_image(result1["url"], scale=2)
        print(f"放大结果: {upscale_result.get('url', upscale_result)}")

if __name__ == "__main__":
    main() 