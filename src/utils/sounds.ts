// Sound effects utility using Web Audio API
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
};

export const playBidSound = () => {
  // Ascending two-note chime
  playTone(880, 0.15, 'sine', 0.25);
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.25), 100);
};

export const playCountdownSound = () => {
  // Sharp tick
  playTone(600, 0.08, 'square', 0.15);
};

export const playFinalCountdownSound = () => {
  // Urgent beep for last 5 seconds
  playTone(900, 0.12, 'square', 0.3);
};

export const playSoldSound = () => {
  // Victory fanfare - ascending major chord
  playTone(523, 0.3, 'sine', 0.3); // C5
  setTimeout(() => playTone(659, 0.3, 'sine', 0.3), 150); // E5
  setTimeout(() => playTone(784, 0.3, 'sine', 0.3), 300); // G5
  setTimeout(() => playTone(1047, 0.5, 'sine', 0.35), 450); // C6
};

export const playUnsoldSound = () => {
  // Descending minor tone
  playTone(400, 0.3, 'sawtooth', 0.15);
  setTimeout(() => playTone(300, 0.4, 'sawtooth', 0.12), 200);
};

export const playStartSound = () => {
  // Quick ascending flourish
  playTone(440, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(554, 0.1, 'sine', 0.2), 80);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 160);
  setTimeout(() => playTone(880, 0.2, 'sine', 0.25), 240);
};
