'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSaju } from '@/lib/saju';
import { getMbtiGroup } from '@/lib/mbti';
import { getCatCharacter } from '@/lib/catMapper';
import OhaengBar from '@/components/OhaengBar';
import ShareCard from '@/components/ShareCard';
import AdSlot from '@/components/AdSlot';
import LockedSection from '@/components/LockedSection';
import { CatCharacter, MbtiType, SajuResult } from '@/types';
import { CAT_CONTENTS } from '@/data/catContents';

const FREE_SECTION_CONFIG = [
  { key: 'diagnosis', title: '🐾 냥세 한 줄 진단', emoji: '🐾' },
  { key: 'ohaengMap', title: '🧭 오행 밸런스 지도', emoji: '🧭' },
  { key: 'mbtiEngine', title: '🧠 MBTI 행동 엔진', emoji: '🧠' },
  { key: 'combination', title: '🧩 사주×MBTI 결합 해석', emoji: '🧩' },
  { key: 'mission7', title: '✅ 7일 실행 플랜', emoji: '✅' },
];

const PAID_SECTION_CONFIG = [
  { key: 'pattern', title: '🔍 반복되는 패턴의 원인', emoji: '🔍', teaser: '왜 나는 같은 문제를 반복할까?' },
  { key: 'love', title: '💞 연애', emoji: '💞', teaser: '2026년 당신의 연애운은?' },
  { key: 'money', title: '💰 재물', emoji: '💰', teaser: '2026년 당신의 재물운은?' },
  { key: 'career', title: '🧑‍💻 커리어', emoji: '🧑‍💻', teaser: '2026년 당신의 커리어운은?' },
  { key: 'health', title: '🧘‍♀️ 건강', emoji: '🧘‍♀️', teaser: '2026년 당신의 건강운은?' },
  { key: 'relationship', title: '🤝 인간관계', emoji: '🤝', teaser: '2026년 당신의 인간관계운은?' },
];

export default function ResultPage() {
  const router = useRouter();
  const [cat, setCat] = useState<CatCharacter | null>(null);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [mbti, setMbti] = useState<MbtiType | null>(null);
  const [catContent, setCatContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Handle unknown time
      const hourValue = birth.hour === 'unknown' ? 12 : Number(birth.hour);
      
      const sajuResult = calculateSaju(
        Number(birth.year),
        Number(birth.month),
        Number(birth.day),
        hourValue
      );
      const mbtiGroup = getMbtiGroup(storedMbti);
      const catResult = getCatCharacter(mbtiGroup, sajuResult.dominantOhaeng);

      // Store data for report page
      sessionStorage.setItem('catId', catResult.id);
      sessionStorage.setItem('sajuData', JSON.stringify(sajuResult));

      setSaju(sajuResult);
      setCat(catResult);
      setCatContent(CAT_CONTENTS[catResult.id]);
      setMbti(storedMbti);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('정보를 불러오지 못했어요. 다시 시도해주세요.');
      setLoading(false);
    }
  }, []);

  const handleUnlock = () => {
    router.push('/payment');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔮</div>
          <p className="text-gray-500">욕세를 계산하는 중...</p>
        </div>
      </main>
    );
  }

  if (error || !cat || !saju || !mbti || !catContent) {
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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{cat.emoji}</div>
          <h1 className="text-3xl font-bold">{cat.name}</h1>
          <p className="text-orange-500 font-medium mt-1">
            &ldquo;{cat.tagline}&rdquo;
          </p>
        </div>

        {/* Ohaeng - Rich content */}
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

        {/* Free Sections - Rich Content */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">🐾 냥세 진단</h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-orange-600 font-bold text-lg mb-2">{catContent.subtitles.diagnosis}</p>
            <p className="text-gray-700 leading-relaxed">{catContent.sections.diagnosis}</p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">🧭 오행 밸런스 분석</h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-orange-600 font-bold text-lg mb-2">{catContent.subtitles.ohaengMap}</p>
            <p className="text-gray-700 leading-relaxed mb-4">{catContent.sections.ohaengMap}</p>
            <div className="grid grid-cols-5 gap-2 text-center text-xs mt-4 pt-4 border-t border-orange-200">
              <div className={`p-2 rounded-lg ${saju.ohaeng['木'] > 15 ? 'bg-green-100 text-green-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                <div className="text-lg">🌳</div>
                <div>목</div>
                <div>{saju.ohaeng['木']}%</div>
              </div>
              <div className={`p-2 rounded-lg ${saju.ohaeng['火'] > 15 ? 'bg-red-100 text-red-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                <div className="text-lg">🔥</div>
                <div>화</div>
                <div>{saju.ohaeng['火']}%</div>
              </div>
              <div className={`p-2 rounded-lg ${saju.ohaeng['土'] > 15 ? 'bg-yellow-100 text-yellow-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                <div className="text-lg">⛰️</div>
                <div>토</div>
                <div>{saju.ohaeng['土']}%</div>
              </div>
              <div className={`p-2 rounded-lg ${saju.ohaeng['金'] > 15 ? 'bg-gray-100 text-gray-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                <div className="text-lg">⚔️</div>
                <div>금</div>
                <div>{saju.ohaeng['金']}%</div>
              </div>
              <div className={`p-2 rounded-lg ${saju.ohaeng['水'] > 15 ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                <div className="text-lg">🌊</div>
                <div>수</div>
                <div>{saju.ohaeng['水']}%</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">🧠 MBTI 행동 엔진</h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-orange-600 font-bold text-lg mb-2">{catContent.subtitles.mbtiEngine}</p>
            <p className="text-gray-700 leading-relaxed">{catContent.sections.mbtiEngine}</p>
            <div className="mt-4 p-4 bg-white rounded-xl border-2 border-orange-100">
              <div className="text-sm text-gray-500 mb-1">당신의 MBTI</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-orange-600">{mbti}</span>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">
                  {mbti.startsWith('I') ? '내향' : '외향'} · 
                  {mbti.includes('N') ? '직관' : '감각'} · 
                  {mbti.includes('T') ? '사고' : '감정'} · 
                  {mbti.endsWith('J') ? '판단' : '인식'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">🧩 사주×MBTI 결합 해석</h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-orange-600 font-bold text-lg mb-2">{catContent.subtitles.combination}</p>
            <p className="text-gray-700 leading-relaxed">{catContent.sections.combination}</p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">✅ 7일 실행 플랜 (무료 미리보기)</h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <ul className="space-y-3">
              {catContent.sections.mission7.slice(0, 3).map((mission: string, i: number) => (
                <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl">
                  <span className="w-6 h-6 bg-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                  <span className="text-gray-700">{mission}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-orange-100 rounded-xl text-center">
              <p className="text-sm text-orange-800">🔒 풀리포트에서 4개 미션 더 확인하기</p>
            </div>
          </div>
        </section>

        <AdSlot className="w-full" placeholderHeight={100} />

        {/* Paid Sections (Locked) */}
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

        {/* Share & Retake */}
        <div className="space-y-3 pt-8 border-t border-gray-100">
          <div className="mt-4">
            <ShareCard cat={cat} saju={saju} mbti={mbti!} />
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('mbti');
              sessionStorage.removeItem('birthInfo');
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

      {/* Fixed CTA Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-md mx-auto">
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
