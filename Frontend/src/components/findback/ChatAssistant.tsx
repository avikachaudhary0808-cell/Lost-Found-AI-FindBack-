import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "./ui";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: Date;
};

type ChatState = "idle" | "open" | "typing";

const faq: Record<string, Record<string, string[]>> = {
  en: {
    lost: [
      "To report a lost item, go to the Dashboard and click '+ Report Lost Item'. Fill in the title, category, color, location, and description. You can also upload an image.",
      "Use the GPS button to auto-fill your current location, or type it manually.",
      "Once reported, our AI matching engine will search for potential matches among found items.",
    ],
    found: [
      "To report a found item, go to the Dashboard and click '+ Report Found Item'. Provide details about the item and where you found it.",
      "The more details you provide, the better the matching accuracy will be.",
    ],
    match: [
      "Matches are calculated using image similarity, location proximity, category, color, and description.",
      "You can view potential matches in the 'Matches' tab of your Dashboard.",
      "Match scores above 70% usually indicate a strong potential match.",
    ],
    verify: [
      "Ownership verification ensures only the rightful owner can claim an item.",
      "The match owner can create a verification with a challenge question.",
      "You must answer the challenge correctly to pass verification.",
    ],
    gps: [
      "Click the 'GPS' button next to the location field to auto-detect your current location.",
      "Make sure location permissions are enabled in your browser.",
      "If GPS fails, you can manually enter the location.",
    ],
    general: [
      "FindBack is an AI-powered lost and found recovery network.",
      "We use image matching, location intelligence, and ownership verification to reunite items with owners.",
      "All sensitive details are kept private and never publicly exposed.",
    ],
    help: [
      "You can ask about: lost items, found items, matching, verification, GPS, or general help.",
      "Try saying: 'How do I report a lost item?', 'How does matching work?', 'What is ownership verification?'",
    ],
  },
  hi: {
    lost: [
      "खोए हुए आइटम की रिपोर्ट करने के लिए, डैशबोर्ड पर जाएं और '+ खोया आइटम रिपोर्ट करें' पर क्लिक करें। शीर्षक, श्रेणी, रंग, स्थान और विवरण भरें।",
      "GPS बटन का उपयोग करके अपना वर्तमान स्थान ऑटो-फिल करें, या मैन्युअली टाइप करें।",
    ],
    found: [
      "मिले हुए आइटम की रिपोर्ट करने के लिए, डैशबोर्ड पर जाएं और '+ मिला आइटम रिपोर्ट करें' पर क्लिक करें।",
    ],
    match: [
      "मैच चित्र समानता, स्थान, श्रेणी, रंग और विवरण का उपयोग करके गणना किए जाते हैं।",
      "आप अपने डैशबोर्ड के 'मैच' टैब में संभावित मैच देख सकते हैं।",
    ],
    verify: [
      "स्वामित्व सत्यापन सुनिश्चित करता है कि केवल वास्तविक मालिक ही आइटम का दावा कर सके।",
      "मैच मालिक एक चैलेंज प्रश्न के साथ सत्यापन बना सकता है।",
    ],
    gps: [
      "स्थान फ़ील्ड के पास GPS बटन पर क्लिक करें अपना वर्तमान स्थान ऑटो-डिटेक्ट करने के लिए।",
    ],
    general: [
      "FindBack एक AI-संचालित खोया और मिला रिकवरी नेटवर्क है।",
      "हम आइटम को मालिकों से जोड़ने के लिए चित्र मैचिंग, स्थान बुद्धिमत्ता और स्वामित्व सत्यापन का उपयोग करते हैं।",
    ],
    help: [
      "आप पूछ सकते हैं: खोए हुए आइटम, मिले हुए आइटम, मैचिंग, सत्यापन, GPS, या सामान्य मदद।",
    ],
  },
  es: {
    lost: [
      "Para reportar un artículo perdido, ve al Panel y haz clic en '+ Reportar artículo perdido'. Completa el título, categoría, color, ubicación y descripción.",
      "Usa el botón GPS para autocompletar tu ubicación actual, o escríbela manualmente.",
    ],
    found: [
      "Para reportar un artículo encontrado, ve al Panel y haz clic en '+ Reportar artículo encontrado'.",
    ],
    match: [
      "Las coincidencias se calculan usando similitud de imagen, ubicación, categoría, color y descripción.",
      "Puedes ver las coincidencias potenciales en la pestaña 'Coincidencias' de tu Panel.",
    ],
    verify: [
      "La verificación de propiedad asegura que solo el verdadero dueño pueda reclamar el artículo.",
      "El dueño del match puede crear una verificación con una pregunta de desafío.",
    ],
    gps: [
      "Haz clic en el botón 'GPS' junto al campo de ubicación para autodetectar tu ubicación actual.",
    ],
    general: [
      "FindBack es una red de recuperación de objetos perdidos y encontrados impulsada por IA.",
      "Utilizamos coincidencia de imágenes, inteligencia de ubicación y verificación de propiedad.",
    ],
    help: [
      "Puedes preguntar sobre: artículos perdidos, artículos encontrados, coincidencias, verificación, GPS o ayuda general.",
    ],
  },
  fr: {
    lost: [
      "Pour signaler un objet perdu, allez au Tableau de bord et cliquez sur '+ Signaler un objet perdu'. Remplissez le titre, la catégorie, la couleur, le lieu et la description.",
      "Utilisez le bouton GPS pour remplir automatiquement votre position actuelle.",
    ],
    found: [
      "Pour signaler un objet trouvé, allez au Tableau de bord et cliquez sur '+ Signaler un objet trouvé'.",
    ],
    match: [
      "Les correspondances sont calculées en utilisant la similarité d'image, la proximité, la catégorie, la couleur et la description.",
      "Vous pouvez voir les correspondances potentielles dans l'onglet 'Correspondances' de votre Tableau de bord.",
    ],
    verify: [
      "La vérification de propriété assure que seul le véritable propriétaire peut réclamer l'objet.",
      "Le propriétaire du match peut créer une vérification avec une question de défi.",
    ],
    gps: [
      "Cliquez sur le bouton 'GPS' à côté du champ de lieu pour autodétecter votre position actuelle.",
    ],
    general: [
      "FindBack est un réseau de récupération d'objets perdus et trouvés alimenté par IA.",
      "Nous utilisons la correspondance d'images, l'intelligence de localisation et la vérification de propriété.",
    ],
    help: [
      "Vous pouvez demander : objets perdus, objets trouvés, correspondances, vérification, GPS ou aide générale.",
    ],
  },
};

const quickActions: Record<string, { label: string; keywords: string[]; responses: string[] }> = {
  en: {
    label: "Quick Actions",
    keywords: [],
    responses: [],
  },
  hi: {
    label: "त्वरित कार्य",
    keywords: [],
    responses: [],
  },
  es: {
    label: "Acciones rápidas",
    keywords: [],
    responses: [],
  },
  fr: {
    label: "Actions rapides",
    keywords: [],
    responses: [],
  },
};

export function ChatAssistant() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: t.help,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const getIntent = useCallback(
    (text: string): string => {
      const lower = text.toLowerCase();
      if (lower.includes("lost") || lower.includes("खोया") || lower.includes("perdido") || lower.includes("perdu")) return "lost";
      if (lower.includes("found") || lower.includes("मिला") || lower.includes("encontrado") || lower.includes("trouvé")) return "found";
      if (lower.includes("match") || lower.includes("मैच") || lower.includes("coincidencia") || lower.includes("correspondance")) return "match";
      if (lower.includes("verify") || lower.includes("सत्यापन") || lower.includes("verificación") || lower.includes("vérification")) return "verify";
      if (lower.includes("gps") || lower.includes("location") || lower.includes("स्थान") || lower.includes("ubicación") || lower.includes("lieu")) return "gps";
      if (lower.includes("help") || lower.includes("मदद") || lower.includes("ayuda") || lower.includes("aide")) return "help";
      return "general";
    },
    [language]
  );

  const findBestResponse = useCallback(
    (userText: string): string => {
      const intent = getIntent(userText);
      const responses = faq[language]?.[intent] || faq.en[intent] || faq.en.general;
      const lower = userText.toLowerCase();

      if (intent === "help") {
        return (faq[language]?.help || faq.en.help)[0];
      }

      if (intent === "general") {
        if (lower.includes("how") || lower.includes("कैसे") || lower.includes("cómo") || lower.includes("comment")) {
          return (faq[language]?.general || faq.en.general)[0];
        }
        if (lower.includes("what") || lower.includes("क्या") || lower.includes("qué") || lower.includes("quoi")) {
          return (faq[language]?.general || faq.en.general)[0];
        }
      }

      const idx = Math.floor(Math.random() * responses.length);
      return responses[idx];
    },
    [language, getIntent]
  );

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText) return;

      const userMessage: Message = {
        id: Date.now(),
        role: "user",
        text: messageText,
        time: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
        const responseText = findBestResponse(messageText);
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          text: responseText,
          time: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 800 + Math.random() * 700);
    },
    [input, findBestResponse]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[360px] flex-col rounded-xl border border-border bg-surface/95 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-bold">{t.voiceAssistant}</h3>
              <p className="text-[10px] text-muted-foreground">
                {isTyping ? "Typing..." : "Online"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.help}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <Button size="sm" onClick={() => handleSend()} disabled={!input.trim()}>
                {t.submit}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/40 bg-background/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary hover:shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--teal)_55%,transparent)]"
          aria-label={t.voiceAssistant}
          title={t.voiceAssistant}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
