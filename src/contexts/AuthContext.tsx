import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'credits'>) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  validateResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // Initialize default admin if not exists
    const initializeAdmin = () => {
      const storedUsers = localStorage.getItem('shuttleup_users');
      let users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const adminExists = users.find((user: User) => user.email === 'admin@shuttleup.com');
      
      if (!adminExists) {
        const defaultAdmin: User = {
          id: 'admin-001',
          email: 'admin@shuttleup.com',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          division: 1,
          memberStatus: 'approved',
          memberRole: 'admin',
          credits: 1000,
          createdAt: new Date()
        };
        
        users = [defaultAdmin, ...users];
        localStorage.setItem('shuttleup_users', JSON.stringify(users));
      }
    };

    initializeAdmin();

    // Check for stored user data
    const storedUser = localStorage.getItem('shuttleup_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('shuttleup_user');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }

    // Listen for user updates
    const handleUserUpdate = (event: CustomEvent) => {
      const updatedUser = event.detail;
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    };

    window.addEventListener('userUpdated', handleUserUpdate as EventListener);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const mockUsers = JSON.parse(localStorage.getItem('shuttleup_users') || '[]');
      
      // Simple password check for demo - in production, this would be properly hashed
      let user: User | undefined;
      
      // Check for admin login
      if (email === 'admin@shuttleup.com' && password === 'admin123') {
        user = mockUsers.find((u: User) => u.email === email);
      } else {
        // For regular users, just check if they exist and are approved
        user = mockUsers.find((u: User) => u.email === email && u.memberStatus === 'approved');
      }
      
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false
        });
        localStorage.setItem('shuttleup_user', JSON.stringify(user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'credits'>): Promise<boolean> => {
    try {
      const mockUsers = JSON.parse(localStorage.getItem('shuttleup_users') || '[]');
      
      // Check if username or email already exists
      const existingUser = mockUsers.find((u: User) => 
        u.username === userData.username || u.email === userData.email
      );
      
      if (existingUser) {
        return false;
      }

      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        credits: 0,
        createdAt: new Date()
      };

      const updatedUsers = [...mockUsers, newUser];
      localStorage.setItem('shuttleup_users', JSON.stringify(updatedUsers));
      
      // Dispatch custom event to notify DataContext
      window.dispatchEvent(new CustomEvent('usersUpdated'));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const mockUsers = JSON.parse(localStorage.getItem('shuttleup_users') || '[]');
      const user = mockUsers.find((u: User) => u.email === email);
      
      if (!user) {
        return false;
      }

      // In a real app, this would send an actual email
      // For demo purposes, we'll store the reset token in localStorage
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const resetData = {
        token: resetToken,
        email: email,
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour from now
        used: false
      };

      const existingResets = JSON.parse(localStorage.getItem('shuttleup_password_resets') || '[]');
      const updatedResets = [...existingResets, resetData];
      localStorage.setItem('shuttleup_password_resets', JSON.stringify(updatedResets));

      // In a real app, you would send an email here
      console.log(`Password reset email would be sent to ${email} with token: ${resetToken}`);
      console.log(`Reset link: ${window.location.origin}/reset-password?token=${resetToken}`);
      
      // For demo purposes, show an alert with the reset link
      alert(`Demo: Password reset link (in real app this would be emailed):\n${window.location.origin}/reset-password?token=${resetToken}`);
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const validateResetToken = async (token: string): Promise<boolean> => {
    try {
      const resetData = JSON.parse(localStorage.getItem('shuttleup_password_resets') || '[]');
      const reset = resetData.find((r: any) => r.token === token);
      
      if (!reset) return false;
      if (reset.used) return false;
      if (Date.now() > reset.expiresAt) return false;
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const resetData = JSON.parse(localStorage.getItem('shuttleup_password_resets') || '[]');
      const resetIndex = resetData.findIndex((r: any) => r.token === token);
      
      if (resetIndex === -1) return false;
      
      const reset = resetData[resetIndex];
      if (reset.used || Date.now() > reset.expiresAt) return false;
      
      // Mark token as used
      resetData[resetIndex].used = true;
      localStorage.setItem('shuttleup_password_resets', JSON.stringify(resetData));
      
      // Update user password (in real app, this would be hashed)
      const mockUsers = JSON.parse(localStorage.getItem('shuttleup_users') || '[]');
      const userIndex = mockUsers.findIndex((u: User) => u.email === reset.email);
      
      if (userIndex === -1) return false;
      
      // In a real app, you would hash the password here
      mockUsers[userIndex].password = newPassword; // This is just for demo
      localStorage.setItem('shuttleup_users', JSON.stringify(mockUsers));
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false
    });
    localStorage.removeItem('shuttleup_user');
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({ ...prev, user }));
    localStorage.setItem('shuttleup_user', JSON.stringify(user));
    
    // Also update the user in the users array
    try {
      const mockUsers = JSON.parse(localStorage.getItem('shuttleup_users') || '[]');
      const updatedUsers = mockUsers.map((u: User) => 
        u.id === user.id ? user : u
      );
      localStorage.setItem('shuttleup_users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating user in storage:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      sendPasswordReset,
      validateResetToken,
      resetPassword,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};