'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

const SECTION_LABELS = [
  { emoji: '🐱', label: '캐릭터' },
  { emoji: '🧭', label: '오행 에너지' },
  { emoji: '🐾', label: '냥세 진단' },
  { emoji: '🧭', label: '오행 밸런스' },
  { emoji: '🧩', label: '사주×MBTI' },
  { emoji: '🔄', label: '반복 패턴' },
  { emoji: '🚨', label: '과부하 신호' },
];

type CommandType = 'next-section' | 'prev-section' | 'goto-section' | 'scroll-up' | 'scroll-down';

export default function RemoteControlPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [roomValid, setRoomValid] = useState<boolean | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [lastSent, setLastSent] = useState<string | null>(null);

  // Check if room exists
  useEffect(() => {
    const checkRoom = async () => {
      try {
        const res = await fetch(`/api/remote/room?roomId=${encodeURIComponent(roomId)}`);
        if (res.ok) {
          const data = (await res.json()) as { exists: boolean };
          setRoomValid(data.exists);
        } else {
          setRoomValid(false);
        }
      } catch {
        setRoomValid(false);
      }
    };
    void checkRoom();
  }, [roomId]);

  const sendCommand = useCallback(
    async (type: CommandType, sectionIndex?: number) => {
      try {
        const body: { roomId: string; type: string; sectionIndex?: number } = { roomId, type };
        if (sectionIndex !== undefined) body.sectionIndex = sectionIndex;

        await fetch('/api/remote/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        setLastSent(type === 'goto-section' ? `${SECTION_LABELS[sectionIndex!]?.label}` : type);
        setTimeout(() => setLastSent(null), 800);
      } catch {
        // Silently fail
      }
    },
    [roomId]
  );

  const handlePrev = useCallback(() => {
    setCurrentSection((prev) => {
      const next = Math.max(prev - 1, 0);
      void sendCommand('goto-section', next);
      return next;
    });
  }, [sendCommand]);

  const handleNext = useCallback(() => {
    setCurrentSection((prev) => {
      const next = Math.min(prev + 1, SECTION_LABELS.length - 1);
      void sendCommand('goto-section', next);
      return next;
    });
  }, [sendCommand]);

  if (roomValid === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📡</div>
          <p className="text-gray-400">연결 중...</p>
        </div>
      </main>
    );
  }

  if (!roomValid) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6">
        <div className="text-5xl mb-4">😿</div>
        <p className="text-gray-400 text-lg mb-2">방을 찾을 수 없어요</p>
        <p className="text-gray-600 text-sm">코드: {roomId}</p>
        <p className="text-gray-600 text-sm mt-4">
          TV 화면에서 새로운 TV 모드를 시작해 주세요
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 font-bold text-sm">리모컨</span>
            <span className="bg-gray-800 px-2 py-0.5 rounded font-mono text-sm text-orange-300">
              {roomId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-400 text-xs">연결됨</span>
          </div>
        </div>
      </div>

      {/* Current section display */}
      <div className="px-4 py-6 text-center">
        <div className="text-4xl mb-2">{SECTION_LABELS[currentSection].emoji}</div>
        <p className="text-gray-400 text-sm">현재 섹션</p>
        <p className="text-white text-lg font-bold">{SECTION_LABELS[currentSection].label}</p>
      </div>

      {/* Section quick-jump */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {SECTION_LABELS.map((section, i) => (
            <button
              key={section.label}
              onClick={() => {
                setCurrentSection(i);
                void sendCommand('goto-section', i);
              }}
              className={`flex flex-col items-center p-2 rounded-xl transition-all text-xs ${
                i === currentSection
                  ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300'
                  : 'bg-gray-900 border border-gray-800 text-gray-500 active:bg-gray-800'
              }`}
            >
              <span className="text-lg">{section.emoji}</span>
              <span className="mt-1 truncate w-full text-center">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex-1 px-4 pb-6 flex flex-col justify-end gap-3">
        {/* Feedback */}
        <div className="text-center h-6">
          {lastSent && (
            <span className="text-orange-400 text-sm animate-pulse">
              {lastSent}
            </span>
          )}
        </div>

        {/* Scroll buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => void sendCommand('scroll-up')}
            className="bg-gray-800 border border-gray-700 rounded-2xl py-4 text-gray-300 text-lg font-medium active:bg-gray-700 transition-colors"
          >
            scroll up
          </button>
          <button
            onClick={() => void sendCommand('scroll-down')}
            className="bg-gray-800 border border-gray-700 rounded-2xl py-4 text-gray-300 text-lg font-medium active:bg-gray-700 transition-colors"
          >
            scroll down
          </button>
        </div>

        {/* Prev / Next section buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentSection === 0}
            className="bg-gray-900 border-2 border-orange-500/30 rounded-2xl py-5 text-orange-300 text-xl font-bold active:bg-orange-500/10 transition-colors disabled:opacity-30 disabled:active:bg-gray-900"
          >
            ◀ 이전
          </button>
          <button
            onClick={handleNext}
            disabled={currentSection === SECTION_LABELS.length - 1}
            className="bg-gray-900 border-2 border-orange-500/30 rounded-2xl py-5 text-orange-300 text-xl font-bold active:bg-orange-500/10 transition-colors disabled:opacity-30 disabled:active:bg-gray-900"
          >
            다음 ▶
          </button>
        </div>
      </div>
    </main>
  );
}
