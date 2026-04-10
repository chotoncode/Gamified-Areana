import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock user database for prototype
const MOCK_USERS = {};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('arena_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('arena_user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('arena_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('arena_user');
    }
  }, [user]);

  /**
   * Register a new user with email and password.
   * For the prototype, we store users in-memory and localStorage.
   */
  const signup = async (username, email, password) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));

    if (MOCK_USERS[email]) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: 'user_' + Date.now(),
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      stats: { wins: 0, losses: 0, draws: 0, elo: 1200, totalEarnings: 0 },
      walletAddress: null,
      createdAt: new Date().toISOString(),
    };

    MOCK_USERS[email] = { ...newUser, password };
    setUser(newUser);
    return newUser;
  };

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 500));

    const stored = MOCK_USERS[email];
    if (!stored || stored.password !== password) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userData } = stored;
    setUser(userData);
    return userData;
  };

  /**
   * Login/register via wallet address
   */
  const loginWithWallet = async (walletAddress) => {
    await new Promise(r => setTimeout(r, 300));

    const existing = Object.values(MOCK_USERS).find(u => u.walletAddress === walletAddress);
    if (existing) {
      const { password: _, ...userData } = existing;
      setUser(userData);
      return userData;
    }

    // Create new user from wallet
    const newUser = {
      id: 'user_' + Date.now(),
      username: walletAddress.slice(0, 8) + '...' + walletAddress.slice(-4),
      email: null,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${walletAddress}`,
      stats: { wins: 0, losses: 0, draws: 0, elo: 1200, totalEarnings: 0 },
      walletAddress,
      createdAt: new Date().toISOString(),
    };

    MOCK_USERS[walletAddress] = newUser;
    setUser(newUser);
    return newUser;
  };

  /**
   * Update user stats after a match
   */
  const updateStats = (statsUpdate) => {
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, ...statsUpdate },
    }));
  };

  /**
   * Connect wallet to existing account
   */
  const connectWallet = (walletAddress) => {
    setUser(prev => ({ ...prev, walletAddress }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arena_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      loginWithWallet,
      logout,
      updateStats,
      connectWallet,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
