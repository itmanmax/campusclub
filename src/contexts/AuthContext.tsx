import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserProfile, AuthContextType } from '../hooks/useAuth';
import { userApi } from '../lib/api';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('未找到令牌，用户未登录');
        setLoading(false);
        return;
      }
      
      try {
        console.log('获取用户信息中...', new Date().toISOString());
        // 尝试使用userApi失败后会使用axios备用方案
        try {
          console.log('尝试使用userApi获取用户信息');
          const userData = await userApi.getUserProfile();
          console.log('userApi获取用户信息成功:', userData);
          processUserData(userData);
        } catch (apiError) {
          console.error('userApi获取用户信息失败，尝试备用方案:', apiError);
          // 备用方案 - 直接使用axios
          const response = await axios.get('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': '*/*'
            }
          });
          
          console.log('备用方案获取用户信息成功:', response.data);
          
          // 检查返回数据格式并处理
          let userData;
          
          if (response.data && response.data.code === 200) {
            userData = response.data.data;
            console.log('标准格式数据处理');
          } else if (response.data && !response.data.code) {
            userData = response.data;
            console.log('直接使用数据对象');
          } else if (!response.data) {
            console.log('未获取到有效数据');
            setLoading(false);
            return;
          }
          
          processUserData(userData);
        }
      } catch (err) {
        console.error('所有获取用户信息方案均失败:', err);
        if (process.env.NODE_ENV === 'development') {
          console.debug('开发环境信息:', { token, baseURL: axios.defaults.baseURL });
        }
        // 登录失效，清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
      } finally {
        setLoading(false);
      }
    };

    // 处理用户数据的辅助函数
    const processUserData = (userData: any) => {
      console.log('处理后的用户数据:', userData);
      
      if (userData) {
        setUserProfile(userData);
        
        // 保存用户角色到本地存储
        if (userData.role) {
          localStorage.setItem('userRole', userData.role);
          console.log('用户角色已保存:', userData.role);
        }
        
        // 保存其他有用的用户信息
        if (userData.userId) {
          localStorage.setItem('userId', userData.userId.toString());
        }
        
        if (userData.username) {
          localStorage.setItem('username', userData.username);
        }

        // 保存整个用户资料用于备用
        try {
          localStorage.setItem('userProfile', JSON.stringify(userData));
        } catch (e) {
          console.error('保存用户资料到localStorage失败:', e);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userProfile');
    setUserProfile(null);
    console.log('用户已登出，所有凭据已清除');
  };

  return (
    <AuthContext.Provider value={{ userProfile, loading, logout, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}; 