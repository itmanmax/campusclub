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
        setLoading(false);
        return;
      }
      
      try {
        console.log('获取用户信息中...');
        // 直接使用API模块中的方法
        const response = await axios.get('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        });
        
        console.log('获取到的用户信息:', response.data);
        
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
        }
      } catch (err) {
        console.error('获取用户信息失败:', err);
        // 登录失效，清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
      } finally {
        setLoading(false);
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
  };

  return (
    <AuthContext.Provider value={{ userProfile, loading, logout, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}; 