import type { Player } from '../../types';
import { formatCurrency, getRoleColor, getRoleIcon, getCountryFlag, getStatRating } from '../../utils/helpers';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  compact?: boolean;
  showStats?: boolean;
}

export default function PlayerCard({ player, onClick, compact = false, showStats = true }: PlayerCardProps) {
  return (
    <div
      className={`glass-card overflow-hidden transition-all cursor-pointer hover:scale-[1.02] ${
        player.sold ? 'opacity-70' : ''
      } ${compact ? 'p-3' : 'p-4'}`}
      onClick={onClick}
      style={{
        borderColor: player.sold ? 'var(--color-sold)' : 'var(--color-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <img
            src={player.image_url}
            alt={player.name}
            className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg object-cover`}
          />
          {player.sold && (
            <div className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'var(--color-sold)', color: '#000' }}>
              SOLD
            </div>
          )}
          {player.star && !player.sold && (
            <div className="absolute -top-1 -left-1 text-xs">⭐</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {player.name}
            {player.star && <span className="ml-1 text-xs" style={{ color: 'var(--color-warning)' }}>★</span>}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${getRoleColor(player.role)}22`, color: getRoleColor(player.role) }}
            >
              {getRoleIcon(player.role)} {player.role}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>{getCountryFlag(player.country)} {player.country}</span>
            <span>•</span>
            <span>{player.stats.matches_played} matches</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`} style={{ color: 'var(--color-primary)' }}>
            {player.sold_price ? formatCurrency(player.sold_price) : formatCurrency(player.base_price)}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {player.sold_price ? 'Sold' : 'Base'}
          </div>
        </div>
      </div>

      {showStats && !compact && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatItem label="Bat Avg" value={player.stats.batting_average} max={60} />
          <StatItem label="SR" value={player.stats.strike_rate} max={200} />
          <StatItem label="Bowl Avg" value={player.stats.bowling_average} max={50} invert />
          <StatItem label="Econ" value={player.stats.economy_rate} max={12} invert />
        </div>
      )}

      {showStats && !compact && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Form</span>
          <span className="text-sm">{player.stats.recent_form}</span>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, max, invert }: { label: string; value: number; max: number; invert?: boolean }) {
  const pct = getStatRating(value, max);
  const displayPct = invert ? 100 - pct : pct;

  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span style={{ color: 'var(--color-text-dim)' }}>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${displayPct}%` }} />
      </div>
    </div>
  );
}
