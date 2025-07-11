import React, { useState } from 'react';
import { Users, Calendar, Plus, Settings, Star, Shield } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import SessionList from '../sessions/SessionList';
import CreateSession from '../sessions/CreateSession';
import UserManagement from '../admin/UserManagement';

type AdminView = 'sessions' | 'users' | 'overview';

const AdminDashboard: React.FC = () => {
  const { users, sessions, bookings } = useData();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [showCreateSession, setShowCreateSession] = useState(false);

  const approvedUsers = users.filter(user => user.memberStatus === 'approved');
  const pendingUsers = users.filter(user => user.memberStatus === 'applied');
  const upcomingSessions = sessions.filter(session => new Date(session.startTime) > new Date());
  const activeBookings = bookings.filter(booking => booking.status === 'active');

  const renderContent = () => {
    switch (activeView) {
      case 'sessions':
        return (
          <SessionList 
            onCreateSession={() => setShowCreateSession(true)}
            showCreateButton={true}
            showAdminActions={true}
          />
        );
      case 'users':
        return <UserManagement />;
      default:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedUsers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{activeBookings.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Session</span>
                </button>
                <button
                  onClick={() => setActiveView('users')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>Manage Users</span>
                </button>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {session.venue} - Divisions {(session.divisions || []).join(', ')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {session.participants.length}/{session.maxParticipants} players
                      </p>
                      <p className="text-xs text-gray-500">{session.creditCost} credits</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'overview'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('sessions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'sessions'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setActiveView('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'users'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Create Session Modal */}
      {showCreateSession && (
        <CreateSession onClose={() => setShowCreateSession(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;