'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSaju } from '@/lib/saju';
import { getMbtiGroup } from '@/lib/mbti';
import { getCatCharacter } from '@/lib/catMapper';
import OhaengBar from '@/components/OhaengBar';
import { CatCharacter, MbtiType, SajuResult } from '@/types';

export default function ResultPage() {
  const router = useRouter();
  const [cat, setCat] = useState<CatCharacter | null>(null);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const storedMbti = sessionStorage.getItem('mbti') as MbtiType;
    const birthRaw = sessionStorage.getItem('birthInfo');
    if (!storedMbti || !birthRaw) {
      router.push('/');
      return;
    }

    const birth = JSON.parse(birthRaw);
    const sajuResult = calculateSaju(
      parseInt(birth.year),
      parseInt(birth.month),
      parseInt(birth.day),
      parseInt(birth.hour)
    );
    const mbtiGroup = getMbtiGroup(storedMbti);
    const catResult = getCatCharacter(mbtiGroup, sajuResult.dominantOhaeng);

    setMbti(storedMbti);
    setSaju(sajuResult);
    setCat(catResult);
    setTimeout(() => setRevealed(true), 1500);
  }, [router]);

  if (!cat || !saju) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔮</div>
          <p className="text-gray-500">운명을 계산하는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 pt-12 bg-gradient-to-b from-orange-50 to-white">
      <div
        className={`transition-all duration-1000 ${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{cat.emoji}</div>
          <h1 className="text-3xl font-bold">{cat.name}</h1>
          <p className="text-gray-500 mt-2">{cat.appearance}</p>
          <p className="text-sm text-gray-400 mt-1">{mbti} · {saju.dominantOhaeng} 기운</p>
          <p className="text-orange-500 font-medium mt-3">&ldquo;{cat.tagline}&rdquo;</p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 max-w-sm w-full shadow-sm">
          <p className="text-gray-700 leading-relaxed">{cat.shortDesc}</p>
        </div>

        <div className="w-full max-w-sm mb-8">
          <h3 className="font-bold mb-3 text-gray-700">나의 오행 에너지</h3>
          <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
        </div>

        <div className="space-y-3 w-full max-w-sm">
          <button
            onClick={() => router.push('/report')}
            className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold hover:bg-orange-500 transition-colors"
          >
            상세 분석 보기 · 990원 🔓
          </button>
          <button
            onClick={() => {
              // TODO: 공유 카드 기능 (Task 9)
              alert('공유 기능은 준비 중입니다!');
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-orange-400 transition-colors"
          >
            결과 공유하기 📤
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full p-3 text-gray-400 text-sm hover:text-gray-600"
          >
            처음부터 다시 하기
          </button>
        </div>
      </div>
    </main>
  );
}
