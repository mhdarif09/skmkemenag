import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatNumber';

type Ikm = {
    ikm_total: number;
    ikm_pelayanan: number;
    ikm_anti_corruption: number;
    grade: string;
    respondent_count: number;
} | null;

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
            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
                        {logoPath ? (
                            <img src={logoPath} alt="Logo" className="h-12 w-12 object-contain" />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                KA
                            </div>
                        )}
                        <div>
                            <div className="text-sm text-muted-foreground">Kementerian Agama</div>
                            <div className="text-lg font-semibold">{organizationName}</div>
                        </div>
                    </div>
                    <div className="h-1 bg-accent" />
                </header>

                <main className="mx-auto max-w-5xl px-6 py-10">
                    <section className="mb-10 text-center">
                        <h1 className="text-3xl font-bold text-primary">Survei Kepuasan Masyarakat</h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            &amp; Persepsi Anti Korupsi
                        </p>
                        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
                            {welcomeText}
                        </p>
                        <div className="mt-6">
                            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <Link href="/survei">Isi Survei</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-primary">Pindai QR Code</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                <div
                                    className="h-48 w-48"
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />
                            </CardContent>
                        </Card>

                        {showPublicIkm && ikm && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-primary">
                                        Indeks Kepuasan Masyarakat {period ? `(${period.name})` : ''}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">IKM Total</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatNumber(ikm.ikm_total)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">IKM Pelayanan</span>
                                        <span className="font-semibold">{formatNumber(ikm.ikm_pelayanan)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Indeks Anti Korupsi</span>
                                        <span className="font-semibold">{formatNumber(ikm.ikm_anti_corruption)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Mutu Pelayanan</span>
                                        <span className="rounded bg-primary px-2 py-0.5 text-sm font-bold text-primary-foreground">
                                            {ikm.grade}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Berdasarkan {ikm.respondent_count} responden.
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                </main>

                <footer className="mt-10 bg-primary text-primary-foreground">
                    <div className="mx-auto max-w-5xl px-6 py-4 text-center text-sm">
                        Ikhlas Beramal
                    </div>
                </footer>
            </div>
        </>
    );
}
