import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, Shield, CalendarDays, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import SystemStatistics from './system-statistics';
import PendingClubsList from './pending-clubs-list';
import PendingActivitiesList from './pending-activities-list';
import SystemLogs from './system-logs';

const SystemAdminDashboard: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">系统管理后台</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="overview">系统概览</TabsTrigger>
          <TabsTrigger value="clubs">社团审核</TabsTrigger>
          <TabsTrigger value="activities">活动审核</TabsTrigger>
          <TabsTrigger value="logs">系统日志</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SystemStatistics />
        </TabsContent>

        <TabsContent value="clubs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>待审核社团申请</CardTitle>
                <CardDescription>审核新创建的社团申请</CardDescription>
              </div>
              <Link to="/system-admin/clubs/review">
                <Button variant="outline">查看全部</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <PendingClubsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>待审核活动申请</CardTitle>
                <CardDescription>审核社团提交的活动申请</CardDescription>
              </div>
              <Link to="/system-admin/activities/review">
                <Button variant="outline">查看全部</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <PendingActivitiesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>系统日志</CardTitle>
              <CardDescription>查看系统操作日志</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAdminDashboard; 