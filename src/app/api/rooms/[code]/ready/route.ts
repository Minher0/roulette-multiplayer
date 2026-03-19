import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Toggle ready status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, isReady } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        room: { code: code.toUpperCase() }
      }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found in room' }, { status: 404 });
    }

    await prisma.player.update({
      where: { id: playerId },
      data: { isReady: isReady ?? !player.isReady }
    });

    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: { 
          orderBy: { joinedAt: 'asc' },
          include: { bets: true }
        }
      }
    });

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error('Error updating ready status:', error);
    return NextResponse.json({ error: 'Failed to update ready status' }, { status: 500 });
  }
}
