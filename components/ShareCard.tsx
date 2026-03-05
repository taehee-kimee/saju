'use client';
import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Character, SajuResult, MbtiType } from '@/types';

interface Props {
  character: Character;
  saju: SajuResult;
  mbti: MbtiType;
}

export default function ShareCard({ character, saju, mbti }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
    const blob = await (await fetch(dataUrl)).blob();
    const objectUrl = URL.createObjectURL(blob);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(objectUrl);
  };

  const handleShare = async () => {
    const shareData = {
      title: `냥세 - 나는 ${character.name}!`,
      text: `MBTI ${mbti}와 사주로 찾은 나의 운세 고양이: ${character.name}\n"${character.tagline}"`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Clipboard copy failed');
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
        <div className="text-7xl mb-3">{character.emoji}</div>
        <h2 className="text-2xl font-bold">{character.name}</h2>
        <p className="text-orange-600 text-sm mt-1">
          {mbti} · {saju.dominantOhaeng}기운
        </p>
        <p className="text-orange-500 text-sm font-medium mt-3 px-2">
          &ldquo;{character.tagline}&rdquo;
        </p>
        <div className="mt-4 pt-4 border-t border-orange-100">
          <p className="text-xs text-orange-400">nyangsae.com</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleShare}
          className="flex-1 p-3 bg-orange-400 text-white rounded-xl text-sm font-medium"
        >
          {copied ? '복사됨! ✅' : '공유하기 🔗'}
        </button>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            download={`냥세_${character.name}.png`}
            className="flex-1 p-3 bg-gray-800 text-white rounded-xl text-sm font-medium text-center"
          >
            이미지 저장 📥
          </a>
        ) : (
          <button
            onClick={handleDownload}
            className="flex-1 p-3 bg-gray-800 text-white rounded-xl text-sm font-medium"
          >
            이미지 생성 📷
          </button>
        )}
      </div>
    </div>
  );
}
