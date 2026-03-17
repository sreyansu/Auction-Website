import { useEffect, useRef, useState } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import { formatCurrency, getRoleColor, getRoleIcon, getCountryFlag } from '../utils/helpers';
import { playBidSound, playSoldSound, playUnsoldSound, playFinalCountdownSound, playCountdownSound } from '../utils/sounds';
import AuctionTimer from '../components/auction/AuctionTimer';

export default function DisplayPage() {
  const { auctionState, currentPlayer, highestBidderTeam, teams, bids } = useAuction();
  const [showSoldBanner, setShowSoldBanner] = useState(false);
  const [showUnsoldBanner, setShowUnsoldBanner] = useState(false);
  const prevStatusRef = useRef(auctionState?.status);
  const prevBidRef = useRef(auctionState?.current_bid);
  const prevTimerRef = useRef(auctionState?.timer);

  useEffect(() => {
    if (!auctionState) return;
    if (prevStatusRef.current !== 'sold' && auctionState.status === 'sold') {
      playSoldSound();
      setShowSoldBanner(true);
      setTimeout(() => setShowSoldBanner(false), 5000);
    }
    if (prevStatusRef.current !== 'unsold' && auctionState.status === 'unsold') {
      playUnsoldSound();
      setShowUnsoldBanner(true);
      setTimeout(() => setShowUnsoldBanner(false), 4000);
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

  const currentBids = auctionState?.current_player
    ? bids.filter(b => b.player_id === auctionState.current_player).slice(0, 5)
    : [];

  if (!auctionState || auctionState.status === 'idle' || !currentPlayer) {
    return (
      <div className="broadcast-bg flex items-center justify-center">
        <div className="text-center animate-float">
          <span className="text-8xl block mb-6">🏏</span>
          <h1 className="text-6xl font-black mb-4 gradient-text">Premier League</h1>
          <h2 className="text-4xl font-bold mb-6">Auction 2026</h2>
          <div className="animate-pulse">
            <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>
              Auction will begin shortly...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="broadcast-bg relative overflow-hidden">
      {/* SOLD Banner */}
      {showSoldBanner && highestBidderTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="text-center">
            <div className="animate-sold-stamp mb-8">
              <div className="inline-block px-16 py-6 rounded-xl border-4" style={{ borderColor: 'var(--color-sold)', color: 'var(--color-sold)' }}>
                <span className="text-8xl md:text-9xl font-black tracking-wider">SOLD!</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{currentPlayer.name}</h2>
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src={highestBidderTeam.team_logo} alt="" className="w-16 h-16 rounded-full" style={{ border: '3px solid var(--color-primary)' }} />
              <span className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {highestBidderTeam.team_name}
              </span>
            </div>
            <div className="text-6xl md:text-7xl font-black gradient-text">
              ₹{auctionState.current_bid} Lakhs
            </div>
          </div>
        </div>
      )}

      {/* UNSOLD Banner */}
      {showUnsoldBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="text-center animate-fade-in">
            <div className="inline-block px-16 py-6 rounded-xl border-4 mb-6" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              <span className="text-7xl font-black tracking-wider">UNSOLD</span>
            </div>
            <h2 className="text-4xl font-bold" style={{ color: 'var(--color-text-muted)' }}>{currentPlayer.name}</h2>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="px-6 py-3 flex items-center justify-between" style={{
        background: 'linear-gradient(90deg, rgba(255,122,0,0.15), transparent, rgba(255,122,0,0.15))',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏏</span>
          <span className="text-xl font-bold gradient-text">Premier League Auction 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${auctionState.status === 'active' ? 'animate-pulse' : ''}`}
            style={{ background: auctionState.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)' }} />
          <span className="text-sm font-bold uppercase" style={{
            color: auctionState.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)',
          }}>
            {auctionState.status === 'active' ? 'LIVE' : auctionState.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-12 gap-6" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Player Card - Left */}
        <div className="col-span-4 flex flex-col">
          <div className="glass-card glow-border p-6 flex flex-col items-center flex-1">
            <div className="relative mb-4">
              <img
                src={currentPlayer.image_url}
                alt={currentPlayer.name}
                className="w-48 h-48 rounded-2xl object-cover"
                style={{ border: '3px solid var(--color-primary)', boxShadow: '0 0 30px rgba(255,122,0,0.2)' }}
              />
              <span
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap"
                style={{ background: getRoleColor(currentPlayer.role), color: '#000' }}
              >
                {getRoleIcon(currentPlayer.role)} {currentPlayer.role}
              </span>
              {currentPlayer.star && (
                <span className="absolute -top-2 -right-2 text-2xl">⭐</span>
              )}
            </div>

            <h2 className="text-3xl font-black text-center mt-2">
              {currentPlayer.name}
              {currentPlayer.star && <span className="ml-2 text-sm rounded-full px-2 py-0.5" style={{ background: 'rgba(255,214,0,0.2)', color: 'var(--color-warning)' }}>★ STAR</span>}
            </h2>
            <p className="text-lg mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {getCountryFlag(currentPlayer.country)} {currentPlayer.country}
            </p>

            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <BroadcastStat label="Bat Avg" value={currentPlayer.stats.batting_average.toFixed(1)} />
              <BroadcastStat label="Strike Rate" value={currentPlayer.stats.strike_rate.toFixed(1)} />
              <BroadcastStat label="Bowl Avg" value={currentPlayer.stats.bowling_average.toFixed(1)} />
              <BroadcastStat label="Economy" value={currentPlayer.stats.economy_rate.toFixed(2)} />
              <BroadcastStat label="Matches" value={currentPlayer.stats.matches_played.toString()} />
              <BroadcastStat label="Form" value={currentPlayer.stats.recent_form} />
            </div>

            <div className="mt-auto pt-4 text-center">
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Base Price</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {formatCurrency(currentPlayer.base_price)}
              </p>
            </div>
          </div>
        </div>

        {/* Bid Area - Center */}
        <div className="col-span-4 flex flex-col items-center justify-center">
          <AuctionTimer timer={auctionState.timer} isActive={auctionState.status === 'active'} size="lg" />

          <div className="text-center mt-6">
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>CURRENT BID</p>
            <div className="text-6xl md:text-7xl font-black gradient-text animate-bid-flash" key={auctionState.current_bid}>
              ₹{auctionState.current_bid}L
            </div>
          </div>

          {highestBidderTeam && (
            <div className="mt-6 glass-card glow-border px-8 py-4 flex items-center gap-4 animate-slide-in-up">
              <img src={highestBidderTeam.team_logo} alt="" className="w-14 h-14 rounded-full" style={{ border: '2px solid var(--color-primary)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>HIGHEST BIDDER</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {highestBidderTeam.team_name}
                </p>
              </div>
            </div>
          )}

          {currentBids.length > 0 && (
            <div className="w-full mt-6 space-y-1.5">
              {currentBids.map((bid, i) => (
                <div
                  key={bid.id}
                  className={`flex justify-between px-4 py-2 rounded-lg text-sm ${i === 0 ? 'animate-slide-in-right' : ''}`}
                  style={{
                    background: i === 0 ? 'rgba(255,122,0,0.15)' : 'rgba(26,26,26,0.5)',
                    border: i === 0 ? '1px solid rgba(255,122,0,0.3)' : 'none',
                    opacity: 1 - i * 0.15,
                  }}
                >
                  <span style={{ color: i === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {bid.team_name}
                  </span>
                  <span className="font-bold">₹{bid.bid_amount}L</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Purses - Right */}
        <div className="col-span-4 flex flex-col">
          <div className="glass-card p-4 flex-1">
            <h3 className="text-sm font-bold mb-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
              TEAM PURSES
            </h3>
            <div className="space-y-3">
              {teams.map(team => {
                const pct = (team.purse_remaining / team.total_purse) * 100;
                const isHighest = auctionState.highest_bidder === team.id;
                return (
                  <div
                    key={team.id}
                    className={`p-3 rounded-xl transition-all ${isHighest ? 'animate-pulse-glow' : ''}`}
                    style={{
                      background: isHighest ? 'rgba(255,122,0,0.1)' : 'var(--color-bg)',
                      border: `1px solid ${isHighest ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={team.team_logo} alt="" className="w-8 h-8 rounded-full" style={{ border: '1px solid var(--color-border)' }} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{team.team_name}</span>
                          <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                            {formatCurrency(team.purse_remaining)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                          <span>{team.players_bought.length} players</span>
                          <span>Spent: {formatCurrency(team.total_spent)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{
                        width: `${pct}%`,
                        background: pct > 50 ? 'var(--color-success)' : pct > 25 ? 'var(--color-warning)' : 'var(--color-danger)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="ticker-bar py-2 px-4">
        <div className="ticker-content">
          <div className="flex gap-12 whitespace-nowrap text-sm font-medium" style={{ color: '#000' }}>
            {teams.map(t => (
              <span key={t.id}>🏏 {t.team_name}: {t.players_bought.length} players • {formatCurrency(t.purse_remaining)} remaining</span>
            ))}
            {teams.map(t => (
              <span key={`dup-${t.id}`}>🏏 {t.team_name}: {t.players_bought.length} players • {formatCurrency(t.purse_remaining)} remaining</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BroadcastStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg text-center" style={{ background: 'var(--color-bg)' }}>
      <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
