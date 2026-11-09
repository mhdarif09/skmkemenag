import { useEffect, useState } from 'react';

export function useWizardDraft<T>(key: string, initial: T) {
    // Initialize with `initial` on both server and client so the first render
    // matches SSR output. The stored draft is restored after mount — restoring
    // it eagerly would cause a React hydration mismatch.
    const [draft, setDraft] = useState<T>(initial);
    const [hydratedKey, setHydratedKey] = useState<string | null>(null);

    // Restore a stored draft once, only for this hook instance's key.
    useEffect(() => {
        if (hydratedKey === key) {
            return;
        }

        setHydratedKey(key);

        try {
            const raw = window.localStorage.getItem(key);
            if (raw) {
                setDraft(JSON.parse(raw) as T);
            }
        } catch {
            // ignore corrupted storage
        }
    }, [key, hydratedKey]);

    useEffect(() => {
        if (!hydratedKey) {
            return;
        }

        try {
            window.localStorage.setItem(key, JSON.stringify(draft));
        } catch {
            // ignore storage errors
        }
    }, [key, draft, hydratedKey]);

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
