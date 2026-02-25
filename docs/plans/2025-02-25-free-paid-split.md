# 냥세 묶/유료 콘텐츠 분리 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 냥세 결과 페이지를 묘/유료로 분리 - 묘 5섹션 미리보기 + 1,900원 결제 시 10섹션 풀리포트 제공

**Architecture:** 
- `/result` 페이지에서 묘 5섹션 전체 표시 + 유료 5섹션 흐리게 처리(티저)
- "1,900원 풀리포트 보기" 버튼 클릭 시 Toss Payments 연동
- 결제 성공 시 `/report` 페이지에서 10섹션 전체 표시
- sessionStorage로 결제 상태 및 캐릭터 데이터 공유

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Toss Payments SDK (@tosspayments/tosspayments-sdk)

---

## Task 1: 유료 섹션 UI 컴포넌트 생성 (LockedSection)

**Files:**
- Create: `components/LockedSection.tsx`
- Modify: None
- Test: `app/(pages)/result/page.tsx` (visual verification)

**Step 1: Create LockedSection component**

Create file `components/LockedSection.tsx`:

```tsx
'use client';

interface LockedSectionProps {
  title: string;
  emoji: string;
  teaserText: string;
  onUnlock: () => void;
}

export default function LockedSection({ title, emoji, teaserText, onUnlock }: LockedSectionProps) {
  return (
    <div className="relative bg-gray-100 rounded-2xl p-5 overflow-hidden">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10 flex flex-col items-center justify-center">
        <span className="text-3xl mb-2">{emoji}</span>
        <p className="text-gray-600 text-sm text-center mb-3 px-4">{teaserText}</p>
        <button
          onClick={onUnlock}
          className="px-4 py-2 bg-orange-400 text-white rounded-full text-sm font-medium hover:bg-orange-500 transition-colors"
        >
          1,900원으로 잠금 해제
        </button>
      </div>
      
      {/* Blurred content preview */}
      <div className="blur-sm opacity-50">
        <h3 className="font-bold text-gray-400 mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed h-20">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/LockedSection.tsx
git commit -m "feat: add LockedSection component for paid content teaser"
```

---

## Task 2: 결과 페이지 수정 - 묘/유료 섹션 분리

**Files:**
- Modify: `app/(pages)/result/page.tsx`
- Create: None
- Test: Browser verification at `/result`

**Step 1: Update result page to show free/paid split**

Modify `app/(pages)/result/page.tsx`:

Key changes:
1. Add import for LockedSection
2. Define FREE_SECTIONS and PAID_SECTIONS arrays
3. Render free sections fully
4. Render paid sections with LockedSection component
5. Add CTA button at bottom

```tsx
// Add import at top
import LockedSection from '@/components/LockedSection';

// Define section mappings (add after imports)
const FREE_SECTION_KEYS = ['diagnosis', 'ohaengMap', 'mbtiEngine', 'combination', 'mission7'] as const;
const PAID_SECTION_KEYS = ['love', 'money', 'career', 'health', 'relationship'] as const;

const FREE_SECTION_CONFIG = [
  { key: 'diagnosis', title: '🐾 냥세 한 줄 진단', emoji: '🐾' },
  { key: 'ohaengMap', title: '🧭 오행 밸런스 지도', emoji: '🧭' },
  { key: 'mbtiEngine', title: '🧠 MBTI 행동 엔진', emoji: '🧠' },
  { key: 'combination', title: '🧩 사주×MBTI 결합 해석', emoji: '🧩' },
  { key: 'mission7', title: '✅ 7일 실행 플랜', emoji: '✅' },
];

const PAID_SECTION_CONFIG = [
  { key: 'love', title: '💞 연애 운세', emoji: '💞', teaser: '2026년 당신의 연애운은? 클릭해서 확인하세요!' },
  { key: 'money', title: '💰 재물 운세', emoji: '💰', teaser: '2026년 당신의 재물운은? 클릭해서 확인하세요!' },
  { key: 'career', title: '🧑‍💻 커리어 운세', emoji: '🧑‍💻', teaser: '2026년 당신의 커리어운은? 클릭해서 확인하세요!' },
  { key: 'health', title: '🧘‍♀️ 건강 운세', emoji: '🧘‍♀️', teaser: '2026년 당신의 건강운은? 클릭해서 확인하세요!' },
  { key: 'relationship', title: '🤝 인간관계 운세', emoji: '🤝', teaser: '2026년 당신의 인간관계운은? 클릭해서 확인하세요!' },
];
```

**Step 2: Update handleUnlock function**

```tsx
const handleUnlock = () => {
  router.push('/payment');
};
```

**Step 3: Update JSX to render sections**

Replace the middle sections with:

```tsx
{/* Free Sections */}
{FREE_SECTION_CONFIG.map((config) => (
  <section key={config.key} className="mb-6">
    <h2 className="text-lg font-bold text-orange-500 mb-3">{config.title}</h2>
    <div className="bg-orange-50 rounded-2xl p-5">
      {config.key === 'mission7' ? (
        <ul className="space-y-2">
          {catContent?.sections.mission7.slice(0, 3).map((mission, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">{i + 1}.</span>
              <span className="text-gray-700">{mission}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 leading-relaxed">
          {catContent?.sections[config.key as keyof typeof catContent.sections]}
        </p>
      )}
    </div>
  </section>
))}

<AdSlot className="w-full" placeholderHeight={100} />

{/* Paid Sections (Locked) */}
{PAID_SECTION_CONFIG.map((config) => (
  <LockedSection
    key={config.key}
    title={config.title}
    emoji={config.emoji}
    teaserText={config.teaser}
    onUnlock={handleUnlock}
  />
))}

{/* CTA Button */}
<div className="sticky bottom-4 mt-8">
  <button
    onClick={handleUnlock}
    className="w-full p-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
  >
    🔓 1,900원으로 풀리포트 보기
  </button>
  <p className="text-center text-gray-400 text-xs mt-2">5개 섹션 추가 · 총 10섹션 완성</p>
</div>
```

**Step 4: Commit**

```bash
git add app/(pages)/result/page.tsx
git commit -m "feat: split result page into free and paid sections"
```

---

## Task 3: 결제 페이지 생성

**Files:**
- Create: `app/(pages)/payment/page.tsx`
- Create: `components/TossPayment.tsx`
- Modify: None
- Test: Browser at `/payment`

**Step 1: Create TossPayment component**

Create `components/TossPayment.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

interface TossPaymentProps {
  amount: number;
  orderName: string;
  onSuccess: (paymentKey: string, orderId: string) => void;
  onFail: (error: any) => void;
}

export default function TossPayment({ amount, orderName, onSuccess, onFail }: TossPaymentProps) {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<any>(null);

  useEffect(() => {
    async function initPayment() {
      try {
        const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
        const widgetsInstance = tossPayments.widgets({
          customerKey: ANONYMOUS,
        });
        
        await widgetsInstance.setAmount({
          currency: 'KRW',
          value: amount,
        });

        await widgetsInstance.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        });

        await widgetsInstance.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        });

        setWidgets(widgetsInstance);
        setReady(true);
      } catch (error) {
        console.error('Payment init failed:', error);
        onFail(error);
      }
    }

    initPayment();
  }, [amount]);

  const handlePayment = async () => {
    if (!widgets) return;
    
    try {
      const orderId = `nyangsae-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/report?payment=success&orderId=${orderId}`,
        failUrl: `${window.location.origin}/payment?payment=fail`,
      });
    } catch (error) {
      onFail(error);
    }
  };

  return (
    <div className="space-y-4">
      <div id="payment-method" className="w-full" />
      <div id="agreement" className="w-full" />
      <button
        onClick={handlePayment}
        disabled={!ready}
        className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50"
      >
        {ready ? '결제하기' : '로딩 중...'}
      </button>
    </div>
  );
}
```

**Step 2: Create payment page**

Create `app/(pages)/payment/page.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TossPayment = dynamic(() => import('@/components/TossPayment'), {
  ssr: false,
});

export default function PaymentPage() {
  const router = useRouter();

  const handleSuccess = (paymentKey: string, orderId: string) => {
    // Will be handled by redirect URL
    console.log('Payment success:', paymentKey, orderId);
  };

  const handleFail = (error: any) => {
    console.error('Payment failed:', error);
    alert('결제에 실패했습니다. 다시 시도해주세요.');
  };

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">풀리포트 구매</h1>
      <p className="text-gray-500 mb-6">냥세 풀리포트를 확인해보세요!</p>
      
      <div className="bg-orange-50 rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">상품명</span>
          <span className="font-medium">냥세 풀리포트</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">금액</span>
          <span className="text-xl font-bold text-orange-500">1,900원</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <h3 className="font-bold text-gray-700 mb-3">포함 내용</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✅ 냥세 한 줄 진단</li>
          <li>✅ 오행 밸런스 지도</li>
          <li>✅ MBTI 행동 엔진</li>
          <li>✅ 사주×MBTI 결합 해석</li>
          <li>✅ 7일 실행 플랜 (7개)</li>
          <li>🔓 연애 운세</li>
          <li>🔓 재물 운세</li>
          <li>🔓 커리어 운세</li>
          <li>🔓 건강 운세</li>
          <li>🔓 인간관계 운세</li>
        </ul>
      </div>

      <TossPayment
        amount={1900}
        orderName="냥세 풀리포트"
        onSuccess={handleSuccess}
        onFail={handleFail}
      />
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add components/TossPayment.tsx app/(pages)/payment/page.tsx
git commit -m "feat: add payment page with Toss Payments integration"
```

---

## Task 4: 풀리포트 페이지 생성

**Files:**
- Create: `app/(pages)/report/page.tsx`
- Modify: None
- Test: Browser at `/report?payment=success`

**Step 1: Create full report page**

Create `app/(pages)/report/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CAT_CONTENTS } from '@/data/catContents';
import OhaengBar from '@/components/OhaengBar';

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [catContent, setCatContent] = useState<any>(null);
  const [saju, setSaju] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentSuccess = searchParams.get('payment') === 'success';

  useEffect(() => {
    // Verify payment success
    if (!paymentSuccess) {
      router.push('/result');
      return;
    }

    // Load data from sessionStorage
    const storedMbti = sessionStorage.getItem('mbti');
    const birthRaw = sessionStorage.getItem('birthInfo');
    const catId = sessionStorage.getItem('catId');
    const sajuData = sessionStorage.getItem('sajuData');

    if (!catId || !sajuData) {
      router.push('/result');
      return;
    }

    setCatContent(CAT_CONTENTS[catId]);
    setSaju(JSON.parse(sajuData));
    setLoading(false);
  }, [paymentSuccess, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔮</div>
          <p className="text-gray-500">리포트를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (!catContent) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>리포트를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const sections = [
    { key: 'diagnosis', title: '🐾 냥세 한 줄 진단', emoji: '🐾' },
    { key: 'ohaengMap', title: '🧭 오행 밸런스 지도', emoji: '🧭' },
    { key: 'mbtiEngine', title: '🧠 MBTI 행동 엔진', emoji: '🧠' },
    { key: 'combination', title: '🧩 사주×MBTI 결합 해석', emoji: '🧩' },
    { key: 'love', title: '💞 연애 운세', emoji: '💞' },
    { key: 'money', title: '💰 재물 운세', emoji: '💰' },
    { key: 'career', title: '🧑‍💻 커리어 운세', emoji: '🧑‍💻' },
    { key: 'health', title: '🧘‍♀️ 건강 운세', emoji: '🧘‍♀️' },
    { key: 'relationship', title: '🤝 인간관계 운세', emoji: '🤝' },
  ];

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{catContent.emoji}</div>
        <h1 className="text-3xl font-bold">{catContent.name}</h1>
        <p className="text-orange-500 font-medium mt-1">"{catContent.tagline}"</p>
        <div className="mt-3 inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
          <span>✓</span>
          <span>풀리포트 구매 완료</span>
        </div>
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
            {section.key === 'mission7' ? (
              <ul className="space-y-2">
                {catContent.sections.mission7.map((mission: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">{i + 1}.</span>
                    <span className="text-gray-700">{mission}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {catContent.sections[section.key as keyof typeof catContent.sections]}
              </p>
            )}
          </div>
        </section>
      ))}

      {/* Share buttons */}
      <div className="mt-8 space-y-3">
        <button
          onClick={() => {
            // Share functionality
            if (navigator.share) {
              navigator.share({
                title: '냥세 풀리포트',
                text: `나는 ${catContent.name}입니다!`,
                url: window.location.href,
              });
            }
          }}
          className="w-full p-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
        >
          결과 공유하기
        </button>
        <button
          onClick={() => router.push('/test')}
          className="w-full p-3 text-gray-500 text-sm"
        >
          다시 테스트하기
        </button>
      </div>
    </main>
  );
}
```

**Step 2: Update result page to store catId and sajuData**

Modify `app/(pages)/result/page.tsx` to add:

```tsx
// Inside useEffect, after calculating:
sessionStorage.setItem('catId', catResult.id);
sessionStorage.setItem('sajuData', JSON.stringify(sajuResult));
```

**Step 3: Commit**

```bash
git add app/(pages)/report/page.tsx app/(pages)/result/page.tsx
git commit -m "feat: add full report page with payment verification"
```

---

## Task 5: 환경 변수 설정

**Files:**
- Modify: `.env.local`
- Modify: `.env.example` (if exists)

**Step 1: Add Toss Payments env vars**

Add to `.env.local`:

```
# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_DnyRp7W62Nq4O5w2kGZvrGK2
TOSS_SECRET_KEY=test_sk_DnyRp7W62Nq4O5w2kGZvrGK2
```

**Step 2: Commit**

```bash
git add .env.local
git commit -m "chore: add Toss Payments environment variables"
```

---

## Task 6: 테스트 및 배포

**Step 1: Local test**

```bash
cd nyangsae
npm run build
npm start
```

**Step 2: Deploy to Vercel**

```bash
$env:VERCEL_TOKEN="YOUR_VERCEL_TOKEN"
vercel --token $env:VERCEL_TOKEN --prod --yes
```

---

**Plan complete!** Implementation ready for execution.
