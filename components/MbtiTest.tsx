'use client';
import { useState } from 'react';
import { getMbtiFromAnswers } from '@/lib/mbti';
import { MbtiType } from '@/types';

const QUESTIONS = [
  { text: '새로운 사람들과 함께 있으면?', options: ['에너지가 충전된다', '에너지가 소모된다'] },
  { text: '주말에 더 하고 싶은 것은?', options: ['친구들과 약속', '혼자 여유롭게'] },
  { text: '나는 주로?', options: ['먼저 말을 건다', '말 걸어오길 기다린다'] },
  { text: '정보를 받아들일 때?', options: ['사실과 세부사항 중심', '가능성과 의미 중심'] },
  { text: '나는 더 잘하는 것이?', options: ['현재에 집중하기', '미래를 상상하기'] },
  { text: '선호하는 것은?', options: ['검증된 방법', '새로운 시도'] },
  { text: '결정할 때 더 중요한 것은?', options: ['논리와 객관성', '감정과 가치관'] },
  { text: '친구가 고민을 털어놓을 때?', options: ['해결책을 제시한다', '공감해준다'] },
  { text: '갈등 상황에서 나는?', options: ['옳고 그름을 따진다', '서로의 감정을 먼저 본다'] },
  { text: '계획에 대해?', options: ['미리 세우고 따른다', '상황에 따라 유연하게'] },
  { text: '마감이 있을 때?', options: ['미리미리 끝낸다', '마감 직전에 몰아서 한다'] },
  { text: '나의 공간은?', options: ['정돈되어 있다', '약간 어질러져 있다'] },
];

interface Props {
  onComplete: (mbti: MbtiType) => void;
}

export default function MbtiTest({ onComplete }: Props) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  const handleAnswer = (answer: number) => {
    const newAnswers = [...answers, answer];
    if (newAnswers.length === 12) {
      onComplete(getMbtiFromAnswers(newAnswers));
    } else {
      setAnswers(newAnswers);
      setCurrent(current + 1);
    }
  };

  const q = QUESTIONS[current];
  const progress = ((current + 1) / 12) * 100;

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">{current + 1} / 12</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-8 text-center">{q.text}</h2>
      <div className="space-y-4">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
