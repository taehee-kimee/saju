'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HOURS = [
  { value: '12', label: '태어난 시간 모름' },
  ...Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: `${i}시` }))
];

export default function SajuPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    year: '',
    month: '',
    day: '',
    hour: '12',
  });
  const [showHourPicker, setShowHourPicker] = useState(false);

  const handleValueChange = (field: 'year' | 'month' | 'day', value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setForm((prev) => ({ ...prev, [field]: cleanValue }));
  };

  const handleHourSelect = (hour: string) => {
    setForm((prev) => ({ ...prev, hour }));
    setShowHourPicker(false);
  };

  const handleSubmit = () => {
    const payload = {
      year: form.year,
      month: form.month.padStart(2, '0'),
      day: form.day.padStart(2, '0'),
      hour: form.hour,
    };
    sessionStorage.setItem('birthInfo', JSON.stringify(payload));
    router.push('/result');
  };

  const selectedHourLabel = HOURS.find(h => h.value === form.hour)?.label || '태어난 시간 모름';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-2">생년월일 입력</h1>
      <p className="text-gray-500 text-sm mb-8">사주 계산에 사용됩니다</p>
      <div className="space-y-4 w-full max-w-xs">
        <input
          type="text"
          inputMode="numeric"
          placeholder="출생 연도 (예: 1995)"
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
        
        {/* 커스텀 시간 선택 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHourPicker(!showHourPicker)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-left bg-white focus:border-orange-400 focus:outline-none"
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

        <button
          onClick={handleSubmit}
          disabled={!form.year || !form.month || !form.day}
          className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-orange-500 transition-colors"
        >
          내 고양이 찾기 🐱
        </button>
      </div>
    </main>
  );
}
