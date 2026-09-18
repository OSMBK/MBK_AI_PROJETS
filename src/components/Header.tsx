import React, { useState } from 'react';
import { ScreenType } from '../types';
import { APP_ASSETS } from '../data/scholars';
import { playHapticSound } from '../utils/audio';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onSelectDomain?: (domain: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, onSelectDomain }) => {
  const [showDomainMenu, setShowDomainMenu] = useState(false);

  const getSubtitle = () => {
    switch (currentScreen) {
      case 'pantheon':
        return 'PANTHEON';
      case 'salon-vocal':
        return 'SALON VOCAL ET CHAT';
      case 'session-immersive':
        return 'SESSION IMMERSIVE';
      case 'codex':
        return 'CODEX DECOUVERTES';
      case 'profil':
        return 'PROFIL SAVOIR';
      default:
        return 'PANTHEON';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f8f9fa]/90 backdrop-blur-xl border-b border-[#0B132B]/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Logo & Subtitle */}
        <button
          onClick={() => {
            playHapticSound();
            onNavigate('pantheon');
          }}
          className="flex items-center gap-3 text-left min-w-0 group cursor-pointer focus:outline-none"
        >
          <img
            src={APP_ASSETS.logo}
            alt="Agora Savoirs Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col truncate">
            <span className="font-serif text-[18px] sm:text-[20px] font-semibold text-[#191c1d] leading-none truncate">
              Agora Savoirs
            </span>
            <span className="font-sans text-[10px] text-[#735c00] font-semibold tracking-wider uppercase leading-tight mt-0.5">
              {getSubtitle()}
            </span>
          </div>
        </button>

        {/* Right Actions: Savoirs Menu & Profile */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={() => {
                playHapticSound();
                setShowDomainMenu(!showDomainMenu);
              }}
              className="min-h-[40px] px-3 py-1.5 rounded-full bg-[#edeeef] flex items-center gap-1.5 text-[#191c1d] hover:bg-[#e7e8e9] transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[18px] text-[#735c00]">graphic_eq</span>
              <span className="font-sans text-[12px] font-medium text-[#45464d]">Savoirs</span>
              <span className="material-symbols-outlined text-[16px] text-[#76767e]">
                {showDomainMenu ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu for Savoirs */}
            {showDomainMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#0B132B]/8 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#735c00] border-b border-gray-100">
                  Disciplines Fondatrices
                </div>
                <button
                  onClick={() => {
                    onSelectDomain?.('all');
                    setShowDomainMenu(false);
                    onNavigate('pantheon');
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 flex items-center gap-2 text-gray-800"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#735c00]">auto_stories</span>
                  <span>Tous les Maîtres</span>
                </button>
                <button
                  onClick={() => {
                    onSelectDomain?.('physique');
                    setShowDomainMenu(false);
                    onNavigate('pantheon');
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 flex items-center gap-2 text-gray-800"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#735c00]">public</span>
                  <span>Physique & Gravité</span>
                </button>
                <button
                  onClick={() => {
                    onSelectDomain?.('maths');
                    setShowDomainMenu(false);
                    onNavigate('pantheon');
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 flex items-center gap-2 text-gray-800"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#735c00]">architecture</span>
                  <span>Géométrie Sacrée</span>
                </button>
                <button
                  onClick={() => {
                    onSelectDomain?.('philosophie');
                    setShowDomainMenu(false);
                    onNavigate('pantheon');
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 flex items-center gap-2 text-gray-800"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#735c00]">psychology</span>
                  <span>Philosophie Morale</span>
                </button>
                <button
                  onClick={() => {
                    onSelectDomain?.('chimie');
                    setShowDomainMenu(false);
                    onNavigate('pantheon');
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 flex items-center gap-2 text-gray-800"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#735c00]">science</span>
                  <span>Radiochimie</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => {
              playHapticSound();
              onNavigate('profil');
            }}
            aria-label="Profil Initié"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 transition-opacity ring-2 ring-[#735c00]/20 focus:outline-none"
          >
            <img
              src={APP_ASSETS.profile}
              alt="Profil Initié"
              className="w-8 h-8 rounded-full object-cover shadow-sm"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
