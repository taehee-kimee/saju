'use client';
import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { CatCharacter, SajuResult, MbtiType } from '@/types';

interface Props {
  cat: CatCharacter;
  saju: SajuResult;
  mbti: MbtiType;
}

export default function ShareCard({ cat, saju, mbti }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `냥세_${cat.name}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div>
      <div
        ref={cardRef}
        className="w-72 bg-gradient-to-b from-orange-50 to-white rounded-3xl p-6 text-center shadow-lg"
      >
        <p className="text-xs text-orange-400 font-bold mb-3">냥세(猫世)</p>
        <div className="text-7xl mb-3">{cat.emoji}</div>
        <h2 className="text-2xl font-bold">{cat.name}</h2>
        <p className="text-gray-500 text-sm mt-1">
          {mbti} · {saju.dominantOhaeng}기운
        </p>
        <p className="text-orange-500 text-sm font-medium mt-3 px-2">
          &ldquo;{cat.tagline}&rdquo;
        </p>
        <div className="mt-4 pt-4 border-t border-orange-100">
          <p className="text-xs text-gray-400">nyangsae.com</p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 w-full p-3 bg-gray-800 text-white rounded-xl text-sm"
      >
        이미지 저장 📥
      </button>
    </div>
  );
}
