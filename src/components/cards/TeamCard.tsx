import type { Team, Player } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import TeamLogo from '../common/TeamLogo';

interface TeamCardProps {
  team: Team;
  players: Player[];
  onClick?: () => void;
}

export default function TeamCard({ team, players, onClick }: TeamCardProps) {
  const boughtPlayers = players.filter(p => team.players_bought.includes(p.id));
  const pursePercent = (team.purse_remaining / team.total_purse) * 100;

  return (
    <div className="glass-card p-5 transition-all hover:scale-[1.02] cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3 mb-4">
        <TeamLogo src={team.team_logo} name={team.team_name} size="lg" />
        <div>
          <h3 className="text-lg font-bold">{team.team_name}</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Owner: {team.owner_name}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>Purse Remaining</span>
          <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
            {formatCurrency(team.purse_remaining)}
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pursePercent}%`,
              background: pursePercent > 50
                ? 'var(--color-success)'
                : pursePercent > 25
                  ? 'var(--color-warning)'
                  : 'var(--color-danger)',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
            {team.players_bought.length}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Players</div>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--color-danger)' }}>
            {formatCurrency(team.total_spent)}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Spent</div>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
            {formatCurrency(team.purse_remaining)}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Left</div>
        </div>
      </div>

      {boughtPlayers.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
            SQUAD ({boughtPlayers.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {boughtPlayers.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                <img src={p.image_url} alt="" className="w-5 h-5 rounded-full" />
                <span className="truncate max-w-[80px]">{p.name.split(' ')[0]}</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(p.sold_price || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
