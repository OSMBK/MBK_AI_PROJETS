import React from 'react';
import { ScreenType } from '../types';
import { playHapticSound } from '../utils/audio';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
  const navItems: { id: ScreenType; label: string; icon: string }[] = [
    { id: 'pantheon', label: 'Panthéon', icon: 'account_balance' },
    { id: 'salon-vocal', label: 'Salon Vocal', icon: 'record_voice_over' },
    { id: 'codex', label: 'Codex', icon: 'auto_stories' },
    { id: 'profil', label: 'Profil', icon: 'psychology' }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#f8f9fa]/95 backdrop-blur-xl border-t border-[#0B132B]/5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2">
        {navItems.map(item => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playHapticSound();
                onNavigate(item.id);
              }}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] gap-1 transition-all focus:outline-none ${
                isActive
                  ? 'text-[#000000] font-semibold scale-105'
                  : 'text-[#45464d] hover:text-[#191c1d] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[22px] transition-colors ${
                    isActive ? 'text-[#000000] font-bold' : 'text-[#45464d]'
                  }`}
                >
                  {item.icon}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#735c00]"></span>
                )}
              </div>
              <span className={`font-sans text-[11px] leading-tight ${isActive ? 'font-semibold text-black' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
