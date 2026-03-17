import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Player, Team, AuctionState, AuctionStatus } from '../types';

// ===== Player Operations =====
export const seedPlayers = async (players: Omit<Player, 'id'>[]) => {
  const batch = writeBatch(db);
  players.forEach((player, index) => {
    const ref = doc(collection(db, 'players'), `player_${index + 1}`);
    batch.set(ref, player);
  });
  await batch.commit();
};

// ===== Team Operations =====
export const seedTeams = async (teams: Omit<Team, 'id'>[]) => {
  const batch = writeBatch(db);
  teams.forEach((team, index) => {
    const ref = doc(collection(db, 'teams'), `team_${index + 1}`);
    batch.set(ref, team);
  });
  await batch.commit();
};

// ===== Auction Operations =====
export const initializeAuction = async () => {
  const defaultState: Omit<AuctionState, 'id'> = {
    current_player: '',
    current_bid: 0,
    highest_bidder: '',
    highest_bidder_name: '',
    status: 'idle',
    timer: 30,
    bid_increment: 10,
  };
  await setDoc(doc(db, 'auction', 'current'), defaultState);
};

export const startAuction = async (playerId: string, basePrice: number) => {
  await updateDoc(doc(db, 'auction', 'current'), {
    current_player: playerId,
    current_bid: basePrice,
    highest_bidder: '',
    highest_bidder_name: '',
    status: 'active' as AuctionStatus,
    timer: 30,
  });
};

export const pauseAuction = async () => {
  await updateDoc(doc(db, 'auction', 'current'), {
    status: 'paused' as AuctionStatus,
  });
};

export const resumeAuction = async () => {
  await updateDoc(doc(db, 'auction', 'current'), {
    status: 'active' as AuctionStatus,
  });
};

export const updateAuctionTimer = async (timer: number) => {
  await updateDoc(doc(db, 'auction', 'current'), { timer });
};

export const updateAuctionStatus = async (status: AuctionStatus) => {
  await updateDoc(doc(db, 'auction', 'current'), { status });
};

export const placeBid = async (
  playerId: string,
  teamId: string,
  teamName: string,
  bidAmount: number
) => {
  // Update auction state
  await updateDoc(doc(db, 'auction', 'current'), {
    current_bid: bidAmount,
    highest_bidder: teamId,
    highest_bidder_name: teamName,
    timer: 15, // Reset timer on new bid
  });

  // Record the bid
  await addDoc(collection(db, 'bids'), {
    player_id: playerId,
    team_id: teamId,
    team_name: teamName,
    bid_amount: bidAmount,
    timestamp: Date.now(),
  });
};

export const markPlayerSold = async (
  playerId: string,
  teamId: string,
  soldPrice: number
) => {
  // Update player
  await updateDoc(doc(db, 'players', playerId), {
    sold: true,
    sold_to: teamId,
    sold_price: soldPrice,
  });

  // Update team purse and player list
  const teamDocRef = doc(db, 'teams', teamId);
  const teamDocSnap = await getDoc(teamDocRef);
  if (teamDocSnap.exists()) {
    const teamData = teamDocSnap.data() as Team;
    const currentBought = teamData.players_bought || [];
    await updateDoc(teamDocRef, {
      purse_remaining: teamData.purse_remaining - soldPrice,
      total_spent: teamData.total_spent + soldPrice,
      players_bought: [...currentBought, playerId],
    });
  }

  // Update auction state
  await updateDoc(doc(db, 'auction', 'current'), {
    status: 'sold' as AuctionStatus,
  });
};

export const markPlayerUnsold = async (playerId: string) => {
  await updateDoc(doc(db, 'players', playerId), {
    sold: false,
    sold_to: '',
    sold_price: 0,
  });

  await updateDoc(doc(db, 'auction', 'current'), {
    status: 'unsold' as AuctionStatus,
  });
};

export const resetAuction = async () => {
  // Reset auction state
  await initializeAuction();

  // Reset all players
  const playersSnapshot = await getDocs(collection(db, 'players'));
  const batch = writeBatch(db);
  playersSnapshot.docs.forEach(playerDoc => {
    batch.update(playerDoc.ref, {
      sold: false,
      sold_to: '',
      sold_price: 0,
    });
  });

  // Reset all teams
  const teamsSnapshot = await getDocs(collection(db, 'teams'));
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
  const bidsSnapshot = await getDocs(collection(db, 'bids'));
  const bidBatch = writeBatch(db);
  bidsSnapshot.docs.forEach(bidDoc => {
    bidBatch.delete(bidDoc.ref);
  });
  await bidBatch.commit();
};

export const setBidIncrement = async (increment: number) => {
  await updateDoc(doc(db, 'auction', 'current'), {
    bid_increment: increment,
  });
};
