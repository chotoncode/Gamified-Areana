import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import {
  Zap, Mail, Lock, User, Wallet, ArrowRight,
  Eye, EyeOff, AlertCircle
} from 'lucide-react';

/**
 * AuthPage — Login/Signup with email or wallet connection
 */
export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, loginWithWallet } = useAuth();
  const { connectWallet, isConnecting } = useWallet();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!username.trim()) throw new Error('Username is required');
        await signup(username, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      const mockAddr = 'GBMOCK' + Math.random().toString(36).substr(2, 12);
      await loginWithWallet(mockAddr);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Wallet connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-arena-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-arena-accent2/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-arena-accent flex items-center justify-center">
              <Zap className="w-6 h-6 text-arena-bg" />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            {mode === 'login' ? 'Welcome Back' : 'Join the Arena'}
          </h1>
          <p className="text-arena-muted mt-2">
            {mode === 'login' ? 'Enter your credentials to continue' : 'Create your warrior profile'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="brutal-card p-6">
          {/* Mode Toggle */}
          <div className="flex mb-6 border border-arena-border">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-display font-bold uppercase tracking-wider transition-all ${
                  mode === m
                    ? 'bg-arena-accent text-arena-bg'
                    : 'bg-transparent text-arena-muted hover:text-white'
                }`}
              >
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-4 py-3 mb-4 bg-arena-danger/10 border border-arena-danger/30 text-arena-danger text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-arena-muted uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-muted" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="warrior_name"
                      className="w-full pl-10 pr-4 py-3 bg-arena-bg border border-arena-border text-white placeholder-arena-muted/50 font-mono text-sm focus:border-arena-accent focus:outline-none transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs text-arena-muted uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@codearena.io"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-arena-bg border border-arena-border text-white placeholder-arena-muted/50 font-mono text-sm focus:border-arena-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-arena-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-arena-bg border border-arena-border text-white placeholder-arena-muted/50 font-mono text-sm focus:border-arena-accent focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-muted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-solid flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-arena-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Enter Arena' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-arena-border" />
            <span className="text-xs text-arena-muted uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-arena-border" />
          </div>

          {/* Wallet Connect */}
          <button
            onClick={handleWalletConnect}
            disabled={isConnecting}
            className="w-full btn-neon-pink flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isConnecting ? (
              <div className="w-5 h-5 border-2 border-arena-accent2 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect Freighter Wallet
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
