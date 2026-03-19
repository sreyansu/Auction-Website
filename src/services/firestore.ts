import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  addDoc,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Player, Team, AuctionState, AuctionStatus, League } from '../types';

// ===== League Operations =====
export const createLeague = async (name: string, ownerUid: string): Promise<string> => {
  const leagueRef = await addDoc(collection(db, 'leagues'), {
    name,
    owner_uid: ownerUid,
    created_at: Date.now()
  });
  return leagueRef.id;
};

export const getLeaguesByOwner = async (ownerUid: string): Promise<League[]> => {
  const q = query(collection(db, 'leagues'), where('owner_uid', '==', ownerUid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as League));
};

export const fetchLeague = async (leagueId: string): Promise<League | null> => {
  const snap = await getDoc(doc(db, 'leagues', leagueId));
  if (snap.exists()) return { id: snap.id, ...snap.data() } as League;
  return null;
};

// ===== Player Operations =====
export const seedPlayers = async (leagueId: string, players: Omit<Player, 'id'>[]) => {
  const batch = writeBatch(db);
  players.forEach((player, index) => {
    const ref = doc(collection(db, 'leagues', leagueId, 'players'), `player_${index + 1}`);
    batch.set(ref, player);
  });
  await batch.commit();
};

// ===== Team Operations =====
export const seedTeams = async (leagueId: string, teams: Omit<Team, 'id'>[]) => {
  const batch = writeBatch(db);
  teams.forEach((team, index) => {
    const ref = doc(collection(db, 'leagues', leagueId, 'teams'), `team_${index + 1}`);
    batch.set(ref, team);
  });
  await batch.commit();
};

// ===== Auction Operations =====
export const initializeAuction = async (leagueId: string) => {
  const defaultState: Omit<AuctionState, 'id'> = {
    current_player: '',
    current_bid: 0,
    highest_bidder: '',
    highest_bidder_name: '',
    status: 'idle',
    timer: 30,
    bid_increment: 10,
  };
  await setDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), defaultState);
};

export const startAuction = async (leagueId: string, playerId: string, basePrice: number) => {
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), {
    current_player: playerId,
    current_bid: basePrice,
    highest_bidder: '',
    highest_bidder_name: '',
    status: 'active' as AuctionStatus,
    timer: 30,
  });
};

export const pauseAuction = async (leagueId: string) => {
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), {
    status: 'paused' as AuctionStatus,
  });
};

export const resumeAuction = async (leagueId: string) => {
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), {
    status: 'active' as AuctionStatus,
  });
};

export const updateAuctionTimer = async (leagueId: string, timer: number) => {
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), { timer });
};

export const updateAuctionStatus = async (leagueId: string, status: AuctionStatus) => {
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), { status });
};

export const placeBid = async (
  leagueId: string,
  playerId: string,
  teamId: string,
  teamName: string,
  bidAmount: number
) => {
  // Update auction state
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), {
    current_bid: bidAmount,
    highest_bidder: teamId,
    highest_bidder_name: teamName,
    timer: 15, // Reset timer on new bid
  });

  // Record the bid
  await addDoc(collection(db, 'leagues', leagueId, 'bids'), {
    player_id: playerId,
    team_id: teamId,
    team_name: teamName,
    bid_amount: bidAmount,
    timestamp: Date.now(),
  });
};

export const markPlayerSold = async (
  leagueId: string,
  playerId: string,
  teamId: string,
  soldPrice: number
) => {
  // Update player
  await updateDoc(doc(db, 'leagues', leagueId, 'players', playerId), {
    sold: true,
    sold_to: teamId,
    sold_price: soldPrice,
  });

  // Update team purse and player list
  const teamDocRef = doc(db, 'leagues', leagueId, 'teams', teamId);
  const teamDocSnap = await getDoc(teamDocRef);
  if (teamDocSnap.exists()) {
    const teamData = teamDocSnap.data() as Team;
    const currentBought = teamData.players_bought || [];
    await updateDoc(teamDocRef, {
      purse_remaining: (teamData.purse_remaining || 0) - soldPrice,
      total_spent: (teamData.total_spent || 0) + soldPrice,
      players_bought: [...currentBought, playerId],
    });
  }

  // Update auction state
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), {
    status: 'sold' as AuctionStatus,
  });
};

export const markPlayerUnsold = async (leagueId: string, playerId: string) => {
  await updateDoc(doc(db, 'leagues', leagueId, 'players', playerId), {
    sold: false,
    sold_to: '',
    sold_price: 0,
  });

  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), {
    status: 'unsold' as AuctionStatus,
  });
};

export const resetAuction = async (leagueId: string) => {
  // Reset auction state
  await initializeAuction(leagueId);

  // Reset all players
  const playersSnapshot = await getDocs(collection(db, 'leagues', leagueId, 'players'));
  const batch = writeBatch(db);
  playersSnapshot.docs.forEach(playerDoc => {
    batch.update(playerDoc.ref, {
      sold: false,
      sold_to: '',
      sold_price: 0,
    });
  });

  // Reset all teams
  const teamsSnapshot = await getDocs(collection(db, 'leagues', leagueId, 'teams'));
  teamsSnapshot.docs.forEach(teamDoc => {
    const data = teamDoc.data();
    batch.update(teamDoc.ref, {
      purse_remaining: data.total_purse || 10000,
      total_spent: 0,
      players_bought: [],
    });
  });

  await batch.commit();

  // Clear bids
  const bidsSnapshot = await getDocs(collection(db, 'leagues', leagueId, 'bids'));
  const bidBatch = writeBatch(db);
  bidsSnapshot.docs.forEach(bidDoc => {
    bidBatch.delete(bidDoc.ref);
  });
  await bidBatch.commit();
};

export const setBidIncrement = async (leagueId: string, increment: number) => {
  await updateDoc(doc(db, 'leagues', leagueId, 'auction', 'current'), {
    bid_increment: increment,
  });
};
