'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OhaengBar from '@/components/OhaengBar';
import { isValidMbti } from '@/lib/mbti';
import { normalizeCharacterId } from '@/lib/catMapper';
import { Character, MbtiType, SajuResult } from '@/types';

interface FortuneData {
  love: string;
  money: string;
  career: string;
  health: string;
  relationship: string;
}

interface SavedReport {
  character: Character;
  saju: SajuResult;
  mbti: MbtiType;
  fortunes: FortuneData;
  savedAt: string;
  birthYear?: number;
}

const REPORT_STORAGE_KEY = 'nyangsae_saved_report';

function saveReportToStorage(data: SavedReport): void {
  try {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

function loadReportFromStorage(): SavedReport | null {
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedReport;
  } catch {
    return null;
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

async function generateFortunes(
  character: Character,
  saju: SajuResult,
  mbti: MbtiType
): Promise<FortuneData> {
  const response = await fetch('/api/generate-fortune', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      saju,
      payload: saju.payload,
      mbti,
      ohaeng: saju.dominantOhaeng,
      catName: character.name,
      catTagline: character.tagline,
    }),
  });

  if (!response.ok) {
    throw new Error('fortune_generation_failed');
  }

  return (await response.json()) as FortuneData;
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
  const [freeCollapsed, setFreeCollapsed] = useState(true);
  const [birthYear, setBirthYear] = useState<number | null>(null);

  const paymentSuccess = searchParams.get('payment') === 'success';
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
      const savedReport = loadReportFromStorage();
      if (!paymentSuccess && !debugMode) {
        if (savedReport) {
          setCharacter(savedReport.character);
          setSaju(savedReport.saju);
          setMbti(savedReport.mbti);
          setFortunes(savedReport.fortunes);
          if (savedReport.birthYear) setBirthYear(savedReport.birthYear);
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
        if (savedReport) {
          setCharacter(savedReport.character);
          setSaju(savedReport.saju);
          setMbti(savedReport.mbti);
          setFortunes(savedReport.fortunes);
          if (savedReport.birthYear) setBirthYear(savedReport.birthYear);
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

        setGeneratingFortunes(true);
        let resolvedFortunes: FortuneData;
        try {
          resolvedFortunes = await generateFortunes(
            characterData,
            parsedSaju,
            rawMbti
          );
        } catch {
          resolvedFortunes = getFallbackFortunes(characterData);
        }

        if (cancelled) return;

        // 자동 저장 (결제 완료 시)
        saveReportToStorage({
          character: characterData,
          saju: parsedSaju,
          mbti: rawMbti,
          fortunes: resolvedFortunes,
          savedAt: new Date().toISOString(),
          birthYear: sessionBirthYear ?? undefined,
        });

        setCharacter(characterData);
        setSaju(parsedSaju);
        setMbti(rawMbti);
        setFortunes(resolvedFortunes);
        if (sessionBirthYear) setBirthYear(sessionBirthYear);
        setSaved(true);
        setGeneratingFortunes(false);
        setLoading(false);
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

  return (
    <main className="min-h-screen p-6 pb-32 max-w-md mx-auto">
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
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">✦ 풀리포트 ✦</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── 십신 분석 ── */}
      {p?.tenGodChart && (
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">🧬 내 에너지, 어디로 흐르고 있냥?</h2>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              {(['비겁','식상','재성','관성','인성'] as const).map((g) => (
                <div key={g} className="flex flex-col items-center bg-white rounded-xl px-3 py-2 border border-slate-200 min-w-[52px]">
                  <span className="text-xs text-gray-400">{g}</span>
                  <span className="text-lg font-bold text-slate-700">{p.tenGodChart.groupSummary[g]}</span>
                </div>
              ))}
            </div>
            {p.tenGodChart.dominantGroups.length > 0 && (
              <div className="space-y-2">
                {p.tenGodChart.dominantGroups.map((d) => (
                  <div key={d.group} className="bg-orange-50 rounded-xl p-3">
                    <span className="text-orange-600 font-bold text-sm">{d.group} 우세</span>
                    <p className="text-gray-600 text-sm mt-0.5">{d.behavior}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 신강/신약 + 용신 ── */}
      {p?.dayMasterStrength && p?.favorableElement && (
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">⚖️ 나 강한 냥이야, 약한 냥이야?</h2>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${p.dayMasterStrength.isStrong ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {p.dayMasterStrength.isStrong ? '🔥 신강' : '💧 신약'}
              </span>
              <span className="text-sm text-gray-500">강도 점수 {p.dayMasterStrength.score}</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{p.dayMasterStrength.analysis}</p>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs text-gray-400 mb-2">용신 (내 편 오행)</p>
              <div className="flex gap-2">
                <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">용신 {p.favorableElement.yongsin}</span>
                <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">희신 {p.favorableElement.secondary}</span>
                <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full">기신 {p.favorableElement.unfavorable}</span>
              </div>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">{p.favorableElement.reasoning}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 합충형 ── */}
      {p?.branchInteractions && p.branchInteractions.interactions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">💥 기운끼리 부딪히진 않냥?</h2>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
            {p.branchInteractions.interactions.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 mt-0.5 ${
                  item.type === '충' ? 'bg-red-100 text-red-600' :
                  item.type === '형' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>{item.type}</span>
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
          <section className="mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-3">🌊 나는 지금 어느 흐름 위에 있냥?</h2>
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
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">🔁 왜 나는 항상 같은 패턴일까냥?</h2>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            {p.repeatPatterns.map((rp, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-gray-400 mb-1">{rp.condition}</p>
                <p className="text-gray-800 font-medium text-sm">&ldquo;{rp.pattern}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 2026 운세 탭 ── */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">🔮 2026년엔 어떨까냥?</h2>
        <div className="flex gap-1 mb-4">
          {PAID_SECTION_CONFIG.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveFortuneTab(section.key)}
              className={`flex-1 min-w-0 py-2.5 px-1 rounded-xl text-sm font-medium transition-all ${
                activeFortuneTab === section.key
                  ? 'bg-orange-400 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-400'
              }`}
            >
              <div className="text-base">{section.emoji}</div>
              <div className="text-xs mt-0.5">{section.shortTitle}</div>
            </button>
          ))}
        </div>
        <div className="bg-orange-50 rounded-2xl p-5">
          <h3 className="text-orange-600 font-bold text-lg mb-3">
            {PAID_SECTION_CONFIG.find(s => s.key === activeFortuneTab)?.title}
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {fortunes[activeFortuneTab]}
          </p>
        </div>
      </section>

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
