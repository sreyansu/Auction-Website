import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Users, Shield, Gavel, Monitor, BarChart3, LogIn, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, signInWithGoogle, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/players', label: 'Players', icon: <Users size={18} /> },
    { path: '/teams', label: 'Teams', icon: <Shield size={18} /> },
    { path: '/auction', label: 'Auction', icon: <Gavel size={18} /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <BarChart3 size={18} /> },
  ];

  if (isAdmin && user) {
    navLinks.push({ path: '/admin', label: 'Admin', icon: <Monitor size={18} /> });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(12px)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🏏</span>
            <span className="text-lg font-bold gradient-text hidden sm:block">Premier League Auction</span>
            <span className="text-lg font-bold gradient-text sm:hidden">PLA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline"
                style={{
                  color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: isActive(link.path) ? 'rgba(255,122,0,0.1)' : 'transparent',
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Link
              to="/display"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline ml-1"
              style={{
                color: isActive('/display') ? '#0f0f0f' : 'var(--color-primary)',
                background: isActive('/display') ? 'var(--color-primary)' : 'rgba(255,122,0,0.1)',
                border: '1px solid var(--color-primary)',
              }}
            >
              <Monitor size={18} />
              Live Display
            </Link>
          </div>

          {/* Auth + Mobile Menu */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.photoURL || ''}
                  alt=""
                  className="w-8 h-8 rounded-full border"
                  style={{ borderColor: 'var(--color-border)' }}
                />
                <button onClick={logout} className="btn-secondary text-sm py-1.5 px-3 hidden sm:flex items-center gap-1">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={signInWithGoogle} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1">
                <LogIn size={14} /> Sign In
              </button>
            )}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ color: 'var(--color-text-muted)' }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium no-underline"
                style={{
                  color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: isActive(link.path) ? 'rgba(255,122,0,0.1)' : 'transparent',
                }}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <Link
              to="/display"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium no-underline mt-1"
              style={{
                color: 'var(--color-primary)',
                background: 'rgba(255,122,0,0.1)',
                border: '1px solid rgba(255,122,0,0.3)',
              }}
            >
              <Monitor size={18} /> Live Display
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
