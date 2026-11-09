import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Unit = {
    id: number;
    name: string;
    description: string | null;
    responses_count: number;
};

type Flash = { success?: string; error?: string };

export default function UnitsPage({ units }: { units: Unit[] }) {
    const page = usePage();
    const flash = (page.props as unknown as { flash?: Flash }).flash;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Unit | null>(null);

    const form = useForm({ name: '', description: '' });

    const openAdd = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEdit = (unit: Unit) => {
        setEditing(unit);
        form.setData({ name: unit.name, description: unit.description ?? '' });
        form.clearErrors();
        setDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`/admin/units/${editing.id}`, { onSuccess: () => setDialogOpen(false) });
        } else {
            form.post('/admin/units', { onSuccess: () => setDialogOpen(false) });
        }
    };

    const remove = (unit: Unit) => {
        if (window.confirm(`Hapus unit "${unit.name}"?\n\nUnit yang sudah punya data survei tidak akan terhapus.`)) {
            form.transform(() => ({}));
            form.delete(`/admin/units/${unit.id}`);
        }
    };

    return (
        <>
            <Head title="Unit Layanan" />
            <AdminShell
                title="Unit Layanan"
                subtitle="Kelola daftar unit — ditambahkan langsung ke form survei & filter laporan"
                actions={
                    <Button onClick={openAdd} className="rounded-xl bg-kemenag-primary-dark">
                        <Plus className="h-4 w-4" /> Tambah Unit
                    </Button>
                }
            >
                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                        {flash.error}
                    </div>
                )}

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Daftar Unit ({units.length})</CardTitle>
                        <CardDescription>Nama unit harus sama persis dengan yang ada di file impor agar terdeteksi otomatis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {units.map((unit) => (
                                <div key={unit.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3 sm:p-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                        <Building2 className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-bold text-gray-900">{unit.name}</div>
                                        <div className="truncate text-xs text-gray-400">
                                            {unit.description?.trim() ? unit.description : 'Tanpa keterangan'} · {unit.responses_count} responden
                                        </div>
                                    </div>
                                    <span className="hidden shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500 sm:inline">
                                        {unit.responses_count} survei
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(unit)} aria-label="Ubah" className="shrink-0 rounded-xl">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => remove(unit)} aria-label="Hapus" className="shrink-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {units.length === 0 && (
                                <p className="py-10 text-center text-sm text-gray-400">Belum ada unit. Klik "Tambah Unit" untuk memulai.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Ubah Unit' : 'Tambah Unit Baru'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="unit-name">Nama Unit *</Label>
                                <Input
                                    id="unit-name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Contoh: Seksi Pendidikan Madrasah"
                                    className="mt-1.5"
                                />
                                {form.errors.name && <p className="mt-1 text-xs font-medium text-red-600">{form.errors.name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="unit-desc">Keterangan (opsional)</Label>
                                <Textarea
                                    id="unit-desc"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Contoh: PPID, TU Umum, Kepegawaian, Keuangan, Protokol"
                                    className="mt-1.5"
                                    rows={2}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                                    Batal
                                </Button>
                                <Button type="submit" disabled={form.processing} className="rounded-xl bg-kemenag-primary-dark">
                                    {form.processing ? 'Menyimpan...' : editing ? 'Simpan' : 'Tambah'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </AdminShell>
        </>
    );
}
