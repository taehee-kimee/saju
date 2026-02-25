'use client';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CatCharacter, SajuResult, MbtiType } from '@/types';

interface Props {
  cat: CatCharacter;
  saju: SajuResult;
  mbti: MbtiType;
}

export default function ShareCard({ cat, saju, mbti }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `냥세_${cat.name}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    const shareData = {
      title: `냥세 - 나는 ${cat.name}!`,
      text: `MBTI ${mbti}와 사주로 찾은 나의 운세 고양이: ${cat.name}\n"${cat.tagline}"`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard copy failed', err);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        ref={cardRef}
        className="w-72 mx-auto bg-gradient-to-b from-orange-50 to-white rounded-3xl p-6 text-center shadow-lg"
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

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleShare}
          className="flex-1 p-3 bg-orange-400 text-white rounded-xl text-sm font-medium"
        >
          {copied ? '복사됨! ✅' : '공유하기 🔗'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 p-3 bg-gray-800 text-white rounded-xl text-sm font-medium"
        >
          이미지 저장 📥
        </button>
      </div>
    </div>
  );
}
