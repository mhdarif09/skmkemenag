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
 * Shared admin layout: clean white sticky header with Kemenag + BerAKHLAK
 * lockup, pill nav, and a user chip. Theme: putih + hijau tua.
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
        <div className="min-h-screen bg-[#F6F9F6] text-foreground">
            <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
                    <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
                        <img src="/logo.png" alt="Logo Kemenag" className="h-10 w-10 rounded-xl border bg-white object-contain p-0.5 sm:h-11 sm:w-11" />
                        <span className="hidden leading-tight sm:block">
                            <span className="block text-[10px] font-bold tracking-[0.14em] text-kemenag-primary uppercase">Panel Admin</span>
                            <span className="block max-w-[150px] truncate text-[13px] font-semibold text-foreground">
                                Kemenag Kota Palembang
                            </span>
                        </span>
                    </Link>

                    <nav className="mx-auto flex items-center gap-1 overflow-x-auto rounded-full bg-[#EEF5EF] p-1 sm:mx-0 sm:ml-4" aria-label="Navigasi admin">
                        {NAV.map((item) => {
                            const active = item.href === '/admin' ? page.url === '/admin' : page.url.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-all sm:px-4',
                                        active
                                            ? 'bg-kemenag-primary-dark text-white shadow-sm'
                                            : 'text-muted-foreground hover:bg-white hover:text-foreground',
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                        <Link href="/" className="hidden text-[13px] font-medium text-muted-foreground hover:text-kemenag-primary-dark md:inline">
                            Lihat Situs
                        </Link>
                        <span className="hidden items-center gap-2 rounded-full border bg-white py-1 pr-3 pl-1 md:inline-flex">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-kemenag-primary-dark text-[11px] font-bold text-white">
                                {user.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="max-w-[120px] truncate text-[13px] font-medium">{user.name}</span>
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6">
                <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{title}</h1>
                        {subtitle && <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                </div>
                {children}
            </main>
        </div>
    );
}
