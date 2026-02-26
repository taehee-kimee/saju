import { CharacterId, MbtiType, Ohaeng } from '@/types';
import { isValidMbti } from '@/lib/mbti';

const COMPATIBILITY_METAL = '金';

const OHAENG_NORMALIZATION_MAP: Record<string, Ohaeng> = {
  木: '木',
  火: '火',
  土: '土',
  金: '金',
  [COMPATIBILITY_METAL]: '金',
  水: '水',
};

export function normalizeOhaeng(value: string): Ohaeng | null {
  return OHAENG_NORMALIZATION_MAP[value] ?? null;
}

export function createCharacterId(mbti: MbtiType, ohaeng: Ohaeng): CharacterId {
  return `${mbti}_${ohaeng}`;
}

export function parseCharacterId(
  value: string
): { mbti: MbtiType; ohaeng: Ohaeng } | null {
  const [mbtiRaw, ohaengRaw, ...rest] = value.split('_');
  if (rest.length > 0 || !mbtiRaw || !ohaengRaw || !isValidMbti(mbtiRaw)) {
    return null;
  }

  const normalizedOhaeng = normalizeOhaeng(ohaengRaw);
  if (!normalizedOhaeng) {
    return null;
  }

  return { mbti: mbtiRaw, ohaeng: normalizedOhaeng };
}

export function normalizeCharacterId(value: string): CharacterId | null {
  const parsed = parseCharacterId(value);
  if (!parsed) {
    return null;
  }
  return createCharacterId(parsed.mbti, parsed.ohaeng);
}

export function isCharacterId(value: string): value is CharacterId {
  return normalizeCharacterId(value) !== null;
}

export function getCharacterMarkdownCandidates(
  mbti: MbtiType,
  ohaeng: Ohaeng
): string[] {
  if (ohaeng === '金') {
    return [`${mbti}_金.md`, `${mbti}_${COMPATIBILITY_METAL}.md`];
  }
  return [`${mbti}_${ohaeng}.md`];
}
