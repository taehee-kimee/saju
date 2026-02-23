import lunisolar from 'lunisolar';
import { SajuResult, Ohaeng } from '@/types';

const CHEONGAN_OHAENG: Record<string, Ohaeng> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const JIJI_OHAENG: Record<string, Ohaeng> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number
): SajuResult {
  const date = new Date(year, month - 1, day, hour);
  const ls = lunisolar(date);
  const char8 = ls.char8;

  const pillars = [
    char8.year.stem.toString(),
    char8.year.branch.toString(),
    char8.month.stem.toString(),
    char8.month.branch.toString(),
    char8.day.stem.toString(),
    char8.day.branch.toString(),
    char8.hour.stem.toString(),
    char8.hour.branch.toString(),
  ];

  const ohaeng: Record<Ohaeng, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  pillars.forEach((char, i) => {
    const map = i % 2 === 0 ? CHEONGAN_OHAENG : JIJI_OHAENG;
    const element = map[char];
    if (element) ohaeng[element] += 1;
  });

  const total = Object.values(ohaeng).reduce((a, b) => a + b, 0) || 1;
  const ohaengPercent = Object.fromEntries(
    Object.entries(ohaeng).map(([k, v]) => [k, Math.round((v / total) * 100)])
  ) as Record<Ohaeng, number>;

  const sum = Object.values(ohaengPercent).reduce((a, b) => a + b, 0);
  if (sum !== 100) ohaengPercent['土'] += 100 - sum;

  const dominantOhaeng = Object.entries(ohaengPercent)
    .sort(([, a], [, b]) => b - a)[0][0] as Ohaeng;

  return {
    ohaeng: ohaengPercent,
    dominantOhaeng,
    year: char8.year.toString(),
    month: char8.month.toString(),
    day: char8.day.toString(),
    time: char8.hour.toString(),
  };
}
