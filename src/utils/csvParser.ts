import Papa from 'papaparse';
import type { Player, Team } from '../types';

export const PLAYERS_CSV_HEADERS = [
  'Name', 'Role', 'Country', 'Base Price (Lakhs)', 'Image URL', 
  'Is Star', 'Matches Played', 'Batting Avg', 'Strike Rate', 
  'Bowling Avg', 'Economy Rate', 'Recent Form'
];

export const TEAMS_CSV_HEADERS = [
  'Team Name', 'Owner Name', 'Logo URL', 'Total Purse (Lakhs)'
];

export const downloadSamplePlayersCSV = () => {
  const sampleData = [
    PLAYERS_CSV_HEADERS,
    ['Virat Kohli', 'Batsman', 'India', '200', 'https://example.com/virat.jpg', 'Yes', '250', '50.5', '135.2', '0', '0', 'Excellent'],
    ['Jasprit Bumrah', 'Bowler', 'India', '200', 'https://example.com/bumrah.jpg', 'Yes', '130', '0', '0', '21.5', '6.8', 'Peak']
  ];
  
  const csv = Papa.unparse(sampleData);
  downloadFile('players_template.csv', csv);
};

export const downloadSampleTeamsCSV = () => {
  const sampleData = [
    TEAMS_CSV_HEADERS,
    ['Mumbai Indians', 'Reliance', 'https://example.com/mi.png', '10000'],
    ['Chennai Super Kings', 'India Cements', 'https://example.com/csk.png', '10000']
  ];
  
  const csv = Papa.unparse(sampleData);
  downloadFile('teams_template.csv', csv);
};

const downloadFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parsePlayersCSV = (file: File): Promise<Omit<Player, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const players: Omit<Player, 'id'>[] = results.data.map((row: any) => {
            // Validate required fields
            if (!row['Name'] || !row['Role'] || !row['Country'] || !row['Base Price (Lakhs)']) {
              throw new Error(`Missing required fields for player: ${row['Name'] || 'Unknown'}`);
            }

            return {
              name: row['Name'],
              role: row['Role'] as Player['role'],
              country: row['Country'],
              base_price: parseFloat(row['Base Price (Lakhs)']),
              image_url: row['Image URL'] || `https://ui-avatars.com/api/?name=${encodeURIComponent(row['Name'])}&background=random`,
              star: row['Is Star']?.toLowerCase() === 'yes' || row['Is Star'] === 'true',
              sold: false,
              stats: {
                matches_played: parseInt(row['Matches Played']) || 0,
                batting_average: parseFloat(row['Batting Avg']) || 0,
                strike_rate: parseFloat(row['Strike Rate']) || 0,
                bowling_average: parseFloat(row['Bowling Avg']) || 0,
                economy_rate: parseFloat(row['Economy Rate']) || 0,
                recent_form: row['Recent Form'] || 'Unknown'
              }
            };
          });
          resolve(players);
        } catch (e) {
          reject(e);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const parseTeamsCSV = (file: File): Promise<Omit<Team, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const teams: Omit<Team, 'id'>[] = results.data.map((row: any) => {
            if (!row['Team Name'] || !row['Total Purse (Lakhs)']) {
              throw new Error(`Missing required fields for team: ${row['Team Name'] || 'Unknown'}`);
            }

            const totalPurse = parseFloat(row['Total Purse (Lakhs)']);

            return {
              team_name: row['Team Name'],
              owner_name: row['Owner Name'] || 'Unknown',
              team_logo: row['Logo URL'] || `https://ui-avatars.com/api/?name=${encodeURIComponent(row['Team Name'])}&background=random`,
              total_purse: totalPurse,
              purse_remaining: totalPurse,
              players_bought: [],
              total_spent: 0
            };
          });
          resolve(teams);
        } catch (e) {
          reject(e);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
