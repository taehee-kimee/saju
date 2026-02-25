// 80개 캐릭터 통합 export
import { NT_CHARACTERS } from './nt-group';
import { NF_CHARACTERS } from './nf-group';
import { ST_CHARACTERS } from './st-group';
import { SF_CHARACTERS } from './sf-group';

export const ALL_CHARACTERS = {
  ...NT_CHARACTERS,
  ...NF_CHARACTERS,
  ...ST_CHARACTERS,
  ...SF_CHARACTERS,
};

export const CHARACTER_IDS = Object.keys(ALL_CHARACTERS) as CharacterId[];

// Re-export for convenience
export { NT_CHARACTERS, NF_CHARACTERS, ST_CHARACTERS, SF_CHARACTERS };

// Type definitions
export type CharacterId = keyof typeof ALL_CHARACTERS;
export type MbtiType = 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' |
  'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' |
  'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' |
  'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';
export type Ohaeng = '木' | '火' | '土' | '金' | '水';

export interface Character {
  id: CharacterId;
  name: string;
  emoji: string;
  tagline: string;
  subtitles: {
    diagnosis: string;
    ohaengMap: string;
    mbtiEngine: string;
    combination: string;
    pattern: string;
  };
  sections: {
    diagnosis: string;
    ohaengMap: string;
    mbtiEngine: string;
    combination: string;
    pattern: string;
    love: string;
    money: string;
    career: string;
    health: string;
    relationship: string;
    mission7: string[];
  };
}

// Helper function to get character by ID
export function getCharacter(id: CharacterId): Character {
  return ALL_CHARACTERS[id] as Character;
}

// Helper function to get character by MBTI and Ohaeng
export function getCharacterByMbtiAndOhaeng(mbti: MbtiType, ohaeng: Ohaeng): Character {
  const id = `${mbti}_${ohaeng}` as CharacterId;
  return ALL_CHARACTERS[id] as Character;
}
