import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import {
  Swords, LayoutDashboard, Trophy, Wallet, LogOut,
  Menu, X, Zap, ChevronDown
} from 'lucide-react';

/**
 * Navbar — responsive top navigation with wallet status and mobile drawer
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { balance, walletAddress, isConnected, connectWallet } = useWallet();
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/lobby', label: 'Battle Lobby', icon: Swords },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-arena-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-arena-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-arena-bg" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight hidden sm:block">
                <span className="text-arena-accent">CODE</span>
                <span className="text-white">ARENA</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'text-arena-accent bg-arena-accent/10 border-b-2 border-arena-accent'
                      : 'text-arena-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side — wallet + user */}
            <div className="flex items-center gap-3">
              {/* Wallet Status */}
              {isConnected ? (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-arena-card border border-arena-border rounded">
                  <Wallet className="w-4 h-4 text-arena-accent" />
                  <span className="text-sm font-mono text-arena-accent font-bold">
                    {balance.toFixed(1)} XLM
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-arena-accent/50 text-arena-accent text-sm hover:bg-arena-accent/10 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Connect
                </button>
              )}

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <img
                  src={user?.avatar}
                  alt="avatar"
                  className="w-8 h-8 border border-arena-border"
                />
                <span className="hidden lg:block text-sm font-medium text-white">
                  {user?.username}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-arena-muted hover:text-arena-danger transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-arena-muted hover:text-white"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 glass border-b border-arena-border"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'text-arena-accent bg-arena-accent/10 border-l-2 border-arena-accent'
                      : 'text-arena-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}

              {/* Mobile Wallet */}
              <div className="pt-2 border-t border-arena-border/50">
                {isConnected ? (
                  <div className="flex items-center gap-2 px-4 py-3">
                    <Wallet className="w-5 h-5 text-arena-accent" />
                    <span className="text-sm font-mono text-arena-accent font-bold">
                      {balance.toFixed(1)} XLM
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="w-full flex items-center gap-2 px-4 py-3 text-arena-accent text-sm"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
