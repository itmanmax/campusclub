import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import ActivityHeatmap from '../student/activity-heatmap';
import NotificationButton from '../ui/NotificationButton';
import UserAvatar from '../ui/UserAvatar';
import SearchBar from '../ui/SearchBar';
import { LogOut, Bell, Calendar, User, Settings } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Club {
  clubId: number;
  name: string;
  type: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState<string | null>(null);

  // 获取用户的有效角色
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const currentRole = userProfile?.role || storedRole;
    
    console.log('DashboardLayout 用户角色:', {
      userProfileRole: userProfile?.role,
      storedRole,
      effectiveRole: currentRole
    });
    
    if (currentRole) {
      setEffectiveRole(currentRole);
    }
  }, [userProfile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  const handleNotificationClick = () => {
    toast('消息功能正在开发中', {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff'
      }
    });
  };

  const studentNavItems = [
    { href: '/student', label: '社团浏览', icon: '🏢' },
    { href: '/student/clubs', label: '我的社团', icon: '👥' },
    { href: '/student/activities', label: '我的活动', icon: '📅' },
    { href: '/student/calendar', label: '活动日历', icon: '📅' },
    { href: '/clubs/apply', label: '创建社团申请', icon: '📝' },
  ];

  const clubAdminNavItems = [
    { href: '/club-admin', label: '社团管理', icon: '🏢' },
    { href: '/club-admin/info', label: '社团信息', icon: 'ℹ️' },
    { href: '/club-admin/activities', label: '活动管理', icon: '📅' },
    { href: '/club-admin/members', label: '成员管理', icon: '👥' },
  ];

  const systemAdminNavItems = [
    { href: '/system-admin', label: '系统管理', icon: '⚙️' },
    { href: '/system-admin/users', label: '用户管理', icon: '👥' },
    { href: '/system-admin/clubs', label: '社团管理', icon: '🏢' },
    { href: '/system-admin/clubs/review', label: '社团审核', icon: '✅' },
    { href: '/system-admin/activities/review', label: '活动审核', icon: '📋' },
    { href: '/system-admin/logs', label: '系统日志', icon: '📊' },
  ];

  const getNavItems = () => {
    switch (effectiveRole) {
      case 'student':
        return studentNavItems;
      case 'club_admin':
        return clubAdminNavItems;
      case 'school_admin':
        return systemAdminNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-white px-4 flex items-center justify-between fixed top-0 right-0 left-64 z-50">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <SearchBar />
            {(effectiveRole === 'student') && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={toggleHeatmap}
              >
                <Calendar className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.username} />
                    <AvatarFallback>
                      {userProfile?.username?.slice(0, 2)?.toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>个人信息</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>编辑资料</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto pt-14">
          {showHeatmap && effectiveRole === 'student' && (
            <div className="p-4 bg-white border-b">
              <ActivityHeatmap />
            </div>
          )}
          <div className="container mx-auto p-4 max-w-7xl">
            <Outlet />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 