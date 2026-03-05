'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSaju } from '@/lib/saju';
import { isValidMbti } from '@/lib/mbti';
import { createCharacterId } from '@/lib/catMapper';
import OhaengBar from '@/components/OhaengBar';
import AdSlot from '@/components/AdSlot';
import ShareModal from '@/components/ShareModal';
import { Character, MbtiType, SajuResult } from '@/types';

type FreeSectionKey =
  | 'diagnosis'
  | 'ohaengMap'
  | 'combination'
  | 'pattern'
  | 'timingSense';

const FREE_SECTION_CONFIG: ReadonlyArray<{
  key: FreeSectionKey;
  title: string;
  icon: string;
}> = [
  { key: 'diagnosis', title: '🐾 냥세 한 줄 진단', icon: 'pets' },
  { key: 'ohaengMap', title: '🧭 오행 밸런스 지도', icon: 'flare' },
  { key: 'combination', title: '🧩 사주×MBTI 결합 해석', icon: 'psychology_alt' },
  { key: 'pattern', title: '🔄 반복 패턴 분석', icon: 'autorenew' },
  { key: 'timingSense', title: '🚨 과부하 신호 가이드', icon: 'warning' },
];

interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number | 'unknown';
  gender?: 'male' | 'female' | 'unknown';
}

function parseBirthInfo(raw: string): BirthInfo | null {
  try {
    const parsed = JSON.parse(raw) as {
      year?: string;
      month?: string;
      day?: string;
      hour?: string;
      gender?: string;
    };

    const year = Number(parsed.year);
    const month = Number(parsed.month);
    const day = Number(parsed.day);
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      return null;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const gender = parsed.gender as 'male' | 'female' | 'unknown' | undefined;

    if (parsed.hour === 'unknown') {
      return { year, month, day, hour: 'unknown', gender };
    }

    const hour = Number(parsed.hour);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return null;
    }

    return { year, month, day, hour, gender };
  } catch {
    return null;
  }
}

async function fetchCharacter(characterId: string): Promise<Character> {
  const response = await fetch(
    `/api/character-content?id=${encodeURIComponent(characterId)}`
  );
  if (!response.ok) {
    throw new Error('character_not_found');
  }
  return (await response.json()) as Character;
}

export default function ResultPage() {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadResult = async () => {
      const storedMbtiRaw = sessionStorage.getItem('mbti');
      const birthRaw = sessionStorage.getItem('birthInfo');

      if (!storedMbtiRaw || !isValidMbti(storedMbtiRaw) || !birthRaw) {
        if (cancelled) return;
        setError('필요한 정보가 없어 처음 화면으로 돌아가야 해요.');
        setLoading(false);
        return;
      }

      const birth = parseBirthInfo(birthRaw);
      if (!birth) {
        if (cancelled) return;
        setError('생년월일 정보가 올바르지 않아요. 다시 입력해주세요.');
        setLoading(false);
        return;
      }

      try {
        const hourValue = birth.hour === 'unknown' ? 12 : birth.hour;
        const genderValue = birth.gender === 'male' || birth.gender === 'female' ? birth.gender : undefined;
        const sajuResult = calculateSaju(
          birth.year,
          birth.month,
          birth.day,
          hourValue,
          genderValue,
          storedMbtiRaw,
        );
        const characterId = createCharacterId(
          storedMbtiRaw,
          sajuResult.dominantOhaeng
        );
        const characterData = await fetchCharacter(characterId);

        if (cancelled) return;

        sessionStorage.setItem('characterId', characterData.id);
        sessionStorage.setItem('catId', characterData.id);
        sessionStorage.setItem('sajuData', JSON.stringify(sajuResult));

        setCharacter(characterData);
        setSaju(sajuResult);
        setMbti(storedMbtiRaw);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError('캐릭터 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
        setLoading(false);
      }
    };

    void loadResult();

    return () => {
      cancelled = true;
    };
  }, []);

  const [savedCount, setSavedCount] = useState(0);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nyangsae_saved_reports') ?? localStorage.getItem('nyangsae_saved_report');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setSavedCount(Array.isArray(parsed) ? parsed.length : 1);
    } catch { /* ignore */ }
  }, []);

  const handleUnlock = () => {
    router.push('/payment');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔮</div>
          <p className="text-slate-500">냥세를 계산하는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !character || !saju || !mbti) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">🙀</div>
        <p className="text-slate-600 mb-6">{error || '결과를 찾을 수 없어요.'}</p>
        <button
          onClick={() => router.replace('/test')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
        >
          다시 시도하기
        </button>
      </main>
    );
  }

  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center bg-white/90 backdrop-blur-md p-4 justify-between border-b border-primary/10">
          <button
            onClick={() => router.back()}
            className="text-primary flex size-10 shrink-0 items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            🐾 냥이가 전하는 비밀 리포트
          </h1>
          <button
            onClick={() => setShowShare(true)}
            className="text-primary flex size-10 items-center justify-end"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </header>

        <main className="flex flex-col pb-24">
          {/* Profile Overview */}
          <section className="p-6 flex flex-col items-center gap-4">
            <div className="text-8xl">{character.emoji}</div>
            <div className="text-center">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                ✨ 특별한 냥이의 분석 ✨
              </span>
              <h2 className="text-2xl font-bold mt-2">{character.name}</h2>
              <p className="text-slate-500 mt-1">
                {mbti} · {saju.dominantOhaeng}의 기운
              </p>
            </div>
          </section>

          {/* Summary Quote */}
          <section className="px-6 py-2">
            <p className="text-center text-slate-500 text-sm leading-relaxed">
              &ldquo;{character.tagline}&rdquo;
            </p>
          </section>

          {/* Ohaeng Energy */}
          <section className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">flare</span>
              <h3 className="text-lg font-bold">🧭 나의 오행 에너지</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100">
              <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
              <div className="mt-4 bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-primary">{saju.dominantOhaeng}의 기운</span>이 가장 강합니다.
                  {saju.dominantOhaeng === '木' && ' 성장과 확장의 에너지가 넘치는 해입니다.'}
                  {saju.dominantOhaeng === '火' && ' 열정과 활력이 넘치는 해입니다.'}
                  {saju.dominantOhaeng === '土' && ' 안정과 포용력이 돋보이는 해입니다.'}
                  {saju.dominantOhaeng === '金' && ' 정돈과 완성의 에너지가 강한 해입니다.'}
                  {saju.dominantOhaeng === '水' && ' 유연함과 지혜가 넘치는 해입니다.'}
                </p>
              </div>
            </div>
          </section>

          <AdSlot className="w-full px-6" placeholderHeight={120} />

          {/* Free Sections */}
          {FREE_SECTION_CONFIG.map((config) => (
            <section key={config.key} className="px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">{config.icon}</span>
                <h3 className="text-lg font-bold">{config.title}</h3>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100">
                <p className="text-primary font-bold text-lg mb-2">
                  {character.subtitles[config.key]}
                </p>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {character.sections[config.key]}
                </p>
              </div>
            </section>
          ))}

          <AdSlot className="w-full px-6" placeholderHeight={100} />

          {/* Retry */}
          <section className="px-6 py-4">
            <button
              onClick={() => {
                sessionStorage.removeItem('mbti');
                sessionStorage.removeItem('birthInfo');
                sessionStorage.removeItem('characterId');
                sessionStorage.removeItem('catId');
                sessionStorage.removeItem('sajuData');
                router.push('/test');
              }}
              className="w-full p-3 border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:border-primary/30 hover:text-primary transition-colors"
            >
              다시 테스트하기 🔄
            </button>
          </section>

          <AdSlot className="w-full px-6" placeholderHeight={140} />
        </main>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 backdrop-blur-md flex flex-col gap-2 border-t border-primary/10 z-50">
        {savedCount > 0 && (
          <button
            onClick={() => router.push('/report')}
            className="w-full p-3 bg-blue-50 text-blue-600 rounded-xl font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            💾 저장된 풀리포트 보기{savedCount > 1 ? ` (${savedCount}개)` : ''}
          </button>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center justify-center gap-2 bg-secondary text-primary h-14 px-5 rounded-2xl font-bold transition-all hover:bg-primary/20"
          >
            <span className="material-symbols-outlined">share</span>
            공유
          </button>
          <button
            onClick={handleUnlock}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white h-14 rounded-2xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">lock_open</span>
            1,900원으로 풀리포트 보기
          </button>
        </div>
      </div>

      {showShare && (
        <ShareModal
          character={character}
          saju={saju}
          mbti={mbti}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
