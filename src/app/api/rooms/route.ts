import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const PLAYER_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

// POST - Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId, hostName, startingBalance = 1000 } = body;

    if (!hostId || !hostName) {
      return NextResponse.json({ error: 'hostId and hostName are required' }, { status: 400 });
    }

    // Delete any existing player with this ID (from previous sessions)
    await prisma.player.deleteMany({ where: { id: hostId } });

    // Also delete any old rooms where this player was host and game is finished/left
    await prisma.gameRoom.deleteMany({
      where: {
        hostId,
        status: { in: ['finished', 'waiting'] }
      }
    });

    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.gameRoom.findUnique({ where: { code } });
      if (!existing) break;
      code = generateRoomCode();
      attempts++;
    }

    const room = await prisma.gameRoom.create({
      data: {
        code,
        hostId,
        hostName,
        startingBalance,
        status: 'waiting',
        players: {
          create: {
            id: hostId,
            pseudo: hostName,
            balance: startingBalance,
            isHost: true,
            isReady: true,
            color: PLAYER_COLORS[0],
          }
        }
      },
      include: {
        players: { orderBy: { joinedAt: 'asc' } }
      }
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

// GET - List waiting rooms
export async function GET() {
  try {
    const rooms = await prisma.gameRoom.findMany({
      where: { status: 'waiting' },
      include: {
        players: { select: { id: true, pseudo: true, isHost: true } },
        _count: { select: { players: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}
