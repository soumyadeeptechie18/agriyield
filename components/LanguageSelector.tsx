import React from 'react';
import { Language } from '../types';

interface Props {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ currentLang, onLanguageChange }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
      {Object.values(Language).map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            currentLang === lang
              ? 'bg-agri-600 text-white shadow-md'
              : 'bg-white text-agri-800 border border-agri-200 hover:bg-agri-50'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;