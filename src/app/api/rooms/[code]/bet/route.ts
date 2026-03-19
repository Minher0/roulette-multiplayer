import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface BetData {
  betType: string;
  number?: number;
  amount: number;
}

// POST - Place bets (deducts from balance immediately)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, bets } = body as { playerId: string; bets: BetData[] };

    if (!playerId || !Array.isArray(bets)) {
      return NextResponse.json({ error: 'playerId and bets array are required' }, { status: 400 });
    }

    // Get player with current bets
    const player = await prisma.player.findFirst({
      where: { 
        id: playerId,
        room: { code: code.toUpperCase() }
      },
      include: { bets: true }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found in room' }, { status: 404 });
    }

    // Calculate totals
    const totalNewBet = bets.reduce((sum, b) => sum + b.amount, 0);
    const totalExistingBet = player.bets.reduce((sum, b) => sum + b.amount, 0);
    
    // Balance already has existing bets deducted
    const availableForNewBets = player.balance + totalExistingBet;

    if (totalNewBet > availableForNewBets) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        available: availableForNewBets,
        requested: totalNewBet
      }, { status: 400 });
    }

    // Delete existing bets
    await prisma.playerBet.deleteMany({ where: { playerId } });

    // Create new bets
    if (bets.length > 0) {
      await prisma.playerBet.createMany({
        data: bets.map(b => ({
          playerId,
          betType: b.betType,
          number: b.number,
          amount: b.amount,
        }))
      });
    }

    // Update player balance (deduct new bets)
    const newBalance = availableForNewBets - totalNewBet;
    await prisma.player.update({
      where: { id: playerId },
      data: { balance: newBalance }
    });

    // Fetch updated room with all player bets
    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: { 
          orderBy: { joinedAt: 'asc' },
          include: { bets: true }
        }
      }
    });

    const updatedPlayer = room?.players.find(p => p.id === playerId);

    return NextResponse.json({ success: true, room, player: updatedPlayer });
  } catch (error) {
    console.error('Error placing bets:', error);
    return NextResponse.json({ error: 'Failed to place bets' }, { status: 500 });
  }
}

// DELETE - Clear all bets for a player (restore balance)
export async function DELETE(
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

    const player = await prisma.player.findFirst({
      where: { 
        id: playerId,
        room: { code: code.toUpperCase() }
      },
      include: { bets: true }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Calculate total bet to restore
    const totalBet = player.bets.reduce((sum, b) => sum + b.amount, 0);

    // Delete bets
    await prisma.playerBet.deleteMany({ where: { playerId } });

    // Restore balance
    await prisma.player.update({
      where: { id: playerId },
      data: { balance: player.balance + totalBet }
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
    console.error('Error clearing bets:', error);
    return NextResponse.json({ error: 'Failed to clear bets' }, { status: 500 });
  }
}
