import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import apiService from '../api/apiService';

export default function TitleRewriterPage() {
  const [title, setTitle] = useState('');
  const [titleStyle, setTitleStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rewrittenTitle, setRewrittenTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 风格选项
  const styleOptions = [
    { id: '', name: '默认风格' },
    { id: 'viral', name: '病毒式传播' },
    { id: 'professional', name: '专业商务' },
    { id: 'clickbait', name: '吸引点击' },
    { id: 'seo', name: 'SEO优化' },
    { id: 'creative', name: '创意标题' }
  ];

  // 提交标题重写请求
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setRewrittenTitle('');
    setErrorMessage('');
    
    try {
      const result = await apiService.title.rewriteTitle(title, titleStyle || undefined);
      if (result && result.success) {
        setRewrittenTitle(result.rewritten_title);
      } else {
        setErrorMessage('标题重写失败');
      }
    } catch (error) {
      console.error('标题重写失败:', error);
      setErrorMessage('标题重写失败: ' + (error.message || '未知错误'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">AI 标题重写器</h1>
        <p className="hero-subtitle">用AI技术优化您的标题，提高点击率和吸引力</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
            <h2 className="text-2xl font-bold mb-6">重写您的标题</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title-input">原始标题</Label>
                <Input
                  id="title-input"
                  placeholder="输入需要重写的标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="style-select">标题风格</Label>
                <select
                  id="style-select"
                  value={titleStyle}
                  onChange={(e) => setTitleStyle(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {styleOptions.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                type="submit" 
                variant="apple" 
                className="w-full" 
                disabled={!title || isGenerating}
              >
                {isGenerating ? "处理中..." : "重写标题"}
              </Button>
            </form>
            
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                {errorMessage}
              </div>
            )}
            
            {rewrittenTitle && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold">重写结果</h3>
                
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardContent className="p-6">
                    <p className="text-lg">{rewrittenTitle}</p>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(rewrittenTitle)
                        .then(() => alert('标题已复制到剪贴板'))
                        .catch(err => console.error('复制失败:', err));
                    }}
                  >
                    复制标题
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 标题写作技巧部分 */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">标题写作技巧</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold">使用数字和列表</h3>
                  <p className="text-gray-600 dark:text-gray-300">数字能吸引眼球并提高点击率，例如"7个提高工作效率的方法"</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold">激发好奇心</h3>
                  <p className="text-gray-600 dark:text-gray-300">创造信息缺口，引发读者好奇，例如"这个小习惯能让你的效率翻倍"</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold">使用强烈的形容词</h3>
                  <p className="text-gray-600 dark:text-gray-300">选择情感化和描述性强的词汇，例如"令人震惊"、"必不可少"</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 