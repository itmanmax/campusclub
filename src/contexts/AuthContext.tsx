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
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:3001/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        });
        
        if (response.data.code === 200) {
          const userData = response.data.data;
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