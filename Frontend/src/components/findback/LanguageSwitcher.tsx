import { useLanguage } from "@/hooks/useLanguage";

export function LanguageSwitcher() {
  const { language, changeLanguage, availableLanguages } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {availableLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`rounded-md px-2 py-1 text-xs transition-colors ${
            language === lang.code
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title={lang.name}
          type="button"
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
