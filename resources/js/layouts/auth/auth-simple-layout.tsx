import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
            {/* soft brand wash */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-kemenag-primary/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-kemenag-accent/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-sm font-bold text-white shadow-soft">
                                KA
                            </div>
                            <span className="text-center text-sm font-semibold tracking-wide text-kemenag-primary-dark uppercase">
                                Kementerian Agama Kota Palembang
                            </span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-bold">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
