"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, CheckCircle2, Send, Landmark, History, Clock, CheckCircle, XCircle, AlertCircle, Info, Phone, Hash, DollarSign } from "lucide-react";

export default function DepositPage() {
  const router = useRouter();
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedPackage, setSelectedPackage] = useState({ credits: 100, price: 40 });
  const [paymentType, setPaymentType] = useState("bkash");
  const [isCopied, setIsCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);

  const MY_NUMBER = "01325198814";
  const packages = [
    { credits: 100, price: 40 },
    { credits: 250, price: 90 },
    { credits: 500, price: 200 },
  ];

  // ডাটাবেজ থেকে হিস্টোরি নিয়ে আসা
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/deposit");
      const data = await res.json();
      if (Array.isArray(data)) setDepositHistory(data);
    } catch (err) {
      console.log("History load failed");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(MY_NUMBER);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber || !transactionId) {
      setStatus("❌ Please fill all fields correctly!");
      return;
    }

    setLoading(true);
    setStatus("⏳ Processing...");

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderNumber,
          transactionId,
          gateway: paymentType,
          price: selectedPackage.price,
          credits: selectedPackage.credits,
          userName: "user",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Deposit request is Pending! Please wait for approval.");
        setSenderNumber("");
        setTransactionId("");
        fetchHistory();
      } else {
        setStatus(`❌ ${data.error || "Submission failed"}`);
      }
    } catch (error) {
      setStatus("❌ Server connection error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-black text-white p-4 md:p-6">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Deposit Credits</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side: Form */}
          <div className="space-y-6">
            {/* Payment Instructions Card */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 text-yellow-400">
                <Info className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wider text-xs">Payment Instructions</span>
              </div>
              
              {/* Send Money Instruction */}
              <div className="bg-cyan-500/10 rounded-xl p-4 mb-3 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-cyan-400">1</span>
                  </div>
                  <p className="text-xs font-bold text-cyan-400">SEND MONEY to this number</p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                 <p className="text-[10px] text-green-500 uppercase text-center">Recipient Number</p>
                 <p className="text-xl font-mono font-bold text--400 text-center">{MY_NUMBER}</p>
                </div>
              </div>

              {/* Cash Out Instruction */}
              <div className="bg-purple-500/10 rounded-xl p-4 mb-3 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-400">2</span>
                  </div>
                  <p className="text-xs font-bold text--400">CASH OUT from your {paymentType === 'bkash' ? 'bKash' : 'Nagad'} account</p>
                </div>
                <p className="text-xs text-gray-300">
                  Use your own {paymentType === 'bkash' ? 'bKash' : 'Nagad'} account to send money to the number above
                </p>
              </div>

              {/* Must be from same number instruction */}
              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs font-bold text-yellow-400">IMPORTANT!</p>
                </div>
                <p className="text-[10px] text-gray-300 mt-1">
                  You must send money from the same number you enter below. 
                  Enter your {paymentType === 'bkash' ? 'bKash' : 'Nagad'} number and the Transaction ID after sending.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 ml-1">Select Package</label>
                <div className="grid grid-cols-1 gap-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.credits}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 rounded-xl border transition-all flex justify-between items-center ${selectedPackage.credits === pkg.credits ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="font-bold">{pkg.credits} Credits</span>
                      </div>
                      <span className="text-sm bg-green-500/10 px-2 py-1 rounded-lg">৳{pkg.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onClick={() => setPaymentType("bkash")} 
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentType === 'bkash' 
                      ? 'bg-[#ff0000] border-[] text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-lg">৳</span> bKash
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentType("nagad")} 
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentType === 'nagad' 
                      ? 'bg-[#00ff00] border-[] text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-lg">৳</span> Nagad
                </button>
              </div>

              {/* Sender Number Input with Icon */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder={`Your ${paymentType === 'bkash' ? 'bKash' : 'Nagad'} Number (Must be same as sender)`} 
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                />
              </div>

              {/* Transaction ID Input with Icon */}
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder={`${paymentType === 'bkash' ? 'bKash' : 'Nagad'} Transaction ID (TrxID)`} 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm font-mono focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                />
              </div>

              {/* Summary */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-green-400 font-bold">৳{selectedPackage.price}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-gray-400">Credits:</span>
                  <span className="text-cyan-400 font-bold">{selectedPackage.credits}</span>
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Please Wait...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> 
                    Confirm Deposit
                  </>
                )}
              </button>
              {status && (
                <div className={`text-[11px] text-center font-bold p-2 rounded-lg ${
                  status.includes('✅') ? 'bg-green-500/10 text-green-400' : 
                  status.includes('❌') ? 'bg-red-500/10 text-red-400' : 
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {status}
                </div>
              )}
            </form>
          </div>

          {/* Right Side: History */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 shadow-2xl h-fit">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold">Recent History</h2>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {depositHistory.length === 0 && (
                <div className="text-center py-10">
                  <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No history found</p>
                </div>
              )}
              {depositHistory.map((item: any) => (
                <div key={item._id} className="bg-white/5 border border-white/5 rounded-2xl p-4 group hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm">{item.credits} Credits</p>
                      <p className="text-[8px] text-gray-600">{item.gateway?.toUpperCase()}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'Approved' ? 'bg-green-500/10 text-green-400' : 
                      item.status === 'Rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {item.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : 
                       item.status === 'Rejected' ? <XCircle className="w-3 h-3" /> : 
                       <Clock className="w-3 h-3 animate-spin" />}
                      {item.status}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()} • ৳{item.price}
                    </p>
                    <p className="text-[8px] text-gray-600 font-mono">
                      {item.transactionId?.slice(-6)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}