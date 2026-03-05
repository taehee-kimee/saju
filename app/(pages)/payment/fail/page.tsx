'use client';

import { useRouter } from 'next/navigation';

export default function PaymentFailPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm w-full">
        <div className="text-6xl">😿</div>
        <div>
          <h1 className="text-xl font-bold text-orange-950 mb-2">결제가 취소되었어요</h1>
          <p className="text-orange-600 text-sm">
            결제 중 문제가 발생했거나 취소하셨어요.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/payment')}
            className="w-full p-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            다시 결제하기
          </button>
          <button
            onClick={() => router.push('/result')}
            className="w-full p-3 border border-gray-200 text-orange-800 rounded-xl text-sm hover:border-gray-300 transition-colors"
          >
            결과 페이지로 돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}
