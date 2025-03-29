import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
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
    if (response.data && response.data.code === 200) {
      return response.data;
    }
    return Promise.reject(new Error(response.data?.message || '请求失败'));
  },
  (error) => {
    console.error('Response Error:', error);
    
    // 特殊处理验证码发送请求
    if (error.config && error.config.url && error.config.url.includes('/user/send-verify-code')) {
      // 对于验证码请求，如果是超时或网络错误，返回一个特殊的成功响应
      // 因为验证码可能已经发送成功，我们不希望阻止用户继续操作
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.log('验证码请求超时或网络错误，但可能已发送成功');
        return {
          code: 200,
          message: '验证码可能已发送，请检查邮箱',
          data: null
        };
      }
    }
    
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      if (error.response.status === 403) {
        return Promise.reject(new Error('没有权限访问此资源'));
      }
      return Promise.reject(new Error(error.response.data?.message || '请求失败'));
    }
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'));
    }
    
    return Promise.reject(new Error('网络错误，请检查您的网络连接'));
  }
);

// 用户相关API
export const userApi = {
  login: (data) => api.post('/user/login', data),
  register: (data) => api.post('/user/register', data),
  sendVerifyCode: (email) => {
    // 为验证码发送请求单独设置更长的超时时间
    return axios.post(
      `${api.defaults.baseURL}/user/send-verify-code?email=${email}`, 
      {}, 
      {
        timeout: 60000, // 60秒超时
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        }
      }
    ).then(response => {
      if (response.data && response.data.code === 200) {
        return response.data;
      }
      return Promise.reject(new Error(response.data?.message || '请求失败'));
    }).catch(error => {
      console.error('验证码发送错误:', error);
      // 即使请求失败，也返回一个成功响应，因为验证码可能已经发送
      if (error.code === 'ECONNABORTED' || !error.response) {
        return {
          code: 200,
          message: '验证码可能已发送，请检查邮箱',
          data: null
        };
      }
      throw error;
    });
  },
  verifyEmail: (data) => api.post('/user/verify-email', data),
  getCurrentUser: () => api.get('/user/current'),
};

// 社团相关API
export const clubApi = {
  getActivities: () => api.get('/clubs/activities'),
  getActivityDetail: (activityId) => api.get(`/clubs/activities/${activityId}`),
  signUpActivity: (activityId) => api.post(`/clubs/activities/${activityId}/sign-up`),
  cancelSignUp: (activityId) => api.delete(`/clubs/activities/${activityId}/sign-up`),
  checkInActivity: (activityId) => api.post(`/clubs/activities/${activityId}/check-in`),
  getApplicationStatus: (clubId) => api.get(`/clubs/${clubId}/application-status`),
  withdrawApplication: (clubId) => api.delete(`/clubs/${clubId}/withdraw`),
};

// 社团管理员API
export const clubAdminApi = {
  updateClubInfo: (data) => api.put('/admin/club', data),
  setMemberRole: (userId, data) => api.put(`/admin/club/members/${userId}/role`, data),
  getActivityDetail: (activityId) => api.get(`/admin/club/activities/${activityId}`),
  updateActivity: (activityId, data) => api.put(`/admin/club/activities/${activityId}`, data),
  cancelActivity: (activityId) => api.delete(`/admin/club/activities/${activityId}`),
  getActivities: () => api.get('/admin/club/activities'),
  createActivity: (data) => api.post('/admin/club/activities', data),
  generateCheckInCode: (activityId) => api.post(`/admin/club/activities/${activityId}/check-in-code`),
  getMembers: () => api.get('/admin/club/members'),
  getParticipants: (activityId) => api.get(`/admin/club/activities/${activityId}/participants`),
  getCheckInStats: (activityId) => api.get(`/admin/club/activities/${activityId}/check-in-stats`),
  removeMember: (userId) => api.delete(`/admin/club/members/${userId}`),
};

// 系统管理员API
export const systemAdminApi = {
  manageUserStatus: (userId, data) => api.post(`/admin/system/users/${userId}/status`, data),
  resetUserPassword: (userId) => api.post(`/admin/system/users/${userId}/reset-password`),
  reviewClub: (clubId, data) => api.post(`/admin/system/clubs/${clubId}/review`, data),
  reviewActivity: (activityId, data) => api.post(`/admin/system/activities/${activityId}/review`, data),
  getStatistics: () => api.get('/admin/system/statistics'),
  getLogs: () => api.get('/admin/system/logs'),
  getPendingClubs: () => api.get('/admin/system/clubs/pending'),
  getPendingActivities: () => api.get('/admin/system/activities/pending'),
};

export default api;