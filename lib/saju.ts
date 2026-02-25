import lunisolar from 'lunisolar';
import { SajuResult, SajuPayload, Ohaeng, Pillar } from '@/types';

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

// 계절별 설명
const SEASON_NOTES: Record<string, string> = {
  '寅': '초봄(立春) - 만물이 깨어나는 시작',
  '卯': '중봄(驚蟄) - 생명력이 가장 왕성한 때',
  '辰': '늦봄(清明) - 안정을 찾는 전환기',
  '巳': '초여름(立夏) - 열기가 시작되는 시기',
  '午': '한여름(芒種) - 태양의 기운이 최고조',
  '未': '늦여름(小暑) - 습기와 열기가 공존',
  '申': '초가을(立秋) - 수확의 준비',
  '酉': '중가을(白露) - 금(金)의 기운이 왕성',
  '戌': '늦가을(寒露) - 안정을 위한 정리',
  '亥': '초겨울(立冬) - 잠재력의 시작',
  '子': '한겨울(大雪) - 수(水)의 기운이 최고조',
  '丑': '늦겨울(小寒) - 토(土)가 얼음을 감싸 안음',
};

// 2026년 병오년 정보
const ANNUAL_YEAR_2026: Pillar = { stem: '丙', branch: '午' };

function calculateFiveElementsCount(pillars: Pillar[]): Record<Ohaeng, number> {
  const count: Record<Ohaeng, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  pillars.forEach(pillar => {
    // 천간 오행
    const stemElement = CHEONGAN_OHAENG[pillar.stem];
    if (stemElement) count[stemElement]++;
    
    // 지지 오행
    const branchElement = JIJI_OHAENG[pillar.branch];
    if (branchElement) count[branchElement]++;
  });
  
  return count;
}

function analyzeBalance(count: Record<Ohaeng, number>): { strong: Ohaeng[]; weak: Ohaeng[]; skewed: boolean; remarks: string } {
  const entries = Object.entries(count);
  const max = Math.max(...entries.map(([, v]) => v));
  const min = Math.min(...entries.map(([, v]) => v));
  const avg = entries.reduce((sum, [, v]) => sum + v, 0) / entries.length;
  
  const strong = entries.filter(([, v]) => v >= max - 0.5).map(([k]) => k as Ohaeng);
  const weak = entries.filter(([, v]) => v <= min + 0.5).map(([k]) => k as Ohaeng);
  
  const skewed = max - min >= 3;
  
  let remarks = '';
  if (strong.length > 0 && weak.length > 0) {
    remarks = `${strong.join(',')} 과다, ${weak.join(',')} 결핍 경향`;
  } else if (strong.length > 0) {
    remarks = `${strong.join(',')} 기운이 강함`;
  } else if (weak.length > 0) {
    remarks = `${weak.join(',')} 기운이 약함`;
  } else {
    remarks = '오행이 비교적 균형잡힘';
  }
  
  return { strong, weak, skewed, remarks };
}

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number
): SajuResult {
  const date = new Date(year, month - 1, day, hour);
  const ls = lunisolar(date);
  const char8 = ls.char8;

  // 기본 사주 정보
  const pillars = {
    year: { stem: char8.year.stem.toString(), branch: char8.year.branch.toString() },
    month: { stem: char8.month.stem.toString(), branch: char8.month.branch.toString() },
    day: { stem: char8.day.stem.toString(), branch: char8.day.branch.toString() },
    hour: { stem: char8.hour.stem.toString(), branch: char8.hour.branch.toString() },
  };

  // 오행 백분율 계산
  const allChars = [
    pillars.year.stem, pillars.year.branch,
    pillars.month.stem, pillars.month.branch,
    pillars.day.stem, pillars.day.branch,
    pillars.hour.stem, pillars.hour.branch,
  ];

  const ohaeng: Record<Ohaeng, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  allChars.forEach((char, i) => {
    const map = i % 2 === 0 ? CHEONGAN_OHAENG : JIJI_OHAENG;
    const element = map[char];
    if (element) ohaeng[element] += 1;
  });

  const total = Object.values(ohaeng).reduce((a, b) => a + b, 0) || 1;
  const ohaengPercent = Object.fromEntries(
    Object.entries(ohaeng).map(([k, v]) => [k, Math.round((v / total) * 100)])
  ) as Record<Ohaeng, number>;

  const sum = Object.values(ohaengPercent).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    const diff = 100 - sum;
    const sorted = Object.entries(ohaengPercent).sort(([, a], [, b]) => b - a);
    ohaengPercent[sorted[0][0] as Ohaeng] += diff;
  }
  
  (Object.keys(ohaengPercent) as Ohaeng[]).forEach((key) => {
    if (ohaengPercent[key] < 0) ohaengPercent[key] = 0;
  });

  const dominantOhaeng = Object.entries(ohaengPercent)
    .sort(([, a], [, b]) => b - a)[0][0] as Ohaeng;

  // 상세 payload 생성
  const fiveElementsCount = calculateFiveElementsCount([
    pillars.year, pillars.month, pillars.day, pillars.hour
  ]);
  
  const balanceSummary = analyzeBalance(fiveElementsCount);
  
  const payload: SajuPayload = {
    pillars: {
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour,
    },
    dayMaster: pillars.day.stem,  // 일간
    fiveElementsCount,
    seasonFactor: {
      monthBranch: pillars.month.branch,
      dominantElement: dominantOhaeng,
      notes: SEASON_NOTES[pillars.month.branch] || '계절 정보',
    },
    balanceSummary,
    yearContext: {
      year: 2026,
      annualPillar: ANNUAL_YEAR_2026,
      annualElementTheme: ['火'],  // 2026 병오년은 불의 기운
    },
  };

  return {
    ohaeng: ohaengPercent,
    dominantOhaeng,
    year: char8.year.toString(),
    month: char8.month.toString(),
    day: char8.day.toString(),
    time: char8.hour.toString(),
    payload,
  };
}
