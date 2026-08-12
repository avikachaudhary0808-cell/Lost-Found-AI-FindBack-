import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";

type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";

const voiceCommands: Record<string, Record<string, (lang: string) => { action: string; reply: string }>> = {
  en: {
    help: () => ({ action: "help", reply: "You can say: report lost item, report found item, search matches, open verifications, dashboard, help." }),
    lost: () => ({ action: "lost", reply: "Opening the lost item report form for you." }),
    found: () => ({ action: "found", reply: "Opening the found item report form for you." }),
    match: () => ({ action: "matches", reply: "Here are your potential matches." }),
    verify: () => ({ action: "verifications", reply: "Opening ownership verifications." }),
    dashboard: () => ({ action: "dashboard", reply: "Taking you to your dashboard." }),
  },
  hi: {
    help: () => ({ action: "help", reply: "आप कह सकते हैं: खोया आइटम रिपोर्ट करें, मिला आइटम रिपोर्ट करें, मैच खोजें, सत्यापन खोलें, डैशबोर्ड, मदद।" }),
    lost: () => ({ action: "lost", reply: "खोए हुए आइटम की फॉर्म खोल रहे हैं।" }),
    found: () => ({ action: "found", reply: "मिले हुए आइटम की फॉर्म खोल रहे हैं।" }),
    match: () => ({ action: "matches", reply: "यहां आपके संभावित मैच हैं।" }),
    verify: () => ({ action: "verifications", reply: "स्वामित्व सत्यापन खोल रहे हैं।" }),
    dashboard: () => ({ action: "dashboard", reply: "आपको आपके डैशबोर्ड पर ले जा रहे हैं।" }),
  },
  es: {
    help: () => ({ action: "help", reply: "Puedes decir: reportar artículo perdido, reportar artículo encontrado, buscar coincidencias, abrir verificaciones, panel, ayuda." }),
    lost: () => ({ action: "lost", reply: "Abriendo el formulario de artículo perdido." }),
    found: () => ({ action: "found", reply: "Abriendo el formulario de artículo encontrado." }),
    match: () => ({ action: "matches", reply: "Aquí están tus coincidencias potenciales." }),
    verify: () => ({ action: "verifications", reply: "Abriendo verificaciones de propiedad." }),
    dashboard: () => ({ action: "dashboard", reply: "Llevándote a tu panel." }),
  },
  fr: {
    help: () => ({ action: "help", reply: "Vous pouvez dire : signaler un objet perdu, signaler un objet trouvé, rechercher des correspondances, ouvrir les vérifications, tableau de bord, aide." }),
    lost: () => ({ action: "lost", reply: "Ouverture du formulaire d'objet perdu." }),
    found: () => ({ action: "found", reply: "Ouverture du formulaire d'objet trouvé." }),
    match: () => ({ action: "matches", reply: "Voici vos correspondances potentielles." }),
    verify: () => ({ action: "verifications", reply: "Ouverture des vérifications de propriété." }),
    dashboard: () => ({ action: "dashboard", reply: "Redirection vers votre tableau de bord." }),
  },
};

const voiceUnknown: Record<string, string> = {
  en: "I didn't catch that. Try saying report lost item, report found item, or open matches.",
  hi: "मैंने समझ नहीं। कहें: खोया आइटम रिपोर्ट करें, मिला आइटम रिपोर्ट करें, या मैच खोलें।",
  es: "No entendí. Prueba con: reportar artículo perdido, reportar artículo encontrado, o abrir coincidencias.",
  fr: "Je n'ai pas compris. Essayez : signaler un objet perdu, signaler un objet trouvé, ou ouvrir les correspondances.",
};

const voiceSignInFirst: Record<string, string> = {
  en: "Please sign in first.",
  hi: "कृपया पहले साइन इन करें।",
  es: "Por favor inicia sesión primero.",
  fr: "Veuillez d'abord vous connecter.",
};

export function VoiceAssistant() {
  const { language } = useLanguage();
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stateRef = useRef(state);
  const setStateRef = useRef(setState);

  useEffect(() => {
    stateRef.current = state;
    setStateRef.current = setState;
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "hi" ? "hi-IN" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setStateRef.current("processing");
      handleVoiceCommand(text);
    };

    recognition.onerror = () => {
      setError("Could not access microphone. Please allow microphone permission.");
      setStateRef.current("error");
    };

    recognition.onend = () => {
      if (stateRef.current === "listening") {
        setStateRef.current("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = language === "hi" ? "hi-IN" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US";
    utterance.onend = () => setStateRef.current("idle");
    window.speechSynthesis.speak(utterance);
    setState("speaking");
  }, [language]);

  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    const langCommands = voiceCommands[language] || voiceCommands.en;
    let matched = false;

    for (const [key, handler] of Object.entries(langCommands)) {
      if (key !== "help" && lower.includes(key)) {
        const result = handler(language);
        setResponse(result.reply);
        setTimeout(() => speak(result.reply), 300);
        setTimeout(() => {
          const token = localStorage.getItem("findback_token");
          if (!token && result.action !== "help") {
            setError(voiceSignInFirst[language] || voiceSignInFirst.en);
            setStateRef.current("error");
            return;
          }
          if (result.action !== "help") {
            window.location.href = "/dashboard";
          }
        }, 1500);
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (lower.includes("help")) {
        const helpReply = langCommands.help(language).reply;
        setResponse(helpReply);
        setTimeout(() => speak(helpReply), 300);
      } else {
        const unknownReply = voiceUnknown[language] || voiceUnknown.en;
        setResponse(unknownReply);
        setTimeout(() => speak(unknownReply), 300);
      }
    }
  };

  const startListening = () => {
    setError("");
    setTranscript("");
    setResponse("");
    setState("listening");
    try {
      recognitionRef.current?.start();
    } catch {
      setError("Could not start microphone. Please try again.");
      setState("error");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.abort();
    setState("idle");
  };

  const getStateLabel = () => {
    switch (state) {
      case "listening":
        return "Listening...";
      case "processing":
        return "Processing...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Microphone error";
      default:
        return "Voice Assistant";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {(transcript || response || error) && (
        <div className="max-w-xs rounded-xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur-sm">
          {transcript && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">You:</span> {transcript}
            </p>
          )}
          {response && (
            <p className="mt-1 text-xs text-primary">
              <span className="font-semibold">FindBack:</span> {response}
            </p>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      <button
        onClick={state === "listening" ? stopListening : startListening}
        disabled={state === "processing" || state === "speaking"}
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/40 bg-background/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary hover:shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--teal)_55%,transparent)] ${
          state === "listening" ? "animate-pulse border-primary bg-primary/10" : ""
        } ${state === "processing" || state === "speaking" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-label={getStateLabel()}
        title={getStateLabel()}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary">
          <path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M19 10v2a7 7 0 0 1-14 0v-2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
