/**
 * Audio synthesis, speech synthesis and acoustic feedback for Agora Savoirs
 * Provides distinct gender-tailored voices for each scholar:
 * - Male scholars: distinct masculine voices (deep baritone, meditative tenor, lively tenor)
 * - Female scholars: distinct feminine voices (calm mezzo-soprano, luminous soprano)
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

// -------------------------------------------------------------
// ADVANCED SPEECH SYNTHESIS ENGINE WITH GENDER-BASED DIFFERENTIATION
// -------------------------------------------------------------

export interface ScholarVoiceProfile {
  scholarId: string;
  scholarName: string;
  gender: 'male' | 'female';
  genderLabel: string;
  pitch: number;
  rate: number;
  voiceStyle: string;
  testPhrase: string;
  voiceKeywords: string[];
}

export const SCHOLAR_VOICE_PROFILES: Record<string, ScholarVoiceProfile> = {
  newton: {
    scholarId: 'newton',
    scholarName: 'Sir Isaac Newton',
    gender: 'male',
    genderLabel: "Voix d'homme (Baryton grave)",
    pitch: 0.74, // Deep authoritative male pitch
    rate: 0.88,  // Thoughtful, measured pace
    voiceStyle: 'Baryton solennel (Royal Society 1687)',
    testPhrase: "Je suis Isaac Newton. La gravitation universelle gouverne la chute des corps et le cours des astres.",
    voiceKeywords: [
      'thomas', 'henri', 'paul', 'nicolas', 'bruno', 'male', 'homme',
      'fr-fr-x-frb', 'fr-fr-x-frf', 'wavenet-b', 'neural2-b', 'fr-ca-x-cab', 'fr-be'
    ]
  },
  pythagore: {
    scholarId: 'pythagore',
    scholarName: 'Pythagore de Samos',
    gender: 'male',
    genderLabel: "Voix d'homme (Ténor méditatif)",
    pitch: 0.88, // Warm, harmonious male pitch
    rate: 0.82,  // Very calm, rhythmic, contemplative
    voiceStyle: 'Ténor harmoniste posé (Crotone ~530 av. J.-C.)',
    testPhrase: "Je suis Pythagore. Tout est nombre et vibration céleste. Écoute l'harmonie des sphères.",
    voiceKeywords: [
      'nicolas', 'bernard', 'mathieu', 'alain', 'henri', 'male', 'homme',
      'fr-fr-x-frc', 'wavenet-d', 'neural2-d', 'fr-ch', 'fr-ca'
    ]
  },
  socrate: {
    scholarId: 'socrate',
    scholarName: 'Socrate d’Athènes',
    gender: 'male',
    genderLabel: "Voix d'homme (Ténor-baryton vif)",
    pitch: 1.04, // Higher male pitch, alert, dynamic, conversational
    rate: 1.04,  // Brisk, questioning, agile dialectic pace
    voiceStyle: 'Vocalise dialectique vive (Agora d’Athènes)',
    testPhrase: "Je suis Socrate. Tout ce que je sais, c'est que je ne sais rien. Mais examinons ensemble ce que tu crois savoir.",
    voiceKeywords: [
      'alain', 'bruno', 'philippe', 'jean', 'sebastien', 'google', 'male',
      'homme', 'fr-fr-x-frd', 'wavenet-b', 'fr'
    ]
  },
  curie: {
    scholarId: 'curie',
    scholarName: 'Marie Curie',
    gender: 'female',
    genderLabel: "Voix de femme (Mezzo-soprano calme)",
    pitch: 1.20, // Clear, composed feminine pitch
    rate: 0.95,  // Precise, clear, scientific diction
    voiceStyle: 'Mezzo-soprano scientifique calme (Sorbonne 1903)',
    testPhrase: "Je suis Marie Curie. Rien dans la vie n'est à craindre, tout est à comprendre dans la rigueur de l'expérience.",
    voiceKeywords: [
      'amelie', 'amélie', 'julie', 'hortense', 'celine', 'céline', 'female',
      'femme', 'woman', 'fr-fr-x-fra', 'wavenet-a', 'neural2-a', 'google français'
    ]
  },
  hypatie: {
    scholarId: 'hypatie',
    scholarName: 'Hypatie d’Alexandrie',
    gender: 'female',
    genderLabel: "Voix de femme (Soprano lumineuse)",
    pitch: 1.38, // Distinct higher, crystalline feminine pitch
    rate: 0.90,  // Luminous, eloquent, poetic
    voiceStyle: 'Soprano oratoire lumineuse (Alexandrie ~400)',
    testPhrase: "Je suis Hypatie d'Alexandrie. Préservez toujours votre liberté de penser, car la géométrie et les astres élèvent l'âme.",
    voiceKeywords: [
      'audrey', 'virginie', 'charlotte', 'alice', 'léa', 'sarah', 'eva',
      'female', 'femme', 'woman', 'fr-fr-x-fre', 'wavenet-c', 'neural2-c', 'google'
    ]
  }
};

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getAvailableVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Filter and categorize voices into distinct male and female pools
 */
function categorizeVoices(voices: SpeechSynthesisVoice[]) {
  const frenchVoices = voices.filter(v => v.lang.toLowerCase().startsWith('fr'));
  const candidatePool = frenchVoices.length > 0 ? frenchVoices : voices;

  const femaleKeywords = [
    'female', 'femme', 'woman', 'amelie', 'amélie', 'julie', 'audrey',
    'hortense', 'celine', 'céline', 'claire', 'virginie', 'charlotte',
    'alice', 'léa', 'sarah', 'eva', 'marie', 'chloe', 'chloé', 'mathilde',
    'aurelie', 'aurélie', 'fr-fr-x-fra', 'fr-fr-x-frd', 'wavenet-a',
    'wavenet-c', 'wavenet-e', 'neural2-a', 'neural2-c'
  ];

  const maleKeywords = [
    'male', 'homme', 'man', 'thomas', 'henri', 'nicolas', 'paul',
    'mathieu', 'alain', 'bruno', 'bernard', 'philippe', 'jean',
    'sebastien', 'fr-fr-x-frb', 'fr-fr-x-frf', 'wavenet-b', 'wavenet-d',
    'neural2-b', 'neural2-d'
  ];

  const femaleVoices: SpeechSynthesisVoice[] = [];
  const maleVoices: SpeechSynthesisVoice[] = [];
  const neutralVoices: SpeechSynthesisVoice[] = [];

  candidatePool.forEach(v => {
    const nameLower = (v.name + ' ' + v.voiceURI).toLowerCase();
    const isFemale = femaleKeywords.some(kw => nameLower.includes(kw));
    const isMale = maleKeywords.some(kw => nameLower.includes(kw));

    if (isFemale && !isMale) {
      femaleVoices.push(v);
    } else if (isMale && !isFemale) {
      maleVoices.push(v);
    } else {
      neutralVoices.push(v);
    }
  });

  return { femaleVoices, maleVoices, neutralVoices, allFrench: frenchVoices };
}

/**
 * Resolve the best distinct voice object for a given scholar
 */
export function resolveScholarVoice(scholarId: string): {
  voice: SpeechSynthesisVoice | null;
  pitch: number;
  rate: number;
  gender: 'male' | 'female';
  profile: ScholarVoiceProfile;
} {
  const profile = SCHOLAR_VOICE_PROFILES[scholarId] || SCHOLAR_VOICE_PROFILES.newton;
  const allVoices = getAvailableVoices();
  const { femaleVoices, maleVoices, neutralVoices, allFrench } = categorizeVoices(allVoices);

  let chosenVoice: SpeechSynthesisVoice | null = null;

  if (profile.gender === 'female') {
    // 1. Try matching scholar's specific female voice keywords
    for (const kw of profile.voiceKeywords) {
      const match = femaleVoices.find(v => (v.name + ' ' + v.voiceURI).toLowerCase().includes(kw));
      if (match) {
        chosenVoice = match;
        break;
      }
    }

    // 2. If not found, pick from distinct female voices pool
    if (!chosenVoice && femaleVoices.length > 0) {
      if (scholarId === 'curie') {
        chosenVoice = femaleVoices[0];
      } else {
        // Hypatie: pick 2nd female voice if available, else first with pitch distinction
        chosenVoice = femaleVoices[1] || femaleVoices[0];
      }
    }

    // 3. Fallback to neutral or French voice, where feminine pitch will ensure distinction
    if (!chosenVoice) {
      chosenVoice = neutralVoices[0] || allFrench[0] || null;
    }
  } else {
    // Male Scholar
    // 1. Try matching scholar's specific male voice keywords
    for (const kw of profile.voiceKeywords) {
      const match = maleVoices.find(v => (v.name + ' ' + v.voiceURI).toLowerCase().includes(kw));
      if (match) {
        chosenVoice = match;
        break;
      }
    }

    // 2. If not found, assign distinct male voice indices
    if (!chosenVoice && maleVoices.length > 0) {
      if (scholarId === 'newton') {
        chosenVoice = maleVoices[0];
      } else if (scholarId === 'pythagore') {
        chosenVoice = maleVoices[1] || maleVoices[0];
      } else {
        // Socrates
        chosenVoice = maleVoices[2] || maleVoices[1] || maleVoices[0];
      }
    }

    // 3. Fallback to neutral or French voice
    if (!chosenVoice) {
      chosenVoice = neutralVoices[0] || allFrench[0] || null;
    }
  }

  return {
    voice: chosenVoice,
    pitch: profile.pitch,
    rate: profile.rate,
    gender: profile.gender,
    profile
  };
}

/**
 * Speak text using scholar's gender-distinct vocal settings
 */
export function speakText(
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    lang?: string;
    scholarId?: string;
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
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Clean brackets, asterisks, math markers, or quotes for natural spoken French
    const cleanText = text
      .replace(/[«»"]/g, '')
      .replace(/\*/g, '')
      .replace(/F\s*=\s*G\s*·\s*\(m₁\s*·\s*m₂\)\s*\/\s*r²/gi, 'F égale G fois m1 fois m2 sur r au carré')
      .replace(/a²\s*\+\s*b²\s*=\s*c²/gi, 'a au carré plus b au carré égale c au carré')
      .replace(/N\(t\)\s*=\s*N₀\s*·\s*e\^\(-λt\)/gi, 'N de t égale N zéro exponentielle de moins lambda t')
      .trim();

    if (!cleanText) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options?.lang || 'fr-FR';

    // Apply scholar specific or custom tuning
    if (options?.scholarId) {
      const resolved = resolveScholarVoice(options.scholarId);
      utterance.pitch = options.pitch ?? resolved.pitch;
      utterance.rate = options.rate ?? resolved.rate;
      if (resolved.voice) {
        utterance.voice = resolved.voice;
      }
    } else {
      utterance.pitch = options?.pitch ?? 0.92;
      utterance.rate = options?.rate ?? 0.95;
      const allVoices = getAvailableVoices();
      const frVoice = allVoices.find(v => v.lang.toLowerCase().startsWith('fr'));
      if (frVoice) {
        utterance.voice = frVoice;
      }
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

/**
 * Speak response specifically tuned to a scholar's gender and persona
 */
export function speakScholarResponse(
  scholarId: string,
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  speakText(text, {
    scholarId,
    onStart: options?.onStart,
    onEnd: options?.onEnd
  });
}

/**
 * Test a scholar's voice with a characteristic signature phrase
 */
export function testScholarVoice(
  scholarId: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  const profile = SCHOLAR_VOICE_PROFILES[scholarId] || SCHOLAR_VOICE_PROFILES.newton;
  speakText(profile.testPhrase, {
    scholarId,
    onStart: options?.onStart,
    onEnd: options?.onEnd
  });
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
