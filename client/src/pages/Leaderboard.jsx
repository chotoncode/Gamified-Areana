import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Crown, Medal, Shield, TrendingUp,
  Flame, Star, ChevronUp, ChevronDown, Minus,
  Search
} from 'lucide-react';

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  { rank: 1, username: 'AlgoGod', elo: 2150, wins: 245, losses: 32, streak: 12, earnings: 15420, change: 'up' },
  { rank: 2, username: 'ByteSlayer', elo: 2080, wins: 198, losses: 45, streak: 5, earnings: 12300, change: 'up' },
  { rank: 3, username: 'RecursiveRex', elo: 1980, wins: 176, losses: 52, streak: 3, earnings: 10200, change: 'down' },
  { rank: 4, username: 'StackOverflow', elo: 1920, wins: 165, losses: 58, streak: 7, earnings: 9500, change: 'up' },
  { rank: 5, username: 'NullPointer', elo: 1870, wins: 152, losses: 61, streak: 0, earnings: 8700, change: 'same' },
  { rank: 6, username: 'CodeNinja', elo: 1850, wins: 148, losses: 65, streak: 4, earnings: 8200, change: 'up' },
  { rank: 7, username: 'BinaryBoss', elo: 1820, wins: 140, losses: 70, streak: 2, earnings: 7800, change: 'down' },
  { rank: 8, username: 'AlgoKing', elo: 1790, wins: 135, losses: 72, streak: 1, earnings: 7200, change: 'up' },
  { rank: 9, username: 'HeapMaster', elo: 1760, wins: 128, losses: 78, streak: 0, earnings: 6800, change: 'down' },
  { rank: 10, username: 'GraphGuru', elo: 1740, wins: 122, losses: 80, streak: 6, earnings: 6500, change: 'same' },
  { rank: 11, username: 'TreeTraverser', elo: 1710, wins: 118, losses: 85, streak: 0, earnings: 6100, change: 'up' },
  { rank: 12, username: 'DPDynamo', elo: 1680, wins: 112, losses: 88, streak: 2, earnings: 5800, change: 'down' },
  { rank: 13, username: 'BitManip', elo: 1650, wins: 108, losses: 92, streak: 1, earnings: 5400, change: 'same' },
  { rank: 14, username: 'SortSensei', elo: 1620, wins: 102, losses: 95, streak: 3, earnings: 5000, change: 'up' },
  { rank: 15, username: 'HashHero', elo: 1590, wins: 98, losses: 98, streak: 0, earnings: 4700, change: 'down' },
];

/**
 * Leaderboard — Global rankings with ELO, wins, and earnings
 */
export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, weekly, monthly
  const { user } = useAuth();

  // Filter leaderboard
  const filtered = MOCK_LEADERBOARD.filter(p =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find user's rank
  const userRank = 42; // Mock

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-mono text-sm text-arena-muted w-5 text-center">{rank}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* === Header === */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trophy className="w-12 h-12 text-arena-accent3 mx-auto mb-4" />
          <h1 className="font-display font-bold text-4xl text-white mb-2">
            Global <span className="gradient-text-warm">Leaderboard</span>
          </h1>
          <p className="text-arena-muted">The arena's mightiest warriors, ranked by ELO</p>
        </motion.div>
      </div>

      {/* === Your Rank Card === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="brutal-card p-4 sm:p-5 mb-8 flex items-center justify-between"
        style={{ borderColor: '#ff00e5', boxShadow: '4px 4px 0px #ff00e5' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-arena-accent2/10 border border-arena-accent2/30 flex items-center justify-center font-display font-bold text-arena-accent2 text-xl">
            #{userRank}
          </div>
          <div>
            <div className="text-white font-bold flex items-center gap-2">
              {user?.username || 'You'}
              <span className="text-xs px-2 py-0.5 bg-arena-accent2/10 border border-arena-accent2/30 text-arena-accent2">YOU</span>
            </div>
            <div className="text-xs text-arena-muted">
              ELO: <span className="text-arena-accent font-mono">{user?.stats?.elo || 1200}</span>
              {' · '}
              W/L: <span className="font-mono">{user?.stats?.wins || 0}/{user?.stats?.losses || 0}</span>
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-arena-muted">Earnings</div>
          <div className="text-arena-accent3 font-mono font-bold">{user?.stats?.totalEarnings || 0} XLM</div>
        </div>
      </motion.div>

      {/* === Filters === */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search warriors..."
            className="w-full pl-10 pr-4 py-2.5 bg-arena-card border border-arena-border text-white placeholder-arena-muted/50 text-sm focus:border-arena-accent focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'weekly', label: 'Weekly' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              className={`px-4 py-2.5 text-xs font-display font-bold uppercase border transition-all ${
                timeFilter === f.key
                  ? 'bg-arena-accent text-arena-bg border-arena-accent'
                  : 'bg-transparent text-arena-muted border-arena-border hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* === Top 3 Podium === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden md:grid grid-cols-3 gap-4 mb-8"
      >
        {[1, 0, 2].map((idx) => {
          const player = MOCK_LEADERBOARD[idx];
          const isFirst = idx === 0;
          const heights = ['h-40', 'h-32', 'h-28'];
          const colors = ['border-yellow-400', 'border-gray-300', 'border-amber-600'];
          const bgColors = ['bg-yellow-400/5', 'bg-gray-300/5', 'bg-amber-600/5'];

          return (
            <div key={player.rank} className={`flex flex-col items-center ${idx === 0 ? 'order-2' : idx === 1 ? 'order-1 mt-8' : 'order-3 mt-12'}`}>
              <div className="mb-2">
                {rankIcon(player.rank)}
              </div>
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.username}`}
                alt={player.username}
                className={`w-16 h-16 border-2 ${colors[idx]} mb-2`}
              />
              <div className="text-white font-bold text-sm">{player.username}</div>
              <div className="text-arena-accent font-mono text-sm font-bold">{player.elo}</div>
              <div className={`w-full ${heights[idx]} ${bgColors[idx]} border-t-2 ${colors[idx]} mt-2 flex items-center justify-center`}>
                <span className="font-display font-black text-3xl text-white/20">#{player.rank}</span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* === Full Table === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="brutal-card overflow-hidden"
      >
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-arena-surface border-b border-arena-border text-xs text-arena-muted uppercase tracking-wider font-display font-bold">
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2 text-center">ELO</div>
          <div className="col-span-2 text-center">W/L</div>
          <div className="col-span-1 text-center">Streak</div>
          <div className="col-span-2 text-center">Earnings</div>
          <div className="col-span-1 text-center">Trend</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-arena-border/50">
          {filtered.map((player, i) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors ${
                player.rank <= 3 ? 'bg-arena-accent/[0.02]' : ''
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                {rankIcon(player.rank)}
              </div>

              {/* Player */}
              <div className="col-span-5 sm:col-span-3 flex items-center gap-2">
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.username}`}
                  alt={player.username}
                  className="w-8 h-8 border border-arena-border"
                />
                <span className="text-white text-sm font-medium truncate">{player.username}</span>
              </div>

              {/* ELO */}
              <div className="col-span-2 text-center">
                <span className="text-arena-accent font-mono font-bold text-sm">{player.elo}</span>
              </div>

              {/* W/L (hidden on mobile) */}
              <div className="hidden sm:block col-span-2 text-center">
                <span className="text-arena-success text-sm">{player.wins}</span>
                <span className="text-arena-muted text-sm">/</span>
                <span className="text-arena-danger text-sm">{player.losses}</span>
              </div>

              {/* Streak */}
              <div className="hidden sm:flex col-span-1 justify-center">
                {player.streak > 0 ? (
                  <span className="flex items-center gap-0.5 text-xs text-arena-warning">
                    <Flame className="w-3.5 h-3.5" />
                    {player.streak}
                  </span>
                ) : (
                  <span className="text-xs text-arena-muted">—</span>
                )}
              </div>

              {/* Earnings */}
              <div className="col-span-3 sm:col-span-2 text-center">
                <span className="text-arena-accent3 font-mono text-sm">{player.earnings.toLocaleString()}</span>
                <span className="text-arena-muted text-xs ml-1">XLM</span>
              </div>

              {/* Trend */}
              <div className="hidden sm:flex col-span-1 justify-center">
                {player.change === 'up' && <ChevronUp className="w-4 h-4 text-arena-success" />}
                {player.change === 'down' && <ChevronDown className="w-4 h-4 text-arena-danger" />}
                {player.change === 'same' && <Minus className="w-4 h-4 text-arena-muted" />}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
