import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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

const ActivityRecommendations: React.FC = () => {
  console.log('活动推荐组件开始初始化', new Date().toISOString());
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 尝试从localStorage恢复缓存的数据
  useEffect(() => {
    try {
      const cachedActivities = localStorage.getItem('cachedRecommendedActivities');
      if (cachedActivities) {
        console.log('从本地缓存恢复推荐活动数据');
        setActivities(JSON.parse(cachedActivities));
        setLoading(false);
      }
    } catch (e) {
      console.error('恢复缓存数据失败:', e);
    }
  }, []);
  
  useEffect(() => {
    console.log('活动推荐useEffect开始执行');
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      console.log('开始获取推荐活动数据');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未找到登录凭证');
      }
      
      const response = await axios.get('/api/activities/recommend/personal?limit=3', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });
      
      console.log('获取到的推荐活动数据:', response.data);
      
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
      
      // 保存到本地缓存
      try {
        localStorage.setItem('cachedRecommendedActivities', JSON.stringify(processedActivities));
      } catch (e) {
        console.error('缓存推荐活动数据失败:', e);
      }
      
      console.log('推荐活动数据获取成功', {
        activitiesCount: processedActivities.length 
      });
    } catch (err) {
      console.error('获取推荐活动失败:', err);
      setError('获取推荐活动失败');
    } finally {
      setLoading(false);
      console.log('推荐活动数据加载完成', new Date().toISOString());
    }
  };

  const handleActivityClick = (activityId: number) => {
    navigate(`/activities/${activityId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('日期格式化错误:', e);
      return dateString;
    }
  };

  console.log('活动推荐组件渲染', { 
    activitiesCount: activities.length,
    loading 
  });

  return (
    <Card className="h-[500px] overflow-y-auto">
      <CardHeader>
        <CardTitle>推荐活动</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            {error}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            暂无推荐活动
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.activityId}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleActivityClick(activity.activityId)}
              >
                <div className="md:flex">
                  <div className="md:flex-shrink-0 h-32 md:h-auto md:w-40 bg-gray-100">
                    {activity.coverImage ? (
                      <img 
                        src={activity.coverImage} 
                        alt={activity.title} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        无封面图片
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                      {activity.clubName}
                    </div>
                    <h3 className="mt-1 text-lg font-medium truncate">
                      {activity.title}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-3">{formatDate(activity.startTime)}</span>
                      <span>{activity.location}</span>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        积分: {activity.creditPoints || 0}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.currentParticipants}/{activity.maxParticipants} 人
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityRecommendations; 