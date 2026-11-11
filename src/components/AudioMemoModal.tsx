import React, { useState, useEffect } from 'react';
import { ScholarId, StudentVocalNote } from '../types';
import { SCHOLARS } from '../data/scholars';
import { playHarmonicChime, playHapticSound } from '../utils/audio';

interface AudioMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNote: (note: StudentVocalNote) => void;
}

export const AudioMemoModal: React.FC<AudioMemoModalProps> = ({
  isOpen,
  onClose,
  onSubmitNote
}) => {
  const [selectedScholarId, setSelectedScholarId] = useState<ScholarId>('newton');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTranscript, setNoteTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration(sec => sec + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const targetScholar = SCHOLARS.find(s => s.id === selectedScholarId) || SCHOLARS[0];

  const handleToggleRecord = () => {
    playHarmonicChime(isRecording ? 380 : 540, 0.2);
    if (!isRecording) {
      setIsRecording(true);
      if (!noteTitle) {
        setNoteTitle('Méditation sur les principes premiers');
      }
      if (!noteTranscript) {
        setNoteTranscript('« J\'ai interrogé l\'harmonie céleste et la gravitation. Comment concilier la force corpusculaire avec l\'infinité du vide ? »');
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteTranscript.trim()) return;

    playHarmonicChime(580, 0.4);

    let feedbackStatus: 'Validé' | 'En débat' | 'À creuser' = 'Validé';
    let feedbackText = '';

    if (selectedScholarId === 'newton') {
      feedbackStatus = 'Validé';
      feedbackText = `Remarquable réflexion. Vous avez discerné l'équilibre entre masse inertielle et masse gravitationnelle. Relisez le Scholium général.`;
    } else if (selectedScholarId === 'pythagore') {
      feedbackStatus = 'Validé';
      feedbackText = `L'harmonie que vous cherchez se vérifie dans le rapport 3:4:5 des triangles sacrés. Le nombre vous éclairera.`;
    } else if (selectedScholarId === 'socrate') {
      feedbackStatus = 'En débat';
      feedbackText = `Mais que nommez-vous le vide, mon ami ? Ce qui ne contient rien, ou ce qui attend d'être défini par l'esprit ? Poursuivons.`;
    } else if (selectedScholarId === 'curie') {
      feedbackStatus = 'À creuser';
      feedbackText = `L'hypothèse mérite une contre-épreuve minutieuse au laboratoire avec des sels d'urane. Mesurez l'ionisation avec soin.`;
    } else {
      feedbackStatus = 'Validé';
      feedbackText = `Excellente déduction géométrique. La vérité réside dans l'exacte proportion des sections coniques. Poursuivez votre contemplation.`;
    }

    const newNote: StudentVocalNote = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      timestamp: 'À l\'instant',
      duration: `01:${String(recordDuration || 14).padStart(2, '0')}`,
      studentTranscript: noteTranscript.startsWith('«') ? noteTranscript : `« ${noteTranscript} »`,
      feedbackScholarId: selectedScholarId,
      feedbackScholarName: targetScholar.name.split(' ')[0],
      feedbackStatus,
      feedbackText
    };

    onSubmitNote(newNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95">
        <div className="bg-[#111a36] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#735c00] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-bold">Nouveau Mémo Vocal</h3>
              <p className="font-sans text-[11px] text-[#ffe088]">Pour votre tuteur savant</p>
            </div>
          </div>
          <button
            onClick={() => {
              playHapticSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full text-white/70 hover:text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Choose Tutor Scholar */}
          <div>
            <label className="block font-sans text-[11px] font-bold text-[#76767e] uppercase tracking-wider mb-1.5">
              Choisir le Maître Référent
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SCHOLARS.map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    playHapticSound();
                    setSelectedScholarId(s.id);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    selectedScholarId === s.id
                      ? 'border-[#735c00] bg-[#fed65b]/15 text-[#191c1d] font-semibold ring-1 ring-[#735c00]'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                >
                  <img src={s.avatarUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-serif text-[12px] truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-sans text-[11px] font-bold text-[#76767e] uppercase tracking-wider mb-1.5">
              Titre de la Méditation
            </label>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={e => setNoteTitle(e.target.value)}
              placeholder="Ex: Réflexion sur la nature des corps..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
            />
          </div>

          {/* Record button or transcript input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-sans text-[11px] font-bold text-[#76767e] uppercase tracking-wider">
                Transcription Vocale ou Pensée
              </label>
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#edeeef] text-[#191c1d] hover:bg-gray-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isRecording ? 'stop' : 'mic'}
                </span>
                <span>{isRecording ? `Enregistrement (${recordDuration}s)` : 'Simuler Dictée'}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={noteTranscript}
              onChange={e => setNoteTranscript(e.target.value)}
              placeholder="Formulez votre question ou méditation scientifique..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-serif italic focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 text-[13px] hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-black text-[#ffe088] text-[13px] font-semibold hover:bg-gray-800 shadow-md active:scale-95"
            >
              Envoyer au Savant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
