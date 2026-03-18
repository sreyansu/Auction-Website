import { useEffect, useRef, useState } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import { useAuth } from '../contexts/AuthContext';
import { placeBid } from '../services/firestore';
import { playBidSound, playCountdownSound, playFinalCountdownSound, playSoldSound, playUnsoldSound } from '../utils/sounds';
import { formatCurrency, getRoleColor, getRoleIcon, getCountryFlag } from '../utils/helpers';
import AuctionTimer from '../components/auction/AuctionTimer';
import BidHistory from '../components/auction/BidHistory';
import SoldOverlay from '../components/auction/SoldOverlay';
import TeamLogo from '../components/common/TeamLogo';
import { Gavel, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export default function AuctionPage() {
  const { auctionState, currentPlayer, highestBidderTeam, teams, bids, activeLeagueId } = useAuction();
  const { user } = useAuth();
  const [showSold, setShowSold] = useState(false);
  const prevStatusRef = useRef(auctionState?.status);
  const prevBidRef = useRef(auctionState?.current_bid);
  const prevTimerRef = useRef(auctionState?.timer);

  useEffect(() => {
    if (!auctionState) return;
    if (prevStatusRef.current !== 'sold' && auctionState.status === 'sold') {
      playSoldSound();
      setShowSold(true);
    }
    if (prevStatusRef.current !== 'unsold' && auctionState.status === 'unsold') {
      playUnsoldSound();
    }
    if (prevBidRef.current && auctionState.current_bid > prevBidRef.current) {
      playBidSound();
    }
    if (auctionState.status === 'active' && auctionState.timer <= 10 && auctionState.timer > 0) {
      if (prevTimerRef.current !== auctionState.timer) {
        auctionState.timer <= 5 ? playFinalCountdownSound() : playCountdownSound();
      }
    }
    prevStatusRef.current = auctionState.status;
    prevBidRef.current = auctionState.current_bid;
    prevTimerRef.current = auctionState.timer;
  }, [auctionState]);

  const handleBid = async (teamId: string, teamName: string) => {
    if (!auctionState || !currentPlayer || auctionState.status !== 'active' || !activeLeagueId) return;
    const newBid = auctionState.current_bid + auctionState.bid_increment;
    const team = teams.find(t => t.id === teamId);
    if (team && team.purse_remaining < newBid) {
      alert('Insufficient purse balance!');
      return;
    }
    await placeBid(activeLeagueId, auctionState.current_player, teamId, teamName, newBid);
  };

  if (!activeLeagueId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center md:max-w-md p-6">
          <AlertTriangle size={64} className="mx-auto mb-4" style={{ color: 'var(--color-warning)' }} />
          <h2 className="text-2xl font-bold mb-2">No League Selected</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            You must join a league from the Lobby before accessing the Auction Room.
          </p>
        </div>
      </div>
    );
  }

  if (!auctionState || auctionState.status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Gavel size={64} className="mx-auto mb-4" style={{ color: 'var(--color-text-dim)' }} />
          <h2 className="text-2xl font-bold mb-2">Auction Not Started</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            The auction has not begun yet. Please wait for the admin to start.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      {showSold && currentPlayer && highestBidderTeam && (
        <SoldOverlay
          show={showSold}
          playerName={currentPlayer.name}
          teamName={highestBidderTeam.team_name}
          teamLogo={highestBidderTeam.team_logo}
          soldPrice={auctionState.current_bid}
          onComplete={() => setShowSold(false)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gavel size={24} style={{ color: 'var(--color-primary)' }} />
            Auction Room
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${auctionState.status === 'active' ? 'animate-pulse' : ''}`}
              style={{
                background: auctionState.status === 'active' ? 'var(--color-success)'
                  : auctionState.status === 'paused' ? 'var(--color-warning)'
                    : auctionState.status === 'sold' ? 'var(--color-success)'
                      : 'var(--color-danger)',
              }}
            />
            <span className="text-sm font-medium uppercase" style={{
              color: auctionState.status === 'active' ? 'var(--color-success)'
                : auctionState.status === 'paused' ? 'var(--color-warning)'
                  : 'var(--color-text-muted)',
            }}>
              {auctionState.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {currentPlayer && (
              <div className="glass-card glow-border p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <img
                      src={currentPlayer.image_url}
                      alt={currentPlayer.name}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover"
                      style={{ border: '2px solid var(--color-primary)' }}
                    />
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap"
                      style={{ background: getRoleColor(currentPlayer.role), color: '#000' }}
                    >
                      {getRoleIcon(currentPlayer.role)} {currentPlayer.role}
                    </span>
                    {currentPlayer.star && (
                      <span className="absolute -top-2 -right-2 text-xl">⭐</span>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black mb-1">
                      {currentPlayer.name}
                      {currentPlayer.star && <span className="ml-2 text-lg" style={{ color: 'var(--color-warning)' }}>★ Star</span>}
                    </h2>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                      {getCountryFlag(currentPlayer.country)} {currentPlayer.country} • {currentPlayer.stats.matches_played} Matches
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatBox label="Bat Avg" value={currentPlayer.stats.batting_average.toString()} />
                      <StatBox label="Strike Rate" value={currentPlayer.stats.strike_rate.toString()} />
                      <StatBox label="Bowl Avg" value={currentPlayer.stats.bowling_average.toString()} />
                      <StatBox label="Economy" value={currentPlayer.stats.economy_rate.toString()} />
                    </div>
                    <div className="mt-2 text-sm">
                      <span style={{ color: 'var(--color-text-dim)' }}>Form: </span>
                      <span>{currentPlayer.stats.recent_form}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <AuctionTimer timer={auctionState.timer} isActive={auctionState.status === 'active'} size="lg" />
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      <Clock size={12} className="inline mr-1" />seconds remaining
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    <TrendingUp size={14} className="inline mr-1" /> Current Bid
                  </p>
                  <div className="text-5xl font-black gradient-text animate-bid-flash" key={auctionState.current_bid}>
                    ₹{auctionState.current_bid} Lakhs
                  </div>
                </div>
                {highestBidderTeam && (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.3)' }}>
                    <TeamLogo src={highestBidderTeam.team_logo} name={highestBidderTeam.team_name} size="md" />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Highest Bidder</p>
                      <p className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{highestBidderTeam.team_name}</p>
                    </div>
                  </div>
                )}
                {auctionState.status === 'unsold' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,23,68,0.15)', border: '1px solid rgba(255,23,68,0.3)' }}>
                    <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
                    <span className="font-bold text-lg" style={{ color: 'var(--color-danger)' }}>UNSOLD</span>
                  </div>
                )}
              </div>
            </div>

            {auctionState.status === 'active' && user && (
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  PLACE BID (₹{auctionState.current_bid + auctionState.bid_increment}L)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => handleBid(team.id, team.team_name)}
                      disabled={team.purse_remaining < auctionState.current_bid + auctionState.bid_increment}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                      style={{
                        background: auctionState.highest_bidder === team.id ? 'rgba(255,122,0,0.2)' : 'var(--color-bg)',
                        border: `1px solid ${auctionState.highest_bidder === team.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      <img src={team.team_logo} alt="" className="w-6 h-6 rounded-full" />
                      <span className="truncate">{team.team_name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <BidHistory bids={bids} />
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
                TEAM PURSES
              </h3>
              <div className="space-y-2">
                {teams.map(team => {
                  const pct = (team.purse_remaining / team.total_purse) * 100;
                  return (
                    <div key={team.id} className="flex items-center gap-2">
                      <img src={team.team_logo} alt="" className="w-6 h-6 rounded-full" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="truncate">{team.team_name}</span>
                          <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(team.purse_remaining)}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${pct}%`,
                            background: pct > 50 ? 'var(--color-success)' : pct > 25 ? 'var(--color-warning)' : 'var(--color-danger)',
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg text-center" style={{ background: 'var(--color-bg)' }}>
      <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  );
}
