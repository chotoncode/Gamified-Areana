import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MatchLobby from './pages/MatchLobby';
import BattleRoom from './pages/BattleRoom';
import ResultsScreen from './pages/ResultsScreen';
import Leaderboard from './pages/Leaderboard';

/**
 * ProtectedRoute — redirects to /auth if user is not logged in
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/auth" />;
}

/**
 * Loading screen shown during auth initialization
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-arena-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-arena-muted font-mono">Initializing Arena...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-arena-bg bg-grid scanline">
      {/* Show navbar on all pages except landing and battle room */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/lobby" element={
          <ProtectedRoute>
            <Navbar />
            <MatchLobby />
          </ProtectedRoute>
        } />
        <Route path="/battle/:matchId" element={
          <ProtectedRoute>
            <BattleRoom />
          </ProtectedRoute>
        } />
        <Route path="/results/:matchId" element={
          <ProtectedRoute>
            <Navbar />
            <ResultsScreen />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Navbar />
            <Leaderboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
