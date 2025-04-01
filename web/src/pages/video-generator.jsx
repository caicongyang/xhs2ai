import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';

export default function VideoGeneratorPage() {
  // 文本到视频状态
  const [textPrompt, setTextPrompt] = useState('');
  const [textNegativePrompt, setTextNegativePrompt] = useState('');
  const [textVideoLength, setTextVideoLength] = useState(5);
  const [textVideoWidth, setTextVideoWidth] = useState(1280);
  const [textVideoHeight, setTextVideoHeight] = useState(720);
  const [textVideoFPS, setTextVideoFPS] = useState(30);
  const [textVideoModel, setTextVideoModel] = useState('kling-video');
  
  // 图片到视频状态
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageVideoLength, setImageVideoLength] = useState(5);
  const [imageVideoFPS, setImageVideoFPS] = useState(30);
  const [imageMotionScale, setImageMotionScale] = useState(0.3);
  const [imageMotionType, setImageMotionType] = useState('zoom');
  
  // 通用状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  
  // 选项
  const [videoOptions, setVideoOptions] = useState({
    models: [],
    resolutions: [],
    motionTypes: []
  });
  
  // 加载选项
  useEffect(() => {
    // 真实环境中从API获取选项
    // Mock 数据
    const mockVideoOptions = {
      models: [
        { id: "kling-video", name: "Kling 视频生成" }
      ],
      resolutions: [
        { id: "720p", width: 1280, height: 720, name: "720p (1280×720)" },
        { id: "1080p", width: 1920, height: 1080, name: "1080p (1920×1080)" },
        { id: "square", width: 1080, height: 1080, name: "方形 (1080×1080)" },
        { id: "portrait", width: 1080, height: 1920, name: "竖屏 (1080×1920)" }
      ],
      motionTypes: [
        { id: "zoom", name: "缩放" },
        { id: "pan", name: "平移" },
        { id: "rotate", name: "旋转" },
        { id: "random", name: "随机" }
      ]
    };
    
    setVideoOptions(mockVideoOptions);
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
          // 模拟返回的视频URL
          setGeneratedVideos([
            { 
              url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 
              thumbnail: `https://picsum.photos/seed/${Date.now()}/640/360`,
              timestamp: new Date().toISOString()
            },
            ...generatedVideos
          ]);
        }, 3000);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, taskStatus, generatedVideos]);
  
  // 提交文本到视频请求
  const handleTextToVideoSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    
    // 真实环境中调用API
    // 模拟API调用
    const mockTaskId = `text-to-video-${Date.now()}`;
    setTaskId(mockTaskId);
    console.log('文本到视频请求', {
      prompt: textPrompt,
      negative_prompt: textNegativePrompt,
      length: textVideoLength,
      width: textVideoWidth,
      height: textVideoHeight,
      fps: textVideoFPS,
      model: textVideoModel
    });
  };
  
  // 提交图片到视频请求
  const handleImageToVideoSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    
    // 真实环境中调用API
    // 模拟API调用
    const mockTaskId = `image-to-video-${Date.now()}`;
    setTaskId(mockTaskId);
    console.log('图片到视频请求', {
      prompt: imagePrompt,
      image_url: imageUrl,
      length: imageVideoLength,
      fps: imageVideoFPS,
      motion_scale: imageMotionScale,
      motion_type: imageMotionType
    });
  };
  
  // 处理分辨率变化
  const handleResolutionChange = (resolutionId) => {
    const resolution = videoOptions.resolutions.find(res => res.id === resolutionId);
    if (resolution) {
      setTextVideoWidth(resolution.width);
      setTextVideoHeight(resolution.height);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">AI 视频生成器</h1>
        <p className="hero-subtitle">利用AI技术创建令人惊叹的短视频</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="text-to-video" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="text-to-video">文本生成视频</TabsTrigger>
              <TabsTrigger value="image-to-video">图片转视频</TabsTrigger>
            </TabsList>

            {/* 文本到视频标签 */}
            <TabsContent value="text-to-video" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">从文本创建视频</h2>
                
                <form onSubmit={handleTextToVideoSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-prompt">视频提示词</Label>
                    <Textarea
                      id="text-prompt"
                      placeholder="描述您想创建的视频内容..."
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-negative-prompt">负面提示词（可选）</Label>
                    <Textarea
                      id="text-negative-prompt"
                      placeholder="描述您不希望在视频中出现的内容..."
                      value={textNegativePrompt}
                      onChange={(e) => setTextNegativePrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="text-video-model">模型</Label>
                      <select
                        id="text-video-model"
                        value={textVideoModel}
                        onChange={(e) => setTextVideoModel(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {videoOptions.models.map((model) => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="text-video-resolution">分辨率</Label>
                      <select
                        id="text-video-resolution"
                        onChange={(e) => handleResolutionChange(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {videoOptions.resolutions.map((resolution) => (
                          <option key={resolution.id} value={resolution.id}>{resolution.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="text-video-length">视频长度（秒）</Label>
                      <Input
                        id="text-video-length"
                        type="number"
                        min="1"
                        max="10"
                        value={textVideoLength}
                        onChange={(e) => setTextVideoLength(parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="text-video-fps">帧率（FPS）</Label>
                      <Input
                        id="text-video-fps"
                        type="number"
                        min="15"
                        max="60"
                        value={textVideoFPS}
                        onChange={(e) => setTextVideoFPS(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!textPrompt || isGenerating}
                  >
                    {isGenerating ? "生成中..." : "生成视频"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* 图片到视频标签 */}
            <TabsContent value="image-to-video" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">从图片创建视频</h2>
                
                <form onSubmit={handleImageToVideoSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">图片URL</Label>
                    <Input
                      id="image-url"
                      placeholder="输入图片链接..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required
                    />
                    
                    {imageUrl && (
                      <div className="mt-4 aspect-video rounded-md border overflow-hidden">
                        <img 
                          src={imageUrl || "https://via.placeholder.com/640x360"} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/640x360?text=Image+Preview";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-prompt">提示词（可选）</Label>
                    <Textarea
                      id="image-prompt"
                      placeholder="添加额外的描述来引导视频生成..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="image-motion-type">动作类型</Label>
                      <select
                        id="image-motion-type"
                        value={imageMotionType}
                        onChange={(e) => setImageMotionType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {videoOptions.motionTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-motion-scale">动作幅度</Label>
                      <div className="flex items-center space-x-4">
                        <input
                          id="image-motion-scale"
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={imageMotionScale}
                          onChange={(e) => setImageMotionScale(parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm">{imageMotionScale}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-video-length">视频长度（秒）</Label>
                      <Input
                        id="image-video-length"
                        type="number"
                        min="1"
                        max="10"
                        value={imageVideoLength}
                        onChange={(e) => setImageVideoLength(parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-video-fps">帧率（FPS）</Label>
                      <Input
                        id="image-video-fps"
                        type="number"
                        min="15"
                        max="60"
                        value={imageVideoFPS}
                        onChange={(e) => setImageVideoFPS(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!imageUrl || isGenerating}
                  >
                    {isGenerating ? "生成中..." : "生成视频"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          {/* 生成的视频 */}
          {generatedVideos.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
              <h2 className="text-2xl font-bold mb-6">生成的视频</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {generatedVideos.map((video, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-video bg-black">
                      <video 
                        src={video.url} 
                        poster={video.thumbnail}
                        controls 
                        className="w-full h-full"
                      >
                        您的浏览器不支持视频播放
                      </video>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(video.timestamp).toLocaleString()}
                        </span>
                        <Button variant="outline" size="sm">
                          下载
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-center">功能特点</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">多种创建方式</h3>
              <p className="text-gray-600 dark:text-gray-300">支持从文本提示词或静态图片创建动态视频，满足不同需求。</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">视频参数可调</h3>
              <p className="text-gray-600 dark:text-gray-300">自定义视频时长、分辨率、帧率和动效，打造专属视频体验。</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">快速生成</h3>
              <p className="text-gray-600 dark:text-gray-300">先进的AI模型确保快速生成高质量视频，节省创作时间。</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 