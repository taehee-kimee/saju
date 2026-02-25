'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CAT_CONTENTS } from '@/data/catContents';
import OhaengBar from '@/components/OhaengBar';

interface FortuneData {
  love: string;
  money: string;
  career: string;
  health: string;
  relationship: string;
}

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [catContent, setCatContent] = useState<any>(null);
  const [saju, setSaju] = useState<any>(null);
  const [mbti, setMbti] = useState<string>('');
  const [fortunes, setFortunes] = useState<FortuneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingFortunes, setGeneratingFortunes] = useState(false);

  const paymentSuccess = searchParams.get('payment') === 'success';
  const debugMode = searchParams.get('debug') === 'true' || process.env.NEXT_PUBLIC_REPORT_DEBUG === 'true';

  useEffect(() => {
    // Verify payment success (skip if debug mode)
    if (!paymentSuccess && !debugMode) {
      router.push('/result');
      return;
    }

    // Load data from sessionStorage
    const catId = sessionStorage.getItem('catId');
    const sajuData = sessionStorage.getItem('sajuData');
    const mbtiData = sessionStorage.getItem('mbti');

    if (!catId || !sajuData || !mbtiData) {
      router.push('/result');
      return;
    }

    setCatContent(CAT_CONTENTS[catId]);
    const parsedSaju = JSON.parse(sajuData);
    setSaju(parsedSaju);
    setMbti(mbtiData);

    // Generate fortunes via API
    generateFortunes(parsedSaju, mbtiData, catId);
  }, [paymentSuccess, router]);

  const generateFortunes = async (sajuData: any, mbtiType: string, catId: string) => {
    setGeneratingFortunes(true);
    try {
      const cat = CAT_CONTENTS[catId];
      const response = await fetch('/api/generate-fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saju: sajuData,
          payload: sajuData.payload,  // 상세 사주 데이터
          mbti: mbtiType,
          ohaeng: sajuData.dominantOhaeng,
          catName: cat.name,
          catTagline: cat.tagline,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate fortunes');
      }

      const data = await response.json();
      setFortunes(data);
    } catch (error) {
      console.error('Error generating fortunes:', error);
      // Fallback to default fortunes from catContents if API fails
      const cat = CAT_CONTENTS[catId];
      setFortunes({
        love: cat.sections.love,
        money: cat.sections.money,
        career: cat.sections.career,
        health: cat.sections.health,
        relationship: cat.sections.relationship,
      });
    } finally {
      setGeneratingFortunes(false);
      setLoading(false);
    }
  };

  if (loading || generatingFortunes) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 animate-bounce">🔮</div>
          <p className="text-gray-500 mb-2">
            {generatingFortunes ? 'AI가 2026년 운세를 분석 중입니다...' : '리포트를 불러오는 중...'}
          </p>
          {generatingFortunes && (
            <p className="text-sm text-gray-400">
              사주 × MBTI × 오행을 결합하여<br />맞춤형 운세를 생성하고 있습니다
            </p>
          )}
        </div>
      </main>
    );
  }

  if (!catContent || !saju || !fortunes) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>리포트를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const sections = [
    { key: 'diagnosis', title: '🐾 냥세 진단', subtitle: catContent.subtitles.diagnosis, content: catContent.sections.diagnosis },
    { key: 'ohaengMap', title: '🧭 오행 밸런스 지도', subtitle: catContent.subtitles.ohaengMap, content: catContent.sections.ohaengMap },
    { key: 'mbtiEngine', title: '🧠 MBTI 행동 엔진', subtitle: catContent.subtitles.mbtiEngine, content: catContent.sections.mbtiEngine },
    { key: 'combination', title: '🧩 사주×MBTI 결합 해석', subtitle: catContent.subtitles.combination, content: catContent.sections.combination },
    { key: 'pattern', title: '🔍 반복되는 패턴의 원인', subtitle: catContent.subtitles.pattern, content: catContent.sections.pattern },
    { key: 'love', title: '💞 연애 운세', subtitle: null, content: fortunes.love },
    { key: 'money', title: '💰 재물 운세', subtitle: null, content: fortunes.money },
    { key: 'career', title: '🧑‍💻 커리어 운세', subtitle: null, content: fortunes.career },
    { key: 'health', title: '🧘‍♀️ 건강 운세', subtitle: null, content: fortunes.health },
    { key: 'relationship', title: '🤝 인간관계 운세', subtitle: null, content: fortunes.relationship },
  ];

  return (
    <main className="min-h-screen p-6 pb-32 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{catContent.emoji}</div>
        <h1 className="text-3xl font-bold">{catContent.name}</h1>
        <p className="text-orange-500 font-medium mt-1">&ldquo;{catContent.tagline}&rdquo;</p>
        {debugMode ? (
          <div className="mt-3 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <span>🐛</span>
            <span>디버그 모드</span>
          </div>
        ) : (
          <div className="mt-3 inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            <span>✓</span>
            <span>AI 풀리포트 생성 완료</span>
          </div>
        )}
      </div>

      {/* Ohaeng */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-gray-700">나의 오행 에너지</h3>
        <OhaengBar ohaeng={saju?.ohaeng} dominant={saju?.dominantOhaeng} />
      </div>

      {/* All Sections */}
      {sections.map((section) => (
        <section key={section.key} className="mb-6">
          <h2 className="text-lg font-bold text-orange-500 mb-3">{section.title}</h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            {section.subtitle && (
              <p className="text-orange-600 font-bold text-lg mb-2">{section.subtitle}</p>
            )}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        </section>
      ))}

      {/* Mission 7 Section */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-orange-500 mb-3">✅ 7일 개울 플랜</h2>
        <div className="bg-orange-50 rounded-2xl p-5">
          <ul className="space-y-3">
            {catContent.sections.mission7.map((mission: string, i: number) => (
              <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl">
                <span className="w-6 h-6 bg-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                <span className="text-gray-700">{mission}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Share buttons */}
      <div className="mt-8 space-y-3">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: '냥세 풀리포트',
                text: `나는 ${catContent.name}입니다! 2026년 운세를 확인해보세요 🐱`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
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
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔮</div>
          <p className="text-gray-500">리포트를 불러오는 중...</p>
        </div>
      </main>
    }>
      <ReportContent />
    </Suspense>
  );
}
