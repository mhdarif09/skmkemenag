import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Building2, Check, HelpCircle, LoaderCircle, Send, UserRound } from 'lucide-react';
import { useState } from 'react';
import { ScaleSelector } from '@/components/scale-selector';
import { PublicShell } from '@/components/public-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    { title: 'Data Diri', desc: 'Siapa Anda hari ini?', icon: UserRound },
    { title: 'Pilih Layanan', desc: 'Layanan apa yang Anda tangani?', icon: Building2 },
    { title: 'Beri Penilaian', desc: 'Bagaimana pengalaman Anda?', icon: HelpCircle },
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
        setField('step', draft.step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const back = () => setField('step', Math.max(1, draft.step - 1));

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

    const answeredNow = serviceQuestions.concat(antiQuestions).filter((q) => draft.answers[q.id]).length;

    return (
        <>
            <Head title="Isi Survei" />
            <PublicShell logoPath={logoPath} organizationName={organizationName} compact>
                <div className="mx-auto max-w-2xl px-4 pb-32 sm:px-6 sm:pb-16">
                    {/* Stepper */}
                    <div className="sticky top-0 z-30 -mx-4 bg-background/90 px-4 pt-4 pb-3 backdrop-blur sm:-mx-6 sm:px-6">
                        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                Langkah {draft.step} dari 3 — {STEP_META[draft.step - 1].title}
                            </span>
                            {draft.step >= 2 && (
                                <span>
                                    {answeredNow}/{totalQuestions} pertanyaan terisi
                                </span>
                            )}
                        </div>
                        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full gradient-brand transition-all duration-300"
                                style={{ width: `${(draft.step / 3) * 100}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {STEP_META.map((meta, i) => {
                                const isActive = draft.step === i + 1;
                                const isDone = draft.step > i + 1;
                                const Icon = meta.icon;

                                return (
                                    <button
                                        key={meta.title}
                                        type="button"
                                        disabled={i + 1 > draft.step}
                                        onClick={() => i + 1 < draft.step && back()}
                                        className={cn(
                                            'flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors',
                                            isActive && 'border-primary bg-primary/5 shadow-soft',
                                            isDone && 'border-transparent bg-muted/70 hover:bg-muted',
                                            !isActive && !isDone && 'border-dashed border-border opacity-60',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                                                isActive && 'gradient-brand text-white',
                                                isDone && 'bg-primary/15 text-primary',
                                                !isActive && !isDone && 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {isDone ? <Check className="h-4 w-4" /> : i + 1}
                                        </span>
                                        <span className={cn('text-[11px] font-semibold sm:text-xs', !isActive && 'text-muted-foreground')}>
                                            {meta.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <Card key={draft.step} className="animate-fade-up border-none shadow-soft">
                        <CardContent className="p-5 sm:p-6">
                            {/* Honeypot */}
                            <div className="hidden" aria-hidden="true">
                                <Input
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                />
                            </div>

                            {draft.step === 1 && (
                                <>
                                    <StepIntro
                                        title="Halo! Kenalan dulu, yuk 👋"
                                        desc="Isi datanya dengan ringkas — kami hanya memakainya untuk rekapitulasi survei."
                                    />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {!anonymousMode ? (
                                            <Field label="Nama Lengkap" error={errors.name} required>
                                                <Input
                                                    value={draft.name}
                                                    onChange={(e) => setField('name', e.target.value)}
                                                    placeholder="Contoh: Budi Santoso"
                                                />
                                            </Field>
                                        ) : (
                                            <Field label="Nama (boleh dikosongkan)" error={errors.name}>
                                                <Input
                                                    value={draft.name}
                                                    onChange={(e) => setField('name', e.target.value)}
                                                    placeholder="Isi jika ingin disebut"
                                                />
                                            </Field>
                                        )}
                                        <Field label="Jenis Kelamin" error={errors.gender} required>
                                            <Select value={draft.gender} onValueChange={(v) => setField('gender', v)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih salah satu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="L">Laki-laki</SelectItem>
                                                    <SelectItem value="P">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="Kota Domisili" error={errors.city} required>
                                            <Input
                                                value={draft.city}
                                                onChange={(e) => setField('city', e.target.value)}
                                                placeholder="Contoh: Palembang"
                                            />
                                        </Field>
                                        <Field label="Pekerjaan" error={errors.occupation_id} required>
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
                                        </Field>
                                        <Field label="Unit Layanan yang Dikunjungi" error={errors.service_unit_id} required>
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
                                        </Field>
                                        <Field
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
                                        </Field>
                                    </div>
                                </>
                            )}

                            {draft.step === 2 && (
                                <>
                                    <StepIntro
                                        title="Penilaian Pelayanan"
                                        desc="Untuk setiap pertanyaan, pilih jawaban yang paling sesuai dengan pengalaman Anda. Ketuk saja — bisa diubah nanti."
                                    />
                                    <div className="space-y-5">
                                        {serviceQuestions.map((q, i) => (
                                            <QuestionCard key={q.id} index={i + 1} text={q.text} error={errors[`q_${q.id}`]}>
                                                <ScaleSelector
                                                    value={draft.answers[q.id] ?? null}
                                                    onChange={(v) => setAnswer(q.id, v)}
                                                />
                                            </QuestionCard>
                                        ))}
                                    </div>
                                </>
                            )}

                            {draft.step === 3 && (
                                <>
                                    <StepIntro
                                        title="Persepsi Anti Korupsi"
                                        desc="Jawab sesuai kejujuran Anda. Data ini dinilai berdasarkan pengalaman nyata saat melayani."
                                    />
                                    <div className="space-y-5">
                                        {antiQuestions.map((q, i) => (
                                            <QuestionCard key={q.id} index={serviceQuestions.length + i + 1} text={q.text} error={errors[`q_${q.id}`]}>
                                                <ScaleSelector
                                                    value={draft.answers[q.id] ?? null}
                                                    onChange={(v) => setAnswer(q.id, v)}
                                                />
                                            </QuestionCard>
                                        ))}
                                        <div className="rounded-xl border bg-muted/50 p-4">
                                            <Label>Saran / Masukan (opsional)</Label>
                                            <Textarea
                                                className="mt-1.5"
                                                value={draft.comment}
                                                onChange={(e) => setField('comment', e.target.value)}
                                                placeholder="Punya ide atau kritik? Tulis di sini."
                                                rows={3}
                                            />
                                        </div>
                                        {errors.duplicate && (
                                            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.duplicate}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Nav bar — always visible, touch friendly */}
                <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 shadow-pop backdrop-blur">
                    <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            onClick={back}
                            disabled={draft.step === 1 || submitting}
                            className="rounded-xl"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Kembali
                        </Button>
                        {draft.step < 3 ? (
                            <Button type="button" size="lg" onClick={next} className="gradient-brand h-12 flex-1 max-w-60 rounded-xl text-base font-bold">
                                Lanjut
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="lg"
                                onClick={submit}
                                disabled={submitting}
                                className="gradient-brand h-12 flex-1 max-w-60 rounded-xl text-base font-bold"
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

function StepIntro({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="mb-5">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
    );
}

function Field({
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
            <Label className="mb-1.5 block">
                {label}
                {required && <span className="ml-0.5 font-bold text-destructive">*</span>}
            </Label>
            {children}
            {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
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
        <div className="rounded-xl border bg-muted/40 p-4">
            <div className="mb-3 flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                    {index}
                </span>
                <p className="pt-0.5 text-sm font-semibold leading-relaxed">{text}</p>
            </div>
            {children}
            {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
}
