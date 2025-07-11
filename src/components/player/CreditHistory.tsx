import React from 'react';
import { Clock, Plus, Minus, RotateCcw, Star, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { CreditTransaction } from '../../types';

const CreditHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserCreditHistory, sessions } = useData();

  const creditHistory = getUserCreditHistory(user?.id || '');

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'earned':
        return <Plus className="h-5 w-5 text-emerald-600" />;
      case 'spent':
        return <Minus className="h-5 w-5 text-red-600" />;
      case 'refund':
        return <RotateCcw className="h-5 w-5 text-blue-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'earned':
        return 'text-emerald-600';
      case 'spent':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSessionDetails = (sessionId?: string) => {
    if (!sessionId) return null;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;
    
    return {
      venue: session.venue,
      date: new Date(session.startTime).toLocaleDateString(),
      time: new Date(session.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const formatAmount = (amount: number) => {
    const sign = amount > 0 ? '+' : '';
    return `${sign}${amount}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Star className="h-6 w-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-900">Credit History</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Balance</h3>
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">{user?.credits || 0}</span>
            <span className="text-gray-600">credits</span>
          </div>
        </div>

        {creditHistory.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credit history yet</h3>
            <p className="text-gray-600">
              Your credit transactions will appear here once you start earning or spending credits.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {creditHistory.map((transaction) => {
              const sessionDetails = getSessionDetails(transaction.sessionId);
              
              return (
                <div key={transaction.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </h4>
                        
                        {sessionDetails && transaction.type !== 'refund' && (
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{sessionDetails.date} at {sessionDetails.time}</span>
                            </div>
                          </div>
                        )}
                        
                        {transaction.type === 'refund' && transaction.description.includes('cancelled') && (
                          <div className="mt-1 text-xs bg-red-50 px-2 py-1 rounded">
                            {transaction.description.includes('Session cancelled:') ? (
                              <span className="text-red-600">Session was cancelled by admin</span>
                            ) : (
                              <span className="text-orange-600">You cancelled this booking</span>
                            )}
                          </div>
                        )}
                        
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                          {formatAmount(transaction.amount)} credits
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Balance: {transaction.balanceAfter}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Plus className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-lg font-bold text-emerald-600">
                {creditHistory
                  .filter(t => t.type === 'earned')
                  .reduce((sum, t) => sum + t.amount, 0)} credits
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Minus className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-lg font-bold text-red-600">
                {Math.abs(creditHistory
                  .filter(t => t.type === 'spent')
                  .reduce((sum, t) => sum + t.amount, 0))} credits
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-lg font-bold text-blue-600">
                {creditHistory
                  .filter(t => t.type === 'refund')
                  .reduce((sum, t) => sum + t.amount, 0)} credits
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditHistory;