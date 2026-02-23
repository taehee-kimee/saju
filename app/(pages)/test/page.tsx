'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MbtiTest from '@/components/MbtiTest';
import { MbtiType } from '@/types';

export default function TestPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'direct' | 'test'>('choose');
  const [directInput, setDirectInput] = useState('');

  const handleMbtiComplete = (mbti: MbtiType) => {
    sessionStorage.setItem('mbti', mbti);
    router.push('/saju');
  };

  if (mode === 'choose') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-2">MBTI 입력</h1>
        <p className="text-gray-500 mb-8">MBTI를 알고 있나요?</p>
        <div className="space-y-4 w-full max-w-xs">
          <button
            onClick={() => setMode('direct')}
            className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold"
          >
            네, 알아요 (직접 입력)
          </button>
          <button
            onClick={() => setMode('test')}
            className="w-full p-4 border-2 border-orange-400 text-orange-400 rounded-xl font-bold"
          >
            모르겠어요 (테스트 하기)
          </button>
        </div>
      </main>
    );
  }

  if (mode === 'direct') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-8">MBTI 입력</h1>
        <input
          type="text"
          placeholder="예: INFP"
          maxLength={4}
          value={directInput}
          onChange={(e) => setDirectInput(e.target.value.toUpperCase())}
          className="w-full max-w-xs p-4 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold uppercase"
        />
        <button
          onClick={() => handleMbtiComplete(directInput as MbtiType)}
          disabled={directInput.length !== 4}
          className="mt-6 px-8 py-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50"
        >
          다음 →
        </button>
      </main>
    );
  }

  return <MbtiTest onComplete={handleMbtiComplete} />;
}
