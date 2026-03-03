import lunisolar from 'lunisolar';
import {
  SajuResult, SajuPayload, Ohaeng, Pillar,
  TenGod, TenGodGroup, TenGodChart, Gender,
  DayMasterStrength, FavorableElement,
  BranchInteraction, BranchInteractions,
  DecadeLuckPeriod, AnnualAnalysis, AnnualPillarInteraction,
  OhaengBehavior, RepeatPattern, StructureSummary, MbtiSajuSynergy,
  YearBrief,
  MbtiType,
} from '@/types';

// ── 기본 매핑 테이블 ──

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

const ANNUAL_YEAR_2026: Pillar = { stem: '丙', branch: '午' };

// ── 심화 분석 참조 데이터 ──

const STEM_YINYANG: Record<string, 'yang' | 'yin'> = {
  '甲': 'yang', '乙': 'yin', '丙': 'yang', '丁': 'yin',
  '戊': 'yang', '己': 'yin', '庚': 'yang', '辛': 'yin',
  '壬': 'yang', '癸': 'yin',
};

const JIJANGGAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '辛', '癸'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

const GENERATION_CYCLE: Record<Ohaeng, Ohaeng> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

const CONTROL_CYCLE: Record<Ohaeng, Ohaeng> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

const GENERATED_BY: Record<Ohaeng, Ohaeng> = {
  '火': '木', '土': '火', '金': '土', '水': '金', '木': '水',
};

const CONTROLLED_BY: Record<Ohaeng, Ohaeng> = {
  '土': '木', '水': '土', '火': '水', '金': '火', '木': '金',
};

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const SAMHAP: { branches: [string, string, string]; resultElement: Ohaeng }[] = [
  { branches: ['寅', '午', '戌'], resultElement: '火' },
  { branches: ['申', '子', '辰'], resultElement: '水' },
  { branches: ['亥', '卯', '未'], resultElement: '木' },
  { branches: ['巳', '酉', '丑'], resultElement: '金' },
];

const YUKHAP: { pair: [string, string]; resultElement: Ohaeng }[] = [
  { pair: ['子', '丑'], resultElement: '土' },
  { pair: ['寅', '亥'], resultElement: '木' },
  { pair: ['卯', '戌'], resultElement: '火' },
  { pair: ['辰', '酉'], resultElement: '金' },
  { pair: ['巳', '申'], resultElement: '水' },
  { pair: ['午', '未'], resultElement: '火' },
];

const CHUNG: [string, string][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

const HYUNG: { branches: string[]; name: string }[] = [
  { branches: ['寅', '巳', '申'], name: '무은지형(無恩之刑)' },
  { branches: ['丑', '戌', '未'], name: '지세지형(恃勢之刑)' },
  { branches: ['子', '卯'], name: '무례지형(無禮之刑)' },
];

const CHEONGAN_HAP: { pair: [string, string]; resultElement: Ohaeng }[] = [
  { pair: ['甲', '己'], resultElement: '土' },
  { pair: ['乙', '庚'], resultElement: '金' },
  { pair: ['丙', '辛'], resultElement: '水' },
  { pair: ['丁', '壬'], resultElement: '木' },
  { pair: ['戊', '癸'], resultElement: '火' },
];

const SEASON_ELEMENT: Record<string, Ohaeng> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
  '辰': '土', '未': '土', '戌': '土', '丑': '土',
};

// ── 행동 패턴 매핑 ──

const OHAENG_EXCESS_BEHAVIOR: Record<Ohaeng, string> = {
  '木': '확장/산만, 시작만 하고 마무리 못함, 과도한 계획',
  '火': '감정 폭발, 관계 과열, 조급함, 충동적 결정',
  '土': '고집, 정체, 과도한 걱정, 변화 거부',
  '金': '비판적, 단절, 완벽주의, 타인 배제',
  '水': '회피, 과도한 사고, 불안, 우유부단',
};

const OHAENG_DEFICIT_BEHAVIOR: Record<Ohaeng, string> = {
  '木': '의지 부족, 성장 정체, 추진력 결여',
  '火': '무기력, 열정 상실, 동기 부족',
  '土': '중심 없음, 신뢰 부족, 불안정',
  '金': '우유부단, 결단력 부족, 마무리 못함',
  '水': '유연성 부족, 소통 막힘, 적응 어려움',
};

const TENGOD_GROUP_BEHAVIOR: Record<TenGodGroup, string> = {
  '비겁': '자기중심적, 독립심 강, 경쟁적, 자아 강조',
  '식상': '표현력 과다, 창의적이나 입화 주의, 예술적 감각',
  '재성': '현실적, 물질 지향, 관계에서 주도적, 실용적',
  '관성': '규율 중시, 외부 기준에 민감, 압박감, 책임감 강',
  '인성': '사고형, 학습 욕구 강, 행동력 부족, 내면 중시',
};

const DECADE_LUCK_THEMES: Record<TenGodGroup, string> = {
  '비겁': '자아 강화기 — 독립/경쟁 심화, 자기 정체성 확립',
  '식상': '표현 폭발기 — 창작/이직 욕구, 새로운 시도',
  '재성': '현실 중심 전환 — 재물/결혼 이벤트, 물질적 성취',
  '관성': '사회적 압박 강화 — 승진/시험/책임, 외부 평가',
  '인성': '공부/내면 강화 — 자격증/학업/재충전, 성찰기',
};

interface RepeatPatternRule {
  check: (s: DayMasterStrength, g: Record<TenGodGroup, number>, clash: boolean) => boolean;
  condition: string;
  pattern: string;
}

const REPEAT_PATTERN_RULES: RepeatPatternRule[] = [
  { check: (s, g) => !s.isStrong && g['관성'] >= 2, condition: '신약 + 관성 강', pattern: '외부 기준에 끌려다니는 패턴 — 타인 평가에 자기 기준이 흔들림' },
  { check: (s, g) => s.isStrong && g['비겁'] >= 2, condition: '신강 + 비겁 과다', pattern: '독단적 결정 반복 — 주변 의견을 무시하고 밀어붙이는 경향' },
  { check: (s, g, c) => g['식상'] >= 2 && c, condition: '식상 강 + 충 있음', pattern: '말/표현 문제 반복 — 솔직함이 갈등으로 이어지는 패턴' },
  { check: (s, g) => !s.isStrong && g['인성'] >= 2, condition: '신약 + 인성 과다', pattern: '생각만 많고 행동 못함 — 분석은 완벽하나 실행이 늦음' },
  { check: (s, g) => !s.isStrong && g['재성'] >= 2, condition: '재성 강 + 신약', pattern: '돈에 쫓기는 패턴 — 재물욕은 있으나 체력/의지가 부족' },
  { check: (s, g, c) => g['관성'] >= 2 && c, condition: '관성 강 + 충 있음', pattern: '직장/권위 갈등 반복 — 조직 내 마찰이 주기적으로 발생' },
  { check: (s, g) => g['비겁'] >= 2 && g['재성'] === 0, condition: '비겁 강 + 재성 약', pattern: '투자 실패 반복 — 자기 확신은 강하나 현실 감각 부족' },
  { check: (s, g) => g['식상'] >= 2 && g['관성'] === 0, condition: '식상 강 + 관성 약', pattern: '자유분방하나 체계 부족 — 틀을 싫어해서 오히려 불안정' },
];

const MBTI_LETTER_TENGOD_SYNERGY: { letter: string; group: TenGodGroup; synergy: string; risk: string }[] = [
  { letter: 'E', group: '비겁', synergy: '사회적 주도력 극대화', risk: '독선 주의, 경청 부족' },
  { letter: 'I', group: '인성', synergy: '깊은 내면 통찰력', risk: '과내면화, 행동 지연' },
  { letter: 'N', group: '식상', synergy: '아이디어 폭발, 창의성 극대화', risk: '실행력 부족, 공상' },
  { letter: 'S', group: '재성', synergy: '현실 장악력 극대화', risk: '상상력 제한, 보수적' },
  { letter: 'T', group: '관성', synergy: '시스템 구축, 분석력', risk: '감정 무시, 냉정' },
  { letter: 'F', group: '비겁', synergy: '감성 리더십', risk: '감정+자기주장 충돌' },
  { letter: 'J', group: '관성', synergy: '체계적 실행력', risk: '과도한 통제 욕구' },
  { letter: 'P', group: '식상', synergy: '유연한 적응력', risk: '산만함 극대화' },
];

const MBTI_FULL_TENGOD_SYNERGY: { mbti: string; group: TenGodGroup; synergy: string; risk: string }[] = [
  { mbti: 'ENFP', group: '식상', synergy: '표현력+외향이 시너지', risk: '과표현 리스크 증폭' },
  { mbti: 'INFJ', group: '인성', synergy: '직관+내면이 깊은 통찰', risk: '과내면화, 현실 괴리' },
  { mbti: 'ENTJ', group: '관성', synergy: '리더십+체계가 극대화', risk: '지배적 리더십 극단화' },
  { mbti: 'ISFP', group: '재성', synergy: '감성+현실 균형 가능', risk: '감성과 현실 사이 갈등' },
  { mbti: 'INTP', group: '식상', synergy: '분석+창의 융합', risk: '사고 과잉, 결정 회피' },
  { mbti: 'ESFJ', group: '비겁', synergy: '관계+자아 조화', risk: '타인 의존적 자기주장' },
  { mbti: 'INTJ', group: '관성', synergy: '전략+규율 시너지', risk: '완벽주의 극단화' },
  { mbti: 'ENFJ', group: '인성', synergy: '공감+학습이 리더십으로', risk: '번아웃, 자기 희생' },
];

// ── 계산 함수 ──

function getHiddenStems(branch: string): string[] {
  return JIJANGGAN[branch] || [];
}

function calculateEnrichedFiveElements(pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }): Record<Ohaeng, number> {
  const count: Record<Ohaeng, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  const pillarList = [pillars.year, pillars.month, pillars.day, pillars.hour].filter((p): p is Pillar => p !== null);

  for (const p of pillarList) {
    const stemEl = CHEONGAN_OHAENG[p.stem];
    if (stemEl) count[stemEl] += 1;

    const hidden = getHiddenStems(p.branch);
    const weights = hidden.length === 1 ? [1.0] : hidden.length === 2 ? [0.7, 0.3] : [0.6, 0.25, 0.15];
    hidden.forEach((h, i) => {
      const el = CHEONGAN_OHAENG[h];
      if (el) count[el] += weights[i];
    });
  }

  // 소수점 둘째자리 반올림
  for (const k of Object.keys(count) as Ohaeng[]) {
    count[k] = Math.round(count[k] * 100) / 100;
  }

  return count;
}

function determineTenGod(
  dayMasterElement: Ohaeng,
  dayMasterYinYang: 'yang' | 'yin',
  targetElement: Ohaeng,
  targetYinYang: 'yang' | 'yin'
): TenGod {
  const same = dayMasterYinYang === targetYinYang;

  if (targetElement === dayMasterElement) return same ? '비견' : '겁재';
  if (targetElement === GENERATION_CYCLE[dayMasterElement]) return same ? '식신' : '상관';
  if (targetElement === CONTROL_CYCLE[dayMasterElement]) return same ? '편재' : '정재';
  if (targetElement === CONTROLLED_BY[dayMasterElement]) return same ? '편관' : '정관';
  if (targetElement === GENERATED_BY[dayMasterElement]) return same ? '편인' : '정인';
  return '비견';
}

function tenGodGroupOf(tg: TenGod): TenGodGroup {
  if (tg === '비견' || tg === '겁재') return '비겁';
  if (tg === '식신' || tg === '상관') return '식상';
  if (tg === '편재' || tg === '정재') return '재성';
  if (tg === '편관' || tg === '정관') return '관성';
  return '인성';
}

function calculateTenGodsForChart(dayMaster: string, pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }): TenGodChart {
  const dmElement = CHEONGAN_OHAENG[dayMaster]!;
  const dmYY = STEM_YINYANG[dayMaster]!;

  const calcStem = (stem: string) => determineTenGod(dmElement, dmYY, CHEONGAN_OHAENG[stem]!, STEM_YINYANG[stem]!);
  const calcBranch = (branch: string) => {
    const mainHidden = getHiddenStems(branch)[0];
    if (!mainHidden) return '비견' as TenGod;
    return determineTenGod(dmElement, dmYY, CHEONGAN_OHAENG[mainHidden]!, STEM_YINYANG[mainHidden]!);
  };

  const yearStem = calcStem(pillars.year.stem);
  const monthStem = calcStem(pillars.month.stem);
  const hourStem = pillars.hour ? calcStem(pillars.hour.stem) : null;
  const yearBranchMain = calcBranch(pillars.year.branch);
  const monthBranchMain = calcBranch(pillars.month.branch);
  const dayBranchMain = calcBranch(pillars.day.branch);
  const hourBranchMain = pillars.hour ? calcBranch(pillars.hour.branch) : null;

  const all: TenGod[] = [yearStem, monthStem, yearBranchMain, monthBranchMain, dayBranchMain];
  if (hourStem) all.push(hourStem);
  if (hourBranchMain) all.push(hourBranchMain);

  const summary: Record<TenGod, number> = {
    '비견': 0, '겁재': 0, '식신': 0, '상관': 0, '편재': 0,
    '정재': 0, '편관': 0, '정관': 0, '편인': 0, '정인': 0,
  };
  const groupSummary: Record<TenGodGroup, number> = { '비겁': 0, '식상': 0, '재성': 0, '관성': 0, '인성': 0 };

  for (const tg of all) {
    summary[tg]++;
    groupSummary[tenGodGroupOf(tg)]++;
  }

  const sortedGroups = (Object.entries(groupSummary) as [TenGodGroup, number][])
    .sort(([, a], [, b]) => b - a);
  const dominantGroups = sortedGroups.slice(0, 2).map(([group, count]) => ({
    group,
    count,
    behavior: TENGOD_GROUP_BEHAVIOR[group],
  }));

  return { yearStem, monthStem, hourStem, yearBranchMain, monthBranchMain, dayBranchMain, hourBranchMain, summary, groupSummary, dominantGroups };
}

function determineDayMasterStrength(
  dayMaster: string,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
  enrichedCount: Record<Ohaeng, number>,
): DayMasterStrength {
  const dmElement = CHEONGAN_OHAENG[dayMaster]!;
  const seasonEl = SEASON_ELEMENT[pillars.month.branch] || '土';

  let seasonSupport: DayMasterStrength['seasonSupport'];
  let seasonScore = 0;
  if (seasonEl === dmElement) { seasonSupport = 'strong'; seasonScore = 2; }
  else if (GENERATED_BY[dmElement] === seasonEl) { seasonSupport = 'moderate'; seasonScore = 1; }
  else if (CONTROL_CYCLE[seasonEl] === dmElement || CONTROLLED_BY[dmElement] === seasonEl) { seasonSupport = 'hostile'; seasonScore = -2; }
  else { seasonSupport = 'weak'; seasonScore = -1; }

  const helpEl = [dmElement, GENERATED_BY[dmElement]];
  const hinderEl = [GENERATION_CYCLE[dmElement], CONTROL_CYCLE[dmElement], CONTROLLED_BY[dmElement]];

  let helpScore = helpEl.reduce((s, el) => s + (enrichedCount[el] || 0), 0);
  let hinderScore = hinderEl.reduce((s, el) => s + (enrichedCount[el] || 0), 0);

  const score = Math.round((seasonScore + helpScore - hinderScore) * 100) / 100;
  const isStrong = score > 0;

  const helpingElements = helpEl.filter(el => (enrichedCount[el] || 0) > 0);
  const hinderingElements = hinderEl.filter(el => (enrichedCount[el] || 0) > 0);

  const analysis = isStrong
    ? `일간 ${dayMaster}(${dmElement})이 ${seasonSupport === 'strong' ? '계절의 강력한 지지' : '충분한 도움'}을 받아 신강합니다. 에너지를 분출하고 활용하는 방향이 유리합니다.`
    : `일간 ${dayMaster}(${dmElement})이 ${seasonSupport === 'hostile' ? '계절의 억압' : '도움 부족'}으로 신약합니다. 에너지를 보충하고 지지받는 환경이 필요합니다.`;

  return { isStrong, score, seasonSupport, helpingElements, hinderingElements, analysis };
}

function determineFavorableElement(strength: DayMasterStrength, dayMaster: string): FavorableElement {
  const dmElement = CHEONGAN_OHAENG[dayMaster]!;

  if (strength.isStrong) {
    const yongsin = CONTROL_CYCLE[dmElement]; // 재성 오행 (내가 극하는)
    const secondary = GENERATION_CYCLE[dmElement]; // 식상 오행 (내가 생하는)
    const unfavorable = GENERATED_BY[dmElement]; // 인성 오행 (나를 생하는)
    return {
      yongsin, secondary, unfavorable,
      reasoning: `신강하여 넘치는 ${dmElement} 기운을 빼줄 ${yongsin}(재성)이 용신. ${secondary}(식상)으로 에너지 발산도 유리. ${unfavorable}(인성)은 기운을 더 키워 과잉 유발.`,
    };
  } else {
    const yongsin = GENERATED_BY[dmElement]; // 인성 오행 (나를 생하는)
    const secondary = dmElement; // 비겁 오행 (같은 오행)
    const unfavorable = CONTROLLED_BY[dmElement]; // 관성 오행 (나를 극하는)
    return {
      yongsin, secondary, unfavorable,
      reasoning: `신약하여 부족한 ${dmElement} 기운을 보충할 ${yongsin}(인성)이 용신. ${secondary}(비겁)으로 힘을 더하는 것도 유리. ${unfavorable}(관성)은 약한 일간을 더 압박.`,
    };
  }
}

function analyzeOhaengBehaviors(balanceSummary: { strong: Ohaeng[]; weak: Ohaeng[] }): OhaengBehavior[] {
  const behaviors: OhaengBehavior[] = [];
  for (const el of balanceSummary.strong) {
    behaviors.push({ element: el, type: 'excess', behavior: OHAENG_EXCESS_BEHAVIOR[el] });
  }
  for (const el of balanceSummary.weak) {
    behaviors.push({ element: el, type: 'deficit', behavior: OHAENG_DEFICIT_BEHAVIOR[el] });
  }
  return behaviors;
}

function generateRepeatPatterns(
  strength: DayMasterStrength,
  tenGodChart: TenGodChart,
  interactions: BranchInteractions,
): RepeatPattern[] {
  const patterns: RepeatPattern[] = [];
  for (const rule of REPEAT_PATTERN_RULES) {
    if (rule.check(strength, tenGodChart.groupSummary, interactions.hasClash)) {
      patterns.push({ condition: rule.condition, pattern: rule.pattern });
    }
    if (patterns.length >= 3) break;
  }
  return patterns;
}

function analyzeBranchInteractions(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
): BranchInteractions {
  const interactions: BranchInteraction[] = [];
  const pillarEntries: { name: string; pillar: Pillar }[] = [
    { name: '연지', pillar: pillars.year },
    { name: '월지', pillar: pillars.month },
    { name: '일지', pillar: pillars.day },
  ];
  if (pillars.hour) pillarEntries.push({ name: '시지', pillar: pillars.hour });
  // 2026 세운도 포함
  pillarEntries.push({ name: '세운(午)', pillar: ANNUAL_YEAR_2026 });

  const branchList = pillarEntries.map(e => e.pillar.branch);
  const stemList = [pillars.year.stem, pillars.month.stem, pillars.day.stem];
  if (pillars.hour) stemList.push(pillars.hour.stem);
  stemList.push(ANNUAL_YEAR_2026.stem);

  // 충
  for (let i = 0; i < branchList.length; i++) {
    for (let j = i + 1; j < branchList.length; j++) {
      for (const [a, b] of CHUNG) {
        if ((branchList[i] === a && branchList[j] === b) || (branchList[i] === b && branchList[j] === a)) {
          interactions.push({
            type: '충', involved: [branchList[i], branchList[j]],
            pillars: [pillarEntries[i].name, pillarEntries[j].name],
            description: `${pillarEntries[i].name}(${branchList[i]})와 ${pillarEntries[j].name}(${branchList[j]}) 충 — 갈등과 변화의 에너지`,
          });
        }
      }
    }
  }

  // 육합
  for (let i = 0; i < branchList.length; i++) {
    for (let j = i + 1; j < branchList.length; j++) {
      for (const { pair, resultElement } of YUKHAP) {
        if ((branchList[i] === pair[0] && branchList[j] === pair[1]) || (branchList[i] === pair[1] && branchList[j] === pair[0])) {
          interactions.push({
            type: '육합', involved: [branchList[i], branchList[j]],
            pillars: [pillarEntries[i].name, pillarEntries[j].name],
            resultElement,
            description: `${pillarEntries[i].name}(${branchList[i]})와 ${pillarEntries[j].name}(${branchList[j]}) 육합 → ${resultElement} 생성`,
          });
        }
      }
    }
  }

  // 삼합
  for (const { branches, resultElement } of SAMHAP) {
    const found: number[] = [];
    for (const b of branches) {
      const idx = branchList.indexOf(b);
      if (idx >= 0 && !found.includes(idx)) found.push(idx);
    }
    if (found.length >= 2) {
      const label = found.length === 3 ? '삼합' : '반합';
      interactions.push({
        type: '삼합',
        involved: found.map(i => branchList[i]),
        pillars: found.map(i => pillarEntries[i].name),
        resultElement,
        description: `${found.map(i => `${pillarEntries[i].name}(${branchList[i]})`).join('·')} ${label} → ${resultElement}局`,
      });
    }
  }

  // 형
  for (const { branches: hBranches, name } of HYUNG) {
    const found: number[] = [];
    for (const b of hBranches) {
      const idx = branchList.indexOf(b);
      if (idx >= 0 && !found.includes(idx)) found.push(idx);
    }
    if (found.length >= 2) {
      interactions.push({
        type: '형',
        involved: found.map(i => branchList[i]),
        pillars: found.map(i => pillarEntries[i].name),
        description: `${found.map(i => `${pillarEntries[i].name}(${branchList[i]})`).join('·')} ${name}`,
      });
    }
  }

  // 천간합
  const stemEntries = ['연간', '월간', '일간'];
  if (pillars.hour) stemEntries.push('시간');
  stemEntries.push('세운간');

  for (let i = 0; i < stemList.length; i++) {
    for (let j = i + 1; j < stemList.length; j++) {
      for (const { pair, resultElement } of CHEONGAN_HAP) {
        if ((stemList[i] === pair[0] && stemList[j] === pair[1]) || (stemList[i] === pair[1] && stemList[j] === pair[0])) {
          interactions.push({
            type: '천간합',
            involved: [stemList[i], stemList[j]],
            pillars: [stemEntries[i], stemEntries[j]],
            resultElement,
            description: `${stemEntries[i]}(${stemList[i]})와 ${stemEntries[j]}(${stemList[j]}) 천간합 → ${resultElement}`,
          });
        }
      }
    }
  }

  return {
    interactions,
    hasClash: interactions.some(i => i.type === '충'),
    hasTripleCombination: interactions.some(i => i.type === '삼합'),
    hasPunishment: interactions.some(i => i.type === '형'),
    summary: interactions.length === 0
      ? '특별한 합충형이 없어 안정적인 구조'
      : interactions.map(i => i.description).join(' / '),
  };
}

function calculateDecadeLuck(
  yearStem: string,
  monthPillar: Pillar,
  dayMaster: string,
  gender: Gender | undefined,
  birthYear: number,
): DecadeLuckPeriod[] {
  if (!gender) return [];

  const yearYY = STEM_YINYANG[yearStem];
  const forward = (yearYY === 'yang' && gender === 'male') || (yearYY === 'yin' && gender === 'female');

  let stemIdx = STEMS.indexOf(monthPillar.stem);
  let branchIdx = BRANCHES.indexOf(monthPillar.branch);
  if (stemIdx < 0 || branchIdx < 0) return [];

  const dmElement = CHEONGAN_OHAENG[dayMaster]!;
  const dmYY = STEM_YINYANG[dayMaster]!;

  // 대운 시작 나이 근사치
  const startAge = forward ? 3 : 4;

  const periods: DecadeLuckPeriod[] = [];
  for (let i = 0; i < 8; i++) {
    stemIdx = forward ? (stemIdx + 1) % 10 : (stemIdx + 9) % 10;
    branchIdx = forward ? (branchIdx + 1) % 12 : (branchIdx + 11) % 12;

    const stem = STEMS[stemIdx];
    const branch = BRANCHES[branchIdx];
    const element = CHEONGAN_OHAENG[stem]!;
    const tenGod = determineTenGod(dmElement, dmYY, element, STEM_YINYANG[stem]!);
    const group = tenGodGroupOf(tenGod);

    const periodStart = startAge + i * 10;
    periods.push({
      startAge: periodStart,
      endAge: periodStart + 9,
      stem, branch, element, tenGod,
      theme: DECADE_LUCK_THEMES[group],
      description: `${periodStart}~${periodStart + 9}세: ${stem}${branch}(${element}) — ${tenGod}(${group}) — ${DECADE_LUCK_THEMES[group]}`,
    });
  }

  return periods;
}

function analyzeAnnualInteractions(
  dayMaster: string,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
): AnnualAnalysis {
  const dmElement = CHEONGAN_OHAENG[dayMaster]!;
  const dmYY = STEM_YINYANG[dayMaster]!;

  const annualStem = ANNUAL_YEAR_2026.stem;
  const annualBranch = ANNUAL_YEAR_2026.branch;

  const annualTenGod = determineTenGod(dmElement, dmYY, CHEONGAN_OHAENG[annualStem]!, STEM_YINYANG[annualStem]!);
  const annualHiddenStems = getHiddenStems(annualBranch);

  const pillarList: { name: string; pillar: Pillar }[] = [
    { name: '연주', pillar: pillars.year },
    { name: '월주', pillar: pillars.month },
    { name: '일주', pillar: pillars.day },
  ];
  if (pillars.hour) pillarList.push({ name: '시주', pillar: pillars.hour });

  const pillarInteractions: AnnualPillarInteraction[] = pillarList.map(({ name, pillar }) => {
    let stemInteraction: string | null = null;
    let branchInteraction: string | null = null;
    const significances: string[] = [];

    // 천간합 체크
    for (const { pair, resultElement } of CHEONGAN_HAP) {
      if ((pillar.stem === pair[0] && annualStem === pair[1]) || (pillar.stem === pair[1] && annualStem === pair[0])) {
        stemInteraction = `${pillar.stem}${annualStem} 합화${resultElement}`;
        significances.push(`천간이 합하여 ${resultElement} 기운 생성`);
      }
    }

    // 충 체크
    for (const [a, b] of CHUNG) {
      if ((pillar.branch === a && annualBranch === b) || (pillar.branch === b && annualBranch === a)) {
        branchInteraction = `${pillar.branch}${annualBranch} 충`;
        significances.push(`지지 충으로 ${name}에 변동/갈등 에너지`);
      }
    }

    // 육합 체크
    if (!branchInteraction) {
      for (const { pair, resultElement } of YUKHAP) {
        if ((pillar.branch === pair[0] && annualBranch === pair[1]) || (pillar.branch === pair[1] && annualBranch === pair[0])) {
          branchInteraction = `${pillar.branch}${annualBranch} 합 → ${resultElement}`;
          significances.push(`지지 합으로 ${name}에 조화/새로운 기운`);
        }
      }
    }

    return {
      pillarName: name,
      stemInteraction,
      branchInteraction,
      significance: significances.join('; ') || `${name}과 2026 세운 사이 특별한 합충 없음`,
    };
  });

  const annualGroup = tenGodGroupOf(annualTenGod);
  const overallTheme = `2026년 丙午(화火)는 당신에게 ${annualTenGod}(${annualGroup})의 해 — ${DECADE_LUCK_THEMES[annualGroup]}`;

  // 좋은 달 / 주의할 달 (간이 판정)
  const favorableEl = GENERATED_BY[dmElement]; // 인성 오행
  const cautionEl = CONTROLLED_BY[dmElement]; // 관성 오행

  const monthElements: Record<string, Ohaeng> = {
    '1월(寅)': '木', '2월(卯)': '木', '3월(辰)': '土',
    '4월(巳)': '火', '5월(午)': '火', '6월(未)': '土',
    '7월(申)': '金', '8월(酉)': '金', '9월(戌)': '土',
    '10월(亥)': '水', '11월(子)': '水', '12월(丑)': '土',
  };

  const favorableMonths: string[] = [];
  const cautionMonths: string[] = [];
  for (const [month, el] of Object.entries(monthElements)) {
    if (el === favorableEl || el === dmElement) favorableMonths.push(month);
    if (el === cautionEl) cautionMonths.push(month);
  }

  return { annualTenGod, annualHiddenStems, pillarInteractions, overallTheme, favorableMonths, cautionMonths };
}

function buildStructureSummary(
  tenGodChart: TenGodChart,
  dayMasterStrength: DayMasterStrength,
  ohaengBehaviors: OhaengBehavior[],
  branchInteractions: BranchInteractions,
  repeatPatterns: RepeatPattern[],
): StructureSummary {
  const topGroup = tenGodChart.dominantGroups[0]?.group || '비겁';
  const personalityAxis = `${topGroup} 우세 + ${dayMasterStrength.isStrong ? '신강' : '신약'}`;

  const excess = ohaengBehaviors.filter(b => b.type === 'excess').map(b => `${b.element} 과다`);
  const deficit = ohaengBehaviors.filter(b => b.type === 'deficit').map(b => `${b.element} 부족`);
  const energyTension = [...excess, ...deficit].join(' + ') || '오행 균형';

  const mainConflict = repeatPatterns.length > 0 ? repeatPatterns[0].pattern.split(' — ')[0] : '특별한 내적 갈등 없음';

  const clashes = branchInteractions.interactions.filter(i => i.type === '충' || i.type === '형');
  const riskZone = clashes.length > 0
    ? clashes.map(c => c.pillars.join('↔')).join(', ') + ' 충돌 주의'
    : '구조적 충돌 없음';

  return { personalityAxis, energyTension, mainConflict, riskZone };
}

function analyzeMbtiSajuSynergy(
  mbti: MbtiType,
  tenGodChart: TenGodChart,
  dayMasterStrength: DayMasterStrength,
): MbtiSajuSynergy {
  const synergies: string[] = [];
  const risks: string[] = [];

  const topGroups = tenGodChart.dominantGroups.map(d => d.group);

  // MBTI 글자별 체크
  for (const rule of MBTI_LETTER_TENGOD_SYNERGY) {
    if (mbti.includes(rule.letter) && topGroups.includes(rule.group)) {
      synergies.push(`${mbti}의 ${rule.letter} + ${rule.group}: ${rule.synergy}`);
      risks.push(`${mbti}의 ${rule.letter} + ${rule.group}: ${rule.risk}`);
    }
  }

  // MBTI 전체 매칭
  for (const rule of MBTI_FULL_TENGOD_SYNERGY) {
    if (mbti === rule.mbti && topGroups.includes(rule.group)) {
      synergies.push(`${rule.mbti} × ${rule.group}: ${rule.synergy}`);
      risks.push(`${rule.mbti} × ${rule.group}: ${rule.risk}`);
    }
  }

  // 신강/신약과 MBTI 조합
  if (!dayMasterStrength.isStrong && mbti.startsWith('I')) {
    risks.push('내향(I) + 신약: 에너지 소진이 빠르고 자기 주장이 약해질 수 있음');
  }
  if (dayMasterStrength.isStrong && mbti.startsWith('E')) {
    synergies.push('외향(E) + 신강: 사회적 에너지가 충만, 리더십 발휘 유리');
  }

  return { synergies, risks };
}

// ── 기존 함수 (유지) ──

function calculateFiveElementsCount(pillars: Pillar[]): Record<Ohaeng, number> {
  const count: Record<Ohaeng, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  pillars.forEach(pillar => {
    const stemElement = CHEONGAN_OHAENG[pillar.stem];
    if (stemElement) count[stemElement]++;
    const branchElement = JIJI_OHAENG[pillar.branch];
    if (branchElement) count[branchElement]++;
  });
  return count;
}

function analyzeBalance(count: Record<Ohaeng, number>): { strong: Ohaeng[]; weak: Ohaeng[]; skewed: boolean; remarks: string } {
  const entries = Object.entries(count);
  const max = Math.max(...entries.map(([, v]) => v));
  const min = Math.min(...entries.map(([, v]) => v));

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

// ── 3년 흐름 분석 ──

const YEAR_PILLARS: Record<number, Pillar> = {
  2026: { stem: '丙', branch: '午' },
  2027: { stem: '丁', branch: '未' },
  2028: { stem: '戊', branch: '申' },
};

const YEAR_OUTLOOK_TEMPLATES: Record<TenGodGroup, { active: string; passive: string }> = {
  '비겁': {
    active:  '자기 주도력이 살아나는 해예요. 독립·창업·자기 브랜딩에 유리하지만 고집과 충돌 주의.',
    passive: '경쟁·갈등이 높아지는 해. 협력보다 독단적 결정이 잦아질 수 있어요.',
  },
  '식상': {
    active:  '표현·창작·이직 욕구가 폭발하는 해. 새로운 도전을 시작하기 좋아요.',
    passive: '말과 행동이 앞서 나가 실수가 생길 수 있어요. 충동적 결정 조심.',
  },
  '재성': {
    active:  '재물·결혼·현실 성과를 거두기 좋은 해. 투자와 계약에 집중하세요.',
    passive: '재물 욕심이 과해지거나 관계가 이해타산적이 될 수 있어요.',
  },
  '관성': {
    active:  '승진·시험·사회적 인정을 받을 수 있는 해. 책임이 무거워지는 만큼 성과도 커요.',
    passive: '외부 압박과 스트레스가 강해지는 해. 건강과 멘탈 관리가 필요해요.',
  },
  '인성': {
    active:  '학습·자격증·내면 충전에 좋은 해. 재충전하고 다음 도약을 준비하세요.',
    passive: '행동보다 생각이 앞서는 해. 결정을 미루지 않도록 주의.',
  },
};

function analyzeYearBrief(
  year: number,
  dayMaster: string,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
): YearBrief {
  const annualPillar = YEAR_PILLARS[year];
  if (!annualPillar) throw new Error(`No pillar data for year ${year}`);

  const pillarStr = annualPillar.stem + annualPillar.branch;
  const dayMasterElement = CHEONGAN_OHAENG[dayMaster] ?? '土';
  const dayMasterYY = STEM_YINYANG[dayMaster] ?? 'yang';
  const annualElement = CHEONGAN_OHAENG[annualPillar.stem] ?? '火';
  const annualYY = STEM_YINYANG[annualPillar.stem] ?? 'yang';

  const tenGod = determineTenGod(dayMasterElement, dayMasterYY, annualElement, annualYY);
  const tenGodGroup = tenGodGroupOf(tenGod);
  const theme = DECADE_LUCK_THEMES[tenGodGroup] ?? '변화의 해';

  // 충 체크: 일지·월지·연지 vs 세운 지지
  const dayBranches = [pillars.year.branch, pillars.month.branch, pillars.day.branch];
  if (pillars.hour) dayBranches.push(pillars.hour.branch);
  let hasClash = false;
  let clashDetail: string | undefined;
  outer: for (const b of dayBranches) {
    for (const [ca, cb] of CHUNG) {
      if ((b === ca && annualPillar.branch === cb) || (b === cb && annualPillar.branch === ca)) {
        hasClash = true;
        clashDetail = `${b}↔${annualPillar.branch} 충`;
        break outer;
      }
    }
  }

  // 신강 여부에 따라 outlook 선택 (dayMaster element vs annual element)
  const isStrengthening =
    GENERATION_CYCLE[annualElement] === dayMasterElement ||  // 생조
    annualElement === dayMasterElement;                       // 비겁
  const templates = YEAR_OUTLOOK_TEMPLATES[tenGodGroup];
  let outlook = isStrengthening ? templates.active : templates.passive;
  if (hasClash) {
    outlook += ` ⚡ ${clashDetail} 영향으로 변화·이동·갈등이 생길 수 있어요.`;
  }

  return { year, pillar: pillarStr, tenGod, tenGodGroup, theme, hasClash, clashDetail, outlook };
}

// ── 메인 함수 ──

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender?: Gender,
  mbti?: MbtiType,
): SajuResult {
  const date = new Date(year, month - 1, day, hour);
  const ls = lunisolar(date);
  const char8 = ls.char8;

  const pillars = {
    year: { stem: char8.year.stem.toString(), branch: char8.year.branch.toString() },
    month: { stem: char8.month.stem.toString(), branch: char8.month.branch.toString() },
    day: { stem: char8.day.stem.toString(), branch: char8.day.branch.toString() },
    hour: { stem: char8.hour.stem.toString(), branch: char8.hour.branch.toString() },
  };

  // 기존 오행 백분율 (UI 바 차트용)
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

  const percentSum = Object.values(ohaengPercent).reduce((a, b) => a + b, 0);
  if (percentSum !== 100) {
    const diff = 100 - percentSum;
    const sorted = Object.entries(ohaengPercent).sort(([, a], [, b]) => b - a);
    ohaengPercent[sorted[0][0] as Ohaeng] += diff;
  }
  (Object.keys(ohaengPercent) as Ohaeng[]).forEach((key) => {
    if (ohaengPercent[key] < 0) ohaengPercent[key] = 0;
  });

  const dominantOhaeng = Object.entries(ohaengPercent)
    .sort(([, a], [, b]) => b - a)[0][0] as Ohaeng;

  // 기존 기본 분석
  const fiveElementsCount = calculateFiveElementsCount([pillars.year, pillars.month, pillars.day, pillars.hour]);
  const balanceSummary = analyzeBalance(fiveElementsCount);

  // 심화 분석
  const hiddenStems = {
    year: getHiddenStems(pillars.year.branch),
    month: getHiddenStems(pillars.month.branch),
    day: getHiddenStems(pillars.day.branch),
    hour: getHiddenStems(pillars.hour.branch),
  };

  const enrichedFiveElements = calculateEnrichedFiveElements(pillars);
  const tenGodChart = calculateTenGodsForChart(pillars.day.stem, pillars);
  const dayMasterStrength = determineDayMasterStrength(pillars.day.stem, pillars, enrichedFiveElements);
  const favorableElement = determineFavorableElement(dayMasterStrength, pillars.day.stem);
  const branchInteractions = analyzeBranchInteractions(pillars);
  const ohaengBehaviors = analyzeOhaengBehaviors(balanceSummary);
  const repeatPatterns = generateRepeatPatterns(dayMasterStrength, tenGodChart, branchInteractions);
  const decadeLuck = calculateDecadeLuck(pillars.year.stem, pillars.month, pillars.day.stem, gender, year);
  const annualAnalysis = analyzeAnnualInteractions(pillars.day.stem, pillars);
  const structureSummary = buildStructureSummary(tenGodChart, dayMasterStrength, ohaengBehaviors, branchInteractions, repeatPatterns);
  const mbtiSajuSynergy = mbti
    ? analyzeMbtiSajuSynergy(mbti, tenGodChart, dayMasterStrength)
    : { synergies: [], risks: [] };

  const threeYearOutlook: YearBrief[] = [2026, 2027, 2028].map((y) =>
    analyzeYearBrief(y, pillars.day.stem, pillars)
  );

  const payload: SajuPayload = {
    pillars: { year: pillars.year, month: pillars.month, day: pillars.day, hour: pillars.hour },
    dayMaster: pillars.day.stem,
    fiveElementsCount,
    seasonFactor: {
      monthBranch: pillars.month.branch,
      dominantElement: dominantOhaeng,
      notes: SEASON_NOTES[pillars.month.branch] || '계절 정보',
    },
    balanceSummary,
    yearContext: { year: 2026, annualPillar: ANNUAL_YEAR_2026, annualElementTheme: ['火'] },
    hiddenStems,
    enrichedFiveElements,
    tenGodChart,
    dayMasterStrength,
    favorableElement,
    branchInteractions,
    decadeLuck,
    annualAnalysis,
    ohaengBehaviors,
    repeatPatterns,
    structureSummary,
    mbtiSajuSynergy,
    threeYearOutlook,
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
