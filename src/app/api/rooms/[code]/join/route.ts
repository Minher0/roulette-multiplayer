import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const PLAYER_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

// POST - Join a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, pseudo } = body;

    if (!playerId || !pseudo || pseudo.trim().length < 2) {
      return NextResponse.json(
        { error: 'playerId and a valid pseudo (min 2 chars) are required' },
        { status: 400 }
      );
    }

    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: { players: true }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'waiting' && room.status !== 'playing') {
      return NextResponse.json({ error: 'Game already in progress' }, { status: 400 });
    }

    // Check if pseudo already taken (case insensitive)
    const existingPlayer = room.players.find(
      p => p.pseudo.toLowerCase() === pseudo.trim().toLowerCase()
    );

    if (existingPlayer) {
      // Same player reconnecting
      if (existingPlayer.id === playerId) {
        const fullRoom = await prisma.gameRoom.findUnique({
          where: { code: code.toUpperCase() },
          include: {
            players: { 
              orderBy: { joinedAt: 'asc' },
              include: { bets: true }
            }
          }
        });
        return NextResponse.json({ room: fullRoom, player: existingPlayer, rejoined: true });
      }
      return NextResponse.json(
        { error: 'This pseudo is already taken in this room' },
        { status: 400 }
      );
    }

    // Delete any previous player with same ID
    await prisma.player.deleteMany({ where: { id: playerId } });

    // Assign color
    const color = PLAYER_COLORS[room.players.length % PLAYER_COLORS.length];

    // Create new player
    const player = await prisma.player.create({
      data: {
        id: playerId,
        roomId: room.id,
        pseudo: pseudo.trim(),
        balance: room.startingBalance,
        isHost: false,
        isReady: false,
        color,
      }
    });

    // Fetch updated room
    const updatedRoom = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: { 
          orderBy: { joinedAt: 'asc' },
          include: { bets: true }
        }
      }
    });

    return NextResponse.json({ room: updatedRoom, player });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
