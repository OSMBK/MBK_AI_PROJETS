import React, { useState, useEffect } from 'react';
import { Scholar, ScholarId } from '../types';
import { SCHOLARS, APP_ASSETS } from '../data/scholars';
import { playHarmonicChime, playHapticSound, speakText, stopSpeaking } from '../utils/audio';

interface SessionImmersiveViewProps {
  scholarId: ScholarId;
  onBack: () => void;
  onOpenBlackboard: () => void;
}

export const SessionImmersiveView: React.FC<SessionImmersiveViewProps> = ({
  scholarId,
  onBack,
  onOpenBlackboard
}) => {
  const scholar = SCHOLARS.find(s => s.id === scholarId) || SCHOLARS[1]; // default to Pythagoras

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const speeds = ['0.8×', '1.0×', '1.2×', '1.5×'];

  const [transcriptionIndex, setTranscriptionIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(true);

  // Dynamic philosophical affirmations
  const pythagorasQuotes = [
    "« N'oublie point que dans tout triangle rectangle, l'harmonie des côtés révèle le secret même du cosmos... Écoute le nombre. »",
    "« Tout est arrangé d'après les nombres. La monade engendre la dyade, et de celle-ci naît l'harmonie des sphères célestes. »",
    "« La mesure de l'hypoténuse n'est point un accident terrestre, mais l'écho géométrique d'un accord parfait dans la lyre divine. »",
    "« Parle sans crainte, voyageur de l'esprit. Quel polygone trouble la sérénité de ta réflexion ? »"
  ];

  const currentQuote = pythagorasQuotes[transcriptionIndex];

  // Auto-speak initial quote on entering session
  useEffect(() => {
    playHarmonicChime(432, 0.6);
    speakText(currentQuote, {
      rate: speedIndex === 0 ? 0.8 : speedIndex === 1 ? 0.95 : 1.2,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });

    return () => {
      stopSpeaking();
    };
  }, [transcriptionIndex, speedIndex]);

  const handleInterrupt = () => {
    playHarmonicChime(528, 0.4);
    stopSpeaking();
    setTranscriptionIndex(prev => (prev + 1) % pythagorasQuotes.length);
  };

  const handleToggleMute = () => {
    playHapticSound();
    setIsMuted(!isMuted);
  };

  const handleCycleSpeed = () => {
    playHapticSound();
    setSpeedIndex((speedIndex + 1) % speeds.length);
  };

  const handleHangup = () => {
    playHarmonicChime(320, 0.3);
    stopSpeaking();
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#131a33] text-white flex flex-col justify-between overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      {/* 1. Header with back and profile */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#131a33]/85 backdrop-blur-xl border-b border-white/5 pt-safe">
        <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={handleHangup}
              aria-label="Retour"
              className="w-10 h-10 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
            <img
              src={APP_ASSETS.logo}
              alt="Agora Logo"
              className="h-7 w-auto object-contain brightness-200"
            />
            <h1 className="font-serif text-[17px] sm:text-[19px] font-semibold text-white truncate">
              Session Vocale Immersive
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                playHapticSound();
                if (navigator.share) {
                  navigator.share({
                    title: 'Agora Savoirs - Session Immersive',
                    text: `Je dialogue en direct avec ${scholar.name} sur l'Agora des Siècles.`
                  }).catch(() => {});
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            <div className="w-10 h-10 flex items-center justify-center rounded-full">
              <img
                src={APP_ASSETS.profile}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#fed65b]/40"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Celestial Canvas Container */}
      <main className="relative w-full max-w-2xl mx-auto pt-20 pb-28 px-4 flex flex-col justify-between min-h-screen">
        {/* Esoteric Geometry & Starry Background */}
        <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#fed65b]/15 blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#735c00]/20 blur-[100px]"></div>
          <svg
            className="absolute inset-0 w-full h-full stroke-[#ffe088]/20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50%" cy="38%" r="148" strokeDasharray="4 6" strokeWidth="1"></circle>
            <circle cx="50%" cy="38%" r="178" strokeDasharray="1 8" strokeWidth="1.5"></circle>
            <polygon className="opacity-25" points="195,78 305,250 85,250" strokeWidth="0.75"></polygon>
          </svg>
        </div>

        {/* Top Harmonic Signal Info */}
        <div className="relative z-10 flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2 bg-[#111a36]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#fed65b] animate-pulse"></span>
            <span className="font-sans text-[10px] sm:text-[11px] text-[#ffe088] font-bold tracking-wider uppercase">
              Liaison Harmonique
            </span>
            <span className="text-white/30 text-[10px]">|</span>
            <span className="font-sans text-[11px] text-white/80 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#ffe088]">bolt</span>
              35 ms
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCycleSpeed}
              id="btn-speed"
              className="px-3 py-1 rounded-full bg-[#111a36]/80 backdrop-blur-md text-[#ffe088] border border-white/10 text-[12px] font-semibold hover:bg-white/10 transition-colors shadow-sm focus:outline-none"
            >
              {speeds[speedIndex]}
            </button>
            <div className="px-3 py-1 rounded-full bg-[#111a36]/80 backdrop-blur-md text-[11px] text-white/70 border border-white/10 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#fed65b]">auto_stories</span>
              <span>{scholar.location}</span>
            </div>
          </div>
        </div>

        {/* Centerpiece: Antique Medallion with Radiant Harmonic Halo */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4">
          <div className="relative flex items-center justify-center w-60 h-60 sm:w-72 sm:h-72">
            {/* Ambient pulse */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#fed65b]/20 to-[#735c00]/20 blur-xl animate-pulse"></div>

            {/* Rotating Sacred Rings */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_32s_linear_infinite]"
              viewBox="0 0 260 260"
            >
              <circle
                cx="130"
                cy="130"
                fill="none"
                r="120"
                stroke="#fed65b"
                strokeDasharray="8 6"
                strokeOpacity="0.35"
                strokeWidth="2"
              ></circle>
              <circle
                cx="130"
                cy="130"
                fill="none"
                r="102"
                stroke="#e9c349"
                strokeOpacity="0.25"
                strokeWidth="1.2"
              ></circle>
            </svg>

            {/* Antique Portrait Medallion */}
            <div className="relative w-44 h-44 sm:w-50 sm:h-50 rounded-full overflow-hidden p-1 bg-gradient-to-b from-[#ffe088] to-[#735c00] shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-[#111a36]">
                <img
                  className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                  src={scholar.immersiveBustUrl || scholar.bustUrl}
                  alt={scholar.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131a33]/85 via-transparent to-[#735c00]/15 mix-blend-multiply"></div>
              </div>
            </div>

            {/* Radiant acoustic particles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-full flex items-center justify-between px-1 opacity-75">
                <span className="w-1 h-6 bg-[#ffe088] rounded-full animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                <span className="w-1 h-9 bg-[#fed65b] rounded-full animate-[ping_2.3s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                <span className="w-1 h-5 bg-[#e9c349] rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                <span className="w-1 h-8 bg-[#ffe088] rounded-full animate-[ping_2.1s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
              </div>
            </div>
          </div>

          {/* Scholar status & titles */}
          <div className="mt-3 flex flex-col items-center gap-1 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#ffe088] animate-ping"></span>
              <p className="font-sans text-[11px] text-[#ffe088] font-bold tracking-wider uppercase">
                {scholar.name.split(' ')[0]} formule sa pensée...
              </p>
            </div>
            <h2 className="font-serif text-[24px] sm:text-[28px] text-white font-semibold tracking-tight mt-1">
              {scholar.name}
            </h2>
            <p className="font-sans text-[13px] text-[#7a83a4]">{scholar.domain}</p>
          </div>

          {/* Live Subtitle Transcription Card */}
          <div className="w-full max-w-lg mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10 text-center">
            <div className="flex justify-center mb-1 text-[#ffe088] opacity-80">
              <span className="material-symbols-outlined text-[20px]">format_quote</span>
            </div>
            <p
              id="live-transcription"
              className="font-serif text-[17px] sm:text-[19px] text-white leading-relaxed italic transition-opacity duration-300"
            >
              {currentQuote}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex items-end gap-1 h-4 px-2">
                <span className="w-0.5 h-2 bg-[#fed65b] rounded-full animate-pulse"></span>
                <span className="w-0.5 h-4 bg-[#ffe088] rounded-full animate-pulse [animation-delay:120ms]"></span>
                <span className="w-0.5 h-3 bg-[#e9c349] rounded-full animate-pulse [animation-delay:240ms]"></span>
                <span className="w-0.5 h-1 bg-[#fed65b] rounded-full animate-pulse [animation-delay:360ms]"></span>
              </div>
              <span className="font-sans text-[11px] text-white/60 uppercase tracking-wider font-semibold">
                Voix neuronale restituée
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Geometry Demonstration Drawer */}
        <div
          id="geometry-drawer"
          className="relative z-10 w-full mb-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ffe088]">square_foot</span>
              <span className="font-sans text-[11px] text-white font-bold uppercase tracking-wider">
                Démonstration en cours : Théorème Fondateur
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              id="toggle-drawer"
              className="text-white/70 hover:text-white transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isDrawerOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {isDrawerOpen && (
            <div
              id="drawer-content"
              className="flex items-center gap-4 pt-2 border-t border-white/5 animate-in fade-in"
            >
              <div className="w-20 h-20 rounded-xl bg-[#111a36]/90 border border-white/10 flex items-center justify-center shrink-0 p-2 shadow-inner">
                {/* SVG geometry demonstration */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <polygon
                    fill="none"
                    points="25,75 75,75 25,35"
                    stroke="#ffe088"
                    strokeWidth="2.5"
                  ></polygon>
                  <rect
                    fill="none"
                    height="10"
                    stroke="#ffe088"
                    strokeWidth="1.5"
                    width="10"
                    x="25"
                    y="65"
                  ></rect>
                  <rect
                    fill="#fed65b"
                    fillOpacity="0.25"
                    height="20"
                    stroke="#fed65b"
                    strokeWidth="1"
                    width="20"
                    x="5"
                    y="75"
                  ></rect>
                  <rect
                    fill="#e9c349"
                    fillOpacity="0.25"
                    height="40"
                    stroke="#e9c349"
                    strokeWidth="1"
                    width="20"
                    x="5"
                    y="35"
                  ></rect>
                  <polygon
                    fill="#ffe088"
                    fillOpacity="0.3"
                    points="25,35 75,75 99,45 49,5"
                    stroke="#ffe088"
                    strokeWidth="1"
                  ></polygon>
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-serif text-[18px] text-[#ffe088] font-bold">
                  {scholar.theoremFormula || 'a² + b² = c²'}
                </p>
                <p className="font-sans text-[12px] text-white/80 leading-relaxed line-clamp-2">
                  Les carrés érigés sur la base et la hauteur comblent exactement la superficie de l'hypoténuse céleste.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Classical 5-Action Audio Control Dock */}
        <div className="relative z-10 w-full pt-1 pb-4">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Action 1: Mute */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleToggleMute}
                id="btn-mute"
                aria-label="Couper le micro"
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg focus:outline-none ${
                  isMuted
                    ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                    : 'bg-[#111a36] hover:bg-[#1c2541] text-white border border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isMuted ? 'mic_off' : 'mic'}
                </span>
              </button>
              <span className="font-sans text-[10px] text-white/70">Micro</span>
            </div>

            {/* Action 2: Tableau */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => {
                  playHapticSound();
                  onOpenBlackboard();
                }}
                id="btn-geometry"
                aria-label="Tableau de géométrie"
                className="w-12 h-12 rounded-full bg-[#fed65b]/20 hover:bg-[#fed65b]/30 text-[#ffe088] border border-[#fed65b]/30 flex items-center justify-center transition-all active:scale-95 shadow-lg focus:outline-none"
              >
                <span className="material-symbols-outlined text-[22px]">architecture</span>
              </button>
              <span className="font-sans text-[10px] text-white/70">Tableau</span>
            </div>

            {/* Action 3 (Hero Central): Interrompre / Parler */}
            <div className="flex flex-col items-center gap-1 -translate-y-2">
              <button
                onClick={handleInterrupt}
                id="btn-speak"
                aria-label="Prendre la parole"
                className="relative group w-16 h-16 rounded-full bg-[#fed65b] text-[#241a00] shadow-[0_8px_28px_rgba(254,214,91,0.45)] flex items-center justify-center transition-transform hover:scale-105 active:scale-90 focus:outline-none"
              >
                <span className="absolute inset-0 rounded-full bg-[#ffe088] animate-ping opacity-40"></span>
                <span className="material-symbols-outlined text-[32px] relative z-10 font-bold">
                  graphic_eq
                </span>
              </button>
              <span className="font-sans text-[11px] text-[#ffe088] font-bold tracking-wide">
                Interrompre
              </span>
            </div>

            {/* Action 4: Nuance (timbre / harmonic adjust) */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => {
                  playHarmonicChime(580, 0.2);
                  handleCycleSpeed();
                }}
                id="btn-tune"
                aria-label="Paramètres de l'harmonie vocale"
                className="w-12 h-12 rounded-full bg-[#111a36] hover:bg-[#1c2541] text-white border border-white/10 flex items-center justify-center transition-all active:scale-95 shadow-lg focus:outline-none"
              >
                <span className="material-symbols-outlined text-[22px]">tune</span>
              </button>
              <span className="font-sans text-[10px] text-white/70">Nuance</span>
            </div>

            {/* Action 5: Congédier (Hang up) */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleHangup}
                id="btn-hangup"
                aria-label="Mettre fin au dialogue"
                className="w-12 h-12 rounded-full bg-[#ba1a1a] hover:bg-red-700 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg focus:outline-none"
              >
                <span className="material-symbols-outlined text-[22px]">call_end</span>
              </button>
              <span className="font-sans text-[10px] text-[#ffdad6]">Congédier</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
