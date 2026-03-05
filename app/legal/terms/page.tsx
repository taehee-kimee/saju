export const metadata = {
  title: '이용약관 | 냥세',
  description: '냥세(猫世) 이용약관',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-gray-900">
      <h1 className="text-3xl font-bold mb-2">이용약관</h1>
      <p className="text-sm text-gray-500">마지막 업데이트: 2026-02-24</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. 서비스</h2>
        <p className="text-gray-600">
          냥세는 MBTI와 사주 정보를 기반으로 한 고양이 캐릭터 운세/성향 리포트를 제공합니다. 제공되는 정보는 참고용이며 법적·의학적·재정적 자문이 아닙니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. 계정 및 이용</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>이용자는 정확한 정보를 입력해야 합니다.</li>
          <li>서비스 내 결제 시, 결제 수단의 적법한 사용 권한이 있어야 합니다.</li>
          <li>부정 사용, 서비스 방해 행위가 확인되면 이용이 제한될 수 있습니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. 결제 및 환불</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>유료 리포트는 결제 완료 후 즉시 제공됩니다.</li>
          <li>디지털 콘텐츠 특성상 사용 후 환불이 제한될 수 있습니다.</li>
          <li>오류·중복 결제 등은 고객 문의를 통해 확인 후 처리합니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. 면책</h2>
        <p className="text-gray-600">
          제공되는 정보는 참고용이며, 해석·판단·행동의 책임은 이용자에게 있습니다. 서비스 중단, 데이터 손실 등 불가항력적 사유에 대해서는 책임이 제한됩니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. 콘텐츠 및 지식재산권</h2>
        <p className="text-gray-600">
          서비스 내 텍스트, 이미지, UI 등은 회사 또는 정당한 권리자에게 귀속됩니다. 무단 복제·배포를 금합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. 변경</h2>
        <p className="text-gray-600">
          약관은 필요 시 변경될 수 있으며, 변경 시 공지 후 적용됩니다. 변경 이후 계속 이용 시, 변경된 약관에 동의한 것으로 간주됩니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. 문의</h2>
        <p className="text-gray-600">
          문의: <a href="mailto:hello@nyangsae.app" className="text-primary">hello@nyangsae.app</a>
        </p>
      </section>
    </main>
  );
}
