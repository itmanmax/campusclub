import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface ClubDetailData {
  clubId: number;
  name: string;
  description: string;
  category: string;
  presidentId: number;
  teacherId: string;
  presidentName: string | null;
  teacherName: string | null;
  logoUrl: string;
  createdAt: string;
  starRating: number;
  status: string;
  isUserJoined?: boolean; // 用户是否已加入
}

const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubDetail, setClubDetail] = useState<ClubDetailData | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchClubDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/club-user/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': '*/*'
          }
        });

        const data = await response.json();
        console.log('获取社团详情响应:', data);
        
        if (data.code === 200) {
          // 获取社团详情成功后，检查用户是否已加入该社团
          await checkUserJoinedStatus(data.data);
        } else {
          setError(data.message || '获取社团信息失败');
          toast.error(data.message || '获取社团信息失败');
        }
      } catch (err) {
        console.error('获取社团详情失败:', err);
        setError('获取社团详情失败');
        toast.error('获取社团详情失败');
      } finally {
        setLoading(false);
      }
    };

    void fetchClubDetail();
  }, [id]);

  // 检查用户是否已加入该社团
  const checkUserJoinedStatus = async (clubData: ClubDetailData) => {
    try {
      const response = await axios.get('http://localhost:3001/api/club-user/joined-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      if (response.data.code === 200) {
        const joinedClubs = response.data.data || [];
        const isJoined = joinedClubs.some((club: any) => club.clubId === clubData.clubId);
        
        setClubDetail({
          ...clubData,
          isUserJoined: isJoined
        });
      } else {
        setClubDetail(clubData);
      }
    } catch (err) {
      console.error('检查用户加入状态失败:', err);
      setClubDetail(clubData);
    }
  };

  // 处理加入社团
  const handleJoinClub = async () => {
    if (!id) return;
    
    try {
      setIsJoining(true);
      const response = await axios.post(`http://localhost:3001/api/clubs/${id}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.code === 200) {
        toast.success('申请加入社团成功！');
        // 更新社团详情，标记用户已加入
        if (clubDetail) {
          setClubDetail({
            ...clubDetail,
            isUserJoined: true
          });
        }
      } else {
        toast.error(response.data.message || '申请加入社团失败');
      }
    } catch (err: any) {
      console.error('申请加入社团失败:', err);
      toast.error(err.response?.data?.message || '申请加入社团失败');
    } finally {
      setIsJoining(false);
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

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => navigate(-1)} variant="outline">
          返回
        </Button>
      </div>
    );
  }

  if (!clubDetail) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">未找到社团信息</div>
        <Button onClick={() => navigate(-1)} variant="outline">
          返回
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{clubDetail.name}</CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-6">
          <div className="w-48 h-48 overflow-hidden rounded-lg">
            <img 
              src={clubDetail.logoUrl || '/default-club-logo.png'} 
              alt={`${clubDetail.name}的logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">社团类别</h3>
                <p className="mt-1">{clubDetail.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">创建时间</h3>
                <p className="mt-1">{new Date(clubDetail.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">社长</h3>
                <p className="mt-1">{clubDetail.presidentName || '未知'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">指导老师</h3>
                <p className="mt-1">{clubDetail.teacherName || '未知'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">社团评分</h3>
                <p className="mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{clubDetail.starRating || 0}</span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">状态</h3>
                <p className="mt-1">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    clubDetail.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {clubDetail.status === 'active' ? '活跃' : '非活跃'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">社团简介</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{clubDetail.description}</p>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline"
            onClick={() => {
              if (clubDetail.presidentId === parseInt(localStorage.getItem('userId') || '0')) {
                navigate(`/clubs/${id}/activities`);
              } else {
                toast.error('抱歉，只有社团社长才能查看活动管理页面');
              }
            }}
          >
            查看活动
          </Button>
          {clubDetail.status === 'active' && (
            clubDetail.isUserJoined ? (
              <Button variant="outline" disabled>
                已加入
              </Button>
            ) : (
              <Button 
                onClick={handleJoinClub} 
                disabled={isJoining}
              >
                {isJoining ? '申请中...' : '申请加入'}
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClubDetail; 