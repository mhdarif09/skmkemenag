import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList, FileText, ListChecks, PenLine, ScanLine, Smartphone } from 'lucide-react';
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
        title: '1. Isi Data Diri',
        desc: 'Cukup nama (boleh anonim), jenis kelamin, dan pekerjaan. Tidak rumit.',
    },
    {
        icon: ListChecks,
        title: '2. Pilih Layanan',
        desc: 'Tentukan unit layanan dan kebutuhan yang Anda tangani saat itu.',
    },
    {
        icon: PenLine,
        title: '3. Beri Penilaian',
        desc: 'Pilih jawaban yang paling sesuai untuk setiap pertanyaan, lalu kirim.',
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
                {/* Hero */}
                <section className="hero-brand relative -mt-px overflow-hidden pb-24 text-white sm:pb-28">
                    <div className="relative mx-auto max-w-5xl px-6 pt-10 text-center sm:pt-14">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium ring-1 ring-white/25">
                            <ScanLine className="h-3.5 w-3.5" />
                            Survei resmi · Periode {period ? period.name : 'Berjalan'}
                        </span>
                        <h1 className="mt-5 text-3xl leading-tight font-bold sm:text-5xl">
                            Survei Kepuasan Masyarakat
                            <span className="mt-1 block text-lg font-medium text-white/85 sm:text-2xl">
                                &amp; Persepsi Anti Korupsi
                            </span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm text-white/85 sm:text-base">
                            {welcomeText ?? 'Suara Anda menentukan perbaikan layanan kami. Sebutkan pengalaman Anda secara jujur — hanya butuh 2 menit.'}
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 w-full rounded-2xl bg-white px-8 text-base font-bold text-kemenag-primary-dark shadow-pop transition-transform hover:scale-[1.02] hover:bg-white sm:w-auto"
                            >
                                <Link href="/survei">
                                    Mulai Isi Survei
                                    <ArrowRight className="ml-1 h-5 w-5" />
                                </Link>
                            </Button>
                            <div className="flex items-center gap-2 text-xs text-white/75">
                                <Smartphone className="h-4 w-4" />
                                Bisa diisi lewat HP maupun komputer
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step guide + data section, overlap hero */}
                <section className="relative mx-auto -mt-16 max-w-5xl px-4 sm:px-6">
                    <div className="grid gap-4 rounded-3xl border bg-card p-4 shadow-soft sm:grid-cols-3 sm:p-6">
                        {STEPS.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand text-white">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">{title}</div>
                                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {/* QR */}
                        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border bg-card p-6 text-center shadow-soft">
                            <div>
                                <h2 className="text-lg font-bold">Berbagi lewat QR Code</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Tunjukkan QR ini ke pengunjung — mereka tinggal pindai dan langsung isi survei.
                                </p>
                            </div>
                            <div className="rounded-2xl border bg-white p-3 shadow-soft">
                                <div
                                    className="h-44 w-44 [&>svg]:h-full [&>svg]:w-full"
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />
                            </div>
                        </div>

                        {/* IKM */}
                        {showPublicIkm && ikm ? (
                            <div className="rounded-3xl border bg-card p-6 shadow-soft">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold">Hasil Kepuasan Publik</h2>
                                        <p className="mt-1 text-xs text-muted-foreground">{period ? period.name : ''}</p>
                                    </div>
                                    <span className="rounded-xl gradient-brand px-3 py-2 text-center text-white">
                                        <span className="block text-2xl leading-none font-bold">{ikm.grade}</span>
                                        <span className="mt-0.5 block text-[10px]">{GRADE_LABEL[ikm.grade] ?? '—'}</span>
                                    </span>
                                </div>
                                <div className="mt-5 space-y-3">
                                    <MeterRow label="Indeks Kepuasan Total" value={ikm.ikm_total} strong />
                                    <MeterRow label="Kepuasan Pelayanan" value={ikm.ikm_pelayanan} />
                                    <MeterRow label="Indeks Anti Korupsi" value={ikm.ikm_anti_corruption} />
                                </div>
                                <p className="mt-4 rounded-xl bg-muted/60 p-2.5 text-center text-xs text-muted-foreground">
                                    Berdasarkan <span className="font-semibold text-foreground">{ikm.respondent_count}</span> responden periode ini.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border bg-card p-6 text-center shadow-soft">
                                <ClipboardList className="h-10 w-10 text-primary" />
                                <h2 className="text-lg font-bold">Hasil akan dipublikasikan</h2>
                                <p className="max-w-xs text-sm text-muted-foreground">
                                    Rangkuman indeks kepuasan masyarakat akan tampil di halaman ini setelah tersedia.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Friendly closing CTA */}
                    <div className="mt-8 mb-10 rounded-3xl bg-secondary p-6 text-center sm:p-8">
                        <h2 className="text-xl font-bold text-secondary-foreground">
                            Setiap penilaian sangat berarti
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                            Data yang Anda berikan hanya digunakan untuk penilaian layanan publik dan tidak dibagikan ke pihak lain.
                        </p>
                        <Button asChild size="lg" className="mt-5 h-12 rounded-xl px-8 text-base font-bold">
                            <Link href="/survei">
                                Isi Survei Sekarang
                                <ArrowRight className="ml-1 h-5 w-5" />
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
            <div className="mb-1 flex items-center justify-between text-sm">
                <span className={strong ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
                <span className={`font-bold ${strong ? 'text-primary' : ''}`}>{formatNumber(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full gradient-brand transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    );
}
