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
  }, [amount, onFail]);

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
