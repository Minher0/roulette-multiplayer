'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, User, Plus, LogIn, Loader2, Crown, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@/lib/roulette';

interface GameLobbyProps {
  onStartSolo: (startingBalance: number) => void;
  onCreateRoom: (pseudo: string, startingBalance: number) => void;
  onJoinRoom: (code: string, pseudo: string) => void;
  isLoading: boolean;
}

export default function GameLobby({ onStartSolo, onCreateRoom, onJoinRoom, isLoading }: GameLobbyProps) {
  const [mode, setMode] = useState<'menu' | 'solo' | 'create' | 'join'>('menu');
  const [pseudo, setPseudo] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [startingBalance, setStartingBalance] = useState(1000);

  const handleSolo = () => {
    onStartSolo(startingBalance);
  };

  const handleCreate = () => {
    if (pseudo.trim().length >= 2) {
      onCreateRoom(pseudo.trim(), startingBalance);
    }
  };

  const handleJoin = () => {
    if (pseudo.trim().length >= 2 && roomCode.trim().length === 6) {
      onJoinRoom(roomCode.trim().toUpperCase(), pseudo.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-500/10 max-w-md w-full"
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-transparent rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-amber-500/20 to-transparent rounded-br-3xl" />

      <div className="relative text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-600 via-green-600 to-red-600 flex items-center justify-center shadow-lg shadow-green-500/30"
        >
          <span className="text-5xl font-bold text-white drop-shadow-lg">0</span>
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 mb-2">
          Roulette Européenne
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Jouez seul ou avec vos amis
        </p>
      </div>

      {/* Menu Mode */}
      {mode === 'menu' && (
        <div className="relative space-y-3">
          {/* Solo mode */}
          <Button
            onClick={() => setMode('solo')}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50"
          >
            <User className="mr-2 h-5 w-5" />
            Mode Solo
          </Button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50"></div>
            </div>
            <span className="relative bg-gray-900 px-4 text-gray-500 text-sm">ou</span>
          </div>

          {/* Multiplayer modes */}
          <Button
            onClick={() => setMode('create')}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50"
          >
            <Plus className="mr-2 h-5 w-5" />
            Créer une partie
          </Button>

          <Button
            onClick={() => setMode('join')}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Rejoindre une partie
          </Button>

          <div className="pt-4 border-t border-gray-700/50 text-center">
            <p className="text-gray-500 text-xs">
              🎰 Jeu fictif - Aucun argent réel
            </p>
          </div>
        </div>
      )}

      {/* Solo Mode */}
      {mode === 'solo' && (
        <div className="relative space-y-4">
          <button
            onClick={() => setMode('menu')}
            className="absolute -top-2 -left-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-4">
            <User className="h-10 w-10 text-amber-400 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">Mode Solo</h2>
            <p className="text-gray-400 text-sm">Jouez seul à votre rythme</p>
          </div>

          <div>
            <label className="text-amber-400 text-sm font-medium mb-2 block">
              Solde de départ (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/70 h-5 w-5" />
              <Input
                type="number"
                min={1}
                max={100000}
                value={startingBalance}
                onChange={(e) => setStartingBalance(Math.max(1, parseInt(e.target.value) || 1))}
                className="pl-10 h-12 text-lg bg-gray-800/80 border-amber-500/30 text-white focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => setStartingBalance(amount)}
                className={`h-9 text-xs transition-all ${startingBalance === amount ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20' : 'border-gray-600 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'}`}
              >
                {formatMoney(amount)}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSolo}
            disabled={isLoading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <User className="mr-2 h-5 w-5" />
                Commencer
              </>
            )}
          </Button>
        </div>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <div className="relative space-y-4">
          <button
            onClick={() => setMode('menu')}
            className="absolute -top-2 -left-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-4">
            <Crown className="h-10 w-10 text-green-400 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">Créer une partie</h2>
            <p className="text-gray-400 text-sm">Invitez vos amis avec le code</p>
          </div>

          <div>
            <label className="text-amber-400 text-sm font-medium mb-2 block">
              Votre pseudo
            </label>
            <Input
              type="text"
              placeholder="Entrez votre pseudo..."
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={20}
              className="h-12 text-lg bg-gray-800/80 border-amber-500/30 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>

          <div>
            <label className="text-amber-400 text-sm font-medium mb-2 block">
              Solde de départ (€)
            </label>
            <Input
              type="number"
              min={100}
              max={100000}
              value={startingBalance}
              onChange={(e) => setStartingBalance(Math.max(100, parseInt(e.target.value) || 100))}
              className="h-12 text-lg bg-gray-800/80 border-amber-500/30 text-white focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[500, 1000, 5000, 10000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => setStartingBalance(amount)}
                className={`h-9 text-xs transition-all ${startingBalance === amount ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-gray-600 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'}`}
              >
                {formatMoney(amount)}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleCreate}
            disabled={pseudo.trim().length < 2 || isLoading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-5 w-5" />
                Créer la partie
              </>
            )}
          </Button>
        </div>
      )}

      {/* Join Mode */}
      {mode === 'join' && (
        <div className="relative space-y-4">
          <button
            onClick={() => setMode('menu')}
            className="absolute -top-2 -left-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-4">
            <LogIn className="h-10 w-10 text-blue-400 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">Rejoindre une partie</h2>
            <p className="text-gray-400 text-sm">Entrez le code partagé par l&apos;hôte</p>
          </div>

          <div>
            <label className="text-amber-400 text-sm font-medium mb-2 block">
              Code de la partie
            </label>
            <Input
              type="text"
              placeholder="Ex: ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              maxLength={6}
              className="h-12 text-lg text-center font-mono tracking-widest bg-gray-800/80 border-amber-500/30 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>

          <div>
            <label className="text-amber-400 text-sm font-medium mb-2 block">
              Votre pseudo
            </label>
            <Input
              type="text"
              placeholder="Entrez votre pseudo..."
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={20}
              className="h-12 text-lg bg-gray-800/80 border-amber-500/30 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>

          <Button
            onClick={handleJoin}
            disabled={pseudo.trim().length < 2 || roomCode.trim().length !== 6 || isLoading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Rejoindre
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
