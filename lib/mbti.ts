import { MbtiType, MbtiGroup } from '@/types';

const NT_TYPES: MbtiType[] = ['INTJ', 'INTP', 'ENTJ', 'ENTP'];
const NF_TYPES: MbtiType[] = ['INFJ', 'INFP', 'ENFJ', 'ENFP'];
const ST_TYPES: MbtiType[] = ['ISTJ', 'ISTP', 'ESTJ', 'ESTP'];

export function getMbtiGroup(mbti: MbtiType): MbtiGroup {
  if (NT_TYPES.includes(mbti)) return 'NT';
  if (NF_TYPES.includes(mbti)) return 'NF';
  if (ST_TYPES.includes(mbti)) return 'ST';
  return 'SF';
}

export function getMbtiFromAnswers(answers: number[]): MbtiType {
  const score = (start: number) =>
    answers.slice(start, start + 3).filter((a) => a === 1).length;

  const ei = score(0) >= 2 ? 'I' : 'E';
  const sn = score(3) >= 2 ? 'N' : 'S';
  const tf = score(6) >= 2 ? 'F' : 'T';
  const jp = score(9) >= 2 ? 'P' : 'J';

  return `${ei}${sn}${tf}${jp}` as MbtiType;
}
