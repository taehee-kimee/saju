'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MbtiTest from '@/components/MbtiTest';
import { MbtiType } from '@/types';

const VALID_MBTI = [
  'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP',
];

export default function TestPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'direct' | 'test'>('choose');
  const [directInput, setDirectInput] = useState('');
  const [error, setError] = useState('');

  const handleMbtiComplete = (mbti: MbtiType) => {
    sessionStorage.setItem('mbti', mbti);
    router.push('/saju');
  };

  const handleDirectSubmit = () => {
    const upper = directInput.toUpperCase();
    if (!VALID_MBTI.includes(upper)) {
      setError('올바른 MBTI 유형을 입력해주세요 (예: INFP)');
      return;
    }
    handleMbtiComplete(upper as MbtiType);
  };

  if (mode === 'choose') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white">
        <div className="text-6xl mb-6">🐱</div>
        <h1 className="text-2xl font-bold mb-2">MBTI를 알고 있나요?</h1>
        <p className="text-gray-500 mb-8">고양이 운명을 찾기 위한 첫 단계!</p>
        <div className="space-y-4 w-full max-w-xs">
          <button
            onClick={() => setMode('direct')}
            className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold hover:bg-orange-500 transition-colors"
          >
            네, 알아요! (직접 입력)
          </button>
          <button
            onClick={() => setMode('test')}
            className="w-full p-4 border-2 border-orange-400 text-orange-500 rounded-xl font-bold hover:bg-orange-50 transition-colors"
          >
            모르겠어요 (간단 테스트)
          </button>
        </div>
      </main>
    );
  }

  if (mode === 'direct') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white">
        <div className="text-6xl mb-6">✍️</div>
        <h1 className="text-2xl font-bold mb-8">MBTI 직접 입력</h1>
        <input
          type="text"
          placeholder="예: INFP"
          maxLength={4}
          value={directInput}
          onChange={e => { setDirectInput(e.target.value.toUpperCase()); setError(''); }}
          className="w-full max-w-xs p-4 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold uppercase focus:border-orange-400 focus:outline-none"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          onClick={handleDirectSubmit}
          disabled={directInput.length !== 4}
          className="mt-6 px-8 py-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-orange-500 transition-colors"
        >
          다음 →
        </button>
        <button
          onClick={() => setMode('choose')}
          className="mt-3 text-gray-400 text-sm hover:text-gray-600"
        >
          ← 돌아가기
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-12">
      <MbtiTest onComplete={handleMbtiComplete} />
    </main>
  );
}
