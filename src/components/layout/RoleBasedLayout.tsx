import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { userService } from '@/services/user-service';

interface User {
  userId: number;
  username: string;
  role: 'student' | 'club_admin' | 'school_admin';
}

const RoleBasedLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 根据用户角色重定向到对应的面板
  switch (user.role) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'club_admin':
      return <Navigate to="/club-admin/dashboard" replace />;
    case 'school_admin':
      return <Navigate to="/system-admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedLayout; 