import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Option = {
    score: number;
    label: string;
    short: string;
    selectedClass: string;
    icon: 'frown' | 'meh' | 'smile' | 'laugh';
};

const OPTIONS: Option[] = [
    { score: 1, label: 'Tidak Baik / Tidak Setuju', short: 'Tidak Puas', selectedClass: 'border-grade-d bg-grade-d/10 text-grade-d', icon: 'frown' },
    { score: 2, label: 'Kurang Baik / Kurang Setuju', short: 'Kurang Puas', selectedClass: 'border-grade-c bg-grade-c/10 text-grade-c', icon: 'meh' },
    { score: 3, label: 'Baik / Setuju', short: 'Baik', selectedClass: 'border-grade-b bg-grade-b/10 text-grade-b', icon: 'smile' },
    { score: 4, label: 'Sangat Baik / Sangat Setuju', short: 'Sangat Baik', selectedClass: 'border-primary bg-primary/10 text-primary', icon: 'laugh' },
];

const ICON_STROKE: Record<Option['icon'], string[]> = {
    frown: ['M8.5 15.5s1.5 1 3.5 1 3.5-1 3.5-1'],
    meh: ['M9 15h6'],
    smile: ['M8.5 15a4 4 0 0 0 7 0'],
    laugh: ['M8 14.5s1.6 2.5 4 2.5 4-2.5 4-2.5M8 14.5h8'],
};

function FaceIcon({ kind, className }: { kind: Option['icon']; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className}>
            <circle cx="12" cy="12" r="9.25" />
            {kind === 'frown' || kind === 'meh' || kind === 'smile' || kind === 'laugh' ? (
                <path d={ICON_STROKE[kind][0]} />
            ) : null}
            <path d="M9 9.5h.01M15 9.5h.01" strokeWidth={2.6} />
        </svg>
    );
}

/**
 * Likert 1–4 selector with color-coded faces so respondents who are not
 * comfortable with technology can still answer confidently.
 */
export function ScaleSelector({
    value,
    onChange,
}: {
    value: number | null;
    onChange: (value: number) => void;
}) {
    return (
        <fieldset className="w-full">
            <legend className="sr-only">Pilih salah satu jawaban</legend>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                {OPTIONS.map((option) => {
                    const selected = value === option.score;

                    return (
                        <button
                            key={option.score}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(option.score)}
                            className={cn(
                                'group relative rounded-xl border-2 bg-card p-3 text-center transition-all sm:p-4',
                                selected
                                    ? `${option.selectedClass} shadow-soft`
                                    : 'border-border bg-card text-foreground hover:border-ring hover:bg-muted/50 active:scale-[0.98]',
                            )}
                        >
                            {selected && (
                                <Check className="absolute right-2 top-2 h-4 w-4" strokeWidth={3} />
                            )}
                            <FaceIcon kind={option.icon} className={cn('mx-auto h-8 w-8 transition-colors', selected ? '' : 'text-muted-foreground/60')} />
                            <div className="mt-1.5 text-xs font-bold sm:text-sm">
                                {option.short}
                            </div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">{option.label}</div>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
