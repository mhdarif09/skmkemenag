import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Database, LayoutDashboard, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
    { href: '/admin/importer', label: 'Impor Data', icon: Database },
];

/**
 * Shared admin layout: dark-green top bar with navigation and a link to the
 * public site. All admin pages (dashboard, laporan, importer) render inside.
 */
export function AdminShell({
    children,
    title,
    subtitle,
    actions,
}: {
    children: ReactNode;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}) {
    const page = usePage();
    const user = (page.props.auth?.user ?? { name: 'Pengguna' }) as { name: string };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 bg-kemenag-primary-dark text-white shadow-pop">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold ring-1 ring-white/25">
                            KA
                        </div>
                        <div className="hidden leading-tight sm:block">
                            <span className="block text-sm font-semibold">Panel Admin</span>
                            <span className="block text-[11px] text-white/70">SKM & Persepsi Anti Korupsi</span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-1 rounded-full bg-white/10 p-1">
                        {NAV.map((item) => {
                            const active =
                                item.href === '/admin' ? page.url === '/admin' : page.url.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                                        active
                                            ? 'bg-white font-semibold text-kemenag-primary-dark'
                                            : 'text-white/80 hover:bg-white/10 hover:text-white',
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto flex items-center gap-3 text-sm">
                        <Link href="/" className="hidden text-white/75 underline-offset-4 hover:text-white hover:underline md:inline">
                            Lihat Situs
                        </Link>
                        <span className="hidden items-center gap-2 md:inline-flex">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                                {user.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="text-white/85">{user.name}</span>
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/20 hover:text-white"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                </div>
                {children}
            </main>
        </div>
    );
}
