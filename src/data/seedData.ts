import type { Player, Team } from '../types';

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Batsman': return 'ff7a00';
    case 'Bowler': return '00b0ff';
    case 'All-rounder': return '00c853';
    case 'Wicketkeeper': return 'ffd600';
    default: return 'ffffff';
  }
};

const generateStats = (role: string, isStar: boolean) => {
  const base = isStar ? 1.3 : 1.0;
  let batting_average = 0, strike_rate = 0, bowling_average = 0, economy_rate = 0;
  const matches = isStar ? 100 + Math.floor(Math.random() * 150) : 30 + Math.floor(Math.random() * 80);

  switch (role) {
    case 'Batsman':
      batting_average = (30 + Math.random() * 25) * base;
      strike_rate = (120 + Math.random() * 60) * base;
      bowling_average = 45 + Math.random() * 25;
      economy_rate = 8 + Math.random() * 4;
      break;
    case 'Bowler':
      batting_average = 12 + Math.random() * 18;
      strike_rate = 95 + Math.random() * 40;
      bowling_average = (18 + Math.random() * 15) / base;
      economy_rate = (5 + Math.random() * 3) / base;
      break;
    case 'All-rounder':
      batting_average = (25 + Math.random() * 20) * base;
      strike_rate = (125 + Math.random() * 50) * base;
      bowling_average = (22 + Math.random() * 14) / base;
      economy_rate = (5.5 + Math.random() * 3) / base;
      break;
    case 'Wicketkeeper':
      batting_average = (28 + Math.random() * 22) * base;
      strike_rate = (125 + Math.random() * 55) * base;
      bowling_average = 55 + Math.random() * 20;
      economy_rate = 9 + Math.random() * 3;
      break;
  }

  const forms = isStar
    ? ['★★★★★', '★★★★☆', '★★★★★']
    : ['★★★★☆', '★★★☆☆', '★★★★★', '★★☆☆☆'];

  return {
    batting_average: parseFloat(Math.min(batting_average, 65).toFixed(1)),
    strike_rate: parseFloat(Math.min(strike_rate, 220).toFixed(1)),
    bowling_average: parseFloat(Math.max(bowling_average, 15).toFixed(1)),
    economy_rate: parseFloat(Math.max(economy_rate, 4).toFixed(2)),
    matches_played: matches,
    recent_form: forms[Math.floor(Math.random() * forms.length)],
  };
};

const makePlayer = (data: { name: string; role: string; country: string; base_price: number; star: boolean }): Omit<Player, 'id'> => {
  const names = data.name.split(' ');
  return {
    name: data.name,
    image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(names[0] + '+' + (names[1] || ''))}&background=${getRoleColor(data.role)}&color=fff&size=200&bold=true&font-size=0.4`,
    role: data.role as Player['role'],
    country: data.country,
    base_price: data.base_price,
    star: data.star,
    stats: generateStats(data.role, data.star),
    sold: false,
    sold_to: '',
    sold_price: 0,
  };
};

// ===== STAR PLAYERS (₹200L Base) =====
const starPlayersRaw = [
  { name: "Virat Kohli", role: "Batsman", country: "India", base_price: 200, star: true },
  { name: "Rohit Sharma", role: "Batsman", country: "India", base_price: 200, star: true },
  { name: "Jasprit Bumrah", role: "Bowler", country: "India", base_price: 200, star: true },
  { name: "Hardik Pandya", role: "All-rounder", country: "India", base_price: 200, star: true },
  { name: "Ravindra Jadeja", role: "All-rounder", country: "India", base_price: 200, star: true },
  { name: "KL Rahul", role: "Wicketkeeper", country: "India", base_price: 200, star: true },
  { name: "Shubman Gill", role: "Batsman", country: "India", base_price: 200, star: true },
  { name: "Jos Buttler", role: "Wicketkeeper", country: "England", base_price: 200, star: true },
  { name: "Ben Stokes", role: "All-rounder", country: "England", base_price: 200, star: true },
  { name: "David Warner", role: "Batsman", country: "Australia", base_price: 200, star: true },
  { name: "Steve Smith", role: "Batsman", country: "Australia", base_price: 200, star: true },
  { name: "Glenn Maxwell", role: "All-rounder", country: "Australia", base_price: 200, star: true },
  { name: "Pat Cummins", role: "Bowler", country: "Australia", base_price: 200, star: true },
  { name: "Mitchell Starc", role: "Bowler", country: "Australia", base_price: 200, star: true },
  { name: "Kane Williamson", role: "Batsman", country: "New Zealand", base_price: 200, star: true },
  { name: "Trent Boult", role: "Bowler", country: "New Zealand", base_price: 200, star: true },
  { name: "Babar Azam", role: "Batsman", country: "Pakistan", base_price: 200, star: true },
  { name: "Shaheen Afridi", role: "Bowler", country: "Pakistan", base_price: 200, star: true },
  { name: "Shakib Al Hasan", role: "All-rounder", country: "Bangladesh", base_price: 200, star: true },
  { name: "Rashid Khan", role: "Bowler", country: "Afghanistan", base_price: 200, star: true },
];

// ===== NORMAL PLAYERS (₹50L Base) =====
const normalPlayersRaw = [
  { name: "Ishan Kishan", role: "Wicketkeeper", country: "India", base_price: 50, star: false },
  { name: "Sanju Samson", role: "Wicketkeeper", country: "India", base_price: 50, star: false },
  { name: "Ruturaj Gaikwad", role: "Batsman", country: "India", base_price: 50, star: false },
  { name: "Shreyas Iyer", role: "Batsman", country: "India", base_price: 50, star: false },
  { name: "Rinku Singh", role: "Batsman", country: "India", base_price: 50, star: false },
  { name: "Tilak Varma", role: "Batsman", country: "India", base_price: 50, star: false },
  { name: "Rahul Tripathi", role: "Batsman", country: "India", base_price: 50, star: false },
  { name: "Deepak Hooda", role: "All-rounder", country: "India", base_price: 50, star: false },
  { name: "Washington Sundar", role: "All-rounder", country: "India", base_price: 50, star: false },
  { name: "Axar Patel", role: "All-rounder", country: "India", base_price: 50, star: false },
  { name: "Mohammed Siraj", role: "Bowler", country: "India", base_price: 50, star: false },
  { name: "Arshdeep Singh", role: "Bowler", country: "India", base_price: 50, star: false },
  { name: "Prasidh Krishna", role: "Bowler", country: "India", base_price: 50, star: false },
  { name: "Avesh Khan", role: "Bowler", country: "India", base_price: 50, star: false },
  { name: "Umran Malik", role: "Bowler", country: "India", base_price: 50, star: false },
  { name: "Nicholas Pooran", role: "Wicketkeeper", country: "West Indies", base_price: 50, star: false },
  { name: "Shimron Hetmyer", role: "Batsman", country: "West Indies", base_price: 50, star: false },
  { name: "Andre Russell", role: "All-rounder", country: "West Indies", base_price: 50, star: false },
  { name: "Sunil Narine", role: "All-rounder", country: "West Indies", base_price: 50, star: false },
  { name: "Jason Holder", role: "All-rounder", country: "West Indies", base_price: 50, star: false },
  { name: "Liam Livingstone", role: "All-rounder", country: "England", base_price: 50, star: false },
  { name: "Sam Curran", role: "All-rounder", country: "England", base_price: 50, star: false },
  { name: "Jofra Archer", role: "Bowler", country: "England", base_price: 50, star: false },
  { name: "Adam Zampa", role: "Bowler", country: "Australia", base_price: 50, star: false },
  { name: "Josh Hazlewood", role: "Bowler", country: "Australia", base_price: 50, star: false },
  { name: "Tim Southee", role: "Bowler", country: "New Zealand", base_price: 50, star: false },
  { name: "Mitchell Santner", role: "All-rounder", country: "New Zealand", base_price: 50, star: false },
  { name: "Faf du Plessis", role: "Batsman", country: "South Africa", base_price: 50, star: false },
  { name: "Quinton de Kock", role: "Wicketkeeper", country: "South Africa", base_price: 50, star: false },
  { name: "Kagiso Rabada", role: "Bowler", country: "South Africa", base_price: 50, star: false },
];

export const generatePlayers = (): Omit<Player, 'id'>[] => {
  return [
    ...starPlayersRaw.map(p => makePlayer(p)),
    ...normalPlayersRaw.map(p => makePlayer(p)),
  ];
};

export const generateTeams = (): Omit<Team, 'id'>[] => {
  return [
    {
      team_name: "Hungry Appetites",
      team_logo: "https://ui-avatars.com/api/?name=HA&background=000000&color=ff7a00&size=200&bold=true",
      owner_name: "Owner 1",
      purse_remaining: 12500,
      total_purse: 12500,
      players_bought: [],
      total_spent: 0,
    },
    {
      team_name: "Royal Strikers",
      team_logo: "https://ui-avatars.com/api/?name=RS&background=000000&color=ff7a00&size=200&bold=true",
      owner_name: "Owner 2",
      purse_remaining: 12500,
      total_purse: 12500,
      players_bought: [],
      total_spent: 0,
    },
    {
      team_name: "Phoenix Warriors",
      team_logo: "https://ui-avatars.com/api/?name=PW&background=000000&color=ff7a00&size=200&bold=true",
      owner_name: "Owner 3",
      purse_remaining: 12500,
      total_purse: 12500,
      players_bought: [],
      total_spent: 0,
    },
    {
      team_name: "Thunder Titans",
      team_logo: "https://ui-avatars.com/api/?name=TT&background=000000&color=ff7a00&size=200&bold=true",
      owner_name: "Owner 4",
      purse_remaining: 12500,
      total_purse: 12500,
      players_bought: [],
      total_spent: 0,
    },
  ];
};
