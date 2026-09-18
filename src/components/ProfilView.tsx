import React, { useState } from 'react';
import { APP_ASSETS, SCHOLARS } from '../data/scholars';
import { playHapticSound, playHarmonicChime } from '../utils/audio';

export const ProfilView: React.FC = () => {
  const [highFidelity, setHighFidelity] = useState(true);
  const [continuousVoice, setContinuousVoice] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    playHarmonicChime(528, 0.3);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-32 pt-2 animate-in fade-in duration-300">
      {/* Toast */}
      {savedSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#111a36] text-[#ffe088] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[12px] font-semibold border border-[#fed65b]/30 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Préférences acoustiques enregistrées !</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="px-4 sm:px-6 pt-3 pb-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B132B]/5 flex items-center gap-4">
          <div className="relative">
            <img
              src={APP_ASSETS.profile}
              alt="Avatar Initié"
              className="w-16 h-16 rounded-full object-cover ring-3 ring-[#735c00]/30 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#735c00] text-white flex items-center justify-center text-[11px] shadow-sm">
              <span className="material-symbols-outlined text-[13px] fill-1">verified</span>
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="px-2.5 py-0.5 rounded bg-[#fed65b]/30 text-[#735c00] font-sans text-[10px] font-bold tracking-wider uppercase self-start mb-1">
              Compagnon de l'Agora • Degré III
            </span>
            <h2 className="font-serif text-[20px] sm:text-[22px] text-[#191c1d] font-bold truncate">
              Ouro-Sama Moubarak
            </h2>
            <p className="font-sans text-[12px] text-[#45464d]">
              Disciple des Sciences Fondatrices & Métaphysique
            </p>
          </div>
        </div>
      </div>

      {/* Intellectual Statistics Bento */}
      <div className="px-4 sm:px-6 py-2">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3.5 rounded-2xl border border-[#0B132B]/5 shadow-xs">
            <span className="font-serif text-[20px] font-bold text-[#191c1d] block">4 h 20</span>
            <span className="font-sans text-[10px] text-[#76767e] uppercase font-semibold">
              Dialogue Vocal
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#0B132B]/5 shadow-xs">
            <span className="font-serif text-[20px] font-bold text-[#735c00] block">18</span>
            <span className="font-sans text-[10px] text-[#76767e] uppercase font-semibold">
              Théorèmes Élucidés
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#0B132B]/5 shadow-xs">
            <span className="font-serif text-[20px] font-bold text-[#191c1d] block">4</span>
            <span className="font-sans text-[10px] text-[#76767e] uppercase font-semibold">
              Maîtres Fréquentés
            </span>
          </div>
        </div>
      </div>

      {/* Sceaux des Savants Fréquentés */}
      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-3">
        <h3 className="font-serif text-[18px] text-[#191c1d] font-semibold">
          Affinités Académiques Débloquées
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {SCHOLARS.map(s => (
            <div
              key={s.id}
              className="bg-white p-3 rounded-2xl border border-[#0B132B]/5 shadow-xs flex items-center gap-3"
            >
              <img
                src={s.avatarUrl}
                alt={s.name}
                className="w-11 h-11 rounded-full object-cover ring-1 ring-black/5"
              />
              <div className="min-w-0">
                <span className="font-serif text-[13px] font-semibold text-[#191c1d] block truncate">
                  {s.name}
                </span>
                <span className="font-sans text-[10px] text-[#735c00] block truncate">
                  {s.domain.split('&')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audio & Synthesizer Settings */}
      <div className="px-4 sm:px-6 pt-6 flex flex-col gap-3">
        <h3 className="font-serif text-[18px] text-[#191c1d] font-semibold">
          Restitution Vocale & Paramètres Acoustiques
        </h3>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#0B132B]/5 flex flex-col gap-3 divide-y divide-gray-100">
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="font-sans text-[13px] font-bold text-[#191c1d]">
                Haute Fidélité Acoustique (96 kHz)
              </span>
              <span className="font-sans text-[11px] text-[#76767e]">
                Rendu spatial et harmoniques des voix des siècles passés
              </span>
            </div>
            <button
              onClick={() => {
                playHapticSound();
                setHighFidelity(!highFidelity);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                highFidelity ? 'bg-[#735c00]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  highFidelity ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex flex-col">
              <span className="font-sans text-[13px] font-bold text-[#191c1d]">
                Capture Vocale Continue
              </span>
              <span className="font-sans text-[11px] text-[#76767e]">
                Détection automatique du silence sans maintien du bouton
              </span>
            </div>
            <button
              onClick={() => {
                playHapticSound();
                setContinuousVoice(!continuousVoice);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                continuousVoice ? 'bg-[#735c00]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  continuousVoice ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 rounded-xl bg-black text-[#ffe088] text-[12px] font-semibold hover:bg-gray-900 transition-all shadow-sm active:scale-95 focus:outline-none"
            >
              Sauvegarder les réglages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
