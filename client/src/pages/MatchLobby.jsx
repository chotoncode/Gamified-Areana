import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSocket } from '../context/SocketContext';
import {
  Swords, Plus, Users, Coins, Clock, Shield,
  Search, Filter, Copy, Check, X, Loader, Zap,
  Lock, Globe, ArrowRight
} from 'lucide-react';

// Mock lobby matches
const INITIAL_MATCHES = [
  { id: 'match_1', creator: 'ByteSlayer', stake: 50, difficulty: 'Medium', language: 'Any', elo: 1380, status: 'waiting', isPrivate: false },
  { id: 'match_2', creator: 'AlgoKing', stake: 100, difficulty: 'Hard', language: 'Python', elo: 1620, status: 'waiting', isPrivate: false },
  { id: 'match_3', creator: 'NullPointer', stake: 25, difficulty: 'Easy', language: 'Any', elo: 1200, status: 'waiting', isPrivate: false },
  { id: 'match_4', creator: 'RecursiveRex', stake: 200, difficulty: 'Hard', language: 'C++', elo: 1750, status: 'waiting', isPrivate: false },
  { id: 'match_5', creator: 'StackOverflow', stake: 75, difficulty: 'Medium', language: 'Java', elo: 1450, status: 'waiting', isPrivate: false },
];

/**
 * MatchLobby — Browse & create matches, join battles, private rooms
 */
export default function MatchLobby() {
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const [createForm, setCreateForm] = useState({
    stake: 50,
    difficulty: 'Medium',
    language: 'Any',
    isPrivate: false,
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, stakeXLM, isConnected } = useWallet();
  const { emit, on, off } = useSocket();

  // Filter matches
  const filteredMatches = matches.filter(m => {
    if (filter === 'easy') return m.difficulty === 'Easy';
    if (filter === 'medium') return m.difficulty === 'Medium';
    if (filter === 'hard') return m.difficulty === 'Hard';
    return true;
  }).filter(m => {
    if (!searchQuery) return true;
    return m.creator.toLowerCase().includes(searchQuery.toLowerCase());
  });

  /**
   * Create a new match
   */
  const handleCreate = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    if (balance < createForm.stake) {
      alert('Insufficient XLM balance');
      return;
    }

    try {
      await stakeXLM(createForm.stake);
      const matchId = 'match_' + Date.now();
      const newMatch = {
        id: matchId,
        creator: user?.username || 'You',
        ...createForm,
        elo: user?.stats?.elo || 1200,
        status: 'waiting',
      };
      setMatches(prev => [newMatch, ...prev]);
      setShowCreate(false);

      // Simulate opponent joining after a delay
      setTimeout(() => {
        navigate(`/battle/${matchId}`);
      }, 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Join an existing match
   */
  const handleJoin = async (match) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    if (balance < match.stake) {
      alert('Insufficient XLM balance');
      return;
    }

    setJoiningId(match.id);
    try {
      await stakeXLM(match.stake);
      // Simulate match start
      setTimeout(() => {
        navigate(`/battle/${match.id}`);
      }, 1500);
    } catch (err) {
      alert(err.message);
      setJoiningId(null);
    }
  };

  const difficultyColor = {
    Easy: 'text-arena-success border-arena-success/30 bg-arena-success/10',
    Medium: 'text-arena-warning border-arena-warning/30 bg-arena-warning/10',
    Hard: 'text-arena-danger border-arena-danger/30 bg-arena-danger/10',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* === Header === */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white flex items-center gap-3">
            <Swords className="w-8 h-8 text-arena-accent" />
            Battle Lobby
          </h1>
          <p className="text-arena-muted mt-1">Find an opponent or create your own match</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-solid flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Match
        </button>
      </div>

      {/* === Filters & Search === */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player name..."
            className="w-full pl-10 pr-4 py-2.5 bg-arena-card border border-arena-border text-white placeholder-arena-muted/50 text-sm focus:border-arena-accent focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'easy', 'medium', 'hard'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wider border transition-all ${
                filter === f
                  ? 'bg-arena-accent text-arena-bg border-arena-accent'
                  : 'bg-transparent text-arena-muted border-arena-border hover:border-arena-accent/50 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* === Online Players Count === */}
      <div className="flex items-center gap-2 mb-4 text-sm text-arena-muted">
        <div className="w-2 h-2 bg-arena-success rounded-full animate-pulse" />
        <span>{matches.length} active matches · 142 players online</span>
      </div>

      {/* === Match List === */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className="brutal-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Creator Avatar */}
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${match.creator}`}
                  alt={match.creator}
                  className="w-12 h-12 border border-arena-border"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{match.creator}</span>
                    {match.isPrivate ? (
                      <Lock className="w-3.5 h-3.5 text-arena-muted" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-arena-muted" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-arena-muted flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {match.elo}
                    </span>
                    <span className={`text-xs px-2 py-0.5 border ${difficultyColor[match.difficulty]}`}>
                      {match.difficulty}
                    </span>
                    {match.language !== 'Any' && (
                      <span className="text-xs text-arena-muted font-mono">{match.language}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Stake Amount */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-arena-bg border border-arena-border">
                  <Coins className="w-4 h-4 text-arena-accent3" />
                  <span className="font-mono font-bold text-white text-sm">{match.stake} XLM</span>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoin(match)}
                  disabled={joiningId === match.id}
                  className="btn-neon text-sm flex items-center gap-2 flex-1 sm:flex-none justify-center disabled:opacity-50"
                >
                  {joiningId === match.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Join <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMatches.length === 0 && (
          <div className="text-center py-20">
            <Swords className="w-16 h-16 text-arena-muted/30 mx-auto mb-4" />
            <p className="text-arena-muted">No matches found. Create one!</p>
          </div>
        )}
      </div>

      {/* === Create Match Modal === */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="brutal-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-arena-accent" />
                  Create Match
                </h2>
                <button onClick={() => setShowCreate(false)} className="text-arena-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Stake Amount */}
                <div>
                  <label className="block text-xs text-arena-muted uppercase tracking-wider mb-2">
                    Stake Amount (XLM)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 100, 200].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setCreateForm(prev => ({ ...prev, stake: amount }))}
                        className={`py-2.5 text-sm font-mono font-bold border transition-all ${
                          createForm.stake === amount
                            ? 'bg-arena-accent text-arena-bg border-arena-accent'
                            : 'bg-transparent text-arena-muted border-arena-border hover:border-arena-accent/50'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-arena-muted mt-1">
                    Balance: <span className="text-arena-accent font-mono">{balance.toFixed(1)} XLM</span>
                  </p>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs text-arena-muted uppercase tracking-wider mb-2">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button
                        key={d}
                        onClick={() => setCreateForm(prev => ({ ...prev, difficulty: d }))}
                        className={`py-2.5 text-sm font-display font-bold uppercase border transition-all ${
                          createForm.difficulty === d
                            ? `${difficultyColor[d]}`
                            : 'bg-transparent text-arena-muted border-arena-border hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs text-arena-muted uppercase tracking-wider mb-2">
                    Language
                  </label>
                  <select
                    value={createForm.language}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full py-2.5 px-3 bg-arena-bg border border-arena-border text-white text-sm focus:border-arena-accent focus:outline-none"
                  >
                    <option value="Any">Any Language</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>

                {/* Private Toggle */}
                <div className="flex items-center justify-between py-3 border-t border-arena-border">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-arena-muted" />
                    <span className="text-sm text-white">Private Room</span>
                  </div>
                  <button
                    onClick={() => setCreateForm(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                    className={`w-12 h-6 rounded-full border transition-all ${
                      createForm.isPrivate
                        ? 'bg-arena-accent border-arena-accent'
                        : 'bg-arena-bg border-arena-border'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      createForm.isPrivate ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreate}
                  className="w-full btn-solid flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Stake {createForm.stake} XLM & Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
