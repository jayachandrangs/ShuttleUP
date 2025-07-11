import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface PasswordResetSuccessProps {
  onBackToLogin: () => void;
}

const PasswordResetSuccess: React.FC<PasswordResetSuccessProps> = ({ onBackToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-emerald-500 p-3 rounded-xl">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Password Updated!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
              <p className="text-sm text-emerald-800 font-medium">
                Your account is now secure with your new password
              </p>
            </div>
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <span>Continue to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;