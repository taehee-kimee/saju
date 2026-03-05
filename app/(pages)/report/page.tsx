'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OhaengBar from '@/components/OhaengBar';
import { isValidMbti } from '@/lib/mbti';
import { normalizeCharacterId } from '@/lib/catMapper';
import { Character, MbtiType, SajuResult } from '@/types';

type FortuneSection = 'love' | 'money' | 'career' | 'health' | 'relationship';

// null = 아직 로딩 중
type FortuneData = Record<FortuneSection, string | null>;

interface SavedReport {
  id: string;
  character: Character;
  saju: SajuResult;
  mbti: MbtiType;
  fortunes: FortuneData;
  savedAt: string;
  birthYear?: number;
}

const REPORTS_KEY = 'nyangsae_saved_reports';
const LEGACY_KEY = 'nyangsae_saved_report';
const MAX_SAVED = 5;

function listReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) return JSON.parse(raw) as SavedReport[];
    // 구버전 단일 저장 마이그레이션
    const oldRaw = localStorage.getItem(LEGACY_KEY);
    if (oldRaw) {
      const old = JSON.parse(oldRaw) as SavedReport & { id?: string };
      const migrated: SavedReport[] = [{ ...old, id: old.id ?? old.savedAt }];
      localStorage.setItem(REPORTS_KEY, JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
  } catch { /* ignore */ }
  return [];
}

function saveReport(data: Omit<SavedReport, 'id'>): SavedReport {
  try {
    const reports = listReports();
    const newReport: SavedReport = { ...data, id: data.savedAt };
    const updated = [newReport, ...reports].slice(0, MAX_SAVED);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    return newReport;
  } catch {
    return { ...data, id: data.savedAt };
  }
}

type FreeSectionKey =
  | 'diagnosis'
  | 'ohaengMap'
  | 'combination'
  | 'pattern'
  | 'timingSense';

const FREE_SECTION_CONFIG: ReadonlyArray<{
  key: FreeSectionKey;
  title: string;
}> = [
  { key: 'diagnosis', title: '🐾 냥세 진단' },
  { key: 'ohaengMap', title: '🧭 오행 밸런스 지도' },
  { key: 'combination', title: '🧩 사주×MBTI 결합 해석' },
  { key: 'pattern', title: '🔄 반복 패턴 분석' },
  { key: 'timingSense', title: '🚨 과부하 신호 가이드' },
];

const PAID_SECTION_CONFIG: ReadonlyArray<{
  key: keyof FortuneData;
  title: string;
  shortTitle: string;
  emoji: string;
}> = [
  { key: 'love', title: '💞 연애 운세', shortTitle: '연애', emoji: '💞' },
  { key: 'money', title: '💰 재물 운세', shortTitle: '재물', emoji: '💰' },
  { key: 'career', title: '🧑‍💻 커리어 운세', shortTitle: '커리어', emoji: '🧑‍💻' },
  { key: 'health', title: '🧘‍♀️ 건강 운세', shortTitle: '건강', emoji: '🧘‍♀️' },
  { key: 'relationship', title: '🤝 인간관계 운세', shortTitle: '관계', emoji: '🤝' },
];

const OHAENG_STRATEGY = {
  '木': {
    env: { color: '초록·갈색·나무 소재', space: '창가·식물이 있는 공간', time: '이른 아침 (5–9시)' },
    actions: ['새 프로젝트·계획을 직접 시작하기', '성장 목표를 세우고 기록하기', '산책·자연과 접촉하는 시간', '아이디어를 즉시 행동으로 옮기기'],
    positiveRelation: '함께 성장할 수 있고 도전을 즐기는 사람',
    avoidRelation: '현상 유지에 머물며 새 시도를 막는 에너지',
  },
  '火': {
    env: { color: '빨강·주황·밝은 노랑', space: '밝고 활기찬 공간·남향', time: '정오 전후 (10–14시)' },
    actions: ['규칙적인 유산소 운동', '발표·발언·표현 활동 늘리기', '햇빛 아래 야외 활동', '준비 후 즉각 실행하는 패턴 반복'],
    positiveRelation: '활동적이고 표현력이 강한 사람·실행을 자극하는 관계',
    avoidRelation: '지나치게 통제적이거나 억압적인 에너지',
  },
  '土': {
    env: { color: '황토·베이지·노랑', space: '정돈되고 안정적인 공간', time: '늦은 오후 (15–18시)' },
    actions: ['일상 루틴 만들고 지키기', '공간 정리정돈', '음식·요리로 몸 챙기기', '한 가지씩 차근차근 마무리'],
    positiveRelation: '신뢰할 수 있고 꾸준함이 있는 사람',
    avoidRelation: '변화가 지나치게 잦거나 중심이 흔들리는 에너지',
  },
  '金': {
    env: { color: '흰색·실버·회색', space: '깔끔하게 정리된 공간', time: '오후 (13–17시)' },
    actions: ['완성된 결과물 만들기', '전문성·자격증 쌓기', '계획을 구조화·체계화하기', '불필요한 것 정리하고 버리기'],
    positiveRelation: '체계적이고 완성도를 중시하는 사람',
    avoidRelation: '산만하고 마무리가 없는 에너지',
  },
  '水': {
    env: { color: '검정·진청·네이비', space: '조용하고 아늑한 공간', time: '밤·새벽 (21–3시)' },
    actions: ['독서·학습·사색의 시간 확보', '글쓰기·일기 쓰기', '명상·마음챙김 훈련', '유연성 훈련·요가·스트레칭'],
    positiveRelation: '지적 자극을 주고 깊은 대화가 가능한 사람',
    avoidRelation: '감정적으로 과열되거나 충동적인 에너지',
  },
} as const satisfies Record<string, { env: { color: string; space: string; time: string }; actions: string[]; positiveRelation: string; avoidRelation: string }>;

async function fetchCharacter(characterId: string): Promise<Character> {
  const response = await fetch(
    `/api/character-content?id=${encodeURIComponent(characterId)}`
  );
  if (!response.ok) {
    throw new Error('character_not_found');
  }
  return (await response.json()) as Character;
}

async function verifyPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<boolean> {
  const response = await fetch('/api/confirm-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { success?: boolean };
  return payload.success === true;
}

const FORTUNE_SECTIONS: FortuneSection[] = ['love', 'money', 'career', 'health', 'relationship'];

async function fetchOneSection(
  section: FortuneSection,
  character: Character,
  saju: SajuResult,
  mbti: MbtiType,
): Promise<string> {
  const response = await fetch('/api/generate-fortune', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      saju,
      payload: saju.payload,
      mbti,
      ohaeng: saju.dominantOhaeng,
      catName: character.name,
      catTagline: character.tagline,
      section,
    }),
  });
  if (!response.ok) throw new Error(`section_failed:${section}`);
  const data = (await response.json()) as Record<string, string>;
  if (!data[section]) throw new Error(`missing_field:${section}`);
  return data[section];
}

function getFallbackFortunes(character: Character): FortuneData {
  return {
    love: character.sections.love,
    money: character.sections.money,
    career: character.sections.career,
    health: character.sections.health,
    relationship: character.sections.relationship,
  };
}

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [character, setCharacter] = useState<Character | null>(null);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [fortunes, setFortunes] = useState<FortuneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingFortunes, setGeneratingFortunes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFortuneTab, setActiveFortuneTab] = useState<keyof FortuneData>('love');
  const [saved, setSaved] = useState(false);
  const [allReports, setAllReports] = useState<SavedReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [freeCollapsed, setFreeCollapsed] = useState(true);
  const [birthYear, setBirthYear] = useState<number | null>(null);

  const paymentSuccess = searchParams.get('payment') === 'success';
  const nicepayPayment = searchParams.get('payment') === 'nicepay';
  const debugMode =
    searchParams.get('debug') === 'true' ||
    process.env.NEXT_PUBLIC_REPORT_DEBUG === 'true';
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amountParam = searchParams.get('amount');

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      // 저장된 리포트가 있으면 바로 복원 (세션 만료 후 재방문 시)
      const reports = listReports();
      if (!paymentSuccess && !nicepayPayment && !debugMode) {
        if (reports.length > 0) {
          const latest = reports[0];
          setAllReports(reports);
          setActiveReportId(latest.id);
          setCharacter(latest.character);
          setSaju(latest.saju);
          setMbti(latest.mbti);
          setFortunes(latest.fortunes);
          if (latest.birthYear) setBirthYear(latest.birthYear);
          setSaved(true);
          setLoading(false);
          return;
        }
        router.replace('/result');
        return;
      }

      const rawCharacterId =
        sessionStorage.getItem('characterId') ?? sessionStorage.getItem('catId');
      const rawSaju = sessionStorage.getItem('sajuData');
      const rawMbti = sessionStorage.getItem('mbti');
      const characterId = rawCharacterId
        ? normalizeCharacterId(rawCharacterId)
        : null;

      // birthYear 읽기 (sessionStorage)
      let sessionBirthYear: number | null = null;
      try {
        const rawBirth = sessionStorage.getItem('birthInfo');
        if (rawBirth) {
          const parsed = JSON.parse(rawBirth) as { year?: string };
          const y = Number(parsed.year);
          if (Number.isFinite(y) && y > 1900) sessionBirthYear = y;
        }
      } catch { /* ignore */ }

      if (!characterId || !rawSaju || !rawMbti || !isValidMbti(rawMbti)) {
        if (reports.length > 0) {
          const latest = reports[0];
          setAllReports(reports);
          setActiveReportId(latest.id);
          setCharacter(latest.character);
          setSaju(latest.saju);
          setMbti(latest.mbti);
          setFortunes(latest.fortunes);
          if (latest.birthYear) setBirthYear(latest.birthYear);
          setSaved(true);
          setLoading(false);
          return;
        }
        router.replace('/result');
        return;
      }

      let parsedSaju: SajuResult;
      try {
        parsedSaju = JSON.parse(rawSaju) as SajuResult;
      } catch {
        router.replace('/result');
        return;
      }

      try {
        const characterData = await fetchCharacter(characterId);

        if (nicepayPayment && !debugMode) {
          const verified = sessionStorage.getItem('nicepayVerified') === 'true';
          sessionStorage.removeItem('nicepayVerified');
          if (!verified) {
            if (cancelled) return;
            router.replace('/payment/fail');
            return;
          }
        }

        if (paymentSuccess && !debugMode) {
          const parsedAmount = Number(amountParam);
          if (!paymentKey || !orderId || !Number.isFinite(parsedAmount)) {
            if (cancelled) return;
            setError('결제 검증 정보가 누락되었어요. 다시 결제를 진행해 주세요.');
            setLoading(false);
            return;
          }

          const verified = await verifyPayment(paymentKey, orderId, parsedAmount);
          if (!verified) {
            router.replace('/payment?payment=fail');
            return;
          }
        }

        if (cancelled) return;

        // 초기 상태: 모든 섹션 null (로딩 중)
        const emptyFortunes: FortuneData = { love: null, money: null, career: null, health: null, relationship: null };
        setCharacter(characterData);
        setSaju(parsedSaju);
        setMbti(rawMbti);
        setFortunes(emptyFortunes);
        setGeneratingFortunes(true);
        setLoading(false);

        // 5개 섹션 병렬 호출 — 완료된 것부터 실시간 반영
        const fallback = getFallbackFortunes(characterData);
        let accumulated: FortuneData = { ...emptyFortunes };

        await Promise.allSettled(
          FORTUNE_SECTIONS.map(async (section) => {
            try {
              const text = await fetchOneSection(section, characterData, parsedSaju, rawMbti);
              if (cancelled) return;
              accumulated = { ...accumulated, [section]: text };
              setFortunes({ ...accumulated });
            } catch {
              if (cancelled) return;
              accumulated = { ...accumulated, [section]: fallback[section] };
              setFortunes({ ...accumulated });
            }
          })
        );

        if (cancelled) return;

        setGeneratingFortunes(false);

        // 자동 저장 (모든 섹션 완료 후)
        const finalFortunes = accumulated;
        const newReport = saveReport({
          character: characterData,
          saju: parsedSaju,
          mbti: rawMbti,
          fortunes: finalFortunes,
          savedAt: new Date().toISOString(),
          birthYear: sessionBirthYear ?? undefined,
        });
        const updatedReports = listReports();
        setAllReports(updatedReports);
        setActiveReportId(newReport.id);
        if (sessionBirthYear) setBirthYear(sessionBirthYear);
        setSaved(true);
      } catch {
        if (cancelled) return;
        setGeneratingFortunes(false);
        setError('리포트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
        setLoading(false);
      }
    };

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [
    amountParam,
    debugMode,
    orderId,
    paymentKey,
    paymentSuccess,
    router,
  ]);

  if (loading || generatingFortunes) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 animate-bounce">🔮</div>
          <p className="text-gray-500 mb-2">
            {generatingFortunes
              ? 'AI가 2026년 운세를 분석 중입니다...'
              : '리포트를 불러오는 중...'}
          </p>
          {generatingFortunes && (
            <p className="text-sm text-gray-400">
              사주 × MBTI × 오행을 결합하여
              <br />
              맞춤형 운세를 생성하고 있습니다
            </p>
          )}
        </div>
      </main>
    );
  }

  if (error || !character || !saju || !fortunes || !mbti) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">🙀</div>
        <p className="text-gray-600 mb-6">{error || '리포트를 찾을 수 없습니다.'}</p>
        <button
          onClick={() => router.replace('/result')}
          className="px-6 py-3 bg-orange-400 text-white rounded-xl font-bold"
        >
          결과 페이지로 이동
        </button>
      </main>
    );
  }

  const p = saju.payload;

  // 리포트 전환 핸들러
  const switchReport = (report: SavedReport) => {
    setCharacter(report.character);
    setSaju(report.saju);
    setMbti(report.mbti as MbtiType);
    setFortunes(report.fortunes);
    setBirthYear(report.birthYear ?? null);
    setActiveReportId(report.id);
    setActiveFortuneTab('love');
  };

  return (
    <main className="min-h-screen p-6 pb-32 max-w-md mx-auto">
      {/* ── 저장된 리포트 선택기 (2개 이상일 때) ── */}
      {allReports.length > 1 && (
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-2">저장된 풀리포트 ({allReports.length}개)</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {allReports.map((r) => {
              const isActive = r.id === activeReportId;
              const date = new Date(r.savedAt);
              const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
              return (
                <button
                  key={r.id}
                  onClick={() => switchReport(r)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <span className="text-2xl">{r.character.emoji}</span>
                  <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                    {r.character.name}
                  </span>
                  <span className="text-[10px] text-gray-400">{dateStr}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 헤더 ── */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{character.emoji}</div>
        <h1 className="text-3xl font-bold">{character.name}</h1>
        <p className="text-orange-500 font-medium mt-1">
          &ldquo;{character.tagline}&rdquo;
        </p>
        {debugMode ? (
          <div className="mt-3 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <span>🐛</span><span>디버그 모드</span>
          </div>
        ) : (
          <div className="mt-3 flex justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              <span>✓</span><span>AI 풀리포트</span>
            </div>
            {saved && (
              <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                <span>💾</span><span>저장됨</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 오행 바 + MBTI ── */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-gray-700">나의 오행 에너지</h3>
        <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
        <div className="mt-3 p-3 bg-white rounded-xl border border-orange-100 flex items-center gap-3">
          <span className="text-2xl font-bold text-orange-600">{mbti}</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">
            {mbti.startsWith('I') ? '내향' : '외향'} ·
            {mbti.includes('N') ? ' 직관' : ' 감각'} ·
            {mbti.includes('T') ? ' 사고' : ' 감정'} ·
            {mbti.endsWith('J') ? ' 판단' : ' 인식'}
          </span>
        </div>
      </div>

      {/* ── 무료 리포트 (접기/펼치기) ── */}
      <div className="mb-6 border border-orange-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setFreeCollapsed(!freeCollapsed)}
          className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
        >
          <span className="font-bold text-orange-600">🐾 냥세 진단 리포트</span>
          <span className="text-orange-400 text-lg">{freeCollapsed ? '▼' : '▲'}</span>
        </button>
        {!freeCollapsed && (
          <div className="p-4 space-y-5 bg-white">
            {FREE_SECTION_CONFIG.map((section) => (
              <div key={section.key}>
                <p className="font-bold text-orange-500 mb-1 text-sm">{section.title}</p>
                <p className="text-orange-700 font-medium text-sm mb-1">{character.subtitles[section.key]}</p>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {character.sections[section.key]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════ 풀리포트 영역 ══════ */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
        <span className="text-xs text-orange-400 font-bold tracking-widest whitespace-nowrap px-2">✦ 풀리포트 ✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
      </div>

      {/* 목차 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {[
          { id: 'sec-tengod',    emoji: '🧬', label: '에너지' },
          { id: 'sec-strength',  emoji: '⚖️', label: '강약' },
          { id: 'sec-clash',     emoji: '💥', label: '충돌' },
          { id: 'sec-decade',    emoji: '🌊', label: '대운' },
          { id: 'sec-pattern',   emoji: '🔁', label: '패턴' },
          { id: 'sec-fortune',   emoji: '🔮', label: '운세' },
          { id: 'sec-strategy',  emoji: '✦',  label: '전략' },
          { id: 'sec-outlook',   emoji: '⏳', label: '3년' },
        ].map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl transition-all"
          >
            <span className="text-base">{emoji}</span>
            <span className="text-[10px] text-gray-500 font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* ── 십신 분석 ── */}
      {p?.tenGodChart && (
        <section id="sec-tengod" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">01</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">🧬 내 에너지, 어디로 흐르고 있냥?</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">십신(十神) 분석</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3 pl-10">십신은 사주 안에서 나(일간)와 다른 기운의 관계를 5가지로 분류한 것이에요. 어떤 기운이 많은지에 따라 타고난 성향이 달라진답니다냥.</p>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border-t-4 border-blue-300">
            <div className="grid grid-cols-5 gap-1.5">
              {([
                { g: '비겁', desc: '자아·경쟁' },
                { g: '식상', desc: '표현·창의' },
                { g: '재성', desc: '재물·현실' },
                { g: '관성', desc: '규율·사회' },
                { g: '인성', desc: '학습·사고' },
              ] as const).map(({ g, desc }) => (
                <div key={g} className="flex flex-col items-center bg-white rounded-xl px-1 py-2 border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">{g}</span>
                  <span className="text-xl font-bold text-slate-800 my-0.5">{p.tenGodChart.groupSummary[g]}</span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">{desc}</span>
                </div>
              ))}
            </div>
            {p.tenGodChart.dominantGroups.length > 0 && (
              <div className="space-y-2">
                {p.tenGodChart.dominantGroups.map((d) => (
                  <div key={d.group} className="bg-orange-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-600 font-bold text-sm">{d.group} 우세</span>
                      <span className="text-xs text-gray-400">
                        {d.group === '비겁' && '→ 나와 같은 기운이 강함'}
                        {d.group === '식상' && '→ 표현·창작 에너지가 강함'}
                        {d.group === '재성' && '→ 재물·현실 지향 에너지가 강함'}
                        {d.group === '관성' && '→ 외부 기준·규율 에너지가 강함'}
                        {d.group === '인성' && '→ 사고·학습 에너지가 강함'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{d.behavior}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 신강/신약 + 용신 ── */}
      {p?.dayMasterStrength && p?.favorableElement && (
        <section id="sec-strength" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center">02</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">⚖️ 나 강한 냥이야, 약한 냥이야?</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">신강/신약 · 용신(用神) 분석</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3 pl-10">내 일간(日干, 태어난 날의 기운)이 사주 전체에서 얼마나 힘을 갖고 있는지를 나타내요. 강하면 에너지가 넘치고, 약하면 주변 환경에 더 영향을 받는 타입이랍니다냥.</p>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border-t-4 border-green-300">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${p.dayMasterStrength.isStrong ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {p.dayMasterStrength.isStrong ? '🔥 신강 (에너지 충만형)' : '💧 신약 (환경 감응형)'}
              </span>
              <span className="text-xs text-gray-400">강도 점수 {p.dayMasterStrength.score}/10</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{p.dayMasterStrength.analysis}</p>
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <p className="text-xs text-gray-400">용신 — 내 사주를 균형 잡아주는 오행</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 rounded-xl p-2 text-center border border-green-200">
                  <div className="text-xs text-green-500 mb-0.5">용신 (내 편)</div>
                  <div className="text-lg font-bold text-green-700">{p.favorableElement.yongsin}</div>
                  <div className="text-[10px] text-green-500">힘을 주는 기운</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-2 text-center border border-yellow-200">
                  <div className="text-xs text-yellow-600 mb-0.5">희신 (조력자)</div>
                  <div className="text-lg font-bold text-yellow-700">{p.favorableElement.secondary}</div>
                  <div className="text-[10px] text-yellow-600">보조 역할</div>
                </div>
                <div className="bg-red-50 rounded-xl p-2 text-center border border-red-200">
                  <div className="text-xs text-red-400 mb-0.5">기신 (부담)</div>
                  <div className="text-lg font-bold text-red-600">{p.favorableElement.unfavorable}</div>
                  <div className="text-[10px] text-red-400">소모하는 기운</div>
                </div>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{p.favorableElement.reasoning}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 합충형 ── */}
      {p?.branchInteractions && p.branchInteractions.interactions.length > 0 && (
        <section id="sec-clash" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center">03</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">💥 기운끼리 부딪히진 않냥?</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">합충형(合冲刑) 분석</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3 pl-10">사주 팔자 안의 지지(地支, 땅의 기운)들이 서로 어떤 관계를 맺는지 분석한 것이에요. 합(合)은 기운이 뭉치는 것, 충(衝)은 충돌, 형(刑)은 마찰이랍니다냥.</p>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border-t-4 border-red-300">
            {p.branchInteractions.interactions.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    item.type === '충' ? 'bg-red-100 text-red-600' :
                    item.type === '형' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>{item.type}</span>
                  <span className="text-xs text-gray-400">
                    {item.type === '충' && '정반대 기운이 충돌 → 변화·갈등'}
                    {item.type === '형' && '기운 마찰 → 주의가 필요한 영역'}
                    {item.type === '삼합' && '세 기운이 합쳐져 시너지 생성'}
                    {item.type === '육합' && '두 기운이 결합 → 새 기운 탄생'}
                    {item.type === '천간합' && '천간 기운끼리 결합'}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
            {!p.branchInteractions.hasClash && !p.branchInteractions.hasPunishment && (
              <p className="text-gray-400 text-sm">✓ 큰 충돌 없이 기운이 잘 흐르고 있냥!</p>
            )}
          </div>
        </section>
      )}

      {/* ── 대운 전환 포인트 ── */}
      {p?.decadeLuck && p.decadeLuck.length > 0 && (() => {
        const currentAge = birthYear ? 2026 - birthYear : null;
        const currentIdx = currentAge !== null
          ? p.decadeLuck.findIndex(d => currentAge >= d.startAge && currentAge <= d.endAge)
          : -1;
        const curr = currentIdx >= 0 ? p.decadeLuck[currentIdx] : p.decadeLuck[0];
        const next = currentIdx >= 0 && currentIdx + 1 < p.decadeLuck.length
          ? p.decadeLuck[currentIdx + 1]
          : p.decadeLuck[1];
        const remainingYears = curr && currentAge !== null ? curr.endAge - currentAge : null;
        const isLateHalf = remainingYears !== null && remainingYears <= 5;

        return (
          <section id="sec-decade" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">04</span>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">🌊 나는 지금 어느 흐름 위에 있냥?</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">대운(大運) 전환 포인트</p>
              </div>
            </div>
          <p className="text-xs text-gray-400 mb-3 pl-10">대운(大運)은 10년 단위로 바뀌는 큰 인생 흐름이에요. 사주팔자가 타고난 성격이라면, 대운은 그 성격이 어떤 환경 안에 놓이는지를 보여준답니다냥.</p>
            <div className="space-y-3">
              {/* 현재 대운 */}
              {curr && (
                <div className="bg-slate-50 rounded-2xl p-4 border-l-4 border-slate-400">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-700">{curr.stem}{curr.branch}</span>
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{curr.tenGod} 대운</span>
                    </div>
                    <span className="text-xs text-gray-400">{curr.startAge}~{curr.endAge}세</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{curr.theme}</p>
                  {remainingYears !== null && (
                    <div className={`text-xs px-3 py-1.5 rounded-full inline-block font-medium ${isLateHalf ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {isLateHalf
                        ? `⏳ 이 시절 후반부 — 약 ${remainingYears}년 후 전환`
                        : `✦ 현재 진행 중 — 약 ${remainingYears}년 더 지속`}
                    </div>
                  )}
                </div>
              )}

              {/* 전환 화살표 */}
              {next && (
                <>
                  <div className="flex items-center gap-2 px-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-violet-300" />
                    <span className="text-xs text-violet-500 font-bold whitespace-nowrap">⬇ 성향 전환 예고</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-slate-300 to-violet-300" />
                  </div>

                  {/* 다음 대운 */}
                  <div className="bg-violet-50 rounded-2xl p-4 border-l-4 border-violet-400">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-violet-700">{next.stem}{next.branch}</span>
                        <span className="text-xs bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full">{next.tenGod} 대운</span>
                      </div>
                      <span className="text-xs text-gray-400">{next.startAge}~{next.endAge}세</span>
                    </div>
                    <p className="text-sm text-violet-800 leading-relaxed mb-2">{next.theme}</p>
                    {curr && (
                      <div className="bg-white rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-700">성향 변화 포인트 ✦</span><br />
                        지금의 <span className="text-slate-600 font-bold">{curr.tenGod}</span> 에너지 중심에서,
                        <span className="text-violet-600 font-bold"> {next.tenGod}</span> 에너지 중심으로 삶의 무게중심이 이동할 거냥.
                        {curr.tenGod !== next.tenGod && (
                          <> 지금과는 다른 새로운 방식으로 세상과 마주하게 되는 시기예요.</>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── 반복 패턴 ── */}
      {p?.repeatPatterns && p.repeatPatterns.length > 0 && (
        <section id="sec-pattern" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center">05</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">🔁 왜 나는 항상 같은 패턴일까냥?</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">반복 패턴 원인 분석</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3 pl-10">사주 구조에서 자동으로 반복되는 삶의 패턴이에요. 이게 보이면 루프를 끊을 수 있답니다냥!</p>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border-t-4 border-amber-300">
            {p.repeatPatterns.map((rp, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-slate-200">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg shrink-0">🔄</span>
                  <p className="text-gray-800 font-medium text-sm leading-snug">&ldquo;{rp.pattern}&rdquo;</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed pl-7">
                  사주 원인: {rp.condition}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 2026 운세 탭 ── */}
      {fortunes && (
        <section id="sec-fortune" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">06</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">🔮 2026년엔 어떨까냥?</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">연애 · 재물 · 커리어 · 건강 · 인간관계</p>
            </div>
          </div>
          <div className="flex gap-1 mb-4">
            {PAID_SECTION_CONFIG.map((section) => {
              const isReady = fortunes[section.key] !== null;
              const isActive = activeFortuneTab === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveFortuneTab(section.key)}
                  className={`flex-1 min-w-0 py-2.5 px-1 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-400'
                  }`}
                >
                  <div className="text-base">{section.emoji}</div>
                  <div className="text-xs mt-0.5">{section.shortTitle}</div>
                  {!isReady && (
                    <div className={`mt-1 w-3 h-3 mx-auto rounded-full border-2 border-t-transparent animate-spin ${isActive ? 'border-white' : 'border-gray-400'}`} />
                  )}
                  {isReady && !isActive && (
                    <div className="mt-1 text-[10px] text-orange-400">✓</div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="bg-orange-50 rounded-2xl p-5">
            <h3 className="text-orange-600 font-bold text-lg mb-4">
              {PAID_SECTION_CONFIG.find(s => s.key === activeFortuneTab)?.title}
            </h3>
            {fortunes[activeFortuneTab] === null ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-400 animate-spin mb-3" />
                <p className="text-sm">운세를 불러오는 중이냥...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(fortunes[activeFortuneTab] as string)
                  .split(/\n{2,}/)
                  .flatMap((block) => block.trim() ? [block.trim()] : [])
                  .map((para, i) => (
                    <p key={i} className="text-gray-700 text-[15px] leading-[2] whitespace-pre-line">
                      {para}
                    </p>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 개운 전략 ── */}
      {p?.favorableElement && (() => {
        const yongsin = p.favorableElement.yongsin;
        const gisin = p.favorableElement.unfavorable;
        const strategy = OHAENG_STRATEGY[yongsin as keyof typeof OHAENG_STRATEGY];
        if (!strategy) return null;

        const isStrong = p.dayMasterStrength?.isStrong;
        const dominantGroup = p.tenGodChart?.dominantGroups?.[0];
        const excessOhaeng = p.ohaengBehaviors?.find(b => b.type === 'excess');
        const deficitOhaeng = p.ohaengBehaviors?.find(b => b.type === 'deficit');

        return (
          <section id="sec-strategy" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">07</span>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">✦ 당신 사주에 맞는 에너지 균형 전략</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">용신 기반 개운(開運) 전략</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4 pl-10">
              미신이 아닌, 용신·십신·오행 불균형 데이터를 바탕으로 도출한 에너지 방향 보완 전략이에요.
            </p>

            {/* 근거 블록 */}
            <div className="bg-slate-800 text-slate-100 rounded-2xl p-4 mb-4 space-y-2">
              <p className="text-xs text-slate-400 mb-2 font-medium">왜 이 전략이 필요한가</p>
              <div className="space-y-1.5 text-sm">
                {isStrong !== undefined && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">→</span>
                    <span>
                      {isStrong
                        ? '신강(身强) 구조 — 에너지가 넘쳐 분산되기 쉬운 상태예요.'
                        : '신약(身弱) 구조 — 주변 환경과 기운에 영향받기 쉬운 상태예요.'}
                    </span>
                  </div>
                )}
                {excessOhaeng && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">→</span>
                    <span><span className="text-orange-300 font-bold">{excessOhaeng.element}(○) 과다</span> — {excessOhaeng.behavior}</span>
                  </div>
                )}
                {deficitOhaeng && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">→</span>
                    <span><span className="text-blue-300 font-bold">{deficitOhaeng.element}(○) 부족</span> — {deficitOhaeng.behavior}</span>
                  </div>
                )}
                {dominantGroup && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">→</span>
                    <span><span className="text-violet-300 font-bold">{dominantGroup.group} 우세</span> — {dominantGroup.behavior}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 pt-1 border-t border-slate-700 mt-1">
                  <span className="text-green-400 shrink-0">✦</span>
                  <span className="text-green-300">
                    용신 방향인 <span className="font-bold">{yongsin}(○)</span> 에너지를 보완하면 흐름이 자연스러워져요.
                    기신인 <span className="font-bold">{gisin}(○)</span> 방향은 에너지를 소모시킬 수 있으니 조율이 필요합니다.
                  </span>
                </div>
              </div>
            </div>

            {/* 3단계 */}
            <div className="space-y-3">
              {/* 환경 개운 */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="font-bold text-amber-700 mb-2 text-sm">🏠 환경 개운</p>
                <p className="text-xs text-gray-500 mb-3">공간·색·시간대를 바꾸면 에너지 방향이 자연스럽게 조율돼요.</p>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-amber-600 w-12 shrink-0">색상</span>
                    <span className="text-sm text-gray-700">{strategy.env.color}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-amber-600 w-12 shrink-0">공간</span>
                    <span className="text-sm text-gray-700">{strategy.env.space}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-amber-600 w-12 shrink-0">시간대</span>
                    <span className="text-sm text-gray-700">집중 작업에 유리한 {strategy.env.time}</span>
                  </div>
                </div>
              </div>

              {/* 행동 개운 */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="font-bold text-emerald-700 mb-2 text-sm">🎯 행동 개운</p>
                <p className="text-xs text-gray-500 mb-3">루틴에 이 행동을 넣으면 에너지 균형이 잡혀요.</p>
                <div className="space-y-1.5">
                  {strategy.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 text-xs shrink-0 mt-0.5">✓</span>
                      <span className="text-sm text-gray-700">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 관계 개운 */}
              <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                <p className="font-bold text-violet-700 mb-2 text-sm">🤝 관계 개운</p>
                <p className="text-xs text-gray-500 mb-3">어떤 에너지의 사람과 함께하느냐가 운의 방향을 바꿔요.</p>
                <div className="space-y-2">
                  <div className="flex gap-2 items-start">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded shrink-0">시너지</span>
                    <span className="text-sm text-gray-700">{strategy.positiveRelation}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded shrink-0">소모</span>
                    <span className="text-sm text-gray-500">{strategy.avoidRelation}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── 3년 흐름 포지션 ── */}
      {saju.payload.threeYearOutlook && saju.payload.threeYearOutlook.length > 0 && (() => {
        const YEAR_COLOR: Record<number, { bg: string; badge: string; dot: string }> = {
          2026: { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
          2027: { bg: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
          2028: { bg: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
        };
        return (
          <section id="sec-outlook" className="py-10 border-b border-dashed border-gray-100 scroll-mt-4 last-of-type:border-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">08</span>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">⏳ 앞으로 3년 흐름 포지션</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">세운(歲運) 기준 2026 · 2027 · 2028 요약</p>
              </div>
            </div>
            <div className="space-y-3">
              {saju.payload.threeYearOutlook.map((brief) => {
                const colors = YEAR_COLOR[brief.year] ?? { bg: 'bg-gray-50 border-gray-200', badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
                return (
                  <div key={brief.year} className={`rounded-2xl border p-4 ${colors.bg}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {brief.year}년 {brief.pillar}
                      </span>
                      <span className="text-xs text-gray-500">{brief.tenGodGroup} ({brief.tenGod})</span>
                      {brief.hasClash && (
                        <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">⚡충</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{brief.theme}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{brief.outlook}</p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* ── 하단 버튼 ── */}
      <div className="mt-8 space-y-3">
        <button
          onClick={() => {
            if (navigator.share) {
              void navigator.share({
                title: '냥세 풀리포트',
                text: `나는 ${character.name}입니다! 2026년 운세를 확인해보세요 🐱`,
                url: window.location.href,
              });
            } else {
              void navigator.clipboard.writeText(window.location.href);
              alert('링크가 복사되었습니다!');
            }
          }}
          className="w-full p-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          결과 공유하기
        </button>
        <button
          onClick={() => {
            sessionStorage.clear();
            router.push('/test');
          }}
          className="w-full p-3 text-gray-500 text-sm hover:text-orange-500 transition-colors"
        >
          다시 테스트하기
        </button>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🔮</div>
            <p className="text-gray-500">리포트를 불러오는 중...</p>
          </div>
        </main>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
