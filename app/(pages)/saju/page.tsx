'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SajuPage() {
  const router = useRouter();
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '12' });

  const handleSubmit = () => {
    sessionStorage.setItem('birthInfo', JSON.stringify(form));
    router.push('/result');
  };

  const isValid = form.year && form.month && form.day;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white">
      <div className="text-6xl mb-6">🔮</div>
      <h1 className="text-2xl font-bold mb-2">생년월일 입력</h1>
      <p className="text-gray-500 text-sm mb-8">사주 계산에 사용됩니다</p>
      <div className="space-y-4 w-full max-w-xs">
        <input
          type="number"
          placeholder="출생 연도 (예: 1995)"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
          value={form.year}
          onChange={e => setForm({ ...form, year: e.target.value })}
        />
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="월"
            min="1"
            max="12"
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            value={form.month}
            onChange={e => setForm({ ...form, month: e.target.value })}
          />
          <input
            type="number"
            placeholder="일"
            min="1"
            max="31"
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            value={form.day}
            onChange={e => setForm({ ...form, day: e.target.value })}
          />
        </div>
        <select
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none bg-white"
          value={form.hour}
          onChange={e => setForm({ ...form, hour: e.target.value })}
        >
          <option value="12">태어난 시간 모름</option>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {i}시
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-orange-500 transition-colors text-lg"
        >
          내 고양이 찾기 🐱
        </button>
      </div>
    </main>
  );
}
