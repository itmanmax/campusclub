import axios from 'axios';

const BASE_URL = '/api';

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    userId: number;
    username: string;
    role: 'student' | 'club_admin' | 'school_admin';
    realName: string;
    email: string;
    phone: string;
    gender: string;
    studentId?: string;
    teacherId?: string;
    department: string;
    className?: string;
    status: string;
    avatarUrl: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

export const userService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        username,
        password,
      }, {
        timeout: 60000, // 60秒超时
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('登录错误:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('网络连接错误，请检查API服务是否可用');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，服务器响应时间过长');
      }
      throw error;
    }
  },

  register: async (data: any) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/register`, data);
      return response.data;
    } catch (error: any) {
      console.error('注册错误:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('网络连接错误，请检查API服务是否可用');
      }
      throw error;
    }
  },

  sendVerifyCode: async (email: string) => {
    const response = await axios.post(`${BASE_URL}/user/send-verify-code?email=${email}`);
    return response.data;
  },

  verifyEmail: async (data: { email: string; verifyCode: string }) => {
    const response = await axios.post(`${BASE_URL}/user/verify-email`, data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await axios.put(`${BASE_URL}/user/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    const response = await axios.put(
      `${BASE_URL}/user/password?oldPassword=${oldPassword}&newPassword=${newPassword}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },
}; 