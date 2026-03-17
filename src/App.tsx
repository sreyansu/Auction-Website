import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuctionProvider } from './contexts/AuctionContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import AuctionPage from './pages/AuctionPage';
import AdminPage from './pages/AdminPage';
import DisplayPage from './pages/DisplayPage';
import LeaderboardPage from './pages/LeaderboardPage';

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Display page - no navbar (fullscreen broadcast) */}
        <Route path="/display" element={<DisplayPage />} />

        {/* All other pages with navbar */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/players" element={<PlayersPage />} />
                  <Route path="/teams" element={<TeamsPage />} />
                  <Route path="/auction" element={<AuctionPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                </Routes>
              </main>
            </>
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
