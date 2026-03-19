// Roulette Game Logic - European Roulette (0-36)

// Red numbers in European roulette
export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Black numbers in European roulette
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// Wheel number order (European roulette wheel sequence)
export const WHEEL_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export type BetType = 
  | 'straight'      // Single number (35:1)
  | 'red'           // Red color (1:1)
  | 'black'         // Black color (1:1)
  | 'odd'           // Odd numbers (1:1)
  | 'even'          // Even numbers (1:1)
  | 'low'           // 1-18 (1:1)
  | 'high'          // 19-36 (1:1)
  | 'dozen1'        // 1-12 (2:1)
  | 'dozen2'        // 13-24 (2:1)
  | 'dozen3'        // 25-36 (2:1)
  | 'column1'       // Column 1 (2:1)
  | 'column2'       // Column 2 (2:1)
  | 'column3';      // Column 3 (2:1)

export interface Bet {
  type: BetType;
  amount: number;
  number?: number; // For straight bets
}

export interface SpinResult {
  number: number;
  color: 'red' | 'black' | 'green';
  isOdd: boolean;
  isEven: boolean;
  isLow: boolean;
  isHigh: boolean;
  dozen: 1 | 2 | 3 | 0;
  column: 1 | 2 | 3 | 0;
}

export interface WinResult {
  totalWin: number;
  totalBet: number;
  netResult: number;
  winningBets: Array<{
    bet: Bet;
    winAmount: number;
  }>;
}

// Get the color of a number
export function getNumberColor(number: number): 'red' | 'black' | 'green' {
  if (number === 0) return 'green';
  if (RED_NUMBERS.includes(number)) return 'red';
  return 'black';
}

// Generate a random spin result
export function spin(): SpinResult {
  const number = Math.floor(Math.random() * 37); // 0-36
  return getSpinResult(number);
}

// Get detailed result from a number
export function getSpinResult(number: number): SpinResult {
  const color = getNumberColor(number);
  
  let dozen: 1 | 2 | 3 | 0;
  if (number === 0) dozen = 0;
  else if (number <= 12) dozen = 1;
  else if (number <= 24) dozen = 2;
  else dozen = 3;

  let column: 1 | 2 | 3 | 0;
  if (number === 0) column = 0;
  else if (number % 3 === 1) column = 1;
  else if (number % 3 === 2) column = 2;
  else column = 3;

  return {
    number,
    color,
    isOdd: number !== 0 && number % 2 === 1,
    isEven: number !== 0 && number % 2 === 0,
    isLow: number >= 1 && number <= 18,
    isHigh: number >= 19 && number <= 36,
    dozen,
    column
  };
}

// Get payout multiplier for a bet type
export function getPayoutMultiplier(betType: BetType): number {
  switch (betType) {
    case 'straight':
      return 35;
    case 'red':
    case 'black':
    case 'odd':
    case 'even':
    case 'low':
    case 'high':
      return 1;
    case 'dozen1':
    case 'dozen2':
    case 'dozen3':
    case 'column1':
    case 'column2':
    case 'column3':
      return 2;
    default:
      return 0;
  }
}

// Check if a bet wins based on the result
export function isBetWin(bet: Bet, result: SpinResult): boolean {
  switch (bet.type) {
    case 'straight':
      return bet.number === result.number;
    case 'red':
      return result.color === 'red';
    case 'black':
      return result.color === 'black';
    case 'odd':
      return result.isOdd;
    case 'even':
      return result.isEven;
    case 'low':
      return result.isLow;
    case 'high':
      return result.isHigh;
    case 'dozen1':
      return result.dozen === 1;
    case 'dozen2':
      return result.dozen === 2;
    case 'dozen3':
      return result.dozen === 3;
    case 'column1':
      return result.column === 1;
    case 'column2':
      return result.column === 2;
    case 'column3':
      return result.column === 3;
    default:
      return false;
  }
}

// Calculate winnings for all bets
export function calculateWinnings(bets: Bet[], result: SpinResult): WinResult {
  let totalWin = 0;
  let totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const winningBets: WinResult['winningBets'] = [];

  for (const bet of bets) {
    if (isBetWin(bet, result)) {
      const multiplier = getPayoutMultiplier(bet.type);
      const winAmount = bet.amount + (bet.amount * multiplier);
      totalWin += winAmount;
      winningBets.push({ bet, winAmount });
    }
  }

  return {
    totalWin,
    totalBet,
    netResult: totalWin - totalBet,
    winningBets
  };
}

// Get the angle for a number on the wheel (for animation)
export function getNumberAngle(number: number): number {
  const index = WHEEL_SEQUENCE.indexOf(number);
  return (index / 37) * 360;
}

// Chip values
export const CHIP_VALUES = [1, 5, 10, 25, 50, 100, 500];

// Chip colors
export function getChipColor(value: number): string {
  switch (value) {
    case 1: return 'bg-white border-gray-400 text-gray-800';
    case 5: return 'bg-red-500 border-red-700 text-white';
    case 10: return 'bg-blue-500 border-blue-700 text-white';
    case 25: return 'bg-green-500 border-green-700 text-white';
    case 50: return 'bg-orange-500 border-orange-700 text-white';
    case 100: return 'bg-black border-gray-600 text-white';
    case 500: return 'bg-purple-500 border-purple-700 text-white';
    default: return 'bg-gray-500 border-gray-600 text-white';
  }
}

// Format currency
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
