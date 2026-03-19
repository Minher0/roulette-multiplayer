'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RED_NUMBERS, type Bet } from '@/lib/roulette';

interface OtherPlayerBet {
  id: string;
  playerId: string;
  betType: string;
  number: number | null;
  amount: number;
  playerColor: string;
  playerName: string;
}

interface BettingTableProps {
  bets: Bet[];
  selectedChip: number;
  onPlaceBet: (bet: Omit<Bet, 'amount'> & { amount?: number }) => void;
  onRemoveBet: (type: Bet['type'], number?: number) => void;
  disabled: boolean;
  lastResult: { number: number } | null;
  otherPlayersBets?: OtherPlayerBet[];
  playerColor?: string;
}

// Helper function to get number color
const getNumberColorClass = (num: number) => {
  if (num === 0) return 'bg-green-600 hover:bg-green-500';
  if (RED_NUMBERS.includes(num)) return 'bg-red-600 hover:bg-red-500';
  return 'bg-gray-900 hover:bg-gray-800';
};

// Number cell component with other players' bets shown
function NumberCell({ 
  num, 
  betAmount, 
  otherBets,
  isWinning, 
  disabled, 
  onPlaceBet, 
  onRemoveBet,
  playerColor,
}: { 
  num: number; 
  betAmount: number;
  otherBets: OtherPlayerBet[];
  isWinning: boolean; 
  disabled: boolean;
  onPlaceBet: () => void;
  onRemoveBet: () => void;
  playerColor: string;
}) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      onRemoveBet();
      setIsPressed(false);
    }, 500);
  }, [onRemoveBet]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) onPlaceBet();
  }, [disabled, onPlaceBet]);

  const formatBetAmount = (amount: number): string => {
    if (amount >= 1000) return `${(amount/1000).toFixed(0)}k`;
    return amount.toString();
  };

  // Group other bets by player
  const totalOtherAmount = otherBets.reduce((sum, b) => sum + b.amount, 0);
  const uniqueOtherPlayers = [...new Set(otherBets.map(b => b.playerName))];

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      onContextMenu={(e) => { e.preventDefault(); onRemoveBet(); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`
        relative flex items-center justify-center 
        text-white font-bold cursor-pointer
        border border-amber-600 transition-all rounded-sm select-none
        w-8 h-8 sm:w-12 sm:h-12 text-xs sm:text-base
        ${getNumberColorClass(num)}
        ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${isWinning ? 'ring-2 sm:ring-4 ring-amber-400 animate-pulse' : ''}
        ${isPressed ? 'bg-opacity-80' : ''}
      `}
    >
      {num}
      
      {/* Current player's bet */}
      {betAmount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs text-black font-bold shadow-lg border border-white/30"
          style={{ backgroundColor: playerColor }}
        >
          {formatBetAmount(betAmount)}
        </motion.div>
      )}

      {/* Other players' bets - shown as small dots */}
      {uniqueOtherPlayers.length > 0 && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
          {otherBets.slice(0, 3).map((b, i) => (
            <div
              key={b.id}
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full text-[6px] sm:text-[8px] flex items-center justify-center font-bold border border-white/50"
              style={{ backgroundColor: b.playerColor }}
              title={`${b.playerName}: ${formatBetAmount(b.amount)}`}
            >
              {formatBetAmount(b.amount)}
            </div>
          ))}
          {otherBets.length > 3 && (
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-600 text-[6px] sm:text-[8px] flex items-center justify-center font-bold">
              +{otherBets.length - 3}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Bet cell component
function BetCell({ 
  label, 
  className = '',
  betAmount,
  otherBets,
  disabled,
  onPlaceBet,
  onRemoveBet,
  playerColor,
}: { 
  label: string; 
  className?: string;
  betAmount: number;
  otherBets: OtherPlayerBet[];
  disabled: boolean;
  onPlaceBet: () => void;
  onRemoveBet: () => void;
  playerColor: string;
}) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      onRemoveBet();
      setIsPressed(false);
    }, 500);
  }, [onRemoveBet]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) onPlaceBet();
  }, [disabled, onPlaceBet]);

  const formatBetAmount = (amount: number): string => {
    if (amount >= 1000) return `${(amount/1000).toFixed(0)}k`;
    return amount.toString();
  };

  const uniqueOtherPlayers = [...new Set(otherBets.map(b => b.playerName))];

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      onContextMenu={(e) => { e.preventDefault(); onRemoveBet(); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`
        relative flex items-center justify-center 
        text-white font-bold cursor-pointer
        border border-amber-600 bg-emerald-800 hover:bg-emerald-700
        transition-all rounded-sm min-w-0 select-none
        h-8 sm:h-10 text-[10px] sm:text-xs
        ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${isPressed ? 'bg-opacity-80' : ''}
        ${className}
      `}
    >
      <span className="truncate px-1">{label}</span>
      
      {/* Current player's bet */}
      {betAmount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs text-black font-bold shadow-lg z-10"
          style={{ backgroundColor: playerColor }}
        >
          {formatBetAmount(betAmount)}
        </motion.div>
      )}

      {/* Other players' bets */}
      {uniqueOtherPlayers.length > 0 && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
          {otherBets.slice(0, 2).map((b) => (
            <div
              key={b.id}
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full text-[6px] sm:text-[8px] flex items-center justify-center font-bold border border-white/50"
              style={{ backgroundColor: b.playerColor }}
              title={`${b.playerName}: ${formatBetAmount(b.amount)}`}
            >
              {formatBetAmount(b.amount)}
            </div>
          ))}
          {otherBets.length > 2 && (
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-600 text-[6px] sm:text-[8px] flex items-center justify-center font-bold">
              +{otherBets.length - 2}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// 2:1 Column bet button - vertical
function ColumnBet({ 
  betAmount,
  otherBets,
  disabled, 
  onPlaceBet, 
  onRemoveBet,
  playerColor,
}: { 
  betAmount: number;
  otherBets: OtherPlayerBet[];
  disabled: boolean;
  onPlaceBet: () => void;
  onRemoveBet: () => void;
  playerColor: string;
}) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      onRemoveBet();
      setIsPressed(false);
    }, 500);
  }, [onRemoveBet]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) onPlaceBet();
  }, [disabled, onPlaceBet]);

  const formatBetAmount = (amount: number): string => {
    if (amount >= 1000) return `${(amount/1000).toFixed(0)}k`;
    return amount.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      onContextMenu={(e) => { e.preventDefault(); onRemoveBet(); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`
        relative flex items-center justify-center 
        text-white font-bold cursor-pointer
        border border-amber-600 bg-emerald-800 hover:bg-emerald-700
        transition-all rounded-sm select-none
        w-8 sm:w-10 h-8 sm:h-12 text-[10px] sm:text-xs
        ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${isPressed ? 'bg-opacity-80' : ''}
      `}
    >
      2:1
      
      {betAmount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs text-black font-bold shadow-lg z-10"
          style={{ backgroundColor: playerColor }}
        >
          {formatBetAmount(betAmount)}
        </motion.div>
      )}

      {otherBets.length > 0 && (
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 flex flex-col gap-0.5">
          {otherBets.slice(0, 2).map((b) => (
            <div
              key={b.id}
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full text-[6px] sm:text-[8px] flex items-center justify-center font-bold border border-white/50"
              style={{ backgroundColor: b.playerColor }}
            >
              {formatBetAmount(b.amount)}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function BettingTable({ 
  bets, 
  selectedChip, 
  onPlaceBet, 
  onRemoveBet, 
  disabled,
  lastResult,
  otherPlayersBets = [],
  playerColor = '#ef4444'
}: BettingTableProps) {
  const getBetAmount = (type: Bet['type'], number?: number) => {
    return bets.find(b => b.type === type && b.number === number)?.amount || 0;
  };

  const getOtherBets = (betType: string, number?: number): OtherPlayerBet[] => {
    return otherPlayersBets.filter(b => {
      if (number !== undefined) {
        return b.betType === betType && b.number === number;
      }
      return b.betType === betType;
    });
  };

  const handlePlaceBet = (type: Bet['type'], number?: number) => {
    if (disabled) return;
    onPlaceBet({ type, number, amount: selectedChip });
  };

  const handleRemoveBet = (type: Bet['type'], number?: number) => {
    if (!disabled) onRemoveBet(type, number);
  };

  // Real roulette table layout (12 columns x 3 rows)
  const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

  return (
    <div className="bg-emerald-900 p-2 sm:p-4 rounded-xl border-2 sm:border-4 border-amber-700 shadow-2xl relative">
      {/* Main table layout */}
      <div className="flex gap-1 sm:gap-2 mb-1 sm:mb-2 items-stretch justify-center">
        
        {/* Zero on the left */}
        <div className="flex items-center">
          <NumberCell 
            num={0} 
            betAmount={getBetAmount('straight', 0)}
            otherBets={getOtherBets('straight', 0)}
            isWinning={lastResult?.number === 0}
            disabled={disabled}
            onPlaceBet={() => handlePlaceBet('straight', 0)}
            onRemoveBet={() => handleRemoveBet('straight', 0)}
            playerColor={playerColor}
          />
        </div>

        {/* Numbers grid - 12 columns x 3 rows */}
        <div className="flex flex-col gap-1 sm:gap-1">
          {/* Row 1 */}
          <div className="flex gap-[1px] sm:gap-1">
            {row1.map((num) => (
              <NumberCell 
                key={num} 
                num={num} 
                betAmount={getBetAmount('straight', num)}
                otherBets={getOtherBets('straight', num)}
                isWinning={lastResult?.number === num}
                disabled={disabled}
                onPlaceBet={() => handlePlaceBet('straight', num)}
                onRemoveBet={() => handleRemoveBet('straight', num)}
                playerColor={playerColor}
              />
            ))}
          </div>
          {/* Row 2 */}
          <div className="flex gap-[1px] sm:gap-1">
            {row2.map((num) => (
              <NumberCell 
                key={num} 
                num={num} 
                betAmount={getBetAmount('straight', num)}
                otherBets={getOtherBets('straight', num)}
                isWinning={lastResult?.number === num}
                disabled={disabled}
                onPlaceBet={() => handlePlaceBet('straight', num)}
                onRemoveBet={() => handleRemoveBet('straight', num)}
                playerColor={playerColor}
              />
            ))}
          </div>
          {/* Row 3 */}
          <div className="flex gap-[1px] sm:gap-1">
            {row3.map((num) => (
              <NumberCell 
                key={num} 
                num={num} 
                betAmount={getBetAmount('straight', num)}
                otherBets={getOtherBets('straight', num)}
                isWinning={lastResult?.number === num}
                disabled={disabled}
                onPlaceBet={() => handlePlaceBet('straight', num)}
                onRemoveBet={() => handleRemoveBet('straight', num)}
                playerColor={playerColor}
              />
            ))}
          </div>
        </div>

        {/* 2:1 Column bets on the RIGHT */}
        <div className="flex flex-col gap-1 sm:gap-1">
          <ColumnBet 
            betAmount={getBetAmount('column3')}
            otherBets={getOtherBets('column3')}
            disabled={disabled} 
            onPlaceBet={() => handlePlaceBet('column3')} 
            onRemoveBet={() => handleRemoveBet('column3')}
            playerColor={playerColor}
          />
          <ColumnBet 
            betAmount={getBetAmount('column2')}
            otherBets={getOtherBets('column2')}
            disabled={disabled} 
            onPlaceBet={() => handlePlaceBet('column2')} 
            onRemoveBet={() => handleRemoveBet('column2')}
            playerColor={playerColor}
          />
          <ColumnBet 
            betAmount={getBetAmount('column1')}
            otherBets={getOtherBets('column1')}
            disabled={disabled} 
            onPlaceBet={() => handlePlaceBet('column1')} 
            onRemoveBet={() => handleRemoveBet('column1')}
            playerColor={playerColor}
          />
        </div>
      </div>

      {/* Dozen bets */}
      <div className="grid grid-cols-3 gap-1 sm:gap-1 mb-1 sm:mb-2">
        <BetCell label="1-12" betAmount={getBetAmount('dozen1')} otherBets={getOtherBets('dozen1')} disabled={disabled} onPlaceBet={() => handlePlaceBet('dozen1')} onRemoveBet={() => handleRemoveBet('dozen1')} playerColor={playerColor} />
        <BetCell label="13-24" betAmount={getBetAmount('dozen2')} otherBets={getOtherBets('dozen2')} disabled={disabled} onPlaceBet={() => handlePlaceBet('dozen2')} onRemoveBet={() => handleRemoveBet('dozen2')} playerColor={playerColor} />
        <BetCell label="25-36" betAmount={getBetAmount('dozen3')} otherBets={getOtherBets('dozen3')} disabled={disabled} onPlaceBet={() => handlePlaceBet('dozen3')} onRemoveBet={() => handleRemoveBet('dozen3')} playerColor={playerColor} />
      </div>

      {/* Outside bets */}
      <div className="grid grid-cols-6 gap-1 sm:gap-1">
        <BetCell label="1-18" betAmount={getBetAmount('low')} otherBets={getOtherBets('low')} disabled={disabled} onPlaceBet={() => handlePlaceBet('low')} onRemoveBet={() => handleRemoveBet('low')} playerColor={playerColor} />
        <BetCell label="PAIR" betAmount={getBetAmount('even')} otherBets={getOtherBets('even')} disabled={disabled} onPlaceBet={() => handlePlaceBet('even')} onRemoveBet={() => handleRemoveBet('even')} playerColor={playerColor} />
        <BetCell label="ROUGE" className="bg-red-600 hover:bg-red-500" betAmount={getBetAmount('red')} otherBets={getOtherBets('red')} disabled={disabled} onPlaceBet={() => handlePlaceBet('red')} onRemoveBet={() => handleRemoveBet('red')} playerColor={playerColor} />
        <BetCell label="NOIR" className="bg-gray-900 hover:bg-gray-800" betAmount={getBetAmount('black')} otherBets={getOtherBets('black')} disabled={disabled} onPlaceBet={() => handlePlaceBet('black')} onRemoveBet={() => handleRemoveBet('black')} playerColor={playerColor} />
        <BetCell label="IMPAIR" betAmount={getBetAmount('odd')} otherBets={getOtherBets('odd')} disabled={disabled} onPlaceBet={() => handlePlaceBet('odd')} onRemoveBet={() => handleRemoveBet('odd')} playerColor={playerColor} />
        <BetCell label="19-36" betAmount={getBetAmount('high')} otherBets={getOtherBets('high')} disabled={disabled} onPlaceBet={() => handlePlaceBet('high')} onRemoveBet={() => handleRemoveBet('high')} playerColor={playerColor} />
      </div>

      {/* Payout info */}
      <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-amber-200/70 text-center">
        Numéro: 35:1 | Couleur/Pair/Impair: 1:1 | Douzaine/Colonne: 2:1
      </div>
    </div>
  );
}
