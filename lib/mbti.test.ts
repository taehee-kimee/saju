import { getMbtiGroup, getMbtiFromAnswers } from './mbti';

test('INTJ는 NT 그룹', () => {
  expect(getMbtiGroup('INTJ')).toBe('NT');
});

test('INFP는 NF 그룹', () => {
  expect(getMbtiGroup('INFP')).toBe('NF');
});

test('ESTJ는 ST 그룹', () => {
  expect(getMbtiGroup('ESTJ')).toBe('ST');
});

test('ESFJ는 SF 그룹', () => {
  expect(getMbtiGroup('ESFJ')).toBe('SF');
});

test('12개 답변으로 MBTI 타입 계산', () => {
  const answers = [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]; // ENTJ
  expect(getMbtiFromAnswers(answers)).toBe('ENTJ');
});

test('모두 1이면 INFP', () => {
  const answers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  expect(getMbtiFromAnswers(answers)).toBe('INFP');
});
