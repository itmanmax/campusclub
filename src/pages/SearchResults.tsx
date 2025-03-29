import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface Club {
  clubId: number;
  name: string;
  description: string;
  category: string;
  status: string;
  starRating: number;
  logoUrl?: string;
  presidentName?: string;
  teacherName?: string;
}

interface Activity {
  activityId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  clubName?: string;
  type?: string;
  coverImage?: string;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 获取所有社团和活动
        const [clubsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/club-user/all-clubs', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': '*/*'
            },
          }),
          fetch('/api/club-user/all-activities', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': '*/*'
            },
          })
        ]);

        const clubsData = await clubsResponse.json();
        const activitiesData = await activitiesResponse.json();

        console.log('社团数据:', clubsData);
        console.log('活动数据:', activitiesData);

        if (clubsData.code === 200 && Array.isArray(clubsData.data)) {
          const filteredClubs = clubsData.data.filter((club: Club) => 
            (club?.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (club?.description?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (club?.category?.toLowerCase() || '').includes(query.toLowerCase())
          );
          setClubs(filteredClubs);
        } else {
          setClubs([]);
          if (clubsData.code !== 200) {
            console.error('获取社团列表失败:', clubsData.message);
          }
        }

        if (activitiesData.code === 200 && Array.isArray(activitiesData.data)) {
          const filteredActivities = activitiesData.data.filter((activity: Activity) =>
            (activity?.title?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (activity?.description?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (activity?.clubName?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (activity?.type?.toLowerCase() || '').includes(query.toLowerCase())
          );
          setActivities(filteredActivities);
        } else {
          setActivities([]);
          if (activitiesData.code !== 200) {
            console.error('获取活动列表失败:', activitiesData.message);
          }
        }
      } catch (error) {
        console.error('搜索出错:', error);
        setError('搜索失败，请稍后重试');
        toast.error('搜索失败，请稍后重试');
        setClubs([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
      setClubs([]);
      setActivities([]);
    }
  }, [query]);

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

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">搜索结果</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">搜索结果: {query}</h1>
      
      {clubs.length === 0 && activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">未找到与 "{query}" 相关的结果</p>
        </div>
      ) : (
        <Tabs defaultValue="clubs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clubs">社团 ({clubs.length})</TabsTrigger>
            <TabsTrigger value="activities">活动 ({activities.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="clubs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <Card key={club.clubId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{club.name}</span>
                      <Badge variant={club.status === 'active' ? 'default' : 'secondary'}>
                        {club.status === 'active' ? '活跃' : '待审核'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">{club.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">分类: {club.category}</span>
                      <span className="text-sm text-gray-500">评分: {club.starRating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <Card key={activity.activityId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{activity.title}</span>
                      <Badge variant={
                        activity.status === 'upcoming' ? 'default' :
                        activity.status === 'ongoing' ? 'default' : 'secondary'
                      }>
                        {activity.status === 'upcoming' ? '即将开始' :
                         activity.status === 'ongoing' ? '进行中' : '已结束'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">开始时间:</span>
                        <span className="text-sm">
                          {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">地点:</span>
                        <span className="text-sm">{activity.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">参与人数:</span>
                        <span className="text-sm">
                          {activity.currentParticipants}/{activity.maxParticipants}
                        </span>
                      </div>
                      {activity.clubName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">举办社团:</span>
                          <span className="text-sm">{activity.clubName}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SearchResults; 