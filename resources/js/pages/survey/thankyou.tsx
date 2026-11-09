import { Head, Link } from '@inertiajs/react';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import { CelebrationBurst } from '@/components/celebration-burst';
import { PublicShell } from '@/components/public-shell';
import { Button } from '@/components/ui/button';

export default function ThankYou({
    organizationName,
    logoPath,
}: {
    organizationName: string;
    logoPath: string | null;
}) {
    return (
        <>
            <Head title="Terima Kasih" />
            <PublicShell logoPath={logoPath} organizationName={organizationName} compact>
                {/* Relative container so the canvas burst can span this section */}
                <div className="relative mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center sm:py-20">
                    <CelebrationBurst anchorId="thankyou-seal" />

                    {/* Seal: expanding rings + self-drawing disc and check */}
                    <div id="thankyou-seal" className="relative mb-2">
                        <span className="animate-ring-ping absolute inset-0 rounded-full bg-primary/40" />
                        <span
                            className="animate-ring-ping absolute inset-0 rounded-full bg-primary/30"
                            style={{ animationDelay: '450ms' }}
                        />

                        <div className="animate-pop-spring relative m-1 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-[0_16px_36px_-12px_var(--kemenag-primary)]">
                            <svg viewBox="0 0 96 96" className="h-24 w-24" fill="none">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="46"
                                    stroke="rgba(255,255,255,0.35)"
                                    strokeWidth="2"
                                    strokeDasharray="302"
                                    className="animate-circle-draw"
                                />
                                <path
                                    d="M30 49 L44 63 L68 36"
                                    stroke="#fff"
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="62"
                                    className="animate-check-draw"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1
                        className="animate-fade-up mt-6 text-3xl font-bold tracking-tight"
                        style={{ animationDelay: '300ms' }}
                    >
                        Terima Kasih!
                    </h1>
                    <p
                        className="animate-fade-up mt-3 max-w-md text-muted-foreground"
                        style={{ animationDelay: '450ms' }}
                    >
                        Survei Anda <span className="font-semibold text-primary">berhasil terkirim</span>. Masukan Anda
                        sangat berarti untuk perbaikan kualitas pelayanan {organizationName}.
                    </p>

                    <div className="mt-8 w-full space-y-2.5">
                        {[
                            'Jawaban akan kami kelompokkan bersama responden lain',
                            'Semua data dijaga kerahasiaannya',
                            'Hasil laporan dipublikasikan di halaman utama',
                        ].map((line, i) => (
                            <div
                                key={line}
                                className="animate-fade-up flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-left text-sm shadow-soft"
                                style={{ animationDelay: `${600 + i * 120}ms` }}
                            >
                                <HeartHandshake className="h-5 w-5 shrink-0 text-primary" />
                                {line}
                            </div>
                        ))}
                    </div>

                    <Button
                        asChild
                        size="lg"
                        className="animate-fade-up mt-10 h-12 w-full rounded-xl text-base font-bold sm:w-auto"
                        style={{ animationDelay: '1000ms' }}
                    >
                        <Link href="/">
                            Kembali ke Beranda
                            <ArrowRight className="ml-1 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </PublicShell>
        </>
    );
}
