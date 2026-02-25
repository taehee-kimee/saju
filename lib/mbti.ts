// MBTI 타입 매핑
export type MbtiType = 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' |
  'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' |
  'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' |
  'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type Ohaeng = '木' | '火' | '土' | '金' | '水';

// 16개 타입별 특성
export const MBTI_TRAITS: Record<MbtiType, { name: string; emoji: string; description: string }> = {
  // NT
  INTJ: { name: "올빼미", emoji: "🦉", description: "전략적 통찰자" },
  INTP: { name: "코알라", emoji: "🐨", description: "이론적 탐구자" },
  ENTJ: { name: "사자", emoji: "🦁", description: "카리스마 리더" },
  ENTP: { name: "여우", emoji: "🦊", description: "영리한 변론가" },
  // NF
  INFJ: { name: "코끼리", emoji: "🐘", description: "옹호자" },
  INFP: { name: "고래", emoji: "🐋", description: "몽상가" },
  ENFJ: { name: "강아지", emoji: "🐕", description: "주도자" },
  ENFP: { name: "돌고래", emoji: "🐬", description: "활동가" },
  // ST
  ISTJ: { name: "비버", emoji: "🦫", description: "현실주의자" },
  ISFJ: { name: "펭귄", emoji: "🐧", description: "수호자" },
  ESTJ: { name: "말", emoji: "🐴", description: "경영자" },
  ESFJ: { name: "곰", emoji: "🐻", description: "집정관" },
  // SF
  ISTP: { name: "뱀", emoji: "🐍", description: "장인" },
  ISFP: { name: "나비", emoji: "🦋", description: "예술가" },
  ESTP: { name: "호랑이", emoji: "🐅", description: "사업가" },
  ESFP: { name: "앵무새", emoji: "🦜", description: "연예인" },
};

// 모든 MBTI 타입 리스트
export const ALL_MBTI_TYPES: MbtiType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

// 타입 유효성 검사
export function isValidMbti(type: string): type is MbtiType {
  return ALL_MBTI_TYPES.includes(type as MbtiType);
}

// MbtiTest 12문항 답변에서 MBTI 도출
// 질문 1-3: E/I, 질문 4-6: S/N, 질문 7-9: T/F, 질문 10-12: J/P
// 각 질문의 0번 답변이 E/S/T/J, 1번 답변이 I/N/F/P
export function getMbtiFromAnswers(answers: number[]): MbtiType {
  const ei = answers.slice(0, 3).filter(a => a === 0).length >= 2 ? 'E' : 'I';
  const sn = answers.slice(3, 6).filter(a => a === 0).length >= 2 ? 'S' : 'N';
  const tf = answers.slice(6, 9).filter(a => a === 0).length >= 2 ? 'T' : 'F';
  const jp = answers.slice(9, 12).filter(a => a === 0).length >= 2 ? 'J' : 'P';
  return `${ei}${sn}${tf}${jp}` as MbtiType;
}

// MBTI 타입에서 그룹(NT/NF/ST/SF) 추출
export type MbtiGroup = 'NT' | 'NF' | 'ST' | 'SF';

export function getMbtiGroup(mbti: MbtiType): MbtiGroup {
  const sn = mbti.charAt(1); // S or N
  const tf = mbti.charAt(2); // T or F
  return `${sn}${tf}` as MbtiGroup;
}

