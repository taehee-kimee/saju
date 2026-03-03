'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSaju } from '@/lib/saju';
import { isValidMbti } from '@/lib/mbti';
import { createCharacterId } from '@/lib/catMapper';
import OhaengBar from '@/components/OhaengBar';
import ShareCard from '@/components/ShareCard';
import AdSlot from '@/components/AdSlot';
import LockedSection from '@/components/LockedSection';
import { Character, MbtiType, SajuResult } from '@/types';

type FreeSectionKey =
  | 'diagnosis'
  | 'ohaengMap'
  | 'combination'
  | 'pattern'
  | 'timingSense';

type PaidSectionKey =
  | 'love'
  | 'money'
  | 'career'
  | 'health'
  | 'relationship';

const FREE_SECTION_CONFIG: ReadonlyArray<{
  key: FreeSectionKey;
  title: string;
}> = [
  { key: 'diagnosis', title: '🐾 냥세 한 줄 진단' },
  { key: 'ohaengMap', title: '🧭 오행 밸런스 지도' },
  { key: 'combination', title: '🧩 사주×MBTI 결합 해석' },
  { key: 'pattern', title: '🔄 반복 패턴 분석' },
  { key: 'timingSense', title: '🚨 과부하 신호 가이드' },
];

const PAID_SECTION_CONFIG: ReadonlyArray<{
  key: PaidSectionKey;
  title: string;
  emoji: string;
  teaser: string;
}> = [
  { key: 'love', title: '💞 연애', emoji: '💞', teaser: '2026년 당신의 연애운은?' },
  { key: 'money', title: '💰 재물', emoji: '💰', teaser: '2026년 당신의 재물운은?' },
  { key: 'career', title: '🧑‍💻 커리어', emoji: '🧑‍💻', teaser: '2026년 당신의 커리어운은?' },
  { key: 'health', title: '🧘‍♀️ 건강', emoji: '🧘‍♀️', teaser: '2026년 당신의 건강운은?' },
  { key: 'relationship', title: '🤝 인간관계', emoji: '🤝', teaser: '2026년 당신의 인간관계운은?' },
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

  const [hasSavedReport, setHasSavedReport] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nyangsae_saved_report');
      if (saved) setHasSavedReport(true);
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
          <p className="text-gray-500">냥세를 계산하는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !character || !saju || !mbti) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">🙀</div>
        <p className="text-gray-600 mb-6">{error || '결과를 찾을 수 없어요.'}</p>
        <button
          onClick={() => router.replace('/test')}
          className="px-6 py-3 bg-orange-400 text-white rounded-xl font-bold"
        >
          다시 시도하기
        </button>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen p-6 pt-12 max-w-md mx-auto space-y-6 pb-32">
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{character.emoji}</div>
          <h1 className="text-3xl font-bold">{character.name}</h1>
          <p className="text-orange-500 font-medium mt-1">
            &ldquo;{character.tagline}&rdquo;
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-700">🧭 나의 오행 에너지</h3>
          <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
          <div className="mt-3 bg-orange-50 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-orange-600">{saju.dominantOhaeng}의 기운</span>이 가장 강합니다. 
              {saju.dominantOhaeng === '木' && ' 성장과 확장의 에너지가 넘치는 해입니다.'}
              {saju.dominantOhaeng === '火' && ' 열정과 활력이 넘치는 해입니다.'}
              {saju.dominantOhaeng === '土' && ' 안정과 포용력이 돋보이는 해입니다.'}
              {saju.dominantOhaeng === '金' && ' 정돈과 완성의 에너지가 강한 해입니다.'}
              {saju.dominantOhaeng === '水' && ' 유연함과 지혜가 넘치는 해입니다.'}
            </p>
          </div>
        </div>

        <AdSlot className="w-full" placeholderHeight={120} />

        {FREE_SECTION_CONFIG.map((config) => (
          <section key={config.key} className="mb-6">
            <h2 className="text-lg font-bold text-orange-500 mb-3">
              {config.title}
            </h2>
            <div className="bg-orange-50 rounded-2xl p-5">
              <p className="text-orange-600 font-bold text-lg mb-2">
                {character.subtitles[config.key]}
              </p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {character.sections[config.key]}
              </p>
            </div>
          </section>
        ))}

        <AdSlot className="w-full" placeholderHeight={100} />

        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 text-center">🔒 풀리포트에서 확인하는 5가지 운세</h3>
          {PAID_SECTION_CONFIG.map((config) => (
            <LockedSection
              key={config.key}
              title={config.title}
              emoji={config.emoji}
              teaserText={config.teaser}
              onUnlock={handleUnlock}
            />
          ))}
        </div>

        <div className="space-y-3 pt-8 border-t border-gray-100">
          <div className="mt-4">
            <ShareCard character={character} saju={saju} mbti={mbti} />
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('mbti');
              sessionStorage.removeItem('birthInfo');
              sessionStorage.removeItem('characterId');
              sessionStorage.removeItem('catId');
              sessionStorage.removeItem('sajuData');
              router.push('/test');
            }}
            className="w-full p-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-orange-300 hover:text-orange-500 transition-colors"
          >
            다시 테스트하기 🔄
          </button>
        </div>

        <AdSlot className="w-full" placeholderHeight={140} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-md mx-auto space-y-2">
          {hasSavedReport && (
            <button
              onClick={() => router.push('/report')}
              className="w-full p-3 bg-blue-50 text-blue-600 rounded-xl font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              💾 저장된 풀리포트 다시 보기
            </button>
          )}
          <button
            onClick={handleUnlock}
            className="w-full p-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            🔓 1,900원으로 풀리포트 보기
          </button>
          <p className="text-center text-gray-400 text-xs mt-2">5개 섹션 추가 · 총 10섹션 완성</p>
        </div>
      </div>
    </>
  );
}
