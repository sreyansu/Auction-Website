export const formatCurrency = (amount: number): string => {
  if (amount >= 100) {
    return `₹${(amount / 100).toFixed(1)}Cr`;
  }
  return `₹${amount}L`;
};

export const formatCurrencyFull = (amount: number): string => {
  return `₹${amount} Lakhs`;
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'Batsman': return '#ff7a00';
    case 'Bowler': return '#00b0ff';
    case 'All-rounder': return '#00c853';
    case 'Wicketkeeper': return '#ffd600';
    default: return '#ffffff';
  }
};

export const getRoleIcon = (role: string): string => {
  switch (role) {
    case 'Batsman': return '🏏';
    case 'Bowler': return '⚡';
    case 'All-rounder': return '🌟';
    case 'Wicketkeeper': return '🧤';
    default: return '🏏';
  }
};

export const getCountryFlag = (country: string): string => {
  const flags: Record<string, string> = {
    'India': '🇮🇳',
    'Australia': '🇦🇺',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'South Africa': '🇿🇦',
    'New Zealand': '🇳🇿',
    'West Indies': '🌴',
    'Pakistan': '🇵🇰',
    'Sri Lanka': '🇱🇰',
    'Bangladesh': '🇧🇩',
    'Afghanistan': '🇦🇫',
    'Zimbabwe': '🇿🇼',
    'Ireland': '🇮🇪',
  };
  return flags[country] || '🏳️';
};

export const getStatRating = (value: number, max: number): number => {
  return Math.min((value / max) * 100, 100);
};
