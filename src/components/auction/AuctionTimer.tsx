import { useRef } from 'react';

interface AuctionTimerProps {
  timer: number;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AuctionTimer({ timer, isActive, size = 'md' }: AuctionTimerProps) {
  const circleRef = useRef<SVGCircleElement>(null);

  const sizes = {
    sm: { dim: 60, stroke: 4, font: 'text-lg' },
    md: { dim: 100, stroke: 6, font: 'text-3xl' },
    lg: { dim: 160, stroke: 8, font: 'text-5xl' },
  };

  const s = sizes[size];
  const radius = (s.dim - s.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (timer / 30) * circumference;

  const getColor = () => {
    if (timer <= 5) return 'var(--color-danger)';
    if (timer <= 10) return 'var(--color-warning)';
    return 'var(--color-primary)';
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${timer <= 5 && isActive ? 'animate-countdown-pulse' : ''}`}>
      <svg width={s.dim} height={s.dim} className="-rotate-90">
        <circle
          cx={s.dim / 2}
          cy={s.dim / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={s.stroke}
        />
        <circle
          ref={circleRef}
          cx={s.dim / 2}
          cy={s.dim / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000"
          style={{
            filter: timer <= 5 ? `drop-shadow(0 0 6px ${getColor()})` : 'none',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${s.font} font-bold tabular-nums`} style={{ color: getColor() }}>
          {timer}
        </span>
      </div>
    </div>
  );
}
