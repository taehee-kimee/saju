import { NextResponse } from 'next/server';
import { addCommand, getCommands } from '@/lib/remoteStore';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    roomId?: string;
    type?: string;
    sectionIndex?: number;
  };

  const { roomId, type, sectionIndex } = body;
  if (!roomId || !type) {
    return NextResponse.json({ error: 'roomId and type required' }, { status: 400 });
  }

  const validTypes = ['next-section', 'prev-section', 'goto-section', 'scroll-up', 'scroll-down'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'invalid command type' }, { status: 400 });
  }

  const success = addCommand(roomId, {
    type: type as 'next-section' | 'prev-section' | 'goto-section' | 'scroll-up' | 'scroll-down',
    sectionIndex,
  });

  if (!success) {
    return NextResponse.json({ error: 'room not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const since = Number(searchParams.get('since') || '0');

  if (!roomId) {
    return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  }

  const commands = getCommands(roomId, since);
  return NextResponse.json({ commands, serverTime: Date.now() });
}
