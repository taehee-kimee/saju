'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { calculateSaju } from '@/lib/saju';
import { getMbtiGroup } from '@/lib/mbti';
import { getCatCharacter } from '@/lib/catMapper';
import OhaengBar from '@/components/OhaengBar';
import { CatCharacter, MbtiType, SajuResult } from '@/types';

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-6xl animate-spin">🔮</div></div>}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paid, setPaid] = useState(false);
  const [cat, setCat] = useState<CatCharacter | null>(null);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [currentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const storedMbti = sessionStorage.getItem('mbti') as MbtiType;
    const birthRaw = sessionStorage.getItem('birthInfo');
    if (!storedMbti || !birthRaw) {
      router.push('/');
      return;
    }
    const birth = JSON.parse(birthRaw);
    const sajuResult = calculateSaju(
      parseInt(birth.year), parseInt(birth.month),
      parseInt(birth.day), parseInt(birth.hour)
    );
    const mbtiGroup = getMbtiGroup(storedMbti);
    setCat(getCatCharacter(mbtiGroup, sajuResult.dominantOhaeng));
    setSaju(sajuResult);
  }, [router]);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    if (paymentKey && orderId) {
      fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount: 990 }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setPaid(true);
        });
    }
  }, [searchParams]);

  const handlePayment = async () => {
    try {
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
      const payment = toss.payment({ customerKey: `customer_${Date.now()}` });
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: 990 },
        orderId: `order_${Date.now()}`,
        orderName: '냥세 상세 리포트',
        successUrl: `${window.location.origin}/report`,
        failUrl: `${window.location.origin}/report?fail=true`,
      });
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  if (!cat || !saju) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-spin">🔮</div>
      </main>
    );
  }

  if (!paid) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">{cat.emoji}</div>
          <h1 className="text-2xl font-bold mb-2">상세 리포트</h1>
          <p className="text-gray-500 mb-4">{cat.name}의 모든 것을 알아보세요</p>
          <div className="bg-white rounded-2xl p-4 mb-6 text-left shadow-sm">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ 상세 성격 분석</li>
              <li>✅ 2026년 올해 운세</li>
              <li>✅ 12개월 월별 운세</li>
              <li>✅ 고화질 공유 카드</li>
            </ul>
          </div>
          <button
            onClick={handlePayment}
            className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold text-lg hover:bg-orange-500 transition-colors"
          >
            990원으로 전체 보기 🔓
          </button>
          <button
            onClick={() => router.back()}
            className="mt-3 text-gray-400 text-sm hover:text-gray-600"
          >
            ← 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pt-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">{cat.emoji}</div>
          <h1 className="text-3xl font-bold">{cat.name}</h1>
          <p className="text-orange-500 mt-1">&ldquo;{cat.tagline}&rdquo;</p>
        </div>

        <section className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3 text-orange-500">📖 상세 성격 분석</h2>
          <p className="text-gray-700 leading-relaxed">{cat.fullDesc}</p>
        </section>

        <section className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3 text-orange-500">🔮 오행 에너지</h2>
          <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
        </section>

        <section className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3 text-orange-500">✨ 2026년 운세</h2>
          <p className="text-gray-700 leading-relaxed">{cat.yearFortune}</p>
        </section>

        <section className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3 text-orange-500">📅 이달의 운세 ({currentMonth}월)</h2>
          <p className="text-gray-700 leading-relaxed">
            {cat.monthFortune[String(currentMonth)]}
          </p>
        </section>

        <section className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3 text-orange-500">📆 월별 운세</h2>
          <div className="space-y-3">
            {Object.entries(cat.monthFortune).map(([month, fortune]) => (
              <div key={month} className="flex gap-3">
                <span className="text-orange-400 font-bold w-8 shrink-0">{month}월</span>
                <p className="text-gray-600 text-sm">{fortune}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center mt-8 mb-12">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 text-sm hover:text-gray-600"
          >
            처음부터 다시 하기
          </button>
        </div>
      </div>
    </main>
  );
}
