import { NextRequest, NextResponse } from 'next/server';

async function handleReturn(authResultCode: string | null, tid: string | null, amount: string | null, reqUrl: string) {
  const clientKey = process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY ?? '';
  const secretKey = process.env.NICEPAY_SECRET_KEY ?? '';
  // R2_ prefix = 샌드박스 키, R1_ = 운영 키
  const sandbox = clientKey.startsWith('R2_') || process.env.NICEPAY_SANDBOX === 'true';
  const baseUrl = sandbox
    ? 'https://sandbox-api.nicepay.co.kr'
    : 'https://api.nicepay.co.kr';
  const authHeader = 'Basic ' + Buffer.from(`${clientKey}:${secretKey}`).toString('base64');

  console.log('[nicepay/return] authResultCode:', authResultCode, 'tid:', tid, 'amount:', amount, 'sandbox:', sandbox);

  if (authResultCode !== '0000' || !tid || !amount) {
    console.error('[nicepay/return] 인증 실패 또는 파라미터 누락');
    return NextResponse.redirect(new URL('/payment/fail', reqUrl));
  }

  const approveRes = await fetch(`${baseUrl}/v1/payments/${tid}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: Number(amount) }),
  });

  const approveData = (await approveRes.json()) as { resultCode?: string; resultMsg?: string };
  console.log('[nicepay/return] 승인 응답:', approveRes.status, JSON.stringify(approveData));

  if (!approveRes.ok || approveData.resultCode !== '0000') {
    console.error('[nicepay/return] 승인 실패:', approveData.resultMsg);
    const errHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<h2>승인 실패</h2>
<pre>HTTP ${approveRes.status}\n${JSON.stringify(approveData, null, 2)}\nsandbox=${sandbox}\nbaseUrl=${baseUrl}\ntid=${tid}</pre>
</body></html>`;
    return new NextResponse(errHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
  try {
    var target = window.opener || window;
    target.sessionStorage.setItem('nicepayVerified', 'true');
    if (window.opener) {
      window.opener.location.replace('/report?payment=nicepay');
      window.close();
    } else {
      window.location.replace('/report?payment=nicepay');
    }
  } catch(e) {
    window.location.replace('/report?payment=nicepay');
  }
</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// NicePay가 POST로 보내는 경우
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    return handleReturn(
      body.get('authResultCode') as string | null,
      body.get('tid') as string | null,
      body.get('amount') as string | null,
      req.url,
    );
  } catch {
    return NextResponse.redirect(new URL('/payment/fail', req.url));
  }
}

// NicePay가 GET으로 리다이렉트하는 경우
export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    return handleReturn(
      p.get('authResultCode'),
      p.get('tid'),
      p.get('amount'),
      req.url,
    );
  } catch {
    return NextResponse.redirect(new URL('/payment/fail', req.url));
  }
}
