'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CatCharacter } from '@/types';
import { CATS } from '@/data/cats';
import { getMbtiGroup } from '@/lib/mbti';
import { calculateSaju } from '@/lib/saju';
import type { MbtiType } from '@/types';

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-6xl animate-spin">🔮</div></div>}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const [paid, setPaid] = useState(false);
  const [cat, setCat] = useState<CatCharacter | null>(null);
  const [currentMonth] = useState(() => String(new Date().getMonth() + 1));

  useEffect(() => {
    // 결과 데이터 복원
    const mbti = sessionStorage.getItem('mbti') as MbtiType;
    const birth = JSON.parse(sessionStorage.getItem('birthInfo') || '{}');
    if (mbti && birth.year) {
      const saju = calculateSaju(
        parseInt(birth.year),
        parseInt(birth.month),
        parseInt(birth.day),
        parseInt(birth.hour)
      );
      const group = getMbtiGroup(mbti);
      const catId = `${group}_${saju.dominantOhaeng}`;
      setCat(CATS[catId]);
    }

    // 결제 성공 후 리다이렉트 처리
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    if (paymentKey && orderId) {
      fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount: 990 }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setPaid(true);
        });
    }
  }, [searchParams]);

  const handlePayment = async () => {
    const { loadTossPayments } = await import(
      '@tosspayments/tosspayments-sdk'
    );
    const toss = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
    );
    await (toss as any).requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: 990 },
      orderId: `order_${Date.now()}`,
      orderName: '냥세 상세 리포트',
      successUrl: `${window.location.origin}/report?success=true`,
      failUrl: `${window.location.origin}/report?fail=true`,
    });
  };

  if (paid && cat) {
    return (
      <main className="min-h-screen p-6 pt-12 max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">{cat.emoji}</div>
          <h1 className="text-2xl font-bold">{cat.name} 상세 리포트</h1>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            📖 상세 성격 분석
          </h2>
          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-gray-700 leading-relaxed">{cat.fullDesc}</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            🔮 2026년 운세
          </h2>
          <div className="bg-purple-50 rounded-2xl p-5">
            <p className="text-gray-700 leading-relaxed">{cat.yearFortune}</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-orange-500 mb-3">
            📅 이달의 운세 ({currentMonth}월)
          </h2>
          <div className="bg-blue-50 rounded-2xl p-5">
            <p className="text-gray-700 leading-relaxed">
              {cat.monthFortune[currentMonth]}
            </p>
          </div>
        </section>

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
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🐱</div>
        <h1 className="text-2xl font-bold mb-2">상세 리포트</h1>
        <p className="text-gray-500 mb-8">
          상세 성격 분석 + 올해 운세 + 월별 운세를 확인하세요
        </p>
        <button
          onClick={handlePayment}
          className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold text-lg"
        >
          990원으로 전체 보기 🔓
        </button>
      </div>
    </main>
  );
}
