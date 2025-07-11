import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Session } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SessionCard from './SessionCard';

interface SessionListProps {
  onCreateSession?: () => void;
  showCreateButton?: boolean;
  showAdminActions?: boolean;
}

const SessionList: React.FC<SessionListProps> = ({ 
  onCreateSession, 
  showCreateButton = false,
  showAdminActions = false 
}) => {
  const { user } = useAuth();
  const { sessions, bookSession, cancelBooking, getSessionParticipants, cancelSession } = useData();
  
  // Filter sessions based on user role and division
  const upcomingSessions = sessions
    .filter(session => {
      const isFuture = new Date(session.startTime) > new Date();
      
      // Admins can see all sessions
      if (user?.memberRole === 'admin') {
        return isFuture;
      }
      
      // Players can only see sessions that include their division
      return isFuture && (session.divisions || []).includes(user?.division || 0);
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleBookSession = (sessionId: string) => {
    const success = bookSession(sessionId, user?.id || '');
    if (success) {
      // Show success message
    }
  };

  const handleCancelBooking = (sessionId: string) => {
    const success = cancelBooking(sessionId, user?.id || '');
    if (success) {
      // Show success message
    }
  };

  const handleCancelSession = (sessionId: string) => {
    const success = cancelSession(sessionId);
    if (success) {
      // Show success message - in a real app, you might use a toast notification
      alert('Session cancelled successfully. All participants have been refunded.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
        </div>
        {showCreateButton && (
          <button
            onClick={onCreateSession}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Session</span>
          </button>
        )}
      </div>

      {upcomingSessions.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
          <p className="text-gray-600">
            {showCreateButton 
              ? 'Create the first session to get started!' 
              : user?.memberRole === 'admin' 
                ? 'Check back later for new sessions.'
                : `No upcoming sessions available for Division ${user?.division}. Check back later for new sessions.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              participants={getSessionParticipants(session.id)}
              onBook={handleBookSession}
              onCancel={handleCancelBooking}
              onCancelSession={showAdminActions ? handleCancelSession : undefined}
              showAdminActions={showAdminActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionList;