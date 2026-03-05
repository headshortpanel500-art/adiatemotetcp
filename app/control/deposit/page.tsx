"use client";
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, ArrowLeft, Clock, History, Landmark, User, Mail, Phone, CreditCard, DollarSign, Calendar, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDeposit() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deposit', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setDeposits(data);
    } catch (err) {
      console.log("Failed to fetch deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/deposit/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) { 
      alert("Server Error"); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-black text-white p-4 md:p-6">
      {/* Background Blobs - Same as deposit page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with back button - Same style */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Deposit Requests
          </h1>
        </div>

        {/* Stats Card - New addition for admin */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Total Requests</p>
            <p className="text-2xl font-bold text-cyan-400">{deposits.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{deposits.filter(d => d.status === 'Pending').length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Approved</p>
            <p className="text-2xl font-bold text-green-400">{deposits.filter(d => d.status === 'Approved').length}</p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 shadow-2xl">
          {/* Header with refresh */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold">All Deposit Requests</h2>
            </div>
            <button 
              onClick={fetchAll} 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`}/>
            </button>
          </div>

          {/* Deposits List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {deposits.length === 0 && !loading && (
              <div className="text-center py-16">
                <Landmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No deposit requests found</p>
              </div>
            )}
            
            {deposits.map((d: any) => (
              <div 
                key={d._id} 
                className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left side - User info with better details */}
                  <div className="flex-1">
                    {/* User Header with Avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">{d.userName || 'Unknown User'}</span>
                          <span className="text-[10px] px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full text-cyan-400 border border-cyan-500/30">
                            #{d._id?.slice(-6) || '000000'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                            d.gateway?.toLowerCase() === 'bkash' 
                              ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30' 
                              : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                          }`}>
                            {d.gateway?.toUpperCase() || 'Bkash'}
                          </span>
                          <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10">
                            {new Date(d.createdAt).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* User Details Grid - Enhanced */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-black/20 rounded-xl p-3 border border-white/5">
                      {/* Email */}
                      <div className="flex items-start gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">Email</p>
                          <p className="text-xs font-mono text-cyan-400 break-all">{d.userEmail}</p>
                        </div>
                      </div>

                      {/* Sender Number */}
                      <div className="flex items-start gap-2">
                        <Phone className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">Sender Number</p>
                          <p className="text-xs font-mono text-purple-400">{d.senderNumber || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Transaction ID */}
                      <div className="flex items-start gap-2">
                        <Hash className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">Transaction ID</p>
                          <p className="text-xs font-mono text-yellow-400 break-all">{d.transactionId}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">Amount</p>
                          <p className="text-sm font-bold text-green-400">৳{d.price}</p>
                        </div>
                      </div>

                      {/* Credits */}
                      <div className="flex items-start gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">Credits</p>
                          <p className="text-sm font-bold text-blue-400">{d.credits}</p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">Submitted</p>
                          <p className="text-xs text-gray-400">
                            {new Date(d.createdAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info if available */}
                    {(d.adminNote || d.processedAt) && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                        {d.adminNote && (
                          <span className="px-2 py-1 bg-white/5 rounded-full">
                            Note: {d.adminNote}
                          </span>
                        )}
                        {d.processedAt && (
                          <span className="px-2 py-1 bg-white/5 rounded-full">
                            Processed: {new Date(d.processedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right side - Status and Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:min-w-[140px]">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold w-full justify-center ${
                      d.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 
                      d.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {d.status === 'Approved' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                       d.status === 'Rejected' ? <XCircle className="w-3.5 h-3.5" /> : 
                       <Clock className="w-3.5 h-3.5 animate-pulse" />}
                      {d.status}
                    </div>

                    {/* Action Buttons for Pending */}
                    {d.status === 'Pending' && (
                      <div className="flex lg:flex-col gap-2 w-full">
                        <button 
                          onClick={() => handleUpdate(d._id, 'Approved')} 
                          className="flex-1 lg:w-full px-4 py-2.5 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-green-500/20 hover:border-green-500 flex items-center justify-center gap-2 text-xs font-bold"
                        >
                          <CheckCircle className="w-4 h-4"/>
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdate(d._id, 'Rejected')} 
                          className="flex-1 lg:w-full px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:border-red-500 flex items-center justify-center gap-2 text-xs font-bold"
                        >
                          <XCircle className="w-4 h-4"/>
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Quick View of Transaction ID */}
                    {d.status !== 'Pending' && (
                      <div className="text-[8px] text-gray-600 text-center mt-1">
                        ID: {d._id?.slice(-8) || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading requests...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.1); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(255,255,255,0.2); 
        }
      `}</style>
    </div>
  );
}