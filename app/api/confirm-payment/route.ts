import { NextRequest, NextResponse } from 'next/server';

interface ConfirmPaymentBody {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } =
      (await req.json()) as ConfirmPaymentBody;

    if (
      !paymentKey ||
      !orderId ||
      typeof amount !== 'number' ||
      !Number.isFinite(amount)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment payload' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'TOSS_SECRET_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { success: false, data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
