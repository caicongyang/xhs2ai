// API 服务模块 - 集成所有后端API功能

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 基础API请求函数
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
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

// 标题生成相关API
const titleApi = {
  generateTitles: async (text, platform, count = 5) => {
    const response = await apiRequest('/api/generate-titles', {
      method: 'POST',
      body: JSON.stringify({ text, platform, count }),
    });
    return response;
  },
};

// 内容改写相关API
const contentApi = {
  rewriteContent: async (content, tone, style) => {
    const response = await apiRequest('/api/rewrite-content', {
      method: 'POST',
      body: JSON.stringify({ content, tone, style }),
    });
    return response;
  },
};

// 图像生成相关API
const imageApi = {
  // 海螺(MiniMaxi)图像生成
  generateMiniMaxiImage: async (params) => {
    const response = await apiRequest('/api/generate-minimaxi-image', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // Kling图像生成
  generateKlingImage: async (params) => {
    const response = await apiRequest('/api/generate-kling-image', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
};

// 视频生成相关API
const videoApi = {
  // 从文本生成视频
  generateKlingVideoFromText: async (params) => {
    const response = await apiRequest('/api/generate-kling-video-from-text', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // 从图片生成视频
  generateKlingVideoFromImage: async (params) => {
    const response = await apiRequest('/api/generate-kling-video-from-image', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // 视频操作（如：提高帧率、分辨率等）
  processVideo: async (params) => {
    const response = await apiRequest('/api/process-video', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
};

// 封面生成相关API
const coverApi = {
  // 生成小红书封面
  generateXiaohongshuCover: async (params) => {
    const response = await apiRequest('/api/generate-xiaohongshu-cover', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
  
  // 生成微信公众号封面
  generateWechatCover: async (params) => {
    const response = await apiRequest('/api/generate-wechat-cover', {
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

// 导出API服务
const apiService = {
  checkTaskStatus,
  title: titleApi,
  content: contentApi,
  image: imageApi,
  video: videoApi,
  cover: coverApi,
  history: historyApi,
};

export default apiService; 