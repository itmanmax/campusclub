import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ClubMembersList from './members-list';
import ClubActivitiesList from './activities-list';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ClubInfoData {
  clubId: number;
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  status: string;
  createdAt: string;
  presidentId: number;
  teacherId: string;
  starRating: number;
  teacherName: string;
  presidentName: string;
}

const ClubAdminDashboard: React.FC = () => {
  const [clubInfo, setClubInfo] = useState<ClubInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClubInfo();
  }, []);

  const fetchClubInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('正在获取社团信息...');
      
      const response = await fetch('http://localhost:3001/api/admin/club/info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('社团信息API响应状态:', response.status);
      const data = await response.json();
      console.log('社团信息API响应内容:', data);
      
      if (data && data.code === 200 && data.data) {
        setClubInfo(data.data);
      } else {
        setError((data && data.message) || '获取社团信息格式错误');
      }
    } catch (err) {
      console.error('获取社团信息失败:', err);
      setError('获取社团信息失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '不活跃';
      case 'pending': return '待审核';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'pending': return 'text-orange-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">社团管理后台</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">成员总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">本月新增 12 人</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">活动数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">本月已举办 3 场</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">活跃度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">较上月提升 5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">待办事项</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">需要处理的申请</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="info">社团信息</TabsTrigger>
          <TabsTrigger value="members">成员管理</TabsTrigger>
          <TabsTrigger value="activities">活动管理</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>社团基本信息</CardTitle>
              <CardDescription>查看社团信息，如需更新请前往左侧导航栏的"社团信息"页面</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !clubInfo ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-600">加载中...</p>
                  </div>
                </div>
              ) : error && !clubInfo ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                  <Button onClick={fetchClubInfo} variant="outline" size="sm" className="ml-4">
                    重试
                  </Button>
                </div>
              ) : clubInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">基本信息</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">社团名称</p>
                          <p className="text-base">{clubInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">社团分类</p>
                          <p className="text-base">{clubInfo.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">社团状态</p>
                          <p className={`text-base ${getStatusColor(clubInfo.status)}`}>
                            {getStatusText(clubInfo.status)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">创建时间</p>
                          <p className="text-base">{formatDate(clubInfo.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">管理信息</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">社团负责人</p>
                          <p className="text-base">{clubInfo.presidentName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">指导老师</p>
                          <p className="text-base">{clubInfo.teacherName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">社团评分</p>
                          <div className="flex items-center">
                            <span className="text-yellow-500 text-lg mr-1">★</span>
                            <span className="text-base">{clubInfo.starRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">社团描述</h3>
                    <div className="p-4 bg-gray-50 rounded-md">
                      {clubInfo.description || '暂无描述'}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">社团Logo</h3>
                    <div className="flex justify-center">
                      <img 
                        src={clubInfo.logoUrl || 'https://via.placeholder.com/200x200?text=暂无Logo'} 
                        alt={`${clubInfo.name}的Logo`}
                        className="max-h-48 object-contain rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无社团信息
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>成员列表</CardTitle>
              <CardDescription>管理社团成员</CardDescription>
            </CardHeader>
            <CardContent>
              <ClubMembersList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>活动管理</CardTitle>
              <CardDescription>管理社团活动</CardDescription>
            </CardHeader>
            <CardContent>
              <ClubActivitiesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubAdminDashboard; 