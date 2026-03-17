import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuction } from '../contexts/AuctionContext';
import { formatCurrency } from '../utils/helpers';
import TeamLogo from '../components/common/TeamLogo';
import { Gavel, Users, Shield, Monitor, TrendingUp, Zap } from 'lucide-react';

export default function HomePage() {
  const { players, teams, auctionState } = useAuction();
  const soldPlayers = players.filter(p => p.sold);
  const totalSpent = teams.reduce((sum, t) => sum + t.total_spent, 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255,122,0,0.15) 0%, transparent 60%)',
        }} />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium"
            style={{ background: 'rgba(255,122,0,0.15)', color: 'var(--color-primary)', border: '1px solid rgba(255,122,0,0.3)' }}>
            <Zap size={14} /> Live Auction Event
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="gradient-text">Premier League</span>
            <br />
            <span>Auction 2026</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            The most electrifying cricket auction experience. Watch teams battle for the best players in real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/auction" className="btn-primary text-lg px-8 py-3 flex items-center gap-2 no-underline">
              <Gavel size={20} /> Auction Room
            </Link>
            <Link to="/display" className="btn-secondary text-lg px-8 py-3 flex items-center gap-2 no-underline">
              <Monitor size={20} /> Live Display
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users size={24} />} label="Total Players" value={players.length.toString()} />
            <StatCard icon={<Shield size={24} />} label="Teams" value={teams.length.toString()} />
            <StatCard icon={<Gavel size={24} />} label="Players Sold" value={soldPlayers.length.toString()} color="var(--color-success)" />
            <StatCard icon={<TrendingUp size={24} />} label="Total Spent" value={formatCurrency(totalSpent)} color="var(--color-primary)" />
          </div>
        </div>
      </section>

      {/* Auction Status */}
      {auctionState && auctionState.status !== 'idle' && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card glow-border p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-success)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>AUCTION LIVE</span>
              </div>
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
                Current Bid: <span className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(auctionState.current_bid)}
                </span>
              </p>
              <Link to="/auction" className="btn-primary mt-4 inline-flex items-center gap-2 no-underline">
                <Gavel size={16} /> Join Auction
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Teams Preview */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Competing Teams</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teams.map(team => (
              <Link key={team.id} to="/teams" className="glass-card p-4 text-center transition-all hover:scale-105 no-underline">
                <div className="flex justify-center mb-2">
                  <TeamLogo src={team.team_logo} name={team.team_name} size="lg" />
                </div>
                <h3 className="font-bold text-sm">{team.team_name}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(team.purse_remaining)} remaining
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Sales */}
      {soldPlayers.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Recent Sales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {soldPlayers.slice(0, 6).map(player => {
                const team = teams.find(t => t.id === player.sold_to);
                return (
                  <div key={player.id} className="glass-card p-4 flex items-center gap-3">
                    <img src={player.image_url} alt="" className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{player.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {team && <img src={team.team_logo} alt="" className="w-4 h-4 rounded-full" />}
                        {team?.team_name}
                      </div>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                      {formatCurrency(player.sold_price || 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            🏏 Premier League Auction System 2026 • Built with React + Firebase
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="flex justify-center mb-2" style={{ color: color || 'var(--color-text-muted)' }}>
        {icon}
      </div>
      <div className="text-2xl font-bold" style={{ color: color || 'var(--color-text)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
    </div>
  );
}
