import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import apiService from '../api/apiService';

export default function ContentRewriterPage() {
  // URL重写状态
  const [url, setUrl] = useState('');
  const [isUrlProcessing, setIsUrlProcessing] = useState(false);
  const [urlResult, setUrlResult] = useState(null);
  const [urlError, setUrlError] = useState('');
  
  // 风格重写状态
  const [styleContent, setStyleContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('xiaohongshu');
  const [isStyleProcessing, setIsStyleProcessing] = useState(false);
  const [styledResult, setStyledResult] = useState('');
  const [styleError, setStyleError] = useState('');

  // 提交URL内容重写请求
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setIsUrlProcessing(true);
    setUrlResult(null);
    setUrlError('');
    
    try {
      const result = await apiService.content.rewriteUrlContent(url);
      if (result && result.success) {
        setUrlResult(result.result);
      } else {
        setUrlError('处理URL内容失败');
      }
    } catch (error) {
      console.error('URL内容重写失败:', error);
      setUrlError('URL内容重写失败: ' + (error.message || '未知错误'));
    } finally {
      setIsUrlProcessing(false);
    }
  };
  
  // 提交风格重写请求
  const handleStyleSubmit = async (e) => {
    e.preventDefault();
    setIsStyleProcessing(true);
    setStyledResult('');
    setStyleError('');
    
    try {
      const result = await apiService.content.rewriteContentStyle(styleContent, selectedStyle);
      if (result && result.success) {
        setStyledResult(result.styled_content);
      } else {
        setStyleError('内容风格重写失败');
      }
    } catch (error) {
      console.error('内容风格重写失败:', error);
      setStyleError('内容风格重写失败: ' + (error.message || '未知错误'));
    } finally {
      setIsStyleProcessing(false);
    }
  };

  // 风格选项
  const styleOptions = [
    { id: 'xiaohongshu', name: '小红书风格', description: '轻松活泼、带有表情符号的风格' },
    { id: 'professional', name: '专业风格', description: '正式、专业的商务风格' },
    { id: 'academic', name: '学术风格', description: '严谨、引用丰富的学术风格' },
    { id: 'conversational', name: '对话风格', description: '轻松、口语化的对话风格' },
    { id: 'poetic', name: '诗意风格', description: '优美、富有意境的文学风格' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">AI 内容重写器</h1>
        <p className="hero-subtitle">通过AI技术优化您的内容，支持URL提取和风格转换</p>
      </section>
      
      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="url-content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="url-content">URL内容重写</TabsTrigger>
              <TabsTrigger value="style-rewrite">内容风格转换</TabsTrigger>
            </TabsList>
            
            {/* URL内容重写 */}
            <TabsContent value="url-content" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">提取并重写URL内容</h2>
                
                <form onSubmit={handleUrlSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="url-input">内容链接</Label>
                    <Input
                      id="url-input"
                      placeholder="输入文章的URL..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!url || isUrlProcessing}
                  >
                    {isUrlProcessing ? "处理中..." : "提取并重写内容"}
                  </Button>
                </form>
                
                {urlError && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                    {urlError}
                  </div>
                )}
                
                {urlResult && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-semibold">{urlResult.title}</h3>
                    
                    <div className="border-t pt-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: urlResult.content.replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          navigator.clipboard.writeText(urlResult.content)
                            .then(() => alert('内容已复制到剪贴板'))
                            .catch(err => console.error('复制失败:', err));
                        }}
                      >
                        复制内容
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* 内容风格转换 */}
            <TabsContent value="style-rewrite" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">内容风格转换</h2>
                
                <form onSubmit={handleStyleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="content-input">原始内容</Label>
                    <Textarea
                      id="content-input"
                      placeholder="输入需要转换风格的内容..."
                      value={styleContent}
                      onChange={(e) => setStyleContent(e.target.value)}
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="style-select">目标风格</Label>
                    <select
                      id="style-select"
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {styleOptions.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name} - {style.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!styleContent || isStyleProcessing}
                  >
                    {isStyleProcessing ? "转换中..." : "转换内容风格"}
                  </Button>
                </form>
                
                {styleError && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                    {styleError}
                  </div>
                )}
                
                {styledResult && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-semibold">转换结果</h3>
                    
                    <div className="border-t pt-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: styledResult.replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          navigator.clipboard.writeText(styledResult)
                            .then(() => alert('内容已复制到剪贴板'))
                            .catch(err => console.error('复制失败:', err));
                        }}
                      >
                        复制内容
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
} 