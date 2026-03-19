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

    // Find current player
    let currentPlayer = null;
    if (playerId) {
      currentPlayer = room.players.find(p => p.id === playerId);
    }

    return NextResponse.json({
      room,
      currentPlayer,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error syncing room:', error);
    return NextResponse.json({ error: 'Failed to sync room' }, { status: 500 });
  }
}
