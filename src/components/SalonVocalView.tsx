import React, { useState, useEffect, useRef } from 'react';
import { Scholar, ScholarId, ChatMessage } from '../types';
import { SCHOLARS } from '../data/scholars';
import { playHarmonicChime, playHapticSound, speakText, stopSpeaking } from '../utils/audio';

interface SalonVocalViewProps {
  currentScholarId: ScholarId;
  onSelectScholar: (id: ScholarId) => void;
  onOpenImmersive: (scholarId: ScholarId) => void;
  onSaveToCodex: (title: string, text: string, scholarId: ScholarId) => void;
  onOpenBlackboard: () => void;
  initialPrompt?: string;
}

export const SalonVocalView: React.FC<SalonVocalViewProps> = ({
  currentScholarId,
  onSelectScholar,
  onOpenImmersive,
  onSaveToCodex,
  onOpenBlackboard,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation matching Screenshot 2
  useEffect(() => {
    const defaultMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        sender: 'scholar',
        scholarId: scholar.id,
        scholarName: scholar.name,
        time: '10:41',
        text: scholar.id === 'newton'
          ? '« Salutations, jeune esprit. La nature cache ses secrets dans des proportions mathématiques simples. Quelle énigme de la mécanique céleste désires-tu percer aujourd\'hui ? »'
          : `« Salutations, voyageur de l'esprit. Je suis ${scholar.name}. Que ta pensée s'élève vers les vérités fondamentales. De quelle quête viens-tu m'entretenir ? »`,
        isAudio: true,
        audioDuration: '0:11',
        audioLabel: 'Voix Haute Fidélité'
      },
      {
        id: 'msg-2',
        sender: 'user',
        time: '10:42',
        text: initialPrompt || (scholar.id === 'newton'
          ? 'Monsieur Newton, comment avez-vous déduit que la même force fait tomber la pomme et guide la Lune ?'
          : `Maître ${scholar.name.split(' ')[0]}, pouvez-vous m'enseigner le principe premier qui sous-tend votre découverte ?`),
        isAudio: true,
        audioDuration: '0:14',
        audioLabel: 'Vocal transcrit'
      },
      {
        id: 'msg-3',
        sender: 'scholar',
        scholarId: scholar.id,
        scholarName: scholar.name,
        time: '10:43',
        text: scholar.id === 'newton'
          ? 'Parce que la gravitation ne s\'arrête pas au sommet du pommier de Woolsthorpe ! J\'ai comparé l\'accélération d\'un corps tombant sur Terre avec l\'écart de la Lune par rapport à sa course rectiligne.'
          : 'La vérité s\'établit par une rigoureuse harmonie entre l\'intuition expérimentale et la géométrie des principes.',
        highlight: scholar.id === 'newton'
          ? 'Si la distance double, l\'attraction est divisée par quatre : c\'est la loi en carré inverse.'
          : undefined,
        referenceDoc: scholar.id === 'newton' ? 'Philosophiae Naturalis' : 'Manuscrits Fondateurs',
        hasTheorem: scholar.id === 'newton',
        theoremData: scholar.id === 'newton'
          ? {
              title: 'Théorème Céleste (1687)',
              formula: 'F = G · (m₁ · m₂) / r²',
              explanation: 'L\'attraction gravitationnelle entre deux corps est proportionnelle au produit de leurs masses et inversement proportionnelle au carré de la distance qui les sépare.',
              year: '1687',
              interactiveType: 'gravity'
            }
          : undefined,
        isAudio: true,
        audioDuration: '0:49'
      }
    ];

    setMessages(defaultMessages);
  }, [scholar, initialPrompt]);

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
      speakText(textToRead, {
        onEnd: () => setIsPlayingAudio(null)
      });
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

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
          conversationHistory: messages.slice(-4).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      const scholarReplyText = data.text || "Considérez ceci attentivement : l'esprit qui interroge découvre déjà la moitié de la réponse.";

      const newScholarMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'scholar',
        scholarId: scholar.id,
        scholarName: scholar.name,
        time: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        text: scholarReplyText,
        isAudio: true,
        audioDuration: '0:26'
      };

      setMessages(prev => [...prev, newScholarMsg]);

      // Auto speak response in conversational mode
      speakText(scholarReplyText);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'scholar',
        scholarId: scholar.id,
        scholarName: scholar.name,
        time: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        text: `Considérez avec rigueur les lois de la nature. Chaque observation doit être soutenue par la géométrie et l'expérience. Qu'observez-vous précisément ?`,
        isAudio: true,
        audioDuration: '0:22'
      };
      setMessages(prev => [...prev, fallbackMsg]);
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
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-36 pt-1 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#111a36] text-[#ffe088] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[12px] font-semibold border border-[#fed65b]/30 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[16px]">bookmark_added</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Scholar Status Card */}
      <div className="px-4 sm:px-6 pt-2 pb-1">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#0B132B]/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-1.5">
                  <h2 className="font-serif text-[18px] sm:text-[20px] text-[#191c1d] font-semibold truncate">
                    {scholar.name}
                  </h2>
                  <span className="material-symbols-outlined text-[16px] text-[#735c00] fill-1">
                    verified
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#735c00] animate-ping"></span>
                  <span className="font-sans text-[10px] sm:text-[11px] font-semibold text-[#735c00] uppercase tracking-wider">
                    En écoute attentive...
                  </span>
                </div>
              </div>
            </div>

            {/* Immersive Call Button */}
            <button
              onClick={() => {
                playHarmonicChime(528, 0.4);
                onOpenImmersive(scholar.id);
              }}
              id="call-toggle-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111a36] text-white hover:bg-[#1c2541] transition-all shadow-sm shrink-0 active:scale-95 focus:outline-none"
              title="Passer en mode vocal immersif"
            >
              <span className="material-symbols-outlined text-[18px] text-[#ffe088]">phone_in_talk</span>
              <span className="font-sans text-[11px] text-white font-semibold hidden sm:inline">
                Plein Écran
              </span>
            </button>
          </div>

          {/* Timbre Vocal & Sample Rate Control Bar */}
          <div className="flex items-center justify-between pt-1 bg-[#f3f4f5] rounded-xl p-2.5 border border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-[#735c00]">tune</span>
              <div className="flex flex-col min-w-0">
                <span className="font-sans text-[10px] text-[#76767e] uppercase font-semibold leading-none">
                  Timbre vocal simulé
                </span>
                <select
                  value={voiceTimbre}
                  onChange={e => setVoiceTimbre(e.target.value)}
                  className="bg-transparent font-sans text-[12px] text-[#191c1d] font-semibold focus:outline-none cursor-pointer truncate"
                  id="voice-select"
                >
                  <option value="fr_acad">Français académique fluide (1687)</option>
                  <option value="en_sub">Anglais du XVIIe siècle sous-titré</option>
                  <option value="latin_opt">Latin savant (Cambridge)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-xs border border-gray-100">
              <span className="material-symbols-outlined text-[14px] text-[#735c00]">graphic_eq</span>
              <span className="font-sans text-[11px] text-[#191c1d] font-semibold">96 kHz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex flex-col gap-5 px-4 sm:px-6 py-3">
        {messages.map(msg => {
          const isScholar = msg.sender === 'scholar';

          if (isScholar) {
            return (
              <div key={msg.id} className="flex flex-col gap-1 w-full max-w-[96%] animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-[11px] text-[#735c00] font-bold uppercase tracking-wider">
                      {msg.scholarName || scholar.name}
                    </span>
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

                <div className="bg-white p-4 sm:p-5 rounded-2xl rounded-tl-xs shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#0B132B]/5 flex flex-col gap-3.5">
                  {/* High Fidelity Voice Bar */}
                  {msg.isAudio && (
                    <div className="flex items-center justify-between bg-[#f3f4f5] p-2.5 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handlePlayAudio(msg.id, msg.text)}
                          className="w-9 h-9 rounded-full bg-[#111a36] text-[#ffe088] flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 shadow-sm focus:outline-none"
                        >
                          <span className="material-symbols-outlined text-[20px] fill-1">
                            {isPlayingAudio === msg.id ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <div className="flex flex-col">
                          <span className="font-sans text-[11px] text-[#191c1d] font-semibold">
                            {msg.audioLabel || 'Voix Haute Fidélité'}
                          </span>
                          <span className="font-sans text-[10px] text-[#76767e]">
                            {msg.audioDuration || '0:11'} • Master Cambridge
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-[2px] h-5 px-2">
                        <div className={`w-1 bg-[#735c00] rounded-full ${isPlayingAudio === msg.id ? 'animate-pulse h-4' : 'h-3'}`}></div>
                        <div className={`w-1 bg-[#735c00] rounded-full ${isPlayingAudio === msg.id ? 'animate-pulse h-5' : 'h-5'}`}></div>
                        <div className={`w-1 bg-[#735c00] rounded-full ${isPlayingAudio === msg.id ? 'animate-pulse h-3' : 'h-2'}`}></div>
                        <div className={`w-1 bg-[#735c00] rounded-full ${isPlayingAudio === msg.id ? 'animate-pulse h-5' : 'h-4'}`}></div>
                        <div className={`w-1 bg-[#735c00] rounded-full ${isPlayingAudio === msg.id ? 'animate-pulse h-2' : 'h-3'}`}></div>
                        <div className="w-1 bg-gray-300 rounded-full h-2"></div>
                        <div className="w-1 bg-gray-300 rounded-full h-3"></div>
                        <div className="w-1 bg-gray-300 rounded-full h-2"></div>
                      </div>
                    </div>
                  )}

                  {/* Message Body */}
                  <p className="font-serif text-[16px] sm:text-[17px] text-[#191c1d] leading-relaxed italic">
                    {msg.text}
                  </p>

                  {/* Highlight sentence if present */}
                  {msg.highlight && (
                    <div className="bg-[#fed65b]/25 border-l-3 border-[#735c00] text-[#191c1d] p-3 rounded-r-xl font-sans text-[13px] sm:text-[14px] leading-relaxed font-medium">
                      {msg.highlight}
                    </div>
                  )}

                  {/* Interactive Celestial Theorem Component */}
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

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleCodexSave(msg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-[11px] font-semibold transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#735c00]">bookmark_add</span>
                      <span>Noter au Codex</span>
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
                      <span>Partager extrait</span>
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
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-[#735c00] animate-ping"></span>
            <span className="font-serif text-[13px] italic text-[#45464d]">
              {scholar.name} médite et formule sa pensée...
            </span>
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
                  : 'Capture vocale prête'}
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
                placeholder="Interrogez le maître sur sa théorie..."
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
            Maintenir pour parler • Toucher pour basculer en mode continu
          </p>
        </div>
      </div>
    </div>
  );
};
