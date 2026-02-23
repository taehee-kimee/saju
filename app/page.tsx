import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white">
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-4">🐱</div>
        <h1 className="text-4xl font-bold mb-2">냥세</h1>
        <p className="text-gray-500 mb-2">猫世 · 고양이 운명 분석</p>
        <p className="text-gray-600 mt-4 mb-8 leading-relaxed">
          MBTI와 사주팔자로 알아보는
          <br />
          나의 운명 고양이
        </p>
        <div className="flex gap-3 text-sm text-gray-400 justify-center mb-8">
          <span>🌿 오행 분석</span>
          <span>·</span>
          <span>✨ MBTI 매핑</span>
          <span>·</span>
          <span>🐱 20종 캐릭터</span>
        </div>
        <Link
          href="/test"
          className="block w-full p-4 bg-orange-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-500 transition-colors"
        >
          내 고양이 찾기 →
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          기본 결과 무료 · 상세 리포트 990원
        </p>
      </div>
    </main>
  );
}
