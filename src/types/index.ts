export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  division: number;
  memberStatus: 'applied' | 'approved' | 'rejected';
  memberRole: 'player' | 'admin';
  credits: number;
  createdAt: Date;
}

export interface Session {
  id: string;
  venue: string;
  divisions: number[]; // Division restrictions for the session (can be multiple)
  startTime: Date;
  endTime: Date;
  creditCost: number;
  maxParticipants: number;
  participants: string[]; // user IDs - always an array
  createdBy: string; // admin user ID
  createdAt: Date;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  recurringEndDate?: Date;
  parentSessionId?: string; // For sessions created from recurring template
  cancellationDeadlineHours?: number; // Hours before session when cancellation is no longer allowed
}

export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  bookedAt: Date;
  status: 'active' | 'cancelled';
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'refund';
  amount: number;
  description: string;
  sessionId?: string; // For session-related transactions
  timestamp: Date;
  balanceAfter: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}