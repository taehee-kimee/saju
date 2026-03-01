'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateSaju } from '@/lib/saju';
import { isValidMbti } from '@/lib/mbti';
import { createCharacterId } from '@/lib/catMapper';
import OhaengBar from '@/components/OhaengBar';
import { Character, SajuResult } from '@/types';
import { RemoteCommand } from '@/lib/remoteStore';

const SECTION_IDS = [
  'section-header',
  'section-ohaeng',
  'section-diagnosis',
  'section-ohaengMap',
  'section-combination',
  'section-pattern',
  'section-timingSense',
];

const SECTION_LABELS = [
  '캐릭터',
  '오행 에너지',
  '냥세 진단',
  '오행 밸런스',
  '사주×MBTI',
  '반복 패턴',
  '과부하 신호',
];

const FREE_SECTION_CONFIG = [
  { key: 'diagnosis' as const, title: '🐾 냥세 한 줄 진단' },
  { key: 'ohaengMap' as const, title: '🧭 오행 밸런스 지도' },
  { key: 'combination' as const, title: '🧩 사주×MBTI 결합 해석' },
  { key: 'pattern' as const, title: '🔄 반복 패턴 분석' },
  { key: 'timingSense' as const, title: '🚨 과부하 신호 가이드' },
];

interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number | 'unknown';
}

function parseBirthInfo(raw: string): BirthInfo | null {
  try {
    const parsed = JSON.parse(raw) as {
      year?: string;
      month?: string;
      day?: string;
      hour?: string;
    };
    const year = Number(parsed.year);
    const month = Number(parsed.month);
    const day = Number(parsed.day);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    if (parsed.hour === 'unknown') return { year, month, day, hour: 'unknown' };
    const hour = Number(parsed.hour);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
    return { year, month, day, hour };
  } catch {
    return null;
  }
}

async function fetchCharacter(characterId: string): Promise<Character> {
  const response = await fetch(`/api/character-content?id=${encodeURIComponent(characterId)}`);
  if (!response.ok) throw new Error('character_not_found');
  return (await response.json()) as Character;
}

export default function DisplayPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [connected, setConnected] = useState(false);

  const lastPollTime = useRef(0);

  useEffect(() => {
    lastPollTime.current = Date.now();
  }, []);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const scrollToSection = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, SECTION_IDS.length - 1));
    setCurrentSection(clamped);
    const el = sectionRefs.current[clamped];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Load character data
  useEffect(() => {
    const loadResult = async () => {
      const storedMbti = sessionStorage.getItem('mbti');
      const birthRaw = sessionStorage.getItem('birthInfo');

      if (!storedMbti || !isValidMbti(storedMbti) || !birthRaw) {
        setError('결과 데이터가 없습니다. 먼저 테스트를 완료해 주세요.');
        setLoading(false);
        return;
      }

      const birth = parseBirthInfo(birthRaw);
      if (!birth) {
        setError('생년월일 정보가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      try {
        const hourValue = birth.hour === 'unknown' ? 12 : birth.hour;
        const sajuResult = calculateSaju(birth.year, birth.month, birth.day, hourValue);
        const characterId = createCharacterId(storedMbti, sajuResult.dominantOhaeng);
        const characterData = await fetchCharacter(characterId);

        setCharacter(characterData);
        setSaju(sajuResult);
        setLoading(false);
      } catch {
        setError('캐릭터 데이터를 불러오지 못했습니다.');
        setLoading(false);
      }
    };

    void loadResult();
  }, []);

  // Poll for commands
  useEffect(() => {
    if (loading || error) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/remote/command?roomId=${encodeURIComponent(roomId)}&since=${lastPollTime.current}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { commands: RemoteCommand[]; serverTime: number };
        lastPollTime.current = data.serverTime;

        if (data.commands.length > 0) {
          setConnected(true);
        }

        for (const cmd of data.commands) {
          switch (cmd.type) {
            case 'next-section':
              setCurrentSection((prev) => {
                const next = Math.min(prev + 1, SECTION_IDS.length - 1);
                const el = sectionRefs.current[next];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return next;
              });
              break;
            case 'prev-section':
              setCurrentSection((prev) => {
                const next = Math.max(prev - 1, 0);
                const el = sectionRefs.current[next];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return next;
              });
              break;
            case 'goto-section':
              if (cmd.sectionIndex !== undefined) {
                scrollToSection(cmd.sectionIndex);
              }
              break;
            case 'scroll-up':
              window.scrollBy({ top: -300, behavior: 'smooth' });
              break;
            case 'scroll-down':
              window.scrollBy({ top: 300, behavior: 'smooth' });
              break;
          }
        }
      } catch {
        // Silently retry on next poll
      }
    };

    const interval = setInterval(poll, 500);
    return () => clearInterval(interval);
  }, [loading, error, roomId, scrollToSection]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🔮</div>
          <p className="text-gray-400 text-xl">디스플레이 모드 준비 중...</p>
        </div>
      </main>
    );
  }

  if (error || !character || !saju) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-8">
        <div className="text-6xl mb-6">🙀</div>
        <p className="text-gray-400 text-xl mb-8">{error || '결과를 찾을 수 없습니다.'}</p>
        <button
          onClick={() => router.replace('/test')}
          className="px-8 py-4 bg-orange-500 text-white rounded-2xl text-lg font-bold"
        >
          테스트하러 가기
        </button>
      </main>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const remoteUrl = `${baseUrl}/remote/${roomId}`;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Room info bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-orange-400 font-bold text-sm">TV 모드</span>
            <span className="bg-gray-800 px-3 py-1 rounded-lg font-mono text-lg tracking-widest text-orange-300">
              {roomId}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              리모컨: <span className="text-orange-300 font-mono">{remoteUrl}</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-600'}`} />
          </div>
        </div>
      </div>

      {/* Section indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        {SECTION_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => scrollToSection(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentSection
                ? 'bg-orange-400 scale-125'
                : 'bg-gray-700 hover:bg-gray-500'
            }`}
            title={label}
          />
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-16 space-y-16">
        {/* Character header */}
        <section
          ref={(el) => { sectionRefs.current[0] = el; }}
          id={SECTION_IDS[0]}
          className="text-center py-16"
        >
          <div className="text-[10rem] mb-6">{character.emoji}</div>
          <h1 className="text-5xl font-bold mb-3">{character.name}</h1>
          <p className="text-orange-400 text-2xl font-medium">
            &ldquo;{character.tagline}&rdquo;
          </p>
        </section>

        {/* Ohaeng bar */}
        <section
          ref={(el) => { sectionRefs.current[1] = el; }}
          id={SECTION_IDS[1]}
          className="py-8"
        >
          <h2 className="text-3xl font-bold text-orange-400 mb-8 text-center">
            🧭 나의 오행 에너지
          </h2>
          <div className="bg-gray-900 rounded-3xl p-8">
            <OhaengBar ohaeng={saju.ohaeng} dominant={saju.dominantOhaeng} />
            <div className="mt-6 bg-gray-800 rounded-2xl p-6">
              <p className="text-lg text-gray-300">
                <span className="font-bold text-orange-400">{saju.dominantOhaeng}의 기운</span>이 가장 강합니다.
                {saju.dominantOhaeng === '木' && ' 성장과 확장의 에너지가 넘치는 해입니다.'}
                {saju.dominantOhaeng === '火' && ' 열정과 활력이 넘치는 해입니다.'}
                {saju.dominantOhaeng === '土' && ' 안정과 포용력이 돋보이는 해입니다.'}
                {saju.dominantOhaeng === '金' && ' 정돈과 완성의 에너지가 강한 해입니다.'}
                {saju.dominantOhaeng === '水' && ' 유연함과 지혜가 넘치는 해입니다.'}
              </p>
            </div>
          </div>
        </section>

        {/* Free sections */}
        {FREE_SECTION_CONFIG.map((config, i) => (
          <section
            key={config.key}
            ref={(el) => { sectionRefs.current[i + 2] = el; }}
            id={SECTION_IDS[i + 2]}
            className="py-8"
          >
            <h2 className="text-3xl font-bold text-orange-400 mb-6">{config.title}</h2>
            <div className="bg-gray-900 rounded-3xl p-8">
              <p className="text-orange-300 font-bold text-xl mb-4">
                {character.subtitles[config.key]}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                {character.sections[config.key]}
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
