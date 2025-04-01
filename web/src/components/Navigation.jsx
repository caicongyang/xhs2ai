import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

export function Navigation() {
  return (
    <header className="apple-nav sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2"
            >
              <path d="M12 2a8 8 0 0 0-8 8c0 8 4 12 8 12s8-4 8-12a8 8 0 0 0-8-8Z"></path>
              <path d="M15 9c0-3.3-3-6-6-6"></path>
              <path d="M9 9c0-3.3 3-6 6-6"></path>
            </svg>
            <span className="font-semibold">AI Content Studio</span>
          </a>
          <nav className="hidden md:flex ml-8 space-x-4">
            <a href="/title-generator" className="text-sm font-medium hover:text-primary">标题生成</a>
            <a href="/content-rewriter" className="text-sm font-medium hover:text-primary">内容改写</a>
            <a href="/cover-generator" className="text-sm font-medium hover:text-primary">封面设计</a>
            <a href="/image-generator" className="text-sm font-medium hover:text-primary">图片生成</a>
            <a href="/video-generator" className="text-sm font-medium hover:text-primary">视频生成</a>
            <a href="/history" className="text-sm font-medium hover:text-primary">历史记录</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/login" className="text-sm font-medium hover:text-primary">登录</a>
          <Button variant="apple">立即开始</Button>
        </div>
      </div>
    </header>
  );
} 