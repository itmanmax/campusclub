import axios from 'axios';
import { toast } from 'react-hot-toast';

// 创建一个axios实例
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    console.log('响应数据:', response.data);
    return response;
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status;
      
      if (status === 401) {
        // 未授权，清除token并重定向到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('userProfile');
        
        // 如果不是在登录页，则重定向到登录页
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        toast.error('登录已过期，请重新登录');
      } else {
        // 其他错误状态
        const message = error.response.data?.message || '请求失败';
        toast.error(message);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      toast.error('服务器无响应，请检查网络连接');
    } else {
      // 请求配置出错
      toast.error('请求错误: ' + error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 