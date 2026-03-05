'use client';

import { useRouter } from 'next/navigation';
import NicepayButton from '@/components/NicepayButton';

export default function PaymentPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"
      >
        ← 뒤로
      </button>

      <h1 className="text-2xl font-light mb-2 font-title">풀리포트 구매</h1>
      <p className="text-gray-500 mb-6">냥세 풀리포트를 확인해보세요!</p>

      <div className="bg-orange-50 rounded-2xl p-5 mb-4">
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
          <li>✅ 🐾 냥세 진단</li>
          <li>✅ 🧭 오행 밸런스 지도</li>
          <li>✅ 🧩 사주×MBTI 결합 해석</li>
          <li>✅ 🔄 반복 패턴 분석</li>
          <li>✅ 🚨 과부하 신호 가이드</li>
          <li>🔓 💞 연애 운세</li>
          <li>🔓 💰 재물 운세</li>
          <li>🔓 🧑‍💻 커리어 운세</li>
          <li>🔓 🧘‍♀️ 건강 운세</li>
          <li>🔓 🤝 인간관계 운세</li>
        </ul>
      </div>

      <NicepayButton />

      <p className="text-center text-xs text-gray-400 mt-4">
        결제 후 즉시 풀리포트가 열립니다
      </p>
    </main>
  );
}
