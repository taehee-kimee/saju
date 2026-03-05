'use client';

import Script from 'next/script';
import { useState } from 'react';

declare global {
  interface Window {
    AUTHNICE?: {
      requestPay: (params: Record<string, unknown>) => void;
    };
  }
}

export default function NicepayButton() {
  const [ready, setReady] = useState(false);

  const handlePay = () => {
    if (!window.AUTHNICE) return;
    window.AUTHNICE.requestPay({
      clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY,
      method: 'card',
      orderId: `nyangsae-${Date.now()}`,
      amount: 1900,
      goodsName: '냥세 풀리포트',
      returnUrl: `${window.location.origin}/api/nicepay/return`,
      fnError: (result: { errorMsg?: string }) => {
        alert(result.errorMsg ?? '결제 중 오류가 발생했어요. 다시 시도해주세요.');
      },
    });
  };

  return (
    <>
      <Script
        src="https://pay.nicepay.co.kr/v1/js/"
        onReady={() => setReady(true)}
      />
      <button
        onClick={handlePay}
        disabled={!ready}
        className="w-full p-4 bg-orange-500 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {ready ? '카드로 결제하기 (나이스페이)' : '로딩 중...'}
      </button>
    </>
  );
}
