import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.url, config.method);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    // 处理超时错误
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'));
    }
    
    // 处理网络错误
    if (!error.response) {
      return Promise.reject(new Error('网络错误，请检查您的网络连接'));
    }
    
    // 处理服务器返回的错误
    if (error.response) {
      // 处理401错误
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      
      // 处理403错误
      if (error.response.status === 403) {
        console.error('访问被拒绝，可能没有权限:', error.config.url);
        return Promise.reject(new Error('访问被拒绝，您可能没有操作权限'));
      }
      
      // 返回服务器的错误信息
      const errorMessage = error.response.data?.message || '请求失败';
      return Promise.reject(new Error(errorMessage));
    }
    
    return Promise.reject(error);
  }
);

// 用户相关API
export const userApi = {
  login: (data) => api.post('/user/login', data),
  register: (data) => api.post('/user/register', data),
  sendVerifyCode: (email) => api.post(`/user/send-verify-code?email=${email}`),
  verifyEmail: (data) => api.post('/user/verify-email', data),
  getUserProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data)
};

// 社团相关API
export const clubApi = {
  getClubsList: () => api.get('/clubs/list'),
  getClubDetail: (id) => api.get(`/clubs/${id}`),
  joinClub: (clubId) => api.post(`/clubs/${clubId}/join`),
  quitClub: (clubId) => api.post(`/clubs/${clubId}/quit`)
};

// 活动相关API
export const activityApi = {
  getActivitiesList: () => api.get('/activities/list'),
  getPersonalRecommend: (limit = 10) => api.get(`/activities/recommend/personal?limit=${limit}`),
  participateActivity: (activityId) => api.post(`/activities/${activityId}/participate`)
};

export default api;