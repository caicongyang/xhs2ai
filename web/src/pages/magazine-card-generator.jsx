import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { AlertCircle, Copy, Download, ExternalLink, RefreshCw, Save, CheckCircle2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import apiService from '../api/apiService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { cn } from '../lib/utils';

// 风格预览卡片组件
const StylePreviewCard = ({ style, isSelected, onSelect }) => {
  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border-2 p-2 transition-all hover:border-primary",
        isSelected ? "border-primary bg-primary/5" : "border-muted"
      )}
      onClick={() => onSelect(style.id)}
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-muted relative group">
        {/* 预览图 */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          isSelected && "opacity-100"
        )} />
        <div className="absolute inset-0 flex flex-col justify-between p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-xs font-medium uppercase tracking-wider">
            {style.id.replace(/_/g, ' ')}
          </div>
          <div className="text-sm">
            {getStyleDescription(style.id)}
          </div>
        </div>
        {/* 风格示例背景 */}
        <div className={cn(
          "w-full h-full",
          getStylePreviewClass(style.id)
        )}>
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-lg font-medium text-gray-600">
              {style.chineseName}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm font-medium">{style.chineseName}</p>
        {isSelected && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
    </div>
  );
};

// 获取风格描述的简短版本
const getStyleDescription = (styleId) => {
  const descriptions = {
    minimalist: "极简主义设计，强调留白与简约",
    bold_modern: "大胆现代风格，强烈视觉冲击",
    elegant_vintage: "优雅复古风格，呈现经典美感",
    futuristic_tech: "未来科技风格，展现高科技感",
    scandinavian: "北欧简约风格，温暖而实用",
    art_deco: "装饰艺术风格，华丽与几何结合",
    japanese_minimalism: "日式极简风格，禅意美学",
    postmodern_deconstruction: "后现代解构，打破传统规则",
    punk: "朋克风格，反叛与原始能量",
    british_rock: "英伦摇滚，经典与叛逆融合",
    black_metal: "黑金属风格，暗黑与神秘",
    memphis_design: "孟菲斯设计，前卫与趣味",
    cyberpunk: "赛博朋克，高科技与街头文化",
    pop_art: "波普艺术，大胆而直接",
    deconstructed_swiss: "解构瑞士风格，秩序中的混沌",
    vaporwave: "蒸汽波风格，复古未来主义",
    neo_expressionism: "新表现主义，强烈情感表达",
    extreme_minimalism: "极致极简，追求纯粹",
    neo_futurism: "新未来主义，流线型设计",
    surrealist_collage: "超现实拼贴，梦境般的视觉",
    neo_baroque: "新巴洛克，数字化的奢华",
    liquid_digital_morphism: "液态数字形态，流动的视觉",
    hypersensory_minimalism: "超感官极简，微妙的质感",
    neo_expressionist_data: "表现主义数据，艺术与数据的融合",
    victorian: "维多利亚风格，古典印刷美学",
    bauhaus: "包豪斯风格，功能主义设计",
    constructivism: "构成主义，革命性的视觉",
    memphis: "孟菲斯风格，前卫与趣味",
    german_expressionism: "德国表现主义，强烈的情感"
  };
  return descriptions[styleId] || "独特的设计风格";
};

// 获取风格预览的CSS类名
const getStylePreviewClass = (styleId) => {
  const styleClasses = {
    minimalist: "bg-white",
    bold_modern: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500",
    elegant_vintage: "bg-[#f5e6d3]",
    futuristic_tech: "bg-gradient-to-r from-blue-900 to-black",
    scandinavian: "bg-gray-50",
    art_deco: "bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700",
    japanese_minimalism: "bg-gray-100",
    postmodern_deconstruction: "bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600",
    punk: "bg-black",
    british_rock: "bg-gradient-to-r from-red-700 via-blue-900 to-gray-900",
    black_metal: "bg-gradient-to-br from-gray-900 to-black",
    memphis_design: "bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400",
    cyberpunk: "bg-gradient-to-r from-purple-900 via-blue-900 to-black",
    pop_art: "bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500",
    deconstructed_swiss: "bg-white",
    vaporwave: "bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300",
    neo_expressionism: "bg-gradient-to-br from-red-700 via-yellow-600 to-blue-700",
    extreme_minimalism: "bg-white",
    neo_futurism: "bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900",
    surrealist_collage: "bg-gradient-to-br from-purple-700 via-blue-700 to-green-700",
    neo_baroque: "bg-gradient-to-br from-yellow-700 via-red-700 to-purple-900",
    liquid_digital_morphism: "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600",
    hypersensory_minimalism: "bg-gradient-to-br from-gray-50 to-gray-100",
    neo_expressionist_data: "bg-gradient-to-br from-blue-700 via-red-600 to-yellow-500",
    victorian: "bg-[#e8d5b7]",
    bauhaus: "bg-white",
    constructivism: "bg-gradient-to-br from-red-600 via-gray-900 to-red-900",
    memphis: "bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400",
    german_expressionism: "bg-gradient-to-br from-gray-900 via-red-900 to-black"
  };
  return styleClasses[styleId] || "bg-gray-100";
};

// 风格网格组件
const StyleGrid = ({ styles, selectedStyle, onStyleSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {styles.map((style) => (
        <StylePreviewCard
          key={style.id}
          style={style}
          isSelected={selectedStyle === style.id}
          onSelect={onStyleSelect}
        />
      ))}
    </div>
  );
};

// 模板预览组件
const TemplatePreview = ({ style }) => {
  // 定义模板映射
  const templateMap = {
    neo_expressionism: '/magazine_cards/magazine_card_20250414_112349_neo_expressionism_0246354f-deb0-40db-8d34-331742e73bf5.html',
    black_metal: '/magazine_cards/magazine_card_20250414_111732_black_metal_1847e87a-5055-4af1-8a83-1efecf2924b9.html',
    surrealist_collage: '/magazine_cards/magazine_card_20250414_112638_surrealist_collage_e33d783b-c3dc-4b27-b3aa-4b2ca1f3775a.html',
    constructivism: '/magazine_cards/magazine_card_20250414_112102_constructivism_d68162ed-7ab2-49c8-80d0-022779c4fea9.html',
    minimalist: '/magazine_cards/magazine_card_20250421_093713_minimalist_da90b20e-25f2-425a-a452-dedf302d9672.html'
  };

  const templateUrl = templateMap[style];
  if (!templateUrl) return null;

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">风格预览</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="aspect-[3/4] relative">
            <iframe
              src={templateUrl}
              className="w-full h-full border-0"
              title={`${style} 风格预览`}
            />
          </div>
          <div className="p-4 bg-white">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(templateUrl, '_blank')}
            >
              <ExternalLink className="mr-1 h-4 w-4" />
              查看完整模板
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MagazineCardGeneratorPage() {
  // 状态管理
  const [content, setContent] = useState('');
  const [style, setStyle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [availableStyles, setAvailableStyles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [generatedCard, setGeneratedCard] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // 文件上传状态
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [productImageFile, setProductImageFile] = useState(null);
  const [qrCodeFilePreview, setQrCodeFilePreview] = useState('');
  const [productImageFilePreview, setProductImageFilePreview] = useState('');

  // 预览iframe引用
  const previewIframeRef = useRef(null);
  // iframe加载状态
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // 加载杂志卡片风格选项
  useEffect(() => {
    const fetchMagazineStyles = async () => {
      try {
        const styles = await apiService.magazineCard.getMagazineStyles();
        if (styles && styles.length > 0) {
          // 添加中文名称
          const stylesWithChineseNames = styles.map(style => {
            const chineseNameMap = {
              "minimalist": "极简主义",
              "bold_modern": "大胆现代",
              "elegant_vintage": "优雅复古",
              "futuristic_tech": "未来科技",
              "scandinavian": "北欧简约",
              "art_deco": "装饰艺术",
              "japanese_minimalism": "日式极简",
              "postmodern_deconstruction": "后现代解构",
              "punk": "朋克风格",
              "british_rock": "英伦摇滚",
              "black_metal": "黑金属",
              "memphis_design": "孟菲斯设计",
              "cyberpunk": "赛博朋克",
              "pop_art": "波普艺术",
              "deconstructed_swiss": "解构瑞士",
              "vaporwave": "蒸汽波",
              "neo_expressionism": "新表现主义",
              "extreme_minimalism": "极致极简",
              "neo_futurism": "新未来主义",
              "surrealist_collage": "超现实拼贴",
              "neo_baroque": "新巴洛克",
              "liquid_digital_morphism": "液态数字形态",
              "hypersensory_minimalism": "超感官极简",
              "neo_expressionist_data": "表现主义数据",
              "victorian": "维多利亚风格",
              "bauhaus": "包豪斯风格",
              "constructivism": "构成主义",
              "memphis": "孟菲斯风格",
              "german_expressionism": "德国表现主义"
            };
            return {
              ...style,
              chineseName: chineseNameMap[style.id] || style.name
            };
          });
          setAvailableStyles(stylesWithChineseNames);
          setStyle(stylesWithChineseNames[0].id); // 默认选择第一种风格
        }
      } catch (error) {
        console.error('获取杂志卡片风格选项失败:', error);
        setErrorMessage('获取风格选项失败，请稍后再试');
      }
    };
    
    fetchMagazineStyles();
  }, []);

  // 监听预览HTML的变化，重置iframe加载状态
  useEffect(() => {
    if (previewHtml) {
      setIsIframeLoaded(false);
    }
  }, [previewHtml]);

  // iframe加载完成的处理函数
  const handleIframeLoad = () => {
    console.log('iframe加载事件触发');
    setErrorMessage('');
    
    setTimeout(() => {
      try {
        if (!previewIframeRef.current) {
          console.warn('iframe引用丢失');
          return;
        }
        
        const iframe = previewIframeRef.current;
        setIsIframeLoaded(true);
        
        if (iframe.contentDocument) {
          console.log('iframe内容已加载');
        } else {
          console.log('iframe可能受跨域限制，但标记为已加载');
        }
      } catch (err) {
        console.warn('iframe加载检查出错，但仍标记为已加载:', err);
        setIsIframeLoaded(true);
      }
    }, 500);
  };

  // 检查任务状态
  useEffect(() => {
    let intervalId;
    
    if (taskId && taskStatus !== 'completed' && taskStatus !== 'failed') {
      intervalId = setInterval(async () => {
        try {
          const result = await apiService.checkTaskStatus(taskId);
          setTaskStatus(result.status);
          
          if (result.status === 'completed') {
            setIsGenerating(false);
            if (result.result) {
              // 将API返回路径转换为完整URL
              const fileUrl = apiService.getFile(result.result.html_path);
              setPreviewHtml(fileUrl);
              
              // 获取HTML内容
              fetchHtmlContent(fileUrl);
              
              setGeneratedCard({
                id: result.result.card_id,
                style: result.result.style,
                htmlPath: result.result.html_path,
                timestamp: new Date().toISOString()
              });
            }
          } else if (result.status === 'failed') {
            setIsGenerating(false);
            setErrorMessage(result.error || '生成杂志卡片时出错');
          }
        } catch (error) {
          console.error('检查任务状态失败:', error);
          setTaskStatus('failed');
          setIsGenerating(false);
          setErrorMessage('检查任务状态时出错');
        }
      }, 2000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, taskStatus]);

  // 获取HTML内容
  const fetchHtmlContent = async (url) => {
    try {
      console.log('原始URL:', url);
      
      // 清理URL，修复可能的URL问题
      let cleanUrl = url;
      
      // 获取baseUrl部分(域名)
      const baseUrlMatch = cleanUrl.match(/^(https?:\/\/[^\/]+)/);
      const baseUrl = baseUrlMatch ? baseUrlMatch[1] : '';
      
      // 提取文件名 - 针对杂志卡片
      let fileName = '';
      if (cleanUrl.includes('magazine_cards')) {
        const parts = cleanUrl.split('magazine_cards/');
        fileName = parts[parts.length - 1];
      }
      
      // 处理各种URL情况
      if (fileName) {
        // 统一杂志卡片的URL格式
        cleanUrl = `${baseUrl}/api/files/src/magazine_cards/${fileName}`;
      } else if (cleanUrl.includes('/api/api/')) {
        // 修复重复的/api前缀
        cleanUrl = cleanUrl.replace('/api/api/', '/api/');
      }
      
      // 修复多余的斜杠(注意不要处理协议中的双斜杠)
      cleanUrl = cleanUrl.replace(/([^:])\/+/g, '$1/');
      
      console.log('清理后的URL:', cleanUrl);
      const response = await fetch(cleanUrl);
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      console.log('HTML内容获取成功');
      setHtmlContent(html);
    } catch (error) {
      console.error('获取HTML内容失败:', error.message);
      setErrorMessage(`获取HTML内容失败: ${error.message}`);
    }
  };

  // 提交杂志卡片生成请求
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setErrorMessage('请输入卡片内容');
      return;
    }
    
    try {
      setIsGenerating(true);
      setErrorMessage('');
      setTaskId('');
      setTaskStatus('');
      setPreviewHtml('');
      setHtmlContent('');
      
      // 构建请求参数
      const cardRequest = {
        content,
        style,
      };
      
      // 添加可选参数（如果提供）
      if (showAdvancedOptions) {
        // 如果使用了文件上传，需要先上传文件到服务器
        if (qrCodeFile || productImageFile) {
          const formData = new FormData();
          if (qrCodeFile) formData.append('qr_code', qrCodeFile);
          if (productImageFile) formData.append('product_image', productImageFile);
          
          try {
            const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {
              method: 'POST',
              body: formData,
              // 移除 Content-Type header，让浏览器自动设置
            });
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.detail || '文件上传失败');
            }
            
            const uploadResult = await uploadResponse.json();
            console.log('文件上传结果:', uploadResult);
            
            if (qrCodeFile && uploadResult.qr_code_url) {
              cardRequest.qr_code_url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${uploadResult.qr_code_url}`;
            }
            if (productImageFile && uploadResult.product_image_url) {
              cardRequest.product_image_url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${uploadResult.product_image_url}`;
            }
          } catch (error) {
            console.error('文件上传失败:', error);
            setErrorMessage(`文件上传失败: ${error.message}`);
            setIsGenerating(false);
            return;
          }
        }
        
        if (productPrice) cardRequest.product_price = productPrice;
        if (productDescription) cardRequest.product_description = productDescription;
      }
      
      // 发送生成请求
      console.log('生成杂志卡片:', cardRequest);
      const response = await apiService.magazineCard.generateMagazineCard(cardRequest);
      
      if (response && response.task_id) {
        setTaskId(response.task_id);
        setTaskStatus('pending');
      } else {
        throw new Error('生成杂志卡片失败，未返回任务ID');
      }
    } catch (error) {
      console.error('提交杂志卡片生成请求失败:', error);
      setIsGenerating(false);
      setErrorMessage(error.message || '生成杂志卡片失败，请稍后再试');
    }
  };

  // 复制HTML内容
  const copyHtmlContent = () => {
    if (htmlContent) {
      navigator.clipboard.writeText(htmlContent)
        .then(() => {
          setCopiedToClipboard(true);
          setTimeout(() => setCopiedToClipboard(false), 2000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          setErrorMessage('复制HTML内容失败');
        });
    }
  };

  // 下载为图片
  const downloadAsImage = async () => {
    if (!previewIframeRef.current || !isIframeLoaded) {
      setErrorMessage('预览未完全加载，无法导出图片');
      return;
    }
    
    try {
      setIsExporting(true);
      
      // 获取iframe的内容
      const iframe = previewIframeRef.current;
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      
      if (!iframeDocument.body) {
        throw new Error('无法访问预览内容');
      }
      
      // 使用html2canvas捕获内容
      const canvas = await html2canvas(iframeDocument.body, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
      });
      
      // 转换为图片并下载
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `magazine-card-${new Date().getTime()}.png`;
      link.click();
      
      setIsExporting(false);
    } catch (error) {
      console.error('导出图片失败:', error);
      setIsExporting(false);
      setErrorMessage(`导出图片失败: ${error.message}`);
    }
  };

  // 在新窗口打开预览
  const openInNewWindow = () => {
    if (previewHtml) {
      window.open(previewHtml, '_blank');
    }
  };
  
  // 获取当前选中风格的中文名称
  const getSelectedStyleName = () => {
    const selectedStyle = availableStyles.find(s => s.id === style);
    return selectedStyle ? selectedStyle.chineseName : '选择卡片风格';
  };

  // 处理二维码文件上传
  const handleQrCodeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setQrCodeFile(file);
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setQrCodeFilePreview(previewUrl);
  };
  
  // 处理产品图片文件上传
  const handleProductImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setProductImageFile(file);
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setProductImageFilePreview(previewUrl);
  };
  
  // 清除二维码文件
  const clearQrCodeFile = () => {
    setQrCodeFile(null);
    if (qrCodeFilePreview) {
      URL.revokeObjectURL(qrCodeFilePreview);
      setQrCodeFilePreview('');
    }
  };
  
  // 清除产品图片文件
  const clearProductImageFile = () => {
    setProductImageFile(null);
    if (productImageFilePreview) {
      URL.revokeObjectURL(productImageFilePreview);
      setProductImageFilePreview('');
    }
  };

  // 组件卸载时清理创建的对象URL
  useEffect(() => {
    return () => {
      if (qrCodeFilePreview) {
        URL.revokeObjectURL(qrCodeFilePreview);
      }
      if (productImageFilePreview) {
        URL.revokeObjectURL(productImageFilePreview);
      }
    };
  }, [qrCodeFilePreview, productImageFilePreview]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">杂志风格卡片生成器</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧表单区域 */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 内容输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="content">卡片内容</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="输入要展示的内容，支持Markdown格式"
                      className="h-40"
                      required
                    />
                  </div>
                  
                  {/* 风格选择 - 改为下拉框 */}
                  <div className="space-y-2">
                    <Label>卡片风格</Label>
                    <Select 
                      value={style} 
                      onValueChange={(value) => {
                        console.log('Selected style:', value);
                        setStyle(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {getSelectedStyleName()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableStyles.map((styleOption) => (
                          <SelectItem 
                            key={styleOption.id} 
                            value={styleOption.id}
                          >
                            {styleOption.chineseName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 风格预览 */}
                  <TemplatePreview style={style} />
                  
                  {/* 高级选项开关 */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="advanced-options"
                      checked={showAdvancedOptions}
                      onCheckedChange={setShowAdvancedOptions}
                    />
                    <Label htmlFor="advanced-options">显示高级选项</Label>
                  </div>
                  
                  {/* 高级选项 */}
                  {showAdvancedOptions && (
                    <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                      <h3 className="font-medium">高级选项</h3>
                      
                      {/* 二维码输入 */}
                      <div className="space-y-2">
                        <Label htmlFor="qr-code-input">二维码图片</Label>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="qr-code-file"
                              type="file"
                              onChange={handleQrCodeFileChange}
                              accept="image/*"
                              className="flex-1"
                            />
                            {qrCodeFile && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={clearQrCodeFile}
                                type="button"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          {qrCodeFilePreview && (
                            <div className="mt-2 relative w-24 h-24 border rounded-md overflow-hidden">
                              <img 
                                src={qrCodeFilePreview} 
                                alt="二维码预览" 
                                className="object-contain w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 产品图片输入 */}
                      <div className="space-y-2">
                        <Label htmlFor="product-image-input">产品图片</Label>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="product-image-file"
                              type="file"
                              onChange={handleProductImageFileChange}
                              accept="image/*"
                              className="flex-1"
                            />
                            {productImageFile && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={clearProductImageFile}
                                type="button"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          {productImageFilePreview && (
                            <div className="mt-2 relative w-24 h-24 border rounded-md overflow-hidden">
                              <img 
                                src={productImageFilePreview} 
                                alt="产品图片预览" 
                                className="object-contain w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 产品价格 */}
                      <div className="space-y-2">
                        <Label htmlFor="product-price">产品价格（可选）</Label>
                        <Input
                          id="product-price"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          placeholder="例如: ¥299"
                        />
                      </div>
                      
                      {/* 产品描述 */}
                      <div className="space-y-2">
                        <Label htmlFor="product-description">产品描述（可选）</Label>
                        <Input
                          id="product-description"
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          placeholder="简短的产品描述"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 错误信息 */}
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  
                  {/* 生成按钮 */}
                  <Button type="submit" className="w-full" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      '生成杂志卡片'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* 当前状态和说明 */}
            {taskId && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">生成状态</h3>
                  <div className="text-sm space-y-1">
                    <p>任务ID: {taskId}</p>
                    <p>状态: {taskStatus === 'completed' ? '完成' : taskStatus === 'failed' ? '失败' : '处理中...'}</p>
                    {generatedCard && (
                      <p>风格: {getSelectedStyleName()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* 右侧预览区域 */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">预览</h3>
                  
                  {/* 操作按钮组 */}
                  {previewHtml && isIframeLoaded && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyHtmlContent}
                        disabled={!htmlContent || copiedToClipboard}
                      >
                        {copiedToClipboard ? (
                          <>
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-4 w-4" />
                            复制HTML
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAsImage}
                        disabled={isExporting || !isIframeLoaded}
                      >
                        {isExporting ? (
                          <>
                            <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                            导出中...
                          </>
                        ) : (
                          <>
                            <Download className="mr-1 h-4 w-4" />
                            下载图片
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openInNewWindow}
                        disabled={!previewHtml}
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />
                        新窗口打开
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* 预览框 */}
                <div className="border rounded-md overflow-hidden bg-gray-50 min-h-[800px] flex items-center justify-center">
                  {previewHtml ? (
                    <iframe
                      ref={previewIframeRef}
                      src={previewHtml}
                      className="w-full h-[800px] border-0"
                      onLoad={handleIframeLoad}
                    />
                  ) : (
                    <div className="text-gray-500 text-center p-6">
                      {isGenerating ? '杂志卡片生成中，请稍候...' : '卡片预览将显示在这里'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* 使用说明 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">使用说明</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>输入您想要展示的内容，支持Markdown格式</li>
                  <li>选择喜欢的杂志卡片风格</li>
                  <li>可选：添加二维码、产品图片和详情</li>
                  <li>生成后可以复制HTML代码或下载为图片</li>
                  <li>共有29种精美杂志风格可供选择</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 