import React, { useState, useEffect } from 'react';
import { Scholar, ScholarId } from '../types';
import { SCHOLARS } from '../data/scholars';
import { playHarmonicChime, playHapticSound, speakText, stopSpeaking } from '../utils/audio';

interface PantheonViewProps {
  onStartCall: (scholarId: ScholarId) => void;
  onOpenSalon: (scholarId: ScholarId, promptMessage?: string) => void;
  filterDomain: string;
  onSetFilterDomain: (domain: string) => void;
  onViewManuscript: (scholar: Scholar) => void;
}

export const PantheonView: React.FC<PantheonViewProps> = ({
  onStartCall,
  onOpenSalon,
  filterDomain,
  onSetFilterDomain,
  onViewManuscript
}) => {
  const [isPlayingDailyQuote, setIsPlayingDailyQuote] = useState(false);
  const [dailyWaveform, setDailyWaveform] = useState<number[]>([
    10, 16, 24, 12, 28, 20, 12, 16, 24, 8, 20, 16, 8, 12
  ]);

  // Dynamic waveform animation when daily audio question is playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingDailyQuote) {
      interval = setInterval(() => {
        setDailyWaveform(prev =>
          prev.map(() => Math.floor(Math.random() * 26) + 6)
        );
      }, 130);
    } else {
      setDailyWaveform([10, 16, 24, 12, 28, 20, 12, 16, 24, 8, 20, 16, 8, 12]);
    }
    return () => clearInterval(interval);
  }, [isPlayingDailyQuote]);

  const handleToggleDailyAudio = () => {
    playHapticSound();
    if (isPlayingDailyQuote) {
      stopSpeaking();
      setIsPlayingDailyQuote(false);
    } else {
      setIsPlayingDailyQuote(true);
      playHarmonicChime(432, 0.4);
      speakText(
        "Pourquoi la Lune ne tombe-t-elle point sur la Terre ? Considérez que la force qui fait choir la pomme s'étend jusqu'à l'orbe céleste.",
        {
          onEnd: () => setIsPlayingDailyQuote(false)
        }
      );
    }
  };

  const handleRandomCall = () => {
    playHarmonicChime(528, 0.5);
    const randomIndex = Math.floor(Math.random() * SCHOLARS.length);
    onStartCall(SCHOLARS[randomIndex].id);
  };

  const filteredScholars = SCHOLARS.filter(s => {
    if (filterDomain === 'all') return true;
    return s.domainCategory === filterDomain;
  });

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-28 pt-2 animate-in fade-in duration-300">
      {/* 1. Interactive Audio Daily Question / Hero Banner */}
      <section className="px-4 sm:px-6 pt-3 pb-2">
        <div className="relative overflow-hidden rounded-2xl bg-[#111a36] text-white shadow-xl p-5 sm:p-7">
          {/* Subtle celestial illumination */}
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#fed65b]/15 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#565d79]/15 blur-xl pointer-events-none"></div>

          {/* Live badge & Epoch signal */}
          <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[#ffe088] text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#ffe088] animate-pulse"></span>
              Dialogue Vivant • Audio HD
            </span>
            <div className="flex items-center gap-1 text-[#7a83a4] text-[11px]">
              <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
              <span>4 Maîtres Éveillés</span>
            </div>
          </div>

          <div className="relative z-10 mb-4">
            <h2 className="font-serif text-[24px] sm:text-[28px] text-white font-semibold leading-tight mb-1">
              L’Agora des Siècles
            </h2>
            <p className="font-sans text-[13px] text-[#e1e3e4] max-w-[340px] leading-relaxed">
              Conversez de vive voix avec les penseurs fondateurs. Élucidez vos dilemmes sous le prisme de la raison.
            </p>
          </div>

          {/* Quick Launch CTA with Classical Seal Touch */}
          <div className="relative z-10">
            <button
              onClick={handleRandomCall}
              id="instant-call-btn"
              className="w-full h-12 rounded-xl bg-[#735c00] hover:bg-[#8a6e00] active:scale-[0.98] text-white flex items-center justify-between px-4 shadow-lg transition-all focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-white">settings_voice</span>
                <span className="font-sans text-[14px] font-semibold tracking-wide">
                  Lancer un appel instantané
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-black/20 text-[#ffe088] text-[11px] font-medium">
                Aléatoire
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Question Audio du Jour (Micro-Audio Feature) */}
      <section className="px-4 sm:px-6 py-2">
        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_-2px_rgba(17,26,54,0.06)] border border-[#0B132B]/5 relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            {/* Scholar Mini Portrait with Golden Border Seal */}
            <div className="relative flex-shrink-0">
              <img
                className="w-13 h-13 rounded-full object-cover shadow-sm ring-2 ring-[#735c00]/30"
                src={SCHOLARS[0].avatarUrl}
                alt="Sir Isaac Newton"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#735c00] text-white flex items-center justify-center text-[10px] shadow-sm">
                <span className="material-symbols-outlined text-[12px] fill-1">mic</span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#735c00]">
                  Question audio du jour
                </span>
                <span className="font-sans text-[11px] text-[#76767e]">01:42</span>
              </div>

              <p className="font-serif text-[16px] leading-snug text-[#191c1d] mb-1 italic font-medium">
                « Pourquoi la Lune ne tombe-t-elle pas sur la Terre ? »
              </p>

              <p className="font-sans text-[11px] text-[#45464d] mb-2.5">
                Sir Isaac Newton • Cambridge, 1687
              </p>

              {/* Audio Wave Player Strip */}
              <div className="flex items-center gap-2.5 bg-[#f3f4f5] rounded-xl px-3 py-2 border border-gray-100">
                <button
                  onClick={handleToggleDailyAudio}
                  id="play-quote-btn"
                  aria-label="Écouter l'extrait de Sir Isaac Newton"
                  className="w-9 h-9 rounded-full bg-[#111a36] text-[#ffe088] hover:bg-[#1c2541] flex items-center justify-center flex-shrink-0 shadow-sm active:scale-95 transition-transform focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px] fill-1">
                    {isPlayingDailyQuote ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Dynamic Synthesized Waveform */}
                <div className="flex-1 flex items-center gap-[3px] h-8 overflow-hidden px-1">
                  {dailyWaveform.map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        i < 5
                          ? 'bg-[#735c00]'
                          : i < 9
                          ? 'bg-[#735c00]/60'
                          : 'bg-[#735c00]/30'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    playHapticSound();
                    onOpenSalon(
                      'newton',
                      'Monsieur Newton, pourquoi la Lune ne tombe-t-elle pas sur la Terre ?'
                    );
                  }}
                  className="flex items-center gap-1 text-[#735c00] hover:text-[#574500] text-[12px] font-semibold px-2 py-1 rounded-lg hover:bg-white/80 transition-colors flex-shrink-0 focus:outline-none"
                >
                  <span>Répondre</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Epoch & Field Filter Pills */}
      <section className="py-2">
        <div className="px-4 sm:px-6 mb-1.5 flex items-center justify-between">
          <span className="font-sans text-[11px] text-[#45464d] font-semibold uppercase tracking-wider">
            Disciplines Fondatrices
          </span>
          <span className="font-sans text-[11px] text-[#735c00] font-medium">5 Domaines</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 no-scrollbar pb-1">
          {[
            { id: 'all', label: 'Tous les Savants' },
            { id: 'physique', label: 'Physique & Gravité' },
            { id: 'maths', label: 'Mathématiques' },
            { id: 'philosophie', label: 'Philosophie Morale' },
            { id: 'chimie', label: 'Radiochimie' }
          ].map(tag => {
            const isActive = filterDomain === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => {
                  playHapticSound();
                  onSetFilterDomain(tag.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium flex-shrink-0 transition-all focus:outline-none ${
                  isActive
                    ? 'bg-black text-[#ffe088] shadow-sm font-semibold'
                    : 'bg-[#e7e8e9] text-[#45464d] hover:bg-[#e1e3e4]'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Section Header */}
      <div className="px-4 sm:px-6 pt-2 pb-1 flex items-end justify-between">
        <div>
          <h3 className="font-serif text-[20px] text-[#191c1d] font-semibold leading-tight">
            Prêts à converser
          </h3>
          <p className="font-sans text-[12px] text-[#45464d]">
            Interlocuteurs historiques en salon synchrone
          </p>
        </div>
        <span className="inline-flex items-center gap-1 font-sans text-[11px] text-[#735c00] font-semibold px-2 py-0.5 rounded-full bg-[#fed65b]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#735c00]"></span>
          Direct
        </span>
      </div>

      {/* 4. Scholar Cards List */}
      <section className="px-4 sm:px-6 py-2 flex flex-col gap-3.5">
        {filteredScholars.map(scholar => {
          return (
            <article
              key={scholar.id}
              className="scholar-card relative rounded-2xl bg-white p-4 shadow-[0_4px_16px_-2px_rgba(17,26,54,0.05)] border border-[#0B132B]/5 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3.5">
                {/* Scholar Image with Status Pill */}
                <div className="relative flex-shrink-0">
                  <img
                    className="w-16 h-16 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                    src={scholar.bustUrl}
                    alt={scholar.name}
                  />
                  {scholar.id === 'newton' && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#735c00] text-white flex items-center justify-center shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    </span>
                  )}
                  {scholar.id === 'pythagore' && (
                    <span className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-full bg-[#111a36] text-[#dbe1ff] text-[9px] font-bold">
                      HARMONIE
                    </span>
                  )}
                  {scholar.id === 'socrate' && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#735c00] text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[11px]">forum</span>
                    </span>
                  )}
                  {scholar.id === 'curie' && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#ffe088] text-[#241a00] flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[11px] fill-1">science</span>
                    </span>
                  )}
                </div>

                {/* Scholar Meta & Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#fed65b]/30 text-[#745c00] text-[10px] font-bold tracking-wider uppercase">
                      {scholar.badge}
                    </span>
                    <span className="text-[#76767e] text-[11px]">{scholar.epoch}</span>
                  </div>

                  <h4 className="font-serif text-[18px] text-[#191c1d] font-semibold truncate leading-tight">
                    {scholar.name}
                  </h4>

                  <p className="font-sans text-[12px] text-[#45464d] line-clamp-1 mb-2.5 leading-relaxed">
                    {scholar.quote}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-gray-50">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#735c00] font-medium">
                      <span className="material-symbols-outlined text-[15px]">
                        {scholar.id === 'pythagore'
                          ? 'headphones'
                          : scholar.id === 'socrate'
                          ? 'psychology'
                          : scholar.id === 'curie'
                          ? 'biotech'
                          : 'record_voice_over'}
                      </span>
                      {scholar.statusText}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playHapticSound();
                          onViewManuscript(scholar);
                        }}
                        className="w-9 h-9 rounded-full bg-[#edeeef] text-[#191c1d] hover:bg-[#e7e8e9] flex items-center justify-center transition-colors focus:outline-none"
                        title="Consulter le manuscrit & théorèmes"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {scholar.id === 'pythagore'
                            ? 'music_note'
                            : scholar.id === 'socrate'
                            ? 'history_edu'
                            : scholar.id === 'curie'
                            ? 'description'
                            : 'menu_book'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          playHarmonicChime(440, 0.3);
                          onOpenSalon(scholar.id);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-black hover:bg-gray-800 text-[#ffe088] flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        <span className="font-sans text-[12px] font-semibold">
                          {scholar.id === 'socrate' ? 'Débattre' : 'Parler'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* 5. Neo-Classical Wisdom Quote Footer Ribbon */}
      <section className="px-4 sm:px-6 pt-5 pb-2">
        <div className="rounded-2xl bg-[#f3f4f5] border border-gray-200/60 p-4 text-center relative overflow-hidden">
          <div className="flex items-center justify-center mb-1 text-[#735c00]">
            <span className="material-symbols-outlined text-[20px]">auto_stories</span>
          </div>
          <p className="font-serif text-[14px] italic text-[#45464d] leading-normal mb-1">
            « Savoir pour prévoir, afin de pouvoir. »
          </p>
          <span className="font-sans text-[10px] text-[#76767e] tracking-wider uppercase font-semibold">
            Archives Vivantes d’Agora • Volume MMXXIV
          </span>
        </div>
      </section>
    </div>
  );
};
