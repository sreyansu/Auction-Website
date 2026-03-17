import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Player, Team, AuctionState, Bid } from '../types';

interface AuctionContextType {
  players: Player[];
  teams: Team[];
  auctionState: AuctionState | null;
  bids: Bid[];
  currentPlayer: Player | null;
  highestBidderTeam: Team | null;
  loading: boolean;
}

const AuctionContext = createContext<AuctionContextType>({} as AuctionContextType);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playersUnsub = onSnapshot(
      query(collection(db, 'players'), orderBy('name')),
      (snapshot) => {
        const playerData = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as Player[];
        setPlayers(playerData);
        setLoading(false);
      }
    );

    const teamsUnsub = onSnapshot(
      query(collection(db, 'teams')),
      (snapshot) => {
        const teamData = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as Team[];
        setTeams(teamData);
      }
    );

    const auctionUnsub = onSnapshot(
      doc(db, 'auction', 'current'),
      (snapshot) => {
        if (snapshot.exists()) {
          setAuctionState({ id: snapshot.id, ...snapshot.data() } as AuctionState);
        }
      }
    );

    const bidsUnsub = onSnapshot(
      query(collection(db, 'bids'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const bidData = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as Bid[];
        setBids(bidData);
      }
    );

    return () => {
      playersUnsub();
      teamsUnsub();
      auctionUnsub();
      bidsUnsub();
    };
  }, []);

  const currentPlayer = auctionState?.current_player
    ? players.find(p => p.id === auctionState.current_player) || null
    : null;

  const highestBidderTeam = auctionState?.highest_bidder
    ? teams.find(t => t.id === auctionState.highest_bidder) || null
    : null;

  return (
    <AuctionContext.Provider value={{
      players, teams, auctionState, bids,
      currentPlayer, highestBidderTeam, loading
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export const useAuction = () => useContext(AuctionContext);
