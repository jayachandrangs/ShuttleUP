import React from 'react';
import { Clock, MapPin, Users, Star, X, Repeat, Trophy } from 'lucide-react';
import { Session, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface SessionCardProps {
  session: Session;
  participants: User[];
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onCancelSession?: (sessionId: string) => void;
  showAdminActions?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  participants, 
  onBook, 
  onCancel, 
  onCancelSession,
  showAdminActions = false 
}) => {
  const { user } = useAuth();
  const { sessions } = useData();
  
  const isBooked = user && (session.participants || []).includes(user.id);
  const canBook = user && !isBooked && user.credits >= session.creditCost && participants.length < session.maxParticipants;
  
  // Check if user can cancel their booking (48 hours before session)
  const timeDiff = session.startTime.getTime() - new Date().getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  const cancellationDeadline = session.cancellationDeadlineHours || 24;
  const canCancel = isBooked && hoursDiff >= cancellationDeadline;
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookingClick = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const confirmMessage = `Are you sure you want to book this session?\n\n` +
      `Venue: ${session.venue}\n` +
      `Date: ${formatDate(session.startTime)}\n` +
      `Time: ${formatTime(session.startTime)} - ${formatTime(session.endTime)}\n` +
      `Cost: ${session.creditCost} credits\n\n` +
      `Your current balance: ${user?.credits} credits\n` +
      `Balance after booking: ${(user?.credits || 0) - session.creditCost} credits`;

    if (window.confirm(confirmMessage)) {
      onBook(sessionId);
    }
  };

  const handleCancellationClick = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const timeDiff = session.startTime.getTime() - new Date().getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    const cancellationDeadline = session.cancellationDeadlineHours || 24;
    if (hoursDiff < cancellationDeadline) {
      alert(`Cannot cancel booking within ${cancellationDeadline} hours of the session start time.`);
      return;
    }

    const confirmMessage = `Are you sure you want to cancel your booking?\n\n` +
      `Venue: ${session.venue}\n` +
      `Date: ${formatDate(session.startTime)}\n` +
      `Time: ${formatTime(session.startTime)} - ${formatTime(session.endTime)}\n` +
      `Refund: ${session.creditCost} credits\n\n` +
      `Your current balance: ${user?.credits} credits\n` +
      `Balance after refund: ${(user?.credits || 0) + session.creditCost} credits`;

    if (window.confirm(confirmMessage)) {
      onCancel(sessionId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.venue}</h3>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <div className="flex flex-wrap gap-1">
                {(session.divisions || []).map(division => (
                  <span key={division} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Div {division}
                  </span>
                ))}
              </div>
            </div>
            {session.isRecurring && (
              <div className="flex items-center space-x-1 mb-2">
                <Repeat className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-medium">Recurring Session</span>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-2">{formatDate(session.startTime)}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {session.venue}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-emerald-100 px-3 py-1 rounded-full">
              <div className="flex items-center text-emerald-700">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{session.creditCost} credits</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>{participants.length} / {session.maxParticipants} participants</span>
            </div>
            <div className="text-sm text-gray-500">
              {session.maxParticipants - participants.length} spots left
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(participants.length / session.maxParticipants) * 100}%` }}
            />
          </div>
        </div>

        {participants.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Participants</h4>
            <div className="flex flex-wrap gap-2">
              {(participants || []).map((participant) => (
                <div key={participant.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                  @{participant.username}
                  {participant.id === user?.id && ' (You)'}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {showAdminActions && onCancelSession && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to cancel this session? All ${participants.length} participants will be refunded ${session.creditCost} credits each.`)) {
                  onCancelSession(session.id);
                }
              }}
              className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <X className="h-4 w-4" />
              <span>Cancel Session</span>
            </button>
          )}
          
          {!isBooked && canBook && (
            <button
              onClick={() => handleBookingClick(session.id)}
              className={`${showAdminActions ? 'flex-1' : 'flex-1'} bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium`}
            >
              Book Session
            </button>
          )}
          
          {isBooked && (
            <div className="flex-1 flex space-x-2">
              <div className="flex-1 bg-emerald-50 text-emerald-700 py-2 px-4 rounded-lg text-center font-medium">
                Booked
              </div>
              {canCancel && (
                <button
                  onClick={() => handleCancellationClick(session.id)}
                  className="flex items-center justify-center bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                  title="Cancel booking"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          
          {!isBooked && !canBook && (
            <div className={`${showAdminActions ? 'flex-1' : 'flex-1'} bg-gray-100 text-gray-500 py-2 px-4 rounded-lg text-center font-medium`}>
              {user && user.credits < session.creditCost ? 'Insufficient credits' : 'Session full'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCard;