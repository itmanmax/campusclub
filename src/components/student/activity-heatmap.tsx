import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, subDays, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

interface Activity {
  activityId: number;
  title: string;
  startTime: string;
  endTime: string;
  clubName: string;
  type: string;
  location: string;
}

const ActivityHeatmap: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/club-user/joined-activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': '*/*'
        }
      });

      if (response.data.code === 200) {
        setActivities(response.data.data || []);
      } else {
        setError(response.data.message || '获取活动数据失败');
      }
    } catch (err) {
      console.error('获取活动数据失败:', err);
      setError('获取活动数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.endTime).toDateString();
      return activityDate === date.toDateString();
    });
  };

  const getDayHeight = (count: number): string => {
    if (count === 0) return '12px';
    const baseHeight = 24;
    const heightIncrement = 24;
    return `${baseHeight + (count * heightIncrement)}px`;
  };

  const getDayColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const handlePrevWeek = () => {
    setStartDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setStartDate(prev => addDays(prev, 7));
  };

  const formatTooltipContent = (date: Date) => {
    const dayActivities = getActivitiesForDate(date);
    if (dayActivities.length === 0) {
      return `${format(date, 'MM-dd')} 无活动`;
    }
    return (
      <div className="space-y-2">
        <div className="font-medium">{format(date, 'MM月dd日', { locale: zhCN })}</div>
        {dayActivities.map((activity, index) => (
          <div key={index} className="text-xs">
            <div className="font-medium text-green-600">{activity.clubName}</div>
            <div>{activity.title}</div>
            <div className="text-gray-500">
              {format(new Date(activity.startTime), 'HH:mm')} - 
              {format(new Date(activity.endTime), 'HH:mm')}
            </div>
            <div className="text-gray-500">{activity.location}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  const days = getLast7Days();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full ml-2"
        >
          <CalendarDays className="h-5 w-5" />
          {activities.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] font-medium text-white flex items-center justify-center">
              {activities.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[800px] p-8" align="start">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevWeek}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base font-medium">
              {format(days[0], 'MM月dd日')} - {format(days[6], 'MM月dd日')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextWeek}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-end gap-8 h-48 px-4">
            {days.map((date, index) => {
              const dayActivities = getActivitiesForDate(date);
              return (
                <Tooltip key={index} content={formatTooltipContent(date)}>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`w-20 rounded-t transition-all duration-200 ${getDayColor(dayActivities.length)}`}
                      style={{ height: getDayHeight(dayActivities.length) }}
                    />
                    <span className="text-sm text-gray-500">
                      {format(date, 'EE', { locale: zhCN })}
                    </span>
                  </div>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-8 text-base text-gray-500 border-t pt-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-100 rounded"></div>
              <span>无活动</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-300 rounded"></div>
              <span>2个活动</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded"></div>
              <span>4个+</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ActivityHeatmap; 