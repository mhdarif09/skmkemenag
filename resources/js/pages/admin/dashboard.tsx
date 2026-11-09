import { Head, router } from '@inertiajs/react';
import { Award, Gauge, HandHeart, MessageSquareText, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber } from '@/lib/formatNumber';

/* ── Categorical palette: setiap kategori warna beda & mudah dibedakan ── */
const COLORS = {
    total: '#047857', // emerald — IKM Total
    pelayanan: '#0284c7', // sky — Pelayanan
    antiKorupsi: '#d97706', // amber — Anti Korupsi
    laki: '#0f766e', // teal — Laki-laki
    perempuan: '#db2777', // pink — Perempuan
    groupA: '#047857',
    groupB: '#7c3aed', // violet — Persepsi Anti Korupsi (kelompok B)
    gradeA: '#047857',
    gradeB: '#65a30d',
    gradeC: '#d97706',
    gradeD: '#dc2626',
};

const UNIT_COLORS = ['#047857', '#0284c7', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#9333ea'];
const OCCUPATION_COLORS = ['#047857', '#0284c7', '#d97706', '#db2777', '#7c3aed', '#0891b2'];

const AXIS_TICK = { fontSize: 10, fill: '#6b7280' } as const;
const TOOLTIP_STYLE: React.CSSProperties = {
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    background: '#fff',
    boxShadow: '0 12px 32px -12px rgb(15 90 40 / 0.25)',
    fontSize: 12,
    padding: '8px 12px',
};

type ChartTooltipProps = {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color?: string; payload?: Record<string, unknown> }>;
    label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div style={TOOLTIP_STYLE}>
            {label && <div className="mb-1 font-semibold text-gray-800">{String(label)}</div>}
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color ?? COLORS.total }} />
                    <span className="text-gray-500">{p.name}:</span>
                    <span className="font-bold text-gray-900">{formatNumber(Number(p.value))}</span>
                </div>
            ))}
        </div>
    );
}

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
        router.get('/admin', { period_id: periodId || undefined, service_unit_id: serviceUnitId || undefined }, { preserveState: true, replace: true });
    };

    const genderData = Object.entries(genderCounts).map(([key, value]) => ({
        name: key === 'L' ? 'Laki-laki' : 'Perempuan',
        value,
        fill: key === 'L' ? COLORS.laki : COLORS.perempuan,
    }));
    const totalRespondents = genderData.reduce((s, d) => s + d.value, 0);

    const occupationData = Object.entries(occupationCounts)
        .map(([name, value], i) => ({ name, value, fill: OCCUPATION_COLORS[i % OCCUPATION_COLORS.length] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    // NRR: potong label panjang untuk sumbu Y, teks penuh tetap ada di tooltip
    const nrrData = [...nrrPerQuestion].sort((a, b) => a.nrr - b.nrr).map((q) => ({
        ...q,
        short: q.question.length > 42 ? `${q.question.slice(0, 42)}…` : q.question,
    }));

    const unitData = ikmPerUnit.map((u, i) => ({ ...u, fill: UNIT_COLORS[i % UNIT_COLORS.length] }));

    return (
        <>
            <Head title="Dashboard Admin" />
            <AdminShell title="Dashboard" subtitle={organizationName}>
                {/* Filter bar */}
                <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm sm:mb-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Periode</label>
                            <Select value={periodId} onValueChange={setPeriodId}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih periode" /></SelectTrigger>
                                <SelectContent>
                                    {periods.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Unit layanan</label>
                            <Select value={serviceUnitId} onValueChange={setServiceUnitId}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Semua unit" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua unit</SelectItem>
                                    {serviceUnits.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={applyFilters} className="h-10 w-full rounded-xl bg-kemenag-primary-dark hover:bg-kemenag-primary sm:w-auto sm:px-6">Terapkan</Button>
                    </div>
                </div>

                {/* KPI cards */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                    <KpiCard icon={<Gauge className="h-5 w-5" />} label="IKM Total" value={ikm ? formatNumber(ikm.ikm_total) : '-'} color={COLORS.total} hint="Skor keseluruhan" progress={ikm?.ikm_total} />
                    <KpiCard icon={<HandHeart className="h-5 w-5" />} label="IKM Pelayanan" value={ikm ? formatNumber(ikm.ikm_pelayanan) : '-'} color={COLORS.pelayanan} hint="Kelompok A" progress={ikm?.ikm_pelayanan} />
                    <KpiCard icon={<ShieldCheck className="h-5 w-5" />} label="Anti Korupsi" value={ikm ? formatNumber(ikm.ikm_anti_corruption) : '-'} color={COLORS.antiKorupsi} hint="Kelompok B" progress={ikm?.ikm_anti_corruption} />
                    <Card className="overflow-hidden border-t-4 shadow-sm" style={{ borderTopColor: '#7c3aed' }}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: '#7c3aed' }}><Award className="h-5 w-5" /></span>
                                    <CardTitle className="text-xs font-semibold text-gray-500">Mutu Pelayanan</CardTitle>
                                </div>
                                {ikm && <span className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black text-white" style={{ background: `var(--grade-${ikm.grade.toLowerCase()}, ${COLORS.gradeA})` }}>{ikm.grade}</span>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium text-gray-700">{ikm?.respondent_count ?? 0} responden</div>
                            <div className="text-xs text-gray-400">+{todayCount} hari ini</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tren IKM */}
                <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
                    <Card className="shadow-sm xl:col-span-3">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base font-bold">Tren IKM per Periode</CardTitle>
                            <CardDescription>Setiap garis = satu kategori</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LegendDots items={[
                                { color: COLORS.total, label: 'IKM Total' },
                                { color: COLORS.pelayanan, label: 'Pelayanan' },
                                { color: COLORS.antiKorupsi, label: 'Anti Korupsi' },
                            ]} />
                            <div className="mt-2 h-[280px] w-full sm:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={ikmPerPeriod} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={COLORS.total} stopOpacity={0.25} />
                                                <stop offset="100%" stopColor={COLORS.total} stopOpacity={0.02} />
                                            </linearGradient>
                                            <linearGradient id="gPel" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={COLORS.pelayanan} stopOpacity={0.2} />
                                                <stop offset="100%" stopColor={COLORS.pelayanan} stopOpacity={0.02} />
                                            </linearGradient>
                                            <linearGradient id="gAnti" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={COLORS.antiKorupsi} stopOpacity={0.2} />
                                                <stop offset="100%" stopColor={COLORS.antiKorupsi} stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#eef2ee" strokeDasharray="4 4" vertical={false} />
                                        <XAxis dataKey="period" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                                        <YAxis domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="ikm_total" stroke={COLORS.total} strokeWidth={3} fill="url(#gTotal)" name="IKM Total" dot={false} activeDot={{ r: 5 }} />
                                        <Area type="monotone" dataKey="ikm_pelayanan" stroke={COLORS.pelayanan} strokeWidth={2.5} fill="url(#gPel)" name="Pelayanan" dot={false} activeDot={{ r: 4 }} />
                                        <Area type="monotone" dataKey="ikm_anti_corruption" stroke={COLORS.antiKorupsi} strokeWidth={2.5} fill="url(#gAnti)" name="Anti Korupsi" dot={false} activeDot={{ r: 4 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* NRR */}
                    <Card className="shadow-sm xl:col-span-2">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base font-bold">NRR per Pertanyaan</CardTitle>
                            <CardDescription>Terendah → tertinggi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full sm:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={nrrData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid stroke="#eef2ee" strokeDasharray="4 4" horizontal={false} />
                                        <XAxis type="number" domain={[0, 4]} tick={AXIS_TICK} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="short" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} width={120} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                        <Bar dataKey="nrr" name="NRR" radius={[0, 8, 8, 0]} barSize={16}>
                                            {nrrData.map((e) => (
                                                <Cell key={e.question} fill={e.nrr * 25 >= 88.31 ? COLORS.gradeA : e.nrr * 25 >= 76.61 ? COLORS.gradeB : e.nrr * 25 >= 65 ? COLORS.gradeC : COLORS.gradeD} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <LegendDots items={[
                                { color: COLORS.gradeA, label: 'A · ≥88,31' },
                                { color: COLORS.gradeB, label: 'B · ≥76,61' },
                                { color: COLORS.gradeC, label: 'C · ≥65' },
                                { color: COLORS.gradeD, label: 'D · <65' },
                            ]} />
                        </CardContent>
                    </Card>
                </div>

                {/* Unit + Profil */}
                <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
                    <Card className="shadow-sm xl:col-span-3">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base font-bold">IKM per Unit Layanan</CardTitle>
                            <CardDescription>Setiap unit warna berbeda</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[260px] w-full sm:h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={unitData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                                        <CartesianGrid stroke="#eef2ee" strokeDasharray="4 4" vertical={false} />
                                        <XAxis dataKey="unit" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={64} />
                                        <YAxis domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                        <Bar dataKey="ikm_total" name="IKM Total" radius={[8, 8, 0, 0]}>
                                            {unitData.map((u) => <Cell key={u.unit} fill={u.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm xl:col-span-2">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base font-bold">Profil Responden</CardTitle>
                            <CardDescription>Gender & pekerjaan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mx-auto h-[180px] w-full max-w-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} cornerRadius={8} stroke="none">
                                            {genderData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                                        </Pie>
                                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="flex items-center gap-1 text-2xl font-black"><Users className="h-4 w-4 text-kemenag-primary" />{totalRespondents}</span>
                                    <span className="text-[11px] text-gray-400">Responden</span>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1.5">
                                {genderData.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />{d.name}</span>
                                        <span className="font-bold">{d.value} <span className="font-normal text-gray-400">({totalRespondents ? Math.round((d.value / totalRespondents) * 100) : 0}%)</span></span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 border-t pt-3">
                                <div className="mb-2 text-xs font-semibold text-gray-500">Pekerjaan teratas</div>
                                <div className="space-y-2">
                                    {occupationData.map((o) => (
                                        <div key={o.name} className="text-xs">
                                            <div className="mb-1 flex justify-between"><span className="truncate pr-2 font-medium text-gray-700">{o.name}</span><span className="font-bold">{o.value}</span></div>
                                            <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: `${occupationData[0] ? (o.value / occupationData[0].value) * 100 : 0}%`, background: o.fill }} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Komentar */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><MessageSquareText className="h-5 w-5" /></span>
                            <div>
                                <CardTitle className="text-base font-bold">Komentar & Saran Terbaru</CardTitle>
                                <CardDescription>Masukan langsung responden</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentComments.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-400">Belum ada komentar.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {recentComments.map((c) => (
                                    <div key={c.id} className="rounded-2xl border bg-gray-50/70 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate text-xs font-bold text-gray-800">{c.name || 'Anonim'}</span>
                                            <span className="shrink-0 text-[11px] text-gray-400">{new Date(c.submitted_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{c.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </AdminShell>
        </>
    );
}

function KpiCard({ icon, label, value, color, hint, progress }: { icon: React.ReactNode; label: string; value: string; color: string; hint: string; progress?: number }) {
    return (
        <Card className="overflow-hidden border-t-4 shadow-sm transition-shadow hover:shadow-md" style={{ borderTopColor: color }}>
            <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: color }}>{icon}</span>
                    <span className="text-[11px] font-semibold text-gray-400">{hint}</span>
                </div>
                <CardTitle className="pt-2 text-xs font-semibold text-gray-500">{label}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="text-3xl font-black tracking-tight" style={{ color }}>{value}</div>
                {typeof progress === 'number' && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, background: color }} /></div>
                )}
            </CardContent>
        </Card>
    );
}

function LegendDots({ items }: { items: Array<{ color: string; label: string }> }) {
    return (
        <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1.5">
            {items.map((i) => (
                <span key={i.label} className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />{i.label}
                </span>
            ))}
        </div>
    );
}
