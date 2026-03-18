export interface PlayerStats {
  batting_average: number;
  strike_rate: number;
  bowling_average: number;
  economy_rate: number;
  matches_played: number;
  recent_form: string;
}

export interface Player {
  id: string;
  name: string;
  image_url: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
  country: string;
  base_price: number;
  star: boolean;
  stats: PlayerStats;
  sold: boolean;
  sold_to?: string;
  sold_price?: number;
}

export interface Team {
  id: string;
  team_name: string;
  team_logo: string;
  owner_name: string;
  purse_remaining: number;
  total_purse: number;
  players_bought: string[];
  total_spent: number;
}

export type AuctionStatus = 'idle' | 'active' | 'paused' | 'sold' | 'unsold' | 'completed';

export interface AuctionState {
  id: string;
  current_player: string;
  current_bid: number;
  highest_bidder: string;
  highest_bidder_name: string;
  status: AuctionStatus;
  timer: number;
  bid_increment: number;
}

export interface Bid {
  id: string;
  player_id: string;
  team_id: string;
  team_name: string;
  bid_amount: number;
  timestamp: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

export interface League {
  id: string;
  name: string;
  owner_uid: string;
  created_at: number;
}
