export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type Ohaeng = '木' | '火' | '土' | '金' | '水';

// 새로운 80개 캐릭터 ID 타입
export type CharacterId = `${MbtiType}_${Ohaeng}`;

// Legacy types (deprecated - for backward compatibility)
export type MbtiGroup = 'NT' | 'NF' | 'ST' | 'SF';
export type CatId =
  | 'NT_木' | 'NT_火' | 'NT_土' | 'NT_金' | 'NT_水'
  | 'NF_木' | 'NF_火' | 'NF_土' | 'NF_金' | 'NF_水'
  | 'ST_木' | 'ST_火' | 'ST_土' | 'ST_金' | 'ST_水'
  | 'SF_木' | 'SF_火' | 'SF_土' | 'SF_金' | 'SF_水';

// 새로운 캐릭터 인터페이스
export interface Character {
  id: CharacterId;
  name: string;
  emoji: string;
  tagline: string;
  subtitles: {
    diagnosis: string;
    ohaengMap: string;
    combination: string;
    pattern: string;
    timingSense: string;
  };
  sections: {
    diagnosis: string;
    ohaengMap: string;
    combination: string;
    pattern: string;
    timingSense: string;
    love: string;
    money: string;
    career: string;
    health: string;
    relationship: string;
  };
}

// Legacy interface (deprecated)
export interface CatCharacter {
  id: CatId;
  name: string;
  emoji: string;
  appearance: string;
  tagline: string;
  shortDesc: string;
  fullDesc: string;
  yearFortune: string;
  monthFortune: Record<string, string>;
}

export interface SajuResult {
  ohaeng: Record<Ohaeng, number>;
  dominantOhaeng: Ohaeng;
  year: string;
  month: string;
  day: string;
  time: string;
  // Detailed payload for AI
  payload: SajuPayload;
}

export interface Pillar {
  stem: string;    // 천간
  branch: string;  // 지지
}

export interface SajuPayload {
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar | null;
  };
  dayMaster: string;  // 일간
  fiveElementsCount: Record<Ohaeng, number>;  // 천간+지지 기준 오행 개수
  seasonFactor: {
    monthBranch: string;  // 월지
    dominantElement: Ohaeng;
    notes: string;  // 계절 설명
  };
  balanceSummary: {
    strong: Ohaeng[];
    weak: Ohaeng[];
    skewed: boolean;
    remarks: string;
  };
  yearContext: {
    year: number;
    annualPillar: Pillar;
    annualElementTheme: Ohaeng[];
  };
}

export interface UserInput {
  mbti: MbtiType;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
}

// 새로운 ResultData
export interface ResultData {
  character: Character;
  saju: SajuResult;
  mbti: MbtiType;
  isPaid: boolean;
}

// Legacy ResultData (deprecated)
export interface LegacyResultData {
  cat: CatCharacter;
  saju: SajuResult;
  mbtiGroup: MbtiGroup;
  isPaid: boolean;
}
