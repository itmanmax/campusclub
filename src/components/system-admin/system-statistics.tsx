import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Shield, CalendarDays, Clock, Activity } from 'lucide-react';
import { systemAdminService } from '../../services/system-admin-service';
import { Button } from '../ui/button';

interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalClubs: number;
  pendingClubs: number;
  totalActivities: number;
  ongoingActivities: number;
}

const defaultStats: Statistics = {
  totalUsers: 0,
  activeUsers: 0,
  totalClubs: 0,
  pendingClubs: 0,
  totalActivities: 0,
  ongoingActivities: 0,
};

const SystemStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始获取统计数据...');
      
      // 直接使用fetch而不是service层，以便更好地调试
      const response = await fetch('http://localhost:3001/api/admin/system/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('统计数据API响应状态:', response.status);
      const data = await response.json();
      console.log('统计数据API响应内容:', data);
      
      if (data && data.code === 200 && data.data) {
        setStatistics(data.data);
      } else {
        setError((data && data.message) || '获取统计数据格式错误');
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
      setError('获取统计数据失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">{error}</div>
        <Button onClick={fetchStatistics} variant="outline" size="sm">
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              活跃用户 {statistics.activeUsers} 人
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">社团总数</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalClubs}</div>
            <p className="text-xs text-muted-foreground">
              待审核社团 {statistics.pendingClubs} 个
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活动总数</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              进行中活动 {statistics.ongoingActivities} 个
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              占总用户的{' '}
              {statistics.totalUsers > 0
                ? Math.round((statistics.activeUsers / statistics.totalUsers) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>待处理审核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="text-sm font-medium">待审核社团</div>
                  <div className="text-xs text-muted-foreground">
                    新创建的社团申请
                  </div>
                </div>
                <div className="text-2xl font-bold">{statistics.pendingClubs}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">进行中活动</div>
                  <div className="text-xs text-muted-foreground">
                    当前正在进行的活动
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {statistics.ongoingActivities}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统概况</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">用户活跃率</div>
                  <div className="text-sm">
                    {statistics.totalUsers > 0
                      ? Math.round((statistics.activeUsers / statistics.totalUsers) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">社团审核率</div>
                  <div className="text-sm">
                    {statistics.totalClubs > 0
                      ? Math.round(((statistics.totalClubs - statistics.pendingClubs) / statistics.totalClubs) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">系统版本</div>
                  <div className="text-sm">v2.3.0</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">最近更新</div>
                  <div className="text-sm">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemStatistics; 