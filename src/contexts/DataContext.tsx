import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, Booking, CreditTransaction } from '../types';

interface DataContextType {
  users: User[];
  sessions: Session[];
  bookings: Booking[];
  creditTransactions: CreditTransaction[];
  updateUser: (user: User) => void;
  addSession: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  addRecurringSessions: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  bookSession: (sessionId: string, userId: string) => boolean;
  cancelBooking: (sessionId: string, userId: string) => boolean;
  addCredits: (userId: string, amount: number) => void;
  addCredits: (userId: string, amount: number, comment?: string) => void;
  getSessionParticipants: (sessionId: string) => User[];
  canCancelBooking: (sessionId: string) => boolean;
  cancelSession: (sessionId: string) => boolean;
  refreshUsers: () => void;
  getUserCreditHistory: (userId: string) => CreditTransaction[];
  deleteUsers: (userIds: string[]) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);

  // Function to refresh users from localStorage
  const refreshUsers = () => {
    const storedUsers = localStorage.getItem('shuttleup_users');
    if (storedUsers) {
      const usersList = JSON.parse(storedUsers);
      setUsers(usersList);
    }
  };

  useEffect(() => {
    // Initialize data
    const initializeData = () => {
      // Initialize users
      const storedUsers = localStorage.getItem('shuttleup_users');
      let usersList = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Ensure admin exists
      const adminExists = usersList.find((user: User) => user.email === 'admin@shuttleup.com');
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
        usersList = [defaultAdmin, ...usersList];
        localStorage.setItem('shuttleup_users', JSON.stringify(usersList));
      }

      // Add sample users if none exist (except admin)
      const regularUsers = usersList.filter((u: User) => u.memberRole !== 'admin');
      if (regularUsers.length === 0) {
        const sampleUsers: User[] = [
          {
            id: 'user-001',
            email: 'john.doe@gmail.com',
            username: 'johndoe',
            firstName: 'John',
            lastName: 'Doe',
            division: 5,
            memberStatus: 'applied',
            memberRole: 'player',
            credits: 0,
            createdAt: new Date()
          },
          {
            id: 'user-002',
            email: 'jane.smith@gmail.com',
            username: 'janesmith',
            firstName: 'Jane',
            lastName: 'Smith',
            division: 3,
            memberStatus: 'approved',
            memberRole: 'player',
            credits: 5,
            createdAt: new Date()
          }
        ];
        usersList = [...usersList, ...sampleUsers];
        localStorage.setItem('shuttleup_users', JSON.stringify(usersList));
      }

      setUsers(usersList);

      // Initialize sessions
      const storedSessions = localStorage.getItem('shuttleup_sessions');
      let sessionsList = storedSessions ? JSON.parse(storedSessions) : [];
      
      // Convert date strings back to Date objects
      sessionsList = sessionsList.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        createdAt: new Date(session.createdAt)
      }));

      // Add sample sessions if none exist
      if (sessionsList.length === 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(18, 0, 0, 0);

        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        dayAfterTomorrow.setHours(19, 0, 0, 0);

        const sampleSessions: Session[] = [
          {
            id: 'session-001',
            venue: 'Court A - Main Hall',
            divisions: [3, 4, 5],
            startTime: tomorrow,
            endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
            creditCost: 2,
            maxParticipants: 8,
            participants: [],
            createdBy: 'admin-001',
            createdAt: new Date()
          },
          {
            id: 'session-002',
            venue: 'Court B - Sports Center',
            divisions: [5, 6],
            startTime: dayAfterTomorrow,
            endTime: new Date(dayAfterTomorrow.getTime() + 90 * 60 * 1000), // 1.5 hours later
            creditCost: 1,
            maxParticipants: 6,
            participants: [],
            createdBy: 'admin-001',
            createdAt: new Date()
          }
        ];
        sessionsList = sampleSessions;
        localStorage.setItem('shuttleup_sessions', JSON.stringify(sessionsList));
      }

      setSessions(sessionsList);

      // Initialize bookings
      const storedBookings = localStorage.getItem('shuttleup_bookings');
      let bookingsList = storedBookings ? JSON.parse(storedBookings) : [];
      
      // Convert date strings back to Date objects
      bookingsList = bookingsList.map((booking: any) => ({
        ...booking,
        bookedAt: new Date(booking.bookedAt)
      }));

      setBookings(bookingsList);

      // Initialize credit transactions
      const storedTransactions = localStorage.getItem('shuttleup_credit_transactions');
      let transactionsList = storedTransactions ? JSON.parse(storedTransactions) : [];
      
      // Convert date strings back to Date objects
      transactionsList = transactionsList.map((transaction: any) => ({
        ...transaction,
        timestamp: new Date(transaction.timestamp)
      }));

      setCreditTransactions(transactionsList);
    };

    initializeData();
  }, []);

  // Listen for storage changes to sync across tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shuttleup_users') {
        refreshUsers();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleCustomUserUpdate = () => {
      refreshUsers();
    };
    
    window.addEventListener('usersUpdated', handleCustomUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usersUpdated', handleCustomUserUpdate);
    };
  }, []);

  const addCreditTransaction = (
    userId: string,
    type: CreditTransaction['type'],
    amount: number,
    description: string,
    sessionId?: string
  ) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newTransaction: CreditTransaction = {
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      amount,
      description,
      timestamp: new Date(),
      balanceAfter: user.credits,
      sessionId
    };

    const updatedTransactions = [...creditTransactions, newTransaction];
    setCreditTransactions(updatedTransactions);
    localStorage.setItem('shuttleup_credit_transactions', JSON.stringify(updatedTransactions));
  };

  const getUserCreditHistory = (userId: string): CreditTransaction[] => {
    return creditTransactions
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('shuttleup_users', JSON.stringify(updatedUsers));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('usersUpdated'));
  };

  const addSession = (sessionData: Omit<Session, 'id' | 'createdAt'>) => {
    const newSession: Session = {
      ...sessionData,
      id: `session-${Date.now()}`,
      createdAt: new Date()
    };
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('shuttleup_sessions', JSON.stringify(updatedSessions));
  };

  const addRecurringSessions = (sessionData: Omit<Session, 'id' | 'createdAt'>) => {
    if (!sessionData.isRecurring || !sessionData.recurringDays || !sessionData.recurringEndDate) {
      return;
    }

    const newSessions: Session[] = [];
    const parentId = `recurring-${Date.now()}`;
    const startDate = new Date(sessionData.startTime);
    const endDate = new Date(sessionData.recurringEndDate);
    
    // Calculate session duration
    const sessionDuration = sessionData.endTime.getTime() - sessionData.startTime.getTime();

    // Generate sessions for each occurrence
    let currentDate = new Date(startDate);
    let sessionCounter = 0;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (sessionData.recurringDays.includes(dayOfWeek)) {
        // Create session for this day
        const sessionStart = new Date(currentDate);
        sessionStart.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
        
        const sessionEnd = new Date(sessionStart.getTime() + sessionDuration);
        
        // Only create sessions that are in the future
        if (sessionStart > new Date()) {
          const newSession: Session = {
            ...sessionData,
            id: `${parentId}-${sessionCounter}`,
            startTime: sessionStart,
            endTime: sessionEnd,
            createdAt: new Date(),
            parentSessionId: parentId,
            participants: []
          };
          
          newSessions.push(newSession);
          sessionCounter++;
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (newSessions.length > 0) {
      const updatedSessions = [...sessions, ...newSessions];
      setSessions(updatedSessions);
      localStorage.setItem('shuttleup_sessions', JSON.stringify(updatedSessions));
      
      // Show confirmation
      alert(`Created ${newSessions.length} recurring sessions successfully!`);
    } else {
      alert('No future sessions were created. Please check your dates and selected days.');
    }
  };

  const bookSession = (sessionId: string, userId: string): boolean => {
    const session = sessions.find(s => s.id === sessionId);
    const user = users.find(u => u.id === userId);
    
    if (!session || !user) return false;
    if (session.participants.includes(userId)) return false;
    if (user.credits < session.creditCost) return false;
    if (session.participants.length >= session.maxParticipants) return false;

    // Update session participants
    const updatedSession = {
      ...session,
      participants: [...session.participants, userId]
    };
    
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? updatedSession : s
    );
    setSessions(updatedSessions);
    localStorage.setItem('shuttleup_sessions', JSON.stringify(updatedSessions));

    // Deduct credits from user and update users array
    const updatedUser = {
      ...user,
      credits: user.credits - session.creditCost
    };
    
    const updatedUsers = users.map(u => 
      u.id === userId ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('shuttleup_users', JSON.stringify(updatedUsers));
    
    // Also update in auth context if this is the current user
    const currentUser = JSON.parse(localStorage.getItem('shuttleup_user') || 'null');
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('shuttleup_user', JSON.stringify(updatedUser));
      // Dispatch custom event to notify auth context
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
    }

    // Create credit transaction with updated balance
    const newTransaction: CreditTransaction = {
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'spent',
      amount: -session.creditCost,
      description: `Booked session at ${session.venue}`,
      timestamp: new Date(),
      balanceAfter: updatedUser.credits,
      sessionId
    };

    const updatedTransactions = [...creditTransactions, newTransaction];
    setCreditTransactions(updatedTransactions);
    localStorage.setItem('shuttleup_credit_transactions', JSON.stringify(updatedTransactions));

    // Add booking record
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId,
      sessionId,
      bookedAt: new Date(),
      status: 'active'
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('shuttleup_bookings', JSON.stringify(updatedBookings));

    // Force refresh of users data to ensure UI updates
    window.dispatchEvent(new CustomEvent('usersUpdated'));
    return true;
  };

  const cancelBooking = (sessionId: string, userId: string): boolean => {
    const session = sessions.find(s => s.id === sessionId);
    const user = users.find(u => u.id === userId);
    
    if (!session || !user) return false;
    if (!canCancelBooking(sessionId)) return false;

    // Remove user from session participants
    const updatedSession = {
      ...session,
      participants: session.participants.filter(id => id !== userId)
    };
    
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? updatedSession : s
    );
    setSessions(updatedSessions);
    localStorage.setItem('shuttleup_sessions', JSON.stringify(updatedSessions));

    // Refund credits to user
    const updatedUser = {
      ...user,
      credits: user.credits + session.creditCost
    };
    
    // Update user in the users array first
    const updatedUsers = users.map(u => 
      u.id === userId ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('shuttleup_users', JSON.stringify(updatedUsers));
    
    // Also update in auth context if this is the current user
    const currentUser = JSON.parse(localStorage.getItem('shuttleup_user') || 'null');
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('shuttleup_user', JSON.stringify(updatedUser));
      // Trigger a page refresh to update the auth context
      window.location.reload();
    }

    // Add credit transaction for refund with session details
    const sessionDate = session.startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const sessionTime = session.startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create transaction with updated balance
    const newTransaction: CreditTransaction = {
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'refund',
      amount: session.creditCost,
      description: `Cancelled booking: ${session.venue} on ${sessionDate} at ${sessionTime}`,
      timestamp: new Date(),
      balanceAfter: updatedUser.credits,
      sessionId
    };

    const updatedTransactions = [...creditTransactions, newTransaction];
    setCreditTransactions(updatedTransactions);
    localStorage.setItem('shuttleup_credit_transactions', JSON.stringify(updatedTransactions));

    // Update booking status
    const updatedBookings = bookings.map(booking =>
      booking.sessionId === sessionId && booking.userId === userId
        ? { ...booking, status: 'cancelled' as const }
        : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('shuttleup_bookings', JSON.stringify(updatedBookings));

    return true;
  };

  const addCredits = (userId: string, amount: number, comment?: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newBalance = user.credits + amount;
      const updatedUser = {
        ...user,
        credits: Math.max(0, newBalance) // Prevent negative credits
      };
      
      // Update user in the users array
      const updatedUsers = users.map(u => 
        u.id === userId ? updatedUser : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('shuttleup_users', JSON.stringify(updatedUsers));
      
      // Also update in auth context if this is the current user
      const currentUser = JSON.parse(localStorage.getItem('shuttleup_user') || 'null');
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem('shuttleup_user', JSON.stringify(updatedUser));
        // Dispatch custom event to notify auth context
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
      }

      // Create transaction with updated balance
      const actualAmount = updatedUser.credits - user.credits; // Actual amount added/deducted
      const description = comment || (amount > 0 ? 'Credits added by admin' : 'Credits deducted by admin');
      
      const newTransaction: CreditTransaction = {
        id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: amount > 0 ? 'earned' : 'spent',
        amount: actualAmount,
        description,
        timestamp: new Date(),
        balanceAfter: updatedUser.credits
      };

      const updatedTransactions = [...creditTransactions, newTransaction];
      setCreditTransactions(updatedTransactions);
      localStorage.setItem('shuttleup_credit_transactions', JSON.stringify(updatedTransactions));
    }
  };

  const getSessionParticipants = (sessionId: string): User[] => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return [];
    
    return users.filter(user => session.participants.includes(user.id));
  };

  const canCancelBooking = (sessionId: string): boolean => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return false;
    
    const timeDiff = session.startTime.getTime() - new Date().getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const cancellationDeadline = session.cancellationDeadlineHours || 24;
    
    return hoursDiff >= cancellationDeadline;
  };

  const cancelSession = (sessionId: string): boolean => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return false;

    // Get all participants who need refunds
    const participantIds = session.participants || [];
    
    // Refund credits to all participants
    const updatedUsers = users.map(user => {
      if (participantIds.includes(user.id)) {
        const refundedUser = {
          ...user,
          credits: user.credits + session.creditCost
        };
        
        // Update auth context if this is the current user
        const currentUser = JSON.parse(localStorage.getItem('shuttleup_user') || 'null');
        if (currentUser && currentUser.id === user.id) {
          localStorage.setItem('shuttleup_user', JSON.stringify(refundedUser));
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: refundedUser }));
        }
        
        return refundedUser;
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('shuttleup_users', JSON.stringify(updatedUsers));

    // Create all credit transactions first
    const newTransactions: CreditTransaction[] = [];
    participantIds.forEach(userId => {
      const refundedUser = updatedUsers.find(u => u.id === userId);
      if (!refundedUser) return;
      
      const sessionDate = session.startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const sessionTime = session.startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const newTransaction: CreditTransaction = {
        id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'refund',
        amount: session.creditCost,
        description: `Session cancelled: ${session.venue} on ${sessionDate} at ${sessionTime}`,
        timestamp: new Date(),
        balanceAfter: refundedUser.credits,
        sessionId
      };

      newTransactions.push(newTransaction);
    });

    // Update all transactions at once
    const updatedTransactions = [...creditTransactions, ...newTransactions];
    setCreditTransactions(updatedTransactions);
    localStorage.setItem('shuttleup_credit_transactions', JSON.stringify(updatedTransactions));

    // Cancel all bookings for this session
    const updatedBookings = bookings.map(booking =>
      booking.sessionId === sessionId && booking.status === 'active'
        ? { ...booking, status: 'cancelled' as const }
        : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('shuttleup_bookings', JSON.stringify(updatedBookings));

    // Remove the session
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('shuttleup_sessions', JSON.stringify(updatedSessions));

    // Force refresh of users data to ensure UI updates
    window.dispatchEvent(new CustomEvent('usersUpdated'));
    return true;
  };

  const deleteUsers = (userIds: string[]): boolean => {
    try {
      // Prevent deletion of admin users
      const usersToDelete = users.filter(user => 
        userIds.includes(user.id) && user.memberRole !== 'admin'
      );
      
      if (usersToDelete.length === 0) {
        return false;
      }

      // Get all sessions where these users are participants
      const affectedSessions = sessions.filter(session => 
        session.participants.some(participantId => userIds.includes(participantId))
      );

      // Remove users from all sessions and refund credits
      const updatedSessions = sessions.map(session => {
        const originalParticipants = session.participants;
        const newParticipants = session.participants.filter(participantId => 
          !userIds.includes(participantId)
        );
        
        // If participants were removed, we need to handle refunds
        if (originalParticipants.length !== newParticipants.length) {
          const removedParticipants = originalParticipants.filter(participantId => 
            userIds.includes(participantId)
          );
          
          // Create refund transactions for removed participants
          removedParticipants.forEach(userId => {
            const user = users.find(u => u.id === userId);
            if (user) {
              const sessionDate = session.startTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              const sessionTime = session.startTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
              
              const newTransaction: CreditTransaction = {
                id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId,
                type: 'refund',
                amount: session.creditCost,
                description: `Account deletion refund: ${session.venue} on ${sessionDate} at ${sessionTime}`,
                timestamp: new Date(),
                balanceAfter: user.credits + session.creditCost,
                sessionId: session.id
              };

              const updatedTransactions = [...creditTransactions, newTransaction];
              setCreditTransactions(updatedTransactions);
              localStorage.setItem('shuttleup_credit_transactions', JSON.stringify(updatedTransactions));
            }
          });
        }
        
        return {
          ...session,
          participants: newParticipants
        };
      });

      // Update sessions
      setSessions(updatedSessions);
      localStorage.setItem('shuttleup_sessions', JSON.stringify(updatedSessions));

      // Cancel all bookings for these users
      const updatedBookings = bookings.map(booking =>
        userIds.includes(booking.userId)
          ? { ...booking, status: 'cancelled' as const }
          : booking
      );
      setBookings(updatedBookings);
      localStorage.setItem('shuttleup_bookings', JSON.stringify(updatedBookings));

      // Remove users from the users array
      const remainingUsers = users.filter(user => !userIds.includes(user.id));
      setUsers(remainingUsers);
      localStorage.setItem('shuttleup_users', JSON.stringify(remainingUsers));

      // Dispatch update event
      window.dispatchEvent(new CustomEvent('usersUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error deleting users:', error);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{
      users,
      sessions,
      bookings,
      creditTransactions,
      updateUser,
      addSession,
      addRecurringSessions,
      bookSession,
      cancelBooking,
      addCredits,
      getSessionParticipants,
      canCancelBooking,
      cancelSession,
      refreshUsers,
      getUserCreditHistory,
      deleteUsers
    }}>
      {children}
    </DataContext.Provider>
  );
};