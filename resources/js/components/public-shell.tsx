import { Link } from '@inertiajs/react';
import { Check, ShieldCheck, Timer, Users } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Official Kemenag seal + BerAKHLAK slogan lockup.
 * logoPath (uploaded logo) wins; falls back to the bundled public asset.
 */
export function LogoLockup({ logoPath, dark = false }: { logoPath: string | null; dark?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <img
                src={logoPath ?? '/logo.png'}
                alt="Logo Kementerian Agama RI"
                className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain sm:h-12 sm:w-12"
            />
            {!dark && (
                <span aria-hidden className="mx-0.5 hidden h-8 w-px bg-border sm:block" />
            )}
            <img
                src="/Logo_BerAKHLAK.png"
                alt="Logo BerAKHLAK — Nilai-Nilai Dasar ASN"
                className={`hidden h-8 w-auto object-contain sm:block ${dark ? 'rounded-xl bg-white p-1.5' : ''}`}
            />
        </div>
    );
}

/**
 * Shared public layout: white header with official logos, a slim green trust
 * strip, and a dark-green footer — white & dark-green theme.
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
    /** Compact hides footer and static sections (used inside the wizard). */
    compact?: boolean;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
                    <Link href="/" aria-label="Kembali ke beranda" className="flex items-center gap-3">
                        <LogoLockup logoPath={logoPath} />
                        <span className="min-w-0 leading-tight">
                            <span className="block text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
                                Kementerian Agama
                            </span>
                            <span className="block truncate text-sm font-bold text-foreground sm:text-base">
                                {organizationName}
                            </span>
                        </span>
                    </Link>
                    <span className="hidden rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-secondary-foreground md:inline">
                        Survei Resmi & Gratis
                    </span>
                </div>
            </header>

            {!compact && (
                <div className="bg-kemenag-primary-dark text-white">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-6 py-2 text-[11px] text-white/85 sm:justify-start sm:text-xs">
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Resmi & gratis
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Timer className="h-3.5 w-3.5" />
                            Hanya 2 menit
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            Data dijamin rahasia
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" />
                            Isi lewat HP apa pun
                        </span>
                    </div>
                </div>
            )}

            <main className="flex-1">{children}</main>

            {!compact && (
                <footer className="bg-kemenag-primary-dark text-white">
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
                        <LogoLockup logoPath={logoPath} dark />
                        <div className="text-sm">
                            <div className="font-bold text-white">Ikhlas Beramal · Melayani Sepenuh Hati</div>
                            <div className="mt-1 text-xs text-white/70">
                                © {new Date().getFullYear()} {organizationName}
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
