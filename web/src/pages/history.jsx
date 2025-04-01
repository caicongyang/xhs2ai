import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

export default function HistoryPage() {
  // Mock data for history
  const [history, setHistory] = useState({
    titles: [
      {
        id: 1,
        title: "10 Essential Strategies to Master Content Marketing in 2023",
        topic: "Content Marketing",
        date: "2023-04-12T10:30:00Z"
      },
      {
        id: 2,
        title: "Why Artificial Intelligence Is Changing the Future of Business",
        topic: "Artificial Intelligence",
        date: "2023-04-10T14:45:00Z"
      },
      {
        id: 3,
        title: "The Ultimate Guide to Social Media: Everything You Need to Know",
        topic: "Social Media",
        date: "2023-04-05T09:15:00Z"
      }
    ],
    content: [
      {
        id: 1,
        originalContent: "Content marketing is important for businesses. It helps to attract customers and build brand awareness.",
        rewrittenContent: "Content marketing serves as a crucial strategy for businesses, effectively attracting potential customers while simultaneously building substantial brand awareness.",
        tone: "Professional",
        date: "2023-04-11T11:20:00Z"
      },
      {
        id: 2,
        originalContent: "AI technology is changing how we work and live. Many industries are using AI to improve efficiency.",
        rewrittenContent: "Artificial Intelligence technology is revolutionizing both our work environments and daily lives. A multitude of industries are now implementing AI solutions to significantly enhance operational efficiency.",
        tone: "Formal",
        date: "2023-04-09T16:30:00Z"
      }
    ],
    videos: [
      {
        id: 1,
        title: "How to Create Engaging Social Media Content",
        description: "This video explains strategies for creating content that engages your audience on social media platforms.",
        thumbnailUrl: "https://picsum.photos/seed/123/800/450",
        style: "Modern",
        duration: "60",
        date: "2023-04-08T13:10:00Z"
      },
      {
        id: 2,
        title: "Introduction to Machine Learning",
        description: "A beginner-friendly overview of machine learning concepts and applications.",
        thumbnailUrl: "https://picsum.photos/seed/456/800/450",
        style: "Corporate",
        duration: "90",
        date: "2023-04-03T10:45:00Z"
      }
    ]
  });

  const handleClearHistory = (type) => {
    if (window.confirm(`Are you sure you want to clear your ${type} history?`)) {
      setHistory({
        ...history,
        [type]: []
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard!');
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">Your Content History</h1>
        <p className="hero-subtitle">Access and manage all your generated content in one place</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="titles">Titles</TabsTrigger>
              <TabsTrigger value="content">Rewritten Content</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>

            {/* All Content Tab */}
            <TabsContent value="all">
              <div className="space-y-10">
                {/* Titles Section */}
                {history.titles.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Generated Titles</h2>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleClearHistory('titles')}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Clear Titles
                      </Button>
                    </div>
                    
                    <ul className="space-y-4">
                      {history.titles.map((item) => (
                        <li key={item.id} className="p-4 border rounded-lg">
                          <p className="font-medium">{item.title}</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Topic: {item.topic}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content Section */}
                {history.content.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Rewritten Content</h2>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleClearHistory('content')}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Clear Content
                      </Button>
                    </div>
                    
                    <ul className="space-y-6">
                      {history.content.map((item) => (
                        <li key={item.id} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between items-center">
                            <div>
                              <span className="inline-block px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 mr-2">
                                {item.tone}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(item.date).toLocaleString()}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(item.rewrittenContent)}
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="p-4 grid md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Original</h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">{item.originalContent}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-2">Rewritten</h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">{item.rewrittenContent}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Videos Section */}
                {history.videos.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Generated Videos</h2>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleClearHistory('videos')}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Clear Videos
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {history.videos.map((video) => (
                        <div key={video.id} className="rounded-lg overflow-hidden border">
                          <div className="relative">
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title} 
                              className="w-full aspect-video object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button className="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium truncate">{video.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{video.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex space-x-2">
                                <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">
                                  {video.style}
                                </span>
                                <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">
                                  {video.duration}s
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(video.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {history.titles.length === 0 && history.content.length === 0 && history.videos.length === 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border text-center">
                    <h2 className="text-2xl font-bold mb-4">No Content Found</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">You haven't generated any content yet.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <Button variant="default" onClick={() => window.location.href = '/title-generator'}>Generate Titles</Button>
                      <Button variant="default" onClick={() => window.location.href = '/content-rewriter'}>Rewrite Content</Button>
                      <Button variant="default" onClick={() => window.location.href = '/video-generator'}>Create Videos</Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Titles Tab */}
            <TabsContent value="titles">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Generated Titles</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleClearHistory('titles')}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear Titles
                  </Button>
                </div>
                
                {history.titles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">You haven't generated any titles yet.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Use the Title Generator to create titles.</p>
                    <Button variant="default" className="mt-6" onClick={() => window.location.href = '/title-generator'}>
                      Go to Title Generator
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {history.titles.map((item) => (
                      <li key={item.id} className="p-4 border rounded-lg">
                        <p className="font-medium">{item.title}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Topic: {item.topic}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Rewritten Content</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleClearHistory('content')}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear Content
                  </Button>
                </div>
                
                {history.content.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">You haven't rewritten any content yet.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Use the Content Rewriter to transform your text.</p>
                    <Button variant="default" className="mt-6" onClick={() => window.location.href = '/content-rewriter'}>
                      Go to Content Rewriter
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {history.content.map((item) => (
                      <li key={item.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between items-center">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 mr-2">
                              {item.tone}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.date).toLocaleString()}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(item.rewrittenContent)}
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="p-4 grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Original</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{item.originalContent}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium mb-2">Rewritten</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{item.rewrittenContent}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Generated Videos</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleClearHistory('videos')}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear Videos
                  </Button>
                </div>
                
                {history.videos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">You haven't created any videos yet.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Use the Video Generator to create engaging videos.</p>
                    <Button variant="default" className="mt-6" onClick={() => window.location.href = '/video-generator'}>
                      Go to Video Generator
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.videos.map((video) => (
                      <div key={video.id} className="rounded-lg overflow-hidden border">
                        <div className="relative">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full aspect-video object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button className="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium truncate">{video.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{video.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex space-x-2">
                              <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">
                                {video.style}
                              </span>
                              <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">
                                {video.duration}s
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(video.date).toLocaleDateString()}
                            </span>
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
      
      {/* Stats Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Your Content Stats</h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{history.titles.length}</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Titles Generated</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{history.content.length}</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Content Pieces Rewritten</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{history.videos.length}</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Videos Created</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 