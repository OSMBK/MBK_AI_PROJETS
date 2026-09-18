import React, { useState, useEffect } from 'react';
import { AudioMemo, StudentVocalNote, ScholarId } from '../types';
import { playHarmonicChime, playHapticSound, speakText, stopSpeaking } from '../utils/audio';

interface CodexViewProps {
  memos: AudioMemo[];
  studentNotes: StudentVocalNote[];
  onOpenNewMemoModal: () => void;
  onOpenSalon: (scholarId: ScholarId) => void;
}

export const CodexView: React.FC<CodexViewProps> = ({
  memos,
  studentNotes,
  onOpenNewMemoModal,
  onOpenSalon
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [playingMemoId, setPlayingMemoId] = useState<string | null>('memo-1');
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(74); // 01:14
  const [totalTimeSec] = useState<number>(165); // 02:45
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Filter memos
  const filteredMemos = memos.filter(m => {
    if (activeFilter === 'all') return true;
    return m.category.toLowerCase().includes(activeFilter.toLowerCase());
  });

  // Dynamic progress counter when memo-1 is playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playingMemoId) {
      interval = setInterval(() => {
        setCurrentTimeSec(prev => (prev >= totalTimeSec ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playingMemoId, totalTimeSec]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleTogglePlay = (memo: AudioMemo) => {
    playHapticSound();
    if (playingMemoId === memo.id) {
      stopSpeaking();
      setPlayingMemoId(null);
    } else {
      setPlayingMemoId(memo.id);
      playHarmonicChime(480, 0.3);
      speakText(memo.quoteExcerpt, {
        onEnd: () => setPlayingMemoId(null)
      });
    }
  };

  const handleSkip = (seconds: number) => {
    playHapticSound();
    setCurrentTimeSec(prev => Math.max(0, Math.min(totalTimeSec, prev + seconds)));
  };

  const handleDownload = (title: string) => {
    playHarmonicChime(520, 0.2);
    setDownloadToast(`Synthèse « ${title} » archivée en fichier audio local !`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-36 pt-2 animate-in fade-in duration-300">
      {/* Toast */}
      {downloadToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#111a36] text-[#ffe088] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[12px] font-semibold border border-[#fed65b]/30 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[16px]">download_done</span>
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Header Context */}
      <div className="px-4 sm:px-6 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#735c00] animate-pulse"></span>
            <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-widest text-[#735c00] font-bold">
              Archives & Synthèses
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edeeef] text-[#45464d] font-sans text-[11px] font-semibold">
            Semestre I
          </span>
        </div>

        <h2 className="font-serif text-[24px] sm:text-[28px] text-[#191c1d] font-semibold tracking-tight">
          Le Codex Vocal
        </h2>
        <p className="font-sans text-[13px] sm:text-[14px] text-[#45464d] leading-relaxed">
          Réécoutez la parole vive de vos maîtres et parcourez vos dialogues méditatifs transcrits.
        </p>
      </div>

      {/* Académie Metrics (Dual Metric Bento) */}
      <div className="px-4 sm:px-6 py-2">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Metric 1: Listening Time */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#0B132B]/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#fed65b]/20 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-full bg-[#fed65b]/40 flex items-center justify-center text-[#735c00]">
                <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
              </div>
              <span className="font-sans text-[11px] text-[#735c00] font-bold">+45 min ajd</span>
            </div>
            <div>
              <span className="font-serif text-[20px] sm:text-[22px] text-[#191c1d] font-bold block leading-tight">
                4 h 20 min
              </span>
              <span className="font-sans text-[11px] text-[#45464d] mt-0.5 block">
                d'échanges vocaux
              </span>
            </div>
          </div>

          {/* Metric 2: Theorems Unlocked */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#0B132B]/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#dbe1ff]/40 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-full bg-[#edeeef] flex items-center justify-center text-[#191c1d]">
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
              </div>
              <span className="font-sans text-[11px] text-[#45464d] font-semibold">Maîtrise 82%</span>
            </div>
            <div>
              <span className="font-serif text-[20px] sm:text-[22px] text-[#191c1d] font-bold block leading-tight">
                18 théorèmes
              </span>
              <span className="font-sans text-[11px] text-[#45464d] mt-0.5 block">
                élucidés & archivés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Epoch / Discipline Pills */}
      <div className="px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Tous les mémos', icon: 'auto_awesome' },
          { id: 'géométrie', label: 'Géométrie' },
          { id: 'optique', label: 'Optique' },
          { id: 'métaphysique', label: 'Métaphysique' }
        ].map(filter => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => {
                playHapticSound();
                setActiveFilter(filter.id);
              }}
              className={`px-4 py-1.5 rounded-full font-sans text-[12px] shrink-0 flex items-center gap-1.5 transition-all focus:outline-none ${
                isActive
                  ? 'bg-[#111a36] text-white font-semibold shadow-sm'
                  : 'bg-white text-[#45464d] hover:bg-gray-100 border border-gray-200/60'
              }`}
            >
              {filter.icon && (
                <span className="material-symbols-outlined text-[15px] text-[#ffe088]">
                  {filter.icon}
                </span>
              )}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Extraits Audio & Synthèses Mémorables */}
      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#735c00] text-[20px]">
              record_voice_over
            </span>
            <h3 className="font-serif text-[18px] sm:text-[20px] text-[#191c1d] font-semibold">
              Extraits & Synthèses Mémorables
            </h3>
          </div>
          <span className="font-sans text-[11px] text-[#76767e]">
            {filteredMemos.length} enregistrements
          </span>
        </div>

        {/* Memos List */}
        {filteredMemos.map(memo => {
          const isCurrentlyPlaying = playingMemoId === memo.id;

          if (memo.id === 'memo-1') {
            // First memo with full active player
            return (
              <div
                key={memo.id}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#0B132B]/5 flex flex-col gap-3.5 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-2 ring-[#735c00]/20">
                      <img
                        className="w-full h-full object-cover"
                        src={memo.scholarAvatar}
                        alt={memo.scholarName}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="px-2 py-0.5 self-start rounded bg-[#fed65b]/30 text-[#735c00] font-sans text-[10px] font-bold tracking-wider uppercase mb-1">
                        {memo.topic}
                      </span>
                      <h4 className="font-serif text-[16px] sm:text-[17px] text-[#191c1d] font-semibold leading-snug line-clamp-2">
                        {memo.title}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(memo.title)}
                    className="w-9 h-9 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] flex items-center justify-center text-[#45464d] hover:text-[#735c00] shrink-0 transition-colors focus:outline-none"
                    title="Télécharger l'extrait"
                  >
                    <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                  </button>
                </div>

                {/* Live Dynamic Player Component */}
                <div className="bg-[#f3f4f5] rounded-xl p-3 flex flex-col gap-2 border border-gray-100">
                  <div className="flex items-center justify-between font-sans text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCurrentlyPlaying ? 'bg-[#735c00] animate-ping' : 'bg-gray-400'
                        }`}
                      ></span>
                      <span className="text-[#191c1d] font-semibold">
                        {isCurrentlyPlaying ? 'Lecture en cours' : 'Prêt à l\'écoute'}
                      </span>
                    </div>
                    <span className="font-sans text-[11px] text-[#735c00] font-semibold">
                      {formatSeconds(currentTimeSec)} / {formatSeconds(totalTimeSec)}
                    </span>
                  </div>

                  {/* Waveform Bars */}
                  <div className="flex items-end justify-between h-9 px-1 gap-[3px] py-1">
                    {[12, 20, 28, 16, 32, 24, 34, 18, 28, 20, 14].map((h, i) => (
                      <span
                        key={`played-${i}`}
                        style={{ height: `${isCurrentlyPlaying ? Math.min(36, h + (i % 3) * 4) : h}px` }}
                        className={`w-1 rounded-full transition-all duration-200 ${
                          isCurrentlyPlaying ? 'bg-[#735c00]' : 'bg-[#735c00]/60'
                        }`}
                      />
                    ))}
                    {[22, 30, 20, 16, 28, 14, 24, 16, 8].map((h, i) => (
                      <span
                        key={`unplayed-${i}`}
                        style={{ height: `${h}px` }}
                        className="w-1 bg-[#e1e3e4] rounded-full"
                      />
                    ))}
                  </div>

                  {/* Player Controls Strip */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleSkip(-10)}
                      className="text-[#45464d] hover:text-[#191c1d] transition-colors p-1"
                      title="Reculer de 10s"
                    >
                      <span className="material-symbols-outlined text-[20px]">replay_10</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePlay(memo)}
                        className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md active:scale-95 transition-transform focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-[22px] text-[#ffe088] fill-1">
                          {isCurrentlyPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleSkip(10)}
                      className="text-[#45464d] hover:text-[#191c1d] transition-colors p-1"
                      title="Avancer de 10s"
                    >
                      <span className="material-symbols-outlined text-[20px]">forward_10</span>
                    </button>
                  </div>
                </div>

                {/* Dialogue Excerpt Quote */}
                <div className="bg-[#f3f4f5]/60 border-l-2 border-[#735c00] rounded-r-xl p-3 flex flex-col gap-1">
                  <span className="font-sans text-[11px] text-[#735c00] font-bold">
                    Extrait de {memo.scholarName} :
                  </span>
                  <p className="font-serif text-[13px] text-[#45464d] italic leading-relaxed">
                    {memo.quoteExcerpt}
                  </p>
                </div>
              </div>
            );
          } else {
            // Secondary memos (Newton, Socrates)
            return (
              <div
                key={memo.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#0B132B]/5 flex flex-col gap-3 transition-all hover:bg-gray-50/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-1 ring-black/5">
                      <img
                        className="w-full h-full object-cover"
                        src={memo.scholarAvatar}
                        alt={memo.scholarName}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="px-2 py-0.5 self-start rounded bg-[#fed65b]/20 text-[#735c00] font-sans text-[10px] font-bold tracking-wider uppercase mb-1">
                        {memo.topic}
                      </span>
                      <h4 className="font-serif text-[16px] text-[#191c1d] font-semibold leading-snug line-clamp-2">
                        {memo.title}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(memo.title)}
                    className="w-9 h-9 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] flex items-center justify-center text-[#45464d] hover:text-[#735c00] shrink-0 transition-colors focus:outline-none"
                    title="Télécharger l'audio"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleTogglePlay(memo)}
                      className="w-9 h-9 rounded-full bg-[#111a36] text-[#ffe088] flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 shadow-sm focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px] fill-1">
                        {isCurrentlyPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <div className="flex flex-col">
                      <span className="font-sans text-[12px] text-[#191c1d] font-medium">
                        {memo.id === 'memo-2' ? 'Synthèse didactique' : 'Controverse & Maïeutique'}
                      </span>
                      <span className="font-sans text-[10px] text-[#76767e]">
                        Durée : {memo.duration} • {memo.recordedDate}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#edeeef] text-[#45464d] font-sans text-[10px] font-semibold">
                    {memo.tag}
                  </span>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Section 2: Notes Vocales de l'Étudiant & Retours Pédagogiques */}
      <div className="px-4 sm:px-6 pt-6 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#735c00] text-[20px]">mic</span>
            <h3 className="font-serif text-[18px] sm:text-[20px] text-[#191c1d] font-semibold">
              Notes Vocales de l'Étudiant
            </h3>
          </div>
          <span
            onClick={onOpenNewMemoModal}
            className="font-sans text-[11px] text-[#735c00] font-semibold cursor-pointer hover:underline"
          >
            Nouvelle Note +
          </span>
        </div>

        {studentNotes.map(note => (
          <div
            key={note.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#0B132B]/5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#f3f4f5] flex items-center justify-center text-[#191c1d]">
                  <span className="material-symbols-outlined text-[15px]">record_voice_over</span>
                </div>
                <span className="font-sans text-[13px] text-[#191c1d] font-bold">{note.title}</span>
              </div>
              <span className="font-sans text-[11px] text-[#76767e]">
                {note.timestamp} • {note.duration}
              </span>
            </div>

            <p className="font-serif text-[13px] text-[#45464d] bg-[#f3f4f5] p-3 rounded-xl italic leading-relaxed">
              {note.studentTranscript}
            </p>

            {/* Scholar Pedagogical Feedback Box */}
            <div className="bg-[#111a36]/5 border border-[#111a36]/10 p-3 rounded-xl flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111a36] text-[#ffe088] flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-sans text-[11px] font-bold text-[#111a36]">
                    Retour de {note.feedbackScholarName}
                  </span>
                  <span
                    className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      note.feedbackStatus === 'Validé'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {note.feedbackStatus}
                  </span>
                </div>
                <p className="font-sans text-[12px] text-[#45464d] mt-1 leading-relaxed">
                  {note.feedbackText}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Sticky Action Trigger: Nouveau Mémo Audio */}
      <div className="fixed bottom-24 inset-x-0 px-4 flex justify-center z-40 pointer-events-none">
        <button
          onClick={() => {
            playHarmonicChime(528, 0.4);
            onOpenNewMemoModal();
          }}
          id="recordMemoTrigger"
          className="pointer-events-auto bg-black text-white pl-4 pr-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all focus:outline-none border border-white/10"
        >
          <div className="w-9 h-9 rounded-full bg-[#735c00] text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[20px] fill-1">mic</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-sans text-[12px] font-bold leading-none text-white">
              Créer un mémo audio
            </span>
            <span className="font-sans text-[10px] text-[#ffe088] opacity-90 leading-none mt-1">
              Pour mon tuteur savant
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
