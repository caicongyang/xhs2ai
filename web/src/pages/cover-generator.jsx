import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import apiService from '../api/apiService';

export default function CoverGeneratorPage() {
  // 状态管理
  const [platform, setPlatform] = useState('xiaohongshu');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [accountName, setAccountName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [emojiUrl, setEmojiUrl] = useState('');
  const [style, setStyle] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCover, setGeneratedCover] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // 预览iframe引用
  const previewIframeRef = useRef(null);

  // 封面选项
  const [coverStyles, setCoverStyles] = useState([]);

  // 加载封面风格选项
  useEffect(() => {
    const fetchCoverStyles = async () => {
      try {
        const response = await apiService.cover.getCoverStyles();
        if (response && response.styles) {
          setCoverStyles(response.styles);
        }
      } catch (error) {
        console.error('获取封面风格选项失败:', error);
        // 设置默认选项以防API请求失败
        setCoverStyles([
          { id: "default", name: "默认风格", description: "简约现代风格" },
          { id: "soft_tech", name: "柔和科技卡片风", description: "柔和科技风格" },
          { id: "business", name: "商务风格", description: "现代商务风格" },
          { id: "tech_blue", name: "科技蓝风格", description: "流动科技风格" },
          { id: "minimalist", name: "极简风格", description: "极简格栅主义风格" },
          { id: "digital_ticket", name: "数字票券风", description: "数字极简票券风格" },
          { id: "constructivism", name: "构成主义风格", description: "新构成主义教学风格" },
          { id: "luxury_nature", name: "奢华自然风", description: "奢华自然意境风格" },
          { id: "industrial_punk", name: "工业朋克风", description: "新潮工业反叛风格" },
          { id: "cute_knowledge", name: "萌系知识卡片", description: "软萌知识卡片风格" },
          { id: "business_card", name: "商务卡片风", description: "商务简约信息卡片风格" }
        ]);
      }
    };
    
    fetchCoverStyles();
  }, []);

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
              // 获取完整的HTML文件路径
              const htmlFilePath = result.result.local_path;
              // 设置预览URL
              const fileUrl = apiService.getFile(htmlFilePath);
              setPreviewHtml(fileUrl);
              
              // 获取HTML内容
              fetchHtmlContent(fileUrl);
              
              setGeneratedCover({
                id: taskId,
                platform: platform,
                htmlPath: htmlFilePath,
                timestamp: new Date().toISOString()
              });
            }
          } else if (result.status === 'failed') {
            setIsGenerating(false);
            setErrorMessage(result.error || '生成封面时出错');
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
  }, [taskId, taskStatus, platform]);

  // 获取HTML内容
  const fetchHtmlContent = async (url) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      setHtmlContent(html);
    } catch (error) {
      console.error('获取HTML内容失败:', error);
      setErrorMessage('获取HTML内容失败');
    }
  };

  // 提交小红书封面生成请求
  const handleXiaohongshuSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    setErrorMessage('');
    setGeneratedCover(null);
    setPreviewHtml('');
    setHtmlContent('');
    
    try {
      const response = await apiService.cover.generateXiaohongshuCover({
        content: content,
        account_name: accountName,
        slogan: slogan || undefined,
        style: style
      });
      
      setTaskId(response.task_id);
    } catch (error) {
      console.error('提交小红书封面生成请求失败:', error);
      setIsGenerating(false);
      setTaskStatus('failed');
      setErrorMessage('提交封面生成请求失败');
    }
  };
  
  // 提交微信封面生成请求
  const handleWechatSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    setErrorMessage('');
    setGeneratedCover(null);
    setPreviewHtml('');
    setHtmlContent('');
    
    try {
      const response = await apiService.cover.generateWechatCover({
        title: title,
        emoji_url: emojiUrl || undefined,
        style: style
      });
      
      setTaskId(response.task_id);
    } catch (error) {
      console.error('提交微信封面生成请求失败:', error);
      setIsGenerating(false);
      setTaskStatus('failed');
      setErrorMessage('提交封面生成请求失败');
    }
  };

  // 复制HTML内容
  const copyHtmlContent = () => {
    if (htmlContent) {
      navigator.clipboard.writeText(htmlContent)
        .then(() => alert('HTML已复制到剪贴板'))
        .catch(err => {
          console.error('复制失败:', err);
          alert('复制失败');
        });
    }
  };

  // 下载为图片
  const downloadAsImage = () => {
    if (previewIframeRef.current) {
      const iframe = previewIframeRef.current;
      
      // 确保iframe已加载
      if (iframe.contentDocument) {
        // 创建一个新的Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 获取iframe内容大小
        const width = iframe.contentDocument.documentElement.scrollWidth;
        const height = iframe.contentDocument.documentElement.scrollHeight;
        
        canvas.width = width;
        canvas.height = height;
        
        // 使用html2canvas或其他库渲染iframe内容
        // 此处简化为直接创建链接，实际项目需集成html2canvas等库
        alert('请集成html2canvas库以实现此功能');
        
        // 完整实现示例:
        // html2canvas(iframe.contentDocument.body).then(canvas => {
        //   const dataUrl = canvas.toDataURL('image/png');
        //   const link = document.createElement('a');
        //   link.download = `${platform}-cover-${Date.now()}.png`;
        //   link.href = dataUrl;
        //   link.click();
        // });
      }
    }
  };

  // 切换平台时重置部分状态
  const handlePlatformChange = (value) => {
    setPlatform(value);
    setTitle('');
    setContent('');
    setAccountName('');
    setSlogan('');
    setEmojiUrl('');
    setGeneratedCover(null);
    setPreviewHtml('');
    setHtmlContent('');
    setErrorMessage('');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">AI 封面生成器</h1>
        <p className="hero-subtitle">为您的内容创建精美的封面，支持多种平台</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs 
            defaultValue="xiaohongshu" 
            className="w-full"
            onValueChange={handlePlatformChange}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="xiaohongshu">小红书封面</TabsTrigger>
              <TabsTrigger value="wechat">微信公众号封面</TabsTrigger>
            </TabsList>

            {/* 小红书封面标签 */}
            <TabsContent value="xiaohongshu" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 表单区域 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-2xl font-bold mb-6">创建小红书封面</h2>
                  
                  <form onSubmit={handleXiaohongshuSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">标题</Label>
                      <Input
                        id="title"
                        placeholder="输入小红书笔记标题..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">内容</Label>
                      <Textarea
                        id="content"
                        placeholder="输入小红书笔记内容..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-name">账号名称</Label>
                      <Input
                        id="account-name"
                        placeholder="输入小红书账号名称..."
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slogan">口号</Label>
                      <Input
                        id="slogan"
                        placeholder="输入小红书口号..."
                        value={slogan}
                        onChange={(e) => setSlogan(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="style">风格</Label>
                      <select
                        id="style"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {coverStyles.map((style) => (
                          <option key={style.id} value={style.id}>{style.name}</option>
                        ))}
                      </select>
                    </div>

                    <Button 
                      type="submit" 
                      variant="apple" 
                      className="w-full" 
                      disabled={!content || !accountName || isGenerating}
                    >
                      {isGenerating ? "生成中..." : "生成封面"}
                    </Button>
                    
                    {errorMessage && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-md">
                        {errorMessage}
                      </div>
                    )}
                  </form>
                </div>

                {/* 预览区域 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-2xl font-bold mb-6">封面预览</h2>
                  
                  {previewHtml ? (
                    <div className="w-full aspect-[1/1.4] rounded-lg overflow-hidden border shadow-sm mb-6 relative">
                      <iframe
                        ref={previewIframeRef}
                        src={previewHtml}
                        className="w-full h-full border-0"
                        title="封面预览"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[1/1.4] rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400 text-center px-4">
                        {isGenerating ? "正在生成封面..." : "填写表单并生成封面预览"}
                      </p>
                    </div>
                  )}
                  
                  {generatedCover && (
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={copyHtmlContent}>
                        复制HTML
                      </Button>
                      <Button variant="outline" onClick={downloadAsImage}>
                        下载图片
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 模板展示 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold mb-6">热门封面模板</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {coverStyles.slice(0, 8).map((styleItem, i) => (
                    <Card key={styleItem.id} className="overflow-hidden">
                      <div 
                        className="aspect-[1/1.4] bg-gray-100 dark:bg-gray-700 relative flex items-center justify-center p-4 text-center"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${getColorForStyle(styleItem.id)}, ${getDarkerColorForStyle(styleItem.id)})`,
                          color: getTextColorForStyle(styleItem.id)
                        }}
                      >
                        <div>
                          <h3 className="font-bold mb-2">{styleItem.name}</h3>
                          <p className="text-sm opacity-80">{styleItem.description}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">小红书模板 - {styleItem.name}</h3>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setStyle(styleItem.id)}
                        >
                          使用此模板
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* 微信公众号封面标签 */}
            <TabsContent value="wechat" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 表单区域 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-2xl font-bold mb-6">创建微信公众号封面</h2>
                  
                  <form onSubmit={handleWechatSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="wechat-title">标题</Label>
                      <Input
                        id="wechat-title"
                        placeholder="输入微信公众号文章标题..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wechat-emoji-url">表情符号URL</Label>
                      <Input
                        id="wechat-emoji-url"
                        placeholder="输入表情符号链接..."
                        value={emojiUrl}
                        onChange={(e) => setEmojiUrl(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wechat-style">风格</Label>
                      <select
                        id="wechat-style"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {coverStyles.map((style) => (
                          <option key={style.id} value={style.id}>{style.name}</option>
                        ))}
                      </select>
                    </div>

                    <Button 
                      type="submit" 
                      variant="apple" 
                      className="w-full" 
                      disabled={!title || isGenerating}
                    >
                      {isGenerating ? "生成中..." : "生成封面"}
                    </Button>
                    
                    {errorMessage && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-md">
                        {errorMessage}
                      </div>
                    )}
                  </form>
                </div>

                {/* 预览区域 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-2xl font-bold mb-6">封面预览</h2>
                  
                  {previewHtml ? (
                    <div className="w-full aspect-[900/383] rounded-lg overflow-hidden border shadow-sm mb-6">
                      <iframe
                        ref={previewIframeRef}
                        src={previewHtml}
                        className="w-full h-full border-0"
                        title="封面预览"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[900/383] rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400 text-center px-4">
                        {isGenerating ? "正在生成封面..." : "填写表单并生成封面预览"}
                      </p>
                    </div>
                  )}
                  
                  {generatedCover && (
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={copyHtmlContent}>
                        复制HTML
                      </Button>
                      <Button variant="outline" onClick={downloadAsImage}>
                        下载图片
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 模板展示 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold mb-6">热门封面模板</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {coverStyles.slice(0, 6).map((styleItem, i) => (
                    <Card key={styleItem.id} className="overflow-hidden">
                      <div 
                        className="aspect-[900/383] bg-gray-100 dark:bg-gray-700 relative flex items-center justify-center p-4 text-center"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${getColorForStyle(styleItem.id)}, ${getDarkerColorForStyle(styleItem.id)})`,
                          color: getTextColorForStyle(styleItem.id)
                        }}
                      >
                        <div>
                          <h3 className="font-bold mb-2">{styleItem.name}</h3>
                          <p className="text-sm opacity-80">{styleItem.description}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">微信模板 - {styleItem.name}</h3>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setStyle(styleItem.id)}
                        >
                          使用此模板
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-center">功能特点</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">多平台支持</h3>
              <p className="text-gray-600 dark:text-gray-300">一键生成适用于不同平台的封面，包括小红书、微信公众号等。</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">丰富风格选择</h3>
              <p className="text-gray-600 dark:text-gray-300">多种设计风格模板，包括科技、商务、极简、奢华等多种风格。</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">即时预览</h3>
              <p className="text-gray-600 dark:text-gray-300">实时查看封面效果，支持导出HTML和图片格式。</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// 根据风格ID生成颜色
function getColorForStyle(styleId) {
  const colorMap = {
    'default': '#f0f0f0',
    'soft_tech': '#e6f7ff',
    'business': '#f6ffed',
    'tech_blue': '#d6e4ff',
    'minimalist': '#ffffff',
    'digital_ticket': '#fff7e6',
    'constructivism': '#fff1f0',
    'luxury_nature': '#fcffe6',
    'industrial_punk': '#f9f0ff',
    'cute_knowledge': '#fff0f6',
    'business_card': '#f5f5f5'
  };
  return colorMap[styleId] || '#f0f0f0';
}

// 获取深色版本
function getDarkerColorForStyle(styleId) {
  const colorMap = {
    'default': '#d9d9d9',
    'soft_tech': '#bae7ff',
    'business': '#d9f7be',
    'tech_blue': '#adc6ff',
    'minimalist': '#f0f0f0',
    'digital_ticket': '#ffd591',
    'constructivism': '#ffccc7',
    'luxury_nature': '#eaff8f',
    'industrial_punk': '#efdbff',
    'cute_knowledge': '#ffd6e7',
    'business_card': '#d9d9d9'
  };
  return colorMap[styleId] || '#d9d9d9';
}

// 获取文本颜色
function getTextColorForStyle(styleId) {
  const darkStylesText = ['industrial_punk', 'constructivism', 'tech_blue'];
  return darkStylesText.includes(styleId) ? '#ffffff' : '#000000';
} 