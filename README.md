# 🎮 CodeArena — Gamified Competitive Coding Arena

A competitive coding platform where developers stake XLM (Stellar Lumens), battle head-to-head in algorithmic challenges, and win crypto rewards via Soroban smart contracts.

## 🏗️ Architecture

```
codearena/
├── client/          # React + Tailwind CSS frontend
├── server/          # Node.js + Express + Socket.IO backend
└── contracts/       # Soroban smart contracts (escrow)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- (Optional) Freighter Wallet browser extension

### 1. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Start the Backend

```bash
cd server
npm run dev
```

Server runs on `http://localhost:3001`

### 3. Start the Frontend

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Open in Browser

Navigate to `http://localhost:5173` to access the arena.

## ✨ Features

### 🔐 Authentication
- Email signup/login with JWT
- Freighter wallet connection
- Persistent sessions

### 💰 Staking System
- Stake XLM to create or join matches
- Smart contract escrow (mock for testnet)
- Automatic payout to winners

### ⚔️ Matchmaking
- Public lobby with real-time match listing
- Create private rooms with invite links
- Filter by difficulty, search by player

### 💻 Coding Arena
- Monaco Editor (VS Code engine)
- Timer countdown (15 min default)
- Problem statement panel
- Language selection (Python, C++, Java, JavaScript)
- Run & Submit with test case evaluation
- Real-time opponent status (typing, submitted)

### 🧠 Evaluation System
- Auto-judge via test cases
- Score = correctness (70%) + speed (30%)
- Anti-cheat: tab switch detection

### 🏆 Results & Rewards
- Winner determined automatically
- XLM payout with transaction hash
- ELO rating changes
- Victory/defeat animations

### 📊 Dashboard & Leaderboard
- Wallet balance display
- Match history with W/L/D
- Win streak tracker
- Achievement badges
- Global ELO leaderboard with podium

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 3, Framer Motion |
| Editor | Monaco Editor (VS Code engine) |
| Backend | Node.js, Express, Socket.IO |
| Blockchain | Stellar, Soroban Smart Contracts |
| Wallet | Freighter Wallet API |
| Real-time | WebSocket (Socket.IO) |
| Auth | JWT + bcrypt |

## 🎨 Design System

- **Theme**: Neo-brutalist dark with neon accents
- **Colors**: Cyan (#00f0ff), Pink (#ff00e5), Yellow (#f0ff00)
- **Fonts**: Outfit (display), Inter (body), JetBrains Mono (code)
- **Effects**: Glassmorphism, neon glow, brutal shadows

## 📝 Notes

- This is a **working prototype** with mock data and simulated blockchain transactions
- For production: integrate Judge0 API for real code execution, deploy Soroban contracts to testnet/mainnet, use MongoDB/Firebase for persistence
- The Freighter wallet integration works when the extension is installed; falls back to mock wallet otherwise
