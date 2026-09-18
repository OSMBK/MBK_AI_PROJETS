export type ScreenType = 'pantheon' | 'salon-vocal' | 'session-immersive' | 'codex' | 'profil';

export type ScholarId = 'newton' | 'pythagore' | 'socrate' | 'curie';

export interface Scholar {
  id: ScholarId;
  name: string;
  domain: string;
  domainCategory: 'physique' | 'maths' | 'philosophie' | 'chimie';
  badge: string;
  epoch: string;
  avatarUrl: string;
  bustUrl: string;
  immersiveBustUrl?: string;
  quote: string;
  statusText: string;
  voiceStyle: string;
  location: string;
  year: number | string;
  theoremName?: string;
  theoremFormula?: string;
  audioDuration?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'scholar' | 'user';
  scholarId?: ScholarId;
  scholarName?: string;
  time: string;
  text: string;
  quoteText?: string;
  isAudio?: boolean;
  audioDuration?: string;
  audioLabel?: string;
  hasTheorem?: boolean;
  theoremData?: {
    title: string;
    formula: string;
    explanation: string;
    year: string;
    interactiveType: 'gravity' | 'geometry' | 'light';
  };
  highlight?: string;
  referenceDoc?: string;
}

export interface AudioMemo {
  id: string;
  scholarId: ScholarId;
  scholarName: string;
  scholarAvatar: string;
  category: string;
  topic: string;
  title: string;
  quoteExcerpt: string;
  duration: string;
  currentProgress?: string;
  recordedDate: string;
  tag: string;
  audioPlayedPercent: number;
}

export interface StudentVocalNote {
  id: string;
  title: string;
  timestamp: string;
  duration: string;
  studentTranscript: string;
  feedbackScholarId: ScholarId;
  feedbackScholarName: string;
  feedbackStatus: 'Validé' | 'En débat' | 'À creuser';
  feedbackText: string;
}
