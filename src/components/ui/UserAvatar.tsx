import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { useAuth } from '../../hooks/useAuth';

const UserAvatar: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <Link to="/profile" className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={userProfile?.avatarUrl || '/placeholder.svg'} 
          alt={userProfile?.realName || '用户头像'} 
        />
        <AvatarFallback>
          {userProfile?.realName?.slice(0, 2) || userProfile?.username?.slice(0, 2) || '用户'}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium hidden md:block">
        {userProfile?.realName || userProfile?.username}
      </span>
    </Link>
  );
};

export default UserAvatar; 