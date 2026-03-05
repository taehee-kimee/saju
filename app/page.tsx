import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-md mx-auto pb-24">
      {/* Hero Section */}
      <section className="flex flex-col items-center px-6 py-12 text-center gap-6">
        <div className="space-y-2">
          <h1 className="text-slate-900 text-3xl font-light tracking-tight font-title">나는 어떤 고양이일까요?</h1>
          <p className="text-slate-600 text-lg font-medium leading-relaxed px-4">
            MBTI와 사주팔자로 알아보는<br />
            나의 운세 고양이, <span className="text-primary font-bold">냥세</span>
          </p>
        </div>

        <Link
          href="/test"
          className="w-full max-w-xs bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 text-xl transition-all active:scale-95 soft-shadow"
        >
          내 고양이 찾기
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>

        <p className="text-slate-400 text-sm">지금까지 124,502명의 집사가 확인했어요</p>
      </section>

      {/* Feature Cards */}
      <section className="px-4 py-8">
        <h3 className="text-slate-800 text-xl font-bold mb-6 px-2">냥세가 특별한 이유 🐾</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-primary/10 soft-shadow">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <span className="material-symbols-outlined text-3xl">flare</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg leading-none mb-1">오행 분석</h4>
              <p className="text-slate-500 text-sm">전통 사주로 풀어보는 당신의 타고난 기운</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-primary/10 soft-shadow">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <span className="material-symbols-outlined text-3xl">psychology_alt</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg leading-none mb-1">MBTI 매핑</h4>
              <p className="text-slate-500 text-sm">성격 유형과 사주를 결합한 정교한 결과</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-primary/10 soft-shadow">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <span className="material-symbols-outlined text-3xl">pets</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg leading-none mb-1">20종 캐릭터</h4>
              <p className="text-slate-500 text-sm">세상에 단 하나뿐인 당신만의 냥이 캐릭터</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Badge */}
      <div className="flex justify-center px-4 pb-4">
        <div className="bg-slate-900/90 backdrop-blur-sm text-white text-center py-2 px-6 rounded-full text-sm font-medium shadow-xl">
          기본 결과 무료 · 풀 리포트 1,900원
        </div>
      </div>
    </main>
  );
}
