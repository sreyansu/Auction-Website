import { useState, useEffect, useRef } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import { useAuth } from '../contexts/AuthContext';
import {
  startAuction, pauseAuction, resumeAuction, markPlayerSold,
  markPlayerUnsold, resetAuction, initializeAuction,
  seedPlayers, seedTeams, setBidIncrement, updateAuctionTimer, updateAuctionStatus, placeBid
} from '../services/firestore';
import { generatePlayers, generateTeams } from '../data/seedData';
import { formatCurrency, getRoleIcon } from '../utils/helpers';
import AuctionTimer from '../components/auction/AuctionTimer';
import { Shield, Play, Pause, Check, X, RotateCcw, Database, Settings, Gavel } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, signInWithGoogle } = useAuth();
  const { players, teams, auctionState } = useAuction();
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [bidIncrement, setBidIncrementLocal] = useState(10);
  const [manualBidTeam, setManualBidTeam] = useState<string>('');
  const [manualBidAmount, setManualBidAmount] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer countdown logic
  useEffect(() => {
    if (auctionState?.status === 'active' && auctionState.timer > 0) {
      timerRef.current = setInterval(async () => {
        if (auctionState.timer > 1) {
          await updateAuctionTimer(auctionState.timer - 1);
        } else {
          // Timer reached 0 - auto-mark unsold if no bidder
          if (!auctionState.highest_bidder) {
            await markPlayerUnsold(auctionState.current_player);
          } else {
            await updateAuctionStatus('sold');
          }
        }
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [auctionState?.status, auctionState?.timer]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="mx-auto mb-4" style={{ color: 'var(--color-danger)' }} />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>Please sign in with an admin account.</p>
          <button onClick={signInWithGoogle} className="btn-primary flex items-center gap-2 mx-auto">
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  const unsoldPlayers = players.filter(p => !p.sold);
  const currentPlayer = auctionState?.current_player ? players.find(p => p.id === auctionState.current_player) : null;

  const handleSeedData = async () => {
    if (!confirm('This will overwrite existing data. Continue?')) return;
    setLoading(true);
    try {
      await seedPlayers(generatePlayers());
      await seedTeams(generateTeams());
      await initializeAuction();
      alert('Data seeded successfully! 100 players and 8 teams created.');
    } catch (e) {
      console.error(e);
      alert('Error seeding data');
    }
    setLoading(false);
  };

  const handleStartAuction = async () => {
    if (!selectedPlayer) return alert('Select a player first!');
    const player = players.find(p => p.id === selectedPlayer);
    if (!player) return;
    await startAuction(selectedPlayer, player.base_price);
  };

  const handleSold = async () => {
    if (!auctionState?.current_player || !auctionState.highest_bidder) return;
    await markPlayerSold(auctionState.current_player, auctionState.highest_bidder, auctionState.current_bid);
  };

  const handleUnsold = async () => {
    if (!auctionState?.current_player) return;
    await markPlayerUnsold(auctionState.current_player);
  };

  const handleReset = async () => {
    if (!confirm('Reset the entire auction? All data will be restored to defaults.')) return;
    setLoading(true);
    await resetAuction();
    setLoading(false);
  };

  const handleBidIncrement = async () => {
    await setBidIncrement(bidIncrement);
  };

  const handleManualBid = async () => {
    if (!auctionState?.current_player || !manualBidTeam || !manualBidAmount) return;
    const amount = parseInt(manualBidAmount);
    if (isNaN(amount) || amount <= auctionState.current_bid) {
      return alert(`Bid amount must be greater than current bid (₹${auctionState.current_bid}L)`);
    }
    const team = teams.find(t => t.id === manualBidTeam);
    if (team && team.purse_remaining < amount) {
      return alert('Error: Team has insufficient purse balance for this bid!');
    }
    await placeBid(auctionState.current_player, manualBidTeam, team?.team_name || '', amount);
    setManualBidAmount(''); // Reset input
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Settings size={28} style={{ color: 'var(--color-primary)' }} />
          Admin Panel
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Seed Data */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Database size={16} /> DATABASE
              </h3>
              <button onClick={handleSeedData} disabled={loading} className="btn-primary flex items-center gap-2">
                <Database size={16} /> {loading ? 'Seeding...' : 'Seed 50 Players + 4 Teams'}
              </button>
            </div>

            {/* Current Auction Status */}
            {auctionState && currentPlayer && (
              <div className="glass-card glow-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                    <Gavel size={16} /> CURRENT AUCTION
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style={{
                    background: auctionState.status === 'active' ? 'rgba(0,200,83,0.2)' : 'rgba(255,214,0,0.2)',
                    color: auctionState.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}>
                    {auctionState.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <img src={currentPlayer.image_url} alt="" className="w-16 h-16 rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{currentPlayer.name}</h4>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {getRoleIcon(currentPlayer.role)} {currentPlayer.role} • Base: {formatCurrency(currentPlayer.base_price)}
                    </p>
                    <p className="font-bold text-xl mt-1" style={{ color: 'var(--color-primary)' }}>
                      Current Bid: ₹{auctionState.current_bid}L
                      {auctionState.highest_bidder_name && ` → ${auctionState.highest_bidder_name}`}
                    </p>
                  </div>
                  <AuctionTimer timer={auctionState.timer} isActive={auctionState.status === 'active'} size="sm" />
                </div>
              </div>
            )}

            {/* Auction Controls */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Gavel size={16} /> AUCTION CONTROLS
              </h3>

              {/* Select Player */}
              <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Select Player for Auction</label>
                  <button 
                    onClick={() => {
                      if (unsoldPlayers.length > 0) {
                        const randomIndex = Math.floor(Math.random() * unsoldPlayers.length);
                        setSelectedPlayer(unsoldPlayers[randomIndex].id);
                      }
                    }}
                    disabled={unsoldPlayers.length === 0 || auctionState?.status === 'active'}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'rgba(255,122,0,0.1)', color: 'var(--color-primary)', border: '1px solid currentColor' }}
                  >
                    🎲 Select Random
                  </button>
                </div>
                <select
                  value={selectedPlayer}
                  onChange={e => setSelectedPlayer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="">-- Select Player --</option>
                  {unsoldPlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {getRoleIcon(p.role)} {p.name} ({p.role}) - Base: ₹{p.base_price}L
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  onClick={handleStartAuction}
                  disabled={!selectedPlayer || auctionState?.status === 'active'}
                  className="btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  <Play size={16} /> Start
                </button>
                <button
                  onClick={() => auctionState?.status === 'paused' ? resumeAuction() : pauseAuction()}
                  disabled={!auctionState || (auctionState.status !== 'active' && auctionState.status !== 'paused')}
                  className="btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  {auctionState?.status === 'paused' ? <><Play size={16} /> Resume</> : <><Pause size={16} /> Pause</>}
                </button>
                <button
                  onClick={handleSold}
                  disabled={!auctionState?.highest_bidder || auctionState.status === 'sold'}
                  className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg font-semibold"
                  style={{ background: 'var(--color-success)', color: '#000' }}
                >
                  <Check size={16} /> SOLD
                </button>
                <button
                  onClick={handleUnsold}
                  disabled={!auctionState?.current_player || auctionState.status === 'unsold'}
                  className="btn-danger flex items-center justify-center gap-2 text-sm"
                >
                  <X size={16} /> UNSOLD
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="btn-secondary flex items-center justify-center gap-2 text-sm col-span-2 md:col-span-1"
                  style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                >
                  <RotateCcw size={16} /> Reset All
                </button>
              </div>
            </div>

            {/* Bid Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bid Increment */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>BID INCREMENT</h3>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20, 25, 50].map(val => (
                    <button
                      key={val}
                      onClick={() => { setBidIncrementLocal(val); handleBidIncrement(); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${bidIncrement === val ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      ₹{val}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Override Bid */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>MANUAL BID OVERRIDE</h3>
                <div className="flex flex-col gap-2">
                  <select
                    value={manualBidTeam}
                    onChange={e => setManualBidTeam(e.target.value)}
                    disabled={auctionState?.status !== 'active'}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="">-- Select Team --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.team_name} (₹{t.purse_remaining}L left)</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-dim)' }}>₹</span>
                      <input
                        type="number"
                        value={manualBidAmount}
                        onChange={e => setManualBidAmount(e.target.value)}
                        placeholder="Amount (Lakhs)"
                        disabled={auctionState?.status !== 'active'}
                        className="w-full pl-7 pr-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>
                    <button 
                      onClick={handleManualBid}
                      disabled={!manualBidTeam || !manualBidAmount || auctionState?.status !== 'active'}
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Player Queue */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
              PLAYER QUEUE ({unsoldPlayers.length} remaining)
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {unsoldPlayers.slice(0, 20).map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayer(p.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all"
                  style={{
                    background: selectedPlayer === p.id ? 'rgba(255,122,0,0.15)' : 'var(--color-bg)',
                    border: `1px solid ${selectedPlayer === p.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <img src={p.image_url} alt="" className="w-8 h-8 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      {getRoleIcon(p.role)} {p.role}
                    </p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                    ₹{p.base_price}L
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
