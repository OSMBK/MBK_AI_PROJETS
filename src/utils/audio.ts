/**
 * Audio synthesis, speech synthesis and acoustic feedback for Agora Savoirs
 */

// Web Audio context singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a sacred celestial Pythagorean harmonic chime
 */
export function playHarmonicChime(freq: number = 432, duration: number = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    // Smooth exponential ramp
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Gracefully handle browser restrictions
  }
}

/**
 * Play a subtle click/interact acoustic pulse
 */
export function playHapticSound() {
  playHarmonicChime(528, 0.2);
}

/**
 * Speak text using classical philosophical vocal prosody
 */
export function speakText(
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options?.onEnd) options.onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop prior speech

    // Clean brackets or quote marks
    const cleanText = text.replace(/[«»"]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = options?.lang || 'fr-FR';
    utterance.pitch = options?.pitch ?? 0.92; // Slightly deeper, authoritative
    utterance.rate = options?.rate ?? 0.95; // Calm, deliberate cadence

    // Choose the best French voice available
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Thomas') || v.name.includes('Henri')));
    if (frVoice) {
      utterance.voice = frVoice;
    }

    if (options?.onStart) {
      utterance.onstart = options.onStart;
    }

    utterance.onend = () => {
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      if (options?.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    if (options?.onEnd) options.onEnd();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
