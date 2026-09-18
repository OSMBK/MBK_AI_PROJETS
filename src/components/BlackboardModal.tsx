import React, { useState, useRef } from 'react';
import { playHarmonicChime, playHapticSound } from '../utils/audio';

interface BlackboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlackboardModal: React.FC<BlackboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pythagore' | 'gravity' | 'prism' | 'draw'>('pythagore');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen) return null;

  // Simple chalkboard drawing logic
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#ffe088';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#111a36] text-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px] text-[#ffe088]">architecture</span>
            <div>
              <h3 className="font-serif text-[18px] sm:text-[20px] font-bold">
                Tableau Noir d'Expérimentation
              </h3>
              <p className="font-sans text-[11px] text-[#7a83a4]">
                Élucidation géométrique & démonstrations des maîtres
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playHapticSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 p-3 bg-black/30 border-b border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'pythagore', label: 'Théorème des Aires (Pythagore)' },
            { id: 'gravity', label: 'Loi Gravitationnelle (Newton)' },
            { id: 'prism', label: 'Spectre du Prisme (Opticks)' },
            { id: 'draw', label: 'Ardoise Libre' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                playHapticSound();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-[#fed65b] text-black font-bold shadow-sm'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visualizer Area */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[280px]">
          {activeTab === 'pythagore' && (
            <div className="flex flex-col items-center gap-4 text-center max-w-md animate-in fade-in">
              <svg className="w-56 h-56" viewBox="0 0 100 100">
                <polygon
                  fill="none"
                  points="25,75 75,75 25,35"
                  stroke="#ffe088"
                  strokeWidth="2.5"
                ></polygon>
                <rect fill="none" height="10" stroke="#ffe088" strokeWidth="1.5" width="10" x="25" y="65"></rect>
                <rect fill="#fed65b" fillOpacity="0.25" height="20" stroke="#fed65b" strokeWidth="1" width="20" x="5" y="75"></rect>
                <rect fill="#e9c349" fillOpacity="0.25" height="40" stroke="#e9c349" strokeWidth="1" width="20" x="5" y="35"></rect>
                <polygon fill="#ffe088" fillOpacity="0.3" points="25,35 75,75 99,45 49,5" stroke="#ffe088" strokeWidth="1"></polygon>
              </svg>
              <div>
                <p className="font-serif text-[20px] text-[#ffe088] font-bold">a² + b² = c²</p>
                <p className="font-sans text-[12px] text-white/80 mt-1">
                  Dans le triangle rectangle, le carré de l'hypoténuse est rigoureusement égal à la somme des carrés des deux autres côtés.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'gravity' && (
            <div className="flex flex-col items-center gap-4 text-center max-w-md animate-in fade-in">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full">
                <p className="font-serif text-[24px] text-[#ffe088] font-bold mb-2">
                  F = G · (m₁ · m₂) / r²
                </p>
                <div className="flex items-center justify-around py-3">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#735c00] flex items-center justify-center text-white font-bold">
                      ⊕
                    </div>
                    <span className="text-[10px] text-[#ffe088] mt-1">Masse Terre</span>
                  </div>
                  <span className="text-[#ffe088] text-[18px]">⟷</span>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black font-bold text-[10px]">
                      ☾
                    </div>
                    <span className="text-[10px] text-[#ffe088] mt-1">Masse Lune</span>
                  </div>
                </div>
              </div>
              <p className="font-sans text-[12px] text-white/80">
                La force gravitationnelle s'affaiblit avec le carré de la distance : éloigner un corps de deux fois réduit l'attraction par quatre.
              </p>
            </div>
          )}

          {activeTab === 'prism' && (
            <div className="flex flex-col items-center gap-4 text-center max-w-md animate-in fade-in">
              <div className="relative w-64 h-32 flex items-center justify-center">
                {/* Prism Triangle */}
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <polygon points="100,15 50,85 150,85" fill="rgba(255,255,255,0.1)" stroke="#ffe088" strokeWidth="2" />
                  {/* White light entering */}
                  <line x1="20" y1="50" x2="80" y2="50" stroke="#ffffff" strokeWidth="3" />
                  {/* Rainbow dispersion exiting */}
                  <line x1="120" y1="50" x2="185" y2="30" stroke="#ff4d4d" strokeWidth="2" />
                  <line x1="120" y1="50" x2="185" y2="40" stroke="#ffa64d" strokeWidth="2" />
                  <line x1="120" y1="50" x2="185" y2="50" stroke="#ffff4d" strokeWidth="2" />
                  <line x1="120" y1="50" x2="185" y2="60" stroke="#4dff4d" strokeWidth="2" />
                  <line x1="120" y1="50" x2="185" y2="70" stroke="#4d4dff" strokeWidth="2" />
                  <line x1="120" y1="50" x2="185" y2="80" stroke="#994dff" strokeWidth="2" />
                </svg>
              </div>
              <p className="font-sans text-[12px] text-white/80">
                L'Opticks de Newton prouve que la lumière blanche est un mélange indissociable de réfrangibilités distinctes.
              </p>
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full px-2 text-[11px] text-[#7a83a4]">
                <span>Dessinez à la craie d'or avec votre curseur ou doigt</span>
                <button
                  onClick={handleClear}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[#ffe088] text-[11px]"
                >
                  Effacer
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={500}
                height={220}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="w-full h-56 bg-black/40 rounded-2xl border border-white/10 cursor-crosshair touch-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              playHarmonicChime(440, 0.2);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#fed65b] text-black font-semibold text-[13px] hover:bg-[#ffe088]"
          >
            Fermer le tableau
          </button>
        </div>
      </div>
    </div>
  );
};
