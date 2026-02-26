import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Character, CharacterId } from '@/types';
import {
  getCharacterMarkdownCandidates,
  parseCharacterId,
} from '@/lib/catMapper';

const CHARACTER_ROOT = join(process.cwd(), 'data', 'characters');

const FREE_SECTION_KEYS = [
  'diagnosis',
  'ohaengMap',
  'combination',
  'pattern',
  'timingSense',
] as const;

const DEFAULT_PAID_TEXT: Pick<
  Character['sections'],
  'love' | 'money' | 'career' | 'health' | 'relationship'
> = {
  love: 'AI가 생성한 연애 운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  money: 'AI가 생성한 재물 운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  career:
    'AI가 생성한 커리어 운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  health: 'AI가 생성한 건강 운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  relationship:
    'AI가 생성한 인간관계 운세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
};

type FreeSectionKey = (typeof FREE_SECTION_KEYS)[number];

interface SectionBlock {
  title: string;
  content: string;
}

const contentCache = new Map<CharacterId, Character>();

function parseFrontmatter(markdown: string): {
  meta: Record<string, string>;
  body: string;
} {
  const normalized = markdown.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { meta: {}, body: normalized };
  }

  const closingIndex = normalized.indexOf('\n---\n', 4);
  if (closingIndex === -1) {
    return { meta: {}, body: normalized };
  }

  const rawMeta = normalized.slice(4, closingIndex);
  const body = normalized.slice(closingIndex + 5);
  const meta: Record<string, string> = {};

  for (const line of rawMeta.split('\n')) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key.length > 0) {
      meta[key] = value;
    }
  }

  return { meta, body };
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1');
}

function normalizeSectionContent(text: string): string {
  return text
    .split('\n')
    .map((line) => stripInlineMarkdown(line).replace(/^[-*]\s+/, '• ').trim())
    .filter((line, index, arr) => !(line === '' && arr[index - 1] === ''))
    .join('\n')
    .trim();
}

function parseSectionBlocks(body: string): SectionBlock[] {
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)];
  if (matches.length === 0) {
    return [];
  }

  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length
        ? (matches[index + 1].index ?? body.length)
        : body.length;
    const rawContent = body.slice(start, end).trim();
    return {
      title,
      content: normalizeSectionContent(rawContent),
    };
  });
}

function resolveCharacterMarkdownPath(characterId: CharacterId): string {
  const parsed = parseCharacterId(characterId);
  if (!parsed) {
    throw new Error(`Invalid character id: ${characterId}`);
  }

  const directory = parsed.mbti.toLowerCase();
  const candidates = getCharacterMarkdownCandidates(parsed.mbti, parsed.ohaeng);

  for (const candidate of candidates) {
    const filePath = join(CHARACTER_ROOT, directory, candidate);
    if (existsSync(filePath)) {
      return filePath;
    }
  }

  throw new Error(`Character markdown not found for id: ${characterId}`);
}

function buildTaglineFromDiagnosis(diagnosisContent: string): string {
  const plain = diagnosisContent.replace(/\s+/g, ' ').trim();
  if (!plain) {
    return 'MBTI × 오행 캐릭터 리포트';
  }
  return plain.length > 56 ? `${plain.slice(0, 56)}…` : plain;
}

function getFreeSectionMap(
  sectionBlocks: SectionBlock[]
): {
  subtitles: Character['subtitles'];
  sections: Pick<Character['sections'], FreeSectionKey>;
} {
  if (sectionBlocks.length < FREE_SECTION_KEYS.length) {
    throw new Error(
      `Not enough free sections. expected=${FREE_SECTION_KEYS.length}, actual=${sectionBlocks.length}`
    );
  }

  const selected = sectionBlocks.slice(0, FREE_SECTION_KEYS.length);

  return {
    subtitles: {
      diagnosis: selected[0].title,
      ohaengMap: selected[1].title,
      combination: selected[2].title,
      pattern: selected[3].title,
      timingSense: selected[4].title,
    },
    sections: {
      diagnosis: selected[0].content,
      ohaengMap: selected[1].content,
      combination: selected[2].content,
      pattern: selected[3].content,
      timingSense: selected[4].content,
    },
  };
}

export function getCharacterContentById(characterId: CharacterId): Character {
  const cached = contentCache.get(characterId);
  if (cached) {
    return cached;
  }

  const parsed = parseCharacterId(characterId);
  if (!parsed) {
    throw new Error(`Invalid character id: ${characterId}`);
  }

  const markdownPath = resolveCharacterMarkdownPath(characterId);
  const rawMarkdown = readFileSync(markdownPath, 'utf-8');
  const { meta, body } = parseFrontmatter(rawMarkdown);
  const sectionBlocks = parseSectionBlocks(body);
  const freeSectionMap = getFreeSectionMap(sectionBlocks);

  const character: Character = {
    id: characterId,
    name: meta.name || `${parsed.mbti} ${parsed.ohaeng} 캐릭터`,
    emoji: meta.emoji || '🐱',
    tagline: buildTaglineFromDiagnosis(freeSectionMap.sections.diagnosis),
    subtitles: freeSectionMap.subtitles,
    sections: {
      ...freeSectionMap.sections,
      ...DEFAULT_PAID_TEXT,
    },
  };

  contentCache.set(characterId, character);
  return character;
}

export function clearCharacterContentCache(): void {
  contentCache.clear();
}
