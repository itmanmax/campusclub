import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserProfile, AuthContextType } from '../hooks/useAuth';

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
        
        // 从缓存读取用户信息
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const userData = JSON.parse(cachedProfile);
            console.log('使用缓存的用户信息');
            setUserProfile(userData);
            
            // 在后台尝试更新用户信息
            fetchUpdatedUserData(token);
            setLoading(false);
            return;
          } catch (e) {
            console.error('解析缓存用户数据失败:', e);
          }
        }
        
        // 没有缓存或缓存无效，直接请求
        const response = await axios.get('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          },
          timeout: 30000
        });
        
        console.log('获取用户信息成功:', response.data);
        
        // 处理响应数据
        let userData;
        if (response.data && response.data.code === 200) {
          userData = response.data.data;
        } else if (response.data && !response.data.code) {
          userData = response.data;
        } else {
          throw new Error('获取用户数据格式错误');
        }
        
        // 保存用户数据
        setUserProfile(userData);
        
        // 保存必要的数据到localStorage
        if (userData.role) {
          localStorage.setItem('userRole', userData.role);
        }
        if (userData.userId) {
          localStorage.setItem('userId', userData.userId.toString());
        }
        if (userData.username) {
          localStorage.setItem('username', userData.username);
        }
        
        // 缓存完整的用户资料
        localStorage.setItem('userProfile', JSON.stringify(userData));
        
      } catch (err) {
        console.error('获取用户信息失败:', err);
        
        // 尝试用缓存恢复
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const userData = JSON.parse(cachedProfile);
            console.log('API获取失败，使用缓存数据');
            setUserProfile(userData);
          } catch (e) {
            console.error('解析缓存数据失败:', e);
            // 清除所有用户数据
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('userProfile');
          }
        } else {
          // 没有缓存，清除所有数据
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
        }
      } finally {
        setLoading(false);
      }
    };
    
    // 后台更新用户数据，不影响页面加载
    const fetchUpdatedUserData = async (token: string) => {
      try {
        const response = await axios.get('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          },
          timeout: 30000
        });
        
        if (response.data && response.data.code === 200) {
          const freshUserData = response.data.data;
          setUserProfile(freshUserData);
          localStorage.setItem('userProfile', JSON.stringify(freshUserData));
          console.log('后台更新用户数据成功');
        }
      } catch (error) {
        console.error('后台更新用户数据失败:', error);
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