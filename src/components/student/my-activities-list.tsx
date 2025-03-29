import React, { useEffect, useState } from 'react';
import { Activity } from '../../services/activity-service';
import { Button } from '../ui/button';
import { CalendarDays, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format, isWithinInterval, parseISO, isAfter } from 'date-fns';

const MyActivitiesList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 根据活动日期和当前日期计算活动状态
  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const startDate = parseISO(activity.startTime);
    const endDate = parseISO(activity.endTime);
    
    if (isAfter(now, endDate)) {
      return 'completed'; // 已结束
    } else if (isWithinInterval(now, { start: startDate, end: endDate })) {
      return 'ongoing'; // 进行中
    } else {
      return 'upcoming'; // 待开始
    }
  };

  useEffect(() => {
    fetchMyActivities();
  }, []);

  const fetchMyActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/club-user/joined-activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      if (response.data.code === 200) {
        // 处理活动数据，添加计算后的状态
        const activitiesWithStatus = response.data.data.map((activity: Activity) => ({
          ...activity,
          status: getActivityStatus(activity)
        }));
        setActivities(activitiesWithStatus);
      } else {
        setError(response.data.message || '获取我的活动列表失败');
      }
      setLoading(false);
    } catch (err) {
      console.error('获取我的活动列表失败:', err);
      setError('获取我的活动列表失败');
      setLoading(false);
    }
  };

  const handleCancelSignUp = async (activityId: number) => {
    try {
      const response = await axios.delete(`/api/clubs/activities/${activityId}/sign-up`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      if (response.data.code === 200) {
        toast.success('取消报名成功');
        // 重新获取列表以更新状态
        fetchMyActivities();
      } else {
        toast.error(response.data.message || '取消报名失败');
      }
    } catch (err) {
      console.error('取消报名失败:', err);
      toast.error('取消报名失败');
    }
  };

  const handleCheckIn = async (activityId: number) => {
    try {
      const response = await axios.post(`/api/clubs/activities/${activityId}/check-in`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      if (response.data.code === 200) {
        toast.success('签到成功');
        // 重新获取列表以更新状态
        fetchMyActivities();
      } else {
        toast.error(response.data.message || '签到失败');
      }
    } catch (err) {
      console.error('签到失败:', err);
      toast.error('签到失败');
    }
  };

  if (loading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.activityId}
          className="p-4 bg-white rounded-lg border space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold">{activity.title}</h4>
              <p className="text-sm text-gray-500">{activity.clubName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                activity.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : activity.status === 'ongoing'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {activity.status === 'upcoming'
                  ? '待开始'
                  : activity.status === 'ongoing'
                  ? '进行中'
                  : '已结束'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4" />
              <span>{format(parseISO(activity.startTime), 'yyyy/MM/dd')} - {format(parseISO(activity.endTime), 'yyyy/MM/dd')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{format(parseISO(activity.startTime), 'HH:mm')} - {format(parseISO(activity.endTime), 'HH:mm')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{activity.location}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-orange-500 font-medium">
                {activity.creditPoints} 学分
              </span>
              {activity.status === 'completed' && (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  已完成
                </span>
              )}
            </div>
            {activity.status === 'upcoming' ? (
              <Button
                onClick={() => handleCancelSignUp(activity.activityId)}
                variant="outline"
                size="sm"
              >
                取消报名
              </Button>
            ) : activity.status === 'ongoing' ? (
              <Button
                onClick={() => handleCheckIn(activity.activityId)}
                variant="default"
                size="sm"
              >
                签到
              </Button>
            ) : null}
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          您还没有报名任何活动
        </div>
      )}
    </div>
  );
};

export default MyActivitiesList; 