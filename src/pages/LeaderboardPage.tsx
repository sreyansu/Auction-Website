import { type ReactNode } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import { formatCurrency } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Trophy, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function LeaderboardPage() {
  const { teams, players } = useAuction();

  const sortedTeams = [...teams].sort((a, b) => b.total_spent - a.total_spent);
  const soldPlayers = players.filter(p => p.sold);
  const totalSpent = teams.reduce((s, t) => s + t.total_spent, 0);

  // Chart data
  const spendingData = sortedTeams.map(t => ({
    name: t.team_name.split(' ')[0],
    spent: t.total_spent,
    remaining: t.purse_remaining,
  }));

  const roleDistribution = [
    { name: 'Batsman', value: soldPlayers.filter(p => p.role === 'Batsman').length },
    { name: 'Bowler', value: soldPlayers.filter(p => p.role === 'Bowler').length },
    { name: 'All-rounder', value: soldPlayers.filter(p => p.role === 'All-rounder').length },
    { name: 'Wicketkeeper', value: soldPlayers.filter(p => p.role === 'Wicketkeeper').length },
  ].filter(r => r.value > 0);

  const topBuys = [...soldPlayers].sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0)).slice(0, 5);
  const ROLE_COLORS = ['#ff7a00', '#00b0ff', '#00c853', '#ffd600'];

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy size={28} style={{ color: 'var(--color-primary)' }} />
          Leaderboard
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {soldPlayers.length} players sold • Total: {formatCurrency(totalSpent)}
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <QuickStat icon={<Users size={20} />} label="Players Sold" value={soldPlayers.length.toString()} />
          <QuickStat icon={<DollarSign size={20} />} label="Total Spent" value={formatCurrency(totalSpent)} color="var(--color-primary)" />
          <QuickStat
            icon={<TrendingUp size={20} />}
            label="Highest Buy"
            value={topBuys[0] ? formatCurrency(topBuys[0].sold_price || 0) : '—'}
            color="var(--color-success)"
          />
          <QuickStat
            icon={<Trophy size={20} />}
            label="Most Players"
            value={sortedTeams.length > 0
              ? sortedTeams.reduce((max, t) => t.players_bought.length > max.players_bought.length ? t : max, sortedTeams[0]).team_name.split(' ')[0]
              : '—'
            }
            color="var(--color-warning)"
          />
        </div>

        {/* Leaderboard Table */}
        <div className="glass-card overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Team</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Players</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Spent</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Remaining</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Purse Used</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, i) => {
                  const pct = ((team.total_spent / team.total_purse) * 100).toFixed(1);
                  return (
                    <tr key={team.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-3">
                        <span className={`text-lg font-bold ${i < 3 ? 'gradient-text' : ''}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={team.team_logo} alt="" className="w-8 h-8 rounded-full" style={{ border: '1px solid var(--color-border)' }} />
                          <div>
                            <p className="font-bold text-sm">{team.team_name}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{team.owner_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{team.players_bought.length}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--color-danger)' }}>
                        {formatCurrency(team.total_spent)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(team.purse_remaining)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-medium">{pct}%</span>
                          <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                            <div className="h-full rounded-full" style={{
                              width: `${pct}%`,
                              background: 'var(--color-primary)',
                            }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Spending Chart */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>TEAM SPENDING</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingData}>
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`₹${value}L`, '']}
                />
                <Bar dataKey="spent" fill="#ff7a00" radius={[4, 4, 0, 0]} />
                <Bar dataKey="remaining" fill="#2a2a2a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>ROLE DISTRIBUTION (SOLD)</h3>
            {roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roleDistribution.map((_, i) => (
                      <Cell key={i} fill={ROLE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]" style={{ color: 'var(--color-text-dim)' }}>
                No players sold yet
              </div>
            )}
          </div>
        </div>

        {/* Top Buys */}
        {topBuys.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>TOP BUYS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {topBuys.map((player, i) => {
                const team = teams.find(t => t.id === player.sold_to);
                return (
                  <div key={player.id} className="flex items-center gap-3 p-3 rounded-xl" style={{
                    background: 'var(--color-bg)',
                    border: i === 0 ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  }}>
                    <div className="relative">
                      <img src={player.image_url} alt="" className="w-12 h-12 rounded-lg" />
                      {i === 0 && <span className="absolute -top-1 -left-1 text-sm">👑</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{player.name}</p>
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                        {team && <img src={team.team_logo} alt="" className="w-4 h-4 rounded-full" />}
                        <span className="truncate">{team?.team_name}</span>
                      </div>
                      <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                        {formatCurrency(player.sold_price || 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg" style={{ background: `${color || 'var(--color-text-muted)'}22`, color: color || 'var(--color-text-muted)' }}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold" style={{ color: color || 'var(--color-text)' }}>{value}</div>
        <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
      </div>
    </div>
  );
}
