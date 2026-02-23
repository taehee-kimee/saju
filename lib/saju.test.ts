import { calculateSaju } from './saju';

test('사주 계산 결과에 오행 5종 포함', () => {
  const result = calculateSaju(1990, 3, 15, 12);
  expect(Object.keys(result.ohaeng)).toEqual(['木', '火', '土', '金', '水']);
});

test('오행 비율 합계는 100', () => {
  const result = calculateSaju(1990, 3, 15, 12);
  const total = Object.values(result.ohaeng).reduce((a, b) => a + b, 0);
  expect(total).toBe(100);
});

test('dominantOhaeng은 가장 높은 오행', () => {
  const result = calculateSaju(1990, 3, 15, 12);
  const max = Math.max(...Object.values(result.ohaeng));
  expect(result.ohaeng[result.dominantOhaeng]).toBe(max);
});

test('다른 생년월일도 정상 계산', () => {
  const result = calculateSaju(2000, 1, 1, 0);
  const total = Object.values(result.ohaeng).reduce((a, b) => a + b, 0);
  expect(total).toBe(100);
  expect(result.dominantOhaeng).toBeTruthy();
});
