import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber } from '@/lib/formatNumber';

type Ikm = {
    ikm_total: number;
    ikm_pelayanan: number;
    ikm_anti_corruption: number;
    grade: string;
    respondent_count: number;
    nrr: Record<string, number>;
} | null;

type NrrItem = {
    text: string;
    group: string;
    nrr: number;
    ikm: number;
    grade: string;
};

type Comment = {
    id: number;
    name: string | null;
    gender: string;
    city: string;
    need: string;
    comment: string;
    submitted_at: string;
};

type Lowest = { text: string; group: string; nrr: number; ikm: number; grade: string } | null;

export default function LaporanPage({
    periods,
    serviceUnits,
    filters,
    ikm,
    nrrPerQuestion,
    lowest,
    conclusion,
    recommendation,
    comments,
    organizationName,
    logoPath,
}: {
    periods: { id: number; name: string; is_active: boolean }[];
    serviceUnits: { id: number; name: string }[];
    filters: { period_id: number | null; service_unit_id: number | null };
    ikm: Ikm;
    nrrPerQuestion: NrrItem[];
    lowest: Lowest;
    conclusion: string | null;
    recommendation: string | null;
    comments: Comment[];
    organizationName: string;
    logoPath: string | null;
}) {
    const [periodId, setPeriodId] = useState(filters.period_id ? String(filters.period_id) : '');
    const [serviceUnitId, setServiceUnitId] = useState(filters.service_unit_id ? String(filters.service_unit_id) : '');

    const applyFilters = () => {
        router.get(
            '/admin/laporan',
            {
                period_id: periodId || undefined,
                service_unit_id: serviceUnitId || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const gradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-kemenag-primary text-white';
            case 'B': return 'bg-grade-b text-white';
            case 'C': return 'bg-grade-c text-white';
            default: return 'bg-grade-d text-white';
        }
    };

    return (
        <>
            <Head title="Laporan" />
            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            {logoPath ? (
                                <img src={logoPath} alt="Logo" className="h-8 w-8 object-contain" />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">KA</div>
                            )}
                            <span className="text-lg font-semibold text-primary">{organizationName}</span>
                        </div>
                        <Link href="/admin" className="text-sm text-muted-foreground">
                            Kembali ke Dashboard
                        </Link>
                    </div>
                    <div className="h-1 bg-accent" />
                </header>

                <main className="mx-auto max-w-7xl px-6 py-6">
                    {/* Header + filters */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Laporan IKM</h1>
                            <p className="text-muted-foreground">
                                Indeks Kepuasan Masyarakat dan Persepsi Anti Korupsi
                            </p>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">Periode</label>
                                <Select value={periodId} onValueChange={setPeriodId}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Pilih periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">Unit</label>
                                <Select value={serviceUnitId} onValueChange={setServiceUnitId}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Semua unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua unit</SelectItem>
                                        {serviceUnits.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={applyFilters}>Tampilkan</Button>
                            <a
                                href={`/admin/laporan/export/excel?${new URLSearchParams({ period_id: periodId, service_unit_id: serviceUnitId }).toString()}`}
                                className="inline-flex items-center rounded-md border border-input px-3 py-2 text-sm"
                            >
                                Export Excel
                            </a>
                            <a
                                href={`/admin/laporan/export/pdf?${new URLSearchParams({ period_id: periodId, service_unit_id: serviceUnitId }).toString()}`}
                                className="inline-flex items-center rounded-md border border-input px-3 py-2 text-sm"
                            >
                                Export PDF
                            </a>
                        </div>
                    </div>

                    {ikm ? (
                        <>
                            {/* KPI cards */}
                            <div className="mb-6 grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">IKM Total</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-primary">
                                            {formatNumber(ikm.ikm_total)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">IKM Pelayanan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {formatNumber(ikm.ikm_pelayanan)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">Indeks Anti Korupsi</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {formatNumber(ikm.ikm_anti_corruption)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">Mutu Pelayanan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center gap-3">
                                        <span className={`rounded px-3 py-1 text-lg font-bold ${gradeColor(ikm.grade)}`}>
                                            {ikm.grade}
                                        </span>
                                        <div className="text-xs text-muted-foreground">
                                            Responden: {ikm.respondent_count}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* NRR table + chart */}
                            <div className="mb-6 grid gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">NRR per Pertanyaan (terendah → tertinggi)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left pb-2">Pertanyaan</th>
                                                        <th className="text-right pb-2 w-20">NRR</th>
                                                        <th className="text-right pb-2 w-20">Indeks</th>
                                                        <th className="text-center pb-2 w-16">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {nrrPerQuestion.map((q, i) => (
                                                        <tr key={i} className="border-t">
                                                            <td className="py-2">{q.text}</td>
                                                            <td className="text-right py-2">{formatNumber(q.nrr)}</td>
                                                            <td className="text-right py-2">{formatNumber(q.ikm)}</td>
                                                            <td className="text-center py-2">
                                                                <span className={`rounded px-2 py-0.5 text-xs font-bold ${gradeColor(q.grade)}`}>
                                                                    {q.grade}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Grafik NRR per Pertanyaan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg p-4">
                                        <svg width="100%" height="100%" viewBox="0 0 700 260">
                                            <rect x="0" y="0" width="700" height="260" fill="#ffffff" />
                                            {nrrPerQuestion.map((q, i) => {
                                                const maxNrr = 4;
                                                const pad = 60;
                                                const barH = 24;
                                                const gap = 14;
                                                const colors: Record<string, string> = { A: '#1B7F3B', B: '#2E8B57', C: '#F59E0B', D: '#C62828' };
                                                const barW = (q.nrr / maxNrr) * (700 - pad - 120);
                                                const y = 40 + i * (barH + gap);
                                                const color = colors[q.group] ?? '#6B7280';
                                                const labelY = y + barH / 2 + 5;
                                                return (
                                                    <g key={i}>
                                                        <text x="10" y={labelY} fontSize="9" fill="#1F2937">{formatNumber(q.nrr)}</text>
                                                        <rect x={pad} y={y} width={barW} height={barH} fill={color} rx="2" />
                                                        <text x={pad + barW + 6} y={labelY} fontSize="8" fill="#6B7280">{formatNumber(q.ikm)}</text>
                                                        <text x="10" y={y + barH - 4} fontSize="7" fill="#6B7280">{q.text}</text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Conclusion & recommendation */}
                            {conclusion && recommendation && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Kesimpulan dan Rekomendasi</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="bg-kemenag-primary-light border border-primary/20 rounded p-3">
                                            <p className="text-sm font-semibold text-primary-dark">Kesimpulan:</p>
                                            <p className="text-sm">{conclusion}</p>
                                        </div>
                                        <div className="bg-accent/10 border border-accent/30 rounded p-3">
                                            <p className="text-sm font-semibold text-accent-foreground">Rekomendasi:</p>
                                            <p className="text-sm">{recommendation}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Comments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Komentar dan Saran Terbaru</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {comments.length === 0 && (
                                            <p className="text-sm text-muted-foreground">Tidak ada komentar atau saran dari responden.</p>
                                        )}
                                        {comments.map((c) => (
                                            <div key={c.id} className="rounded border border-border p-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {c.name || 'Anonim'} · {c.gender === 'L' ? 'Laki-laki' : 'Perempuan'} · {c.city}
                                                </div>
                                                <div className="mt-1 text-sm">{c.comment}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">Belum ada data responden untuk filter yang dipilih.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
