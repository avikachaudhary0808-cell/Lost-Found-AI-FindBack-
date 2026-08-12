import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { translations, type Language } from "@/lib/translations";

type Translation = typeof translations.en;

interface LanguageContextType {
  language: Language;
  t: Translation;
  changeLanguage: (lang: Language) => void;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "hi" as Language, name: "हिन्दी", flag: "🇮🇳" },
  { code: "es" as Language, name: "Español", flag: "🇪🇸" },
  { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("findback_language");
    return (stored === "en" || stored === "hi" || stored === "es" || stored === "fr") ? stored : "en";
  });

  const t = translations[language];

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("findback_language", lang);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
