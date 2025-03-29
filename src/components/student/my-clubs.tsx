import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';

interface Club {
  clubId: number;
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  status: string;
  presidentName: string;
  teacherName: string;
  starRating: number;
}

const MyClubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      console.log('开始获取社团列表');
      const response = await axios.get('/api/club-user/joined-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });

      console.log('获取到的社团数据:', response.data);
      
      // 直接检查response.data是不是数组，如果是则直接使用
      if (Array.isArray(response.data)) {
        console.log('直接使用数组数据');
        setClubs(response.data);
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式数据处理');
        setClubs(response.data.data || []);
      } 
      // 如果包含data字段但没有code字段
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('包含data字段的数据处理');
        setClubs(response.data.data);
      }
      // 其他情况显示错误
      else {
        console.log('数据格式不匹配，显示错误消息');
        const message = response.data && response.data.message ? response.data.message : '获取社团列表失败';
        toast.error(message);
      }
    } catch (err) {
      console.error('获取社团列表失败:', err);
      toast.error('获取社团列表失败');
    } finally {
      setLoading(false);
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
      <h1 className="text-2xl font-bold mb-6">我加入的社团</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.length > 0 ? clubs.map((club) => (
          <Card key={club.clubId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                {club.logoUrl && (
                  <img
                    src={club.logoUrl}
                    alt={club.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-xl">{club.name}</CardTitle>
                  <div className="flex items-center mt-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mr-2">
                      {club.category}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {club.status === 'active' ? '活跃' : club.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 line-clamp-2">{club.description}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>社长: {club.presidentName || '未知'}</span>
                  <span>指导老师: {club.teacherName || '未知'}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">评分:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1">{club.starRating ? club.starRating.toFixed(1) : '0.0'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            您还没有加入任何社团
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClubs; 