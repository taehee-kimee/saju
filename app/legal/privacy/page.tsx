export const metadata = {
  title: '개인정보처리방침 | 냥세',
  description: '냥세(猫世) 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-gray-900">
      <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-sm text-gray-500">마지막 업데이트: 2026-02-24</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. 수집 항목</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>필수: MBTI, 생년월일/시간 (사주 계산용)</li>
          <li>자동 수집: 서비스 이용 로그(비식별 통계), 브라우저 정보</li>
          <li>결제 시: 결제 식별자(토스페이먼츠), 거래 내역</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. 이용 목적</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>운세/성향 리포트 제공을 위한 계산 및 개인화</li>
          <li>결제 처리 및 고객 문의 대응</li>
          <li>서비스 품질 개선을 위한 통계 분석</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. 보유 및 파기</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>세션 스토리지 기반 데이터는 브라우저 세션 종료 시 소멸</li>
          <li>법정 보관이 필요한 결제 내역은 관련 법령에 따라 보관</li>
          <li>불필요한 정보는 지체 없이 안전하게 파기</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. 제3자 제공</h2>
        <p className="text-gray-600">
          법령상 요구되거나 이용자 동의가 있는 경우를 제외하고 제3자에게 제공하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. 처리위탁</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>결제: 토스페이먼츠</li>
          <li>호스팅/인프라: Vercel 등 클라우드 서비스</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. 이용자 권리</h2>
        <p className="text-gray-600">
          이용자는 자신의 개인정보에 대해 열람·정정·삭제를 요청할 수 있으며, 고객 문의를 통해 접수 가능합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. 문의처</h2>
        <p className="text-gray-600">
          문의: <a href="mailto:hello@nyangsae.app" className="text-primary">hello@nyangsae.app</a>
        </p>
      </section>
    </main>
  );
}
