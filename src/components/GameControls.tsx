'use client';

import { motion } from 'framer-motion';
import { Play, RotateCcw, Trash2, Crown, Clock } from 'lucide-react';
import { formatMoney } from '@/lib/roulette';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  balance: number;
  totalBet: number;
  canSpin: boolean;
  isSpinning: boolean;
  onSpin: () => void;
  onClearBets: () => void;
  onResetGame: () => void;
  gameStarted: boolean;
  isMultiplayer?: boolean;
  isHost?: boolean;
}

export default function GameControls({
  balance,
  totalBet,
  canSpin,
  isSpinning,
  onSpin,
  onClearBets,
  onResetGame,
  gameStarted,
  isMultiplayer = false,
  isHost = true
}: GameControlsProps) {
  // In multiplayer, only the host can spin
  const showSpinButton = !isMultiplayer || isHost;
  
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Balance display - Glassmorphism style */}
      <div className="relative overflow-hidden bg-gray-900/80 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/5">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex justify-between items-center">
          <div>
            <p className="text-amber-400/80 text-xs sm:text-sm font-medium">
              Solde
              {isMultiplayer && isHost && <Crown className="inline ml-1 h-3 w-3 text-amber-400" />}
            </p>
            <p className="text-white text-lg sm:text-2xl font-bold drop-shadow-lg">{formatMoney(balance)}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-400/80 text-xs sm:text-sm font-medium">Mise totale</p>
            <p className="text-amber-300 text-base sm:text-xl font-bold">{formatMoney(totalBet)}</p>
          </div>
        </div>
      </div>

      {/* Waiting message for non-host players in multiplayer */}
      {isMultiplayer && !isHost && (
        <div className="flex items-center justify-center gap-2 py-4 px-4 bg-blue-900/30 rounded-xl border border-blue-500/30">
          <Clock className="h-5 w-5 text-blue-400 animate-pulse" />
          <p className="text-blue-300 text-sm font-medium">
            En attente de l&apos;hôte pour tourner...
          </p>
        </div>
      )}

      {/* Action buttons - responsive layout */}
      <div className="flex gap-2 sm:gap-3 justify-center">
        {showSpinButton && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
            <Button
              onClick={onSpin}
              disabled={!canSpin || isSpinning}
              className={`
                w-full sm:w-auto px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg font-bold rounded-xl
                bg-gradient-to-r from-green-600 via-green-500 to-green-600
                hover:from-green-500 hover:via-green-400 hover:to-green-500
                disabled:from-gray-700 disabled:via-gray-600 disabled:to-gray-700
                text-white shadow-lg shadow-green-500/30
                disabled:shadow-none
                transition-all duration-300
                ${canSpin && !isSpinning ? 'animate-pulse shadow-green-500/50' : ''}
              `}
            >
              <Play className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              {isSpinning ? 'En cours...' : 'Tourner'}
            </Button>
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-none">
          <Button
            onClick={onClearBets}
            disabled={isSpinning || totalBet === 0}
            variant="outline"
            className="
              px-3 sm:px-6 py-4 sm:py-6 text-sm sm:text-lg font-bold rounded-xl
              border-amber-500/50 text-amber-400 bg-amber-500/5
              hover:bg-amber-500/20 hover:border-amber-400
              disabled:opacity-40 disabled:hover:bg-transparent
              backdrop-blur-sm transition-all
            "
          >
            <Trash2 className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden sm:inline">Effacer</span>
          </Button>
        </motion.div>

        {gameStarted && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-none">
            <Button
              onClick={onResetGame}
              disabled={isSpinning}
              variant="outline"
              className="
                px-3 sm:px-6 py-4 sm:py-6 text-sm sm:text-lg font-bold rounded-xl
                border-red-500/50 text-red-400 bg-red-500/5
                hover:bg-red-500/20 hover:border-red-400
                disabled:opacity-40 disabled:hover:bg-transparent
                backdrop-blur-sm transition-all
              "
            >
              <RotateCcw className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline">{isMultiplayer ? 'Quitter' : 'Nouvelle Partie'}</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
