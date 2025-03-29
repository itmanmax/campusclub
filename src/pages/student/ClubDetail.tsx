import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

interface Club {
  clubId: number;
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  status: string;
  presidentName: string | null;
  teacherName: string | null;
  starRating: number;
  createdAt?: string;
}

const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    const fetchClubDetail = async () => {
      try {
        setLoading(true);
        // 获取社团详情
        const response = await fetch(`/api/club-user/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': '*/*'
          }
        });
        
        const data = await response.json();
        console.log('社团详情数据:', data);
        
        if (data.code === 200) {
          setClub(data.data);
        } else {
          setError('获取社团信息失败');
        }
        
        // 检查用户是否已加入社团
        const joinedClubsResponse = await fetch('/api/club-user/joined-clubs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': '*/*'
          }
        });
        
        const joinedClubsData = await joinedClubsResponse.json();
        if (joinedClubsData.code === 200) {
          const joined = joinedClubsData.data.some((c: {clubId: number}) => c.clubId === Number(id));
          setIsJoined(joined);
        }
      } catch (err) {
        setError('获取社团信息失败');
        console.error('获取社团详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClubDetail();
    }
  }, [id]);

  const handleJoinClub = async () => {
    try {
      setJoinLoading(true);
      const response = await fetch(`/api/clubs/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.code === 200) {
        setIsJoined(true);
        toast.success('成功加入社团');
      } else {
        toast.error(data.message || '加入社团失败');
      }
    } catch (err) {
      console.error('加入社团失败:', err);
      toast.error('加入社团失败');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleQuitClub = async () => {
    try {
      setJoinLoading(true);
      const response = await fetch(`/api/clubs/${id}/quit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.code === 200) {
        setIsJoined(false);
        toast.success('成功退出社团');
      } else {
        toast.error(data.message || '退出社团失败');
      }
    } catch (err) {
      console.error('退出社团失败:', err);
      toast.error('退出社团失败');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="text-red-500 text-center p-8">
        <p className="mb-4">{error || '社团信息不存在'}</p>
        <Button onClick={() => navigate('/student')} variant="outline">
          返回社团列表
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 mr-6">
            <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
            <div className="mt-2 flex items-center space-x-3">
              <span className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{club.category}</span>
              <span className="text-sm text-gray-500">评分: {club.starRating.toFixed(1)}</span>
              {club.status === 'active' && (
                <span className="text-sm bg-green-50 text-green-600 px-2 py-1 rounded-md">活跃</span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          {!isJoined ? (
            <Button 
              onClick={handleJoinClub} 
              disabled={joinLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {joinLoading ? '加入中...' : '加入社团'}
            </Button>
          ) : (
            <Button 
              onClick={handleQuitClub} 
              disabled={joinLoading}
              variant="outline"
              className="text-red-500 border-red-300 hover:bg-red-50"
            >
              {joinLoading ? '处理中...' : '退出社团'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">社长</div>
          <div className="text-base">{club.presidentName || '暂无'}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">指导老师</div>
          <div className="text-base">{club.teacherName || '暂无'}</div>
        </div>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-lg font-semibold mb-2">社团简介</h2>
        <p className="text-gray-700 whitespace-pre-line">{club.description}</p>
      </div>
    </div>
  );
};

export default ClubDetail; 