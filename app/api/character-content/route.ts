import { NextRequest, NextResponse } from 'next/server';

import { getCharacterContentById } from '@/lib/characterContent.server';
import { normalizeCharacterId } from '@/lib/catMapper';

export async function GET(req: NextRequest) {
  const requestedId = req.nextUrl.searchParams.get('id');
  if (!requestedId) {
    return NextResponse.json(
      { error: 'Missing required query: id' },
      { status: 400 }
    );
  }

  const characterId = normalizeCharacterId(requestedId);
  if (!characterId) {
    return NextResponse.json({ error: 'Invalid character id' }, { status: 400 });
  }

  try {
    const character = getCharacterContentById(characterId);
    return NextResponse.json(character);
  } catch {
    return NextResponse.json(
      { error: 'Character content not found' },
      { status: 404 }
    );
  }
}
