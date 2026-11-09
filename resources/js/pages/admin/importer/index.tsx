import { Head } from '@inertiajs/react';
import { Download, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { commit as commitRoute, preview as previewRoute } from '@/routes/admin/importer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MappingColumns = {
    timestamp: number | null;
    name: number | null;
    gender: number | null;
    city: number | null;
    occupation: number | null;
    unit: number | null;
    need: number | null;
    comment: number | null;
};

type Problem = {
    message: string;
    suggestion: string;
};

type ScoreEntry = {
    question_id: number;
    text: string;
    raw: string;
    score: number | null;
};

type PreviewRow = {
    row_number: number;
    timestamp: string | null;
    timestamp_raw: string;
    name: string | null;
    gender: string | null;
    gender_raw: string;
    city: string;
    occupation_raw: string;
    unit_raw: string;
    unit: string | null;
    unit_id: number | null;
    need: string;
    comment: string;
    scores: ScoreEntry[];
    status: 'ok' | 'warning' | 'error' | 'duplicate';
    duplicate: boolean;
    problems: Problem[];
};

type PreviewSummary = {
    total: number;
    ok: number;
    warning: number;
    error: number;
    duplicate: number;
};

type Preview = {
    columns: MappingColumns | null;
    unmapped: { index: number; header: string }[];
    rows: PreviewRow[];
    summary: PreviewSummary;
};

const STATUS_LABEL: Record<PreviewRow['status'], string> = {
    ok: 'Siap',
    warning: 'Peringatan',
    error: 'Error',
    duplicate: 'Duplikat',
};

const STATUS_CLASS: Record<PreviewRow['status'], string> = {
    ok: 'bg-primary text-primary-foreground',
    warning: 'bg-grade-c text-white',
    error: 'bg-destructive text-white',
    duplicate: 'bg-muted text-muted-foreground',
};

function readXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export default function ImporterPage({ periods }: { periods: { id: number; name: string; is_active: boolean }[] }) {
    const [fileName, setFileName] = useState('');
    const [periodId, setPeriodId] = useState('');
    const [preview, setPreview] = useState<Preview | null>(null);
    const [busy, setBusy] = useState<'preview' | 'commit' | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const readFile = (): File | null => {
        const files = fileInputRef.current?.files;

        return files && files.length > 0 ? files[0] : null;
    };

    const post = async (url: string, body: FormData): Promise<Response> =>
        fetch(url, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': readXsrfToken(),
                Accept: 'application/json',
            },
            body,
        });

    const runPreview = async () => {
        setError(null);
        setFeedback(null);
        setPreview(null);

        const file = readFile();
        if (!file) {
            setError('Pilih file CSV/XLSX terlebih dahulu.');

            return;
        }

        setBusy('preview');
        try {
            const body = new FormData();
            body.append('file', file);

            const response = await post(previewRoute.url(), body);
            if (!response.ok) {
                setError('Gagal membaca file. Pastikan format CSV atau XLSX dari Google Form.');

                return;
            }

            setPreview((await response.json()) as Preview);
        } finally {
            setBusy(null);
        }
    };

    const runCommit = async () => {
        setError(null);

        const file = readFile();
        if (!file || preview === null || periodId === '') {
            setError('Pilih file dan periode terlebih dahulu.');

            return;
        }

        setBusy('commit');
        try {
            const body = new FormData();
            body.append('file', file);
            body.append('period_id', periodId);

            const response = await post(commitRoute.url(), body);
            if (!response.ok) {
                setError('Gagal menyimpan data impor.');

                return;
            }

            const result = (await response.json()) as { inserted: number; skipped_duplicate: number; skipped_error: number };
            setFeedback(
                `Impor selesai: ${result.inserted} baris disimpan, ${result.skipped_duplicate} duplikat dilewati, ${result.skipped_error} baris bermasalah dilewati.`,
            );
            setPreview(null);
        } finally {
            setBusy(null);
        }
    };

    const columnLabel = (name: string, index: number | null): string =>
        index === null ? `${name}: tidak ditemukan` : `${name}: kolom ${index + 1}`;

    return (
        <>
            <Head title="Impor Data" />
            <AdminShell
                title="Impor Data Survei Lama"
                subtitle="Unggah hasil ekspor Google Form (CSV/XLSX), periksa pratinjau, lalu simpan ke database."
            >

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Langkah 1: Unggah dan Pratinjau</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-end gap-3">
                                <div>
                                    <label className="mb-1 block text-xs text-muted-foreground">File (CSV/XLSX)</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xlsx,text/csv"
                                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                    {fileName && <span className="ml-2 text-xs text-muted-foreground">{fileName}</span>}
                                </div>
                                <Button onClick={runPreview} disabled={busy !== null}>
                                    {busy === 'preview' ? (
                                        <>Memproses…</>
                                    ) : (
                                        <>
                                            <UploadCloud className="mr-1 h-4 w-4" />
                                            Tampilkan Pratinjau
                                        </>
                                    )}
                                </Button>
                                <Button asChild variant="outline" className="rounded-xl" disabled={busy !== null}>
                                    <a href="/admin/importer/template">
                                        <Download className="mr-1 h-4 w-4" />
                                        Unduh Template CSV
                                    </a>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Template berisi header standar + 1 baris contoh. Isi sesuai data, lalu unggah di sini.
                            </p>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </CardContent>
                    </Card>

                    {feedback && (
                        <div className="rounded border border-primary/30 bg-kemenag-primary-light p-3 text-sm text-kemenag-primary-dark">
                            {feedback}
                        </div>
                    )}

                    {preview && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Langkah 2: Ringkasan Pratinjau</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-3 sm:grid-cols-4">
                                        <div className="rounded border p-3">
                                            <div className="text-xs text-muted-foreground">Total Baris</div>
                                            <div className="text-2xl font-bold">{preview.summary.total}</div>
                                        </div>
                                        <div className="rounded border p-3">
                                            <div className="text-xs text-muted-foreground">Siap</div>
                                            <div className="text-2xl font-bold text-primary">{preview.summary.ok}</div>
                                        </div>
                                        <div className="rounded border p-3">
                                            <div className="text-xs text-muted-foreground">Peringatan</div>
                                            <div className="text-2xl font-bold text-grade-c">{preview.summary.warning}</div>
                                        </div>
                                        <div className="rounded border p-3">
                                            <div className="text-xs text-muted-foreground">Error / Duplikat</div>
                                            <div className="text-2xl font-bold text-destructive">
                                                {preview.summary.error} / {preview.summary.duplicate}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        Pemetaan kolom otomatis:{' '}
                                        {Object.entries(preview.columns ?? {}).map(([name, index]) =>
                                            typeof index === 'number' ? columnLabel(name, index) : null,
                                        )}
                                        {preview.unmapped.length > 0 && (
                                            <span>
                                              {" "}· kolom tidak dipetakan:{' '}
                                                {preview.unmapped.map((u) => u.header).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Langkah 3: Simpan ke Database</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap items-end gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-muted-foreground">Periode tujuan</label>
                                        <select
                                            value={periodId}
                                            onChange={(e) => setPeriodId(e.target.value)}
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Pilih periode</option>
                                            {periods.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                    {p.is_active ? ' (aktif)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button onClick={runCommit} disabled={busy !== null || periodId === ''}>
                                        {busy === 'commit' ? 'Menyimpan…' : 'Simpan (Lewati Duplikat & Error)'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Pratinjau Baris</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="w-14 pb-2 text-left">Baris</th>
                                                    <th className="w-24 pb-2 text-left">Status</th>
                                                    <th className="w-36 pb-2 text-left">Waktu</th>
                                                    <th className="pb-2 text-left">Nama · Unit · Kebutuhan</th>
                                                    <th className="pb-2 text-left">Skor</th>
                                                    <th className="pb-2 text-left">Masalah / Saran</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.rows.map((row) => (
                                                    <tr
                                                        key={row.row_number}
                                                        className={`border-t ${
                                                            row.status === 'error'
                                                                ? 'bg-destructive/10'
                                                                : row.status === 'warning'
                                                                    ? 'bg-grade-c/10'
                                                                    : row.status === 'duplicate'
                                                                        ? 'bg-muted/60'
                                                                        : ''
                                                        }`}
                                                    >
                                                        <td className="py-2">{row.row_number}</td>
                                                        <td className="py-2">
                                                            <span className={`rounded px-2 py-0.5 text-xs font-bold ${STATUS_CLASS[row.status]}`}>
                                                                {STATUS_LABEL[row.status]}
                                                            </span>
                                                        </td>
                                                        <td className="py-2">{row.timestamp ?? row.timestamp_raw ?? '-'}</td>
                                                        <td className="py-2">
                                                            <div>{row.name ?? '(anonim)'}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {row.unit === null ? `${row.unit_raw} → unit tidak dikenali` : row.unit} · {row.need}
                                                            </div>
                                                        </td>
                                                        <td className="py-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {row.scores.map((s, i) => (
                                                                    <span
                                                                        key={i}
                                                                        title={s.text}
                                                                        className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                                                                            s.score === null ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'
                                                                        }`}
                                                                    >
                                                                        {s.score ?? '?'}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-2">
                                                            {row.problems.length === 0 ? (
                                                                <span className="text-xs text-muted-foreground">—</span>
                                                            ) : (
                                                                <ul className="space-y-1 text-xs">
                                                                    {row.problems.map((p, i) => (
                                                                        <li key={i}>
                                                                            {p.message} <em className="text-muted-foreground">({p.suggestion})</em>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
            </AdminShell>
        </>
    );
}
