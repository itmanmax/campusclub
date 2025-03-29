import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format, isAfter, parseISO } from 'date-fns';

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
      const response = await axios.get('http://localhost:3001/api/club-user/joined-activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });

      if (response.data.code === 200) {
        setActivities(response.data.data || []);
      } else {
        toast.error(response.data.message || '获取活动列表失败');
      }
    } catch (err) {
      console.error('获取活动列表失败:', err);
      toast.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const endDate = parseISO(activity.endTime);
    return isAfter(now, endDate) ? '已结束' : '进行中';
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
        {activities.map((activity) => (
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
                    {activity.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">活动地点：</span>
                    {activity.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">参与人数：</span>
                    {activity.currentParticipants}/{activity.maxParticipants}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">开始时间：</span>
                    {format(parseISO(activity.startTime), 'yyyy-MM-dd HH:mm')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">结束时间：</span>
                    {format(parseISO(activity.endTime), 'yyyy-MM-dd HH:mm')}
                  </p>
                  <p className="text-sm text-orange-600">
                    <span className="font-medium">活动学分：</span>
                    {activity.creditPoints} 分
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            您还没有参加任何活动
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivities; 