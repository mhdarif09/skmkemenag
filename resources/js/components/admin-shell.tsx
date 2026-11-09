import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Building2, Database, ExternalLink, LayoutDashboard, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/laporan', label: 'Laporan IKM', icon: BarChart3 },
    { href: '/admin/importer', label: 'Impor Data', icon: Database },
    { href: '/admin/units', label: 'Unit Layanan', icon: Building2 },
];

/**
 * Shared admin layout: dark-green collapsible sidebar (drawer on mobile) +
 * a slim white top bar. Theme: putih + hijau tua.
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
        <SidebarProvider>
            <Sidebar collapsible="icon">
                    <SidebarHeader className="px-3 pt-4">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild tooltip="Panel Admin SKM">
                                    <Link href="/admin">
                                        <img
                                            src="/logo.png"
                                            alt="Logo Kemenag"
                                            className="flex aspect-square h-9 w-9 shrink-0 rounded-xl bg-white object-contain p-0.5"
                                        />
                                        <div className="grid flex-1 text-left leading-tight">
                                            <span className="truncate text-sm font-bold">Panel Admin SKM</span>
                                            <span className="truncate text-[11px] text-white/60">Kemenag Kota Palembang</span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                    <SidebarContent className="px-3">
                        <div className="mb-1 px-2 pt-2 pb-1 text-[10px] font-bold tracking-[0.14em] text-white/40 uppercase">
                            Menu Utama
                        </div>
                        <SidebarMenu>
                            {NAV.map((item) => {
                                const active =
                                    item.href === '/admin' ? page.url === '/admin' : page.url.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.label}
                                            className="rounded-xl data-[active=true]:bg-white data-[active=true]:text-kemenag-primary-dark data-[active=true]:shadow-sm hover:bg-white/10 hover:text-white"
                                        >
                                            <Link href={item.href}>
                                                <Icon className="h-4.5 w-4.5" />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="px-3 pb-4">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip="Lihat situs publik"
                                    className="rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                    <Link href="/">
                                        <ExternalLink className="h-4.5 w-4.5" />
                                        <span>Lihat Situs</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip="Keluar"
                                    className="rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-200"
                                >
                                    <Link href="/logout" method="post" as="button">
                                        <LogOut className="h-4.5 w-4.5" />
                                        <span>Keluar</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <div className="mt-3 hidden items-center gap-2 rounded-xl bg-white/5 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5 md:flex">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                                {user.name.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                                <div className="truncate text-xs font-semibold text-white">{user.name}</div>
                                <div className="truncate text-[10px] text-white/50">Administrator</div>
                            </div>
                        </div>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>

                <SidebarInset className="bg-[#F6F9F6]">
                    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
                        <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5">
                            <SidebarTrigger className="shrink-0" />
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg">{title}</h1>
                                {subtitle && <p className="truncate text-xs text-muted-foreground sm:text-[13px]">{subtitle}</p>}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="hidden items-center gap-2 rounded-full border bg-white py-1 pr-3 pl-1 sm:inline-flex">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-kemenag-primary-dark text-[11px] font-bold text-white">
                                        {user.name.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="max-w-[130px] truncate text-[13px] font-medium">{user.name}</span>
                                </span>
                                {actions}
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-4 sm:px-5 sm:py-6">{children}</main>
                </SidebarInset>
        </SidebarProvider>
    );
}
