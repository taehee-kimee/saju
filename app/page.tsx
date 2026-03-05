import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pb-48 text-center gap-6">
        <div className="space-y-2">
          <h1 className="text-orange-950 text-3xl font-light tracking-tight font-title">나는 어떤 고양이일까?</h1>
          <p className="text-orange-800 text-lg font-medium leading-relaxed px-4">
            MBTI와 사주팔자로 알아보는<br />
            나의 운세 고양이, <span className="text-primary font-bold">냥세</span>
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8 pt-4 flex flex-col items-center gap-4">
        {/* Feature Pills */}
        <div className="flex justify-between w-full px-4">
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary text-2xl">flare</span>
            <span className="text-orange-800 text-xs font-medium">오행 분석</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary text-2xl">psychology_alt</span>
            <span className="text-orange-800 text-xs font-medium">MBTI 매핑</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary text-2xl">pets</span>
            <span className="text-orange-800 text-xs font-medium">80종 캐릭터</span>
          </div>
        </div>
        <Link
          href="/test"
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 text-xl transition-all active:scale-95 soft-shadow"
        >
          내 고양이 찾기
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
        <p className="text-orange-400 text-sm">지금까지 124,502명의 집사가 확인했어요</p>
      </div>
    </main>
  );
}
