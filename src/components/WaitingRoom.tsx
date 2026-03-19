'use client';

import { motion } from 'framer-motion';
import { Users, Crown, Check, X, Copy, CheckCheck, Loader2, Play, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameRoom, Player } from '@/lib/multiplayer';
import { formatMoney } from '@/lib/roulette';
import { useState } from 'react';

interface WaitingRoomProps {
  room: GameRoom;
  currentPlayer: Player;
  onReady: (isReady: boolean) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isStarting: boolean;
}

export default function WaitingRoom({
  room,
  currentPlayer,
  onReady,
  onStartGame,
  onLeaveRoom,
  isStarting
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allPlayersReady = room.players.every(p => p.isReady);
  const canStart = currentPlayer.isHost && allPlayersReady && room.players.length >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-500/10 max-w-lg w-full"
    >
      {/* Header with room code */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 mb-2">
          Salle d&apos;attente
        </h2>
        
        <div className="inline-flex items-center gap-2 bg-gray-800/80 px-4 py-2 rounded-full border border-amber-500/30">
          <span className="text-gray-400 text-sm">Code:</span>
          <span className="text-2xl font-mono font-bold text-amber-400 tracking-wider">{room.code}</span>
          <button
            onClick={copyCode}
            className="ml-1 text-gray-400 hover:text-amber-400 transition-colors"
          >
            {copied ? <CheckCheck className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Game info */}
      <div className="flex justify-center gap-6 mb-6 text-sm">
        <div className="text-center">
          <p className="text-gray-400">Solde de départ</p>
          <p className="text-amber-400 font-bold">{formatMoney(room.startingBalance)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Joueurs</p>
          <p className="text-amber-400 font-bold">{room.players.length}</p>
        </div>
      </div>

      {/* Players list */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <Users className="h-4 w-4" />
          <span>Joueurs dans la salle</span>
        </div>
        
        {room.players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.id === currentPlayer.id
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-gray-800/50 border border-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: player.color,
                  border: player.isHost ? '2px solid #fbbf24' : 'none'
                }}
              >
                {player.isHost ? (
                  <Crown className="h-4 w-4 text-white" />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {player.pseudo.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className={`font-medium ${player.id === currentPlayer.id ? 'text-amber-300' : 'text-white'}`}>
                  {player.pseudo}
                  {player.isHost && <span className="ml-2 text-xs text-amber-400">(Hôte)</span>}
                  {player.id === currentPlayer.id && <span className="ml-2 text-xs text-amber-400">(Vous)</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {player.isReady ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <Check className="h-4 w-4" />
                  Prêt
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500 text-sm">
                  <X className="h-4 w-4" />
                  En attente
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {/* Ready button (not for host) */}
        {!currentPlayer.isHost && (
          <Button
            onClick={() => onReady(!currentPlayer.isReady)}
            className={`w-full h-12 font-bold ${
              currentPlayer.isReady
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {currentPlayer.isReady ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Prêt!
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5 opacity-50" />
                Marquer comme prêt
              </>
            )}
          </Button>
        )}

        {/* Start game button (host only) */}
        {currentPlayer.isHost && (
          <Button
            onClick={onStartGame}
            disabled={!canStart || isStarting}
            className="w-full h-12 font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white shadow-lg shadow-green-500/30 disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Démarrage...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Lancer la partie
                {!allPlayersReady && (
                  <span className="ml-2 text-xs opacity-75">(Tous doivent être prêts)</span>
                )}
              </>
            )}
          </Button>
        )}

        {/* Leave button */}
        <Button
          onClick={onLeaveRoom}
          variant="outline"
          className="w-full h-10 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {currentPlayer.isHost ? 'Annuler la partie' : 'Quitter'}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Partagez le code avec vos amis pour qu&apos;ils rejoignent</p>
        <p className="text-gray-600 mt-1">Minimum 1 joueur pour commencer</p>
      </div>
    </motion.div>
  );
}
