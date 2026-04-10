// ==================================================================
// CodeArena Escrow Smart Contract (Soroban / Rust)
// ==================================================================
//
// This file contains the Soroban smart contract logic for the
// CodeArena platform's escrow system. It handles:
//
// 1. Accepting stakes from both players
// 2. Locking funds in escrow during the match
// 3. Releasing funds to the winner automatically
// 4. Handling draws/refunds
//
// NOTE: This is Rust source code for Soroban (Stellar's smart contract platform).
// To deploy, you would need the Soroban SDK and Stellar CLI.
//
// Build: soroban contract build
// Deploy: soroban contract deploy --wasm target/wasm32-unknown-unknown/release/arena_escrow.wasm
// ==================================================================

/*
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Symbol, Vec,
};

/// Match states
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MatchStatus {
    /// Waiting for second player
    WaitingForOpponent,
    /// Both players staked, match in progress
    Active,
    /// Match completed, winner determined
    Completed,
    /// Match cancelled, refunds issued
    Cancelled,
    /// Draw, both players refunded
    Draw,
}

/// Storage key for a match
#[contracttype]
#[derive(Clone)]
pub struct MatchKey {
    pub match_id: Symbol,
}

/// Match data stored on-chain
#[contracttype]
#[derive(Clone)]
pub struct MatchData {
    pub match_id: Symbol,
    pub player1: Address,
    pub player2: Address,
    pub stake_amount: i128,
    pub status: MatchStatus,
    pub winner: Address,
    pub created_at: u64,
    pub token: Address,         // XLM token contract address
    pub platform_fee_bps: u32,  // Platform fee in basis points (e.g., 500 = 5%)
}

#[contract]
pub struct ArenaEscrow;

#[contractimpl]
impl ArenaEscrow {
    /// Initialize the contract with platform settings
    pub fn initialize(env: Env, admin: Address, token: Address, fee_bps: u32) {
        admin.require_auth();
        
        // Store admin and settings
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "token"), &token);
        env.storage().instance().set(&Symbol::new(&env, "fee_bps"), &fee_bps);
    }

    /// Create a match and stake XLM.
    /// Player 1 calls this to create a new match with their stake.
    pub fn create_match(
        env: Env,
        player1: Address,
        match_id: Symbol,
        stake_amount: i128,
    ) -> MatchData {
        // Require player1 authorization
        player1.require_auth();
        
        // Get token contract
        let token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let fee_bps: u32 = env.storage().instance().get(&Symbol::new(&env, "fee_bps")).unwrap();
        
        // Transfer stake from player1 to this contract
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&player1, &env.current_contract_address(), &stake_amount);
        
        // Create match record
        let match_data = MatchData {
            match_id: match_id.clone(),
            player1: player1.clone(),
            player2: player1.clone(), // Placeholder, updated when opponent joins
            stake_amount,
            status: MatchStatus::WaitingForOpponent,
            winner: player1.clone(), // Placeholder
            created_at: env.ledger().timestamp(),
            token: token_addr,
            platform_fee_bps: fee_bps,
        };
        
        // Store match data
        env.storage().persistent().set(&match_id, &match_data);
        
        match_data
    }

    /// Join a match and stake XLM.
    /// Player 2 calls this to join an existing match.
    pub fn join_match(
        env: Env,
        player2: Address,
        match_id: Symbol,
    ) -> MatchData {
        player2.require_auth();
        
        // Get match data
        let mut match_data: MatchData = env.storage().persistent().get(&match_id).unwrap();
        
        // Verify match is waiting for opponent
        assert!(match_data.status == MatchStatus::WaitingForOpponent, "Match not available");
        assert!(match_data.player1 != player2, "Cannot join your own match");
        
        // Transfer stake from player2
        let token_client = token::Client::new(&env, &match_data.token);
        token_client.transfer(&player2, &env.current_contract_address(), &match_data.stake_amount);
        
        // Update match
        match_data.player2 = player2;
        match_data.status = MatchStatus::Active;
        
        env.storage().persistent().set(&match_id, &match_data);
        
        match_data
    }

    /// Declare the winner and release funds.
    /// Only the admin (oracle/server) can call this.
    pub fn declare_winner(
        env: Env,
        admin: Address,
        match_id: Symbol,
        winner: Address,
    ) {
        admin.require_auth();
        
        // Verify admin
        let stored_admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        assert!(admin == stored_admin, "Unauthorized");
        
        let mut match_data: MatchData = env.storage().persistent().get(&match_id).unwrap();
        assert!(match_data.status == MatchStatus::Active, "Match not active");
        
        // Calculate payout (total pool minus platform fee)
        let total_pool = match_data.stake_amount * 2;
        let fee = (total_pool * match_data.platform_fee_bps as i128) / 10000;
        let payout = total_pool - fee;
        
        // Transfer winnings to winner
        let token_client = token::Client::new(&env, &match_data.token);
        token_client.transfer(&env.current_contract_address(), &winner, &payout);
        
        // Transfer fee to admin
        if fee > 0 {
            token_client.transfer(&env.current_contract_address(), &stored_admin, &fee);
        }
        
        // Update match
        match_data.winner = winner;
        match_data.status = MatchStatus::Completed;
        
        env.storage().persistent().set(&match_id, &match_data);
    }

    /// Handle a draw - refund both players
    pub fn declare_draw(
        env: Env,
        admin: Address,
        match_id: Symbol,
    ) {
        admin.require_auth();
        
        let stored_admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        assert!(admin == stored_admin, "Unauthorized");
        
        let mut match_data: MatchData = env.storage().persistent().get(&match_id).unwrap();
        assert!(match_data.status == MatchStatus::Active, "Match not active");
        
        // Refund both players
        let token_client = token::Client::new(&env, &match_data.token);
        token_client.transfer(&env.current_contract_address(), &match_data.player1, &match_data.stake_amount);
        token_client.transfer(&env.current_contract_address(), &match_data.player2, &match_data.stake_amount);
        
        // Update match
        match_data.status = MatchStatus::Draw;
        env.storage().persistent().set(&match_id, &match_data);
    }

    /// Cancel a match (only before opponent joins).
    /// Refunds player1's stake.
    pub fn cancel_match(
        env: Env,
        player: Address,
        match_id: Symbol,
    ) {
        player.require_auth();
        
        let mut match_data: MatchData = env.storage().persistent().get(&match_id).unwrap();
        assert!(match_data.status == MatchStatus::WaitingForOpponent, "Cannot cancel active match");
        assert!(match_data.player1 == player, "Only creator can cancel");
        
        // Refund
        let token_client = token::Client::new(&env, &match_data.token);
        token_client.transfer(&env.current_contract_address(), &player, &match_data.stake_amount);
        
        // Update match
        match_data.status = MatchStatus::Cancelled;
        env.storage().persistent().set(&match_id, &match_data);
    }

    /// Get match data
    pub fn get_match(env: Env, match_id: Symbol) -> MatchData {
        env.storage().persistent().get(&match_id).unwrap()
    }
}
*/

// ==================================================================
// JavaScript mock of the smart contract for testing
// ==================================================================

/**
 * MockEscrowContract simulates the Soroban smart contract behavior
 * for development and testing without deploying to the blockchain.
 */
class MockEscrowContract {
  constructor() {
    this.matches = new Map();
    this.platformFeeBps = 500; // 5% fee
  }

  /**
   * Create a match escrow
   * @param {string} player1 - Player 1 wallet address
   * @param {string} matchId - Unique match identifier
   * @param {number} stakeAmount - Stake in XLM (stroops)
   * @returns {object} Match data
   */
  createMatch(player1, matchId, stakeAmount) {
    if (this.matches.has(matchId)) {
      throw new Error('Match already exists');
    }

    const matchData = {
      matchId,
      player1,
      player2: null,
      stakeAmount,
      status: 'waiting_for_opponent',
      winner: null,
      totalPool: stakeAmount,
      createdAt: Date.now(),
    };

    this.matches.set(matchId, matchData);
    console.log(`📝 Escrow created: Match ${matchId}, Stake ${stakeAmount} XLM from ${player1.slice(0, 8)}...`);
    return matchData;
  }

  /**
   * Join a match and add stake to escrow
   */
  joinMatch(player2, matchId) {
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match not found');
    if (match.status !== 'waiting_for_opponent') throw new Error('Match not available');
    if (match.player1 === player2) throw new Error('Cannot join own match');

    match.player2 = player2;
    match.status = 'active';
    match.totalPool = match.stakeAmount * 2;

    console.log(`🤝 Player joined: ${player2.slice(0, 8)}... joined match ${matchId}`);
    console.log(`💰 Total pool: ${match.totalPool} XLM`);
    return match;
  }

  /**
   * Declare winner and release funds
   */
  declareWinner(matchId, winnerAddress) {
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match not found');
    if (match.status !== 'active') throw new Error('Match not active');

    const fee = (match.totalPool * this.platformFeeBps) / 10000;
    const payout = match.totalPool - fee;

    match.winner = winnerAddress;
    match.status = 'completed';
    match.payout = payout;
    match.fee = fee;

    console.log(`🏆 Winner: ${winnerAddress.slice(0, 8)}...`);
    console.log(`💸 Payout: ${payout} XLM (fee: ${fee} XLM)`);

    return {
      winner: winnerAddress,
      payout,
      fee,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    };
  }

  /**
   * Declare draw and refund both players
   */
  declareDraw(matchId) {
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match not found');
    if (match.status !== 'active') throw new Error('Match not active');

    match.status = 'draw';

    console.log(`🤝 Draw declared for match ${matchId}. Refunding both players.`);

    return {
      player1Refund: match.stakeAmount,
      player2Refund: match.stakeAmount,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    };
  }

  /**
   * Cancel match and refund creator
   */
  cancelMatch(matchId, playerAddress) {
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match not found');
    if (match.status !== 'waiting_for_opponent') throw new Error('Cannot cancel');
    if (match.player1 !== playerAddress) throw new Error('Not creator');

    match.status = 'cancelled';

    return {
      refund: match.stakeAmount,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
    };
  }
}

module.exports = { MockEscrowContract };
