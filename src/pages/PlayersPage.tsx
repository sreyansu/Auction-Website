import { useState, useMemo } from 'react';
import { useAuction } from '../contexts/AuctionContext';
import PlayerCard from '../components/cards/PlayerCard';
import { Search, Filter, X } from 'lucide-react';

const ROLES = ['All', 'Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];
const COUNTRIES = ['All', 'India', 'Australia', 'England', 'South Africa', 'New Zealand', 'West Indies', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'Afghanistan'];
const PRICE_RANGES = [
  { label: 'All', min: 0, max: Infinity },
  { label: '₹20L - ₹50L', min: 20, max: 50 },
  { label: '₹50L - ₹100L', min: 50, max: 100 },
  { label: '₹100L - ₹200L', min: 100, max: 200 },
  { label: '₹200L+', min: 200, max: Infinity },
];
const STATUS_FILTERS = ['All', 'Available', 'Sold'];

export default function PlayersPage() {
  const { players } = useAuction();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return players.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== 'All' && p.role !== roleFilter) return false;
      if (countryFilter !== 'All' && p.country !== countryFilter) return false;
      const range = PRICE_RANGES[priceRange];
      if (p.base_price < range.min || p.base_price > range.max) return false;
      if (statusFilter === 'Available' && p.sold) return false;
      if (statusFilter === 'Sold' && !p.sold) return false;
      return true;
    });
  }, [players, search, roleFilter, countryFilter, priceRange, statusFilter]);

  const activeFilterCount = [roleFilter !== 'All', countryFilter !== 'All', priceRange !== 0, statusFilter !== 'All'].filter(Boolean).length;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Player Pool</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length} of {players.length} players
            </p>
          </div>
          <button
            className="btn-secondary flex items-center gap-2 relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                style={{ background: 'var(--color-primary)', color: '#000' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-dim)' }} />
          <input
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-dim)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card p-4 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Role */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--color-text-muted)' }}>Role</label>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: roleFilter === r ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: roleFilter === r ? '#000' : 'var(--color-text-muted)',
                        border: `1px solid ${roleFilter === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--color-text-muted)' }}>Country</label>
                <select
                  value={countryFilter}
                  onChange={e => setCountryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--color-text-muted)' }}>Base Price</label>
                <select
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <div className="flex gap-1.5">
                  {STATUS_FILTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: statusFilter === s ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: statusFilter === s ? '#000' : 'var(--color-text-muted)',
                        border: `1px solid ${statusFilter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                className="mt-3 text-xs flex items-center gap-1"
                style={{ color: 'var(--color-primary)' }}
                onClick={() => { setRoleFilter('All'); setCountryFilter('All'); setPriceRange(0); setStatusFilter('All'); }}
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Player Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl mb-4 block">🏏</span>
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>No players found</p>
            <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
