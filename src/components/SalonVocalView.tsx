import React, { useState, useEffect, useRef } from 'react';
import { ScholarId, ChatMessage } from '../types';
import { SCHOLARS } from '../data/scholars';
import { playHarmonicChime, playHapticSound, speakScholarResponse, stopSpeaking, testScholarVoice, SCHOLAR_VOICE_PROFILES } from '../utils/audio';

interface SalonVocalViewProps {
  currentScholarId: ScholarId;
  onSelectScholar: (id: ScholarId) => void;
  onOpenImmersive: (scholarId: ScholarId) => void;
  onSaveToCodex: (title: string, text: string, scholarId: ScholarId) => void;
  onOpenBlackboard: () => void;
  onBack?: () => void;
  initialPrompt?: string;
}

export const SalonVocalView: React.FC<SalonVocalViewProps> = ({
  currentScholarId,
  onSelectScholar,
  onOpenImmersive,
  onSaveToCodex,
  onOpenBlackboard,
  onBack,
  initialPrompt
}) => {
  const scholar = SCHOLARS.find(s => s.id === currentScholarId) || SCHOLARS[0];

  const [voiceTimbre, setVoiceTimbre] = useState('fr_acad');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [orbitRadius, setOrbitRadius] = useState<number>(384); // 384,000 km normalized
  const [isThinking, setIsThinking] = useState(false);
  const [autoVoiceSpeech, setAutoVoiceSpeech] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(true);
  const [quotaBanner, setQuotaBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSpeechDoneRef = useRef<string | null>(null);

  // Suggestion prompts tailored to each scholar
  const scholarSuggestions: Record<ScholarId, string[]> = {
    newton: [
      "Comment la même force fait-elle tomber la pomme et guide la Lune ?",
      "Pourquoi la lumière blanche se décompose-t-elle avec un prisme ?",
      "Quelle est votre définition de l'attraction universelle ?"
    ],
    pythagore: [
      "Pourquoi affirmez-vous que « tout est nombre » ?",
      "Comment la géométrie régit-elle l'harmonie des sphères ?",
      "Démontrez-moi le théorème des carrés sur l'hypoténuse."
    ],
    socrate: [
      "Pourquoi soutenez-vous que vous ne savez rien ?",
      "Qu'est-ce que la maïeutique et comment faire accoucher les esprits ?",
      "Comment distinguer une simple opinion de la véritable vertu ?"
    ],
    curie: [
      "Comment êtes-vous parvenue à isoler le radium dans votre hangar ?",
      "La curiosité scientifique doit-elle primer sur les dangers du rayonnement ?",
      "Quel message transmettez-vous aux futures générations de chercheuses ?"
    ],
    hypatie: [
      "Comment les sections coniques décrivent-elles le mouvement des astres ?",
      "Quel était votre enseignement à l'école néoplatonicienne d'Alexandrie ?",
      "Pourquoi la recherche de la vérité exige-t-elle le libre examen sans dogme ?"
    ]
  };

  // Specific initial greetings for each scholar
  const getScholarGreeting = (sId: ScholarId): { text: string; highlight?: string; hasTheorem?: boolean } => {
    switch (sId) {
      case 'newton':
        return {
          text: "« Salutations, jeune esprit. La nature cache ses secrets dans des proportions mathématiques simples. Quelle énigme de la mécanique céleste ou de la lumière désires-tu percer aujourd'hui ? »",
          highlight: "La gravitation ne s'arrête point au sommet de nos arbres : elle lie les astres dans le vide universel.",
          hasTheorem: true
        };
      case 'pythagore':
        return {
          text: "« Paix à ton esprit, voyageur. Écoute la vibration fondamentale qui ordonne le monde. Nul triangle ni intervalle musical n'est le fruit du hasard. Quelle proportion viens-tu contempler ? »",
          highlight: "Dans tout triangle rectangle, la somme des carrés construits sur les côtés de l'angle droit égale le carré de l'hypoténuse.",
          hasTheorem: true
        };
      case 'socrate':
        return {
          text: "« Bienvenue à toi sur cette place publique de la pensée. Je ne viens rien t'enseigner, car je ne sais rien. Mais si tu as le courage d'examiner tes certitudes, interrogeons-nous ensemble. »",
          highlight: "Une vie sans examen ne vaut point la peine d'être vécue.",
          hasTheorem: false
        };
      case 'curie':
        return {
          text: "« Bonjour. Dans notre laboratoire, nous avons appris que chaque grain de matière recèle une énergie colossale. N'ayez aucune crainte devant la nouveauté des phénomènes. De quelle expérience souhaitez-vous parler ? »",
          highlight: "Rien dans la vie n'est à craindre, tout est à comprendre.",
          hasTheorem: true
        };
      case 'hypatie':
        return {
          text: "« Bienvenue à Alexandrie, disciple de la vérité. Ici, sous les coupoles du Musée, nous mesurons les coniques d'Apollonius et les astrolabes du ciel. Quelle vérité mathématique désires-tu élucider ? »",
          highlight: "Préservez toujours votre liberté de penser : c'est par l'examen que l'âme s'affranchit.",
          hasTheorem: true
        };
    }
  };

  // Initialize conversation and voice greeting on scholar change
  useEffect(() => {
    const greeting = getScholarGreeting(scholar.id);
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const defaultMessages: ChatMessage[] = [
      {
        id: `greeting-${scholar.id}`,
        sender: 'scholar',
        scholarId: scholar.id,
        scholarName: scholar.name,
        time: timeStr,
        text: greeting.text,
        highlight: greeting.highlight,
        referenceDoc: scholar.theoremName,
        isAudio: true,
        audioDuration: scholar.audioDuration,
        audioLabel: 'Voix Haute Fidélité (96 kHz)',
        hasTheorem: greeting.hasTheorem && scholar.id === 'newton',
        theoremData: scholar.id === 'newton'
          ? {
              title: 'Théorème Céleste (1687)',
              formula: 'F = G · (m₁ · m₂) / r²',
              explanation: "L'attraction gravitationnelle entre deux corps est proportionnelle au produit de leurs masses et inversement proportionnelle au carré de la distance qui les sépare.",
              year: '1687',
              interactiveType: 'gravity'
            }
          : undefined
      }
    ];

    if (initialPrompt) {
      defaultMessages.push({
        id: `user-init-${Date.now()}`,
        sender: 'user',
        time: timeStr,
        text: initialPrompt,
        isAudio: true,
        audioDuration: '0:14',
        audioLabel: 'Question vocale initiale'
      });
    }

    setMessages(defaultMessages);

    // Speak initial greeting automatically out loud (oral & written)
    if (autoVoiceSpeech && initialSpeechDoneRef.current !== scholar.id) {
      initialSpeechDoneRef.current = scholar.id;
      const greetingMsgId = `greeting-${scholar.id}`;
      setIsPlayingAudio(greetingMsgId);
      speakScholarResponse(scholar.id, greeting.text, {
        onEnd: () => setIsPlayingAudio(null)
      });
    }

    return () => {
      stopSpeaking();
      setIsPlayingAudio(null);
    };
  }, [scholar.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Recording timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handlePlayAudio = (msgId: string, textToRead: string) => {
    playHapticSound();
    if (isPlayingAudio === msgId) {
      stopSpeaking();
      setIsPlayingAudio(null);
    } else {
      setIsPlayingAudio(msgId);
      speakScholarResponse(scholar.id, textToRead, {
        onEnd: () => setIsPlayingAudio(null)
      });
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    // Stop previous audio if speaking
    stopSpeaking();
    setIsPlayingAudio(null);

    playHarmonicChime(580, 0.2);
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      time: timeStr,
      text: textToSend,
      isAudio: isRecording,
      audioDuration: isRecording ? `0:${String(recordingSeconds || 8).padStart(2, '0')}` : undefined,
      audioLabel: isRecording ? 'Vocal transcrit' : undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsRecording(false);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarId: scholar.id,
          message: textToSend,
          model: selectedModel,
          useGoogleSearch: useGoogleSearch,
          conversationHistory: messages.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      const scholarReplyText = data.text || "Considérez ceci attentivement : l'esprit qui interroge découvre déjà la moitié de la réponse.";

      if (data.quotaExceeded) {
        setQuotaBanner(data.quotaMessage || "Limite de débit API atteinte (429). L'Agora a basculé sur le corpus autonome des Maîtres pour assurer la continuité.");
      }

      const newScholarMsgId = `msg-${Date.now() + 1}`;
      const newScholarMsg: ChatMessage = {
        id: newScholarMsgId,
        sender: 'scholar',
        scholarId: scholar.id,
        scholarName: scholar.name,
        time: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        text: scholarReplyText,
        isAudio: true,
        audioDuration: '0:26',
        audioLabel: 'Voix IA Restituée',
        modelUsed: data.modelUsed,
        sources: data.sources,
        searchQueries: data.searchQueries
      };

      // 1. ÉCRITE : Add response to the conversation thread
      setMessages(prev => [...prev, newScholarMsg]);

      // 2. ORALE : Speak the response automatically out loud
      if (autoVoiceSpeech) {
        setIsPlayingAudio(newScholarMsgId);
        speakScholarResponse(scholar.id, scholarReplyText, {
          onEnd: () => setIsPlayingAudio(null)
        });
      }
    } catch {
      const fallbackText = `Considérez avec rigueur les lois de la nature. Chaque observation doit être soutenue par la géométrie et l'expérience. Qu'observez-vous précisément ?`;
      const fallbackMsgId = `msg-${Date.now() + 1}`;
      const fallbackMsg: ChatMessage = {
        id: fallbackMsgId,
        sender: 'scholar',
        scholarId: scholar.id,
        scholarName: scholar.name,
        time: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        text: fallbackText,
        isAudio: true,
        audioDuration: '0:22'
      };
      setMessages(prev => [...prev, fallbackMsg]);

      // Speak oral response even on fallback
      if (autoVoiceSpeech) {
        setIsPlayingAudio(fallbackMsgId);
        speakScholarResponse(scholar.id, fallbackText, {
          onEnd: () => setIsPlayingAudio(null)
        });
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleRecordToggle = () => {
    playHarmonicChime(isRecording ? 360 : 640, 0.25);
    if (!isRecording) {
      setIsRecording(true);
      // Try HTML5 SpeechRecognition if present
      type SpeechRecognitionConstructor = new () => {
        lang: string;
        continuous: boolean;
        onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
        onerror: () => void;
        start: () => void;
      };

      const win = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const recognizer = new SpeechRecognitionClass();
          recognizer.lang = 'fr-FR';
          recognizer.continuous = false;
          recognizer.onresult = (event) => {
            const transcript = event.results[0]?.[0]?.transcript;
            if (transcript) {
              handleSendMessage(transcript);
            }
          };
          recognizer.onerror = () => {
            // Keep simulated mode
          };
          recognizer.start();
        } catch {
          // ignore
        }
      }
    } else {
      setIsRecording(false);
      if (recordingSeconds > 1) {
        handleSendMessage("Comment vos expériences confirment-elles cette loi dans le monde sensible ?");
      }
    }
  };

  const handleCodexSave = (msg: ChatMessage) => {
    playHarmonicChime(528, 0.4);
    onSaveToCodex(
      `Enseignement de ${scholar.name}`,
      msg.highlight || msg.text,
      scholar.id
    );
    setSaveToast(`Théorème de ${scholar.name} archivé avec succès dans votre Codex !`);
    setTimeout(() => setSaveToast(null), 3200);
  };

  // Gravitational force relative to distance: F ~ 1 / (r/384)^2
  const relativeForce = Math.max(0.2, (384 * 384) / (orbitRadius * orbitRadius)).toFixed(2);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-44 pt-1 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#111a36] text-[#ffe088] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[12px] font-semibold border border-[#fed65b]/30 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[16px]">bookmark_added</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Navigation & Scholar Switcher Strip */}
      <div className="px-4 sm:px-6 pt-2 pb-1">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#0B132B]/5 flex flex-col gap-3">
          {/* Header Action Row: Back to Panthéon + Live Status + Fullscreen Call */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={() => {
                    playHapticSound();
                    stopSpeaking();
                    onBack();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-[12px] font-semibold transition-all active:scale-95"
                  title="Revenir à la liste des savants"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span className="hidden sm:inline">Panthéon</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fed65b]/20 text-[#735c00] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#735c00] animate-pulse"></span>
                <span>Chat Box Écrit & Oral</span>
              </div>
            </div>

            {/* Auto speech toggle button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playHapticSound();
                  if (autoVoiceSpeech) {
                    stopSpeaking();
                    setIsPlayingAudio(null);
                  }
                  setAutoVoiceSpeech(!autoVoiceSpeech);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95 ${
                  autoVoiceSpeech
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Activer ou désactiver la lecture orale automatique"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {autoVoiceSpeech ? 'volume_up' : 'volume_off'}
                </span>
                <span className="hidden sm:inline">
                  {autoVoiceSpeech ? 'Voix Auto : ON' : 'Voix : Muet'}
                </span>
              </button>

              <button
                onClick={() => {
                  playHarmonicChime(528, 0.4);
                  stopSpeaking();
                  onOpenImmersive(scholar.id);
                }}
                id="call-toggle-btn"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#111a36] to-[#1c2541] text-white hover:opacity-95 transition-all shadow-sm shrink-0 active:scale-95 focus:outline-none ring-1 ring-[#fed65b]/40"
                title="Lancer la conversation vocale en direct avec gemini-3.8-live"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="material-symbols-outlined text-[16px] text-[#ffe088]">sensors</span>
                <span className="font-sans text-[11px] text-[#ffe088] font-bold">
                  Session Live (3.8-Live)
                </span>
              </button>
            </div>
          </div>

          {/* Scholar Switcher Avatar Bar */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] text-[#76767e] font-semibold uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Changer de Savant :
            </span>
            <div className="flex items-center gap-2">
              {SCHOLARS.map(s => {
                const isSelected = s.id === scholar.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.id !== scholar.id) {
                        playHarmonicChime(440, 0.2);
                        stopSpeaking();
                        onSelectScholar(s.id);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#111a36] text-[#ffe088] ring-2 ring-[#ffe088]/40 shadow-sm'
                        : 'bg-[#f3f4f5] text-[#191c1d] hover:bg-[#e7e8e9]'
                    }`}
                  >
                    <img src={s.avatarUrl} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-serif text-[12px] font-semibold">{s.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Scholar Hero Info Bar & Voice Testing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Scholar Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 shrink-0">
                <img
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#735c00]/30 shadow-sm"
                  src={scholar.immersiveBustUrl || scholar.avatarUrl}
                  alt={scholar.name}
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#735c00] flex items-center justify-center shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                </span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-serif text-[18px] sm:text-[20px] text-[#191c1d] font-semibold truncate">
                    {scholar.name}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      scholar.gender === 'female'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <span>{scholar.gender === 'female' ? '♀' : '♂'}</span>
                    <span>{scholar.voiceGenderLabel}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span className="font-sans text-[10px] sm:text-[11px] font-semibold text-[#735c00] uppercase tracking-wider">
                    {isPlayingAudio ? "En train de parler à voix haute (Oral)..." : "Prêt pour le dialogue (Écrit & Oral)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Voice Tester Button & Quality Badge */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => {
                  playHapticSound();
                  const testMsgId = `test-${scholar.id}`;
                  setIsPlayingAudio(testMsgId);
                  testScholarVoice(scholar.id, {
                    onEnd: () => setIsPlayingAudio(null)
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 shadow-xs ${
                  isPlayingAudio === `test-${scholar.id}`
                    ? 'bg-[#735c00] text-white border-[#735c00] animate-pulse'
                    : 'bg-[#fed65b]/25 hover:bg-[#fed65b]/45 text-[#735c00] border-[#735c00]/30'
                }`}
                title="Écouter un extrait de test de la voix de ce savant"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPlayingAudio === `test-${scholar.id}` ? 'volume_up' : 'spatial_audio'}
                </span>
                <span>{isPlayingAudio === `test-${scholar.id}` ? 'Écoute en cours...' : 'Tester sa voix'}</span>
              </button>

              <div className="flex items-center gap-1 bg-[#f3f4f5] px-2.5 py-1.5 rounded-full shadow-xs border border-gray-100">
                <span className="material-symbols-outlined text-[14px] text-[#735c00]">graphic_eq</span>
                <span className="font-sans text-[11px] text-[#191c1d] font-semibold">96 kHz</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Chatbot Intelligence & Google Search Grounding Toolbar */}
      <div className="px-4 sm:px-6 py-2">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Model Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-[#76767e] uppercase font-bold tracking-wider shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#735c00]">neurology</span>
              <span>Modèle Gemini :</span>
            </span>

            <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-xl">
              {[
                { id: 'gemini-3.8-flash', label: '3.8 Flash (Général)', desc: 'Général & Recherche' },
                { id: 'gemini-3.1-flash-lite', label: '3.1 Flash-Lite', desc: 'Ultra rapide' },
                { id: 'gemini-4-argon', label: '4 Argon', desc: 'Interactif complexe' },
                { id: 'gemini-4-carbon', label: '4 Carbon', desc: 'Raisonnement profond' }
              ].map(m => {
                const isCurrent = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      playHapticSound();
                      setSelectedModel(m.id);
                      if (m.id !== 'gemini-3.8-flash' && useGoogleSearch) {
                        // Notice user that search grounding automatically routes to gemini-3.8-flash
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                      isCurrent
                        ? 'bg-[#111a36] text-[#ffe088] shadow-xs'
                        : 'text-[#45464d] hover:text-[#191c1d] hover:bg-white/60'
                    }`}
                    title={m.desc}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Search Grounding Toggle */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                playHapticSound();
                const nextState = !useGoogleSearch;
                setUseGoogleSearch(nextState);
                if (nextState) {
                  setSelectedModel('gemini-3.8-flash');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all active:scale-95 shadow-xs ${
                useGoogleSearch
                  ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
              }`}
              title="Activer la vérification des sources et informations récentes avec la Recherche Google (gemini-3.8-flash)"
            >
              <span className="material-symbols-outlined text-[15px]">
                {useGoogleSearch ? 'travel_explore' : 'search'}
              </span>
              <span>Recherche Google en direct</span>
              {useGoogleSearch && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse ml-0.5"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion Chips: Quick questions for the scholar */}
      <div className="px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-[#76767e] uppercase font-bold tracking-wider shrink-0">
          Suggestions :
        </span>
        {scholarSuggestions[scholar.id]?.map((suggest, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(suggest)}
            className="px-3 py-1 rounded-full bg-white text-[#45464d] hover:text-[#191c1d] hover:bg-[#fed65b]/20 border border-gray-200/80 text-[11px] font-medium shrink-0 transition-all active:scale-95 text-left"
          >
            {suggest}
          </button>
        ))}
      </div>

      {/* Quota Notice Banner if 429 RESOURCE_EXHAUSTED */}
      {quotaBanner && (
        <div className="mx-4 sm:mx-6 mb-2 p-3.5 bg-amber-50/95 border border-amber-300 rounded-2xl flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-amber-700 shrink-0 mt-0.5">info</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-[12px] font-bold text-amber-900">
                Mode de Réserve Autonome Actif (Quota API 429)
              </span>
              <p className="font-sans text-[11px] text-amber-800 leading-relaxed">
                {quotaBanner}
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuotaBanner(null)}
            className="text-amber-700 hover:text-amber-950 p-1 rounded-lg hover:bg-amber-100/60 transition-colors"
            title="Fermer l'avertissement"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="flex flex-col gap-5 px-4 sm:px-6 py-2">
        {messages.map(msg => {
          const isScholar = msg.sender === 'scholar';
          const isThisMsgSpeaking = isPlayingAudio === msg.id;

          if (isScholar) {
            return (
              <div key={msg.id} className="flex flex-col gap-1 w-full max-w-[96%] animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans text-[11px] text-[#735c00] font-bold uppercase tracking-wider">
                      {msg.scholarName || scholar.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        scholar.gender === 'female'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {scholar.gender === 'female' ? '♀ Voix Féminine' : '♂ Voix Masculine'}
                    </span>
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span className="font-sans text-[11px] text-[#76767e]">• {msg.time}</span>
                  </div>
                  {msg.referenceDoc && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#735c00]">auto_stories</span>
                      <span className="font-sans text-[11px] text-[#735c00] font-semibold">
                        {msg.referenceDoc}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`bg-white p-4 sm:p-5 rounded-2xl rounded-tl-xs shadow-[0_2px_12px_rgba(0,0,0,0.04)] border transition-all ${
                    isThisMsgSpeaking
                      ? 'border-[#735c00] ring-2 ring-[#fed65b]/40 bg-gradient-to-b from-white to-[#fffdf5]'
                      : 'border-[#0B132B]/5'
                  } flex flex-col gap-3.5`}
                >
                  {/* High Fidelity Voice Bar (Both Written & Oral Status) */}
                  {msg.isAudio && (
                    <div className="flex items-center justify-between bg-[#f3f4f5] p-2.5 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handlePlayAudio(msg.id, msg.text)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm focus:outline-none ${
                            isThisMsgSpeaking
                              ? 'bg-[#735c00] text-white animate-pulse'
                              : 'bg-[#111a36] text-[#ffe088] hover:opacity-90'
                          }`}
                          title={isThisMsgSpeaking ? 'Mettre en pause' : 'Réécouter la réponse orale'}
                        >
                          <span className="material-symbols-outlined text-[20px] fill-1">
                            {isThisMsgSpeaking ? 'pause' : 'volume_up'}
                          </span>
                        </button>
                        <div className="flex flex-col">
                          <span className="font-sans text-[11px] text-[#191c1d] font-semibold flex items-center gap-1">
                            <span>{isThisMsgSpeaking ? "En cours d'élocution..." : (msg.audioLabel || 'Voix Haute Fidélité')}</span>
                            {isThisMsgSpeaking && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                            )}
                          </span>
                          <span className="font-sans text-[10px] text-[#76767e]">
                            {msg.audioDuration || '0:18'} • Restitution Vocale & Écrite
                          </span>
                        </div>
                      </div>

                      {/* Live Dynamic Audio Waves */}
                      <div className="flex items-center gap-[2px] h-5 px-2">
                        <div className={`w-1 rounded-full transition-all ${isThisMsgSpeaking ? 'bg-[#735c00] animate-pulse h-4' : 'bg-[#735c00]/60 h-3'}`}></div>
                        <div className={`w-1 rounded-full transition-all ${isThisMsgSpeaking ? 'bg-[#735c00] animate-pulse h-5' : 'bg-[#735c00]/60 h-5'}`}></div>
                        <div className={`w-1 rounded-full transition-all ${isThisMsgSpeaking ? 'bg-[#735c00] animate-pulse h-3' : 'bg-[#735c00]/60 h-2'}`}></div>
                        <div className={`w-1 rounded-full transition-all ${isThisMsgSpeaking ? 'bg-[#735c00] animate-pulse h-5' : 'bg-[#735c00]/60 h-4'}`}></div>
                        <div className={`w-1 rounded-full transition-all ${isThisMsgSpeaking ? 'bg-[#735c00] animate-pulse h-2' : 'bg-[#735c00]/60 h-3'}`}></div>
                        <div className="w-1 bg-gray-300 rounded-full h-2"></div>
                        <div className="w-1 bg-gray-300 rounded-full h-3"></div>
                        <div className="w-1 bg-gray-300 rounded-full h-2"></div>
                      </div>
                    </div>
                  )}

                  {/* Message Body (Écrite) */}
                  <p className="font-serif text-[16px] sm:text-[17px] text-[#191c1d] leading-relaxed italic">
                    {msg.text}
                  </p>

                  {/* Highlight sentence if present */}
                  {msg.highlight && (
                    <div className="bg-[#fed65b]/25 border-l-3 border-[#735c00] text-[#191c1d] p-3 rounded-r-xl font-sans text-[13px] sm:text-[14px] leading-relaxed font-medium">
                      {msg.highlight}
                    </div>
                  )}

                  {/* Interactive Celestial Theorem Component if Newton */}
                  {msg.hasTheorem && msg.theoremData && (
                    <div className="bg-[#f3f4f5] rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 border border-gray-200/70">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[11px] text-[#45464d] uppercase tracking-wider font-semibold">
                          {msg.theoremData.title}
                        </span>
                        <span className="material-symbols-outlined text-[18px] text-[#735c00]">functions</span>
                      </div>

                      {/* Formula Graphic Box */}
                      <div className="flex items-center justify-center py-2.5 bg-white rounded-lg shadow-xs border border-gray-100">
                        <div className="flex items-center gap-2 font-serif text-[18px] sm:text-[20px] text-[#191c1d] tracking-wide">
                          <span className="font-semibold">F</span>
                          <span>=</span>
                          <span className="text-[#735c00] font-bold">G</span>
                          <div className="flex flex-col items-center leading-none px-1">
                            <span className="text-[14px] sm:text-[15px] font-semibold border-none pb-0.5">
                              m₁ · m₂
                            </span>
                            <span className="w-full h-[1.5px] bg-[#191c1d]"></span>
                            <span className="text-[14px] sm:text-[15px] font-semibold pt-0.5">r²</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Earth / Moon Orbit & Gravity Slider */}
                      <div className="relative w-full rounded-xl overflow-hidden bg-[#111a36] text-white p-4 flex flex-col gap-3 shadow-inner">
                        <div className="flex items-center justify-around">
                          {/* Earth */}
                          <div className="flex flex-col items-center gap-1 z-10">
                            <div className="w-10 h-10 rounded-full bg-[#735c00] flex items-center justify-center shadow-md ring-2 ring-[#ffe088]/40">
                              <span className="material-symbols-outlined text-[20px] text-white">public</span>
                            </div>
                            <span className="font-sans text-[10px] text-[#ffe088] font-medium">Terre (m₁)</span>
                          </div>

                          {/* Orbit and Force Line */}
                          <div className="flex-1 flex flex-col items-center justify-center px-3 z-10">
                            <div className="w-full flex items-center justify-between text-[#ffe088] text-[11px] font-mono">
                              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                              <span className="tracking-widest font-semibold text-[11px]">
                                F ∝ 1/r² ({relativeForce}× F₀)
                              </span>
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </div>
                            <div className="w-full h-0.5 bg-[#fed65b]/40 my-1 relative">
                              <div
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ffe088] shadow-sm"
                                style={{ left: `${Math.min(95, Math.max(5, (orbitRadius - 200) / 4))}%` }}
                              ></div>
                            </div>
                            <span className="font-sans text-[10px] text-[#7a83a4]">
                              Distance r = {orbitRadius} 000 km
                            </span>
                          </div>

                          {/* Moon */}
                          <div className="flex flex-col items-center gap-1 z-10">
                            <div className="w-8 h-8 rounded-full bg-[#e1e3e4] flex items-center justify-center shadow-md">
                              <span className="material-symbols-outlined text-[16px] text-black">nightlight</span>
                            </div>
                            <span className="font-sans text-[10px] text-[#ffe088] font-medium">Lune (m₂)</span>
                          </div>
                        </div>

                        {/* Interactive Distance Adjuster */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                          <span className="text-[10px] text-[#7a83a4] uppercase tracking-wider">
                            Rapprocher / Éloigner
                          </span>
                          <input
                            type="range"
                            min="200"
                            max="600"
                            value={orbitRadius}
                            onChange={e => setOrbitRadius(Number(e.target.value))}
                            className="w-40 accent-[#ffe088] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Google Search Grounding Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/70 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-blue-900 font-sans text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[15px] text-blue-700">travel_explore</span>
                          <span>Sources vérifiées par Google Search</span>
                        </div>
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          Search Grounding
                        </span>
                      </div>

                      {/* Search Queries if present */}
                      {msg.searchQueries && msg.searchQueries.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {msg.searchQueries.map((q, idx) => (
                            <span key={idx} className="text-[10px] text-blue-700 bg-white/90 px-2 py-0.5 rounded-md border border-blue-200/60 font-mono">
                              🔍 {q}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Links List */}
                      <div className="flex flex-col gap-1.5 pt-0.5">
                        {msg.sources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-white hover:bg-blue-50 text-[#191c1d] transition-colors border border-blue-100 shadow-xs group"
                            title={`Consulter la source externe : ${source.uri}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="material-symbols-outlined text-[14px] text-blue-600 shrink-0">link</span>
                              <span className="text-[11px] font-medium text-slate-800 truncate group-hover:text-blue-700">
                                {source.title || source.uri}
                              </span>
                            </div>
                            <span className="material-symbols-outlined text-[13px] text-blue-400 group-hover:translate-x-0.5 transition-transform">
                              open_in_new
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-[11px] font-semibold transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#735c00]">
                        {isThisMsgSpeaking ? 'pause' : 'volume_up'}
                      </span>
                      <span>{isThisMsgSpeaking ? 'Pause' : 'Réécouter l’oral'}</span>
                    </button>
                    <button
                      onClick={() => handleCodexSave(msg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-[11px] font-semibold transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#735c00]">bookmark_add</span>
                      <span>Codex</span>
                    </button>
                    <button
                      onClick={() => {
                        playHapticSound();
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(`« ${msg.text} » — ${scholar.name}`);
                          setSaveToast("Citation copiée dans le presse-papier !");
                          setTimeout(() => setSaveToast(null), 2500);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-[11px] font-semibold transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#735c00]">share</span>
                      <span>Partager</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          } else {
            // User Speech / Message Bubble
            return (
              <div key={msg.id} className="flex flex-col gap-1 items-end w-full max-w-[90%] self-end animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[11px] text-[#76767e]">Vous • {msg.time}</span>
                  {msg.isAudio && (
                    <span className="flex items-center gap-1 bg-[#fed65b]/40 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px] text-[#735c00]">mic</span>
                      <span className="font-sans text-[10px] text-[#745c00] font-bold">
                        {msg.audioLabel || 'Vocal transcrit'} ({msg.audioDuration || '0:14'})
                      </span>
                    </span>
                  )}
                </div>

                <div className="bg-[#111a36] text-white p-4 rounded-2xl rounded-tr-xs shadow-md">
                  <p className="font-sans text-[14px] sm:text-[15px] leading-relaxed text-white">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          }
        })}

        {/* Scholar Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
            <span className="w-2.5 h-2.5 rounded-full bg-[#735c00] animate-ping"></span>
            <div className="flex flex-col">
              <span className="font-serif text-[13px] font-semibold text-[#191c1d]">
                {scholar.name} élabore sa réponse...
              </span>
              <span className="font-sans text-[10px] text-[#76767e]">
                Formulation de la réponse écrite et synthèse vocale
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Interaction Bar */}
      <div className="fixed bottom-20 inset-x-0 z-40 px-4 sm:px-6 pb-2 pt-1 bg-[#f8f9fa]/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2.5 sm:p-3 shadow-lg border border-[#0B132B]/8 flex flex-col gap-2">
          {/* Live Audio Status Strip */}
          <div
            id="live-audio-wave"
            className="flex items-center justify-between px-3 py-1 bg-[#f3f4f5] rounded-xl"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-[#735c00] animate-pulse'}`}></span>
              <span className="font-sans text-[11px] text-[#45464d] font-semibold">
                {isRecording
                  ? `À vous de parler... ${scholar.name} vous écoute (${recordingSeconds}s)`
                  : 'Capture vocale prête • Réponse de l’IA écrite & parlée'}
              </span>
            </div>

            <div className="flex items-center gap-[3px] h-4">
              <div className={`w-[2px] rounded-full ${isRecording ? 'bg-red-500 h-3 animate-pulse' : 'bg-gray-300 h-1.5'}`}></div>
              <div className={`w-[2px] rounded-full ${isRecording ? 'bg-[#735c00] h-4 animate-pulse' : 'bg-[#735c00] h-3'}`}></div>
              <div className={`w-[2px] rounded-full ${isRecording ? 'bg-[#735c00] h-5 animate-pulse' : 'bg-[#735c00] h-4'}`}></div>
              <div className={`w-[2px] rounded-full ${isRecording ? 'bg-[#735c00] h-3 animate-pulse' : 'bg-[#735c00] h-2.5'}`}></div>
              <div className={`w-[2px] rounded-full ${isRecording ? 'bg-gray-300 h-2' : 'bg-gray-300 h-1'}`}></div>
              <div className={`w-[2px] rounded-full ${isRecording ? 'bg-[#735c00] h-4 animate-pulse' : 'bg-[#735c00] h-3'}`}></div>
            </div>
          </div>

          {/* Input & Microphone Controls */}
          <div className="flex items-center gap-2">
            {/* Blackboard button */}
            <button
              onClick={() => {
                playHapticSound();
                onOpenBlackboard();
              }}
              className="w-11 h-11 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] flex items-center justify-center transition-colors shrink-0 focus:outline-none"
              title="Tableau noir d'expérimentation"
            >
              <span className="material-symbols-outlined text-[20px] text-[#735c00]">draw</span>
            </button>

            {/* Text Input */}
            <div className="flex-1 min-w-0 relative">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Interrogez ${scholar.name.split(' ')[0]} (réponse écrite & parlée)...`}
                className="w-full h-11 bg-[#f3f4f5] rounded-full px-4 text-[#191c1d] font-sans text-[13px] sm:text-[14px] focus:outline-none focus:ring-2 focus:ring-[#735c00]/30 placeholder:text-[#76767e] placeholder:italic"
              />
            </div>

            {/* Mic Action Button */}
            <button
              onClick={handleRecordToggle}
              id="mic-action-btn"
              title="Maintenir pour parler"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 focus:outline-none active:scale-95 ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#111a36] hover:bg-[#1c2541] text-[#ffe088]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] fill-1">
                {isRecording ? 'mic_off' : 'mic'}
              </span>
            </button>

            {/* Send Text Button (if input is typed) */}
            {inputText.trim().length > 0 && (
              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full bg-[#735c00] text-white flex items-center justify-center hover:bg-[#574500] transition-transform active:scale-95 shadow-md shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            )}
          </div>

          <p className="text-center font-sans text-[10px] text-[#76767e]">
            Toutes les réponses de l’IA sont fournies à la fois par écrit et de vive voix.
          </p>
        </div>
      </div>
    </div>
  );
};
