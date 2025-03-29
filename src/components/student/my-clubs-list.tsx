import React, { useEffect, useState } from 'react';
import { Club, clubService } from '../../services/club-service';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Users, CalendarDays } from 'lucide-react';

const MyClubsList: React.FC = () => {
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchMyClubs = async () => {
    try {
      // 假设后端提供了获取我的社团列表的接口
      const response = await clubService.getMyClubs();
      setMyClubs(response.data);
      setLoading(false);
    } catch (err) {
      setError('获取我的社团列表失败');
      setLoading(false);
    }
  };

  const handleQuitClub = async (clubId: number) => {
    try {
      await clubService.quitClub(clubId);
      // 重新获取列表以更新状态
      fetchMyClubs();
    } catch (err) {
      setError('退出社团失败');
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
      {myClubs.map((club) => (
        <div
          key={club.clubId}
          className="p-4 bg-white rounded-lg border space-y-4"
        >
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={club.logoUrl} alt={club.name} />
              <AvatarFallback>{club.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="text-lg font-semibold">{club.name}</h4>
              <p className="text-sm text-gray-500">{club.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>30 成员</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>5 个活动</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => handleQuitClub(club.clubId)}
              variant="outline"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              退出社团
            </Button>
          </div>
        </div>
      ))}
      {myClubs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          您还没有加入任何社团
        </div>
      )}
    </div>
  );
};

export default MyClubsList; 