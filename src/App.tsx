import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/common/Header';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import PasswordResetSuccess from './components/auth/PasswordResetSuccess';
import PlayerDashboard from './components/dashboard/PlayerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'reset-success';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [resetToken, setResetToken] = useState<string>('');

  // Handle URL hash changes for password reset
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'forgot-password') {
        setAuthView('forgot-password');
      } else if (hash.startsWith('reset-password')) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
          setResetToken(token);
          setAuthView('reset-password');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    switch (authView) {
      case 'register':
        return <RegisterForm onSwitchToLogin={() => {
          setAuthView('login');
          window.location.hash = '';
        }} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBackToLogin={() => {
          setAuthView('login');
          window.location.hash = '';
        }} />;
      case 'reset-password':
        return <ResetPasswordForm 
          token={resetToken}
          onSuccess={() => setAuthView('reset-success')}
          onBackToLogin={() => {
            setAuthView('login');
            window.location.hash = '';
          }}
        />;
      case 'reset-success':
        return <PasswordResetSuccess onBackToLogin={() => {
          setAuthView('login');
          window.location.hash = '';
        }} />;
      default:
        return <LoginForm onSwitchToRegister={() => setAuthView('register')} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.memberRole === 'admin' ? (
          <AdminDashboard />
        ) : (
          <PlayerDashboard />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;