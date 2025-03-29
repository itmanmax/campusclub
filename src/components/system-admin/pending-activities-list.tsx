import React, { useEffect, useState } from 'react';
import { Activity } from '../../services/activity-service';
import { systemAdminService } from '../../services/system-admin-service';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CalendarDays, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';

const PendingActivitiesList: React.FC = () => {
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingActivities();
  }, []);

  const fetchPendingActivities = async () => {
    try {
      const response = await systemAdminService.getPendingActivities();
      setPendingActivities(response.data);
      setLoading(false);
    } catch (err) {
      setError('获取待审核活动列表失败');
      setLoading(false);
    }
  };

  const handleReview = async (activityId: number, approved: boolean) => {
    try {
      await systemAdminService.reviewActivity(activityId, {
        approved,
        reason: approved ? '' : '不符合活动要求',
      });
      // 重新获取列表以更新状态
      fetchPendingActivities();
    } catch (err) {
      setError('审核操作失败');
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
      {pendingActivities.map((activity) => (
        <Card key={activity.activityId}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold">{activity.title}</h4>
                  <p className="text-sm text-gray-500">{activity.clubName}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  待审核
                </span>
              </div>

              <p className="text-sm text-gray-600">{activity.description}</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4" />
                  <span>{new Date(activity.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>限制 {activity.maxParticipants} 人</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm">
                  <span className="text-orange-500 font-medium">
                    {activity.creditPoints} 学分
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => handleReview(activity.activityId, true)}
                    variant="default"
                    className="flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    通过
                  </Button>
                  <Button
                    onClick={() => handleReview(activity.activityId, false)}
                    variant="outline"
                    className="flex items-center text-red-500 hover:text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    拒绝
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {pendingActivities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无待审核的活动
        </div>
      )}
    </div>
  );
};

export default PendingActivitiesList; 