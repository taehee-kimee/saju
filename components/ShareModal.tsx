'use client';

import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Character, MbtiType, SajuResult } from '@/types';

interface Props {
  character: Character;
  saju: SajuResult;
  mbti: MbtiType;
  onClose: () => void;
}

export default function ShareModal({ character, saju, mbti, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [imgGenerating, setImgGenerating] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  // 뒷배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // blob URL 정리
  useEffect(() => {
    return () => { if (imgUrl) URL.revokeObjectURL(imgUrl); };
  }, [imgUrl]);

  const getOrGenerateImg = async (): Promise<string | null> => {
    if (imgUrl) return imgUrl;
    if (!cardRef.current) return null;
    setImgGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const url = URL.createObjectURL(blob);
      setImgUrl(url);
      return url;
    } catch {
      return null;
    } finally {
      setImgGenerating(false);
    }
  };

  const handleSaveImage = async () => {
    const url = await getOrGenerateImg();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `냥세_${character.name}.png`;
    a.click();
  };

  const handleSnsShare = async () => {
    const shareData = {
      title: `냥세 - 나는 ${character.name}!`,
      text: `MBTI ${mbti}와 사주로 찾은 나의 운세: ${character.name}\n"${character.tagline}"`,
      url: 'https://nyang.bio',
    };

    if (navigator.share) {
      try {
        // 이미지 파일 첨부 시도 (지원 시)
        const url = await getOrGenerateImg();
        if (url && navigator.canShare) {
          const blob = await (await fetch(url)).blob();
          const file = new File([blob], `냥세_${character.name}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ ...shareData, files: [file] });
            return;
          }
        }
        await navigator.share(shareData);
      } catch {
        // 취소 또는 실패 — 무시
      }
    } else {
      // 데스크탑 폴백: 링크 복사
      await handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://nyang.bio');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 바텀시트 */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl px-6 pt-5 pb-10 animate-slide-up">
        {/* 핸들 */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <h2 className="text-lg font-bold text-center mb-5">공유하기</h2>

        {/* 카드 미리보기 */}
        <div
          ref={cardRef}
          className="w-64 mx-auto bg-gradient-to-b from-orange-50 to-white rounded-3xl p-6 text-center shadow-md mb-6"
        >
          <p className="text-xs text-gray-400 font-bold mb-2">냥세(猫世)</p>
          <div className="text-7xl mb-2">{character.emoji}</div>
          <h3 className="text-xl font-bold">{character.name}</h3>
          <p className="text-gray-500 text-xs mt-1">
            {mbti} · {saju.dominantOhaeng}기운
          </p>
          <p className="text-orange-500 text-sm font-medium mt-3 px-2 leading-snug">
            &ldquo;{character.tagline}&rdquo;
          </p>
          <div className="mt-4 pt-3 border-t border-orange-100">
            <p className="text-xs text-gray-400">nyang.bio</p>
          </div>
        </div>

        {/* 공유 옵션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleSnsShare}
            className="w-full p-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
          >
            📲 SNS 공유하기
          </button>

          <button
            onClick={handleSaveImage}
            disabled={imgGenerating}
            className="w-full p-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-60"
          >
            {imgGenerating ? '이미지 생성 중...' : '🖼️ 이미지 저장하기'}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full p-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            {copied ? '✅ 복사됐어요!' : '🔗 링크 복사하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
