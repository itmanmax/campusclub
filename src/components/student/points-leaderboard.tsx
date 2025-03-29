import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Medal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface UserRanking {
  userId: number;
  username: string;
  realName: string;
  role: string;
  creditPoints: number;
  avatarUrl: string;
}

const PointsLeaderboard: React.FC = () => {
  console.log('积分排行榜组件开始初始化', new Date().toISOString());
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  // 尝试从localStorage恢复缓存的数据
  useEffect(() => {
    try {
      const cachedRankings = localStorage.getItem('cachedCreditRankings');
      if (cachedRankings) {
        console.log('从本地缓存恢复积分排行榜数据');
        setRankings(JSON.parse(cachedRankings));
        setLoading(false);
      }
    } catch (e) {
      console.error('恢复缓存数据失败:', e);
    }
  }, []);
  
  useEffect(() => {
    console.log('积分排行榜useEffect开始执行');
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      console.log('开始获取积分排行榜数据');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未找到登录凭证');
      }
      
      const response = await axios.get('/api/user/credit-ranking?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      console.log('获取到的积分排行榜数据:', response.data);
      
      let processedRankings: UserRanking[] = [];
      
      // 直接检查response.data是不是数组，如果是则直接使用
      if (Array.isArray(response.data)) {
        console.log('直接使用排行榜数组数据');
        processedRankings = response.data;
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式排行榜数据处理');
        processedRankings = response.data.data || [];
      } 
      // 如果包含data字段但没有code字段
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('包含data字段的排行榜数据处理');
        processedRankings = response.data.data;
      }
      // 其他情况，尝试空数组
      else {
        console.log('排行榜数据格式不符合预期，使用空数组');
        processedRankings = [];
      }
      
      setRankings(processedRankings);
      
      // 保存到本地缓存
      try {
        localStorage.setItem('cachedCreditRankings', JSON.stringify(processedRankings));
      } catch (e) {
        console.error('缓存排行榜数据失败:', e);
      }
      
      console.log('积分排行榜数据获取成功', {
        rankingsCount: processedRankings.length 
      });
    } catch (err) {
      console.error('获取积分排行榜失败:', err);
      setError('获取积分排行榜失败');
    } finally {
      setLoading(false);
      console.log('积分排行榜数据加载完成', new Date().toISOString());
    }
  };

  console.log('积分排行榜组件渲染', { 
    rankingsCount: rankings.length,
    loading 
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Medal className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm text-gray-500">#{index + 1}</span>;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student':
        return '学生';
      case 'club_admin':
        return '社团管理员';
      case 'teacher':
        return '教师';
      case 'school_admin':
        return '系统管理员';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>积分排行榜</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] overflow-y-auto">
      <CardHeader>
        <CardTitle>活动积分排行榜</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && rankings.length === 0 ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            {error}
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            暂无排行数据
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((user, index) => (
              <div
                key={user.userId}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 ${
                  userProfile?.userId === user.userId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} alt={user.realName} />
                    <AvatarFallback>{user.realName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.realName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{user.username}</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {user.creditPoints} 分
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsLeaderboard; 