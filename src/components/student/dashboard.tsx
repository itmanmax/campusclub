import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import StudentClubsList from './clubs-list';
import StudentActivitiesList from './activities-list';
import { Club, clubService } from '../../services/club-service';
import { toast } from 'react-hot-toast';
import ActivityCalendar from './activity-calendar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import PointsLeaderboard from './points-leaderboard';
import ActivityRecommendations from './activity-recommendations';

interface JoinedClub {
  clubId: number;
  name: string;
  type: string;
}

interface Activity {
  activityId: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
}

const StudentDashboard: React.FC = () => {
  console.log('学生仪表盘组件开始初始化', new Date().toISOString());
  const location = useLocation();
  const navigate = useNavigate();
  const [joinedClubs, setJoinedClubs] = useState<JoinedClub[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 尝试从localStorage恢复缓存的数据
  useEffect(() => {
    try {
      const cachedClubs = localStorage.getItem('cachedDashboardClubs');
      const cachedActivities = localStorage.getItem('cachedDashboardActivities');
      const cachedPoints = localStorage.getItem('cachedDashboardPoints');
      
      if (cachedClubs) {
        console.log('从本地缓存恢复社团数据');
        setJoinedClubs(JSON.parse(cachedClubs));
      }
      
      if (cachedActivities) {
        console.log('从本地缓存恢复活动数据');
        setActivities(JSON.parse(cachedActivities));
      }
      
      if (cachedPoints) {
        console.log('从本地缓存恢复积分数据');
        setMyPoints(JSON.parse(cachedPoints));
      }
    } catch (e) {
      console.error('恢复缓存数据失败:', e);
    }
  }, []);

  useEffect(() => {
    console.log('学生仪表盘useEffect开始执行', new Date().toISOString());
    loadAllData();
  }, [retryCount]);

  const loadAllData = () => {
    setIsLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('未找到登录凭证，请重新登录');
      setIsLoading(false);
      toast.error('未找到登录凭证，请重新登录');
      return;
    }
    
    Promise.all([
      fetchJoinedClubs(),
      fetchActivities(),
      fetchPoints()
    ])
    .then(() => {
      console.log('所有仪表盘数据加载完成');
      setIsLoading(false);
    })
    .catch(err => {
      console.error('加载仪表盘数据失败:', err);
      setError('加载数据失败，请重试');
      setIsLoading(false);
    });
  };

  const fetchJoinedClubs = async () => {
    try {
      console.log('开始获取学生仪表盘数据 - 社团');
      const response = await axios.get('/api/club-user/joined-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('社团数据响应:', response.data);
      
      let processedClubs: JoinedClub[] = [];
      
      // 直接检查response.data是不是数组，如果是则直接使用
      if (Array.isArray(response.data)) {
        console.log('直接使用社团数组数据');
        processedClubs = response.data;
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式社团数据处理');
        processedClubs = response.data.data || [];
      } 
      // 如果包含data字段但没有code字段
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('包含data字段的社团数据处理');
        processedClubs = response.data.data;
      }
      // 其他情况，尝试空数组
      else {
        console.log('社团数据格式不符合预期，使用空数组');
        processedClubs = [];
      }
      
      setJoinedClubs(processedClubs);
      
      // 缓存到本地
      try {
        localStorage.setItem('cachedDashboardClubs', JSON.stringify(processedClubs));
      } catch (e) {
        console.error('缓存社团数据失败:', e);
      }
      
      console.log('获取学生仪表盘数据成功', {
        joinedClubs: !!processedClubs
      });
    } catch (err) {
      console.error('获取已加入的社团列表失败:', err);
      // 不显示错误提示，继续使用缓存数据
    } finally {
      console.log('学生仪表盘社团数据加载完成', new Date().toISOString());
    }
  };

  const fetchActivities = async () => {
    try {
      console.log('开始获取学生仪表盘数据 - 活动');
      const response = await axios.get('/api/club-user/joined-activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('活动数据响应:', response.data);
      
      let processedActivities: Activity[] = [];
      
      // 直接检查response.data是不是数组，如果是则直接使用
      if (Array.isArray(response.data)) {
        console.log('直接使用活动数组数据');
        processedActivities = response.data;
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式活动数据处理');
        processedActivities = response.data.data || [];
      } 
      // 如果包含data字段但没有code字段
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('包含data字段的活动数据处理');
        processedActivities = response.data.data;
      }
      // 其他情况，尝试空数组
      else {
        console.log('活动数据格式不符合预期，使用空数组');
        processedActivities = [];
      }
      
      setActivities(processedActivities);
      
      // 缓存到本地
      try {
        localStorage.setItem('cachedDashboardActivities', JSON.stringify(processedActivities));
      } catch (e) {
        console.error('缓存活动数据失败:', e);
      }
      
      console.log('获取学生仪表盘数据成功', {
        activities: !!processedActivities
      });
    } catch (err) {
      console.error('获取活动列表失败:', err);
      // 不显示错误提示，继续使用缓存数据
    } finally {
      console.log('学生仪表盘活动数据加载完成', new Date().toISOString());
    }
  };

  const fetchPoints = async () => {
    try {
      console.log('开始获取学生仪表盘数据 - 积分');
      const response = await axios.get('/api/user/credit-points', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('积分数据响应:', response.data);
      
      let points = 0;
      
      // 直接检查response.data是不是数字，如果是则直接使用
      if (typeof response.data === 'number') {
        console.log('直接使用积分数字数据');
        points = response.data;
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式积分数据处理');
        points = response.data.data || 0;
      } 
      // 如果只有data字段
      else if (response.data && typeof response.data.data === 'number') {
        console.log('包含data字段的积分数据处理');
        points = response.data.data;
      }
      
      setMyPoints(points);
      
      // 缓存到本地
      try {
        localStorage.setItem('cachedDashboardPoints', JSON.stringify(points));
      } catch (e) {
        console.error('缓存积分数据失败:', e);
      }
      
      console.log('获取学生仪表盘数据成功', {
        creditPoints: points !== undefined
      });
    } catch (err) {
      console.error('获取积分数据失败:', err);
      // 不显示错误提示，继续使用缓存数据
    } finally {
      console.log('学生仪表盘积分数据加载完成', new Date().toISOString());
    }
  };

  const handleRetry = () => {
    console.log('手动重试加载仪表盘数据');
    setRetryCount(prev => prev + 1);
  };

  const handleClubsClick = () => {
    navigate('/student/clubs');
  };

  const handleActivitiesClick = () => {
    navigate('/student/activities');
  };

  const handleApplyClick = () => {
    navigate('/clubs/apply');
  };

  const renderJoinedClubsText = () => {
    if (joinedClubs.length === 0) return '暂未加入任何社团';
    return joinedClubs.map(club => club.name).join('、');
  };

  // 计算未来的活动数量
  const upcomingActivitiesCount = activities.filter(activity => {
    const endTime = new Date(activity.endTime);
    return endTime > new Date();
  }).length;

  console.log('学生仪表盘组件渲染', { isLoading, clubsCount: joinedClubs.length, activitiesCount: activities.length });

  // 使用缓存数据或加载完成时显示内容
  if (isLoading && joinedClubs.length === 0 && activities.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleRetry}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-sm bg-red-100 rounded px-2 py-1 hover:bg-red-200">重试</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleClubsClick}>
          <h3 className="text-lg font-semibold mb-2">已加入社团</h3>
          <p className="text-3xl font-bold text-blue-600">{joinedClubs.length}</p>
          <p className="text-sm text-gray-500 mt-2">
            {joinedClubs.length > 0 
              ? joinedClubs.map(club => club.name).join('、')
              : '暂未加入任何社团'}
          </p>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleActivitiesClick}>
          <h3 className="text-lg font-semibold mb-2">参与活动</h3>
          <p className="text-3xl font-bold text-green-600">{activities.length}</p>
          <p className="text-sm text-gray-500 mt-2">
            {activities.length > 0 
              ? `下有${upcomingActivitiesCount}个活动即将开始` 
              : '暂未参加任何活动'}
          </p>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">活动积分</h3>
          <p className="text-3xl font-bold text-purple-600">{myPoints}</p>
          <p className="text-sm text-gray-500 mt-2">可兑换校园商城优惠券</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PointsLeaderboard />
        <ActivityRecommendations />
      </div>

      {/* 社团和活动列表 */}
      <Tabs defaultValue="clubs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="clubs">社团列表</TabsTrigger>
          <TabsTrigger value="activities">活动列表</TabsTrigger>
          <TabsTrigger value="calendar">活动日历</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>可加入的社团</CardTitle>
              <CardDescription>浏览并加入感兴趣的社团</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentClubsList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>近期活动</CardTitle>
              <CardDescription>浏览最近的社团活动并报名参加</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentActivitiesList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>活动日历</CardTitle>
              <CardDescription>查看已报名活动的日程安排</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityCalendar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard; 