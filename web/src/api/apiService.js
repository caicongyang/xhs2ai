// API 服务模块 - 集成所有后端API功能

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 基础API请求函数
const apiRequest = async (endpoint, options = {}) => {
  // 确保baseUrl没有结尾的斜杠
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
  
  // 确保endpoint以斜杠开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // 处理重复的/api前缀问题
  let finalEndpoint = normalizedEndpoint;
  if (baseUrl.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
    finalEndpoint = normalizedEndpoint.substring(4); // 去掉重复的 /api
    console.log('检测到重复的/api前缀，已修正:', normalizedEndpoint, '->', finalEndpoint);
  }
  
  const url = `${baseUrl}${finalEndpoint}`;
  console.log('API请求URL:', url);
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API请求失败: ${url}`, error);
    throw error;
  }
};

// 检查任务状态
const checkTaskStatus = async (taskId) => {
  return await apiRequest(`/api/tasks/${taskId}`);
};

// 获取生成的文件
const getFile = (filePath) => {
  console.log('原始文件路径:', filePath);
  
  // 清理路径
  let cleanPath = filePath;
  
  // 如果是杂志卡片路径，确保添加src目录
  if (cleanPath.includes('magazine_cards')) {
    const fileName = cleanPath.split('magazine_cards/').pop();
    cleanPath = `/api/files/src/magazine_cards/${fileName}`;
  } else if (!cleanPath.startsWith('/api/')) {
    // 如果路径不是以/api/开头，添加/api/files/前缀
    cleanPath = `/api/files/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  }
  
  // 去除多余的斜杠
  cleanPath = cleanPath.replace(/([^:])\/+/g, '$1/');
  
  // 确保baseUrl没有结尾的斜杠
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
  
  // 处理可能的重复/api前缀
  if (baseUrl.endsWith('/api') && cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4); // 移除开头的/api
  }
  
  // 构造最终URL
  const finalUrl = `${baseUrl}${cleanPath}`;
  
  console.log('构造的文件URL:', finalUrl);
  return finalUrl;
};

// 标题重写相关API
const titleApi = {
  rewriteTitle: async (title, style) => {
    const response = await apiRequest('/api/rewrite/title', {
      method: 'POST',
      body: JSON.stringify({ title, style }),
    });
    return response;
  },
};

// 内容改写相关API
const contentApi = {
  rewriteUrlContent: async (url) => {
    const response = await apiRequest('/api/rewrite/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return response;
  },
  
  rewriteContentStyle: async (content, style) => {
    const response = await apiRequest('/api/rewrite/style', {
      method: 'POST',
      body: JSON.stringify({ content, style }),
    });
    return response;
  },
};

// 图像生成相关API
const imageApi = {
  // 获取图像生成选项
  getImageOptions: async () => {
    return await apiRequest('/api/images/options');
  },
  
  // 海螺(MiniMaxi)图像生成
  generateMiniMaxiImage: async (params) => {
    const response = await apiRequest('/api/minimaxi/images/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // Kling图像生成
  generateKlingImage: async (params) => {
    const response = await apiRequest('/api/kling/images/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
};

// 视频生成相关API
const videoApi = {
  // 海螺(MiniMaxi)视频生成
  generateMiniMaxiVideo: async (params) => {
    const response = await apiRequest('/api/minimaxi/videos/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // 从文本生成视频(Kling)
  generateKlingVideoFromText: async (params) => {
    const response = await apiRequest('/api/kling/videos/text-to-video', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // 从图片生成视频(Kling)
  generateKlingVideoFromImage: async (params) => {
    const response = await apiRequest('/api/kling/videos/image-to-video', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
};

// 封面生成相关API
const coverApi = {
  // 获取封面风格选项
  getCoverStyles: async () => {
    return await apiRequest('/api/covers/styles');
  },
  
  // 生成小红书封面
  generateXiaohongshuCover: async (params) => {
    const response = await apiRequest('/api/covers/xiaohongshu', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // 生成微信公众号封面
  generateWechatCover: async (params) => {
    const response = await apiRequest('/api/covers/wechat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
};

// 历史记录相关API
const historyApi = {
  // 获取历史记录
  getHistory: async (type, page = 1, limit = 10) => {
    return await apiRequest(`/api/history?type=${type}&page=${page}&limit=${limit}`);
  },
  
  // 删除历史记录
  deleteHistoryItem: async (itemId) => {
    return await apiRequest(`/api/history/${itemId}`, {
      method: 'DELETE',
    });
  },
};

// 杂志卡片生成相关API
const magazineCardApi = {
  // 获取杂志卡片风格选项
  getMagazineStyles: async () => {
    return await apiRequest('/api/magazine-cards/styles');
  },
  
  // 生成杂志卡片
  generateMagazineCard: async (params) => {
    const response = await apiRequest('/api/magazine-cards/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  }
};

// 导出API服务
const apiService = {
  checkTaskStatus,
  getFile,
  title: titleApi,
  content: contentApi,
  image: imageApi,
  video: videoApi,
  cover: coverApi,
  history: historyApi,
  magazineCard: magazineCardApi,
};

export default apiService; 