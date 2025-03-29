import React, { useEffect, useState } from 'react';
import { Club } from '../../services/club-service';
import { systemAdminService } from '../../services/system-admin-service';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { CheckCircle, XCircle, User, Calendar } from 'lucide-react';

const PendingClubsList: React.FC = () => {
  const [pendingClubs, setPendingClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingClubs();
  }, []);

  const fetchPendingClubs = async () => {
    try {
      const response = await systemAdminService.getPendingClubs();
      setPendingClubs(response.data);
      setLoading(false);
    } catch (err) {
      setError('获取待审核社团列表失败');
      setLoading(false);
    }
  };

  const handleReview = async (clubId: number, approved: boolean) => {
    try {
      await systemAdminService.reviewClub(clubId, {
        approved,
        reason: approved ? '' : '不符合申请条件',
      });
      // 重新获取列表以更新状态
      fetchPendingClubs();
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
      {pendingClubs.map((club) => (
        <Card key={club.clubId}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={club.logoUrl} alt={club.name} />
                <AvatarFallback>{club.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{club.name}</h4>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    待审核
                  </span>
                </div>
                <p className="text-sm text-gray-500">{club.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {club.presidentId}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(club.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <Button
                    onClick={() => handleReview(club.clubId, true)}
                    variant="default"
                    className="flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    通过
                  </Button>
                  <Button
                    onClick={() => handleReview(club.clubId, false)}
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
      {pendingClubs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无待审核的社团
        </div>
      )}
    </div>
  );
};

export default PendingClubsList; 