import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import apiService from '../api/apiService';

export default function VideoGeneratorPage() {
  // Text-to-Video (Kling)参数状态
  const [klingT2vPrompt, setKlingT2vPrompt] = useState('');
  const [klingT2vNegativePrompt, setKlingT2vNegativePrompt] = useState('');
  const [klingT2vDuration, setKlingT2vDuration] = useState(3);
  const [klingT2vWidth, setKlingT2vWidth] = useState(512);
  const [klingT2vHeight, setKlingT2vHeight] = useState(512);
  const [klingT2vFps, setKlingT2vFps] = useState(24);
  const [klingT2vGuidanceScale, setKlingT2vGuidanceScale] = useState(7.0);
  const [klingT2vSteps, setKlingT2vSteps] = useState(50);
  const [klingT2vModel, setKlingT2vModel] = useState('kling-svd');
  const [klingT2vStyle, setKlingT2vStyle] = useState('');
  const [klingT2vOutputFormat, setKlingT2vOutputFormat] = useState('mp4');
  const [klingT2vQuality, setKlingT2vQuality] = useState('medium');
  
  // Image-to-Video (Kling)参数状态
  const [klingI2vImageUrl, setKlingI2vImageUrl] = useState('');
  const [klingI2vPrompt, setKlingI2vPrompt] = useState('');
  const [klingI2vNegativePrompt, setKlingI2vNegativePrompt] = useState('');
  const [klingI2vDuration, setKlingI2vDuration] = useState(3);
  const [klingI2vFps, setKlingI2vFps] = useState(24);
  const [klingI2vMotionBucketId, setKlingI2vMotionBucketId] = useState(127);
  const [klingI2vGuidanceScale, setKlingI2vGuidanceScale] = useState(7.0);
  const [klingI2vSteps, setKlingI2vSteps] = useState(50);
  const [klingI2vModel, setKlingI2vModel] = useState('kling-i2v');
  const [klingI2vOutputFormat, setKlingI2vOutputFormat] = useState('mp4');
  const [klingI2vQuality, setKlingI2vQuality] = useState('medium');
  
  // MiniMaxi video参数状态
  const [miniMaxiPrompt, setMiniMaxiPrompt] = useState('');
  const [miniMaxiNegativePrompt, setMiniMaxiNegativePrompt] = useState('');
  const [miniMaxiDuration, setMiniMaxiDuration] = useState(3);
  const [miniMaxiContentType, setMiniMaxiContentType] = useState('');
  const [miniMaxiQuality, setMiniMaxiQuality] = useState('standard');
  const [miniMaxiFormat, setMiniMaxiFormat] = useState('mp4');
  
  // 通用状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
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
      intervalId = setInterval(async () => {
        try {
          const result = await apiService.checkTaskStatus(taskId);
          setTaskStatus(result.status);
          
          if (result.status === 'completed') {
            setIsGenerating(false);
            if (result.result) {
              setGeneratedVideo({
                id: taskId,
                videoUrl: result.result.video_url,
                localPath: result.result.local_path,
                timestamp: new Date().toISOString()
              });
            }
          } else if (result.status === 'failed') {
            setIsGenerating(false);
            setErrorMessage(result.error || '生成视频时出错');
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
  
  // 提交MiniMaxi视频生成请求
  const handleMiniMaxiSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    setErrorMessage('');
    setGeneratedVideo(null);
    
    try {
      const response = await apiService.video.generateMiniMaxiVideo({
        prompt: miniMaxiPrompt,
        negative_prompt: miniMaxiNegativePrompt || undefined,
        duration: miniMaxiDuration,
        content_type: miniMaxiContentType || undefined,
        quality: miniMaxiQuality,
        format: miniMaxiFormat
      });
      
      setTaskId(response.task_id);
    } catch (error) {
      console.error('提交视频生成请求失败:', error);
      setIsGenerating(false);
      setTaskStatus('failed');
      setErrorMessage('提交视频生成请求失败');
    }
  };
  
  // 提交Kling Text-to-Video请求
  const handleKlingT2VSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    setErrorMessage('');
    setGeneratedVideo(null);
    
    try {
      const response = await apiService.video.generateKlingVideoFromText({
        prompt: klingT2vPrompt,
        negative_prompt: klingT2vNegativePrompt || undefined,
        duration: klingT2vDuration,
        width: klingT2vWidth,
        height: klingT2vHeight,
        fps: klingT2vFps,
        guidance_scale: klingT2vGuidanceScale,
        num_inference_steps: klingT2vSteps,
        model: klingT2vModel,
        style: klingT2vStyle || undefined,
        output_format: klingT2vOutputFormat,
        quality: klingT2vQuality
      });
      
      setTaskId(response.task_id);
    } catch (error) {
      console.error('提交视频生成请求失败:', error);
      setIsGenerating(false);
      setTaskStatus('failed');
      setErrorMessage('提交视频生成请求失败');
    }
  };
  
  // 提交Kling Image-to-Video请求
  const handleKlingI2VSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    setErrorMessage('');
    setGeneratedVideo(null);
    
    try {
      const response = await apiService.video.generateKlingVideoFromImage({
        image_url: klingI2vImageUrl,
        prompt: klingI2vPrompt || undefined,
        negative_prompt: klingI2vNegativePrompt || undefined,
        duration: klingI2vDuration,
        fps: klingI2vFps,
        motion_bucket_id: klingI2vMotionBucketId,
        guidance_scale: klingI2vGuidanceScale,
        num_inference_steps: klingI2vSteps,
        model: klingI2vModel,
        output_format: klingI2vOutputFormat,
        quality: klingI2vQuality
      });
      
      setTaskId(response.task_id);
    } catch (error) {
      console.error('提交视频生成请求失败:', error);
      setIsGenerating(false);
      setTaskStatus('failed');
      setErrorMessage('提交视频生成请求失败');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">AI Video Generator</h1>
        <p className="hero-subtitle">Create stunning videos with advanced AI models</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="text-to-video" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="text-to-video">Text to Video</TabsTrigger>
              <TabsTrigger value="image-to-video">Image to Video</TabsTrigger>
              <TabsTrigger value="minimaxi">MiniMaxi Video</TabsTrigger>
              <TabsTrigger value="gallery">Video Gallery</TabsTrigger>
            </TabsList>

            {/* 文本到视频标签 */}
            <TabsContent value="text-to-video" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">从文本创建视频</h2>
                
                <form onSubmit={handleKlingT2VSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-prompt">视频提示词</Label>
                    <Textarea
                      id="text-prompt"
                      placeholder="描述您想创建的视频内容..."
                      value={klingT2vPrompt}
                      onChange={(e) => setKlingT2vPrompt(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-negative-prompt">负面提示词（可选）</Label>
                    <Textarea
                      id="text-negative-prompt"
                      placeholder="描述您不希望在视频中出现的内容..."
                      value={klingT2vNegativePrompt}
                      onChange={(e) => setKlingT2vNegativePrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="text-video-model">模型</Label>
                      <select
                        id="text-video-model"
                        value={klingT2vModel}
                        onChange={(e) => setKlingT2vModel(e.target.value)}
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
                        onChange={(e) => {
                          const resolution = videoOptions.resolutions.find(res => res.id === e.target.value);
                          if (resolution) {
                            setKlingT2vWidth(resolution.width);
                            setKlingT2vHeight(resolution.height);
                          }
                        }}
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
                        value={klingT2vDuration}
                        onChange={(e) => setKlingT2vDuration(parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="text-video-fps">帧率（FPS）</Label>
                      <Input
                        id="text-video-fps"
                        type="number"
                        min="15"
                        max="60"
                        value={klingT2vFps}
                        onChange={(e) => setKlingT2vFps(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!klingT2vPrompt || isGenerating}
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
                
                <form onSubmit={handleKlingI2VSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">图片URL</Label>
                    <Input
                      id="image-url"
                      placeholder="输入图片链接..."
                      value={klingI2vImageUrl}
                      onChange={(e) => setKlingI2vImageUrl(e.target.value)}
                      required
                    />
                    
                    {klingI2vImageUrl && (
                      <div className="mt-4 aspect-video rounded-md border overflow-hidden">
                        <img 
                          src={klingI2vImageUrl || "https://via.placeholder.com/640x360"} 
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
                      value={klingI2vPrompt}
                      onChange={(e) => setKlingI2vPrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="image-motion-type">动作类型</Label>
                      <select
                        id="image-motion-type"
                        value={klingI2vMotionBucketId}
                        onChange={(e) => setKlingI2vMotionBucketId(parseInt(e.target.value))}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {videoOptions.motionTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-video-length">视频长度（秒）</Label>
                      <Input
                        id="image-video-length"
                        type="number"
                        min="1"
                        max="10"
                        value={klingI2vDuration}
                        onChange={(e) => setKlingI2vDuration(parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-video-fps">帧率（FPS）</Label>
                      <Input
                        id="image-video-fps"
                        type="number"
                        min="15"
                        max="60"
                        value={klingI2vFps}
                        onChange={(e) => setKlingI2vFps(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!klingI2vImageUrl || isGenerating}
                  >
                    {isGenerating ? "生成中..." : "生成视频"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* MiniMaxi Video */}
            <TabsContent value="minimaxi" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">MiniMaxi Video</h2>
                
                <form onSubmit={handleMiniMaxiSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="miniMaxi-prompt">视频提示词</Label>
                    <Textarea
                      id="miniMaxi-prompt"
                      placeholder="描述您想创建的视频内容..."
                      value={miniMaxiPrompt}
                      onChange={(e) => setMiniMaxiPrompt(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="miniMaxi-negative-prompt">负面提示词（可选）</Label>
                    <Textarea
                      id="miniMaxi-negative-prompt"
                      placeholder="描述您不希望在视频中出现的内容..."
                      value={miniMaxiNegativePrompt}
                      onChange={(e) => setMiniMaxiNegativePrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="miniMaxi-duration">视频长度（秒）</Label>
                    <Input
                      id="miniMaxi-duration"
                      type="number"
                      min="1"
                      max="10"
                      value={miniMaxiDuration}
                      onChange={(e) => setMiniMaxiDuration(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="miniMaxi-content-type">内容类型</Label>
                    <select
                      id="miniMaxi-content-type"
                      value={miniMaxiContentType}
                      onChange={(e) => setMiniMaxiContentType(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">选择内容类型</option>
                      <option value="text">文本</option>
                      <option value="image">图片</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="miniMaxi-quality">视频质量</Label>
                    <select
                      id="miniMaxi-quality"
                      value={miniMaxiQuality}
                      onChange={(e) => setMiniMaxiQuality(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="standard">标准</option>
                      <option value="high">高质量</option>
                    </select>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!miniMaxiPrompt || isGenerating}
                  >
                    {isGenerating ? "生成中..." : "生成视频"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Video Gallery */}
            <TabsContent value="gallery" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">视频库</h2>
                
                {generatedVideo ? (
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-3">视频生成成功</h3>
                    <video 
                      src={generatedVideo.videoUrl} 
                      poster={generatedVideo.localPath}
                      controls 
                      className="w-full h-full"
                    >
                      您的浏览器不支持视频播放
                    </video>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(generatedVideo.timestamp).toLocaleString()}
                    </span>
                    <Button variant="outline" size="sm">
                      下载
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">没有生成的视频。</p>
                )}
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