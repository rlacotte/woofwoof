import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from './translations';

const LanguageContext = createContext();

function getDefaultLang() {
  const stored = localStorage.getItem('woofwoof_lang');
  if (stored && translations[stored]) return stored;
  const nav = navigator.language?.slice(0, 2) || 'fr';
  return translations[nav] ? nav : 'fr';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getDefaultLang);

  const setLang = useCallback((newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem('woofwoof_lang', newLang);
    }
  }, []);

  const t = useCallback((key, replacements) => {
    let str = translations[lang]?.[key] || translations.fr?.[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
