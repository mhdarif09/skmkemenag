import { Link } from '@inertiajs/react';
import { Check, ShieldCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';

export function BrandLogo({ logoPath, size = 'md' }: { logoPath: string | null; size?: 'sm' | 'md' | 'lg' }) {
    const box = size === 'lg' ? 'h-14 w-14 text-xl' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm';

    return logoPath ? (
        <img
            src={logoPath}
            alt="Logo"
            className={`${box} shrink-0 rounded-xl bg-white object-contain p-1 shadow-soft`}
        />
    ) : (
        <div className={`${box} flex shrink-0 items-center justify-center rounded-xl bg-white/15 font-bold text-white ring-1 ring-white/30`}>
            KA
        </div>
    );
}

/**
 * Shared public layout: brand header with a green gradient, a layman-friendly
 * trust bar, and a dark-green footer.
 */
export function PublicShell({
    children,
    logoPath,
    organizationName,
    compact = false,
}: {
    children: ReactNode;
    logoPath: string | null;
    organizationName: string;
    /** Compact hides the footer and trust bar (e.g. inside the wizard). */
    compact?: boolean;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="hero-brand relative overflow-hidden text-white">
                <div className="relative mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
                    <LogoLink logoPath={logoPath} />
                    <div className="min-w-0">
                        <div className="text-[11px] font-medium tracking-wide text-white/80 uppercase">
                            Kementerian Agama Republik Indonesia
                        </div>
                        <div className="truncate text-sm font-semibold sm:text-base">
                            {organizationName}
                        </div>
                    </div>
                </div>
                {!compact && (
                    <div className="relative border-t border-white/15 bg-black/10">
                        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6 py-2 text-xs text-white/85">
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Layanan resmi &amp; gratis
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5" />
                                Hanya butuh 2 menit
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                Data dijaga kerahasiaannya
                            </span>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            {!compact && (
                <footer className="bg-kemenag-primary-dark text-white/85">
                    <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left">
                        <div className="text-sm font-semibold text-white">{organizationName}</div>
                        <div className="text-xs">Ikhlas Beramal · Melayani Sepenuh Hati</div>
                    </div>
                </footer>
            )}
        </div>
    );
}

function LogoLink({ logoPath }: { logoPath: string | null }) {
    return (
        <Link href="/" aria-label="Beranda">
            <BrandLogo logoPath={logoPath} size="lg" />
        </Link>
    );
}

