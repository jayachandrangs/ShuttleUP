import React from 'react';
import { Calendar, Clock, MapPin, Users, Star, X, Trophy, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const { sessions, bookings, cancelBooking, getSessionParticipants } = useData();

  // Get user's active bookings
  const userBookings = bookings.filter(
    booking => booking.userId === user?.id && booking.status === 'active'
  );

  // Get sessions for user's bookings
  const bookedSessions = sessions
    .filter(session => {
      const isFuture = new Date(session.startTime) > new Date();
      const isBooked = userBookings.some(booking => booking.sessionId === session.id);
      return isFuture && isBooked;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleCancelBooking = (sessionId: string) => {
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
      `Balance after refund: ${(user?.credits || 0) + session.creditCost} credits\n\n` +
      `Note: This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      const success = cancelBooking(sessionId, user?.id || '');
      if (success) {
        // Success feedback could be added here
      }
    }
  };

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

  const canCancelBooking = (sessionStartTime: Date) => {
    const timeDiff = sessionStartTime.getTime() - new Date().getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff >= 24; // This will be updated per session below
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
      </div>

      {bookedSessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
            <p className="text-gray-600">
              You don't have any upcoming session bookings. Browse available sessions to book your next game!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookedSessions.map((session) => {
            const participants = getSessionParticipants(session.id);
            const timeDiff = session.startTime.getTime() - new Date().getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            const cancellationDeadline = session.cancellationDeadlineHours || 24;
            const canCancel = hoursDiff >= cancellationDeadline;
            const booking = userBookings.find(b => b.sessionId === session.id);

            return (
              <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.venue}</h3>
                      
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Trophy className="h-4 w-4 text-blue-600" />
                        <div className="flex flex-wrap gap-1">
                          {(session.divisions || []).map(division => (
                            <span key={division} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              Div {division}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-lg font-medium text-gray-900 mb-2">{formatDate(session.startTime)}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {session.venue}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {participants.length}/{session.maxParticipants} players
                        </div>
                      </div>

                      {booking && (
                        <div className="text-xs text-gray-500 mb-3">
                          Booked on: {new Date(booking.bookedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="bg-emerald-100 px-3 py-1 rounded-full mb-3">
                        <div className="flex items-center text-emerald-700">
                          <Star className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">{session.creditCost} credits</span>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Booked
                      </div>
                    </div>
                  </div>

                  {/* Participants List */}
                  {participants.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Other Participants ({participants.length - 1} others)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {participants
                          .filter(p => p.id !== user?.id)
                          .map((participant) => (
                            <div key={participant.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                              @{participant.username}
                            </div>
                          ))}
                        {participants.length === 1 && (
                          <div className="text-sm text-gray-500 italic">
                            You're the only participant so far
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cancellation Section */}
                  <div className="border-t border-gray-200 pt-4">
                    {canCancel ? (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          You can cancel this booking and get a full refund
                        </div>
                        <button
                          onClick={() => handleCancelBooking(session.id)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel Booking</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Cannot cancel - less than {cancellationDeadline} hours until session starts. 
                          Cancellations must be made at least {cancellationDeadline} hours in advance.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {bookedSessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{bookedSessions.length}</div>
              <div className="text-sm text-gray-600">Upcoming Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookedSessions.reduce((total, session) => total + session.creditCost, 0)}
              </div>
              <div className="text-sm text-gray-600">Credits Invested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {bookedSessions.filter(session => {
                  const timeDiff = session.startTime.getTime() - new Date().getTime();
                  const hoursDiff = timeDiff / (1000 * 60 * 60);
                  const cancellationDeadline = session.cancellationDeadlineHours || 24;
                  return hoursDiff >= cancellationDeadline;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Cancellable Bookings</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;