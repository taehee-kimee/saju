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
  dayMaster: string;
  fiveElementsCount: Record<Ohaeng, number>;
  seasonFactor: {
    monthBranch: string;
    dominantElement: Ohaeng;
    notes: string;
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
  // 심화 분석 필드
  hiddenStems: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  enrichedFiveElements: Record<Ohaeng, number>;
  tenGodChart: TenGodChart;
  dayMasterStrength: DayMasterStrength;
  favorableElement: FavorableElement;
  branchInteractions: BranchInteractions;
  decadeLuck: DecadeLuckPeriod[];
  annualAnalysis: AnnualAnalysis;
  ohaengBehaviors: OhaengBehavior[];
  repeatPatterns: RepeatPattern[];
  structureSummary: StructureSummary;
  mbtiSajuSynergy: MbtiSajuSynergy;
  threeYearOutlook: YearBrief[];
}

// ── 심화 사주 분석 타입 ──

export type Gender = 'male' | 'female';

export type TenGod =
  | '비견' | '겁재'   // 비겁
  | '식신' | '상관'   // 식상
  | '편재' | '정재'   // 재성
  | '편관' | '정관'   // 관성
  | '편인' | '정인';  // 인성

export type TenGodGroup = '비겁' | '식상' | '재성' | '관성' | '인성';

export interface TenGodChart {
  yearStem: TenGod;
  monthStem: TenGod;
  hourStem: TenGod | null;
  yearBranchMain: TenGod;
  monthBranchMain: TenGod;
  dayBranchMain: TenGod;
  hourBranchMain: TenGod | null;
  summary: Record<TenGod, number>;
  groupSummary: Record<TenGodGroup, number>;
  dominantGroups: { group: TenGodGroup; count: number; behavior: string }[];
}

export interface DayMasterStrength {
  isStrong: boolean;
  score: number;
  seasonSupport: 'strong' | 'moderate' | 'weak' | 'hostile';
  helpingElements: Ohaeng[];
  hinderingElements: Ohaeng[];
  analysis: string;
}

export interface FavorableElement {
  yongsin: Ohaeng;
  secondary: Ohaeng;
  unfavorable: Ohaeng;
  reasoning: string;
}

export interface BranchInteraction {
  type: '삼합' | '육합' | '충' | '형' | '천간합';
  involved: string[];
  pillars: string[];
  resultElement?: Ohaeng;
  description: string;
}

export interface BranchInteractions {
  interactions: BranchInteraction[];
  hasClash: boolean;
  hasTripleCombination: boolean;
  hasPunishment: boolean;
  summary: string;
}

export interface DecadeLuckPeriod {
  startAge: number;
  endAge: number;
  stem: string;
  branch: string;
  element: Ohaeng;
  tenGod: TenGod;
  theme: string;       // 성향 변화 방향
  description: string;
}

export interface AnnualPillarInteraction {
  pillarName: string;
  stemInteraction: string | null;
  branchInteraction: string | null;
  significance: string;
}

export interface AnnualAnalysis {
  annualTenGod: TenGod;
  annualHiddenStems: string[];
  pillarInteractions: AnnualPillarInteraction[];
  overallTheme: string;
  favorableMonths: string[];
  cautionMonths: string[];
}

export interface OhaengBehavior {
  element: Ohaeng;
  type: 'excess' | 'deficit';
  behavior: string;
}

export interface RepeatPattern {
  condition: string;
  pattern: string;
}

export interface StructureSummary {
  personalityAxis: string;
  energyTension: string;
  mainConflict: string;
  riskZone: string;
}

export interface MbtiSajuSynergy {
  synergies: string[];
  risks: string[];
}

export interface YearBrief {
  year: number;
  pillar: string;        // e.g. "丙午"
  tenGod: TenGod;
  tenGodGroup: TenGodGroup;
  theme: string;
  hasClash: boolean;
  clashDetail?: string;
  outlook: string;
}

export interface UserInput {
  mbti: MbtiType;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender?: Gender;
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
