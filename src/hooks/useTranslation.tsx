import { createContext, useContext, useState, ReactNode } from 'react';

type Locale = 'en' | 'pt';

interface TranslationContextProps {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

import { en } from '../locales/en';
import { pt } from '../locales/pt';

const dictionaries: Record<Locale, Record<string, string>> = { en, pt };

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState<Locale>('en');

    const t = (key: string) => {
        return dictionaries[locale][key] || key;
    };

    return (
        <TranslationContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
};
