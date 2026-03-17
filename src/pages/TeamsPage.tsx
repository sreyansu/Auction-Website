import { useAuction } from '../contexts/AuctionContext';
import TeamCard from '../components/cards/TeamCard';

export default function TeamsPage() {
  const { teams, players } = useAuction();

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Team Dashboard</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {teams.length} teams competing • Total purse: ₹{teams.length * 100}Cr
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map(team => (
            <TeamCard key={team.id} team={team} players={players} />
          ))}
        </div>
      </div>
    </div>
  );
}
