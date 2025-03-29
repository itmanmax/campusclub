import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  activityId: number;
  clubId: number;
  clubName: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  creditPoints: number;
  coverImage: string;
  status: string;
}

const MyActivities: React.FC = () => {
  console.log('MyActivities组件开始初始化', new Date().toISOString());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 尝试从localStorage恢复缓存的数据
  useEffect(() => {
    try {
      const cachedActivities = localStorage.getItem('cachedJoinedActivities');
      if (cachedActivities) {
        console.log('从本地缓存恢复活动数据');
        setActivities(JSON.parse(cachedActivities));
      }
    } catch (e) {
      console.error('恢复缓存数据失败:', e);
    }
  }, []);

  useEffect(() => {
    console.log('MyActivities useEffect开始执行', new Date().toISOString());
    fetchActivities();
    
    return () => {
      console.log('MyActivities组件卸载', new Date().toISOString());
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始获取已参加活动列表');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未找到登录凭证，请重新登录');
      }
      
      const response = await axios.get('/api/club-user/joined-activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      console.log('获取到的活动数据:', response.data);
      
      let processedActivities: Activity[] = [];
      
      // 直接检查response.data是不是数组，如果是则直接使用
      if (Array.isArray(response.data)) {
        console.log('直接使用数组数据');
        processedActivities = response.data;
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式数据处理');
        processedActivities = response.data.data || [];
      } 
      // 如果包含data字段但没有code字段
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('包含data字段的数据处理');
        processedActivities = response.data.data;
      }
      // 其他情况显示错误
      else {
        console.log('数据格式不匹配，显示错误消息');
        const message = response.data && response.data.message ? response.data.message : '获取活动列表失败';
        setError(message);
        toast.error(message);
        return;
      }
      
      console.log('处理后的活动数据:', processedActivities);
      
      // 按开始时间排序，最近的排在前面
      processedActivities.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      
      setActivities(processedActivities);
      
      // 保存到本地缓存
      try {
        localStorage.setItem('cachedJoinedActivities', JSON.stringify(processedActivities));
      } catch (e) {
        console.error('缓存活动数据失败:', e);
      }
    } catch (err) {
      console.error('获取活动列表失败:', err);
      setError(err instanceof Error ? err.message : '获取活动列表失败');
      toast.error('获取活动列表失败');
    } finally {
      setLoading(false);
      console.log('活动数据加载完成', new Date().toISOString());
    }
  };

  // 将活动分类为即将开始、进行中和已结束
  const categorizeActivities = () => {
    const now = new Date();
    const upcoming: Activity[] = [];
    const ongoing: Activity[] = [];
    const past: Activity[] = [];

    activities.forEach(activity => {
      const startTime = new Date(activity.startTime);
      const endTime = new Date(activity.endTime);

      if (startTime > now) {
        upcoming.push(activity);
      } else if (endTime < now) {
        past.push(activity);
      } else {
        ongoing.push(activity);
      }
    });

    return { upcoming, ongoing, past };
  };

  const { upcoming, ongoing, past } = categorizeActivities();

  const handleRetry = () => {
    console.log('手动重试获取活动列表');
    fetchActivities();
  };

  console.log('MyActivities组件渲染', { 
    activitiesTotal: activities.length, 
    upcomingCount: upcoming.length,
    ongoingCount: ongoing.length,
    pastCount: past.length,
    loading, 
    error 
  });

  if (loading && activities.length === 0) {
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我参加的活动</h1>
        {error && (
          <button 
            onClick={handleRetry}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            重试
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {activities.length === 0 && !loading ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {error ? '加载失败，请点击重试按钮' : '您还没有参加任何活动'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {ongoing.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-green-600">正在进行</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoing.map(renderActivityCard)}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-600">即将开始</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map(renderActivityCard)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-600">已结束</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {past.map(renderActivityCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderActivityCard(activity: Activity) {
    const startDate = new Date(activity.startTime);
    const endDate = new Date(activity.endTime);
    const isUpcoming = startDate > new Date();
    const isPast = endDate < new Date();

    let statusBgColor = "bg-green-100";
    let statusTextColor = "text-green-800";

    if (isPast) {
      statusBgColor = "bg-gray-100";
      statusTextColor = "text-gray-800";
    } else if (isUpcoming) {
      statusBgColor = "bg-blue-100";
      statusTextColor = "text-blue-800";
    }

    return (
      <Card key={activity.activityId} className={`hover:shadow-lg transition-shadow ${isPast ? 'opacity-70' : ''}`}>
        <div className="h-40 bg-gray-200 relative">
          {activity.coverImage ? (
            <img
              src={activity.coverImage}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-300">
              <span className="text-gray-500">无封面图片</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded-full ${statusBgColor} ${statusTextColor}`}>
              {isPast ? '已结束' : isUpcoming ? '即将开始' : '进行中'}
            </span>
          </div>
        </div>
        <CardHeader>
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-lg">{activity.title}</CardTitle>
            <p className="text-sm text-blue-600">{activity.clubName}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(startDate, 'yyyy/MM/dd')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{activity.location}</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-4">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                积分: {activity.creditPoints}
              </span>
              <span>
                {activity.currentParticipants}/{activity.maxParticipants} 人
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default MyActivities; 