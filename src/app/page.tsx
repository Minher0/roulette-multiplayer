'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trophy, X, Crown, Users, Copy, RefreshCw } from 'lucide-react';
import RouletteWheel from '@/components/RouletteWheel';
import BettingTable from '@/components/BettingTable';
import ChipSelector from '@/components/ChipSelector';
import GameControls from '@/components/GameControls';
import CasinoBackground from '@/components/CasinoBackground';
import GameLobby from '@/components/GameLobby';
import WaitingRoom from '@/components/WaitingRoom';
import PlayerBetsDisplay from '@/components/PlayerBetsDisplay';
import { 
  Bet, 
  SpinResult, 
  WinResult, 
  calculateWinnings,
  formatMoney
} from '@/lib/roulette';
import {
  GameRoom,
  Player,
  createRoom,
  joinRoom,
  leaveRoom,
  placeBets,
  clearBets,
  startSpin,
  syncRoom,
  startGame,
  setReady,
  getPlayerId
} from '@/lib/multiplayer';
import { Button } from '@/components/ui/button';

type GameMode = 'lobby' | 'waiting' | 'playing';
type RoomStatus = 'waiting' | 'playing' | 'spinning' | 'finished';

interface HistoryEntry {
  result: SpinResult;
  winResult: WinResult;
  timestamp: Date;
}

export default function Home() {
  // Player identification
  const [playerId] = useState(getPlayerId);
  
  // Game mode state
  const [gameMode, setGameMode] = useState<GameMode>('lobby');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Solo mode state
  const [soloBalance, setSoloBalance] = useState(0);
  
  // Multiplayer state
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  
  // Local bets (before sync)
  const [localBets, setLocalBets] = useState<Bet[]>([]);
  
  // Game state
  const [selectedChip, setSelectedChip] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [lastWinResult, setLastWinResult] = useState<WinResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [showAllBets, setShowAllBets] = useState(false);

  // Sync and spin timing
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [serverSpinStartTime, setServerSpinStartTime] = useState<number | null>(null);
  const [serverSpinResult, setServerSpinResult] = useState<{ number: number; color: string } | null>(null);
  const [previousStatus, setPreviousStatus] = useState<RoomStatus | null>(null);

  // Derived values
  const balance = isMultiplayer ? (currentPlayer?.balance ?? 0) : soloBalance;
  const totalLocalBet = localBets.reduce((sum, bet) => sum + bet.amount, 0);
  const canSpin = !isSpinning && 
    totalLocalBet > 0 && 
    balance >= totalLocalBet && 
    (!isMultiplayer || currentPlayer?.isHost);
  const isWaitingForSpin = isMultiplayer && room?.status === 'spinning';

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  // Session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedRoomCode = localStorage.getItem('roulette_room_code');
        if (savedRoomCode && playerId) {
          console.log('Restoring session for room:', savedRoomCode);
          const data = await syncRoom(savedRoomCode, playerId);
          if (data.room && data.currentPlayer) {
            setRoom(data.room);
            setCurrentPlayer(data.currentPlayer);
            setIsMultiplayer(true);
            
            if (data.room.status === 'waiting') {
              setGameMode('waiting');
            } else if (data.room.status === 'playing' || data.room.status === 'spinning') {
              setGameMode('playing');
              if (data.room.status === 'spinning' && data.room.spinStartTime) {
                setServerSpinStartTime(BigInt(data.room.spinStartTime).valueOf());
                setIsSpinning(true);
              }
            }
            
            console.log('Session restored successfully');
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('roulette_room_code');
      }
    };
    
    restoreSession();
  }, [playerId]);

  // Sync polling for multiplayer
  useEffect(() => {
    if (isMultiplayer && room) {
      syncIntervalRef.current = setInterval(async () => {
        try {
          const data = await syncRoom(room.code, playerId);
          setRoom(data.room);
          
          if (data.currentPlayer) {
            setCurrentPlayer(data.currentPlayer);
          }

          // Handle status transitions
          if (previousStatus !== data.room.status) {
            // Room just entered spinning state - START ANIMATION FOR ALL PLAYERS
            if (data.room.status === 'spinning') {
              if (data.room.spinStartTime) {
                setServerSpinStartTime(BigInt(data.room.spinStartTime).valueOf());
              }
              setIsSpinning(true);
              
              // Clear local bets - they're already on server
              setLocalBets([]);
            }
            
            // Room just returned to playing (after spin)
            if (data.room.status === 'playing' && previousStatus === 'spinning') {
              setIsSpinning(false);
            }
            
            // Game started
            if (data.room.status === 'playing' && previousStatus === 'waiting') {
              setGameMode('playing');
            }
            
            setPreviousStatus(data.room.status as RoomStatus);
          }

          // Check for new spin result
          if (data.room.spins && data.room.spins.length > 0) {
            const latestSpin = data.room.spins[0];
            if (latestSpin && latestSpin.result !== spinResult?.number) {
              setServerSpinResult({ number: latestSpin.result, color: latestSpin.color });
            }
          }
        } catch (err) {
          console.error('Sync error:', err);
          // Si la room n'existe plus, retourner au lobby
          if (err instanceof Error && err.message.includes('not found')) {
            setRoom(null);
            setCurrentPlayer(null);
            setGameMode('lobby');
            setIsMultiplayer(false);
            setError('La partie a été fermée ou n\'existe plus');
          }
        }
      }, 500);

      return () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      };
    }
  }, [isMultiplayer, room?.code, playerId, previousStatus, spinResult?.number]);

  // Handle start solo game
  const handleStartSolo = (startingBalance: number) => {
    setSoloBalance(startingBalance);
    setIsMultiplayer(false);
    setLocalBets([]);
    setSpinResult(null);
    setLastWinResult(null);
    setHistory([]);
    setGameMode('playing');
  };

  // Handle create room
  const handleCreateRoom = async (pseudo: string, startingBalance: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await createRoom(playerId, pseudo, startingBalance);
      setRoom(data.room);
      setCurrentPlayer(data.room.players[0]);
      setIsMultiplayer(true);
      setGameMode('waiting');
      // Save room code for session restoration
      localStorage.setItem('roulette_room_code', data.room.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle join room
  const handleJoinRoom = async (code: string, pseudo: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await joinRoom(code, playerId, pseudo);
      setRoom(data.room);
      setCurrentPlayer(data.player);
      setIsMultiplayer(true);
      setGameMode('waiting');
      // Save room code for session restoration
      localStorage.setItem('roulette_room_code', code.toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ready toggle
  const handleReady = async (isReady: boolean) => {
    if (!room || !currentPlayer) return;
    try {
      const data = await setReady(room.code, playerId, isReady);
      setRoom(data.room);
      setCurrentPlayer(data.room.players.find(p => p.id === playerId) || null);
    } catch (err) {
      console.error('Error setting ready status:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    }
  };

  // Handle start game (host only)
  const handleStartGame = async () => {
    if (!room || !currentPlayer?.isHost) return;
    setIsLoading(true);
    try {
      const data = await startGame(room.code, playerId);
      setRoom(data.room);
      setGameMode('playing');
    } catch (err) {
      console.error('Error starting game:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du démarrage');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle leave room
  const handleExitGame = async () => {
    if (isMultiplayer && room) {
      try {
        await leaveRoom(room.code, playerId);
      } catch (err) {
        console.error('Error leaving room:', err);
      }
      setRoom(null);
      setCurrentPlayer(null);
      // Clear saved session
      localStorage.removeItem('roulette_room_code');
    }
    setSoloBalance(0);
    setLocalBets([]);
    setSpinResult(null);
    setLastWinResult(null);
    setHistory([]);
    setGameMode('lobby');
    setIsMultiplayer(false);
  };

  // Place a bet (local + sync to server in multiplayer)
  const handlePlaceBet = useCallback((newBet: Omit<Bet, 'amount'> & { amount?: number }) => {
    const betAmount = newBet.amount || selectedChip;
    
    const availableBalance = balance - totalLocalBet;
    if (availableBalance < betAmount) return;

    setLocalBets(prev => {
      const existingIndex = prev.findIndex(b => b.type === newBet.type && b.number === newBet.number);
      
      let newBets: Bet[];
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          amount: updated[existingIndex].amount + betAmount
        };
        newBets = updated;
      } else {
        newBets = [...prev, { ...newBet, amount: betAmount } as Bet];
      }
      
      // Sync bets to server in multiplayer mode
      if (isMultiplayer && room && playerId) {
        // Debounce: send to server after a short delay
        setTimeout(() => {
          placeBets(room.code, playerId, newBets.map(b => ({
            betType: b.type,
            number: b.number,
            amount: b.amount
          }))).then(data => {
            if (data.player) {
              setCurrentPlayer(data.player);
            }
          }).catch(err => console.error('Error syncing bet:', err));
        }, 300);
      }
      
      return newBets;
    });
  }, [selectedChip, balance, totalLocalBet, isMultiplayer, room, playerId]);

  // Remove a bet (local + sync to server in multiplayer)
  const handleRemoveBet = useCallback((type: Bet['type'], number?: number) => {
    setLocalBets(prev => {
      const existingIndex = prev.findIndex(b => b.type === type && b.number === number);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated.splice(existingIndex, 1);
        
        // Sync to server in multiplayer
        if (isMultiplayer && room && playerId) {
          setTimeout(() => {
            placeBets(room.code, playerId, updated.map(b => ({
              betType: b.type,
              number: b.number,
              amount: b.amount
            }))).then(data => {
              if (data.player) setCurrentPlayer(data.player);
            }).catch(err => console.error('Error syncing bet removal:', err));
          }, 300);
        }
        
        return updated;
      }
      return prev;
    });
  }, [isMultiplayer, room, playerId]);

  // Clear all bets
  const handleClearBets = useCallback(async () => {
    if (isMultiplayer && room && currentPlayer) {
      try {
        await clearBets(room.code, playerId);
      } catch (err) {
        console.error('Error clearing bets:', err);
      }
    }
    setLocalBets([]);
  }, [isMultiplayer, room, currentPlayer, playerId]);

  // Spin the wheel
  const handleSpin = useCallback(async () => {
    if (!canSpin) return;

    // In multiplayer, host triggers the spin (bets already synced in real-time)
    if (isMultiplayer && room && currentPlayer) {
      try {
        // Sync any remaining local bets first
        if (localBets.length > 0) {
          const serverBets = localBets.map(bet => ({
            betType: bet.type,
            number: bet.number,
            amount: bet.amount
          }));
          await placeBets(room.code, playerId, serverBets);
        }
        
        // Start spin (host only)
        if (currentPlayer.isHost) {
          const spinData = await startSpin(room.code, playerId);
          setServerSpinStartTime(BigInt(spinData.spinStartTime).valueOf());
          setServerSpinResult(spinData.result);
          setIsSpinning(true);
          setLocalBets([]);
        }
      } catch (err) {
        console.error('Error in multiplayer spin:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du spin');
      }
      return;
    }

    // Solo mode
    setIsSpinning(true);
    setLastWinResult(null);
    setSpinResult(null);
  }, [canSpin, isMultiplayer, room, currentPlayer, playerId, localBets]);

  // Handle spin complete
  const handleSpinComplete = useCallback(async (result: SpinResult) => {
    setIsSpinning(false);
    setSpinResult(result);
    
    // In solo mode, calculate winnings locally
    if (!isMultiplayer) {
      const winResult = calculateWinnings(localBets, result);
      setLastWinResult(winResult);
      setSoloBalance(b => b - totalLocalBet + winResult.totalWin);
    } else {
      // In multiplayer, sync to get updated balance from server
      if (room) {
        try {
          const data = await syncRoom(room.code, playerId);
          if (data.currentPlayer) {
            setCurrentPlayer(data.currentPlayer);
          }
        } catch (err) {
          console.error('Error syncing after spin:', err);
        }
      }
    }
    
    // Add to history
    setHistory(prev => [{
      result,
      winResult: lastWinResult || { totalWin: 0, netResult: 0, winningBets: [] },
      timestamp: new Date()
    }, ...prev].slice(0, 50));

    setLocalBets([]);
    setServerSpinStartTime(null);
    setServerSpinResult(null);
  }, [isMultiplayer, localBets, totalLocalBet, room, playerId, lastWinResult]);

  // Lobby screen
  if (gameMode === 'lobby') {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <CasinoBackground />
        <GameLobby
          onStartSolo={handleStartSolo}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isLoading={isLoading}
        />
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 bg-red-900/90 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
      </div>
    );
  }

  // Waiting room screen (multiplayer only)
  if (gameMode === 'waiting' && isMultiplayer) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <CasinoBackground />
        {room && currentPlayer && (
          <WaitingRoom
            room={room}
            currentPlayer={currentPlayer}
            onReady={handleReady}
            onStartGame={handleStartGame}
            onLeaveRoom={handleExitGame}
            isStarting={isLoading}
          />
        )}
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen relative p-2 sm:p-4">
      <CasinoBackground />
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              🎰 Roulette
            </h1>
            {isMultiplayer && room && (
              <button
                onClick={() => navigator.clipboard.writeText(room.code)}
                className="flex items-center gap-1 bg-gray-800/80 px-2 sm:px-3 py-1 rounded-full border border-amber-500/30 text-xs sm:text-sm"
              >
                <span className="text-gray-400">Code:</span>
                <span className="font-mono text-amber-400">{room.code}</span>
                <Copy className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isMultiplayer && room && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowAllBets(!showAllBets)}
                  className="border-purple-500/30 text-purple-300 text-xs sm:text-sm hover:bg-purple-500/10"
                >
                  <Users className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  Paris ({room.players.reduce((sum, p) => sum + p.bets.length, 0)})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPlayerList(!showPlayerList)}
                  className="border-amber-500/30 text-amber-300 text-xs sm:text-sm hover:bg-amber-500/10"
                >
                  <Crown className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  {room.players.length}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="border-amber-500/30 text-amber-300 text-xs sm:text-sm hover:bg-amber-500/10"
            >
              <History className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
              <span className="hidden sm:inline">Historique </span>({history.length})
            </Button>
          </div>
        </div>

        {/* All players bets panel */}
        <AnimatePresence>
          {showAllBets && isMultiplayer && room && (
            <PlayerBetsDisplay 
              room={room} 
              currentPlayerId={playerId}
              onClose={() => setShowAllBets(false)}
            />
          )}
        </AnimatePresence>

        {/* Player list panel */}
        <AnimatePresence>
          {showPlayerList && isMultiplayer && room && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-amber-500/30 p-4 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-amber-400">Joueurs</h3>
                  <Button variant="ghost" onClick={() => setShowPlayerList(false)} className="text-gray-400">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {room.players.map(player => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        player.id === playerId ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-gray-800/60 border border-gray-700/50'
                      }`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: player.color }}
                      />
                      <span className={`text-sm truncate ${player.id === playerId ? 'text-amber-300' : 'text-gray-300'}`}>
                        {player.pseudo}
                        {player.isHost && <Crown className="inline ml-1 h-3 w-3 text-amber-400" />}
                      </span>
                      <span className="ml-auto text-xs text-amber-400 font-bold">
                        {formatMoney(player.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting for spin message */}
        {isWaitingForSpin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-purple-900/60 rounded-xl border border-purple-500/50 text-center"
          >
            <RefreshCw className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-purple-300 font-medium">La roue tourne...</p>
          </motion.div>
        )}

        {/* Win notification */}
        <AnimatePresence>
          {lastWinResult && lastWinResult.netResult !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl flex items-center justify-between backdrop-blur-md ${
                lastWinResult.netResult > 0 
                  ? 'bg-green-900/60 border border-green-500/50 shadow-lg shadow-green-500/20' 
                  : 'bg-red-900/60 border border-red-500/50 shadow-lg shadow-red-500/20'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {lastWinResult.netResult > 0 ? (
                  <Trophy className="h-5 sm:h-6 w-5 sm:w-6 text-green-400" />
                ) : (
                  <X className="h-5 sm:h-6 w-5 sm:w-6 text-red-400" />
                )}
                <div>
                  <p className={`font-bold text-sm sm:text-base ${lastWinResult.netResult > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {lastWinResult.netResult > 0 ? 'Victoire!' : 'Perdu!'}
                  </p>
                  <p className="text-white text-base sm:text-lg font-bold">
                    {lastWinResult.netResult > 0 ? '+' : ''}{formatMoney(lastWinResult.netResult)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main game area */}
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          
          {/* Mobile: Controls first */}
          <div className="lg:hidden w-full max-w-md">
            <GameControls
              balance={balance}
              totalBet={totalLocalBet}
              canSpin={canSpin && !isWaitingForSpin}
              isSpinning={isSpinning}
              onSpin={handleSpin}
              onClearBets={handleClearBets}
              onResetGame={handleExitGame}
              gameStarted={true}
              isMultiplayer={isMultiplayer}
              isHost={!isMultiplayer || currentPlayer?.isHost}
            />
          </div>

          {/* Desktop layout: Wheel left, Table center */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start justify-center w-full">
            
            {/* Wheel + Chips - Left on desktop */}
            <div className="flex flex-col gap-3 sm:gap-4 items-center">
              <RouletteWheel
                isSpinning={isSpinning}
                result={spinResult}
                onSpinComplete={handleSpinComplete}
                serverSpinStartTime={serverSpinStartTime}
                serverSpinResult={serverSpinResult}
              />
              
              <ChipSelector
                selectedChip={selectedChip}
                onSelectChip={setSelectedChip}
                disabled={isSpinning || isWaitingForSpin}
              />
            </div>

            {/* Table - Center on desktop */}
            <div className="flex flex-col gap-3 sm:gap-4 items-center">
              {/* Desktop controls */}
              <div className="hidden lg:block w-full max-w-xl">
                <GameControls
                  balance={balance}
                  totalBet={totalLocalBet}
                  canSpin={canSpin && !isWaitingForSpin}
                  isSpinning={isSpinning}
                  onSpin={handleSpin}
                  onClearBets={handleClearBets}
                  onResetGame={handleExitGame}
                  gameStarted={true}
                  isMultiplayer={isMultiplayer}
                  isHost={!isMultiplayer || currentPlayer?.isHost}
                />
              </div>

              <BettingTable
                bets={localBets}
                selectedChip={selectedChip}
                onPlaceBet={handlePlaceBet}
                onRemoveBet={handleRemoveBet}
                disabled={isSpinning || isWaitingForSpin}
                lastResult={spinResult}
                otherPlayersBets={isMultiplayer && room ? room.players.filter(p => p.id !== playerId).flatMap(p => p.bets.map(b => ({ ...b, playerColor: p.color, playerName: p.pseudo }))) : []}
                playerColor={currentPlayer?.color || '#ef4444'}
              />
            </div>
          </div>
        </div>

        {/* History panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-amber-500/30 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-amber-400">Historique des tours</h3>
                  <Button variant="ghost" onClick={() => setShowHistory(false)} className="text-gray-400">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun historique disponible</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {history.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                            entry.result.color === 'red' ? 'bg-red-600' : 
                            entry.result.color === 'black' ? 'bg-gray-800 border border-gray-600' : 'bg-green-600'
                          }`}>
                            {entry.result.number}
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              {entry.result.color === 'red' ? 'Rouge' : entry.result.color === 'black' ? 'Noir' : 'Vert'}
                              {entry.result.isOdd ? ' • Impair' : entry.result.isEven ? ' • Pair' : ''}
                            </p>
                            <p className="text-gray-500 text-xs">{entry.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className={`font-bold ${entry.winResult.netResult > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.winResult.netResult > 0 ? '+' : ''}{formatMoney(entry.winResult.netResult)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balance warning */}
        {balance <= 0 && !isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-red-500/50 text-center max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Partie terminée!</h2>
              <p className="text-gray-400 mb-6">Vous n&apos;avez plus d&apos;argent.</p>
              <Button
                onClick={handleExitGame}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold"
              >
                {isMultiplayer ? 'Quitter la partie' : 'Nouvelle partie'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
