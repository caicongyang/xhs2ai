import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import apiService from '../api/apiService';

export default function ImageGeneratorPage() {
  // MiniMaxi图像参数状态
  const [miniMaxiPrompt, setMiniMaxiPrompt] = useState('');
  const [miniMaxiNegativePrompt, setMiniMaxiNegativePrompt] = useState('');
  const [miniMaxiModel, setMiniMaxiModel] = useState('sd-xl');
  const [miniMaxiStyle, setMiniMaxiStyle] = useState('');
  const [miniMaxiSize, setMiniMaxiSize] = useState('1024x1024');
  const [miniMaxiFormat, setMiniMaxiFormat] = useState('png');
  const [miniMaxiNumImages, setMiniMaxiNumImages] = useState(1);
  
  // Kling图像参数状态
  const [klingPrompt, setKlingPrompt] = useState('');
  const [klingNegativePrompt, setKlingNegativePrompt] = useState('');
  const [klingRatio, setKlingRatio] = useState('1:1');
  const [klingStyle, setKlingStyle] = useState('');
  const [klingSteps, setKlingSteps] = useState(25);
  const [klingModel, setKlingModel] = useState('kling-xi');
  
  // 通用状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // 图像选项
  const [imageOptions, setImageOptions] = useState({
    minimaxi: {
      models: [],
      styles: [],
      sizes: [],
      formats: []
    },
    kling: {
      styles: [],
      ratios: []
    }
  });
  
  // 加载图像选项
  useEffect(() => {
    const fetchImageOptions = async () => {
      try {
        const options = await apiService.image.getImageOptions();
        setImageOptions(options);
      } catch (error) {
        console.error('Failed to fetch image options:', error);
        // 设置默认选项以防API请求失败
        const defaultOptions = {
          minimaxi: {
            models: [
              { id: "sd-xl", name: "SD-XL" },
              { id: "sd-turbo", name: "SD Turbo" }
            ],
            styles: [
              { id: "realistic", name: "Realistic" },
              { id: "anime", name: "Anime" }
            ],
            sizes: [
              { id: "1024x1024", name: "Square (1024x1024)" },
              { id: "1024x1792", name: "Portrait (1024x1792)" }
            ],
            formats: [
              { id: "png", name: "PNG" },
              { id: "jpeg", name: "JPEG" }
            ]
          },
          kling: {
            styles: [
              { id: "realistic", name: "Realistic" },
              { id: "anime", name: "Anime" }
            ],
            ratios: [
              { id: "1:1", name: "Square (1:1)" },
              { id: "4:3", name: "Standard (4:3)" }
            ]
          }
        };
        setImageOptions(defaultOptions);
      }
    };
    
    fetchImageOptions();
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
            if (result.result && result.result.images) {
              const images = result.result.images.map(img => ({
                url: img.url,
                local_path: img.local_path
              }));
              setGeneratedImages(images);
            } else if (result.result) {
              // 针对Kling API的单张图片处理
              setGeneratedImages([{
                url: result.result.url,
                local_path: result.result.local_path
              }]);
            }
          } else if (result.status === 'failed') {
            setIsGenerating(false);
            setErrorMessage(result.error || '生成图像时出错');
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
  
  // 提交海螺图像生成请求
  const handleMiniMaxiSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    setErrorMessage('');
    setGeneratedImages([]);
    
    try {
      const response = await apiService.image.generateMiniMaxiImage({
        prompt: miniMaxiPrompt,
        negative_prompt: miniMaxiNegativePrompt || undefined,
        model: miniMaxiModel,
        style: miniMaxiStyle || undefined,
        size: miniMaxiSize,
        format: miniMaxiFormat,
        num_images: miniMaxiNumImages
      });
      
      setTaskId(response.task_id);
    } catch (error) {
      console.error('提交图像生成请求失败:', error);
      setIsGenerating(false);
      setTaskStatus('failed');
      setErrorMessage('提交图像生成请求失败');
    }
  };
  
  // 提交Kling图像生成请求
  const handleKlingSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTaskStatus('pending');
    setErrorMessage('');
    setGeneratedImages([]);
    
    try {
      const response = await apiService.image.generateKlingImage({
        prompt: klingPrompt,
        negative_prompt: klingNegativePrompt || undefined,
        ratio: klingRatio,
        style: klingStyle || undefined,
        steps: klingSteps,
        model: klingModel
      });
      
      setTaskId(response.task_id);
    } catch (error) {
      console.error('提交图像生成请求失败:', error);
      setIsGenerating(false);
      setTaskStatus('failed');
      setErrorMessage('提交图像生成请求失败');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">AI Image Generator</h1>
        <p className="hero-subtitle">Create stunning images with advanced AI models</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="minimaxi" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="minimaxi">MiniMaxi (SD-XL)</TabsTrigger>
              <TabsTrigger value="kling">Kling Image</TabsTrigger>
              <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
            </TabsList>

            {/* MiniMaxi Tab */}
            <TabsContent value="minimaxi" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">Create with MiniMaxi</h2>
                
                <form onSubmit={handleMiniMaxiSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="prompt" className="block text-sm font-medium">
                      Prompt
                    </label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the image you want to create..."
                      value={miniMaxiPrompt}
                      onChange={(e) => setMiniMaxiPrompt(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="negative-prompt" className="block text-sm font-medium">
                      Negative Prompt (Optional)
                    </label>
                    <Textarea
                      id="negative-prompt"
                      placeholder="Describe what you don't want in the image..."
                      value={miniMaxiNegativePrompt}
                      onChange={(e) => setMiniMaxiNegativePrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="model" className="block text-sm font-medium">
                        Model
                      </label>
                      <select
                        id="model"
                        value={miniMaxiModel}
                        onChange={(e) => setMiniMaxiModel(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {imageOptions.minimaxi.models.map((model) => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="style" className="block text-sm font-medium">
                        Style (Optional)
                      </label>
                      <select
                        id="style"
                        value={miniMaxiStyle}
                        onChange={(e) => setMiniMaxiStyle(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">None</option>
                        {imageOptions.minimaxi.styles.map((style) => (
                          <option key={style.id} value={style.id}>{style.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="size" className="block text-sm font-medium">
                        Size
                      </label>
                      <select
                        id="size"
                        value={miniMaxiSize}
                        onChange={(e) => setMiniMaxiSize(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {imageOptions.minimaxi.sizes.map((size) => (
                          <option key={size.id} value={size.id}>{size.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="format" className="block text-sm font-medium">
                        Format
                      </label>
                      <select
                        id="format"
                        value={miniMaxiFormat}
                        onChange={(e) => setMiniMaxiFormat(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {imageOptions.minimaxi.formats.map((format) => (
                          <option key={format.id} value={format.id}>{format.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="num-images" className="block text-sm font-medium">
                        Number of Images
                      </label>
                      <Input
                        id="num-images"
                        type="number"
                        min="1"
                        max="4"
                        value={miniMaxiNumImages}
                        onChange={(e) => setMiniMaxiNumImages(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!miniMaxiPrompt || isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Image"}
                  </Button>
                </form>
              </div>

              {/* Results */}
              {generatedImages.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-xl font-bold mb-6">Generated Images</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="overflow-hidden rounded-lg border">
                        <img 
                          src={image.url} 
                          alt={`Generated ${index + 1}`} 
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(image.timestamp).toLocaleString()}
                            </span>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Kling Tab */}
            <TabsContent value="kling" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">Create with Kling</h2>
                
                <form onSubmit={handleKlingSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="kling-prompt" className="block text-sm font-medium">
                      Prompt
                    </label>
                    <Textarea
                      id="kling-prompt"
                      placeholder="Describe the image you want to create..."
                      value={klingPrompt}
                      onChange={(e) => setKlingPrompt(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="kling-negative-prompt" className="block text-sm font-medium">
                      Negative Prompt (Optional)
                    </label>
                    <Textarea
                      id="kling-negative-prompt"
                      placeholder="Describe what you don't want in the image..."
                      value={klingNegativePrompt}
                      onChange={(e) => setKlingNegativePrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="kling-ratio" className="block text-sm font-medium">
                        Aspect Ratio
                      </label>
                      <select
                        id="kling-ratio"
                        value={klingRatio}
                        onChange={(e) => setKlingRatio(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {imageOptions.kling.ratios.map((ratio) => (
                          <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="kling-style" className="block text-sm font-medium">
                        Style (Optional)
                      </label>
                      <select
                        id="kling-style"
                        value={klingStyle}
                        onChange={(e) => setKlingStyle(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">None</option>
                        {imageOptions.kling.styles.map((style) => (
                          <option key={style.id} value={style.id}>{style.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="kling-steps" className="block text-sm font-medium">
                        Steps
                      </label>
                      <Input
                        id="kling-steps"
                        type="number"
                        min="10"
                        max="50"
                        value={klingSteps}
                        onChange={(e) => setKlingSteps(parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="kling-model" className="block text-sm font-medium">
                        Model
                      </label>
                      <select
                        id="kling-model"
                        value={klingModel}
                        onChange={(e) => setKlingModel(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="kling-xi">Kling-XI</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!klingPrompt || isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Image"}
                  </Button>
                </form>
              </div>

              {/* Results */}
              {generatedImages.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-xl font-bold mb-6">Generated Images</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="overflow-hidden rounded-lg border">
                        <img 
                          src={image.url} 
                          alt={`Generated ${index + 1}`} 
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(image.timestamp).toLocaleString()}
                            </span>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">Your Image Gallery</h2>
                
                {generatedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">You haven't generated any images yet.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Use one of the generators to create images.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, index) => (
                      <div key={index} className="overflow-hidden rounded-lg border">
                        <img 
                          src={`https://picsum.photos/seed/${index + 100}/400/400`} 
                          alt={`Gallery ${index + 1}`} 
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(Date.now() - index * 86400000).toLocaleDateString()}
                            </span>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Multiple AI Models</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose from different state-of-the-art AI models to generate images with varying styles and capabilities.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Customizable Parameters</h3>
              <p className="text-gray-600 dark:text-gray-300">Fine-tune your image generation with adjustable parameters like style, steps, and aspect ratio.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">High-Quality Output</h3>
              <p className="text-gray-600 dark:text-gray-300">Generate professional-grade images for your creative projects, marketing materials, or personal use.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 