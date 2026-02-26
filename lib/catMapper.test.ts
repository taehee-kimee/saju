import {
  createCharacterId,
  getCharacterMarkdownCandidates,
  normalizeCharacterId,
  normalizeOhaeng,
  parseCharacterId,
} from './catMapper';

test('오행 금 호환 글자를 정규화한다', () => {
  expect(normalizeOhaeng('金')).toBe('金');
  expect(normalizeOhaeng('金')).toBe('金');
});

test('캐릭터 ID를 생성한다', () => {
  expect(createCharacterId('ENFP', '火')).toBe('ENFP_火');
});

test('호환 캐릭터 ID를 표준 ID로 변환한다', () => {
  expect(normalizeCharacterId('INTJ_金')).toBe('INTJ_金');
});

test('캐릭터 ID를 파싱한다', () => {
  expect(parseCharacterId('ISFJ_土')).toEqual({ mbti: 'ISFJ', ohaeng: '土' });
});

test('금 오행은 파일 후보를 2개 반환한다', () => {
  expect(getCharacterMarkdownCandidates('INTJ', '金')).toEqual([
    'INTJ_金.md',
    'INTJ_金.md',
  ]);
});
