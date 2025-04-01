from typing import Optional
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv

load_dotenv()

class TitleStyle(BaseModel):
    name: str = Field(description="标题风格名称")
    description: str = Field(description="标题风格描述")
    examples: list[str] = Field(description="标题风格示例")

class TitleRewriter:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="deepseek-chat",
            openai_api_key=os.getenv("LLM_API_KEY"),
            base_url=os.getenv("LLM_BASE_URL"),
            temperature=0.7
        )
        
        self.styles = {
            "咪蒙体": TitleStyle(
                name="咪蒙体",
                description="""咪蒙体标题特点：
                1. 情感共鸣强烈
                2. 直击人心
                3. 带有个人经历或故事性
                4. 善用感叹号
                5. 标题中常包含数字或具体场景
                6. 带有情感转折或反转""",
                examples=[
                    "我花了3年时间，终于明白：人生最大的遗憾，是没早点学会这件事！",
                    "那个月薪3000的实习生，教会了我人生最重要的道理",
                    "当所有人都说我不行时，我选择了一个人默默努力，结果让人意外"
                ]
            ),
            "震惊体": TitleStyle(
                name="震惊体",
                description="""震惊体标题特点：
                1. 以"震惊"、"惊呆"、"万万没想到"等词开头
                2. 夸张的表达方式
                3. 制造悬念和反转
                4. 使用感叹号
                5. 带有数字或具体数据
                6. 突出意外性和戏剧性""",
                examples=[
                    "震惊！这个90后小伙竟然靠这个副业月入10万！",
                    "万万没想到！这个普通家庭主妇的理财方式让专家都惊呆了！",
                    "惊呆！原来这才是最赚钱的副业，99%的人都不知道！"
                ]
            ),
            "悬念体": TitleStyle(
                name="悬念体",
                description="""悬念体标题特点：
                1. 以"原来"、"终于"、"终于明白"等词开头
                2. 制造悬念和好奇心
                3. 暗示有重要发现或转折
                4. 使用省略号
                5. 带有反转或意外
                6. 引发读者思考""",
                examples=[
                    "原来这才是最赚钱的副业，可惜知道的人太少了...",
                    "终于明白为什么富人越来越富，穷人越来越穷...",
                    "当所有人都说这个项目会失败时，我发现了惊人的真相..."
                ]
            )
        }
        
        self.title_prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个专业的标题改写专家。请根据给定的风格和内容，生成一个吸引人的标题。
            要求：
            1. 严格遵循指定风格的特点
            2. 标题要吸引人点击
            3. 与原文内容相关
            4. 长度适中（15-30字为宜）
            5. 避免标题党，保持真实性"""),
            ("user", """风格：{style}
            风格描述：{style_description}
            示例：{style_examples}
            原文内容：{content}
            请生成一个符合该风格的标题。""")
        ])
        
        self.title_chain = LLMChain(
            llm=self.llm,
            prompt=self.title_prompt
        )
    
    def rewrite_title(self, content: str, style: str) -> str:
        """根据指定风格重写标题"""
        if style not in self.styles:
            raise ValueError(f"不支持的标题风格：{style}。支持的风格有：{', '.join(self.styles.keys())}")
        
        style_info = self.styles[style]
        result = self.title_chain.invoke({
            "style": style,
            "style_description": style_info.description,
            "style_examples": "\n".join(style_info.examples),
            "content": content
        })
        
        return result["text"].strip()

def main():
    rewriter = TitleRewriter()
    content = input("请输入文章内容：")
    print("\n支持的标题风格：")
    for style in rewriter.styles.keys():
        print(f"- {style}")
    
    style = input("\n请选择标题风格：")
    try:
        new_title = rewriter.rewrite_title(content, style)
        print(f"\n重写后的标题：{new_title}")
    except ValueError as e:
        print(f"错误：{str(e)}")

if __name__ == "__main__":
    main() 