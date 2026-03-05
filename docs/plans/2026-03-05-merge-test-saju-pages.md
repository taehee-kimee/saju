# Merge /test and /saju Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge the `/test` (MBTI) and `/saju` (birth date) pages into a single two-step `/test` page, then delete `/saju`.

**Architecture:** Add a `step: 'mbti' | 'saju'` state to `/test/page.tsx`. When MBTI is complete, transition to the saju step inline. Final submission writes both values to sessionStorage and navigates to `/result`. The `/saju/page.tsx` file is deleted.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, sessionStorage

---

### Task 1: Merge /saju logic into /test/page.tsx

**Files:**
- Modify: `app/(pages)/test/page.tsx`

**Step 1: Read current files for reference**

Open `app/(pages)/test/page.tsx` and `app/(pages)/saju/page.tsx` side by side (both already read in context).

**Step 2: Replace `app/(pages)/test/page.tsx` with merged version**

Replace the entire file content with:

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MbtiTest from '@/components/MbtiTest';
import { isValidMbti } from '@/lib/mbti';
import { MbtiType } from '@/types';

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
          <h1 className="text-2xl font-bold mb-2">MBTI 입력</h1>
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

  // --- Step 2: Saju ---
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
          disabled={!form.year || !form.month || !form.day}
          className="w-full p-4 bg-orange-400 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-orange-500 transition-colors"
        >
          내 고양이 찾기 🐱
        </button>
      </div>
    </main>
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add app/(pages)/test/page.tsx
git commit -m "feat: merge saju step into test page (step 1→2 flow)"
```

---

### Task 2: Delete /saju page

**Files:**
- Delete: `app/(pages)/saju/page.tsx`

**Step 1: Delete the file**

```bash
rm "app/(pages)/saju/page.tsx"
```

**Step 2: Verify the directory is empty and remove it**

```bash
rmdir "app/(pages)/saju"
```

**Step 3: Verify no remaining imports reference /saju**

Run:
```bash
grep -r "from.*saju" app/ components/ lib/ --include="*.ts" --include="*.tsx"
grep -r "href.*saju\|push.*saju\|redirect.*saju" app/ components/ --include="*.ts" --include="*.tsx"
```
Expected: No matches (the old `router.push('/saju')` is now gone)

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete /saju page (merged into /test)"
```

---

### Task 3: Manual smoke test

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test the full flow**

1. Go to `http://localhost:3000`
2. Click "내 고양이 찾기" → should land on `/test`
3. Click "네, 알아요" → type `INFP` → click "다음 →"
4. Should see 생년월일 입력 screen (same URL `/test`)
5. Fill in year/month/day → click "내 고양이 찾기 🐱"
6. Should navigate to `/result`
7. Verify result page works correctly

**Step 3: Test MBTI test flow**

1. Go to `/test`
2. Click "모르겠어요 (테스트 하기)"
3. Complete the MbtiTest component
4. Should transition to 생년월일 입력 step

**Step 4: Verify `/saju` is gone**

Go to `http://localhost:3000/saju` → should get 404
