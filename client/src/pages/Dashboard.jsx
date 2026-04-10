import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import {
  Wallet, Swords, Trophy, TrendingUp, TrendingDown,
  Clock, Target, Coins, Star, ChevronRight, Zap,
  Shield, Flame
} from 'lucide-react';

// Mock match history data
const MOCK_HISTORY = [
  { id: 'm1', opponent: 'ByteSlayer', result: 'win', stake: 50, problem: 'Two Sum', time: '8:42', date: '2h ago' },
  { id: 'm2', opponent: 'AlgoKing', result: 'loss', stake: 100, problem: 'Binary Search', time: '12:15', date: '5h ago' },
  { id: 'm3', opponent: 'NullPointer', result: 'win', stake: 75, problem: 'Merge Sort', time: '6:30', date: '1d ago' },
  { id: 'm4', opponent: 'StackOverflow', result: 'win', stake: 50, problem: 'Linked List', time: '9:10', date: '1d ago' },
  { id: 'm5', opponent: 'RecursiveRex', result: 'draw', stake: 100, problem: 'DFS Maze', time: '15:00', date: '2d ago' },
];

/**
 * Dashboard — User stats, wallet balance, match history, and quick actions
 */
export default function Dashboard() {
  const { user } = useAuth();
  const { balance, isConnected, connectWallet, walletAddress } = useWallet();
  const [activeTab, setActiveTab] = useState('history');

  // Calculate derived stats
  const stats = user?.stats || { wins: 12, losses: 5, draws: 2, elo: 1450, totalEarnings: 2350 };
  const totalMatches = stats.wins + stats.losses + stats.draws;
  const winRate = totalMatches > 0 ? ((stats.wins / totalMatches) * 100).toFixed(1) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* === Header === */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=warrior`}
              alt="avatar"
              className="w-16 h-16 border-2 border-arena-accent"
            />
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                Welcome back, <span className="text-arena-accent">{user?.username || 'Warrior'}</span>
              </h1>
              <p className="text-arena-muted text-sm flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                ELO Rating: <span className="text-arena-accent font-mono font-bold">{stats.elo}</span>
              </p>
            </div>
          </div>
          <Link to="/lobby" className="btn-solid flex items-center gap-2">
            <Swords className="w-4 h-4" />
            Find Battle
          </Link>
        </motion.div>

        {/* === Stats Grid === */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Wallet Balance */}
          <div className="brutal-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Wallet className="w-5 h-5 text-arena-accent" />
              {!isConnected && (
                <button onClick={connectWallet} className="text-xs text-arena-accent hover:underline">
                  Connect
                </button>
              )}
            </div>
            <div className="font-display font-bold text-2xl text-white">
              {isConnected ? `${balance.toFixed(1)}` : '—'}
            </div>
            <div className="text-xs text-arena-muted uppercase tracking-wider mt-1">XLM Balance</div>
          </div>

          {/* Win Rate */}
          <div className="brutal-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-5 h-5 text-arena-success" />
              <span className="text-xs text-arena-success font-mono">{winRate}%</span>
            </div>
            <div className="font-display font-bold text-2xl text-white">{stats.wins}W / {stats.losses}L</div>
            <div className="text-xs text-arena-muted uppercase tracking-wider mt-1">Win / Loss</div>
          </div>

          {/* Total Matches */}
          <div className="brutal-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Swords className="w-5 h-5 text-arena-accent2" />
            </div>
            <div className="font-display font-bold text-2xl text-white">{totalMatches}</div>
            <div className="text-xs text-arena-muted uppercase tracking-wider mt-1">Total Battles</div>
          </div>

          {/* Earnings */}
          <div className="brutal-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Coins className="w-5 h-5 text-arena-accent3" />
              <TrendingUp className="w-4 h-4 text-arena-success" />
            </div>
            <div className="font-display font-bold text-2xl text-white">{stats.totalEarnings}</div>
            <div className="text-xs text-arena-muted uppercase tracking-wider mt-1">XLM Earned</div>
          </div>
        </motion.div>

        {/* === Main Content === */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Match History (2/3 width) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="brutal-card">
              <div className="flex items-center justify-between p-4 border-b border-arena-border">
                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-arena-accent" />
                  Recent Battles
                </h2>
              </div>

              <div className="divide-y divide-arena-border/50">
                {MOCK_HISTORY.map((match, i) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        match.result === 'win' ? 'bg-arena-success' :
                        match.result === 'loss' ? 'bg-arena-danger' : 'bg-arena-warning'
                      }`} />
                      <div>
                        <div className="text-sm text-white font-medium">vs {match.opponent}</div>
                        <div className="text-xs text-arena-muted">{match.problem} · {match.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-mono font-bold ${
                        match.result === 'win' ? 'text-arena-success' :
                        match.result === 'loss' ? 'text-arena-danger' : 'text-arena-warning'
                      }`}>
                        {match.result === 'win' ? '+' : match.result === 'loss' ? '-' : '±'}{match.stake} XLM
                      </div>
                      <div className="text-xs text-arena-muted">{match.date}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar (1/3 width) */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Actions */}
            <div className="brutal-card p-4">
              <h3 className="font-display font-bold text-sm text-arena-muted uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/lobby"
                  className="flex items-center gap-3 p-3 hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="w-10 h-10 bg-arena-accent/10 border border-arena-accent/30 flex items-center justify-center">
                    <Swords className="w-5 h-5 text-arena-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Find Match</div>
                    <div className="text-xs text-arena-muted">Join the battle lobby</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-arena-muted group-hover:text-arena-accent transition-colors" />
                </Link>

                <Link
                  to="/leaderboard"
                  className="flex items-center gap-3 p-3 hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="w-10 h-10 bg-arena-accent2/10 border border-arena-accent2/30 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-arena-accent2" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Leaderboard</div>
                    <div className="text-xs text-arena-muted">See top warriors</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-arena-muted group-hover:text-arena-accent2 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Win Streak */}
            <div className="brutal-card p-4" style={{ boxShadow: '4px 4px 0px #ff00e5', borderColor: '#ff00e5' }}>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-arena-accent2" />
                <span className="font-display font-bold text-sm text-white uppercase">Hot Streak</span>
              </div>
              <div className="flex items-center gap-1">
                {['W', 'W', 'L', 'W', 'W'].map((r, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold border ${
                      r === 'W'
                        ? 'bg-arena-success/10 border-arena-success/30 text-arena-success'
                        : 'bg-arena-danger/10 border-arena-danger/30 text-arena-danger'
                    }`}
                  >
                    {r}
                  </div>
                ))}
              </div>
              <p className="text-xs text-arena-muted mt-2">Current streak: <span className="text-arena-success font-bold">2W</span></p>
            </div>

            {/* Achievements */}
            <div className="brutal-card p-4">
              <h3 className="font-display font-bold text-sm text-arena-muted uppercase tracking-wider mb-3">
                Recent Badges
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { emoji: '🔥', label: 'Hot Streak' },
                  { emoji: '⚡', label: 'Speed Demon' },
                  { emoji: '🎯', label: 'Sharpshooter' },
                ].map(({ emoji, label }) => (
                  <div key={label} className="text-center p-2 bg-arena-bg border border-arena-border">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="text-[10px] text-arena-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
