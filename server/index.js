const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * CodeArena Backend Server
 * 
 * Provides REST API endpoints and WebSocket communication
 * for the competitive coding arena platform.
 */

const app = express();
const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Config
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'arena-secret-key-change-in-production';

// ============================================
// In-Memory Database (prototype)
// Replace with MongoDB/Firebase in production
// ============================================

const db = {
  users: new Map(),
  matches: new Map(),
  problems: [],
};

// Seed problems
db.problems = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    timeLimit: 900, // 15 minutes
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: 'Write a function that reverses a string in-place.',
    testCases: [
      { input: ['h', 'e', 'l', 'l', 'o'], expected: ['o', 'l', 'l', 'e', 'h'] },
      { input: ['H', 'a', 'n', 'n', 'a', 'h'], expected: ['h', 'a', 'n', 'n', 'a', 'H'] },
    ],
    timeLimit: 600,
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    testCases: [
      { input: '()', expected: true },
      { input: '()[]{}', expected: true },
      { input: '(]', expected: false },
    ],
    timeLimit: 900,
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Hard',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    testCases: [
      { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expected: 6 },
      { input: [1], expected: 1 },
      { input: [5, 4, -1, 7, 8], expected: 23 },
    ],
    timeLimit: 900,
  },
];

// ============================================
// Auth Middleware
// ============================================

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ============================================
// REST API Routes
// ============================================

/**
 * POST /api/auth/signup - Register a new user
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    for (const [, user] of db.users) {
      if (user.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const user = {
      id,
      username,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      stats: { wins: 0, losses: 0, draws: 0, elo: 1200, totalEarnings: 0 },
      walletAddress: null,
      matchHistory: [],
      createdAt: new Date().toISOString(),
    };

    db.users.set(id, user);

    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/login - Login with email and password
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let foundUser = null;
    for (const [, user] of db.users) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, foundUser.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: foundUser.id }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...safeUser } = foundUser;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/problems - Get available coding problems
 */
app.get('/api/problems', (req, res) => {
  const { difficulty } = req.query;
  let problems = db.problems;

  if (difficulty) {
    problems = problems.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  // Don't send test cases to the client (anti-cheat)
  const sanitized = problems.map(({ testCases, ...rest }) => ({
    ...rest,
    testCaseCount: testCases.length,
  }));

  res.json(sanitized);
});

/**
 * GET /api/matches - Get active matches in the lobby
 */
app.get('/api/matches', (req, res) => {
  const matches = [];
  for (const [, match] of db.matches) {
    if (match.status === 'waiting') {
      matches.push({
        id: match.id,
        creator: match.creatorName,
        stake: match.stake,
        difficulty: match.difficulty,
        language: match.language,
        elo: match.creatorElo,
        isPrivate: match.isPrivate,
        status: match.status,
      });
    }
  }
  res.json(matches);
});

/**
 * POST /api/matches - Create a new match
 */
app.post('/api/matches', authMiddleware, (req, res) => {
  const { stake, difficulty, language, isPrivate } = req.body;
  const user = db.users.get(req.userId);

  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = {
    id: uuidv4(),
    creatorId: user.id,
    creatorName: user.username,
    creatorElo: user.stats.elo,
    opponentId: null,
    opponentName: null,
    stake: stake || 50,
    difficulty: difficulty || 'Medium',
    language: language || 'Any',
    isPrivate: isPrivate || false,
    inviteCode: isPrivate ? uuidv4().substr(0, 8) : null,
    status: 'waiting', // waiting, active, completed
    problemId: null,
    startTime: null,
    endTime: null,
    results: null,
  };

  db.matches.set(match.id, match);
  res.json(match);
});

/**
 * POST /api/matches/:id/join - Join an existing match
 */
app.post('/api/matches/:id/join', authMiddleware, (req, res) => {
  const match = db.matches.get(req.params.id);
  const user = db.users.get(req.userId);

  if (!match) return res.status(404).json({ error: 'Match not found' });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (match.status !== 'waiting') return res.status(400).json({ error: 'Match already started' });
  if (match.creatorId === user.id) return res.status(400).json({ error: 'Cannot join your own match' });

  // Assign problem
  const difficulty = match.difficulty.toLowerCase();
  const availableProblems = db.problems.filter(p => 
    p.difficulty.toLowerCase() === difficulty || match.difficulty === 'Any'
  );
  const problem = availableProblems[Math.floor(Math.random() * availableProblems.length)] || db.problems[0];

  match.opponentId = user.id;
  match.opponentName = user.username;
  match.status = 'active';
  match.problemId = problem.id;
  match.startTime = Date.now();

  res.json(match);
});

/**
 * POST /api/matches/:id/submit - Submit a solution
 */
app.post('/api/matches/:id/submit', authMiddleware, (req, res) => {
  const { code, language } = req.body;
  const match = db.matches.get(req.params.id);

  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Find the problem
  const problem = db.problems.find(p => p.id === match.problemId) || db.problems[0];

  // Mock code evaluation (in production, use Judge0 API)
  const testResults = problem.testCases.map((tc, i) => ({
    testCase: i + 1,
    passed: Math.random() > 0.3, // Mock: 70% pass rate
    time: Math.random() * 100,
  }));

  const passed = testResults.filter(t => t.passed).length;
  const totalTime = Date.now() - (match.startTime || Date.now());
  const score = (passed / testResults.length) * 700 + Math.max(0, 300 - totalTime / 1000);

  res.json({
    testResults,
    passed,
    total: testResults.length,
    score: Math.round(score),
    time: totalTime,
  });
});

/**
 * GET /api/leaderboard - Get global leaderboard
 */
app.get('/api/leaderboard', (req, res) => {
  const users = [];
  for (const [, user] of db.users) {
    users.push({
      username: user.username,
      elo: user.stats.elo,
      wins: user.stats.wins,
      losses: user.stats.losses,
      earnings: user.stats.totalEarnings,
    });
  }

  // Sort by ELO
  users.sort((a, b) => b.elo - a.elo);

  // Add rank
  const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }));

  res.json(ranked);
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    activeMatches: db.matches.size,
    totalUsers: db.users.size,
  });
});

// ============================================
// WebSocket Handlers
// ============================================

// Track connected users
const connectedUsers = new Map(); // socketId -> { userId, matchId }

io.on('connection', (socket) => {
  console.log(`⚡ Player connected: ${socket.id}`);

  /**
   * Join a match room
   */
  socket.on('join_match', ({ matchId, userId, username }) => {
    socket.join(matchId);
    connectedUsers.set(socket.id, { userId, matchId, username });
    
    // Notify room
    socket.to(matchId).emit('opponent_joined', { username, userId });
    console.log(`🎮 ${username} joined match ${matchId}`);
  });

  /**
   * Player typing/coding update (real-time status)
   */
  socket.on('coding_status', ({ matchId, status }) => {
    socket.to(matchId).emit('opponent_status', {
      userId: connectedUsers.get(socket.id)?.userId,
      status, // 'coding', 'testing', 'submitted', 'idle'
    });
  });

  /**
   * Code submission event
   */
  socket.on('submit_code', ({ matchId, score }) => {
    socket.to(matchId).emit('opponent_submitted', {
      username: connectedUsers.get(socket.id)?.username,
      score,
    });
  });

  /**
   * Chat message in match
   */
  socket.on('chat_message', ({ matchId, message }) => {
    const user = connectedUsers.get(socket.id);
    socket.to(matchId).emit('chat_message', {
      username: user?.username || 'Anonymous',
      message,
      timestamp: Date.now(),
    });
  });

  /**
   * Match completed
   */
  socket.on('match_completed', ({ matchId, winnerId, results }) => {
    io.to(matchId).emit('match_result', { winnerId, results });
    
    // Update match in DB
    const match = db.matches.get(matchId);
    if (match) {
      match.status = 'completed';
      match.endTime = Date.now();
      match.results = results;
    }
  });

  /**
   * Anti-cheat: tab switch detection
   */
  socket.on('tab_switch', ({ matchId }) => {
    const user = connectedUsers.get(socket.id);
    socket.to(matchId).emit('opponent_tab_switch', {
      username: user?.username,
    });
    console.log(`⚠️ Tab switch detected for ${user?.username} in match ${matchId}`);
  });

  /**
   * Disconnect handler
   */
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    if (userData?.matchId) {
      socket.to(userData.matchId).emit('opponent_disconnected', {
        username: userData.username,
      });
    }
    connectedUsers.delete(socket.id);
    console.log(`💔 Player disconnected: ${socket.id}`);
  });
});

// ============================================
// Start Server
// ============================================

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     ⚡ CODEARENA SERVER ONLINE ⚡       ║
  ║                                          ║
  ║  REST API: http://localhost:${PORT}        ║
  ║  WebSocket: ws://localhost:${PORT}         ║
  ║  Health: http://localhost:${PORT}/api/health║
  ║                                          ║
  ║  Problems loaded: ${db.problems.length}                    ║
  ╚══════════════════════════════════════════╝
  `);
});
