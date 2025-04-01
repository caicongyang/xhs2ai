import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

export default function ContentRewriterPage() {
  const [originalContent, setOriginalContent] = useState('');
  const [rewrittenContent, setRewrittenContent] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);

  const toneOptions = [
    'Professional', 
    'Casual', 
    'Formal', 
    'Creative', 
    'Persuasive', 
    'Technical'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Mock API call simulation
    setTimeout(() => {
      // This is a simple mock rewrite function that would be replaced by actual AI API
      const mockRewriteText = () => {
        // Just some simple replacements to simulate rewriting
        if (tone === 'Professional') {
          let rewritten = originalContent
            .replace(/good/gi, 'excellent')
            .replace(/bad/gi, 'suboptimal')
            .replace(/big/gi, 'substantial')
            .replace(/small/gi, 'minimal')
            .replace(/I think/gi, 'Research indicates')
            .replace(/very/gi, 'significantly');
          
          return rewritten + "\n\n[This content has been professionally rewritten by AI Content Studio]";
        } else if (tone === 'Casual') {
          let rewritten = originalContent
            .replace(/excellent/gi, 'awesome')
            .replace(/require/gi, 'need')
            .replace(/obtain/gi, 'get')
            .replace(/additional/gi, 'extra')
            .replace(/however/gi, 'but')
            .replace(/therefore/gi, 'so');
          
          return rewritten + "\n\n[This content has been casually rewritten by AI Content Studio]";
        } else {
          // For other tones, just return with a note
          return originalContent + "\n\n[This content has been rewritten in " + tone + " tone by AI Content Studio]";
        }
      };
      
      const result = mockRewriteText();
      setRewrittenContent(result);
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        originalContent: originalContent.substring(0, 100) + (originalContent.length > 100 ? '...' : ''),
        rewrittenContent: result.substring(0, 100) + (result.length > 100 ? '...' : ''),
        tone,
        date: new Date().toISOString()
      };
      
      setHistory([historyItem, ...history]);
      setIsProcessing(false);
    }, 2000);
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
        <h1 className="hero-title">AI Content Rewriter</h1>
        <p className="hero-subtitle">Transform your text with AI while maintaining your original message</p>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="rewrite" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="rewrite">Rewrite Content</TabsTrigger>
              <TabsTrigger value="history">Rewrite History</TabsTrigger>
            </TabsList>

            <TabsContent value="rewrite" className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">Rewrite Your Content</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="original-content" className="block text-sm font-medium">
                      Original Content
                    </label>
                    <Textarea
                      id="original-content"
                      placeholder="Paste your content here to be rewritten..."
                      value={originalContent}
                      onChange={(e) => setOriginalContent(e.target.value)}
                      className="min-h-[200px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Tone
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {toneOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={tone === option ? "default" : "outline"}
                          onClick={() => setTone(option)}
                          className="text-sm"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="apple" 
                    className="w-full" 
                    disabled={!originalContent || isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Rewrite Content"}
                  </Button>
                </form>
              </div>

              {rewrittenContent && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Rewritten Content</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(rewrittenContent)}
                    >
                      Copy
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg whitespace-pre-wrap">
                    {rewrittenContent}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
                <h2 className="text-2xl font-bold mb-6">Rewrite History</h2>
                
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">You haven't rewritten any content yet.</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Rewrite content to see your history here.</p>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {history.map((item) => (
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
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Preserve Meaning</h3>
              <p className="text-gray-600 dark:text-gray-300">Our AI maintains the original meaning of your content while improving the writing style.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Multiple Tones</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose from various tones to match your brand voice and target audience.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Eliminate Plagiarism</h3>
              <p className="text-gray-600 dark:text-gray-300">Create unique content that passes plagiarism checks while retaining your original ideas.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 