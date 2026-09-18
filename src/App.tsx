import React, { useState } from 'react';
import { ScreenType, ScholarId, Scholar, AudioMemo, StudentVocalNote } from './types';
import { SCHOLARS } from './data/scholars';
import { INITIAL_AUDIO_MEMOS, INITIAL_STUDENT_NOTES } from './data/codexData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PantheonView } from './components/PantheonView';
import { SalonVocalView } from './components/SalonVocalView';
import { SessionImmersiveView } from './components/SessionImmersiveView';
import { CodexView } from './components/CodexView';
import { ProfilView } from './components/ProfilView';
import { AudioMemoModal } from './components/AudioMemoModal';
import { BlackboardModal } from './components/BlackboardModal';
import { ManuscriptModal } from './components/ManuscriptModal';
import { playHarmonicChime, playHapticSound } from './utils/audio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('pantheon');
  const [selectedScholarId, setSelectedScholarId] = useState<ScholarId>('newton');
  const [salonInitialPrompt, setSalonInitialPrompt] = useState<string | undefined>(undefined);
  const [filterDomain, setFilterDomain] = useState<string>('all');

  const [memos, setMemos] = useState<AudioMemo[]>(INITIAL_AUDIO_MEMOS);
  const [studentNotes, setStudentNotes] = useState<StudentVocalNote[]>(INITIAL_STUDENT_NOTES);

  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isBlackboardOpen, setIsBlackboardOpen] = useState<boolean>(false);
  const [inspectingScholar, setInspectingScholar] = useState<Scholar | null>(null);

  // Navigate to Immersive Session
  const handleStartCall = (scholarId: ScholarId) => {
    playHarmonicChime(528, 0.4);
    setSelectedScholarId(scholarId);
    setCurrentScreen('session-immersive');
  };

  // Open Salon Vocal & Chat
  const handleOpenSalon = (scholarId: ScholarId, promptMessage?: string) => {
    playHarmonicChime(440, 0.3);
    setSelectedScholarId(scholarId);
    setSalonInitialPrompt(promptMessage);
    setCurrentScreen('salon-vocal');
  };

  // Save teaching directly to Codex
  const handleSaveToCodex = (title: string, text: string, scholarId: ScholarId) => {
    const targetScholar = SCHOLARS.find(s => s.id === scholarId) || SCHOLARS[0];
    const newMemo: AudioMemo = {
      id: `memo-${Date.now()}`,
      scholarId,
      scholarName: targetScholar.name,
      scholarAvatar: targetScholar.avatarUrl,
      category: targetScholar.domainCategory === 'physique' ? 'Physique' : 'Philosophie',
      topic: `${targetScholar.badge} • ${targetScholar.location.split(',')[0]}`,
      title,
      quoteExcerpt: text,
      duration: '02:15',
      currentProgress: '00:00',
      recordedDate: 'Aujourd\'hui',
      tag: 'Archivé au Salon',
      audioPlayedPercent: 0
    };
    setMemos(prev => [newMemo, ...prev]);
  };

  // Add new vocal student note
  const handleAddStudentNote = (note: StudentVocalNote) => {
    setStudentNotes(prev => [note, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col selection:bg-[#fed65b]/40">
      {/* App Header (Shown on standard screens) */}
      {currentScreen !== 'session-immersive' && (
        <Header
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onSelectDomain={domain => setFilterDomain(domain)}
        />
      )}

      {/* Main Screen Content */}
      <main
        className={`flex-1 w-full ${
          currentScreen !== 'session-immersive' ? 'pt-16' : ''
        }`}
      >
        {currentScreen === 'pantheon' && (
          <PantheonView
            onStartCall={handleStartCall}
            onOpenSalon={handleOpenSalon}
            filterDomain={filterDomain}
            onSetFilterDomain={setFilterDomain}
            onViewManuscript={scholar => setInspectingScholar(scholar)}
          />
        )}

        {currentScreen === 'salon-vocal' && (
          <SalonVocalView
            currentScholarId={selectedScholarId}
            onSelectScholar={setSelectedScholarId}
            onOpenImmersive={handleStartCall}
            onSaveToCodex={handleSaveToCodex}
            onOpenBlackboard={() => setIsBlackboardOpen(true)}
            initialPrompt={salonInitialPrompt}
          />
        )}

        {currentScreen === 'session-immersive' && (
          <SessionImmersiveView
            scholarId={selectedScholarId}
            onBack={() => setCurrentScreen('pantheon')}
            onOpenBlackboard={() => setIsBlackboardOpen(true)}
          />
        )}

        {currentScreen === 'codex' && (
          <CodexView
            memos={memos}
            studentNotes={studentNotes}
            onOpenNewMemoModal={() => setIsAudioModalOpen(true)}
            onOpenSalon={handleOpenSalon}
          />
        )}

        {currentScreen === 'profil' && <ProfilView />}
      </main>

      {/* Fixed Bottom Navigation Bar (Hidden during Immersive Session) */}
      {currentScreen !== 'session-immersive' && (
        <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}

      {/* Modals */}
      <AudioMemoModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSubmitNote={handleAddStudentNote}
      />

      <BlackboardModal
        isOpen={isBlackboardOpen}
        onClose={() => setIsBlackboardOpen(false)}
      />

      <ManuscriptModal
        scholar={inspectingScholar}
        onClose={() => setInspectingScholar(null)}
        onOpenDialogue={scholar => {
          setInspectingScholar(null);
          handleOpenSalon(scholar.id);
        }}
      />
    </div>
  );
}
