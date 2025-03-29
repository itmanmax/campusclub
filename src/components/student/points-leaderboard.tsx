import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Medal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RankingUser {
  userId: number;
  username: string;
  realName: string;
  role: string;
  creditPoints: number;
  avatarUrl: string;
}

const PointsLeaderboard: React.FC = () => {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rankingResponse, pointsResponse] = await Promise.all([
        axios.get('/api/user/credit-ranking?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': '*/*'
          }
        }),
        axios.get('/api/user/credit-points', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': '*/*'
          }
        })
      ]);

      if (rankingResponse.data.code === 200) {
        setUsers(rankingResponse.data.data || []);
      }

      if (pointsResponse.data.code === 200) {
        setMyPoints(pointsResponse.data.data || 0);
      }
    } catch (err) {
      console.error('获取积分数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>积分排行榜</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 当前用户积分 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">我的积分</div>
          <div className="text-2xl font-bold text-blue-600">{myPoints}</div>
        </div>
        
        {/* 排行榜列表 */}
        <div className="space-y-4">
          {users.map((user, index) => (
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
      </CardContent>
    </Card>
  );
};

export default PointsLeaderboard; 