'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MbtiTest from '@/components/MbtiTest';
import { isValidMbti } from '@/lib/mbti';
import { MbtiType } from '@/types';

function StepBar({ current, total, onBack }: { current: number; total: number; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 w-full max-w-xs mx-auto mb-8">
      {onBack ? (
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</button>
      ) : (
        <div className="w-6" />
      )}
      <div className="flex-1 flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? 'bg-orange-400' : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{current}/{total}</span>
    </div>
  );
}

const HOURS = [
  { value: 'unknown', label: '태어난 시간 모름' },
  ...Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: `${i}시` }))
];

export default function TestPage() {
  const router = useRouter();

  // Step 1: MBTI
  const [step, setStep] = useState<'mbti' | 'saju'>('mbti');
  const [mbtiMode, setMbtiMode] = useState<'choose' | 'direct' | 'test'>('choose');
  const [directInput, setDirectInput] = useState('');
  const [mbti, setMbti] = useState<MbtiType | null>(null);

  // Step 2: Saju
  const [form, setForm] = useState({
    year: '',
    month: '',
    day: '',
    hour: 'unknown',
    gender: 'unknown',
  });
  const [showHourPicker, setShowHourPicker] = useState(false);

  // --- MBTI handlers ---
  const handleMbtiComplete = (value: MbtiType) => {
    setMbti(value);
    setStep('saju');
  };

  // --- Saju handlers ---
  const handleValueChange = (field: 'year' | 'month' | 'day', value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setForm((prev) => ({ ...prev, [field]: cleanValue }));
  };

  const handleHourSelect = (hour: string) => {
    setForm((prev) => ({ ...prev, hour }));
    setShowHourPicker(false);
  };

  const handleSubmit = () => {
    sessionStorage.setItem('mbti', mbti!);
    sessionStorage.setItem('birthInfo', JSON.stringify({
      year: form.year,
      month: form.month.padStart(2, '0'),
      day: form.day.padStart(2, '0'),
      hour: form.hour,
      gender: form.gender,
    }));
    router.push('/result');
  };

  // --- Step 1: MBTI ---
  if (step === 'mbti') {
    if (mbtiMode === 'choose') {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
          <StepBar current={1} total={2} />
          <h1 className="text-2xl font-light mb-2 font-title">MBTI 입력</h1>
          <p className="text-gray-500 mb-8">MBTI를 알고 있나요?</p>
          <div className="space-y-4 w-full max-w-xs">
            <button
              onClick={() => setMbtiMode('direct')}
              className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold"
            >
              네, 알아요 (직접 입력)
            </button>
            <button
              onClick={() => setMbtiMode('test')}
              className="w-full p-4 border-2 border-orange-400 text-orange-400 rounded-xl font-bold"
            >
              모르겠어요 (테스트 하기)
            </button>
          </div>
        </main>
      );
    }

    if (mbtiMode === 'direct') {
      const isValid = isValidMbti(directInput);
      const showError = directInput.length === 4 && !isValid;

      return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
          <StepBar current={1} total={2} onBack={() => setMbtiMode('choose')} />
          <h1 className="text-2xl font-light mb-8 font-title">MBTI 입력</h1>
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

    return (
      <main className="min-h-screen flex flex-col p-6">
        <StepBar current={1} total={2} onBack={() => setMbtiMode('choose')} />
        <MbtiTest onComplete={handleMbtiComplete} />
      </main>
    );
  }

  // --- Step 2: Saju ---
  const selectedHourLabel = HOURS.find(h => h.value === form.hour)?.label || '태어난 시간 모름';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <StepBar current={2} total={2} onBack={() => setStep('mbti')} />
      <h1 className="text-2xl font-light mb-2 font-title">생년월일 입력</h1>
      <p className="text-gray-500 text-sm mb-8">사주 계산에 사용됩니다</p>
      <div className="space-y-4 w-full max-w-xs">
        <input
          type="text"
          inputMode="numeric"
          placeholder="출생 연도 (예: 1995)"
          maxLength={4}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
          value={form.year}
          onChange={(e) => handleValueChange('year', e.target.value)}
        />
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="월"
            maxLength={2}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            value={form.month}
            onChange={(e) => handleValueChange('month', e.target.value)}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="일"
            maxLength={2}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            value={form.day}
            onChange={(e) => handleValueChange('day', e.target.value)}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHourPicker(!showHourPicker)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-left focus:border-orange-400 focus:outline-none"
          >
            {selectedHourLabel}
          </button>
          {showHourPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50">
              {HOURS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => handleHourSelect(h.value)}
                  className={`w-full p-4 text-left hover:bg-orange-50 transition-colors ${
                    form.hour === h.value ? 'bg-orange-100 text-orange-600 font-medium' : ''
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">성별 (대운 분석에 사용)</p>
          <div className="flex gap-2">
            {[
              { value: 'male', label: '남자' },
              { value: 'female', label: '여자' },
              { value: 'unknown', label: '선택 안 함' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, gender: opt.value }))}
                className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  form.gender === opt.value
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-orange-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.year || !form.month || !form.day || !mbti}
          className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-orange-500 transition-colors"
        >
          내 고양이 찾기 🐱
        </button>
      </div>
    </main>
  );
}
