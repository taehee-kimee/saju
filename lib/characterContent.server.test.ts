import { createCharacterId } from './catMapper';
import {
  clearCharacterContentCache,
  getCharacterContentById,
} from './characterContent.server';

afterEach(() => {
  clearCharacterContentCache();
});

test('마크다운 문서에서 ENFP_火 캐릭터를 읽는다', () => {
  const characterId = createCharacterId('ENFP', '火');
  const character = getCharacterContentById(characterId);

  expect(character.id).toBe(characterId);
  expect(character.name.length).toBeGreaterThan(0);
  expect(character.sections.diagnosis.length).toBeGreaterThan(50);
  expect(character.sections.timingSense.length).toBeGreaterThan(50);
});

test('금 오행은 호환 파일명(金)도 읽을 수 있다', () => {
  const characterId = createCharacterId('INTJ', '金');
  const character = getCharacterContentById(characterId);

  expect(character.id).toBe(characterId);
  expect(character.sections.pattern.length).toBeGreaterThan(50);
});
