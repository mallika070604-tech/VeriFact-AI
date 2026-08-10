import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.howItWorks': 'How It Works',
    'nav.features': 'Features',
    'nav.analyze': 'Analyze Claim',
    'nav.history': 'History',
    'nav.dashboard': 'Dashboard',
    'nav.about': 'About',
    'nav.login': 'Log In',
    'nav.register': 'Get Started',
    'hero.headline': 'Don\'t Just Read the News. Verify It.',
    'hero.subheading': 'VeriFact AI identifies misinformation, evaluates evidence, and distinguishes fact-check articles from underlying viral claims.',
    'hero.ctaPrimary': 'Analyze a Claim',
    'hero.ctaSecondary': 'How It Works',
    'analyze.textTab': 'Text Analysis',
    'analyze.urlTab': 'URL Analysis',
    'analyze.imageTab': 'Image / OCR Analysis',
    'analyze.btn': 'Analyze Claim',
    'verdict.real': 'REAL / FACTUAL',
    'verdict.fake': 'FAKE / FALSE',
    'verdict.misleading': 'MISLEADING',
    'verdict.unverifiable': 'UNVERIFIABLE',
    'download.report': 'Download PDF Report',
  },
  te: {
    'nav.home': 'హోమ్',
    'nav.howItWorks': 'ఇది ఎలా పనిచేస్తుంది',
    'nav.features': 'లక్షణాలు',
    'nav.analyze': 'క్లెయిమ్‌ను విశ్లేషించండి',
    'nav.history': 'చరిత్ర',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.about': 'గురించి',
    'nav.login': 'లాగిన్',
    'nav.register': 'ప్రారంభించండి',
    'hero.headline': 'వార్తలను కేవలం చదవకండి. నిజానిజాలు నిరూపించండి.',
    'hero.subheading': 'VeriFact AI అసత్య ప్రచారాలను గుర్తించి, సాక్ష్యాలను పరిశీలించి, వాస్తవాలను వెలికితీస్తుంది.',
    'hero.ctaPrimary': 'క్లెయిమ్‌ను విశ్లేషించండి',
    'hero.ctaSecondary': 'ఇది ఎలా పనిచేస్తుంది',
    'analyze.textTab': 'టెక్స్ట్ విశ్లేషణ',
    'analyze.urlTab': 'URL విశ్లేషణ',
    'analyze.imageTab': 'ఇమేజ్ / OCR విశ్లేషణ',
    'analyze.btn': 'క్లెయిమ్‌ను విశ్లేషించండి',
    'verdict.real': 'నిజం / వాస్తవం',
    'verdict.fake': 'అబద్ధం / నకిలీ',
    'verdict.misleading': 'తప్పుదోవ పట్టించేది',
    'verdict.unverifiable': 'ధృవీకరించలేనిది',
    'download.report': 'PDF నివేదికను డౌన్‌లోడ్ చేయండి',
  },
  hi: {
    'nav.home': 'होम',
    'nav.howItWorks': 'यह कैसे काम करता है',
    'nav.features': 'विशेषताएं',
    'nav.analyze': 'दावे का विश्लेषण करें',
    'nav.history': 'इतिहास',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.about': 'के बारे में',
    'nav.login': 'लॉग इन',
    'nav.register': 'शुरू करें',
    'hero.headline': 'सिर्फ समाचार न पढ़ें। इसकी सत्यता जांचें।',
    'hero.subheading': 'VeriFact AI भ्रामक जानकारियों की पहचान करता है, साक्ष्यों का मूल्यांकन करता है और सच्चाई उजागर करता है।',
    'hero.ctaPrimary': 'दावे का विश्लेषण करें',
    'hero.ctaSecondary': 'यह कैसे काम करता है',
    'analyze.textTab': 'टेक्स्ट विश्लेषण',
    'analyze.urlTab': 'URL विश्लेषण',
    'analyze.imageTab': 'इमेज / OCR विश्लेषण',
    'analyze.btn': 'दावे का विश्लेषण करें',
    'verdict.real': 'सत्य / वास्तविक',
    'verdict.fake': 'झूठा / फेक',
    'verdict.misleading': 'भ्रामक',
    'verdict.unverifiable': 'असत्यापित',
    'download.report': 'PDF रिपोर्ट डाउनलोड करें',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('verifact_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('verifact_language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
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
