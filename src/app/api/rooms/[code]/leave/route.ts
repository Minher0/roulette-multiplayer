import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Leave a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: { players: true }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 400 });
    }

    // If host is leaving, delete the whole room
    if (player.isHost) {
      await prisma.gameRoom.delete({ where: { code: code.toUpperCase() } });
      return NextResponse.json({ success: true, roomClosed: true });
    }

    // Remove player
    await prisma.player.delete({ where: { id: playerId } });

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

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('Error leaving room:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
