import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Building2, Check, HelpCircle, LoaderCircle, Lock, Send, UserRound } from 'lucide-react';
import { useState } from 'react';
import { ScaleSelector } from '@/components/scale-selector';
import { PublicShell } from '@/components/public-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWizardDraft } from '@/hooks/use-wizard-draft';
import { cn } from '@/lib/utils';

type Question = { id: number; group: string; text: string; order: number };
type Option = { id: number; name: string };

type Draft = {
    step: number;
    service_unit_id: number | null;
    occupation_id: number | null;
    name: string;
    gender: string;
    city: string;
    need: string;
    comment: string;
    answers: Record<string, number>;
};

const STEP_META = [
    { title: 'Data Diri', short: 'Data', desc: 'Siapa Anda hari ini?', icon: UserRound },
    { title: 'Pilih Layanan', short: 'Layanan', desc: 'Layanan apa yang Anda tangani?', icon: Building2 },
    { title: 'Beri Penilaian', short: 'Penilaian', desc: 'Bagaimana pengalaman Anda?', icon: HelpCircle },
] as const;

export default function Wizard({
    period,
    serviceUnits,
    occupations,
    questions,
    anonymousMode,
    organizationName,
    logoPath,
    turnstileSiteKey,
}: {
    period: { id: number; name: string };
    serviceUnits: Option[];
    occupations: Option[];
    questions: Question[];
    anonymousMode: boolean;
    organizationName: string;
    logoPath: string | null;
    turnstileSiteKey: string | null;
}) {
    const serviceQuestions = questions.filter((q) => q.group === 'A').sort((a, b) => a.order - b.order);
    const antiQuestions = questions.filter((q) => q.group === 'B').sort((a, b) => a.order - b.order);
    const totalQuestions = serviceQuestions.length + antiQuestions.length;

    const [draft, setDraft, clearDraft] = useWizardDraft<Draft>('skm-wizard-draft', {
        step: 1,
        service_unit_id: null,
        occupation_id: null,
        name: '',
        gender: '',
        city: 'Palembang',
        need: '',
        comment: '',
        answers: {},
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [honeypot, setHoneypot] = useState('');
    const [direction, setDirection] = useState<'fwd' | 'back'>('fwd');

    const setField = (field: keyof Draft, value: unknown) =>
        setDraft((prev) => ({ ...prev, [field]: value }));

    const setAnswer = (qid: number, score: number) =>
        setDraft((prev) => ({
            ...prev,
            answers: { ...prev.answers, [qid]: score },
        }));

    const validateStep1 = (): boolean => {
        const e: Record<string, string> = {};
        if (!draft.service_unit_id) e.service_unit_id = 'Silakan pilih unit layanannya dulu, ya.';
        if (!draft.occupation_id) e.occupation_id = 'Silakan pilih pekerjaannya dulu, ya.';
        if (!anonymousMode && !draft.name.trim()) e.name = 'Nama wajib diisi (bisa ditulis singkat).';
        if (!draft.gender) e.gender = 'Silakan pilih jenis kelamin, ya.';
        if (!draft.city.trim()) e.city = 'Kota domisili wajib diisi.';
        if (!draft.need.trim()) e.need = 'Ceritakan kebutuhan Anda agar kami bisa menindaklanjuti.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = (): boolean => {
        const e: Record<string, string> = {};
        for (const q of serviceQuestions) {
            if (!draft.answers[q.id]) e[`q_${q.id}`] = 'Pilih salah satu jawaban di atas, ya.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep3 = (): boolean => {
        const e: Record<string, string> = {};
        for (const q of antiQuestions) {
            if (!draft.answers[q.id]) e[`q_${q.id}`] = 'Pilih salah satu jawaban di atas, ya.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => {
        if (draft.step === 1 && !validateStep1()) return;
        if (draft.step === 2 && !validateStep2()) return;
        setDirection('fwd');
        setField('step', draft.step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const back = () => {
        setDirection('back');
        setField('step', Math.max(1, draft.step - 1));
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = () => {
        if (!validateStep3()) return;
        if (honeypot) return; // bot

        const answers = [...serviceQuestions, ...antiQuestions].map((q) => ({
            question_id: q.id,
            score: draft.answers[q.id],
        }));

        setSubmitting(true);
        router.post(
            '/survei',
            {
                period_id: period.id,
                service_unit_id: draft.service_unit_id,
                occupation_id: draft.occupation_id,
                name: draft.name || null,
                gender: draft.gender,
                city: draft.city,
                need: draft.need,
                comment: draft.comment || null,
                answers,
                website: honeypot,
            },
            {
                onSuccess: () => {
                    clearDraft();
                },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const answeredCount = serviceQuestions.concat(antiQuestions).filter((q) => draft.answers[q.id]).length;
    return (
        <>
            <Head title="Isi Survei" />
            <PublicShell logoPath={logoPath} organizationName={organizationName} compact>
                <div className="mx-auto max-w-2xl px-4 pb-36 pt-6 sm:px-6 sm:pb-24">
                    {/* Stepper: circles connected by a line */}
                    <div className="flex items-center">
                        {STEP_META.map((meta, i) => {
                            const isActive = draft.step === i + 1;
                            const isDone = draft.step > i + 1;
                            const Icon = meta.icon;

                            return (
                                <div key={meta.title} className={cn('flex flex-1 items-center', i < STEP_META.length - 1)}>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span
                                            className={cn(
                                                'animate-pop-spring flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors',
                                                isActive && 'border-primary bg-primary text-white shadow-[0_6px_16px_-6px_var(--kemenag-primary)]',
                                                isDone && 'border-primary bg-secondary text-primary',
                                                !isActive && !isDone && 'border-border bg-card text-muted-foreground',
                                            )}
                                            style={{ animationDelay: `${i * 110}ms` }}
                                        >
                                            {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-4.5 w-4.5" />}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-[11px] leading-none font-semibold',
                                                isActive ? 'text-foreground' : 'text-muted-foreground',
                                            )}
                                        >
                                            {meta.short}
                                        </span>
                                    </div>
                                    {i < STEP_META.length - 1 && (
                                        <span className="mx-2 -mt-6 relative h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                                            <span
                                                className="absolute inset-0 rounded-full bg-primary transition-transform duration-500 ease-out"
                                                style={{ transform: `scaleX(${isDone ? 1 : 0})`, transformOrigin: 'left' }}
                                            />
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 mb-6">
                        <h2 className="text-lg font-bold tracking-tight">{STEP_META[draft.step - 1].title}</h2>
                        <p className="text-sm text-muted-foreground">{STEP_META[draft.step - 1].desc}</p>
                    </div>

                    {/* Progress counter for question steps */}
                    {draft.step >= 2 && (
                        <div className="mb-4 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                                />
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                                {answeredCount}/{totalQuestions} pertanyaan terisi
                            </span>
                        </div>
                    )}

                    {/* Honeypot */}
                    <div className="hidden" aria-hidden="true">
                        <Input
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                        />
                    </div>

                    <div
                        key={draft.step}
                        className={cn('space-y-5', direction === 'fwd' ? 'animate-slide-fwd' : 'animate-slide-back')}
                    >
                        {draft.step === 1 && (
                            <>
                                <div className="grid gap-4 rounded-2xl border bg-card p-5 shadow-soft sm:grid-cols-2 sm:p-6">
                                    {!anonymousMode ? (
                                        <FieldBlock label="Nama" error={errors.name} required>
                                            <Input
                                                value={draft.name}
                                                onChange={(e) => setField('name', e.target.value)}
                                                placeholder="Contoh: Budi Santoso"
                                            />
                                        </FieldBlock>
                                    ) : (
                                        <FieldBlock label="Nama (boleh dikosongkan)" error={errors.name}>
                                            <Input
                                                value={draft.name}
                                                onChange={(e) => setField('name', e.target.value)}
                                                placeholder="Isi jika ingin disebut"
                                            />
                                        </FieldBlock>
                                    )}
                                    <FieldBlock label="Jenis Kelamin" error={errors.gender} required>
                                        <Select value={draft.gender} onValueChange={(v) => setField('gender', v)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih salah satu" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FieldBlock>
                                    <FieldBlock label="Kota Domisili" error={errors.city} required>
                                        <Input
                                            value={draft.city}
                                            onChange={(e) => setField('city', e.target.value)}
                                            placeholder="Contoh: Palembang"
                                        />
                                    </FieldBlock>
                                    <FieldBlock label="Pekerjaan" error={errors.occupation_id} required>
                                        <Select
                                            value={draft.occupation_id ? String(draft.occupation_id) : ''}
                                            onValueChange={(v) => setField('occupation_id', Number(v))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih pekerjaan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {occupations.map((o) => (
                                                    <SelectItem key={o.id} value={String(o.id)}>
                                                        {o.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FieldBlock>
                                    <FieldBlock
                                        label="Unit Layanan yang Dikunjungi"
                                        error={errors.service_unit_id}
                                        required
                                        className="sm:col-span-2"
                                    >
                                        <Select
                                            value={draft.service_unit_id ? String(draft.service_unit_id) : ''}
                                            onValueChange={(v) => setField('service_unit_id', Number(v))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih bagian/layanan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {serviceUnits.map((u) => (
                                                    <SelectItem key={u.id} value={String(u.id)}>
                                                        {u.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FieldBlock>
                                    <FieldBlock
                                        label="Kebutuhan Anda Saat Ini"
                                        error={errors.need}
                                        required
                                        className="sm:col-span-2"
                                    >
                                        <Textarea
                                            value={draft.need}
                                            onChange={(e) => setField('need', e.target.value)}
                                            placeholder="Contoh: Mengurus data kebutuhan pendidikan madrasah"
                                            rows={3}
                                        />
                                    </FieldBlock>
                                </div>
                                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                                    <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
                                    Data ini hanya untuk rekap survei — dijaga kerahasiaannya.
                                </p>
                            </>
                        )}

                        {draft.step === 2 && (
                            <div className="space-y-4">
                                {serviceQuestions.map((q, i) => (
                                    <QuestionCard key={q.id} index={i + 1} text={q.text} error={errors[`q_${q.id}`]}>
                                        <ScaleSelector
                                            value={draft.answers[q.id] ?? null}
                                            onChange={(v) => setAnswer(q.id, v)}
                                        />
                                    </QuestionCard>
                                ))}
                            </div>
                        )}

                        {draft.step === 3 && (
                            <div className="space-y-4">
                                {antiQuestions.map((q, i) => (
                                    <QuestionCard key={q.id} index={serviceQuestions.length + i + 1} text={q.text} error={errors[`q_${q.id}`]}>
                                        <ScaleSelector
                                            value={draft.answers[q.id] ?? null}
                                            onChange={(v) => setAnswer(q.id, v)}
                                        />
                                    </QuestionCard>
                                ))}
                                <div className="rounded-2xl border bg-card p-5 shadow-soft">
                                    <Label className="text-sm font-semibold">Saran / Masukan (opsional)</Label>
                                    <Textarea
                                        className="mt-2"
                                        value={draft.comment}
                                        onChange={(e) => setField('comment', e.target.value)}
                                        placeholder="Punya ide atau kritik? Tulis di sini."
                                        rows={3}
                                    />
                                </div>
                                {errors.duplicate && (
                                    <p className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{errors.duplicate}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom toolbar — touch friendly */}
                <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur">
                    <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={back}
                            disabled={draft.step === 1 || submitting}
                            className="h-12 rounded-xl"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>
                        {draft.step < 3 ? (
                            <Button
                                type="button"
                                size="lg"
                                onClick={next}
                                className="h-12 flex-1 rounded-xl text-base font-bold shadow-[0_8px_20px_-8px_var(--kemenag-primary)]"
                            >
                                Lanjut
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="lg"
                                onClick={submit}
                                disabled={submitting}
                                className="h-12 flex-1 rounded-xl text-base font-bold shadow-[0_8px_20px_-8px_var(--kemenag-primary)]"
                            >
                                {submitting ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        Mengirim…
                                    </>
                                ) : (
                                    <>
                                        Kirim Survei
                                        <Send className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </PublicShell>
        </>
    );
}

function FieldBlock({
    label,
    error,
    required,
    className,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <Label className="mb-1.5 block text-sm">
                {label}
                {required && <span className="ml-0.5 font-bold text-destructive">*</span>}
            </Label>
            {children}
            {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
}

function QuestionCard({
    index,
    text,
    error,
    children,
}: {
    index: number;
    text: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                    {index}
                </span>
                <p className="pt-1 text-sm leading-relaxed font-semibold">{text}</p>
            </div>
            {children}
            {error && <p className="mt-3 rounded-lg bg-destructive/5 p-2 text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
}
