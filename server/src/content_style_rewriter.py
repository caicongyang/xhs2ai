from typing import Optional
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv

load_dotenv()

class ContentStyle(BaseModel):
    name: str = Field(description="内容风格名称")
    description: str = Field(description="内容风格描述")
    structure: str = Field(description="文章结构说明")
    examples: list[str] = Field(description="内容风格示例")

class ContentStyleRewriter:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="deepseek-chat",
            openai_api_key=os.getenv("LLM_API_KEY"),
            base_url=os.getenv("LLM_BASE_URL"),
            temperature=0.7
        )
        
        self.styles = {
            "咪蒙体": ContentStyle(
                name="咪蒙体",
                description="""咪蒙体写作特点：
                1. 情感共鸣强烈，直击人心
                2. 善用个人经历和故事性叙述
                3. 语言犀利、直击痛点
                4. 善用排比、反问等修辞手法
                5. 段落简短，节奏感强
                6. 多用感叹号，增强情感表达
                7. 带有情感转折或反转
                8. 结尾升华主题，引发思考""",
                structure="""文章结构：
                1. 开篇：用个人经历或故事引入
                2. 转折：遇到问题或困境
                3. 思考：对问题的深入思考
                4. 解决：找到解决方案
                5. 升华：总结人生道理
                6. 结尾：引发读者共鸣和思考""",
                examples=[
                    """那是我人生最黑暗的时刻。

                    每天加班到凌晨，却依然看不到希望。同事们的冷眼，领导的质疑，让我一度怀疑自己是不是真的不行。

                    直到那天，我遇到了一个改变我命运的人。

                    他告诉我：人生最大的遗憾，不是失败，而是没有尝试。那一刻，我仿佛看到了光。

                    现在回想起来，那些曾经让我痛苦的日子，反而成了我最宝贵的财富。

                    因为，正是那些经历，让我学会了如何在这个世界上，活出最好的自己。""",
                    """"你不行。"

                    这是我听过最多的话。

                    当我决定创业时，所有人都说我不行。
                    当我选择转行时，所有人都说我不行。
                    当我想要改变时，所有人都说我不行。

                    但我知道，人生最大的敌人，不是别人，而是自己。

                    今天，我想告诉所有和我一样的人：
                    不要被别人的否定打败，因为你的未来，掌握在自己手中。"""
                ]
            ),
            "公众号爆款文": ContentStyle(
                name="公众号爆款文",
                description="""公众号爆款文特点：
                1. 标题吸引人，制造悬念
                2. 开篇用数据或现象引入
                3. 分点论述，层次分明
                4. 案例+分析的结构
                5. 语言通俗易懂
                6. 善用小标题
                7. 结尾有行动指南
                8. 互动性强，引导评论""",
                structure="""文章结构：
                1. 开篇：用数据或现象引入话题
                2. 分析：深入分析现象背后的原因
                3. 案例：列举具体案例
                4. 方法：提供解决方案
                5. 总结：总结核心观点
                6. 互动：设置互动话题""",
                examples=[
                    """最近，一项调查显示：超过80%的年轻人都在为副业发愁。

                    为什么？
                    因为工资不够花？
                    因为想要更多收入？
                    还是因为对未来没有安全感？

                    今天，我们就来聊聊这个话题。

                    一、为什么需要副业？
                    在这个时代，单一收入来源已经无法满足我们的需求。物价上涨，房价高企，生活成本不断增加...

                    二、副业选择的关键点
                    1. 时间投入要合理
                    2. 技能要求要匹配
                    3. 收入要可持续
                    4. 风险要可控

                    三、推荐几个适合的副业方向
                    1. 知识付费
                    2. 电商创业
                    3. 自媒体运营
                    4. 技能变现

                    四、如何开始？
                    1. 评估自己的时间和能力
                    2. 选择适合自己的方向
                    3. 制定详细的计划
                    4. 持续学习和调整

                    最后，送大家一句话：
                    副业不是终点，而是新生活的起点。

                    你觉得哪个副业方向最适合你？欢迎在评论区留言讨论。""",
                    """"月入10万，真的很难吗？"

                    最近，我收到很多读者的私信，都在问这个问题。

                    说实话，这个问题没有标准答案。

                    因为每个人的起点不同，能力不同，机遇不同。

                    但是，我可以分享一些我观察到的规律：

                    一、高收入人群的共同特点
                    1. 持续学习
                    2. 善于思考
                    3. 敢于尝试
                    4. 执行力强

                    二、收入提升的关键因素
                    1. 专业技能
                    2. 人脉资源
                    3. 市场洞察
                    4. 机会把握

                    三、具体行动建议
                    1. 提升专业能力
                    2. 拓展人脉圈
                    3. 关注市场动态
                    4. 把握机会

                    记住：
                    收入提升是一个渐进的过程，需要时间和耐心。

                    你觉得提升收入最大的障碍是什么？欢迎在评论区分享你的想法。"""
                ]
            )
        }
        
        self.content_prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个专业的文章改写专家。请根据给定的风格和内容，重写文章。
            要求：
            1. 严格遵循指定风格的特点和结构
            2. 保持原文的核心观点
            3. 增加吸引力和可读性
            4. 符合目标受众的阅读习惯
            5. 保持文章的逻辑性和连贯性"""),
            ("user", """风格：{style}
            风格描述：{style_description}
            文章结构：{style_structure}
            示例：{style_examples}
            原文内容：{content}
            请按照指定风格重写这篇文章。""")
        ])
        
        self.content_chain = LLMChain(
            llm=self.llm,
            prompt=self.content_prompt
        )
    
    def rewrite_content(self, content: str, style: str) -> str:
        """根据指定风格重写文章内容"""
        if style not in self.styles:
            raise ValueError(f"不支持的内容风格：{style}。支持的风格有：{', '.join(self.styles.keys())}")
        
        style_info = self.styles[style]
        result = self.content_chain.invoke({
            "style": style,
            "style_description": style_info.description,
            "style_structure": style_info.structure,
            "style_examples": "\n\n".join(style_info.examples),
            "content": content
        })
        
        return result["text"].strip()

def main():
    rewriter = ContentStyleRewriter()
    content = input("请输入文章内容：")
    print("\n支持的内容风格：")
    for style in rewriter.styles.keys():
        print(f"- {style}")
    
    style = input("\n请选择内容风格：")
    try:
        new_content = rewriter.rewrite_content(content, style)
        print(f"\n重写后的内容：\n{new_content}")
    except ValueError as e:
        print(f"错误：{str(e)}")

if __name__ == "__main__":
    main() 