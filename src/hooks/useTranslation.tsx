import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

type Locale = 'en' | 'pt';

interface TranslationContextProps {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string) => string;
    formatCurrency: (amountInUSD: number) => string;
    currency: string;
    setCurrency: (c: string) => void;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

import { en } from '../locales/en';
import { pt } from '../locales/pt';

const dictionaries: Record<Locale, Record<string, string>> = { en, pt };

// Determine initial locale and currency from browser
const getInitialLocale = (): Locale => {
    if (typeof navigator !== 'undefined') {
        return navigator.language.startsWith('pt') ? 'pt' : 'en';
    }
    return 'en';
};

const getInitialCurrency = (): string => {
    if (typeof Intl !== 'undefined') {
        const currency = Intl.NumberFormat().resolvedOptions().currency;
        if (currency) return currency;
    }
    return 'USD';
};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState<Locale>(getInitialLocale());
    const [currency, setCurrency] = useState<string>(getInitialCurrency());
    const [exchangeRate, setExchangeRate] = useState<number>(1);

    useEffect(() => {
        // Fetch exchange rates when component mounts
        const fetchRates = async () => {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await response.json();
                if (data && data.rates && data.rates[currency]) {
                    setExchangeRate(data.rates[currency]);
                }
            } catch (error) {
                console.error('Failed to fetch exchange rates:', error);
            }
        };

        if (currency !== 'USD') {
            fetchRates();
        }
    }, [currency]);

    const t = (key: string) => {
        return dictionaries[locale][key] || key;
    };

    const formatCurrency = useCallback((amountInUSD: number) => {
        const amount = amountInUSD * exchangeRate;
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch (error) {
            return `$${Math.round(amount)}`;
        }
    }, [exchangeRate, locale, currency]);

    return (
        <TranslationContext.Provider value={{ locale, setLocale, t, formatCurrency, currency, setCurrency }}>
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
