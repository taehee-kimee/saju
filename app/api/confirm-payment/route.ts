import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount } = await req.json();

  const response = await fetch(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.TOSS_SECRET_KEY}:`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    }
  );

  const data = await response.json();
  return NextResponse.json({ success: response.ok, data });
}
