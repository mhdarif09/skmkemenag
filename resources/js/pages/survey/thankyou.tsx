import { Head, Link } from '@inertiajs/react';
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
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl">
                    ✓
                </div>
                <h1 className="text-2xl font-bold text-primary">Terima Kasih</h1>
                <p className="mt-2 max-w-md text-muted-foreground">
                    Survei Anda telah kami terima. Masukan Anda sangat berarti untuk perbaikan kualitas pelayanan {organizationName}.
                </p>
                <div className="mt-6">
                    <Button asChild variant="outline">
                        <Link href="/">Kembali ke Beranda</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
