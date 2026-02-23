import { getCatId, getCatCharacter } from './catMapper';

test('NT + 木 → NT_木 탐정냥', () => {
  const cat = getCatCharacter('NT', '木');
  expect(cat.id).toBe('NT_木');
  expect(cat.name).toBe('탐정냥');
});

test('SF + 水 → SF_水 치유냥', () => {
  const cat = getCatCharacter('SF', '水');
  expect(cat.id).toBe('SF_水');
  expect(cat.name).toBe('치유냥');
});

test('NF + 火 → NF_火 열정냥', () => {
  const cat = getCatCharacter('NF', '火');
  expect(cat.id).toBe('NF_火');
  expect(cat.name).toBe('열정냥');
});

test('ST + 金 → ST_金 완벽냥', () => {
  const cat = getCatCharacter('ST', '金');
  expect(cat.id).toBe('ST_金');
  expect(cat.name).toBe('완벽냥');
});

test('모든 20종 캐릭터 존재 확인', () => {
  const groups = ['NT', 'NF', 'ST', 'SF'] as const;
  const elements = ['木', '火', '土', '金', '水'] as const;
  for (const g of groups) {
    for (const e of elements) {
      const cat = getCatCharacter(g, e);
      expect(cat).toBeDefined();
      expect(cat.name).toBeTruthy();
      expect(cat.shortDesc.length).toBeGreaterThan(50);
      expect(Object.keys(cat.monthFortune).length).toBe(12);
    }
  }
});
