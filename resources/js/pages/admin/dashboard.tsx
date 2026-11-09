import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { AdminShell } from '@/components/admin-shell';
import { Award, Gauge, HandHeart, ShieldCheck } from 'lucide-react';
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

export default function AdminDashboard({
    periods,
    serviceUnits,
    filters,
    ikm,
    todayCount,
    ikmPerPeriod,
    nrrPerQuestion,
    ikmPerUnit,
    genderCounts,
    occupationCounts,
    recentComments,
    organizationName,
}: {
    periods: { id: number; name: string; is_active: boolean }[];
    serviceUnits: { id: number; name: string }[];
    filters: { period_id: number | null; service_unit_id: number | null };
    ikm: Ikm;
    todayCount: number;
    ikmPerPeriod: { period: string; ikm_total: number; ikm_pelayanan: number; ikm_anti_corruption: number }[];
    nrrPerQuestion: { question: string; nrr: number; ikm: number }[];
    ikmPerUnit: { unit: string; ikm_total: number; respondent_count: number }[];
    genderCounts: Record<string, number>;
    occupationCounts: Record<string, number>;
    recentComments: { id: number; name: string | null; comment: string; submitted_at: string; service_unit_id: number; follow_up_status: string }[];
    organizationName: string;
}) {
    const [periodId, setPeriodId] = useState(filters.period_id ? String(filters.period_id) : '');
    const [serviceUnitId, setServiceUnitId] = useState(filters.service_unit_id ? String(filters.service_unit_id) : '');

    const applyFilters = () => {
        router.get(
            '/admin',
            {
                period_id: periodId || undefined,
                service_unit_id: serviceUnitId || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const gradeColor = (grade: string) => {
        switch (grade) {
            case 'A':
                return 'bg-kemenag-primary text-white';
            case 'B':
                return 'bg-grade-b text-white';
            case 'C':
                return 'bg-grade-c text-white';
            default:
                return 'bg-grade-d text-white';
        }
    };

    const genderData = Object.entries(genderCounts).map(([name, value]) => ({
        name: name === 'L' ? 'Laki-laki' : 'Perempuan',
        value,
    }));

    const occupationData = Object.entries(occupationCounts).map(([name, value]) => ({ name, value }));

    return (
        <>
            <Head title="Dashboard Admin" />
            <AdminShell title="Dashboard" subtitle={organizationName}>
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-end gap-3">
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
                        <Button onClick={applyFilters}>Terapkan</Button>
                    </div>

                    {/* KPI cards */}
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white">
                                        <Gauge className="h-4 w-4" />
                                    </span>
                                    <CardTitle className="text-sm text-muted-foreground">IKM Total</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">
                                    {ikm ? formatNumber(ikm.ikm_total) : '-'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white">
                                        <HandHeart className="h-4 w-4" />
                                    </span>
                                    <CardTitle className="text-sm text-muted-foreground">IKM Pelayanan</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{ikm ? formatNumber(ikm.ikm_pelayanan) : '-'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white">
                                        <ShieldCheck className="h-4 w-4" />
                                    </span>
                                    <CardTitle className="text-sm text-muted-foreground">Indeks Anti Korupsi</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{ikm ? formatNumber(ikm.ikm_anti_corruption) : '-'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white">
                                        <Award className="h-4 w-4" />
                                    </span>
                                    <CardTitle className="text-sm text-muted-foreground">Mutu Pelayanan</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center gap-3">
                                {ikm && (
                                    <span className={`rounded-xl px-3 py-1.5 text-lg font-bold ${gradeColor(ikm.grade)}`}>
                                        {ikm.grade}
                                    </span>
                                )}
                                <div className="text-xs text-muted-foreground">
                                    Responden: {ikm?.respondent_count ?? 0} (hari ini {todayCount})
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="mb-6 grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">IKM per Periode</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={ikmPerPeriod}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="ikm_total" stroke="var(--color-primary)" name="IKM Total" />
                                        <Line type="monotone" dataKey="ikm_pelayanan" stroke="var(--color-chart-2)" name="IKM Pelayanan" />
                                        <Line type="monotone" dataKey="ikm_anti_corruption" stroke="var(--color-chart-3)" name="Anti Korupsi" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">NRR per Pertanyaan (terendah → tertinggi)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={nrrPerQuestion} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 4]} />
                                        <YAxis type="category" dataKey="question" tick={{ fontSize: 9 }} width={120} />
                                        <Tooltip />
                                        <Bar dataKey="nrr" fill="var(--color-primary)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">IKM per Unit Layanan</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ikmPerUnit}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="unit" tick={{ fontSize: 9 }} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Bar dataKey="ikm_total" fill="var(--color-primary)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Distribusi Gender &amp; Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="var(--color-primary)" label />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent comments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Komentar / Saran Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentComments.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
                                )}
                                {recentComments.map((c) => (
                                    <div key={c.id} className="rounded border border-border p-3">
                                        <div className="text-xs text-muted-foreground">
                                            {c.name || 'Anonim'} · {new Date(c.submitted_at).toLocaleString('id-ID')}
                                        </div>
                                        <div className="mt-1 text-sm">{c.comment}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
            </AdminShell>
        </>
    );
}
