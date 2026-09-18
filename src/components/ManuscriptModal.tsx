import React from 'react';
import { Scholar } from '../types';
import { playHapticSound } from '../utils/audio';

interface ManuscriptModalProps {
  scholar: Scholar | null;
  onClose: () => void;
  onOpenDialogue: (scholar: Scholar) => void;
}

export const ManuscriptModal: React.FC<ManuscriptModalProps> = ({
  scholar,
  onClose,
  onOpenDialogue
}) => {
  if (!scholar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#f8f9fa] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#0B132B]/10 flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#111a36] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={scholar.avatarUrl}
              alt={scholar.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ffe088]/40"
            />
            <div>
              <span className="font-sans text-[10px] text-[#ffe088] font-bold uppercase tracking-wider">
                {scholar.badge}
              </span>
              <h3 className="font-serif text-[18px] font-bold">{scholar.name}</h3>
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-xs">
            <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-[#735c00]">
              Théorème & Principe Majeur
            </span>
            <h4 className="font-serif text-[17px] font-bold text-[#191c1d] mt-1">
              {scholar.theoremName}
            </h4>
            {scholar.theoremFormula && (
              <div className="my-2 p-2 bg-[#f3f4f5] rounded-xl text-center font-mono font-bold text-[#735c00] text-[15px]">
                {scholar.theoremFormula}
              </div>
            )}
            <p className="font-serif text-[14px] italic text-[#45464d] mt-2">
              « {scholar.quote} »
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-xs">
            <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-[#76767e]">
              Contexte Historique & Rayonnement
            </span>
            <p className="font-sans text-[13px] text-[#45464d] mt-1 leading-relaxed">
              Époque : <strong className="text-black">{scholar.epoch}</strong> • Lieu fondateur : <strong className="text-black">{scholar.location}</strong>.
            </p>
            <p className="font-sans text-[13px] text-[#45464d] mt-2 leading-relaxed">
              Timbre et restitution vocale : <span className="text-[#735c00] font-semibold">{scholar.voiceStyle}</span>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 text-[13px] hover:bg-gray-200"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenDialogue(scholar);
              }}
              className="px-5 py-2 rounded-xl bg-black text-[#ffe088] font-semibold text-[13px] hover:bg-gray-900 shadow-md active:scale-95"
            >
              Entrer en dialogue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
