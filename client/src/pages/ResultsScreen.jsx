import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import {
  Trophy, Coins, Clock, Target, Swords, ArrowRight,
  CheckCircle2, XCircle, Crown, Shield, Zap, Star,
  ExternalLink
} from 'lucide-react';

/**
 * ResultsScreen — Match outcome with winner/loser display,
 * XLM payout animation, and match stats breakdown
 */
export default function ResultsScreen() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { receiveXLM } = useWallet();
  const [showConfetti, setShowConfetti] = useState(false);
  const [payoutAnimating, setPayoutAnimating] = useState(false);
  const [payoutComplete, setPayoutComplete] = useState(false);

  // Mock result data
  const [result] = useState(() => {
    const won = Math.random() > 0.4; // 60% chance of winning for a nice demo
    return {
      matchId,
      winner: won ? user?.username || 'You' : 'ByteSlayer',
      loser: won ? 'ByteSlayer' : (user?.username || 'You'),
      userWon: won,
      stake: 100,
      payout: 190, // 100 * 2 - 10% platform fee
      problem: 'Two Sum',
      difficulty: 'Easy',
      userStats: {
        testsPass: won ? 3 : 2,
        totalTests: 3,
        timeUsed: '8:42',
        score: won ? 950 : 680,
      },
      opponentStats: {
        testsPass: won ? 2 : 3,
        totalTests: 3,
        timeUsed: '11:15',
        score: won ? 680 : 950,
      },
      eloChange: won ? +25 : -18,
      txHash: '0x' + Math.random().toString(16).substr(2, 32),
    };
  });

  // Trigger animations
  useEffect(() => {
    if (result.userWon) {
      setTimeout(() => setShowConfetti(true), 500);
      setTimeout(() => {
        setPayoutAnimating(true);
        receiveXLM(result.payout);
      }, 1500);
      setTimeout(() => setPayoutComplete(true), 3000);
    }
  }, []);

  const StatCard = ({ icon: Icon, label, value, color = 'arena-accent' }) => (
    <div className="flex items-center gap-3 p-3 bg-arena-bg border border-arena-border">
      <Icon className={`w-5 h-5 text-${color}`} />
      <div>
        <div className="text-xs text-arena-muted">{label}</div>
        <div className="text-sm font-mono font-bold text-white">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* === Confetti Effect (CSS-based) === */}
      {showConfetti && result.userWon && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3"
              style={{
                left: `${Math.random() * 100}%`,
                top: -20,
                backgroundColor: ['#00f0ff', '#ff00e5', '#f0ff00', '#00ff88'][i % 4],
              }}
              animate={{
                y: [0, window.innerHeight + 100],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 720],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* === Result Header === */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          >
            {result.userWon ? (
              <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-arena-accent3 mb-4">
                <Crown className="w-12 h-12 text-arena-accent3" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-arena-danger mb-4">
                <Shield className="w-12 h-12 text-arena-danger" />
              </div>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`font-display font-black text-4xl sm:text-5xl ${
              result.userWon ? 'gradient-text-warm' : 'text-arena-danger'
            }`}
          >
            {result.userWon ? 'VICTORY!' : 'DEFEAT'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-arena-muted mt-2"
          >
            {result.userWon
              ? 'You dominated the arena! Rewards incoming.'
              : 'Better luck next time, warrior.'}
          </motion.p>
        </div>

        {/* === Payout Animation === */}
        {result.userWon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="brutal-card p-6 mb-8 text-center"
            style={{ borderColor: '#f0ff00', boxShadow: '4px 4px 0px #f0ff00' }}
          >
            <Coins className="w-8 h-8 text-arena-accent3 mx-auto mb-3" />
            <div className="text-sm text-arena-muted uppercase tracking-wider mb-2">Payout</div>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 1.5 }}
              className="font-display font-black text-5xl text-arena-accent3"
            >
              +{result.payout} XLM
            </motion.div>
            <p className="text-xs text-arena-muted mt-2">
              {payoutComplete ? (
                <span className="text-arena-success flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Deposited to your wallet
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 border-2 border-arena-accent3 border-t-transparent rounded-full animate-spin" />
                  Processing blockchain transaction...
                </span>
              )}
            </p>
          </motion.div>
        )}

        {/* === Player Comparison === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="brutal-card mb-8 overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-0">
            {/* Your Stats */}
            <div className={`p-6 ${result.userWon ? 'bg-arena-success/5' : 'bg-arena-danger/5'}`}>
              <div className="text-center">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=you`}
                  alt="you"
                  className="w-16 h-16 mx-auto mb-2 border-2 border-arena-accent"
                />
                <div className="text-sm text-white font-bold">{user?.username || 'You'}</div>
                <div className="text-xs text-arena-muted mt-1">
                  Score: <span className="text-arena-accent font-mono">{result.userStats.score}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-arena-muted">
                  <span>Tests</span>
                  <span className="text-white font-mono">{result.userStats.testsPass}/{result.userStats.totalTests}</span>
                </div>
                <div className="flex justify-between text-arena-muted">
                  <span>Time</span>
                  <span className="text-white font-mono">{result.userStats.timeUsed}</span>
                </div>
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center justify-center bg-arena-bg border-x border-arena-border">
              <Swords className="w-8 h-8 text-arena-accent mb-2" />
              <span className="font-display font-black text-2xl text-arena-muted">VS</span>
              <div className="mt-3 text-xs text-arena-muted font-mono">{result.problem}</div>
            </div>

            {/* Opponent Stats */}
            <div className={`p-6 ${!result.userWon ? 'bg-arena-success/5' : 'bg-arena-danger/5'}`}>
              <div className="text-center">
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=ByteSlayer`}
                  alt="opponent"
                  className="w-16 h-16 mx-auto mb-2 border-2 border-arena-border"
                />
                <div className="text-sm text-white font-bold">ByteSlayer</div>
                <div className="text-xs text-arena-muted mt-1">
                  Score: <span className="text-arena-accent font-mono">{result.opponentStats.score}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-arena-muted">
                  <span>Tests</span>
                  <span className="text-white font-mono">{result.opponentStats.testsPass}/{result.opponentStats.totalTests}</span>
                </div>
                <div className="flex justify-between text-arena-muted">
                  <span>Time</span>
                  <span className="text-white font-mono">{result.opponentStats.timeUsed}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* === ELO Change & Actions === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="brutal-card p-4 flex items-center gap-4">
            <Shield className="w-8 h-8 text-arena-accent" />
            <div>
              <div className="text-xs text-arena-muted uppercase tracking-wider">ELO Change</div>
              <div className={`font-display font-bold text-2xl ${
                result.eloChange > 0 ? 'text-arena-success' : 'text-arena-danger'
              }`}>
                {result.eloChange > 0 ? '+' : ''}{result.eloChange}
              </div>
            </div>
          </div>

          <div className="brutal-card p-4 flex items-center gap-4">
            <Zap className="w-8 h-8 text-arena-accent2" />
            <div>
              <div className="text-xs text-arena-muted uppercase tracking-wider">Transaction</div>
              <div className="font-mono text-xs text-arena-muted truncate max-w-[200px]">
                {result.txHash}
              </div>
            </div>
          </div>
        </motion.div>

        {/* === Action Buttons === */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/lobby" className="flex-1 btn-solid text-center flex items-center justify-center gap-2">
            <Swords className="w-4 h-4" />
            Battle Again
          </Link>
          <Link to="/dashboard" className="flex-1 btn-neon text-center flex items-center justify-center gap-2">
            Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
