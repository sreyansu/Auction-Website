import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuctionProvider, useAuction } from './contexts/AuctionContext';
import Navbar from './components/layout/Navbar';
import LobbyPage from './pages/LobbyPage';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import AuctionPage from './pages/AuctionPage';
import AdminPage from './pages/AdminPage';
import DisplayPage from './pages/DisplayPage';
import LeaderboardPage from './pages/LeaderboardPage';

function RequireLeague({ children }: { children: React.ReactNode }) {
  const { activeLeagueId } = useAuction();
  if (!activeLeagueId) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        
        {/* Display page - no navbar (fullscreen broadcast) */}
        <Route path="/display" element={
          <RequireLeague>
            <DisplayPage />
          </RequireLeague>
        } />

        {/* All other pages with navbar */}
        <Route
          path="*"
          element={
            <RequireLeague>
              <>
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/dashboard" element={<HomePage />} />
                    <Route path="/players" element={<PlayersPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/auction" element={<AuctionPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                  </Routes>
                </main>
              </>
            </RequireLeague>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuctionProvider>
        <AppContent />
      </AuctionProvider>
    </AuthProvider>
  );
}
