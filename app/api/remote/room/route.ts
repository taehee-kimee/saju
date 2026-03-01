import { NextResponse } from 'next/server';
import { createRoom, roomExists } from '@/lib/remoteStore';

export async function POST() {
  const roomId = createRoom();
  return NextResponse.json({ roomId });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) {
    return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  }
  return NextResponse.json({ exists: roomExists(roomId) });
}
