import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const LABELS = [
    'Tidak Baik / Tidak Setuju',
    'Kurang Baik',
    'Baik',
    'Sangat Baik',
];

export function ScaleSelector({
    value,
    onChange,
}: {
    value: number | null;
    onChange: (value: number) => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((score) => (
                <button
                    key={score}
                    type="button"
                    onClick={() => onChange(score)}
                    className={cn(
                        'relative rounded-lg border-2 p-4 text-center transition-colors',
                        value === score
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/40',
                    )}
                >
                    {value === score && (
                        <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />
                    )}
                    <div className="text-2xl font-bold text-foreground">{score}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{LABELS[score - 1]}</div>
                </button>
            ))}
        </div>
    );
}
