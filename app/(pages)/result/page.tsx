'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSaju } from '@/lib/saju';
import { getMbtiGroup } from '@/lib/mbti';
import { getCatCharacter } from '@/lib/catMapper';
import OhaengBar from '@/components/OhaengBar';
import ShareCard from '@/components/ShareCard';
import AdSlot from '@/components/AdSlot';
import { CatCharacter, MbtiType, SajuResult } from '@/types';

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function ResultPage() {
  const router = useRouter();
  const [cat, setCat] = useState<CatCharacter | null>(null);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth] = useState(() => String(new Date().getMonth() + 1));

  useEffect(() => {
    try {
      const storedMbti = sessionStorage.getItem('mbti') as MbtiType | null;
      const birthRaw = sessionStorage.getItem('birthInfo');

      if (!storedMbti || !birthRaw) {
        setError('필요한 정보가 없어 처음 화면으로 돌아가야 해요.');
        setLoading(false);
        return;
      }

      const birth = JSON.parse(birthRaw);
      if (!birth.year || !birth.month || !birth.day) {
        setError('생년월일 정보가 올바르지 않아요. 다시 입력해주세요.');
        setLoading(false);
        return;
      }

      const sajuResult = calculateSaju(
        Number(birth.year),
        Number(birth.month),
        Number(birth.day),
        Number.isFinite(Number(birth.hour)) ? Number(birth.hour) : 12
      );
      const mbtiGroup = getMbtiGroup(storedMbti);
      const catResult = getCatCharacter(mbtiGroup, sajuResult.dominantOhaeng);

      setSaju(sajuResult);
      setCat(catResult);
      setMbti(storedMbti);
      setLoading(false);
      const timer = setTimeout(() => setRevealed(true), 600);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error(err);
      setError('정보를 불러오지 못했어요. 다시 시도해주세요.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔮</div>
          <p className="text-gray-500">운명을 계산하는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !cat || !saju || !mbti) {
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
    <main className="min-h-screen p-6 pt-12 max-w-md mx-auto space-y-6">
      <div
        className={`transition-all duration-1000 ${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{cat.emoji}</div>
          <h1 className="text-3xl font-bold">{cat.name}</h1>
          <p className="text-gray-500 mt-2">{cat.appearance}</p>
          <p className="text-orange-500 font-medium mt-1">
            &ldquo;{cat.tagline}&rdquo;
          </p>
        </div>

        {/* Short desc */}
        <div className="bg-orange-50 rounded-2xl p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">{cat.shortDesc}</p>
        </div>

        {/* Ohaeng */}
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-700">나의 오행 에너지</h3>
          <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
        </div>

        <AdSlot className="w-full" placeholderHeight={120} />

        {/* Full description */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            📖 상세 성격 분석
          </h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-gray-700 leading-relaxed">{cat.fullDesc}</p>
          </div>
        </section>

        <AdSlot className="w-full" placeholderHeight={100} />

        {/* Year fortune */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            🔮 2026년 운세
          </h2>
          <div className="bg-purple-50 rounded-2xl p-5">
            <p className="text-gray-700 leading-relaxed">{cat.yearFortune}</p>
          </div>
        </section>

        <AdSlot className="w-full" placeholderHeight={100} />

        {/* Current month */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            📅 이달의 운세 ({currentMonth}월)
          </h2>
          <div className="bg-blue-50 rounded-2xl p-5">
            <p className="text-gray-700 leading-relaxed">
              {cat.monthFortune[currentMonth]}
            </p>
          </div>
        </section>

        <AdSlot className="w-full" placeholderHeight={100} />

        {/* Monthly fortunes */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            🗓️ 월별 운세
          </h2>
          <div className="space-y-2">
            {MONTHS.map((month) => (
              <div
                key={month}
                className="bg-gray-50 rounded-xl p-4"
              >
                <span className="font-bold text-orange-400">{month}월</span>
                <p className="text-gray-600 text-sm mt-1">{cat.monthFortune[month]}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSlot className="w-full" placeholderHeight={120} />

        {/* Share & Retake */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="mt-4">
            <ShareCard cat={cat} saju={saju} mbti={mbti!} />
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('mbti');
              sessionStorage.removeItem('birthInfo');
              router.push('/test');
            }}
            className="w-full p-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-orange-300 hover:text-orange-500 transition-colors"
          >
            다시 테스트하기 🔄
          </button>
        </div>

        <AdSlot className="w-full" placeholderHeight={140} />
      </div>
    </main>
  );
}
