import { useAuth } from '../context/AuthContext';

export const useUser = () => {
  const { user, token, updateUser, signOut } = useAuth();
  
  return {
    user,
    userId: user?.id,
    userEmail: user?.email,
    
    token,
    isAuthenticated: !!user && !!token,
    
    updateUser,
    signOut,
    
    displayName: user?.email?.split('@')[0] || 'User',
    initials: user?.email?.substring(0, 2).toUpperCase() || 'US',
    
    isCurrentUser: (userId: number) => user?.id === userId,
  };
};