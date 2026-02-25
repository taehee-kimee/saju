'use client';
import { Suspense, useEffect, useState } from 'react';
import { CatCharacter } from '@/types';
import { CATS } from '@/data/cats';
import { getMbtiGroup } from '@/lib/mbti';
import { calculateSaju } from '@/lib/saju';
import AdSlot from '@/components/AdSlot';
import type { MbtiType } from '@/types';

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-6xl animate-spin">🔮</div></div>}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const [cat, setCat] = useState<CatCharacter | null>(null);
  const [currentMonth] = useState(() => String(new Date().getMonth() + 1));

  useEffect(() => {
    // 결과 데이터 복원
    const mbti = sessionStorage.getItem('mbti') as MbtiType;
    const birth = JSON.parse(sessionStorage.getItem('birthInfo') || '{}');
    if (mbti && birth.year) {
      const saju = calculateSaju(
        parseInt(birth.year, 10),
        parseInt(birth.month, 10),
        parseInt(birth.day, 10),
        Number.isFinite(parseInt(birth.hour, 10)) ? parseInt(birth.hour, 10) : 12
      );
      const group = getMbtiGroup(mbti);
      const catId = `${group}_${saju.dominantOhaeng}`;
      setCat(CATS[catId]);
    }
  }, []);

  if (!cat) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🔮</div>
          <p className="text-gray-500">정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pt-12 max-w-md mx-auto space-y-6">
      <div className="text-center mb-4">
        <div className="text-6xl mb-3">{cat.emoji}</div>
        <h1 className="text-2xl font-bold">{cat.name} 상세 리포트</h1>
      </div>

      <AdSlot className="w-full" placeholderHeight={100} />

      <section className="mb-4">
        <h2 className="text-lg font-bold text-orange-500 mb-3">
          📖 상세 성격 분석
        </h2>
        <div className="bg-orange-50 rounded-2xl p-5">
          <p className="text-gray-700 leading-relaxed">{cat.fullDesc}</p>
        </div>
      </section>

      <AdSlot className="w-full" placeholderHeight={100} />

      <section className="mb-4">
        <h2 className="text-lg font-bold text-orange-500 mb-3">
          🔮 2026년 운세
        </h2>
        <div className="bg-purple-50 rounded-2xl p-5">
          <p className="text-gray-700 leading-relaxed">{cat.yearFortune}</p>
        </div>
      </section>

      <AdSlot className="w-full" placeholderHeight={100} />

      <section className="mb-4">
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

      <section>
        <h2 className="text-lg font-bold text-orange-500 mb-3">
          🗓️ 월별 운세
        </h2>
        <div className="space-y-2">
          {Object.entries(cat.monthFortune).map(([month, fortune]) => (
            <div
              key={month}
              className="bg-gray-50 rounded-xl p-4"
            >
              <span className="font-bold text-orange-400">{month}월</span>
              <p className="text-gray-600 text-sm mt-1">{fortune}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot className="w-full" placeholderHeight={120} />
    </main>
  );
}
