import React, { useState } from 'react';
import { Star, Calendar, Trophy, Clock, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SessionList from '../sessions/SessionList';
import CreditHistory from '../player/CreditHistory';
import MyBookings from '../player/MyBookings';

const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { sessions, bookings } = useData();
  const [activeTab, setActiveTab] = useState<'sessions' | 'history' | 'bookings'>('sessions');

  const userBookings = bookings.filter(booking => booking.userId === user?.id && booking.status === 'active');
  const upcomingSessions = sessions.filter(session => {
    const isFuture = new Date(session.startTime) > new Date();
    const isParticipant = (session.participants || []).includes(user?.id || '');
    const isUserDivision = (session.divisions || []).includes(user?.division || 0);
    
    return isFuture && isParticipant && isUserDivision;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Credits</p>
              <p className="text-2xl font-bold text-gray-900">{user?.credits || 0}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('bookings')}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2 font-medium">Click to view details</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Division</p>
              <p className="text-2xl font-bold text-gray-900">{user?.division}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('bookings')}
        >
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{userBookings.length}</p>
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2 font-medium">Click to view details</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="text-gray-600">
              Ready to play some badminton? Check out the upcoming sessions below and book your spot.
            </p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Sessions</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Credit History</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'sessions' ? (
        <SessionList showAdminActions={false} />
      ) : activeTab === 'bookings' ? (
        <MyBookings />
      ) : (
        <CreditHistory />
      )}
    </div>
  );
};

export default PlayerDashboard;