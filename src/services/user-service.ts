import axiosInstance from '../lib/axios-config';

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
    const response = await axiosInstance.post(`/user/login`, {
      username,
      password,
    });
    return response.data;
  },

  register: async (data: any) => {
    const response = await axiosInstance.post(`/user/register`, data);
    return response.data;
  },

  sendVerifyCode: async (email: string) => {
    const response = await axiosInstance.post(`/user/send-verify-code?email=${email}`);
    return response.data;
  },

  verifyEmail: async (data: { email: string; verifyCode: string }) => {
    const response = await axiosInstance.post(`/user/verify-email`, data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get(`/user/profile`);
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await axiosInstance.put(`/user/profile`, profileData);
    return response.data;
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    const response = await axiosInstance.put(
      `/user/password?oldPassword=${oldPassword}&newPassword=${newPassword}`,
      {}
    );
    return response.data;
  },
}; 