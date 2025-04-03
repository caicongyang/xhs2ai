import os
import json
import logging
import uuid
import random
from typing import Optional, Dict, Any, List
from enum import Enum
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 杂志卡片风格枚举
class MagazineStyle(str, Enum):
    MINIMALIST = "minimalist"
    BOLD_MODERN = "bold_modern"
    ELEGANT_VINTAGE = "elegant_vintage"
    FUTURISTIC_TECH = "futuristic_tech"
    SCANDINAVIAN = "scandinavian"
    ART_DECO = "art_deco"
    JAPANESE_MINIMALISM = "japanese_minimalism"
    POSTMODERN_DECONSTRUCTION = "postmodern_deconstruction"
    PUNK = "punk"
    BRITISH_ROCK = "british_rock"
    BLACK_METAL = "black_metal"
    MEMPHIS_DESIGN = "memphis_design"
    CYBERPUNK = "cyberpunk"
    POP_ART = "pop_art"
    DECONSTRUCTED_SWISS = "deconstructed_swiss"
    VAPORWAVE = "vaporwave"
    NEO_EXPRESSIONISM = "neo_expressionism"
    EXTREME_MINIMALISM = "extreme_minimalism"
    NEO_FUTURISM = "neo_futurism"
    SURREALIST_COLLAGE = "surrealist_collage"
    NEO_BAROQUE = "neo_baroque"
    LIQUID_DIGITAL_MORPHISM = "liquid_digital_morphism"
    HYPERSENSORY_MINIMALISM = "hypersensory_minimalism"
    NEO_EXPRESSIONIST_DATA = "neo_expressionist_data"
    VICTORIAN = "victorian"
    BAUHAUS = "bauhaus"
    CONSTRUCTIVISM = "constructivism"
    MEMPHIS = "memphis"
    GERMAN_EXPRESSIONISM = "german_expressionism"

# 请求模型
class MagazineCardRequest(BaseModel):
    content: str
    style: Optional[MagazineStyle] = None
    qr_code_url: Optional[str] = None  # URL或已上传文件的路径
    product_image_url: Optional[str] = None  # URL或已上传文件的路径
    product_price: Optional[str] = None
    product_description: Optional[str] = None
    qr_code_file: Optional[str] = None  # 保存的二维码文件路径
    product_image_file: Optional[str] = None  # 保存的产品图片路径

# 响应模型
class MagazineCardResponse(BaseModel):
    card_id: str
    html: str
    style: MagazineStyle
    file_path: Optional[str] = None

class MagazineCardGenerator:
    """
    杂志风格卡片生成器
    这个类生成具有高端杂志设计风格的HTML卡片
    """
    
    def __init__(self, model_name: str = None, temperature: float = 0.7):
        """
        初始化杂志卡片生成器
        
        Args:
            model_name: 使用的语言模型名称
            temperature: 生成的创造性程度控制参数
        """
        # 如果未指定模型，尝试从环境变量获取或使用默认值
        self.model_name = model_name or os.getenv("LLM_MODEL", "deepseek-chat")
        self.temperature = temperature
        
        # 获取API密钥和基础URL
        api_key = os.getenv("LLM_API_KEY", "")
        base_url = os.getenv("LLM_BASE_URL")
        
        if not api_key:
            logger.warning("未配置LLM_API_KEY环境变量，可能影响功能")
            
        try:
            # 初始化大语言模型
            self.llm = ChatOpenAI(
                model_name=self.model_name, 
                temperature=temperature,
                openai_api_key=api_key,
                base_url=base_url
            )
            logger.info(f"大语言模型初始化成功，使用模型: {self.model_name}")
        except Exception as e:
            logger.error(f"大语言模型初始化失败: {str(e)}")
            # 模型初始化失败时不立即退出，而是在调用时再处理异常
            self.llm = None
            
        # 创建输出目录
        self.output_dir = "magazine_cards";
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 风格描述映射表
        self.style_descriptions = {
            MagazineStyle.MINIMALIST: "采用极简主义风格设计，遵循'少即是多'的理念。使用大量留白创造呼吸空间，仅保留最必要的元素。配色方案限制在2-3种中性色，主要为白色背景配以黑色或深灰色文字。排版应精确到像素级别，使用精心设计的网格系统和黄金比例。字体选择无衬线字体如Helvetica或Noto Sans，字重变化作为主要层次手段。装饰元素几乎为零，仅使用极细的分隔线和微妙的阴影。整体设计应呈现出克制、优雅且永恒的美学，让内容本身成为焦点。参考Dieter Rams的设计原则和日本无印良品(MUJI)的产品美学。",
            
            MagazineStyle.BOLD_MODERN: "采用大胆现代风格设计，打破传统排版规则，创造强烈视觉冲击。使用鲜艳对比色如荧光粉、电子蓝、亮黄等，背景可使用深色或鲜艳色块。排版应不对称且动态，标题文字极大（至少60px），可使用极粗字重或压缩字体，甚至允许文字重叠和溢出。图形元素应用几何形状，边缘锐利，可添加不规则裁切效果。层次感通过大小、颜色和位置的极端对比创造。整体设计应充满张力和活力，像一张视觉宣言，参考Wired杂志和Pentagram设计工作室的作品。添加微妙动效如悬停放大或颜色变换，增强现代感。",
            
            MagazineStyle.ELEGANT_VINTAGE: "采用优雅复古风格设计，重现20世纪初期印刷品的精致美学。使用米色或淡黄色纸张质感背景，配以深棕、暗红等老式印刷色。字体必须使用衬线字体如Baskerville或Noto Serif，标题可使用装饰性字体。排版应对称且庄重，遵循传统书籍设计原则。装饰元素包括精致的花纹边框、古典分隔线和角落装饰，可添加轻微做旧效果如纸张纹理和微妙污点。图像应用复古滤镜处理，呈现褪色照片效果。整体设计应散发出典雅、成熟且历经时间考验的气质，参考The New Yorker和老式法国时尚杂志的设计语言。",
            
            MagazineStyle.FUTURISTIC_TECH: "采用未来科技风格设计，呈现高度发达的数字界面美学。背景必须使用深蓝或纯黑，配以霓虹蓝、电子紫等高饱和度荧光色。排版应模拟高科技显示界面，使用等宽字体如Space Mono，添加数据可视化元素如图表、网格和代码片段。装饰元素包括科技感线条、HUD界面框架和全息投影效果。必须添加动态元素如扫描线、数据流动效果和微妙闪烁。可使用半透明叠加层和模糊效果创造深度。整体设计应呈现出未来感、高科技和信息密集的视觉体验，仿佛来自几十年后的界面，参考《银翼杀手2049》和《攻壳机动队》的视觉设计。",
            
            MagazineStyle.SCANDINAVIAN: "采用斯堪的纳维亚风格设计，体现北欧设计的简约与功能美学。使用纯白背景，配以特定的北欧色调如淡蓝、浅灰、原木色和淡粉。排版应极度克制且有序，使用大量留白，但与极简主义不同，应加入温暖质感。字体选择无衬线几何字体如Futura或Circular，字重轻盈。装饰元素应极少但精心选择，可使用简单几何图案如三角形和线条，参考马勒维奇的构成主义。图像应明亮、简洁且自然。整体设计应呈现出清爽、实用且温暖的北欧特质，平衡美学与功能性，参考Kinfolk杂志和丹麦设计品牌HAY的产品美学。",
            
            MagazineStyle.ART_DECO: "采用艺术装饰风格设计，重现1920-30年代的奢华与几何美学。必须使用黑金配色方案，金色应为真实金属色#D4AF37而非黄色。排版应严格对称，使用装饰性强的字体，特别是几何感强烈的字体如Broadway或现代变体。装饰元素是关键，必须包含扇形放射纹、锯齿形、几何图案和对称花纹。边框应华丽且具结构性，角落处理需特别精致。可添加仿金箔和大理石纹理增强奢华感。整体设计应呈现出大胆、奢华且充满时代特色的视觉效果，仿佛来自爵士时代的纽约或巴黎，参考克莱斯勒大厦和《了不起的盖茨比》电影海报的视觉语言。",
            
            MagazineStyle.JAPANESE_MINIMALISM: "采用日式极简风格设计，体现'侘寂'(Wabi-Sabi)美学——接受不完美、无常与不完整的哲学。使用极度克制的色彩，主要为白、灰、黑和淡墨色。留白(Ma)是核心元素，至少70%的设计应为空白，创造宁静感。排版应非对称且垂直，可使用垂直书写模式，体现日本传统排版。字体应极度简约，笔画轻盈。装饰元素几乎为零，但可添加一处墨迹、简单印章或单一线条作为点睛之笔。整体设计应呈现出深度宁静、精致且富有禅意的视觉体验，仿佛一页来自京都寺院的书页，参考原研哉的MUJI设计理念和日本传统水墨画的留白美学。",
            
            MagazineStyle.POSTMODERN_DECONSTRUCTION: "采用后现代解构风格设计，彻底打破传统设计规则和网格系统。排版应故意不规则且混乱，使用多种字体、大小和方向，文字可重叠、倾斜或被切割。必须使用不和谐的色彩组合，打破传统配色规则。图形元素应包含随机几何形状、不完整图形和故意扭曲的元素。层次感通过混乱中的秩序创造，可使用碎片化图像和拼贴效果。装饰元素应看似随意但精心安排，如手绘线条、涂鸦和复印机错误效果。整体设计应挑战视觉常规，创造一种有控制的混乱美学，参考David Carson的Ray Gun杂志设计和Wolfgang Weingart的实验性排版作品。",
            
            MagazineStyle.PUNK: "采用朋克风格设计，体现DIY精神和反叛文化。必须使用粗糙、手工制作的视觉效果，如剪贴报纸、复印机扭曲和胶带痕迹。色彩应高对比且原始，主要使用黑、白、红色，可添加荧光色点缀。排版必须粗暴且不规则，使用手写、喷漆或剪贴字体，文字可被切割或部分遮挡。装饰元素应包含安全别针、胶带、污渍和撕裂效果。图像应使用高对比度、粗颗粒处理，模拟劣质印刷。必须添加随机元素如涂鸦、X标记和感叹号。整体设计应呈现出原始、粗糙且充满能量的视觉冲击，仿佛一张来自70-80年代伦敦或纽约地下场景的传单，参考Sex Pistols的专辑封面和早期朋克杂志。",
            
            MagazineStyle.BRITISH_ROCK: "采用英伦摇滚风格设计，融合英国传统元素与反叛摇滚美学。色彩应使用英国国旗色系（红、白、蓝）或复古棕色调，可添加做旧效果。排版应混合经典与现代，使用衬线字体与手写字体的组合，标题可使用哥特式或维多利亚风格字体。装饰元素应包含英国符号的现代演绎，如Union Jack图案、皇家纹章或伦敦地标的抽象表现。图像应使用复古滤镜，模拟老式胶片效果。可添加唱片、吉他或音符等音乐元素作为点缀。整体设计应呈现出典雅中带有叛逆、传统中融入现代的独特英伦风格，参考Oasis、The Beatles专辑封面和NME杂志的视觉语言。",
            
            MagazineStyle.BLACK_METAL: "采用黑金属风格设计，体现极致黑暗美学和神秘主义。背景必须为纯黑或极深灰度，创造压抑氛围。排版应使用古老、难以辨认的哥特式字体或锋利的几何字体，文字应充满威胁性。图像处理必须高对比度单色，可添加噪点和划痕效果。装饰元素应包含荆棘、倒十字、神秘符号和古代文字。可添加微妙噪声纹理模拟老式黑白照片效果。整体设计应呈现出黑暗、神秘且带有仪式感的视觉体验，仿佛来自挪威森林中的地下音乐场景，参考早期黑金属乐队如Mayhem和Emperor的专辑封面以及北欧古老符文。避免使用任何明亮色彩，除非是对比色如血红。",
            
            MagazineStyle.MEMPHIS_DESIGN: "采用孟菲斯风格设计，重现80年代意大利设计运动的前卫美学。必须使用鲜艳且不协调的色彩组合，如亮粉、青绿、鲜黄和橙色，创造故意的视觉冲突。几何形状是核心元素，应使用不规则的基本形状如锯齿线、波浪线、圆点和条纹，图案应随机且充满童趣。排版应活泼且不拘一格，可使用多种字体和大小。装饰元素应包含特定的80年代图案，如拟物化格子和彩色条纹。可添加简单的3D几何体和典型的'孟菲斯网格'背景。整体设计应呈现出怀旧未来主义、不严肃且反传统的视觉体验，仿佛来自80年代的米兰，参考Ettore Sottsass的原始孟菲斯作品和当代设计师Camille Walala的再诠释。",
            
            MagazineStyle.CYBERPUNK: "采用赛博朋克风格设计，体现'高科技，低生活'的反乌托邦美学。背景必须为深色（黑色或深蓝），配以霓虹色彩如荧光粉、电子蓝和酸性绿，创造夜间都市氛围。排版应高度技术化，混合未来字体与损坏或故障效果，可使用日语、中文或俄语元素增加异国情调。装饰元素必须包含科技废土特征如电路板图案、数据矩阵和引用电子设备界面的元素。图像应使用高对比度和颜色分离效果，模拟霓虹照明。可添加静电、干扰线和像素化等故障艺术效果。混合高科技与街头文化元素，如全息贴纸与涂鸦组合。整体设计应呈现出未来主义却破败、技术先进却社会衰落的视觉矛盾，参考《银翼杀手》、《神经漫游者》和《攻壳机动队》的视觉语言，以及现实中的东京新宿和香港街头。",
            
            MagazineStyle.POP_ART: "采用波普艺术风格设计，重现60年代艺术运动的大胆美学。必须使用亮丽原色（红、黄、蓝）和黑色轮廓线，色彩应平面且不含渐变。排版应大胆且戏剧化，使用漫画风格的字体和拟声词。图像处理必须模拟印刷网点效果（半调点），特别是对照片进行高对比度处理，转化为大点阵图案。装饰元素应包含漫画风格的对话框、思考泡泡和动作线条。内容应引用流行文化和消费主义元素，如产品包装或名人形象，进行重复和变形处理。可添加点状背景和波点图案。整体设计应呈现出鲜艳、直接且具有商业感的视觉冲击，仿佛一页来自60年代的漫画或安迪·沃霍尔的丝网版画，挑战艺术与商业的界限，参考利希滕斯坦和沃霍尔的代表作品。",
            
            MagazineStyle.DECONSTRUCTED_SWISS: "采用瑞士国际主义风格的解构版设计，在严格网格系统的基础上进行有意识的破坏和重组。排版应基于经典瑞士网格，但故意打破和扭曲，创造受控的混乱美学。色彩应主要使用黑白灰，但可在关键处添加鲜明色彩如红色作为解构元素。字体必须使用无衬线几何字体如Helvetica或Akzidenz Grotesk，但通过不规则间距、倾斜和故意的错位处理。图像可被切割、部分隐藏或与文字重叠，打破传统层次关系。装饰元素应极少，但可添加简单几何形状的不完整或扭曲版本。网格线可局部显露，但应被刻意破坏。整体设计应呈现出高度理性中的战略性混乱，仿佛是经典瑞士设计在当代语境中的反思与重构，参考Wolfgang Weingart和April Greiman的解构主义作品，以及90年代前卫杂志Ray Gun的页面设计。",
            
            MagazineStyle.VAPORWAVE: "采用蒸汽波美学设计，体现互联网亚文化的怀旧未来主义。色彩必须使用特定的渐变组合，主要为粉紫色到青蓝色，创造黄昏或霓虹效果。排版应混合古典与数字元素，使用Times New Roman或Arial等90年代早期电脑字体，必须包含日语片假名或希腊字母等外语元素增加异国情调。装饰元素必须包含强烈的90年代互联网美学，如早期3D渲染、大理石纹理、古典雕塑、棋盘格、热带植物（特别是棕榈树）和老式电子产品。图像处理应低保真且故意做旧，模拟VHS带失真效果。必须添加网格线、扫描线和故障艺术元素。可加入经典Windows 95/98界面元素如错误弹窗或进度条。整体设计应呈现出怀旧却未来、熟悉却陌生的视觉矛盾，营造一种替代现实90年代的数字乌托邦感，参考Macintosh Plus的《Floral Shoppe》专辑封面和互联网艺术家如Vektroid的视觉作品。",
            
            MagazineStyle.NEO_EXPRESSIONISM: "采用新表现主义风格设计，体现80年代艺术运动的原始能量和情感表达。色彩应强烈且不协调，使用原始、未经调和的色彩组合，可包含泼溅和涂抹效果。排版应极度主观且情绪化，使用手写或扭曲的字体，文字可粗暴地穿插于图像中。图像处理必须强调原始表现力，可使用粗糙笔触、不完整线条和强烈变形，模拟油画肌理。装饰元素应包含看似随意但充满表现力的符号、原始图腾和神话参考。可添加拼贴效果和多层次纹理，如粗砂纸或墙面剥落效果。整体设计应呈现出强烈的个人情感表达和原始能量，仿佛是内心冲突的外在表现，参考Jean-Michel Basquiat、Julian Schnabel和Francesco Clemente的绘画作品，以及80年代东村艺术场景的视觉语言。应避免任何过于精致或计算机生成的效果，强调手工痕迹和情感真实性。",
            
            MagazineStyle.EXTREME_MINIMALISM: "采用极简主义的极端版本设计，将'少即是多'的理念推向极致。留白必须占据至少90%的设计空间，创造极度的空旷感。色彩应限制在黑、白、灰三色，且仅使用一种色调变化。排版必须使用单一字体家族，且仅选择一种字重，字号变化不超过两级。装饰元素几乎为零，最多使用一条极细线条（0.25pt）作为分隔。图像如使用，必须极度克制且抽象，如单一几何形状或极简黑白照片，且占比不超过15%。构图应绝对对称或遵循严格的黄金分割比例。可使用微妙的纸张纹理或极浅浮雕效果增添触感，但必须几乎不可见。整体设计应呈现出极致的纯净感和冥想般的宁静，仿佛一页来自未来极简主义修道院的手册，参考John Pawson的建筑作品和Kenya Hara的纸艺设计。",
            
            MagazineStyle.NEO_FUTURISM: "采用新未来主义风格设计，体现当代建筑和产品设计中的前沿美学。形态应强调流线型曲线和有机几何形状，避免直角和静态形式。色彩应使用金属色调（银、铬、钛）配以单一强调色，如深蓝或紫红色。材质表现必须模拟高科技材料如碳纤维、液态金属和纳米涂层，创造超光滑或极度精细纹理的视觉效果。排版应使用定制几何字体，字形应有未来感但保持高可读性。装饰元素应融入功能性暗示，如隐形接口元素或生物启发型结构。可添加微妙的环境光效果，如反射和光晕。整体设计应呈现出先进、优雅且超越时代的视觉体验，仿佛来自近未来的高端设计产品，参考扎哈·哈迪德的参数化建筑和苹果设计团队的产品美学演变，以及电影《她》中的用户界面设计。",
            
            MagazineStyle.SURREALIST_COLLAGE: "采用超现实主义数字拼贴风格设计，创造梦境般的视觉叙事。图像处理是核心，应组合不相关元素创造意外联系，如古典雕塑与现代电子产品、动物与建筑结构的混合体、或自然元素与几何抽象的并置。背景可使用超现实空间如无限延伸的棋盘格、不可能建筑或扭曲透视。色彩应创造奇异感，可使用反相色、梦幻渐变或刻意违反自然的配色方案。排版应成为构图的视觉元素，文字可沿着物体轮廓流动或漂浮在空中。装饰元素应包含超现实主义标志性符号如融化的钟表、眼睛、云朵和门。可添加微妙的动态效果如漂浮感或物理不可能的阴影。整体设计应呈现出梦与现实边界模糊的视觉体验，挑战观者的逻辑思维，参考达利、马格里特和当代数字艺术家如Scott Listfield的作品。",
            
            MagazineStyle.NEO_BAROQUE: "采用新巴洛克数字风格设计，将17世纪的华丽美学重新诠释为数字形式。装饰是核心元素，应使用极其丰富的数字化巴洛克花纹、卷轴和浮雕效果，但必须保持数字感而非简单模仿古典装饰。色彩应用深沉奢华的色调如深红、宝蓝、紫罗兰和金色，可添加高度细节的金属效果和光泽感。排版应使用装饰性强的现代衬线字体，标题可使用数字化的花体字。图像处理应强调戏剧性光影效果，模拟巴洛克绘画的明暗对比(chiaroscuro)效果。装饰边框必须极其精细且层次丰富，可使用数字浮雕和三维效果。整体设计应呈现出数字时代的奢华与戏剧性，仿佛巴洛克大师如贝尼尼穿越时空创作的数字作品，参考当代时尚品牌Versace的视觉语言和电影《路易十四的死亡》的美术设计。",
            
            MagazineStyle.LIQUID_DIGITAL_MORPHISM: "采用液态数字形态主义风格设计，结合流体动力学与数字艺术创造超前卫视觉体验。背景必须使用高级流体渐变，如紫罗兰到深蓝的流动过渡，应呈现出真实液体的流动质感。形状必须摒弃刚性几何，全部使用流动形态，仿佛高粘度液体在零重力环境下的状态。色彩应基于虹彩油渍效果，创造多维光谱渐变，可添加反光和折射效果。排版应完全融入液态美学，文字可沿着液体形态流动或形成液滴形状。装饰元素应模拟先进物理模拟效果，如表面张力、涟漪和液滴融合。可添加微妙的动态暗示，如悬停效果产生波纹。整体设计应呈现出超越物理定律的未来视觉体验，仿佛来自量子计算时代的界面设计，参考实验性数字艺术家如Ari Weinkle的作品和先进CAD软件中的流体模拟效果。",
            
            MagazineStyle.HYPERSENSORY_MINIMALISM: "采用超感官极简主义风格设计，将极简美学推向感官极限。表面上看似极简，但通过微妙的纹理、触觉暗示和动态响应创造深层次感官体验。背景应使用单一色调但包含极其精细的纹理变化，如丝绸、砂岩或液体表面的微妙涟漪。色彩应限制在白、灰、米色等中性色系，但可添加几乎不可见的色调变化。排版应使用极简字体，但通过微妙的阴影、浮雕或光泽效果增添触感。可添加对用户操作的动态响应暗示，如悬停时的微妙发光或纹理变化。整体设计应平衡数字简约与感官丰富，创造一种需要投入注意力才能完全欣赏的视觉体验，参考高端日本或斯堪的纳维亚产品设计和先进用户界面中的触觉反馈设计。",
            
            MagazineStyle.NEO_EXPRESSIONIST_DATA: "采用新表现主义数据可视化风格设计，将抽象表现主义艺术与数据可视化完美融合。必须使用看似随意的笔触、泼溅和涂抹效果，但实际上是由精确数据驱动生成的。色彩应使用情绪化且强烈的组合，但每种颜色必须映射到特定数据点或数值范围。排版应融入可视化系统，文字可沿着数据曲线流动或在图表结构中布局。装饰元素应包含数据符号的抽象表达，如股票走势转化为表现性线条或用户行为模式转化为色彩爆发。可添加图例或注释说明数据来源，但须保持艺术性。整体设计应在混乱中蕴含秩序，看似艺术性的表达实际建立在精确数据基础上，参考Processing基金会的数据艺术项目和艺术家Fernanda Viégas与Martin Wattenberg的协作作品。",
            
            MagazineStyle.VICTORIAN: "采用维多利亚风格设计，重现19世纪英国维多利亚时期的华丽印刷美学。背景必须使用米色或淡黄色纸张质感，配以棕色、深红和金色等传统印刷色调。排版应高度对称且装饰性强，使用复杂的衬线字体，正文应排列紧密。必须使用精细木刻风格的插图和边框，可采用花卉、鸟类和自然元素的精细线条描绘。装饰元素应包含维多利亚时期特有的装饰如花边纹样、刺绣效果和带有卷曲触须的字母。可添加做旧效果如轻微污点、磨损边缘和褪色。整体设计应呈现出精致、传统且带有历史感的视觉体验，仿佛来自19世纪的高质量印刷品，参考威廉·莫里斯的设计作品和《潘趣》杂志的版式。",
            
            MagazineStyle.BAUHAUS: "采用包豪斯风格设计，体现20世纪早期德国包豪斯学校的功能主义美学。必须使用基本几何形状作为核心设计元素，如方形、圆形和三角形，保持形状的纯粹性。色彩应限制在原色（红、黄、蓝）加黑白，所有色彩必须平面且不含渐变或阴影。排版必须遵循严格的网格系统，使用无衬线几何字体如Futura，字体大小变化应遵循明确的层次比例。装饰元素应与功能相结合，避免纯装饰性设计。可添加几何形状的简单动态暗示，如叠加透明度。整体设计应体现'形式服从功能'的理念，呈现出理性、明确且前卫的视觉语言，参考包豪斯大师如Josef Albers、László Moholy-Nagy和Herbert Bayer的作品。",
            
            MagazineStyle.CONSTRUCTIVISM: "采用构成主义风格设计，体现20世纪早期俄国前卫艺术运动的革命性美学。必须使用大胆的几何形状和对角线元素创造动态张力，强调结构与构成。色彩限制在红色、黑色和白色，偶尔可使用黄色作为强调，必须平面且不含渐变。排版应成为构图的主要视觉元素，使用工业感强的无衬线字体，文字可沿着对角线排列或与几何形状融合。装饰元素应包含工业符号、齿轮、箭头和光线束，暗示力量和进步。可添加摄影蒙太奇元素，如多重曝光效果或碎片化图像。整体设计应呈现出前卫、动态且具有宣传性的视觉冲击，仿佛一张来自革命时期的宣传海报，参考El Lissitzky、Alexander Rodchenko和Varvara Stepanova的作品。",
            
            MagazineStyle.MEMPHIS: "采用孟菲斯风格设计，重现1980年代意大利孟菲斯设计小组的前卫美学。必须使用鲜艳且不协调的色彩组合，如亮粉、青绿、鲜黄和橙色，创造故意的视觉冲突。形状应使用几何混合体，如条纹与波点、锯齿与曲线的组合。排版应俏皮且不拘一格，可使用多种字体风格。装饰元素必须包含特定的孟菲斯图案，如抽象的'涂鸦'图案、纸屑图案和几何网格。可添加简单的3D几何体和不对称构图。整体设计应挑战严肃设计规范，呈现出有趣、前卫且具有后现代精神的视觉体验，参考Ettore Sottsass和Nathalie Du Pasquier的原始孟菲斯作品。",
            
            MagazineStyle.GERMAN_EXPRESSIONISM: "采用德国表现主义风格设计，体现20世纪初期德国表现主义运动的强烈情感表达。背景应使用深色调如深蓝、黑色或暗红色，创造戏剧性氛围。图像处理应强调变形和夸张，使用锐角、扭曲透视和强烈的明暗对比，模拟木刻版画质感。排版应不规则且情绪化，使用哥特式或断裂感的字体，可故意扭曲变形。装饰元素应包含象征性符号和手绘效果，如粗粝线条和阴影。可添加电影蒙太奇效果，模拟20年代德国电影的视觉风格。整体设计应呈现出焦虑、不安且情绪强烈的视觉体验，仿佛一页来自《呐喊》或《蓝骑士》艺术运动的画作，参考Ernst Ludwig Kirchner、Emil Nolde的版画和电影《卡里加里博士的小屋》的视觉设计。"
        }
        
        # 构建提示模板
        self.prompt_template = self._create_prompt_template()
        
        # 如果LLM初始化成功，创建生成链
        if self.llm:
            self.chain = LLMChain(llm=self.llm, prompt=self.prompt_template)
        else:
            self.chain = None
    
    def _create_prompt_template(self) -> PromptTemplate:
        """
        创建提示模板
        
        Returns:
            PromptTemplate: 用于生成卡片的提示模板
        """
        template = """
你是一位国际顶尖的数字杂志艺术总监和前端开发专家，曾为Vogue、Elle等时尚杂志设计过数字版面，擅长将奢华杂志美学与现代网页设计完美融合，创造出令人惊艳的视觉体验。

请按照以下要求，设计高级时尚杂志风格的知识卡片，将日常信息以精致奢华的杂志编排呈现，让用户感受到如同翻阅高端杂志般的视觉享受。

**设计风格:**
{style_description}

**必须包含以下元素，但视觉表现根据风格定制:**
* 日期区域：以风格特有的方式呈现当前日期
* 标题和副标题：根据风格调整字体、大小、排版方式
* 引用区块：设计独特的引用样式，体现风格特点
* 核心要点列表：以符合风格的方式呈现列表内容
* 商品展示区：设计一个与风格匹配的商品图片展示模块，包含图片、价格和简短描述
* 二维码区域：将二维码融入整体设计
* 编辑笔记/小贴士：设计成符合风格的边栏或注释

**技术规范:**
* 使用HTML5、Font Awesome、Tailwind CSS和必要的JavaScript
* 引入以下资源:
  * Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css
  * Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css
  * 中文字体: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap
* 可考虑添加微妙的动效，如页面载入时的淡入效果或微妙的悬停反馈
* 确保代码简洁高效，注重性能和可维护性
* 使用CSS变量管理颜色和间距，便于风格统一

**输出要求:**
* 提供完整的HTML代码，包含所有CSS和JavaScript
* 设计的宽度为440px，高度不要超过1280px
* 对主题内容进行抽象提炼，只显示列点或最核心句引用
* 永远用中文输出，装饰元素可用法语、英语等其他语言显得有逼格
* 二维码使用以下地址（如提供）：{qr_code_url}
* 商品图片使用以下地址（如提供）：{product_image_url}
* 商品价格：{product_price}
* 商品描述：{product_description}

**内容:**
{content}

请生成完整的HTML代码，不要包含解释性文字或任何其他注释，只返回可直接使用的HTML文件内容，不要使用代码高亮```html来包裹内容。
"""
        return PromptTemplate(
            input_variables=[
                "style_description", 
                "content", 
                "qr_code_url", 
                "product_image_url", 
                "product_price", 
                "product_description"
            ],
            template=template
        )
    
    def generate_card(self, request: MagazineCardRequest) -> MagazineCardResponse:
        """
        生成杂志风格卡片
        
        Args:
            request: 卡片生成请求
            
        Returns:
            生成的杂志卡片响应，包含文件路径
        """
        # 检查LLM是否已初始化
        if not self.llm or not self.chain:
            error_msg = "大语言模型未正确初始化，无法生成卡片"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
        # 如果没有指定风格，随机选择一种
        style = request.style if request.style else random.choice(list(MagazineStyle))
        logger.info(f"使用风格: {style.value}")
        
        # 获取风格描述
        style_description = self.style_descriptions.get(
            style, 
            "采用现代杂志风格设计，融合优雅与时尚元素。"
        )
        
        # 处理上传的文件
        qr_code_url = request.qr_code_url
        product_image_url = request.product_image_url
        
        # 如果有上传文件，优先使用文件路径
        if request.qr_code_file:
            qr_code_url = f"/api/files/{request.qr_code_file}"
            logger.info(f"使用上传的二维码文件: {request.qr_code_file}")
            
        if request.product_image_file:
            product_image_url = f"/api/files/{request.product_image_file}"
            logger.info(f"使用上传的产品图片: {request.product_image_file}")
        
        # 准备提示输入
        prompt_inputs = {
            "style_description": style_description,
            "content": request.content,
            "qr_code_url": qr_code_url or "",
            "product_image_url": product_image_url or "",
            "product_price": request.product_price or "",
            "product_description": request.product_description or ""
        }
        
        try:
            # 生成HTML内容
            logger.info("开始生成杂志卡片...")
            result = self.chain.invoke(prompt_inputs)
            html_content = result.get("text", "")
            
            if not html_content.strip():
                raise ValueError("生成的HTML内容为空")
                
            # 生成卡片ID
            card_id = str(uuid.uuid4())
            
            # 创建输出目录结构（如果不存在）
            os.makedirs(self.output_dir, exist_ok=True)
            
            # 保存HTML文件，使用时间戳作为文件名的一部分
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"magazine_card_{timestamp}_{style.value}_{card_id}.html"
            file_path = os.path.join(self.output_dir, filename)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            
            logger.info(f"杂志卡片生成成功，保存至: {file_path}")
                
            # 返回响应，包含文件路径
            return MagazineCardResponse(
                card_id=card_id,
                html=html_content,
                style=style,
                file_path=file_path
            )
            
        except Exception as e:
            error_msg = f"生成杂志卡片时出错: {str(e)}"
            logger.error(error_msg)
            raise Exception(f"生成杂志卡片失败: {str(e)}")
    
    def list_styles(self) -> List[Dict[str, str]]:
        """
        获取所有可用的杂志卡片风格
        
        Returns:
            风格列表，包含id和名称
        """
        return [
            {"id": style.value, "name": style.value.replace("_", " ").title()}
            for style in MagazineStyle
        ]

# 单例实例
_magazine_card_generator = None

def get_magazine_card_generator() -> MagazineCardGenerator:
    """
    获取杂志卡片生成器实例（单例模式）
    
    Returns:
        MagazineCardGenerator实例
    """
    global _magazine_card_generator
    if _magazine_card_generator is None:
        _magazine_card_generator = MagazineCardGenerator()
    return _magazine_card_generator

def main():
    """主函数，用于直接测试杂志卡片生成功能"""
    try:
        # 初始化生成器
        generator = MagazineCardGenerator()
        
        # 测试内容
        test_content = """
        # 如何提高工作效率
        
        在当今快节奏的工作环境中，提高效率变得越来越重要。以下是一些实用技巧：
        
        ## 核心要点
        
        1. 使用番茄工作法管理时间
        2. 减少多任务处理，专注单一任务
        3. 定期休息，避免疲劳
        4. 使用效率工具自动化重复任务
        5. 建立明确的优先级系统
        
        > "效率不是关于做更多事情，而是关于把重要的事情做好。" - 彼得·德鲁克
        
        ## 实用工具推荐
        
        - Notion：整合笔记、任务和知识库
        - Forest：专注时间管理的有趣应用
        - Todoist：简洁高效的任务管理工具
        
        记住，良好的工作效率来自于长期养成的习惯，而非一时的努力。
        """
        
        # 随机选择一种风格进行测试
        style = random.choice(list(MagazineStyle))
        print(f"选择的风格: {style.value}")
        
        # 创建卡片生成请求
        request = MagazineCardRequest(
            content=test_content,
            style=style,
            qr_code_url="https://pic.readnow.pro/2025/03/791e29affc7772652c01be54b92e8c43.jpg",
            product_image_url="https://images.unsplash.com/photo-1611784728558-6a882d147c80?q=80&w=2574&auto=format&fit=crop",
            product_price="¥299",
            product_description="高效能人士专用计时器，让您的工作效率提升50%",
            qr_code_file=None,
            product_image_file=None
        )
        
        # 生成卡片
        print("正在生成杂志风格卡片...")
        response = generator.generate_card(request)
        
        # 输出结果
        print(f"生成成功！卡片ID: {response.card_id}")
        file_path = response.file_path
        print(f"HTML文件保存位置: {file_path}")
        print(f"风格: {response.style.value}")
        
        print("测试完成！")
        
    except Exception as e:
        print(f"测试失败: {str(e)}")
        logger.error(f"测试失败: {str(e)}", exc_info=True)

if __name__ == "__main__":
    main() 