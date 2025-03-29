import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format, isAfter, parseISO } from 'date-fns';
import { clubApi } from '../../lib/api';

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      console.log('开始获取活动列表');
      const response = await axios.get('/api/club-user/joined-activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });

      console.log('获取到的活动数据:', response.data);
      
      // 直接检查response.data是不是数组，如果是则直接使用
      if (Array.isArray(response.data)) {
        console.log('直接使用数组数据');
        setActivities(response.data);
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式数据处理');
        setActivities(response.data.data || []);
      } 
      // 如果包含data字段但没有code字段
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('包含data字段的数据处理');
        setActivities(response.data.data);
      }
      // 其他情况显示错误
      else {
        console.log('数据格式不匹配，显示错误消息');
        const message = response.data && response.data.message ? response.data.message : '获取活动列表失败';
        toast.error(message);
      }
    } catch (err) {
      console.error('获取活动列表失败:', err);
      toast.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getActivityStatus = (activity: Activity) => {
    if (!activity || !activity.endTime) return '未知';
    
    try {
      const now = new Date();
      const endDate = parseISO(activity.endTime);
      return isAfter(now, endDate) ? '已结束' : '进行中';
    } catch (error) {
      console.error('日期解析错误:', error);
      return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已结束':
        return 'bg-gray-100 text-gray-800';
      case '进行中':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
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
      <h1 className="text-2xl font-bold mb-6">我参加的活动</h1>
      <div className="grid gap-6">
        {activities && activities.length > 0 ? activities.map((activity) => (
          <Card key={activity.activityId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{activity.title}</CardTitle>
                  <p className="text-sm text-gray-500">{activity.clubName}</p>
                </div>
                <Badge className={getStatusColor(getActivityStatus(activity))}>
                  {getActivityStatus(activity)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">活动类型：</span>
                    {activity.type || '未知'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">活动地点：</span>
                    {activity.location || '未知'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">参与人数：</span>
                    {activity.currentParticipants || 0}/{activity.maxParticipants || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">开始时间：</span>
                    {activity.startTime ? format(parseISO(activity.startTime), 'yyyy-MM-dd HH:mm') : '未知'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">结束时间：</span>
                    {activity.endTime ? format(parseISO(activity.endTime), 'yyyy-MM-dd HH:mm') : '未知'}
                  </p>
                  <p className="text-sm text-orange-600">
                    <span className="font-medium">活动学分：</span>
                    {activity.creditPoints || 0} 分
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8 text-gray-500">
            您还没有参加任何活动
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivities; 