export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type MbtiGroup = 'NT' | 'NF' | 'ST' | 'SF';

export type Ohaeng = '木' | '火' | '土' | '金' | '水';

export type CatId =
  | 'NT_木' | 'NT_火' | 'NT_土' | 'NT_金' | 'NT_水'
  | 'NF_木' | 'NF_火' | 'NF_土' | 'NF_金' | 'NF_水'
  | 'ST_木' | 'ST_火' | 'ST_土' | 'ST_金' | 'ST_水'
  | 'SF_木' | 'SF_火' | 'SF_土' | 'SF_金' | 'SF_水';

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
}

export interface UserInput {
  mbti: MbtiType;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
}

export interface ResultData {
  cat: CatCharacter;
  saju: SajuResult;
  mbtiGroup: MbtiGroup;
  isPaid: boolean;
}
