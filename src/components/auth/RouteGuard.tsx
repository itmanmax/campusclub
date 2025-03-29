import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const { userProfile, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // 从localStorage获取token和角色
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      
      console.log('路由守卫检查权限:', {
        allowedRoles,
        storedRole,
        userProfileRole: userProfile?.role,
        token: !!token
      });

      // 如果没有token，重定向到登录页面
      if (!token) {
        console.log('未找到token，重定向到登录页面');
        navigate('/login');
        return;
      }

      // 检查token是否过期
      const tokenTimestamp = localStorage.getItem('tokenTimestamp');
      if (tokenTimestamp) {
        const expiryTime = parseInt(tokenTimestamp) + 24 * 60 * 60 * 1000; // 24小时过期
        if (Date.now() > expiryTime) {
          console.log('Token已过期，重定向到登录页面');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          navigate('/login');
          return;
        }
      }

      // 优先使用userProfile中的角色，其次使用localStorage中的角色
      const effectiveRole = userProfile?.role || storedRole;
      
      // 如果没有角色或者角色不在允许的角色列表中，重定向到未授权页面
      if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
        console.log(`用户角色 ${effectiveRole} 不在允许的角色列表中 ${allowedRoles.join(', ')}，重定向到未授权页面`);
        navigate('/unauthorized');
        return;
      }
      
      // 通过验证
      setAuthorized(true);
    };

    if (!loading) {
      checkAuth();
    }
  }, [navigate, allowedRoles, userProfile, loading]);

  // 在加载状态或未授权状态下不渲染子组件
  if (loading) {
    return <div className="flex justify-center items-center h-screen">验证身份中...</div>;
  }
  
  return authorized ? <>{children}</> : null;
};

export default RouteGuard; 