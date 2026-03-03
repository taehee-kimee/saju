'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
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

      if (!characterId || !rawSaju || !rawMbti || !isValidMbti(rawMbti)) {
        if (savedReport) {
          setCharacter(savedReport.character);
          setSaju(savedReport.saju);
          setMbti(savedReport.mbti);
          setFortunes(savedReport.fortunes);
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
        });

        setCharacter(characterData);
        setSaju(parsedSaju);
        setMbti(rawMbti);
        setFortunes(resolvedFortunes);
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

  return (
    <main className="min-h-screen p-6 pb-32 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{character.emoji}</div>
        <h1 className="text-3xl font-bold">{character.name}</h1>
        <p className="text-orange-500 font-medium mt-1">
          &ldquo;{character.tagline}&rdquo;
        </p>
        {debugMode ? (
          <div className="mt-3 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <span>🐛</span>
            <span>디버그 모드</span>
          </div>
        ) : (
          <div className="mt-3 flex justify-center gap-2">
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              <span>✓</span>
              <span>AI 풀리포트 생성 완료</span>
            </div>
            {saved && (
              <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                <span>💾</span>
                <span>저장됨</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3 text-gray-700">나의 오행 에너지</h3>
        <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
        <div className="mt-4 p-4 bg-white rounded-xl border-2 border-orange-100">
          <div className="text-sm text-gray-500 mb-1">당신의 MBTI</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">{mbti}</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">
              {mbti.startsWith('I') ? '내향' : '외향'} ·
              {mbti.includes('N') ? ' 직관' : ' 감각'} ·
              {mbti.includes('T') ? ' 사고' : ' 감정'} ·
              {mbti.endsWith('J') ? ' 판단' : ' 인식'}
            </span>
          </div>
        </div>
      </div>

      {FREE_SECTION_CONFIG.map((section) => (
        <section key={section.key} className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            {section.title}
          </h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-orange-600 font-bold text-lg mb-2">
              {character.subtitles[section.key]}
            </p>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {character.sections[section.key]}
            </p>
          </div>
        </section>
      ))}

      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3 text-center">🔮 2026년 운세</h2>
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
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
