'use client';

import { motion } from 'framer-motion';
import { X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameRoom, Player, PlayerBet } from '@/lib/multiplayer';
import { formatMoney } from '@/lib/roulette';

interface PlayerBetsDisplayProps {
  room: GameRoom;
  currentPlayerId: string;
  onClose: () => void;
}

const BET_TYPE_NAMES: Record<string, string> = {
  straight: 'Numéro',
  red: 'Rouge',
  black: 'Noir',
  even: 'Pair',
  odd: 'Impair',
  low: '1-18',
  high: '19-36',
  dozen1: '1-12',
  dozen2: '13-24',
  dozen3: '25-36',
  column1: 'Colonne 1',
  column2: 'Colonne 2',
  column3: 'Colonne 3',
};

export default function PlayerBetsDisplay({ room, currentPlayerId, onClose }: PlayerBetsDisplayProps) {
  const playersWithBets = room.players
    .filter(p => p.bets.length > 0)
    .map(player => ({
      ...player,
      totalBet: player.bets.reduce((sum, b) => sum + b.amount, 0)
    }))
    .sort((a, b) => b.totalBet - a.totalBet);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 overflow-hidden"
    >
      <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-purple-500/30 p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-purple-400">
            Paris des joueurs
          </h3>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {playersWithBets.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucun pari pour l&apos;instant
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {playersWithBets.map(player => (
              <div
                key={player.id}
                className={`p-3 rounded-lg ${
                  player.id === currentPlayerId
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-gray-800/60 border border-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className={`font-medium ${
                      player.id === currentPlayerId ? 'text-amber-300' : 'text-white'
                    }`}>
                      {player.pseudo}
                      {player.isHost && <Crown className="inline ml-1 h-4 w-4 text-amber-400" />}
                      {player.id === currentPlayerId && (
                        <span className="ml-2 text-xs text-amber-400">(Vous)</span>
                      )}
                    </span>
                  </div>
                  <span className="font-bold text-amber-400">
                    {formatMoney(player.totalBet)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {player.bets.map(bet => (
                    <div
                      key={bet.id}
                      className="flex items-center justify-between bg-gray-900/50 px-2 py-1 rounded text-xs"
                    >
                      <span className="text-gray-400">
                        {BET_TYPE_NAMES[bet.betType] || bet.betType}
                        {bet.number !== null && ` ${bet.number}`}
                      </span>
                      <span className="text-white font-medium">
                        {formatMoney(bet.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
