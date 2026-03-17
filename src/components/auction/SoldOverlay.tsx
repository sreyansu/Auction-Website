import { useEffect, useState } from 'react';

interface SoldOverlayProps {
  show: boolean;
  playerName: string;
  teamName: string;
  teamLogo: string;
  soldPrice: number;
  onComplete?: () => void;
}

export default function SoldOverlay({ show, playerName, teamName, teamLogo, soldPrice, onComplete }: SoldOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timeout = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      <div className="text-center animate-fade-in">
        <div className="animate-sold-stamp mb-6">
          <div
            className="inline-block px-12 py-4 rounded-lg border-4"
            style={{
              borderColor: 'var(--color-sold)',
              color: 'var(--color-sold)',
            }}
          >
            <span className="text-6xl md:text-8xl font-black tracking-wider">SOLD!</span>
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{playerName}</h2>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-xl" style={{ color: 'var(--color-text-muted)' }}>to</span>
          <img src={teamLogo} alt={teamName} className="w-14 h-14 rounded-full" style={{ border: '2px solid var(--color-primary)' }} />
          <span className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {teamName}
          </span>
        </div>
        <div className="text-4xl md:text-6xl font-black gradient-text">
          ₹{soldPrice} Lakhs
        </div>
      </div>
    </div>
  );
}
