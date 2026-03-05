'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MbtiTest from '@/components/MbtiTest';
import { isValidMbti } from '@/lib/mbti';
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
    const isValid = isValidMbti(directInput);
    const showError = directInput.length === 4 && !isValid;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-8">MBTI 입력</h1>
        <input
          type="text"
          placeholder="예: INFP"
          maxLength={4}
          value={directInput}
          onChange={(e) => setDirectInput(e.target.value.toUpperCase())}
          className={`w-full max-w-xs p-4 border-2 rounded-xl text-center text-2xl font-bold uppercase transition-colors ${
            showError ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        />
        {showError && (
          <p className="mt-2 text-sm text-red-500">올바른 MBTI 유형이 아니에요 (예: INFP, ENTJ)</p>
        )}
        <button
          onClick={() => handleMbtiComplete(directInput as MbtiType)}
          disabled={!isValid}
          className="mt-6 px-8 py-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50"
        >
          다음 →
        </button>
      </main>
    );
  }

  return <MbtiTest onComplete={handleMbtiComplete} />;
}
