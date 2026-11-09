import { useEffect, useState } from 'react';

export function useWizardDraft<T>(key: string, initial: T) {
    const [draft, setDraft] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initial;
        }

        try {
            const raw = window.localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initial;
        } catch {
            return initial;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(draft));
        } catch {
            // ignore storage errors
        }
    }, [key, draft]);

    const clear = () => {
        try {
            window.localStorage.removeItem(key);
        } catch {
            // ignore
        }
        setDraft(initial);
    };

    return [draft, setDraft, clear] as const;
}
