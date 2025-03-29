import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import { cn } from '../../lib/utils';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

interface Club {
  clubId: number;
  name: string;
  type: string;
}

interface SidebarProps {
  onLogout: () => void;
}

const studentNavItems: MenuItem[] = [
  { href: '/student', label: '社团浏览', icon: '🏢' },
  { href: '/student/clubs', label: '我的社团', icon: '👥' },
  { href: '/student/activities', label: '我的活动', icon: '📅' },
  { href: '/student/calendar', label: '活动日历', icon: '📅' },
  { href: '/clubs/apply', label: '创建社团申请', icon: '📝' },
];

const clubAdminNavItems: MenuItem[] = [
  { href: '/club-admin', label: '社团管理', icon: '🏢' },
  { href: '/club-admin/info', label: '社团信息', icon: 'ℹ️' },
  { href: '/club-admin/activities', label: '活动管理', icon: '📅' },
  { href: '/club-admin/members', label: '成员管理', icon: '👥' },
];

const systemAdminNavItems: MenuItem[] = [
  { href: '/system-admin', label: '系统管理', icon: '⚙️' },
  { href: '/system-admin/users', label: '用户管理', icon: '👥' },
  { href: '/system-admin/clubs', label: '社团管理', icon: '🏢' },
  { href: '/system-admin/clubs/review', label: '社团审核', icon: '✅' },
  { href: '/system-admin/activities/review', label: '活动审核', icon: '📋' },
  { href: '/system-admin/logs', label: '系统日志', icon: '📊' },
];

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [joinedClubs, setJoinedClubs] = useState<Club[]>([]);
  const [effectiveRole, setEffectiveRole] = useState<string | null>(null);

  // 获取用户角色，优先使用 userProfile 中的角色，其次使用 localStorage 中存储的角色
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const currentRole = userProfile?.role || storedRole;
    
    console.log('侧边栏用户角色:', {
      userProfileRole: userProfile?.role,
      storedRole,
      effectiveRole: currentRole
    });
    
    if (currentRole) {
      setEffectiveRole(currentRole);
    }
    
    // 如果角色为学生，获取已加入的社团
    if (currentRole === 'student') {
      fetchJoinedClubs();
    }
  }, [userProfile]);

  const fetchJoinedClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('http://localhost:3001/api/club-user/joined-clubs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });
      if (response.data.code === 200) {
        setJoinedClubs(response.data.data);
      }
    } catch (err) {
      console.error('获取已加入的社团列表失败:', err);
    }
  };

  const getNavItems = () => {
    console.log('当前有效角色:', effectiveRole);
    switch (effectiveRole) {
      case 'student':
        return studentNavItems;
      case 'club_admin':
        return clubAdminNavItems;
      case 'school_admin':
        return systemAdminNavItems;
      default:
        // 没有有效角色，返回空数组
        return [];
    }
  };

  const navItems = getNavItems();

  // 当角色不明确时，显示错误信息
  if (!effectiveRole) {
    return (
      <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
        <div className="flex-1 overflow-auto py-4 px-4 flex flex-col items-center justify-center">
          <p className="text-red-500 text-center mb-4">用户角色未知</p>
          <button 
            onClick={() => {
              onLogout();
              navigate('/login');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-center">
          <span className="text-2xl">🏫</span>
          <span className="ml-2 text-lg font-semibold">社团管理系统</span>
        </div>
        <div className="mt-2 text-center">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {effectiveRole === 'student' ? '学生'
              : effectiveRole === 'club_admin' ? '社团管理员'
              : effectiveRole === 'school_admin' ? '系统管理员'
              : '用户'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <div className="px-3">
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        {effectiveRole === 'student' && joinedClubs.length > 0 && (
          <div className="mt-6 px-3">
            <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500">
              我的社团
            </h2>
            <div className="space-y-1">
              {joinedClubs.map((club) => (
                <Link
                  key={club.clubId}
                  to={`/student/clubs/${club.clubId}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                    location.pathname === `/student/clubs/${club.clubId}` ? "bg-gray-100 text-gray-900" : ""
                  )}
                >
                  <span className="truncate">{club.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <button 
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 