import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, HeartHandshake } from 'lucide-react';
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
                <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center sm:py-24">
                    <div className="animate-pop-in rounded-full gradient-brand p-3 shadow-pop">
                        <CheckCircle2 className="h-16 w-16 text-white" strokeWidth={1.6} />
                    </div>

                    <h1 className="mt-6 text-3xl font-bold tracking-tight">Terima Kasih! 🎉</h1>
                    <p className="mt-3 max-w-md text-muted-foreground">
                        Survei Anda <span className="font-semibold text-primary">berhasil terkirim</span>. Masukan
                        Anda sangat berarti untuk perbaikan kualitas pelayanan {organizationName}.
                    </p>

                    <div className="mt-8 grid w-full gap-3">
                        {[
                            'Jawaban akan kami kelompokkan bersama responden lain',
                            'Semua data dijaga kerahasiaannya',
                            'Hasil laporan dipublikasikan di halaman utama',
                        ].map((line) => (
                            <div
                                key={line}
                                className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-left text-sm shadow-soft"
                            >
                                <HeartHandshake className="h-5 w-5 shrink-0 text-primary" />
                                {line}
                            </div>
                        ))}
                    </div>

                    <Button asChild size="lg" className="gradient-brand mt-10 h-12 w-full rounded-xl text-base font-bold sm:w-auto">
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
