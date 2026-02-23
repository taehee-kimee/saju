'use client';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SajuPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    year: '',
    month: '',
    day: '',
    hour: '12',
  });

  const handleValueChange = (field: 'year' | 'month' | 'day') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '');
      setForm((prev) => ({ ...prev, [field]: value }));
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-2">생년월일 입력</h1>
      <p className="text-gray-500 text-sm mb-8">사주 계산에 사용됩니다</p>
      <div className="space-y-4 w-full max-w-xs">
        <input
          type="text"
          inputMode="numeric"
          placeholder="출생 연도 (예: 1995)"
          className="w-full p-4 border-2 border-gray-200 rounded-xl"
          value={form.year}
          onChange={handleValueChange('year')}
        />
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="월"
            className="w-full p-4 border-2 border-gray-200 rounded-xl"
            value={form.month}
            onChange={handleValueChange('month')}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="일"
            className="w-full p-4 border-2 border-gray-200 rounded-xl"
            value={form.day}
            onChange={handleValueChange('day')}
          />
        </div>
        <select
          className="w-full p-4 border-2 border-gray-200 rounded-xl"
          value={form.hour}
          onChange={(e) => setForm({ ...form, hour: e.target.value })}
        >
          <option value="12">태어난 시간 모름</option>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={String(i)}>
              {i}시
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          disabled={!form.year || !form.month || !form.day}
          className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50"
        >
          내 고양이 찾기 🐱
        </button>
      </div>
    </main>
  );
}
