import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Start the game (host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { hostId } = body;

    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: { players: true }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.hostId !== hostId) {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }

    // Check all players are ready
    const allReady = room.players.every(p => p.isReady);
    if (!allReady) {
      return NextResponse.json({ error: 'All players must be ready' }, { status: 400 });
    }

    // Update room status to playing
    const updatedRoom = await prisma.gameRoom.update({
      where: { code: code.toUpperCase() },
      data: { status: 'playing' },
      include: {
        players: { 
          orderBy: { joinedAt: 'asc' },
          include: { bets: true }
        }
      }
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
