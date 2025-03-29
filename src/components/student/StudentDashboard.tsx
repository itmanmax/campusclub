import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActivitiesList from './activities-list';
import ClubsList from './clubs-list';

const StudentDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">学生控制面板</h1>
      
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities">我的活动</TabsTrigger>
          <TabsTrigger value="clubs">我的社团</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">活动列表</h2>
            </CardHeader>
            <CardContent>
              <ActivitiesList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clubs">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">社团列表</h2>
            </CardHeader>
            <CardContent>
              <ClubsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard; 