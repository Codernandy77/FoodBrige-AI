import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';
import type { Language } from '../i18n/translations';

type TranslationsKeys = keyof typeof translations.en;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationsKeys) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('foodbridge_lang');
    return (saved === 'ta' || saved === 'en') ? saved as Language : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('foodbridge_lang', lang);
  };

  const t = (key: TranslationsKeys): string => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
