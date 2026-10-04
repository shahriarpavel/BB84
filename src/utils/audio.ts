import confetti from 'canvas-confetti';

// Generate a simple synth "glitch" or beep using Web Audio API for the collapse sound
const createGlitchSound = () => {
  const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported');
  }
  const audioCtx = new AudioContextClass();
  return () => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  };
};

// We lazy-initialize the audio context
let glitchSoundFn: (() => void) | null = null;

export const playGlitchSound = () => {
  try {
    if (!glitchSoundFn) {
      glitchSoundFn = createGlitchSound();
    }
    glitchSoundFn();
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const triggerQuantumConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#00f0ff', '#00ff66', '#ffffff']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#00f0ff', '#00ff66', '#ffffff']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};
