import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAuction } from '../contexts/AuctionContext';
import { createLeague, getLeaguesByOwner, fetchLeague } from '../services/firestore';
import type { League } from '../types';
import { Shield, Users, Plus, LogIn, Key, Zap, Globe, Database, Trophy, BarChart3, LogOut } from 'lucide-react';

export default function LobbyPage() {
  const { user, signInWithGoogle, logout } = useAuth();
  const { setActiveLeagueId, activeLeagueId } = useAuction();
  const navigate = useNavigate();

  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinLeagueId, setJoinLeagueId] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (user?.uid) {
      getLeaguesByOwner(user.uid).then(setMyLeagues).catch(console.error);
    } else {
      setMyLeagues([]);
    }
  }, [user]);

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newLeagueName.trim()) return;
    setLoading(true);
    try {
      const id = await createLeague(newLeagueName.trim(), user.uid);
      setActiveLeagueId(id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create league');
    }
    setLoading(false);
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinLeagueId.trim()) return;
    setLoading(true);
    setJoinError('');
    try {
      const league = await fetchLeague(joinLeagueId.trim());
      if (league) {
        setActiveLeagueId(league.id);
        navigate('/dashboard');
      } else {
        setJoinError('Invalid League ID. League not found.');
      }
    } catch (err) {
      console.error(err);
      setJoinError('Error connecting to league.');
    }
    setLoading(false);
  };

  const selectLeague = (id: string) => {
    setActiveLeagueId(id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-white selection:bg-orange-500/30 font-sans">
      
      {/* Mini Navbar */}
      <nav className="fixed w-full z-50 px-6 py-4 flex items-center justify-between transition-all" 
           style={{ background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏏</span>
          <span className="text-xl font-bold gradient-text pb-1 tracking-tight">AuctionPro</span>
        </div>
        <div>
          {user ? (
             <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-gray-300 hidden sm:block">
                 Welcome, {user.displayName?.split(' ')[0]}
               </span>
               <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-700" />
               <button onClick={logout} className="btn-secondary text-xs py-1.5 px-4 flex items-center gap-1">
                 <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
               </button>
             </div>
          ) : (
             <button onClick={signInWithGoogle} className="btn-primary text-sm py-2 px-6 shadow-lg shadow-orange-500/20">
               Sign In to Host
             </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden flex flex-col items-center flex-1 justify-center min-h-[85vh]">
         {/* Background Effects */}
         <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/15 rounded-full blur-[120px]" />
           <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
         </div>
         
         <div className="relative z-10 text-center max-w-5xl mx-auto mt-8 animate-fade-in py-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-semibold border shadow-lg shadow-orange-500/10"
             style={{ background: 'rgba(255,122,0,0.1)', color: 'var(--color-primary)', borderColor: 'rgba(255,122,0,0.2)' }}>
             <Zap size={16} className="text-orange-500 animate-pulse" /> The Ultimate Fantasy Live Auction Platform
           </div>
           
           <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[1.05]">
             Host Premium <br className="hidden md:block"/>
             <span className="gradient-text">Cricket Auctions</span> in Real-Time
           </h1>
           
           <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
             Create isolated league rooms, upload custom players and teams via CSV, and invite your friends to experience a professional live bidding event.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <button onClick={() => document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' })} 
                     className="btn-primary px-8 py-4 text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center transition-transform hover:scale-105 shadow-xl shadow-orange-500/20 rounded-xl">
               Join a League <Globe size={20} />
             </button>
             <button onClick={() => document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' })} 
                     className="btn-secondary px-8 py-4 text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center transition-transform hover:scale-105 rounded-xl border border-gray-600 bg-black/50 hover:bg-black">
               Create a League <Plus size={20} />
             </button>
           </div>
         </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-4 relative z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(15,15,15,1) 100%)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
         <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-16 tracking-tight">Everything you need to run the show</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="glass-card p-8 rounded-2xl hover:border-orange-500/30 transition-colors group">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                     <Database size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Custom CSV Data</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Upload your own player lists and team franchises. Complete control over stats, base prices, roles, and starting purses.</p>
               </div>
               <div className="glass-card p-8 rounded-2xl hover:border-orange-500/30 transition-colors group">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                     <Trophy size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Multi-Tenant Rooms</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Every league is incredibly secure and isolated. Run dozens of different auctions simultaneously without any data overlap.</p>
               </div>
               <div className="glass-card p-8 rounded-2xl hover:border-orange-500/30 transition-colors group">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                     <BarChart3 size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Live Synchronization</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Real-time syncing of budgets, highest bids, and sold players directly to all viewers' screens instantly via Firestore.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Action Area (The original Lobby forms) */}
      <section className="py-24 px-4 relative z-10 bg-[#0a0a0a]">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black mb-4">Start your journey</h2>
               <p className="text-gray-400">Join an existing room or take control as an administrator.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
               
               {/* Left Column - Join & Current Status */}
               <div id="join-section" className="space-y-6 flex flex-col">
                 
                 {/* Join Form */}
                 <div className="glass-card p-8 rounded-2xl border border-white/5 flex-1 flex flex-col justify-center">
                   <div className="mb-8">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <LogIn size={24} className="text-blue-400" />
                     </div>
                     <h2 className="text-2xl font-bold mb-2">Join Existing League</h2>
                     <p className="text-sm text-gray-400">
                       Enter a League ID provided by an administrator to jump straight into their live auction room.
                     </p>
                   </div>
                   
                   <form onSubmit={handleJoinLeague} className="flex flex-col sm:flex-row gap-3">
                     <div className="relative flex-1">
                       <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                       <input 
                         type="text" 
                         value={joinLeagueId}
                         onChange={e => setJoinLeagueId(e.target.value)}
                         placeholder="Enter League ID"
                         className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all font-mono text-sm focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                         style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                       />
                     </div>
                     <button disabled={loading || !joinLeagueId} type="submit" className="btn-primary px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/10">
                       Connect
                     </button>
                   </form>
                   {joinError && <p className="text-sm text-red-500 mt-4 font-medium flex items-center gap-2"><Zap size={14}/> {joinError}</p>}
                 </div>

                 {/* Active League Card */}
                 {activeLeagueId && (
                   <div className="glass-card glow-border p-6 rounded-2xl" style={{ borderColor: 'var(--color-success)', background: 'rgba(0,200,83,0.03)' }}>
                      <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <Users className="text-green-500" size={20} /> Currently Connected
                      </h2>
                      <p className="mb-4 text-xs text-gray-400">
                        You have an active session in a league room.
                      </p>
                      <div className="p-3 rounded-xl font-mono text-center text-sm tracking-widest mb-4 bg-black/40 border border-green-500/20 text-green-400 font-bold">
                        {activeLeagueId}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1 py-2 text-sm">
                          Return to Dashboard
                        </button>
                        <button onClick={() => setActiveLeagueId(null)} className="btn-secondary flex-none py-2 px-4 text-sm bg-black/60 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors">
                          Disconnect
                        </button>
                      </div>
                   </div>
                 )}
               </div>

               {/* Right Column - User Leagues & Creation */}
               <div id="create-section" className="space-y-6 flex flex-col">
                 
                 {/* Create Form */}
                 <div className="glass-card p-8 rounded-2xl border-t-2" style={{ borderTopColor: 'var(--color-primary)', background: 'rgba(255,122,0,0.02)' }}>
                   <div className="mb-6 flex items-start justify-between">
                     <div>
                       <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
                          <Plus size={24} className="text-orange-500" />
                       </div>
                       <h2 className="text-2xl font-bold mb-2">Create a League</h2>
                     </div>
                   </div>
                   
                   {!user ? (
                     <div className="text-center py-8 rounded-xl bg-black/40 border border-white/5">
                       <Shield size={48} className="mx-auto mb-4 text-gray-600" />
                       <p className="mb-5 text-sm text-gray-400 px-4">You must be authenticated to spawn a new database room and act as its administrator.</p>
                       <button onClick={signInWithGoogle} className="btn-primary px-8 py-3 rounded-xl mx-auto flex items-center gap-2 font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform">
                         Sign in with Google
                       </button>
                     </div>
                   ) : (
                     <form onSubmit={handleCreateLeague}>
                       <p className="text-sm mb-5 text-gray-400">
                         Create a secure room where you are the sole administrator, capable of uploading custom data and controlling the auction flow.
                       </p>
                       <div className="flex flex-col sm:flex-row gap-3">
                         <input 
                           type="text" 
                           value={newLeagueName}
                           onChange={e => setNewLeagueName(e.target.value)}
                           placeholder="E.g., IPL 2026 Mock Auction"
                           className="flex-1 px-4 py-3.5 rounded-xl outline-none transition-all text-sm focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                           style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                         />
                         <button disabled={loading || !newLeagueName} type="submit" className="btn-primary px-8 py-3.5 rounded-xl font-bold whitespace-nowrap">
                           Deploy Room
                         </button>
                       </div>
                     </form>
                   )}
                 </div>

                 {/* User's Leagues List */}
                 {user && (
                   <div className="glass-card p-6 rounded-2xl border border-white/5">
                      <h2 className="text-md font-bold mb-4 flex items-center gap-2 text-gray-300">
                        <Shield size={16} className="text-orange-400" /> My Admin Leagues
                      </h2>
                      {myLeagues.length === 0 ? (
                        <p className="text-sm text-center py-6 text-gray-500 bg-black/20 rounded-xl border border-white/5">
                          You haven't created any leagues yet.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                          {myLeagues.map(league => (
                            <div 
                              key={league.id} 
                              className="p-4 rounded-xl flex items-center justify-between transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
                              style={{ 
                                background: activeLeagueId === league.id ? 'rgba(255,122,0,0.1)' : 'rgba(0,0,0,0.2)',
                                borderColor: activeLeagueId === league.id ? 'rgba(255,122,0,0.3)' : 'rgba(255,255,255,0.05)'
                              }}
                            >
                              <div className="min-w-0 pr-4">
                                <h3 className="font-bold truncate text-sm">{league.name}</h3>
                                <p className="font-mono text-[10px] mt-1.5 truncate text-gray-500 bg-black/40 px-2 py-0.5 rounded inline-block border border-white/5">ID: {league.id}</p>
                              </div>
                              {activeLeagueId === league.id ? (
                                <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg bg-orange-500 text-black shadow-[0_0_10px_rgba(255,122,0,0.5)]">Active</span>
                              ) : (
                                <button 
                                  onClick={() => selectLeague(league.id)}
                                  className="text-xs px-4 py-2 rounded-lg btn-secondary font-bold whitespace-nowrap bg-white/5 hover:bg-white/10 hover:text-white border-transparent"
                                >
                                  Load
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 )}
               </div>

            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-white/5 bg-[#050505]">
        <p className="text-sm text-gray-500">
          © 2026 AuctionPro • Built for sports enthusiasts by Sreyansu.
        </p>
      </footer>
    </div>
  );
}
