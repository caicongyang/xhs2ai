# 使src目录成为Python包
from .minimaxi_image_generator import MiniMaxiImageGenerator, ImageModel, ImageSize, ImageStyle, ImageFormat
from .minimaxi_video_generator import MiniMaxiVideoGenerator, VideoQuality, VideoFormat, VideoContentType
from .keling_video_generator import VideoGenerator as KlingVideoGenerator
from .keling_image_generator import ImageGenerator as KlingImageGenerator, ImageStyle as KlingImageStyle, ImageRatio
from .cover_generator import CoverGenerator, CoverStyle
from .url_content_rewriter import UrlContentRewriter
from .title_rewriter import TitleRewriter
from .content_style_rewriter import ContentStyleRewriter
from .magazine_card_generator import get_magazine_card_generator, MagazineCardRequest, MagazineStyle, MagazineCardResponse

# 导出所有模块，使它们可以通过src包直接导入
__all__ = [
    'MiniMaxiImageGenerator', 'ImageModel', 'ImageSize', 'ImageStyle', 'ImageFormat',
    'MiniMaxiVideoGenerator', 'VideoQuality', 'VideoFormat', 'VideoContentType',
    'KlingVideoGenerator', 'KlingImageGenerator', 'KlingImageStyle', 'ImageRatio',
    'CoverGenerator', 'CoverStyle',
    'UrlContentRewriter', 'TitleRewriter', 'ContentStyleRewriter',
    'get_magazine_card_generator', 'MagazineCardRequest', 'MagazineStyle', 'MagazineCardResponse'
] 