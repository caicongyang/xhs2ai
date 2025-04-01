from typing import Optional
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import logging
import json

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

class RewrittenContent(BaseModel):
    title: str = Field(description="重写后的标题")
    content: str = Field(description="重写后的正文内容")

class UrlContentRewriter:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="deepseek-chat",
            openai_api_key=os.getenv("LLM_API_KEY"),
            base_url=os.getenv("LLM_BASE_URL"),
            temperature=0.7
        )
        
        self.translation_prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个专业的翻译专家。请将以下英文内容翻译成中文，保持原文的语气和风格。"),
            ("user", "{text}")
        ])
        
        # 修改提示词，简化格式要求
        self.rewrite_prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个专业的自媒体写手，擅长用咪蒙公众号的风格写作。
            请重写以下内容，使其更加吸引人。直接返回重写后的内容，不需要任何格式标记。
            
            咪蒙的写作风格特点：
            1. 标题吸引人，带有情感共鸣
            2. 开篇用故事或案例引入
            3. 语言犀利、直击人心
            4. 善用排比、反问等修辞手法
            5. 结尾升华主题，引发思考
            6. 段落简短，节奏感强
            7. 多用感叹号，增强情感表达"""),
            ("user", "{text}")
        ])
        
        self.translation_chain = LLMChain(
            llm=self.llm,
            prompt=self.translation_prompt
        )
        
        self.rewrite_chain = LLMChain(
            llm=self.llm,
            prompt=self.rewrite_prompt
        )
    
    def _is_english(self, text: str) -> bool:
        """简单判断文本是否为英文"""
        return all(ord(char) < 128 for char in text)
    
    def _extract_content(self, url: str) -> str:
        """从URL中提取内容"""
        logger.info(f"开始从URL提取内容: {url}")
        try:
            loader = WebBaseLoader(url)
            docs = loader.load()
            content = "\n".join(doc.page_content for doc in docs)
            logger.info(f"成功提取内容，长度: {len(content)}")
            return content
        except Exception as e:
            logger.error(f"提取内容失败: {str(e)}")
            raise
    
    def _parse_llm_output(self, output: str) -> RewrittenContent:
        """解析LLM输出的内容"""
        logger.info("开始解析LLM输出")
        try:
            # 清理输出文本
            output = output.strip()
            logger.info(f"清理后的输出: {output[:200]}...")  # 只记录前200个字符
            
            # 分割成行
            lines = [line.strip() for line in output.split('\n') if line.strip()]
            logger.info(f"分割后的行数: {len(lines)}")
            
            if not lines:
                raise ValueError("输出内容为空")
            
            # 使用第一行作为标题
            title = lines[0]
            # 其余行作为内容
            content = "\n".join(lines[1:])
            
            logger.info(f"提取的标题: {title}")
            logger.info(f"提取的内容长度: {len(content)}")
            
            return RewrittenContent(
                title=title,
                content=content
            )
            
        except Exception as e:
            logger.error(f"解析输出失败: {str(e)}")
            logger.error(f"原始输出: {output}")
            import traceback
            logger.error(f"错误堆栈: {traceback.format_exc()}")
            raise
    
    def process_url(self, url: str) -> RewrittenContent:
        """处理URL并返回重写后的内容"""
        logger.info(f"开始处理URL: {url}")
        try:
            # 1. 提取内容
            content = self._extract_content(url)
            logger.info(f"提取的原始内容: {content[:500]}...")  # 打印前500个字符
            
            # 2. 如果是英文，先翻译
            if self._is_english(content):
                logger.info("检测到英文内容，进行翻译")
                content = self.translation_chain.invoke({"text": content})["text"]
                logger.info(f"翻译后的内容: {content[:500]}...")
            
            # 3. 重写内容
            logger.info("开始重写内容")
            rewritten = self.rewrite_chain.invoke({"text": content})["text"]
            logger.info(f"LLM原始输出: {rewritten}")  # 打印完整的LLM输出
            
            # 4. 解析输出
            result = self._parse_llm_output(rewritten)
            logger.info("内容解析完成")
            
            return result
            
        except Exception as e:
            logger.error(f"处理URL失败: {str(e)}")
            logger.error(f"错误类型: {type(e)}")
            import traceback
            logger.error(f"错误堆栈: {traceback.format_exc()}")
            raise

def main():
    rewriter = UrlContentRewriter()
    url = input("请输入要处理的URL: ")
    try:
        result = rewriter.process_url(url)
        print("\n重写后的标题:", result.title)
        print("\n重写后的内容:", result.content)
    except Exception as e:
        print(f"处理失败: {str(e)}")

if __name__ == "__main__":
    main() 