import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// European roulette number colors
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getNumberColor(num: number): string {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
}

// Calculate winnings for a single bet
function calculateBetWin(betType: string, number: number | null, amount: number, result: number): number {
  // Straight bet (single number) - 35:1
  if (betType === 'straight') {
    return number === result ? amount * 36 : -amount;
  }

  // Color bets - 1:1
  if (betType === 'red') {
    return (result !== 0 && RED_NUMBERS.includes(result)) ? amount * 2 : -amount;
  }
  if (betType === 'black') {
    return (result !== 0 && !RED_NUMBERS.includes(result)) ? amount * 2 : -amount;
  }

  // Even/Odd - 1:1
  if (betType === 'even') {
    return (result !== 0 && result % 2 === 0) ? amount * 2 : -amount;
  }
  if (betType === 'odd') {
    return (result !== 0 && result % 2 === 1) ? amount * 2 : -amount;
  }

  // Low/High (1-18, 19-36) - 1:1
  if (betType === 'low') {
    return (result >= 1 && result <= 18) ? amount * 2 : -amount;
  }
  if (betType === 'high') {
    return (result >= 19 && result <= 36) ? amount * 2 : -amount;
  }

  // Dozens - 2:1
  if (betType === 'dozen1') {
    return (result >= 1 && result <= 12) ? amount * 3 : -amount;
  }
  if (betType === 'dozen2') {
    return (result >= 13 && result <= 24) ? amount * 3 : -amount;
  }
  if (betType === 'dozen3') {
    return (result >= 25 && result <= 36) ? amount * 3 : -amount;
  }

  // Columns - 2:1
  if (betType === 'column1') {
    return (result !== 0 && result % 3 === 1) ? amount * 3 : -amount;
  }
  if (betType === 'column2') {
    return (result !== 0 && result % 3 === 2) ? amount * 3 : -amount;
  }
  if (betType === 'column3') {
    return (result !== 0 && result % 3 === 0) ? amount * 3 : -amount;
  }

  return -amount;
}

// POST - Start spin (host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { hostId, result: providedResult } = body;

    const room = await prisma.gameRoom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: {
          include: { bets: true }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.hostId !== hostId) {
      return NextResponse.json({ error: 'Only the host can spin' }, { status: 403 });
    }

    if (room.status !== 'playing') {
      return NextResponse.json({ error: 'Game must be in playing state' }, { status: 400 });
    }

    // Generate random result or use provided
    const result = providedResult ?? Math.floor(Math.random() * 37);
    const color = getNumberColor(result);
    const spinStartTime = Date.now();
    const spinDuration = 6000; // 6 seconds for animation

    // Update room to spinning state
    await prisma.gameRoom.update({
      where: { code: code.toUpperCase() },
      data: {
        status: 'spinning',
        currentSpinResult: result,
        spinStartTime: BigInt(spinStartTime),
      }
    });

    // Calculate winnings for each player
    const playerResults: { id: string; pseudo: string; totalWin: number; newBalance: number }[] = [];

    for (const player of room.players) {
      let totalWin = 0;

      for (const bet of player.bets) {
        const win = calculateBetWin(bet.betType, bet.number, bet.amount, result);
        totalWin += win;
      }

      // Bets are already deducted from balance, just add winnings
      const newBalance = player.balance + totalWin;

      // Update player balance
      await prisma.player.update({
        where: { id: player.id },
        data: { balance: Math.max(0, newBalance) }
      });

      // Clear player bets
      await prisma.playerBet.deleteMany({ where: { playerId: player.id } });

      playerResults.push({
        id: player.id,
        pseudo: player.pseudo,
        totalWin,
        newBalance: Math.max(0, newBalance)
      });
    }

    // Save spin result
    await prisma.gameSpin.create({
      data: {
        roomId: room.id,
        result,
        color
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

    // After spin duration, reset to playing state
    // Note: In serverless, setTimeout won't persist. Client handles state reset.
    // We set a cleanup timestamp instead
    
    return NextResponse.json({
      success: true,
      result: { number: result, color },
      spinStartTime: spinStartTime.toString(),
      spinDuration,
      room: updatedRoom,
      playerResults
    });
  } catch (error) {
    console.error('Error during spin:', error);
    return NextResponse.json({ error: 'Failed to process spin' }, { status: 500 });
  }
}
