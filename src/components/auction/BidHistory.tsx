import { useAuction } from '../../contexts/AuctionContext';
import type { Bid } from '../../types';

interface BidHistoryProps {
  bids: Bid[];
  maxItems?: number;
}

export default function BidHistory({ bids, maxItems = 10 }: BidHistoryProps) {
  const { auctionState } = useAuction();
  const currentBids = auctionState?.current_player
    ? bids.filter(b => b.player_id === auctionState.current_player)
    : bids;

  const displayBids = currentBids.slice(0, maxItems);

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
        BID HISTORY
      </h3>
      {displayBids.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-dim)' }}>
          No bids yet
        </p>
      ) : (
        <div className="space-y-2">
          {displayBids.map((bid, i) => (
            <div
              key={bid.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                i === 0 ? 'animate-slide-in-right' : ''
              }`}
              style={{
                background: i === 0 ? 'rgba(255,122,0,0.1)' : 'var(--color-bg)',
                border: i === 0 ? '1px solid rgba(255,122,0,0.3)' : '1px solid transparent',
              }}
            >
              <div className="flex items-center gap-2">
                {i === 0 && <span className="text-xs">👑</span>}
                <span className={i === 0 ? 'font-bold' : ''} style={{ color: i === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {bid.team_name}
                </span>
              </div>
              <span className="font-bold" style={{ color: i === 0 ? 'var(--color-primary)' : 'var(--color-text)' }}>
                ₹{bid.bid_amount}L
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
