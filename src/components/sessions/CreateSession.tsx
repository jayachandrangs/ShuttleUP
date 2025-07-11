import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Star, Repeat } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface CreateSessionProps {
  onClose: () => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onClose }) => {
  const { addSession, addRecurringSessions } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    venue: '',
    divisions: [1] as number[],
    date: '',
    startTime: '',
    endTime: '',
    creditCost: 1,
    maxParticipants: 8,
    isRecurring: false,
    recurringDays: [] as number[],
    recurringEndDate: '',
    cancellationDeadlineHours: 24
  });
  const [loading, setLoading] = useState(false);

  const handleDivisionToggle = (division: number) => {
    setFormData(prev => ({
      ...prev,
      divisions: prev.divisions.includes(division)
        ? prev.divisions.filter(d => d !== division)
        : [...prev.divisions, division].sort((a, b) => a - b)
    }));
  };

  const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const handleRecurringDayToggle = (dayValue: number) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(dayValue)
        ? prev.recurringDays.filter(d => d !== dayValue)
        : [...prev.recurringDays, dayValue]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        alert('End time must be after start time');
        setLoading(false);
        return;
      }

      if (formData.isRecurring) {
        if (formData.recurringDays.length === 0) {
          alert('Please select at least one day for recurring sessions');
          setLoading(false);
          return;
        }
        
        if (formData.divisions.length === 0) {
          alert('Please select at least one division for recurring sessions');
          setLoading(false);
          return;
        }

        if (!formData.recurringEndDate) {
          alert('Please select an end date for recurring sessions');
          setLoading(false);
          return;
        }

        const recurringEndDate = new Date(formData.recurringEndDate);
        if (recurringEndDate <= startDateTime) {
          alert('Recurring end date must be after the session start date');
          setLoading(false);
          return;
        }

        addRecurringSessions({
          venue: formData.venue,
          divisions: formData.divisions,
          startTime: startDateTime,
          endTime: endDateTime,
          creditCost: formData.creditCost,
          maxParticipants: formData.maxParticipants,
          participants: [],
          createdBy: user?.id || '',
          isRecurring: true,
          recurringDays: formData.recurringDays,
          recurringEndDate: recurringEndDate,
          cancellationDeadlineHours: formData.cancellationDeadlineHours
        });
      } else {
        if (formData.divisions.length === 0) {
          alert('Please select at least one division');
          setLoading(false);
          return;
        }
        
        addSession({
          venue: formData.venue,
          divisions: formData.divisions,
          startTime: startDateTime,
          endTime: endDateTime,
          creditCost: formData.creditCost,
          maxParticipants: formData.maxParticipants,
          participants: [],
          createdBy: user?.id || '',
          cancellationDeadlineHours: formData.cancellationDeadlineHours
        });
      }

      onClose();
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
              Venue
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="venue"
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Court A, Sports Center"
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="startTime"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="endTime"
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Divisions (Select one or more - 1 = Expert, 13 = Beginner)
            </label>
            <div className="grid grid-cols-3 gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
              {Array.from({ length: 13 }, (_, i) => i + 1).map(division => (
                <label key={division} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.divisions.includes(division)}
                    onChange={() => handleDivisionToggle(division)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Div {division}
                    {division === 1 && ' (Expert)'}
                    {division === 13 && ' (Beginner)'}
                  </span>
                </label>
              ))}
            </div>
            {formData.divisions.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Please select at least one division</p>
            )}
            {formData.divisions.length > 0 && (
              <p className="text-sm text-emerald-600 mt-1">
                Selected: {formData.divisions.map(d => `Division ${d}`).join(', ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="creditCost" className="block text-sm font-medium text-gray-700 mb-2">
                Credit Cost
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="creditCost"
                  type="number"
                  min="1"
                  required
                  value={formData.creditCost}
                  onChange={(e) => setFormData({ ...formData, creditCost: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="70"
                  required
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="cancellationDeadlineHours" className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Deadline (hours before session)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="cancellationDeadlineHours"
                type="number"
                min="1"
                max="168"
                required
                value={formData.cancellationDeadlineHours}
                onChange={(e) => setFormData({ ...formData, cancellationDeadlineHours: parseInt(e.target.value) })}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Players must cancel at least {formData.cancellationDeadlineHours} hours before the session starts to get a refund
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-4">
              <input
                id="isRecurring"
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecurring" className="flex items-center text-sm font-medium text-gray-700">
                <Repeat className="h-4 w-4 mr-1" />
                Make this a recurring session
              </label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat on these days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {weekdays.map((day) => (
                      <label key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.recurringDays.includes(day.value)}
                          onChange={() => handleRecurringDayToggle(day.value)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Stop recurring on
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="recurringEndDate"
                      type="date"
                      required={formData.isRecurring}
                      value={formData.recurringEndDate}
                      onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will create individual sessions for each selected day between now and the end date. Each session can be booked separately.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              disabled={loading || formData.divisions.length === 0}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : formData.isRecurring ? 'Create Recurring Sessions' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSession;