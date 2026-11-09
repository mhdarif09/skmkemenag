import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FileText, ListChecks, Lock, MessageSquareHeart, PenLine, ScanLine, Smartphone } from 'lucide-react';
import { PublicShell } from '@/components/public-shell';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/formatNumber';

type Ikm = {
    ikm_total: number;
    ikm_pelayanan: number;
    ikm_anti_corruption: number;
    grade: string;
    respondent_count: number;
} | null;

const GRADE_LABEL: Record<string, string> = {
    A: 'Sangat Baik',
    B: 'Baik',
    C: 'Kurang Baik',
    D: 'Tidak Baik',
};

const STEPS = [
    {
        icon: FileText,
        n: '01',
        title: 'Isi Data Diri',
        desc: 'Cukup nama (boleh anonim), jenis kelamin, dan pekerjaan — 30 detik.',
    },
    {
        icon: ListChecks,
        n: '02',
        title: 'Pilih Layanan',
        desc: 'Tentukan unit dan kebutuhan yang Anda layani.',
    },
    {
        icon: PenLine,
        n: '03',
        title: 'Beri Penilaian',
        desc: 'Ketuk wajah yang paling sesuai, lalu kirim — selesai.',
    },
];

export default function Landing({
    organizationName,
    logoPath,
    welcomeText,
    showPublicIkm,
    ikm,
    period,
    qrCode,
}: {
    organizationName: string;
    logoPath: string | null;
    welcomeText: string | null;
    showPublicIkm: boolean;
    ikm: Ikm;
    period: { name: string } | null;
    qrCode: string;
}) {
    return (
        <>
            <Head title={organizationName} />
            <PublicShell logoPath={logoPath} organizationName={organizationName}>
                {/* HERO — white, green typography, soft decorative wash */}
                <section className="relative overflow-hidden">
                    <div aria-hidden className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary blur-2xl" />
                    </div>

                    <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pt-16">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground">
                            <ScanLine className="h-3.5 w-3.5 text-primary" />
                            Survei berkala · {period ? period.name : 'Running'}
                        </span>

                        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                            Suara Anda Menentukan Mutu{' '}
                            <span className="text-primary">Pelayanan Kami</span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {welcomeText ??
                                'Fill out the Satisfaction Survey & Corruption Perception — tell us your story honestly, without a login, free of charge.'}
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 w-full rounded-2xl px-10 text-base font-bold shadow-[0_10px_30px_-10px_var(--kemenag-primary)] transition-transform hover:scale-[1.03] sm:w-auto"
                            >
                                <Link href="/survei">
                                    Isi Survei Sekarang
                                    <ArrowRight className="ml-1.5 h-5 w-5" />
                                </Link>
                            </Button>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Smartphone className="h-4 w-4 text-primary" />
                                Bisa diisi lewat HP maupun komputer · tanpa install
                            </span>
                        </div>

                        {/* Mini IKM chips for social proof */}
                        {showPublicIkm && ikm && (
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                {[
                                    { l: 'IKM Total', v: ikm.ikm_total },
                                    { l: 'IKM Pelayanan', v: ikm.ikm_pelayanan },
                                    { l: 'Indeks Anti Korupsi', v: ikm.ikm_anti_corruption },
                                ].map((c) => (
                                    <div
                                        key={c.l}
                                        className="rounded-2xl border bg-card px-5 py-3 text-center shadow-soft"
                                    >
                                        <div className="text-xl font-bold text-primary">{formatNumber(c.v)}</div>
                                        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{c.l}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* STEP GUIDE — numbered, icon, big targets */}
                <section className="mx-auto max-w-5xl px-4 sm:px-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {STEPS.map(({ icon: Icon, n, title, desc }) => (
                            <div
                                key={n}
                                className="relative rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-pop"
                            >
                                <span className="absolute right-4 top-3 text-2xl font-black text-primary/10">{n}</span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="mt-4 text-base font-bold">{title}</div>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* INFO GRID — QR + IKM result */}
                <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* QR */}
                        <div className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft">
                            <h2 className="text-lg font-bold">Bagikan lewat QR Code</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Tunjukkan QR ini ke pengunjung — tinggal pindai dan langsung isi survei.
                            </p>
                            <div className="mt-auto flex items-center justify-center pt-5">
                                <div className="rounded-2xl border-4 border-secondary bg-white p-3 shadow-soft">
                                    <div
                                        className="h-40 w-40 [&>svg]:h-full [&>svg]:w-full"
                                        dangerouslySetInnerHTML={{ __html: qrCode }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* IKM detail */}
                        {showPublicIkm && ikm ? (
                            <div className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold">Indeks Kepuasan Publik</h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">{period ? period.name : ''}</p>
                                    </div>
                                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-kemenag-primary-dark text-center text-xl font-black text-white shadow-soft">
                                        {ikm.grade}
                                    </span>
                                </div>
                                <div className="mt-6 flex-1 space-y-4">
                                    <MeterRow label="IKM Total" value={ikm.ikm_total} strong />
                                    <MeterRow label="Kepuasan Pelayanan" value={ikm.ikm_pelayanan} />
                                    <MeterRow label="Indeks Anti Korupsi" value={ikm.ikm_anti_corruption} />
                                </div>
                                <p className="mt-4 rounded-xl bg-secondary p-2.5 text-center text-xs font-medium text-secondary-foreground">
                                    Mutu pelayanan <span className="font-bold">{ikm.grade} ({GRADE_LABEL[ikm.grade] ?? '—'})</span> from{' '}
                                    <span className="font-bold">{ikm.respondent_count}</span> responden
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card p-6 text-center shadow-soft">
                                <MessageSquareHeart className="h-10 w-10 text-primary" />
                                <h2 className="text-lg font-bold">Hasil Akan Dipublikasikan</h2>
                                <p className="max-w-xs text-sm text-muted-foreground">
                                    Rangkuman indeks kepuasan masyarakat tampil di sini setelah tersedia.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* CLOSER */}
                <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                    <div className="flex flex-col items-center gap-4 rounded-3xl bg-kemenag-primary-dark px-6 py-10 text-center text-white sm:px-10">
                        <Lock className="h-6 w-6 text-accent" />
                        <h2 className="text-xl font-bold sm:text-2xl">Setiap Penilaian Berharga — Kami Jaga</h2>
                        <p className="max-w-lg text-sm text-white/80">
                            Data yang Anda berikan hanya digali untuk evaluasi pelayanan publik, tidak dibagikan ke pihak lain, dan tidak dikait-kaitkan dengan penilai layanan.{' '}
                            <span className="font-semibold text-white">{organizationName}</span>.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="mt-2 h-12 rounded-xl bg-white px-8 text-base font-bold text-kemenag-primary-dark hover:bg-accent hover:text-white"
                        >
                            <Link href="/survei">
                                Isi Survei Sekarang
                                <ArrowRight className="ml-1.5 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </PublicShell>
        </>
    );
}

function MeterRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className={strong ? 'font-bold text-foreground' : 'text-muted-foreground'}>{label}</span>
                <span className={`font-bold ${strong ? 'text-primary text-lg' : ''}`}>{formatNumber(value)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    );
}
