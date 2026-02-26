'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

interface TossPaymentProps {
  amount: number;
  orderName: string;
  onFail: (error: Error) => void;
}

type TossPaymentsInstance = Awaited<ReturnType<typeof loadTossPayments>>;
type TossWidgets = ReturnType<TossPaymentsInstance['widgets']>;

export default function TossPayment({ amount, orderName, onFail }: TossPaymentProps) {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<TossWidgets | null>(null);

  useEffect(() => {
    async function initPayment() {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          throw new Error('NEXT_PUBLIC_TOSS_CLIENT_KEY is not configured');
        }

        const tossPayments = await loadTossPayments(clientKey);
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
        const normalizedError =
          error instanceof Error
            ? error
            : new Error('결제 초기화에 실패했습니다.');
        console.error('Payment init failed:', error);
        onFail(normalizedError);
      }
    }

    void initPayment();
  }, [amount, onFail]);

  const handlePayment = async () => {
    if (!widgets) return;
    
    try {
      const orderId = `nyangsae-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/report?payment=success`,
        failUrl: `${window.location.origin}/payment?payment=fail`,
      });
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error('결제 요청에 실패했습니다.');
      onFail(normalizedError);
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
