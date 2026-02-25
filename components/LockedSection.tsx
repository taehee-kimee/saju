'use client';

interface LockedSectionProps {
  title: string;
  emoji: string;
  teaserText: string;
  onUnlock: () => void;
}

export default function LockedSection({ title, emoji, teaserText, onUnlock }: LockedSectionProps) {
  return (
    <div className="relative bg-gray-100 rounded-2xl p-5 overflow-hidden">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10 flex flex-col items-center justify-center">
        <span className="text-3xl mb-2">{emoji}</span>
        <p className="text-gray-600 text-sm text-center mb-3 px-4">{teaserText}</p>
        <button
          onClick={onUnlock}
          className="px-4 py-2 bg-orange-400 text-white rounded-full text-sm font-medium hover:bg-orange-500 transition-colors"
        >
          잠금 해제
        </button>
      </div>
      
      {/* Blurred content preview */}
      <div className="blur-sm opacity-50">
        <h3 className="font-bold text-gray-400 mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed h-20">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
        </p>
      </div>
    </div>
  );
}
