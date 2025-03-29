import React, { useEffect, useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent } from '../ui/card';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { zhCN } from 'date-fns/locale';
import { format, isWithinInterval, parseISO, isSameDay, isAfter, isBefore, addDays } from 'date-fns';
import { Activity } from '../../services/activity-service';
import axios from 'axios';

const ActivityCalendar: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDateActivities, setSelectedDateActivities] = useState<Activity[]>([]);

  // 根据活动日期和当前日期计算活动状态
  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const startDate = parseISO(activity.startTime);
    const endDate = parseISO(activity.endTime);
    
    if (isAfter(now, endDate)) {
      return '已结束';
    } else if (isWithinInterval(now, { start: startDate, end: endDate })) {
      return '进行中';
    } else {
      return '待开始';
    }
  };

  // 获取活动状态的CSS类
  const getActivityStatusClass = (activity: Activity) => {
    const status = getActivityStatus(activity);
    
    switch (status) {
      case '进行中':
        return 'bg-green-100 text-green-600';
      case '待开始':
        return 'bg-blue-100 text-blue-600';
      case '已结束':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // 查找所有在选定日期当天或跨越选定日期的活动
      const filteredActivities = activities.filter(activity => {
        const startDate = parseISO(activity.startTime);
        const endDate = parseISO(activity.endTime);
        
        // 检查选定日期是否在活动的开始和结束日期之间（包括开始和结束日期）
        return isWithinInterval(selectedDate, { start: startDate, end: endDate }) ||
               isSameDay(selectedDate, startDate) || 
               isSameDay(selectedDate, endDate);
      });
      
      setSelectedDateActivities(filteredActivities);
    }
  }, [selectedDate, activities]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      console.log('开始获取日历活动列表');
      // 使用正确的API端点获取已加入的活动
      const response = await axios.get('/api/club-user/all-activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });
      
      console.log('获取到的日历活动数据:', response.data);
      
      // 直接检查response.data是不是数组，如果是则直接使用
      if (Array.isArray(response.data)) {
        console.log('直接使用数组数据');
        setActivities(response.data);
      } 
      // 如果是标准格式，按正常流程处理
      else if (response.data && response.data.code === 200) {
        console.log('标准格式数据处理');
        setActivities(response.data.data || []);
      } 
      // 如果包含data字段但没有code字段
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('包含data字段的数据处理');
        setActivities(response.data.data);
      }
      // 其他情况显示错误
      else {
        console.log('数据格式不匹配，显示错误消息');
        const message = response.data && response.data.message ? response.data.message : '获取活动列表失败';
        toast.error(message);
      }
    } catch (err) {
      console.error('获取活动列表失败:', err);
      toast.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 自定义日期修饰符 - 检查日期是否有活动或在活动时间范围内
  const modifiers = {
    hasActivity: (date: Date) => {
      return activities.some(activity => {
        const startDate = parseISO(activity.startTime);
        const endDate = parseISO(activity.endTime);
        
        // 检查日期是否在活动的开始和结束日期之间（包括开始和结束日期）
        return isWithinInterval(date, { start: startDate, end: endDate }) ||
               isSameDay(date, startDate) || 
               isSameDay(date, endDate);
      });
    }
  };

  // 自定义日期样式
  const modifiersStyles = {
    hasActivity: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      fontWeight: 'bold'
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // 查找所有在选定日期当天或跨越选定日期的活动
    const dayActivities = activities.filter(activity => {
      const startDate = parseISO(activity.startTime);
      const endDate = parseISO(activity.endTime);
      
      return isWithinInterval(date, { start: startDate, end: endDate }) ||
             isSameDay(date, startDate) || 
             isSameDay(date, endDate);
    });

    if (dayActivities.length > 0) {
      toast(
        <div className="space-y-2">
          <p className="font-semibold">当日活动：</p>
          {dayActivities.map(activity => (
            <div key={activity.activityId} className="text-sm">
              <p className="font-medium">{activity.title}</p>
              <p className="text-gray-500">
                {format(parseISO(activity.startTime), 'MM/dd')} - {format(parseISO(activity.endTime), 'MM/dd')}
              </p>
              <p className="text-gray-500">
                {format(parseISO(activity.startTime), 'HH:mm')} - {activity.location}
              </p>
            </div>
          ))}
        </div>,
        {
          duration: 5000,
          position: 'top-center',
        }
      );
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

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={zhCN}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {selectedDate ? (
                `${format(selectedDate, 'yyyy年MM月dd日')} 活动安排`
              ) : '今日活动'}
            </h3>
            <div className="space-y-2">
              {selectedDateActivities.map(activity => (
                <Card key={activity.activityId} className="p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-lg">{activity.title}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-600">{activity.type}</p>
                    <p className="text-sm text-gray-600">
                      活动时间：{format(parseISO(activity.startTime), 'yyyy/MM/dd')} - {format(parseISO(activity.endTime), 'yyyy/MM/dd')}
                    </p>
                    <p className="text-sm text-gray-600">
                      每日时间：{format(parseISO(activity.startTime), 'HH:mm')} - {format(parseISO(activity.endTime), 'HH:mm')}
                    </p>
                    <p className="text-sm text-gray-600">
                      地点：{activity.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      主办：{activity.clubName}
                    </p>
                    <p className="text-sm text-orange-600">
                      学分：{activity.creditPoints} 分
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getActivityStatusClass(activity)}`}>
                        {getActivityStatus(activity)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              {selectedDateActivities.length === 0 && (
                <p className="text-gray-500 text-center py-4">当日暂无活动安排</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCalendar; 