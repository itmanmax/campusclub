import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export interface UserProfile {
  id: number;
  username: string;
  role: string;
  avatar?: string;
  userId: number;
  realName: string;
  email: string;
  avatarUrl: string;
}

export interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 