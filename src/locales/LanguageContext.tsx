import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { supabase } from '../lib/supabase/client';

type LangContextType = {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LangContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>('id');

  useEffect(() => {
    async function loadUserLanguage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('karyawan')
          .select('preferred_language')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        
        if (data?.preferred_language) {
          setLangState(data.preferred_language);
        }
      }
    }
    loadUserLanguage();
  }, []);

  const setLang = async (newLang: string) => {
    setLangState(newLang);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('karyawan')
        .update({ preferred_language: newLang })
        .eq('auth_user_id', user.id);
    }
  };

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
}
