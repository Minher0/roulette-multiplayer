// Multiplayer types and utilities

export interface PlayerBet {
  id: string;
  playerId: string;
  betType: string;
  number: number | null;
  amount: number;
}

export interface Player {
  id: string;
  roomId: string;
  pseudo: string;
  balance: number;
  isHost: boolean;
  isReady: boolean;
  color: string;
  joinedAt: Date;
  bets: PlayerBet[];
}

export interface GameSpin {
  id: string;
  roomId: string;
  result: number;
  color: string;
  createdAt: Date;
}

export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  startingBalance: number;
  status: 'waiting' | 'playing' | 'spinning' | 'finished';
  currentSpinResult: number | null;
  spinStartTime: string | null;
  createdAt: Date;
  updatedAt: Date;
  players: Player[];
  spins: GameSpin[];
}

// Player colors for bet markers
export const PLAYER_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

// API functions
const API_BASE = '/api/rooms';

export async function createRoom(
  hostId: string, 
  hostName: string, 
  startingBalance: number = 1000
): Promise<{ room: GameRoom }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, hostName, startingBalance }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create room');
  }

  return response.json();
}

export async function joinRoom(
  code: string, 
  playerId: string, 
  pseudo: string
): Promise<{ room: GameRoom; player: Player; rejoined?: boolean }> {
  const response = await fetch(`${API_BASE}/${code.toUpperCase()}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, pseudo }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join room');
  }

  return response.json();
}

export async function leaveRoom(
  code: string, 
  playerId: string
): Promise<{ success: boolean; roomClosed?: boolean }> {
  const response = await fetch(`${API_BASE}/${code.toUpperCase()}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to leave room');
  }

  return response.json();
}

export async function setReady(
  code: string, 
  playerId: string, 
  isReady: boolean
): Promise<{ success: boolean; room: GameRoom }> {
  const response = await fetch(`${API_BASE}/${code.toUpperCase()}/ready`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, isReady }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to set ready status');
  }

  return response.json();
}

export async function placeBets(
  code: string, 
  playerId: string, 
  bets: { betType: string; number?: number; amount: number }[]
): Promise<{ success: boolean; room: GameRoom; player: Player }> {
  const response = await fetch(`${API_BASE}/${code.toUpperCase()}/bet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, bets }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to place bets');
  }

  return response.json();
}

export async function clearBets(
  code: string, 
  playerId: string
): Promise<{ success: boolean; room: GameRoom }> {
  const response = await fetch(`${API_BASE}/${code.toUpperCase()}/bet`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to clear bets');
  }

  return response.json();
}

export async function startSpin(
  code: string, 
  hostId: string
): Promise<{
  success: boolean;
  result: { number: number; color: string };
  spinStartTime: string;
  spinDuration: number;
  room: GameRoom;
  playerResults: { id: string; pseudo: string; totalWin: number; newBalance: number }[];
}> {
  const response = await fetch(`${API_BASE}/${code.toUpperCase()}/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to spin');
  }

  return response.json();
}

export async function syncRoom(
  code: string, 
  playerId?: string
): Promise<{
  room: GameRoom;
  currentPlayer: Player | null;
  timestamp: number;
}> {
  const url = playerId 
    ? `${API_BASE}/${code.toUpperCase()}/sync?playerId=${playerId}` 
    : `${API_BASE}/${code.toUpperCase()}/sync`;
  
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync room');
  }

  return response.json();
}

export async function startGame(
  code: string, 
  hostId: string
): Promise<{ room: GameRoom }> {
  const response = await fetch(`${API_BASE}/${code.toUpperCase()}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start game');
  }

  return response.json();
}

// Generate a unique player ID
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create player ID from localStorage
export function getPlayerId(): string {
  if (typeof window === 'undefined') return generatePlayerId();
  
  let playerId = localStorage.getItem('roulette_player_id');
  if (!playerId) {
    playerId = generatePlayerId();
    localStorage.setItem('roulette_player_id', playerId);
  }
  return playerId;
}
