import React, { useState } from 'react';
import { Users, Shield, User, Check, X, Plus, Edit, Trash2, AlertTriangle, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { User as UserType } from '../../types';

const UserManagement: React.FC = () => {
  const { users, updateUser, addCredits, refreshUsers, deleteUsers } = useData();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditComment, setCreditComment] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    division: 1
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Refresh users when component mounts to ensure we have the latest data
  React.useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Filter users based on search term
  const filterUsers = (userList: UserType[]) => {
    if (!searchTerm.trim()) {
      return userList;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return userList.filter(user => 
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  };

  const handleStatusChange = (user: UserType, newStatus: 'approved' | 'rejected') => {
    updateUser({ ...user, memberStatus: newStatus });
  };

  const handleRoleChange = (user: UserType, newRole: 'player' | 'admin') => {
    updateUser({ ...user, memberRole: newRole });
  };

  const handleAddCredits = () => {
    if (selectedUser && creditAmount !== 0) {
      // Validate comment
      if (creditComment.trim().length < 5) {
        alert('Comment must be at least 5 characters long');
        return;
      }

      // Check if deducting credits would result in negative balance
      if (creditAmount < 0 && selectedUser.credits + creditAmount < 0) {
        const maxDeduction = selectedUser.credits;
        if (window.confirm(
          `This would result in a negative balance. The user currently has ${selectedUser.credits} credits. ` +
          `Maximum you can deduct is ${maxDeduction} credits. Do you want to set their balance to 0 instead?`
        )) {
          addCredits(selectedUser.id, -selectedUser.credits);
        } else {
          return;
        }
      } else {
        addCredits(selectedUser.id, creditAmount, creditComment.trim());
      }
      
      setShowCreditModal(false);
      setCreditAmount(0);
      setCreditComment('');
      setSelectedUser(null);
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      division: user.division
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      const updatedUser = {
        ...editingUser,
        email: editFormData.email,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        division: editFormData.division
      };
      updateUser(updatedUser);
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const handleUserSelection = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (userList: UserType[], isSelected: boolean) => {
    const selectableUsers = userList.filter(user => user.memberRole !== 'admin');
    const userIds = selectableUsers.map(user => user.id);
    
    if (isSelected) {
      setSelectedUserIds(prev => [...new Set([...prev, ...userIds])]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => !userIds.includes(id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUserIds.length === 0) return;
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    const success = deleteUsers(selectedUserIds);
    if (success) {
      setSelectedUserIds([]);
      setShowDeleteConfirmation(false);
      // Show success message
      alert(`Successfully deleted ${selectedUserIds.length} user(s).`);
    } else {
      alert('Failed to delete users. Please try again.');
    }
  };

  const pendingUsers = filterUsers(users.filter(user => user.memberStatus === 'applied'));
  const approvedUsers = filterUsers(users.filter(user => user.memberStatus === 'approved'));
  const selectedUsersInfo = users.filter(user => selectedUserIds.includes(user.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        </div>
        
        {/* Search Box */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Search by name or username..."
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Search results for "{searchTerm}": {pendingUsers.length + approvedUsers.length} user(s) found
            </span>
          </div>
          {pendingUsers.length + approvedUsers.length === 0 && (
            <p className="text-blue-700 mt-2">
              No users found matching your search. Try searching by first name, last name, or username.
            </p>
          )}
        </div>
      )}

      {/* Selection Actions Bar */}
      {selectedUserIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">
                {selectedUserIds.length} user(s) selected for deletion
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedUserIds([])}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Clear Selection
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
          
          {selectedUsersInfo.length > 0 && (
            <div className="mt-3 text-sm text-red-700">
              <strong>Selected users:</strong> {selectedUsersInfo.map(u => `${u.firstName} ${u.lastName} (@${u.username})`).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Pending Approvals */}
      {(!searchTerm || pendingUsers.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-800">
                Pending Approvals {searchTerm && `(${pendingUsers.length})`}
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={pendingUsers.length > 0 && pendingUsers.every(user => selectedUserIds.includes(user.id))}
                  onChange={(e) => handleSelectAll(pendingUsers, e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="text-sm text-orange-700">Select All</label>
              </div>
            </div>
          </div>
          {pendingUsers.length === 0 && searchTerm ? (
            <div className="p-6 text-center text-gray-500">
              No pending users match your search criteria.
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending approvals at this time.
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          @{user.username} • {user.email} • Division {user.division}
                        </p>
                      </div>
                    </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStatusChange(user, 'approved')}
                        className="flex items-center space-x-1 bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(user, 'rejected')}
                        className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approved Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-emerald-800">
              Approved Members {searchTerm && `(${approvedUsers.length})`}
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={approvedUsers.filter(u => u.memberRole !== 'admin').length > 0 && 
                         approvedUsers.filter(u => u.memberRole !== 'admin').every(user => selectedUserIds.includes(user.id))}
                onChange={(e) => handleSelectAll(approvedUsers, e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm text-emerald-700">Select All (Non-Admin)</label>
            </div>
          </div>
        </div>
        {approvedUsers.length === 0 && searchTerm ? (
          <div className="p-6 text-center text-gray-500">
            No approved users match your search criteria.
          </div>
        ) : approvedUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No approved members yet.
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {approvedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {user.memberRole !== 'admin' && (
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    )}
                    {user.memberRole === 'admin' && (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Shield className="h-3 w-3 text-purple-600" />
                      </div>
                    )}
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${user.memberRole === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {user.memberRole === 'admin' ? (
                        <Shield className="h-5 w-5 text-purple-600" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        @{user.username} • {user.email} • Division {user.division}
                      </p>
                      <p className="text-sm text-emerald-600 font-medium">
                        {user.credits} credits
                      </p>
                    </div>
                  </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={user.memberRole}
                      onChange={(e) => handleRoleChange(user, e.target.value as 'player' | 'admin')}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="player">Player</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowCreditModal(true);
                      }}
                      className="flex items-center space-x-1 bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Credits</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Confirm User Deletion</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete {selectedUserIds.length} user(s)? This action cannot be undone.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">What will happen:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• User accounts will be permanently deleted</li>
                    <li>• Users will be removed from all booked sessions</li>
                    <li>• Credits will be refunded for future sessions</li>
                    <li>• All booking history will be cancelled</li>
                    <li>• This action cannot be reversed</li>
                  </ul>
                </div>

                {selectedUsersInfo.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-2">Users to be deleted:</h4>
                    <div className="space-y-1">
                      {selectedUsersInfo.map(user => (
                        <div key={user.id} className="text-sm text-gray-700">
                          {user.firstName} {user.lastName} (@{user.username}) - {user.credits} credits
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Users
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Add Credits to {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <div className="mb-4">
                <label htmlFor="creditAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Amount (use negative numbers to deduct credits)
                </label>
                <input
                  id="creditAmount"
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter amount (positive to add, negative to deduct)"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="creditComment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (minimum 5 characters) *
                </label>
                <textarea
                  id="creditComment"
                  value={creditComment}
                  onChange={(e) => setCreditComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter reason for credit adjustment..."
                  rows={3}
                  minLength={5}
                  required
                />
                <div className="mt-1 text-sm text-gray-500">
                  {creditComment.length}/5 minimum characters
                  {creditComment.length < 5 && creditComment.length > 0 && (
                    <span className="text-red-500 ml-2">Comment too short</span>
                  )}
                  {creditComment.length >= 5 && (
                    <span className="text-green-500 ml-2">✓ Valid</span>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>• Positive numbers (e.g., 10) will add credits</p>
                  <p>• Negative numbers (e.g., -5) will deduct credits</p>
                  <p>Current balance: {selectedUser.credits} credits</p>
                  {creditAmount !== 0 && (
                    <p className="font-medium mt-1">
                      New balance will be: {selectedUser.credits + creditAmount} credits
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowCreditModal(false);
                    setSelectedUser(null);
                    setCreditAmount(0);
                    setCreditComment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCredits}
                  disabled={creditAmount === 0 || creditComment.trim().length < 5}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {creditAmount > 0 ? 'Add Credits' : creditAmount < 0 ? 'Deduct Credits' : 'Update Credits'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Edit User Details
              </h3>
              
              <div className="space-y-4">
                {/* Username (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username (Cannot be changed)
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="user@gmail.com"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Doe"
                  />
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division (1 = Expert, 13 = Beginner)
                  </label>
                  <select
                    value={editFormData.division}
                    onChange={(e) => setEditFormData({ ...editFormData, division: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        Division {num} {num === 1 ? '(Expert)' : num === 13 ? '(Beginner)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Status Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Member Status:</strong> {editingUser.memberStatus}</p>
                    <p><strong>Role:</strong> {editingUser.memberRole}</p>
                    <p><strong>Credits:</strong> {editingUser.credits}</p>
                    <p><strong>Member Since:</strong> {new Date(editingUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;