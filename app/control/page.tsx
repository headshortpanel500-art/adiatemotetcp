'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Ban, Coins, Mail, Lock, UserCog, 
  Plus, Search, Filter, MoreVertical, ChevronDown,
  Edit2, Trash2, AlertCircle, X, CheckCircle, Crown,
  User, Settings, LogOut, Menu, RefreshCw, ArrowLeft,
  History, Clock, Landmark
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const AdminPanel = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingBalances, setEditingBalances] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text: msg, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (id: string, updatedData: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedData }),
      });
      if (res.ok) {
        showToast('✅ Updated Successfully!', 'success');
        fetchUsers();
      }
    } catch (error) {
      showToast('❌ Update failed', 'error');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (res.ok) {
        showToast(`👑 New ${role.toUpperCase()} Created!`, 'success');
        setEmail(''); setPassword('');
        setShowCreateModal(false);
        fetchUsers();
      }
    } catch (error) {
      showToast('❌ Creation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('⚠️ Are you sure you want to delete this user?')) {
      try {
        const res = await fetch('/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          showToast('🗑️ User Deleted', 'success');
          fetchUsers();
        }
      } catch (error) {
        showToast('❌ Delete failed', 'error');
      }
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const handleLogout = async () => {
    await fetch('/api/logout');
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-black text-white">
      {/* Background Blobs - Same as deposit page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      </div>

      {/* Toast Notification */}
      {statusMsg && (
        <div className={`fixed top-6 right-6 z-50 animate-slideIn`}>
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold backdrop-blur-xl border ${
            statusMsg.type === 'success' 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {statusMsg.text}
          </div>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-40 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white/60 hover:text-cyan-400 transition-all hover:scale-110"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-500 z-30 ${
        isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 mt-12">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">ADMIN</h2>
              <p className="text-[10px] text-gray-500">CONTROL PANEL</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Users className="w-5 h-5" />
              <span className="font-bold">Users</span>
            </button>
            <button 
              onClick={() => router.push('/control/deposit')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-xl transition-all"
            >
              <History className="w-5 h-5" />
              <span className="font-bold">Deposits</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold">Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-500 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8 relative z-10`}>
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()} 
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              USER MANAGEMENT
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Total Users</p>
                  <p className="text-3xl font-bold text-cyan-400">{users.length}</p>
                </div>
              </div>
            </div>
            
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Crown className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Admins</p>
                  <p className="text-3xl font-bold text-green-400">{users.filter((u: any) => u.role === 'admin').length}</p>
                </div>
              </div>
            </div>
            
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Regular Users</p>
                  <p className="text-3xl font-bold text-purple-400">{users.filter((u: any) => u.role === 'user').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-xl outline-none focus:border-cyan-500/50 transition-all text-white placeholder-white/40"
                />
              </div>
              
              {/* Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white/5 border border-white/10 px-4 py-4 rounded-xl outline-none focus:border-cyan-500/50 text-white/80"
              >
                <option value="all" className="bg-gray-900">All Roles</option>
                <option value="user" className="bg-gray-900">Users</option>
                <option value="admin" className="bg-gray-900">Admins</option>
              </select>

              <button
                onClick={fetchUsers}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                <RefreshCw className={`w-5 h-5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              CREATE USER
            </button>
          </div>

          {/* Users Table */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">User / Role</th>
                    <th className="p-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Balance</th>
                    <th className="p-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any, index: number) => (
                    <tr 
                      key={user._id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-all group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            user.role === 'admin' 
                              ? 'bg-green-500/10 border border-green-500/20' 
                              : 'bg-cyan-500/10 border border-cyan-500/20'
                          }`}>
                            {user.role === 'admin' ? (
                              <Crown className="w-6 h-6 text-green-400" />
                            ) : (
                              <User className="w-6 h-6 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                user.role === 'admin' 
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {user.role?.toUpperCase()}
                              </span>
                              {user.isBanned && (
                                <span className="text-[10px] px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold">
                                  BANNED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <input
                            type="number"
                            defaultValue={user.balance ?? 0}
                            className="bg-white/5 border border-white/10 w-28 px-3 py-2 rounded-lg text-green-400 font-bold outline-none focus:border-cyan-500"
                            onChange={(e) => setEditingBalances({
                              ...editingBalances, 
                              [user._id]: Number(e.target.value)
                            })}
                          />
                          <button
                            onClick={() => handleUpdate(user._id, { balance: editingBalances[user._id] })}
                            className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      <td className="p-6">
                        <button
                          onClick={() => handleUpdate(user._id, { isBanned: !user.isBanned })}
                          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border ${
                            user.isBanned
                              ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                              : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {user.isBanned ? 'UNBAN' : 'BAN'}
                        </button>
                      </td>

                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all"
                          >
                            <Edit2 className="w-4 h-4 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 font-bold">No users found</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-20">
                <RefreshCw className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-3" />
                <p className="text-sm text-white/40">Loading users...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-cyan-900/90 via-blue-900/90 to-black/90 p-8 rounded-3xl border border-white/10 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              CREATE NEW USER
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-white/40"
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-white/40"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <UserCog className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <select
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-xl outline-none focus:border-cyan-500 text-white appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user" className="bg-gray-900">USER ROLE</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-5 rounded-xl hover:scale-105 transition-all mt-6"
              >
                CREATE USER
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-cyan-900/90 via-blue-900/90 to-black/90 p-8 rounded-3xl border border-white/10 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              EDIT USER
            </h2>

            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Email</p>
                <p className="font-bold text-white">{selectedUser.email}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Current Role</p>
                <p className={`font-bold ${selectedUser.role === 'admin' ? 'text-green-400' : 'text-cyan-400'}`}>
                  {selectedUser.role?.toUpperCase()}
                </p>
              </div>

              <select
                className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-xl outline-none focus:border-cyan-500 text-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user" className="bg-gray-900">USER ROLE</option>
              </select>

              <button
                onClick={() => {
                  handleUpdate(selectedUser._id, { role });
                  setSelectedUser(null);
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-5 rounded-xl hover:scale-105 transition-all"
              >
                UPDATE ROLE
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;