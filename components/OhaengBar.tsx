import { Ohaeng } from '@/types';

const COLORS: Record<Ohaeng, string> = {
  '木': 'bg-green-400',
  '火': 'bg-red-400',
  '土': 'bg-yellow-400',
  '金': 'bg-gray-300',
  '水': 'bg-blue-400',
};

const LABELS: Record<Ohaeng, string> = {
  '木': '나무',
  '火': '불',
  '土': '흙',
  '金': '쇠',
  '水': '물',
};

interface Props {
  ohaeng: Record<Ohaeng, number>;
  dominant: Ohaeng;
}

export default function OhaengBar({ ohaeng, dominant }: Props) {
  return (
    <div className="space-y-2">
      {(Object.entries(ohaeng) as [Ohaeng, number][]).map(([key, val]) => (
        <div key={key} className="flex items-center gap-3">
          <span
            className={`text-sm font-bold w-6 text-center ${
              key === dominant ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            {key}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-3">
            <div
              className={`${COLORS[key]} h-3 rounded-full transition-all duration-1000`}
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 w-10 text-right">{val}%</span>
        </div>
      ))}
    </div>
  );
}
