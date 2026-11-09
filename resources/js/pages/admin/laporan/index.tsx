import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText, Lightbulb, Target } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminShell } from '@/components/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber } from '@/lib/formatNumber';

const GRADE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
    A: { bg: '#047857', text: '#fff', label: 'Sangat Baik' },
    B: { bg: '#65a30d', text: '#fff', label: 'Baik' },
    C: { bg: '#d97706', text: '#fff', label: 'Kurang Baik' },
    D: { bg: '#dc2626', text: '#fff', label: 'Tidak Baik' },
};

const GROUP_COLOR = { A: '#047857', B: '#7c3aed' } as const;
const GROUP_LABEL = { A: 'A · Pelayanan', B: 'B · Anti Korupsi' } as const;

type Ikm = { ikm_total: number; ikm_pelayanan: number; ikm_anti_corruption: number; grade: string; respondent_count: number; nrr: Record<string, number> } | null;
type NrrItem = { text: string; group: string; nrr: number; ikm: number; grade: string };
type Comment = { id: number; name: string | null; gender: string; city: string; need: string; comment: string; submitted_at: string };

export default function LaporanPage({
    periods, serviceUnits, filters, ikm, nrrPerQuestion, lowest, conclusion, recommendation, comments,
}: {
    periods: { id: number; name: string; is_active: boolean }[];
    serviceUnits: { id: number; name: string }[];
    filters: { period_id: number | null; service_unit_id: number | null };
    ikm: Ikm;
    nrrPerQuestion: NrrItem[];
    lowest: NrrItem | null;
    conclusion: string | null;
    recommendation: string | null;
    comments: Comment[];
}) {
    const [periodId, setPeriodId] = useState(filters.period_id ? String(filters.period_id) : '');
    const [serviceUnitId, setServiceUnitId] = useState(filters.service_unit_id ? String(filters.service_unit_id) : '');

    const applyFilters = () => router.get('/admin/laporan', { period_id: periodId || undefined, service_unit_id: serviceUnitId || undefined }, { preserveState: true, replace: true });
    const exportUrl = (type: 'excel' | 'pdf') => `/admin/laporan/export/${type}?${new URLSearchParams({ period_id: periodId, service_unit_id: serviceUnitId }).toString()}`;

    const chartData = [...nrrPerQuestion].sort((a, b) => a.nrr - b.nrr).map((q) => ({
        ...q,
        short: q.text.length > 40 ? `${q.text.slice(0, 40)}…` : q.text,
        fill: q.group === 'B' ? GROUP_COLOR.B : GROUP_COLOR.A,
    }));

    const groupA = nrrPerQuestion.filter((q) => q.group === 'A');
    const groupB = nrrPerQuestion.filter((q) => q.group === 'B');
    const avg = (arr: NrrItem[]) => (arr.length ? arr.reduce((s, q) => s + q.ikm, 0) / arr.length : 0);

    return (
        <>
            <Head title="Laporan IKM" />
            <AdminShell
                title="Laporan IKM"
                subtitle="Ringkasan hasil survei & unduhan berkas"
                actions={
                    <>
                        <Button asChild variant="outline" className="rounded-xl"><a href={exportUrl('excel')}><FileSpreadsheet className="h-4 w-4" /> Excel</a></Button>
                        <Button asChild variant="outline" className="rounded-xl"><a href={exportUrl('pdf')}><FileText className="h-4 w-4" /> PDF</a></Button>
                    </>
                }
            >
                {/* Filter */}
                <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Periode</label>
                            <Select value={periodId} onValueChange={setPeriodId}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih periode" /></SelectTrigger>
                                <SelectContent>{periods.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
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
                        <Button onClick={applyFilters} className="h-10 w-full rounded-xl bg-kemenag-primary-dark sm:w-auto sm:px-6">Tampilkan</Button>
                    </div>
                </div>

                {!ikm ? (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-white py-20 text-center">
                        <Download className="mb-3 h-10 w-10 text-gray-300" />
                        <p className="font-medium text-gray-600">Belum ada data responden untuk filter ini.</p>
                        <p className="mt-1 text-sm text-gray-400">Coba ubah periode atau unit layanan.</p>
                    </div>
                ) : (
                    <>
                        {/* Ringkasan grup */}
                        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                            <SummaryCard title="IKM Total" value={ikm.ikm_total} color="#047857" sub={`${ikm.respondent_count} responden`} />
                            <SummaryCard title="Pelayanan (A)" value={ikm.ikm_pelayanan} color={GROUP_COLOR.A} sub={`${groupA.length} pertanyaan`} />
                            <SummaryCard title="Anti Korupsi (B)" value={ikm.ikm_anti_corruption} color={GROUP_COLOR.B} sub={`${groupB.length} pertanyaan`} />
                        </div>

                        <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-5">
                            {/* Grafik NRR */}
                            <Card className="shadow-sm xl:col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">NRR per Pertanyaan</CardTitle>
                                    <CardDescription>Hijau = Pelayanan · Ungu = Anti Korupsi</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[340px] w-full sm:h-[380px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                                                <CartesianGrid stroke="#eef2ee" strokeDasharray="4 4" horizontal={false} />
                                                <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                                <YAxis type="category" dataKey="short" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} width={130} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, padding: '8px 12px' }}
                                                    formatter={(v) => [formatNumber(Number(v)), 'NRR']}
                                                    labelFormatter={(_, payload) => (payload?.[0]?.payload?.text as string) ?? ''}
                                                />
                                                <Bar dataKey="nrr" radius={[0, 8, 8, 0]} barSize={16}>
                                                    {chartData.map((d) => <Cell key={d.text} fill={d.fill} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-gray-500">
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLOR.A }} />A · Pelayanan</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLOR.B }} />B · Anti Korupsi</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabel ringkas */}
                            <Card className="shadow-sm xl:col-span-2">
                                <CardHeader><CardTitle className="text-base font-bold">Rincian NRR</CardTitle><CardDescription>Terendah → tertinggi</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="max-h-[380px] overflow-y-auto pr-1">
                                        <div className="space-y-1.5">
                                            {chartData.map((q, i) => (
                                                <div key={i} className="flex items-center gap-2.5 rounded-xl border bg-gray-50/60 p-2.5">
                                                    <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: q.fill }} />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-xs font-medium text-gray-800">{q.text}</div>
                                                        <div className="text-[11px] text-gray-400">{GROUP_LABEL[q.group as 'A' | 'B'] ?? q.group} · Indeks {formatNumber(q.ikm)}</div>
                                                    </div>
                                                    <Badge style={{ background: GRADE_STYLE[q.grade]?.bg, color: GRADE_STYLE[q.grade]?.text }} className="shrink-0 border-0">{q.grade}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {lowest && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white"><Target className="h-5 w-5" /></span>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-amber-900">Prioritas perbaikan — nilai terendah</div>
                                    <p className="mt-0.5 text-sm text-amber-800">{lowest.text}</p>
                                    <p className="mt-1 text-xs font-medium text-amber-700">NRR {formatNumber(lowest.nrr)} · Indeks {formatNumber(lowest.ikm)} · Grade {lowest.grade}</p>
                                </div>
                            </div>
                        )}

                        {(conclusion || recommendation) && (
                            <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {conclusion && (
                                    <Card className="border-l-4 shadow-sm" style={{ borderLeftColor: GROUP_COLOR.A }}>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Kesimpulan</CardTitle></CardHeader>
                                        <CardContent><p className="text-sm leading-relaxed text-gray-600">{conclusion}</p></CardContent>
                                    </Card>
                                )}
                                {recommendation && (
                                    <Card className="border-l-4 shadow-sm" style={{ borderLeftColor: '#d97706' }}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /><CardTitle className="text-sm font-bold">Rekomendasi</CardTitle></div>
                                        </CardHeader>
                                        <CardContent><p className="text-sm leading-relaxed text-gray-600">{recommendation}</p></CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        <Card className="shadow-sm">
                            <CardHeader><CardTitle className="text-base font-bold">Komentar & Saran</CardTitle></CardHeader>
                            <CardContent>
                                {comments.length === 0 ? <p className="py-4 text-center text-sm text-gray-400">Tidak ada komentar.</p> : (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {comments.map((c) => (
                                            <div key={c.id} className="rounded-2xl border bg-gray-50/70 p-4">
                                                <div className="text-xs font-bold text-gray-800">{c.name || 'Anonim'} · {c.gender === 'L' ? 'Laki-laki' : 'Perempuan'} · {c.city}</div>
                                                <p className="mt-1.5 text-sm text-gray-600">{c.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </AdminShell>
        </>
    );
}

function SummaryCard({ title, value, color, sub }: { title: string; value: number; color: string; sub: string }) {
    return (
        <Card className="border-t-4 shadow-sm" style={{ borderTopColor: color }}>
            <CardContent className="pt-4">
                <div className="text-xs font-semibold text-gray-500">{title}</div>
                <div className="mt-1 text-3xl font-black tracking-tight" style={{ color }}>{formatNumber(value)}</div>
                <div className="mt-1 text-xs text-gray-400">{sub}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} /></div>
            </CardContent>
        </Card>
    );
}
