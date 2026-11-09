import { Link } from '@inertiajs/react';
import { BarChart3, Database, LayoutDashboard } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Laporan IKM',
        href: '/admin/laporan',
        icon: BarChart3,
    },
    {
        title: 'Impor Data',
        href: '/admin/importer',
        icon: Database,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg gradient-brand text-[10px] font-bold text-white shadow-soft">
                                    KA
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                                    <span className="mb-0.5 truncate font-semibold">Panel Admin SKM</span>
                                    <span className="truncate text-[11px] text-muted-foreground">
                                        Kemenag Kota Palembang
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
