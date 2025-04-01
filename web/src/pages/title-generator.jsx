import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

export default function TitleGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('Professional');
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTitles, setSavedTitles] = useState([]);

  const titleStyles = [
    'Professional', 
    'Creative', 
    'SEO-Friendly', 
    'Clickbait', 
    'Question', 
    'How-to'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Mock API call simulation
    setTimeout(() => {
      const mockTitles = [
        "10 Essential Strategies to Master " + topic + " in 2023",
        "Why " + topic + " Is Changing the Future of Business",
        "The Ultimate Guide to " + topic + ": Everything You Need to Know",
        "How " + topic + " Can Transform Your Results in Just 30 Days",
        "Unlocking the Secrets of " + topic + ": Expert Insights Revealed",
        topic + ": The Complete Framework for Success",
        "The Science Behind " + topic + ": What Research Shows",
        "7 Innovative Approaches to " + topic + " That Actually Work"
      ];
      
      setGeneratedTitles(mockTitles);
      setIsGenerating(false);
    }, 1500);
  };

  const saveTitleToHistory = (title) => {
    const newSavedTitle = {
      id: Date.now(),
      title,
      date: new Date().toISOString(),
      topic
    };
    
    setSavedTitles([newSavedTitle, ...savedTitles]);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <h1 className="hero-title">AI Title Generator</h1>
        <p className="hero-subtitle">Create engaging, click-worthy titles for your content in seconds</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="generate">Generate Titles</TabsTrigger>
              <TabsTrigger value="history">Saved Titles</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">Create Attention-Grabbing Titles</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="topic" className="block text-sm font-medium">
                      Topic or Main Subject
                    </label>
                    <Input
                      id="topic"
                      placeholder="Enter your main topic (e.g., 'Digital Marketing', 'Healthy Recipes')"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="keywords" className="block text-sm font-medium">
                      Keywords (optional)
                    </label>
                    <Input
                      id="keywords"
                      placeholder="Enter relevant keywords separated by commas"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Title Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {titleStyles.map((titleStyle) => (
                        <Button
                          key={titleStyle}
                          type="button"
                          variant={style === titleStyle ? "default" : "outline"}
                          onClick={() => setStyle(titleStyle)}
                          className="text-sm"
                        >
                          {titleStyle}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!topic || isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Titles"}
                  </Button>
                </form>
              </div>

              {generatedTitles.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <h2 className="text-xl font-bold mb-4">Generated Titles</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Click on any title to save it to your history</p>
                  
                  <ul className="space-y-4">
                    {generatedTitles.map((title, index) => (
                      <li 
                        key={index} 
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => saveTitleToHistory(title)}
                      >
                        <p className="font-medium">{title}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">Saved Titles</h2>
                
                {savedTitles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">You haven't saved any titles yet.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Generate titles and click on them to save.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {savedTitles.map((item) => (
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
          </Tabs>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Tips for Great Titles</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Be Specific</h3>
              <p className="text-gray-600 dark:text-gray-300">Use numbers and specific details to make your titles more compelling and informative.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Create Curiosity</h3>
              <p className="text-gray-600 dark:text-gray-300">Hint at valuable information without giving everything away to encourage clicks.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Use Power Words</h3>
              <p className="text-gray-600 dark:text-gray-300">Incorporate emotional and impactful words that resonate with your audience.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 