import React from 'react';
import { useApp } from '../context/AppContext';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

interface LanguageSelectProps {
  onNext: () => void;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ onNext }) => {
  const { setLanguage } = useApp();

  const handleSelect = (code: string) => {
    setLanguage(code);
    onNext();
  };

  return (
    <div className="lang-page" id="language-selection-screen">
      <div className="india-watermark">
        {/* Abstract India Map outline */}
        <svg viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <path d="M120,40 L160,20 L180,40 L210,30 L220,60 L240,65 L250,90 L260,110 L310,130 L320,160 L340,170 L300,180 L290,210 L280,240 L240,250 L230,270 L210,290 L190,320 L180,360 L160,400 L140,430 L135,440 L120,410 L125,370 L110,340 L85,320 L75,280 L70,240 L80,210 L60,190 L50,160 L60,130 L80,110 L100,100 L110,70 L120,40 Z" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeDasharray="5 5" />
        </svg>
      </div>

      <div className="lang-card">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>SabkaSolution</h1>
        <p style={{ fontWeight: 500 }}>Apni Awaaz, Apna Haq • अपनी आवाज़, अपना हक़</p>
        
        <div style={{ margin: '30px 0 20px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--secondary)' }}>
          Select Language / भाषा चुनें
        </div>

        <div className="lang-grid">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              className="lang-btn"
              onClick={() => handleSelect(lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>{lang.native}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lang.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
