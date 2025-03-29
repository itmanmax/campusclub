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

  useEffect(() => {
    console.log('学生仪表盘useEffect开始执行', new Date().toISOString());
    fetchJoinedClubs();
    fetchActivities();
    fetchPoints();
  }, []);

  const fetchJoinedClubs = async () => {
    try {
      console.log('开始获取学生仪表盘数据');
      const response = await axios.get('/api/club-user/joined-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      if (response.data.code === 200) {
        setJoinedClubs(response.data.data);
      }
      console.log('获取学生仪表盘数据成功', {
        joinedClubs: !!response.data.data
      });
    } catch (err) {
      console.error('获取已加入的社团列表失败:', err);
      toast.error('获取社团列表失败');
    } finally {
      console.log('学生仪表盘数据加载完成', new Date().toISOString());
    }
  };

  const fetchActivities = async () => {
    try {
      console.log('开始获取学生仪表盘数据');
      const response = await axios.get('/api/club-user/joined-activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      if (response.data.code === 200) {
        setActivities(response.data.data);
      }
      console.log('获取学生仪表盘数据成功', {
        activities: !!response.data.data
      });
    } catch (err) {
      console.error('获取活动列表失败:', err);
      toast.error('获取活动列表失败');
    } finally {
      console.log('学生仪表盘数据加载完成', new Date().toISOString());
    }
  };

  const fetchPoints = async () => {
    try {
      console.log('开始获取学生仪表盘数据');
      const response = await axios.get('/api/user/credit-points', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      if (response.data.code === 200) {
        setMyPoints(response.data.data || 0);
      }
      console.log('获取学生仪表盘数据成功', {
        creditPoints: !!response.data.data
      });
    } catch (err) {
      console.error('获取积分数据失败:', err);
    } finally {
      console.log('学生仪表盘数据加载完成', new Date().toISOString());
    }
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

  console.log('学生仪表盘组件渲染', { isLoading });

  if (joinedClubs.length === 0 && activities.length === 0) {
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