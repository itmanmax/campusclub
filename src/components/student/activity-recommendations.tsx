import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

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
  const [personalRecommendations, setPersonalRecommendations] = useState<Activity[]>([]);
  const [similarActivities, setSimilarActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      };

      // 获取个性化推荐
      const personalResponse = await axios.get('/api/activities/recommend/personal?limit=3', { headers });
      if (personalResponse.data.code === 200) {
        setPersonalRecommendations(personalResponse.data.data);
        
        // 如果有个性化推荐，获取第一个活动的相似活动
        if (personalResponse.data.data.length > 0) {
          const firstActivityId = personalResponse.data.data[0].activityId;
          const similarResponse = await axios.get(`/api/activities/recommend/similar/${firstActivityId}?limit=2`, { headers });
          if (similarResponse.data.code === 200) {
            setSimilarActivities(similarResponse.data.data);
          }
        }
      }
    } catch (error) {
      console.error('获取推荐活动失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const ActivityCard: React.FC<{ activity: Activity; isPersonal?: boolean }> = ({ activity, isPersonal = false }) => (
    <div className="flex space-x-4 p-4 rounded-lg border hover:shadow-md transition-shadow">
      <div className="w-32 h-24 flex-shrink-0">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{activity.title}</h3>
            <p className="text-sm text-gray-600">{activity.clubName}</p>
          </div>
          <Badge variant={isPersonal ? "default" : "secondary"}>
            {activity.type}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(activity.startTime), 'MM月dd日', { locale: zhCN })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(activity.startTime), 'HH:mm')}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{activity.currentParticipants}/{activity.maxParticipants}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-blue-600 font-medium">
            积分: {activity.creditPoints}
          </span>
          {isPersonal && (
            <span className="text-sm text-gray-500">
              个性化推荐
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>活动推荐</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4">
                <div className="w-32 h-24 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>活动推荐</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {personalRecommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-500">个性化推荐</h3>
            {personalRecommendations.map((activity) => (
              <ActivityCard
                key={activity.activityId}
                activity={activity}
                isPersonal={true}
              />
            ))}
          </div>
        )}
        
        {similarActivities.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-500">相似活动推荐</h3>
            {similarActivities.map((activity) => (
              <ActivityCard
                key={activity.activityId}
                activity={activity}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityRecommendations; 