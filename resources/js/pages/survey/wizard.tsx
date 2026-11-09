import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// native textarea used (no shadcn textarea component)
import { ScaleSelector } from '@/components/scale-selector';
import { useWizardDraft } from '@/hooks/use-wizard-draft';

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
    const serviceQuestions = questions
        .filter((q) => q.group === 'A')
        .sort((a, b) => a.order - b.order);
    const antiQuestions = questions
        .filter((q) => q.group === 'B')
        .sort((a, b) => a.order - b.order);

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
        if (!draft.service_unit_id) e.service_unit_id = 'Pilih unit layanan.';
        if (!draft.occupation_id) e.occupation_id = 'Pilih pekerjaan.';
        if (!anonymousMode && !draft.name.trim()) e.name = 'Nama wajib diisi.';
        if (!draft.gender) e.gender = 'Pilih jenis kelamin.';
        if (!draft.city.trim()) e.city = 'Kota wajib diisi.';
        if (!draft.need.trim()) e.need = 'Kebutuhan wajib diisi.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = (): boolean => {
        const e: Record<string, string> = {};
        for (const q of serviceQuestions) {
            if (!draft.answers[q.id]) e[`q_${q.id}`] = 'Wajib diisi.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep3 = (): boolean => {
        const e: Record<string, string> = {};
        for (const q of antiQuestions) {
            if (!draft.answers[q.id]) e[`q_${q.id}`] = 'Wajib diisi.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => {
        if (draft.step === 1 && !validateStep1()) return;
        if (draft.step === 2 && !validateStep2()) return;
        setField('step', draft.step + 1);
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

    return (
        <>
            <Head title="Isi Survei" />
            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
                        {logoPath ? (
                            <img src={logoPath} alt="Logo" className="h-10 w-10 object-contain" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                KA
                            </div>
                        )}
                        <div className="text-sm font-semibold">{organizationName}</div>
                    </div>
                    <div className="h-1 bg-accent" />
                </header>

                <main className="mx-auto max-w-3xl px-6 py-8">
                    {/* Stepper */}
                    <div className="mb-6 flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-1 items-center">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                        draft.step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`mx-2 h-1 flex-1 rounded ${
                                            draft.step > s ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary">
                                {draft.step === 1 && 'Data Responden'}
                                {draft.step === 2 && 'Penilaian Pelayanan'}
                                {draft.step === 3 && 'Persepsi Anti Korupsi'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                    {!anonymousMode && (
                                        <div className="space-y-1">
                                            <Label>Nama</Label>
                                            <Input
                                                value={draft.name}
                                                onChange={(e) => setField('name', e.target.value)}
                                            />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>
                                    )}
                                    {anonymousMode && (
                                        <div className="space-y-1">
                                            <Label>Nama (opsional)</Label>
                                            <Input
                                                value={draft.name}
                                                onChange={(e) => setField('name', e.target.value)}
                                                placeholder="Boleh dikosongkan"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <Label>Jenis Kelamin</Label>
                                        <Select value={draft.gender} onValueChange={(v) => setField('gender', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Kota</Label>
                                        <Input
                                            value={draft.city}
                                            onChange={(e) => setField('city', e.target.value)}
                                        />
                                        {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Unit Layanan</Label>
                                        <Select
                                            value={draft.service_unit_id ? String(draft.service_unit_id) : ''}
                                            onValueChange={(v) => setField('service_unit_id', Number(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {serviceUnits.map((u) => (
                                                    <SelectItem key={u.id} value={String(u.id)}>
                                                        {u.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.service_unit_id && (
                                            <p className="text-sm text-destructive">{errors.service_unit_id}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Pekerjaan</Label>
                                        <Select
                                            value={draft.occupation_id ? String(draft.occupation_id) : ''}
                                            onValueChange={(v) => setField('occupation_id', Number(v))}
                                        >
                                            <SelectTrigger>
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
                                        {errors.occupation_id && (
                                            <p className="text-sm text-destructive">{errors.occupation_id}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Kebutuhan / Pelayanan yang Diterima</Label>
                                        <textarea
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={draft.need}
                                            onChange={(e) => setField('need', e.target.value)}
                                        />
                                        {errors.need && <p className="text-sm text-destructive">{errors.need}</p>}
                                    </div>
                                </>
                            )}

                            {draft.step === 2 && (
                                <div className="space-y-6">
                                    {serviceQuestions.map((q) => (
                                        <div key={q.id} className="space-y-2">
                                            <Label>{q.text}</Label>
                                            <ScaleSelector
                                                value={draft.answers[q.id] ?? null}
                                                onChange={(v) => setAnswer(q.id, v)}
                                            />
                                            {errors[`q_${q.id}`] && (
                                                <p className="text-sm text-destructive">{errors[`q_${q.id}`]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {draft.step === 3 && (
                                <div className="space-y-6">
                                    {antiQuestions.map((q) => (
                                        <div key={q.id} className="space-y-2">
                                            <Label>{q.text}</Label>
                                            <ScaleSelector
                                                value={draft.answers[q.id] ?? null}
                                                onChange={(v) => setAnswer(q.id, v)}
                                            />
                                            {errors[`q_${q.id}`] && (
                                                <p className="text-sm text-destructive">{errors[`q_${q.id}`]}</p>
                                            )}
                                        </div>
                                    ))}
                                    <div className="space-y-1">
                                        <Label>Saran / Komentar (opsional)</Label>
                                        <textarea
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={draft.comment}
                                            onChange={(e) => setField('comment', e.target.value)}
                                        />
                                    </div>
                                    {errors.duplicate && (
                                        <p className="text-sm text-destructive">{errors.duplicate}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                {draft.step > 1 ? (
                                    <Button type="button" variant="outline" onClick={back}>
                                        Kembali
                                    </Button>
                                ) : (
                                    <span />
                                )}
                                {draft.step < 3 ? (
                                    <Button type="button" onClick={next}>
                                        Lanjut
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={submit} disabled={submitting}>
                                        {submitting ? 'Mengirim...' : 'Kirim'}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
