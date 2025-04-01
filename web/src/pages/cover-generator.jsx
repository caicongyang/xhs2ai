import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';

export default function CoverGeneratorPage() {
  // 状态管理
  const [platform, setPlatform] = useState('xiaohongshu');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundType, setBackgroundType] = useState('image');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [fontFamily, setFontFamily] = useState('default');
  const [fontColor, setFontColor] = useState('#000000');
  const [layout, setLayout] = useState('center');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCover, setGeneratedCover] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  // 封面选项
  const [coverOptions, setCoverOptions] = useState({
    xiaohongshu: {
      layouts: [],
      fonts: [],
      backgroundTypes: []
    },
    wechat: {
      layouts: [],
      fonts: [],
      backgroundTypes: []
    }
  });

  // 加载封面选项
  useEffect(() => {
    // 真实环境中从API获取选项
    // Mock 数据
    const mockCoverOptions = {
      xiaohongshu: {
        layouts: [
          { id: "center", name: "居中对齐" },
          { id: "left", name: "左对齐" },
          { id: "right", name: "右对齐" }
        ],
        fonts: [
          { id: "default", name: "默认字体" },
          { id: "bold", name: "粗体" },
          { id: "script", name: "手写体" }
        ],
        backgroundTypes: [
          { id: "image", name: "图片背景" },
          { id: "color", name: "纯色背景" },
          { id: "gradient", name: "渐变背景" }
        ]
      },
      wechat: {
        layouts: [
          { id: "center", name: "居中对齐" },
          { id: "left", name: "左对齐" },
          { id: "right", name: "右对齐" }
        ],
        fonts: [
          { id: "default", name: "默认字体" },
          { id: "bold", name: "粗体" },
          { id: "script", name: "手写体" }
        ],
        backgroundTypes: [
          { id: "image", name: "图片背景" },
          { id: "color", name: "纯色背景" },
          { id: "gradient", name: "渐变背景" }
        ]
      }
    };
    
    setCoverOptions(mockCoverOptions);
  }, []);

  // 检查任务状态
  useEffect(() => {
    let intervalId;
    
    if (taskId && taskStatus !== 'completed' && taskStatus !== 'failed') {
      intervalId = setInterval(() => {
        // 真实环境中从API获取任务状态
        // 模拟API查询
        setTimeout(() => {
          setTaskStatus('completed');
          setIsGenerating(false);
          
          // 模拟返回的HTML内容
          const mockHtml = `
            <div style="width: 100%; height: 100%; position: relative; background-color: ${backgroundColor}; display: flex; align-items: center; justify-content: center; font-family: sans-serif;">
              <div style="padding: 20px; text-align: ${layout}; max-width: 80%;">
                <h1 style="color: ${fontColor}; font-size: 24px; margin-bottom: 10px;">${title}</h1>
                ${subtitle ? `<h2 style="color: ${fontColor}; opacity: 0.8; font-size: 16px;">${subtitle}</h2>` : ''}
              </div>
            </div>
          `;
          
          // 设置预览HTML
          setPreviewHtml(mockHtml);
          
          // 设置生成的封面数据
          setGeneratedCover({
            id: `cover-${Date.now()}`,
            platform: platform,
            title: title,
            html: mockHtml,
            timestamp: new Date().toISOString()
          });
        }, 2000);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, taskStatus, backgroundColor, fontColor, layout, platform, subtitle, title]);

  // 提交小红书封面生成请求
  const handleXiaohongshuSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    
    // 真实环境中调用API
    // 模拟API调用
    const mockTaskId = `xiaohongshu-cover-${Date.now()}`;
    setTaskId(mockTaskId);
    console.log('小红书封面生成请求', {
      title,
      subtitle,
      background_type: backgroundType,
      background_image: backgroundImage,
      background_color: backgroundColor,
      font_family: fontFamily,
      font_color: fontColor,
      layout
    });
  };
  
  // 提交微信封面生成请求
  const handleWechatSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    
    // 真实环境中调用API
    // 模拟API调用
    const mockTaskId = `wechat-cover-${Date.now()}`;
    setTaskId(mockTaskId);
    console.log('微信封面生成请求', {
      title,
      subtitle,
      background_type: backgroundType,
      background_image: backgroundImage,
      background_color: backgroundColor,
      font_family: fontFamily,
      font_color: fontColor,
      layout
    });
  };

  // 切换平台时重置部分状态
  const handlePlatformChange = (value) => {
    setPlatform(value);
    setTitle('');
    setSubtitle('');
    setGeneratedCover(null);
    setPreviewHtml('');
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
                      <Label htmlFor="subtitle">副标题/描述 (选填)</Label>
                      <Input
                        id="subtitle"
                        placeholder="输入副标题或描述..."
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="background-type">背景类型</Label>
                      <select
                        id="background-type"
                        value={backgroundType}
                        onChange={(e) => setBackgroundType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {coverOptions.xiaohongshu.backgroundTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    {backgroundType === 'image' && (
                      <div className="space-y-2">
                        <Label htmlFor="background-image">背景图片URL</Label>
                        <Input
                          id="background-image"
                          placeholder="输入背景图片链接..."
                          value={backgroundImage}
                          onChange={(e) => setBackgroundImage(e.target.value)}
                        />
                      </div>
                    )}

                    {backgroundType === 'color' && (
                      <div className="space-y-2">
                        <Label htmlFor="background-color">背景颜色</Label>
                        <div className="flex space-x-3">
                          <Input
                            id="background-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-16"
                          />
                          <Input
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            placeholder="#RRGGBB"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="font-family">字体</Label>
                        <select
                          id="font-family"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {coverOptions.xiaohongshu.fonts.map((font) => (
                            <option key={font.id} value={font.id}>{font.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="font-color">字体颜色</Label>
                        <div className="flex space-x-3">
                          <Input
                            id="font-color"
                            type="color"
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            className="w-16"
                          />
                          <Input
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            placeholder="#RRGGBB"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="layout">布局</Label>
                        <select
                          id="layout"
                          value={layout}
                          onChange={(e) => setLayout(e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {coverOptions.xiaohongshu.layouts.map((layoutOption) => (
                            <option key={layoutOption.id} value={layoutOption.id}>{layoutOption.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="apple" 
                      className="w-full" 
                      disabled={!title || isGenerating}
                    >
                      {isGenerating ? "生成中..." : "生成封面"}
                    </Button>
                  </form>
                </div>

                {/* 预览区域 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-2xl font-bold mb-6">封面预览</h2>
                  
                  {previewHtml ? (
                    <div className="w-full aspect-[1/1.4] rounded-lg overflow-hidden border shadow-sm mb-6">
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
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
                      <Button variant="outline">
                        复制HTML
                      </Button>
                      <Button variant="outline">
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
                  {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="aspect-[1/1.4] bg-gray-100 dark:bg-gray-700 relative">
                        <img
                          src={`https://picsum.photos/seed/${i + 500}/400/560`}
                          alt={`Template ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">小红书模板 {i + 1}</h3>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
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
                      <Label htmlFor="wechat-subtitle">副标题/描述 (选填)</Label>
                      <Input
                        id="wechat-subtitle"
                        placeholder="输入副标题或描述..."
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wechat-background-type">背景类型</Label>
                      <select
                        id="wechat-background-type"
                        value={backgroundType}
                        onChange={(e) => setBackgroundType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {coverOptions.wechat.backgroundTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    {backgroundType === 'image' && (
                      <div className="space-y-2">
                        <Label htmlFor="wechat-background-image">背景图片URL</Label>
                        <Input
                          id="wechat-background-image"
                          placeholder="输入背景图片链接..."
                          value={backgroundImage}
                          onChange={(e) => setBackgroundImage(e.target.value)}
                        />
                      </div>
                    )}

                    {backgroundType === 'color' && (
                      <div className="space-y-2">
                        <Label htmlFor="wechat-background-color">背景颜色</Label>
                        <div className="flex space-x-3">
                          <Input
                            id="wechat-background-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-16"
                          />
                          <Input
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            placeholder="#RRGGBB"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="wechat-font-family">字体</Label>
                        <select
                          id="wechat-font-family"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {coverOptions.wechat.fonts.map((font) => (
                            <option key={font.id} value={font.id}>{font.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wechat-font-color">字体颜色</Label>
                        <div className="flex space-x-3">
                          <Input
                            id="wechat-font-color"
                            type="color"
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            className="w-16"
                          />
                          <Input
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            placeholder="#RRGGBB"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wechat-layout">布局</Label>
                        <select
                          id="wechat-layout"
                          value={layout}
                          onChange={(e) => setLayout(e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {coverOptions.wechat.layouts.map((layoutOption) => (
                            <option key={layoutOption.id} value={layoutOption.id}>{layoutOption.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="apple" 
                      className="w-full" 
                      disabled={!title || isGenerating}
                    >
                      {isGenerating ? "生成中..." : "生成封面"}
                    </Button>
                  </form>
                </div>

                {/* 预览区域 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-2xl font-bold mb-6">封面预览</h2>
                  
                  {previewHtml ? (
                    <div className="w-full aspect-[900/383] rounded-lg overflow-hidden border shadow-sm mb-6">
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
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
                      <Button variant="outline">
                        复制HTML
                      </Button>
                      <Button variant="outline">
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
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="aspect-[900/383] bg-gray-100 dark:bg-gray-700 relative">
                        <img
                          src={`https://picsum.photos/seed/${i + 200}/900/383`}
                          alt={`Template ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">微信模板 {i + 1}</h3>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
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
              <h3 className="text-lg font-semibold mb-3">高度可定制</h3>
              <p className="text-gray-600 dark:text-gray-300">自定义背景、字体、颜色、布局等多种参数，打造专属封面。</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">即时预览</h3>
              <p className="text-gray-600 dark:text-gray-300">实时查看封面效果，快速调整满足您的需求。</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 