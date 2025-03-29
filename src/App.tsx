import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
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
