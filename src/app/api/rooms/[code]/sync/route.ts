import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Sync room state (for polling)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');

    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: {
          orderBy: { joinedAt: 'asc' },
          include: { bets: true }
        },
        spins: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found', roomClosed: true }, { status: 404 });
    }

    // Auto-reset from spinning to playing after animation duration (6 seconds)
    if (room.status === 'spinning' && room.spinStartTime) {
      const spinStartTime = Number(room.spinStartTime);
      const spinDuration = 6000; // 6 seconds
      const now = Date.now();
      
      if (now - spinStartTime >= spinDuration) {
        // Animation finished, reset to playing
        await prisma.gameRoom.update({
          where: { code: code.toUpperCase() },
          data: { 
            status: 'playing',
            spinStartTime: null,
            currentSpinResult: null
          }
        });
        
        // Fetch updated room
        const updatedRoom = await prisma.gameRoom.findUnique({
          where: { code: code.toUpperCase() },
          include: {
            players: {
              orderBy: { joinedAt: 'asc' },
              include: { bets: true }
            },
            spins: {
              orderBy: { createdAt: 'desc' },
              take: 20
            }
          }
        });
        
        if (updatedRoom) {
          // Return updated room with playing status
          let currentPlayer = null;
          if (playerId && updatedRoom) {
            currentPlayer = updatedRoom.players.find(p => p.id === playerId);
          }
          
          const serializedRoom = {
            ...updatedRoom,
            spinStartTime: null,
            players: updatedRoom.players.map(p => ({
              ...p,
              bets: p.bets.map(b => ({ ...b }))
            })),
            spins: updatedRoom.spins.map(s => ({ ...s }))
          };
          
          return NextResponse.json({
            room: serializedRoom,
            currentPlayer: currentPlayer ? {
              ...currentPlayer,
              bets: currentPlayer.bets.map(b => ({ ...b }))
            } : null,
            timestamp: Date.now()
          });
        }
      }
    }

    // Find current player
    let currentPlayer = null;
    if (playerId) {
      currentPlayer = room.players.find(p => p.id === playerId);
    }

    // Serialize BigInt fields for JSON
    const serializedRoom = {
      ...room,
      spinStartTime: room.spinStartTime?.toString() || null,
      players: room.players.map(p => ({
        ...p,
        bets: p.bets.map(b => ({ ...b }))
      })),
      spins: room.spins.map(s => ({ ...s }))
    };

    return NextResponse.json({
      room: serializedRoom,
      currentPlayer: currentPlayer ? {
        ...currentPlayer,
        bets: currentPlayer.bets.map(b => ({ ...b }))
      } : null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error syncing room:', error);
    return NextResponse.json({ error: 'Failed to sync room' }, { status: 500 });
  }
}
