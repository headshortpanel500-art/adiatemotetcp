"use client";

import { useEffect, useState } from "react";
import { Search, Send, Plus, Settings, Grid, List, ChevronDown, Sparkles, LogOut, Coins, CreditCard, ShoppingBag } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ------------------- JSON DATA ------------------- */
const servers = [
  "bangladesh",
  "india",
  "pakistan",
  "brazil",
  "indonesia",
  "thailand",
];

interface Emote {
  id: string;
  name: string;
  image: string;
}

/* ------------------- PAGE ------------------- */
export default function HomePage() {
  const router = useRouter();
  const [server, setServer] = useState(servers[0]);
  const [teamCode, setTeamCode] = useState("");
  const [uids, setUids] = useState<string[]>([""]);
  const [autoLeave, setAutoLeave] = useState(false);
  const [result, setResult] = useState("Ready...");
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isChecking, setIsChecking] = useState(true);
  const [credits, setCredits] = useState<number>(0);

  const handleBanStatus = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/load-emote?limit=1");
      if (res.status === 403 || res.status === 401) {
        setResult("❌ Session expired or you are banned!");
        handleBanStatus();
      }
    } catch (err) {
      console.error("Auth check failed");
    } finally {
      setIsChecking(false);
    }
  };

  const fetchEmotes = async () => {
    try {
      const res = await fetch(`/api/load-emote?offset=${emotes.length}&limit=300`);
      if (res.status === 403) {
        handleBanStatus();
        return;
      }
      const data = await res.json();
      setEmotes(data.emotes);
      if (data.credits !== undefined) setCredits(data.credits);
    } catch (error) {
      setResult("❌ Server error while loading emotes");
    }
  };

  useEffect(() => {
    checkAuthStatus();
    fetchEmotes();
    const interval = setInterval(() => checkAuthStatus(), 10000);
    return () => clearInterval(interval);
  }, []);

  const addUID = () => { if (uids.length < 4) setUids([...uids, ""]); };
  const updateUID = (index: number, value: string) => {
    const updated = [...uids];
    updated[index] = value;
    setUids(updated);
  };

  const sendEmote = async (emoteId: string) => {
    if (credits <= 0) {
      setResult("❌ Insufficient credits! Please recharge.");
      return;
    }
    const validUIDs = uids.filter((u) => u.trim() !== "");
    if (!teamCode || validUIDs.length === 0) {
      setResult("❌ Enter team code and at least 1 UID");
      return;
    }

    const payload = { server, team_code: teamCode, emote_id: emoteId, uids: validUIDs, auto_leave: autoLeave };
    setResult("Sending...");

    try {
      const res = await fetch("/api/send-emote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 403 || res.status === 401) {
        setResult("❌ Access Denied: You are banned!");
        setTimeout(() => handleBanStatus(), 1500);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setResult(JSON.stringify(data, null, 2));
        setCredits((prev) => Math.max(0, prev - 1));
      } else {
        setResult(`❌ Error: ${data.error || "Failed to send"}`);
      }
    } catch {
      setResult("❌ Server error");
    }
  };

  const loadMoreEmotes = async () => {
    try {
      const res = await fetch(`/api/load-emote?offset=${emotes.length}&limit=100`);
      if (res.status === 403) { handleBanStatus(); return; }
      const data = await res.json();
      setEmotes([...emotes, ...data.emotes]);
    } catch (error) { setResult("❌ Server error"); }
  };

  // FIX: Added optional chaining and empty array fallback to prevent filter error
  const filteredEmotes = (emotes || []).filter(emote => 
    emote?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => { await signOut({ callbackUrl: '/login' }); };

  if (isChecking && emotes.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500 mr-3"></div>
        Checking status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-black text-white p-4 md:p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Navigation Bar Upgrade */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-2xl backdrop-blur-md">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-lg">{credits}</span>
            </div>
            
            <button 
              onClick={() => router.push('/packages')}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-2xl border border-blue-500/20 transition-all text-sm font-semibold backdrop-blur-md"
            >
              <ShoppingBag className="w-4 h-4" />
              Packages
            </button>
          </div>

          <div className="text-center hidden md:block">
            <div className="inline-block relative">
              <h1 className="text-1xl font-black bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                ADIAT EMOTE BOT
              </h1>
              <Sparkles className="absolute -top-6 -right-8 w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button 
              onClick={() => router.push('/deposit')}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-2xl shadow-lg shadow-green-500/20 transition-all font-bold text-sm"
            >
              <CreditCard className="w-4 h-4" />
              Deposit
            </button>

            <button
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all backdrop-blur-sm"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 mb-8 shadow-2xl hover:border-purple-500/30 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-semibold">Configuration</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block mb-2 text-gray-300 text-sm font-medium">Server</label>
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-all"
              >
                {servers.map((s) => (
                  <option key={s} value={s} className="bg-gray-900">{s.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block mb-2 text-gray-300 text-sm font-medium">Team Code</label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                placeholder="Enter team code"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block mb-2 text-gray-300 text-sm font-medium">UIDs</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uids.map((uid, index) => (
                <div key={index} className="relative group">
                    <input
                    type="text"
                    value={uid}
                    onChange={(e) => updateUID(index, e.target.value)}
                    placeholder={`UID ${index + 1}`}
                    className="w-full bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 pl-10 transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{index + 1}</span>
                </div>
                ))}
            </div>

            {uids.length < 4 && (
              <button onClick={addUID} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-3">
                <Plus className="w-4 h-4" /> Add UID
              </button>
            )}
          </div>

          <div className="flex items-center mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
            <input
              type="checkbox"
              checked={autoLeave}
              onChange={() => setAutoLeave(!autoLeave)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
            />
            <span className="ml-3 text-gray-300">Auto Leave after sending</span>
          </div>
        </div>

        {/* Console Output */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-medium">Console Output</h3>
          </div>
          <pre className="bg-black/50 p-4 rounded-xl text-green-400 text-sm whitespace-pre-wrap font-mono border border-white/5 min-h-[60px]">
            {result}
          </pre>
        </div>

        {/* Gallery Headers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Grid className="w-6 h-6 text-purple-400" />
            Emote Gallery
            <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full uppercase tracking-wider">
              {filteredEmotes.length} items
            </span>
          </h2>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emotes..."
                className="w-full bg-white/5 backdrop-blur-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all text-sm"
              />
            </div>

            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "text-gray-400"}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "text-gray-400"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Emote Gallery Rendering */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredEmotes.map((emote) => (
              <div
                key={emote.id}
                className="group backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-5 text-center hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-b from-white/5 to-transparent p-2">
                    <img
                        src={`/api/image/${emote.id}.png`}
                        alt={emote.name}
                        className="w-20 h-20 mx-auto transform group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <p className="text-xs font-medium mb-4 text-gray-400 group-hover:text-white transition-colors line-clamp-1">
                  {emote.name}
                </p>
                <button
                  onClick={() => sendEmote(emote.id)}
                  disabled={credits <= 0}
                  className={`w-full ${credits > 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30' : 'bg-gray-800 opacity-50 cursor-not-allowed'} px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95`}
                >
                  <Send className="w-3 h-3" />
                  {credits > 0 ? "Send" : "No Credits"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
            {filteredEmotes.map((emote) => (
              <div key={emote.id} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-all last:border-0">
                <img src={`/api/image/${emote.id}.png`} alt={emote.name} className="w-12 h-12 rounded-lg" />
                <span className="flex-1 text-sm font-medium text-gray-300">{emote.name}</span>
                <button
                  onClick={() => sendEmote(emote.id)}
                  disabled={credits <= 0}
                  className={`${credits > 0 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-800'} px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95`}
                >
                  Send
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredEmotes.length > 0 && (
          <button
            onClick={loadMoreEmotes}
            className="mt-10 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 mx-auto transition-all transform hover:scale-105"
          >
            <ChevronDown className="w-5 h-5" />
            Load More
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}