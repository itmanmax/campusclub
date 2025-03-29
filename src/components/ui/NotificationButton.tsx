import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from './button';

const NotificationButton: React.FC = () => {
  return (
    <Button variant="ghost" size="icon" className="rounded-full">
      <Bell className="h-5 w-5" />
      <span className="sr-only">通知</span>
    </Button>
  );
};

export default NotificationButton; 