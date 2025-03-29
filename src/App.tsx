import React, { useState, Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RouteGuard from './components/auth/RouteGuard';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import UnauthorizedPage from './pages/unauthorized';
import ProfilePage from './pages/profile/index';
import { Toaster } from 'react-hot-toast';
import SearchResults from './pages/SearchResults';
import axios from 'axios';

// 导入各个角色的仪表盘组件
import StudentDashboard from './components/student/dashboard';
import ClubAdminDashboard from './components/club-president/dashboard';
import SystemAdminDashboard from './components/system-admin/dashboard';
import StudentClubsList from './components/student/clubs-list';
import ClubApply from './components/student/club-apply';
import ClubDetail from './pages/student/ClubDetail';
import ActivityCalendar from './components/student/activity-calendar';
import ClubReview from './components/admin/club-review';
import ActivityReview from './components/admin/activity-review';
// 导入系统管理员的用户管理和社团管理组件
import UserManagement from './components/system-admin/user-management';
import ClubManagement from './components/system-admin/club-management';
import SystemLogs from './components/system-admin/system-logs';
// 导入社团管理员的社团信息组件
import ClubInfo from './components/club-president/club-info';
import ClubMembersList from './components/club-president/members-list';
import ClubActivitiesList from './components/club-president/activities-list';
import MyClubs from './components/student/my-clubs';
import MyActivities from './components/student/my-activities';

// 添加错误边界组件
class ErrorBoundary extends Component<{children: ReactNode}> {
  state = { hasError: false, error: null, errorInfo: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('应用错误边界捕获到错误:', error, errorInfo);
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">应用程序出错了</h1>
            <p className="mb-4">请刷新页面或返回首页重试</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              返回首页
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const getRedirectPath = () => {
    const role = localStorage.getItem('userRole');
    console.log('重定向路径检查 - 用户角色:', role);
    switch (role) {
      case 'student':
        return '/student';
      case 'club_admin':
        return '/club-admin';
      case 'school_admin':
        return '/system-admin';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    // 配置全局错误处理和API拦截器
    console.log('初始化App全局配置');
    setupAxiosInterceptors();
    handleAppErrors();
    
    // 检查是否有保存的调试模式设置
    const debugMode = localStorage.getItem('debug_mode');
    if (debugMode === 'true') {
      console.log('调试模式已启用');
      window.DEBUG_MODE = true;
    }
  }, []);
  
  // 配置axios拦截器
  const setupAxiosInterceptors = () => {
    console.log('设置Axios拦截器');
    
    // 配置axios默认参数
    axios.defaults.timeout = 60000; // 60秒超时
    axios.defaults.headers.common['Accept'] = '*/*';
    axios.defaults.baseURL = '/api'; // 确保baseURL与proxy配置一致
    
    // 请求拦截器
    axios.interceptors.request.use(
      config => {
        console.log(`请求: ${config.method?.toUpperCase()} ${config.url}`);
        
        // 添加认证token
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      error => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    axios.interceptors.response.use(
      response => {
        console.log(`响应: ${response.config.method?.toUpperCase()} ${response.config.url} -> ${response.status}`);
        const data = response.data;
        
        // 检查响应格式并统一处理
        if (data && data.code && data.code !== 200) {
          console.warn('API响应非200状态:', data);
        }
        
        return response;
      },
      error => {
        console.error('响应拦截器错误:', error);
        
        // 处理超时错误
        if (error.code === 'ECONNABORTED') {
          console.error('请求超时');
          return Promise.reject(new Error('请求超时，请稍后重试'));
        }
        
        // 处理网络错误
        if (!error.response) {
          console.error('网络错误或服务器未响应');
          return Promise.reject(new Error('网络连接失败，请检查API服务是否可用'));
        }
        
        // 处理401未授权
        if (error.response && error.response.status === 401) {
          console.log('认证失败，重定向到登录页面');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          window.location.href = '/login';
        }
        
        // 处理403禁止访问
        if (error.response && error.response.status === 403) {
          console.log('请求被拒绝，用户可能无权访问:', error.config?.url);
          return Promise.reject(new Error('请求被拒绝，您可能没有访问权限'));
        }
        
        return Promise.reject(error);
      }
    );
  };
  
  // 设置全局错误处理
  const handleAppErrors = () => {
    console.log('设置全局错误处理');
    
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('全局错误:', { message, source, lineno, colno, error });
      return false;
    };
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的Promise拒绝:', event.reason);
    });
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" />
            <Routes>
              {/* 公共路由 */}
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* 个人信息页面 */}
              <Route
                path="/profile"
                element={
                  <RouteGuard allowedRoles={['student', 'club_admin', 'school_admin']}>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <RouteGuard allowedRoles={['student', 'club_admin', 'school_admin']}>
                    <DashboardLayout>
                      <ProfilePage isEditing />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />

              {/* 学生路由 */}
              <Route
                path="/student"
                element={
                  <RouteGuard allowedRoles={['student']}>
                    <DashboardLayout>
                      <StudentDashboard />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />

              {/* 添加独立的ClubDetail路由 */}
              <Route
                path="/student/clubs/:id"
                element={
                  <RouteGuard allowedRoles={['student']}>
                    <DashboardLayout>
                      <ClubDetail />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />

              {/* 活动日历路由 */}
              <Route
                path="/student/calendar"
                element={
                  <RouteGuard allowedRoles={['student']}>
                    <DashboardLayout>
                      <ActivityCalendar />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />

              {/* 社团管理员路由 */}
              <Route
                path="/club-admin"
                element={
                  <RouteGuard allowedRoles={['club_admin']}>
                    <DashboardLayout>
                      <ClubAdminDashboard />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              {/* 社团管理员 - 社团信息路由 */}
              <Route
                path="/club-admin/info"
                element={
                  <RouteGuard allowedRoles={['club_admin']}>
                    <DashboardLayout>
                      <ClubInfo />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              {/* 社团管理员 - 成员管理路由 */}
              <Route
                path="/club-admin/members"
                element={
                  <RouteGuard allowedRoles={['club_admin']}>
                    <DashboardLayout>
                      <ClubMembersList />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              {/* 社团管理员 - 活动管理路由 */}
              <Route
                path="/club-admin/activities"
                element={
                  <RouteGuard allowedRoles={['club_admin']}>
                    <DashboardLayout>
                      <ClubActivitiesList />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />

              {/* 系统管理员路由 */}
              <Route
                path="/system-admin"
                element={
                  <RouteGuard allowedRoles={['school_admin']}>
                    <DashboardLayout>
                      <SystemAdminDashboard />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/system-admin/clubs/review"
                element={
                  <RouteGuard allowedRoles={['school_admin']}>
                    <DashboardLayout>
                      <ClubReview />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/system-admin/activities/review"
                element={
                  <RouteGuard allowedRoles={['school_admin']}>
                    <DashboardLayout>
                      <ActivityReview />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              {/* 添加用户管理路由 */}
              <Route
                path="/system-admin/users"
                element={
                  <RouteGuard allowedRoles={['school_admin']}>
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              {/* 添加社团管理路由 */}
              <Route
                path="/system-admin/clubs"
                element={
                  <RouteGuard allowedRoles={['school_admin']}>
                    <DashboardLayout>
                      <ClubManagement />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
              {/* 添加系统日志路由 */}
              <Route
                path="/system-admin/logs"
                element={
                  <RouteGuard allowedRoles={['school_admin']}>
                    <DashboardLayout>
                      <SystemLogs />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />

              {/* 根路由和dashboard路由重定向 */}
              <Route
                path="/"
                element={<Navigate to={getRedirectPath()} replace />}
              />
              <Route
                path="/dashboard"
                element={<Navigate to={getRedirectPath()} replace />}
              />

              <Route path="/clubs/apply" element={<ClubApply />} />
              <Route path="/student/clubs" element={<RouteGuard allowedRoles={['student']}><DashboardLayout><MyClubs /></DashboardLayout></RouteGuard>} />
              <Route path="/student/activities" element={<RouteGuard allowedRoles={['student']}><DashboardLayout><MyActivities /></DashboardLayout></RouteGuard>} />

              {/* 通用社团详情路由 */}
              <Route
                path="/clubs/:id"
                element={
                  <RouteGuard allowedRoles={['student', 'club_admin', 'school_admin']}>
                    <DashboardLayout>
                      <ClubDetail />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />

              <Route
                path="/search"
                element={
                  <RouteGuard allowedRoles={['student', 'teacher', 'club_admin', 'school_admin']}>
                    <DashboardLayout>
                      <SearchResults />
                    </DashboardLayout>
                  </RouteGuard>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

// 声明全局调试模式变量
declare global {
  interface Window {
    DEBUG_MODE?: boolean;
  }
}
