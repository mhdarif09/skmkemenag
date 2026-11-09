import { useEffect, useRef } from 'react';

/**
 * Branded celebratory burst for the thank-you page.
 *
 * Deliberately not a stock confetti library: particles are drawn as small
 * pentagons (echoing the Kemenag seal), discs and short ribbons in the
 * institution's palette. Runs one elegant burst plus a brief gentle drizzle,
 * then stops — everything on a single canvas, no dependencies.
 */

const COLORS = ['#1B7F3B', '#2E9E54', '#0F5A28', '#F2B705', '#E6F4EA'] as const;

type Shape = 'pentagon' | 'disc' | 'ribbon';

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    size: number;
    color: (typeof COLORS)[number];
    shape: Shape;
    opacity: number;
    sway: number;
    swayPhase: number;
};

const DURATION_MS = 3400;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function spawnBurst(originX: number, originY: number, count: number): Particle[] {
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
        // Fan upward in a wide cone
        const angle = rand(-Math.PI * (11 / 12), -Math.PI / 12);
        const speed = rand(6.5, 14.5);
        const shapes: Shape[] = ['pentagon', 'pentagon', 'disc', 'ribbon'];

        particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rot: rand(0, Math.PI * 2),
            vr: rand(-0.22, 0.22),
            size: rand(6, 13),
            color: COLORS[i % COLORS.length],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            opacity: 1,
            sway: rand(0.6, 1.4),
            swayPhase: rand(0, Math.PI * 2),
        });
    }

    return particles;
}

function spawnDrizzle(width: number, count: number): Particle[] {
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
        const shapes: Shape[] = ['pentagon', 'disc'];

        particles.push({
            x: rand(0, width),
            y: rand(-40, -10),
            vx: rand(-0.4, 0.4),
            vy: rand(0.6, 1.6),
            rot: rand(0, Math.PI * 2),
            vr: rand(-0.12, 0.12),
            size: rand(5, 9),
            color: COLORS[i % COLORS.length],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            opacity: 0,
            sway: rand(0.5, 1.2),
            swayPhase: rand(0, Math.PI * 2),
        });
    }

    return particles;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.fillStyle = p.color;

    if (p.shape === 'disc') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
        ctx.fill();
    } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.size, -p.size * 0.22, p.size * 2, p.size * 0.44);
    } else {
        // Pentagon — the Kemenag seal silhouette
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = Math.cos(a) * p.size * 0.55;
            const y = Math.sin(a) * p.size * 0.55;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

export function CelebrationBurst({ anchorId }: { anchorId: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const canvas = ref.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const size = canvas.getBoundingClientRect();
        canvas.width = size.width * dpr;
        canvas.height = size.height * dpr;
        ctx.scale(dpr, dpr);

        const anchor = document.getElementById(anchorId);
        const box = anchor?.getBoundingClientRect();
        const originX = box ? box.left - size.left + box.width / 2 : size.width / 2;
        const originY = box ? box.top - size.top + box.height / 2 : size.height * 0.3;

        const particles: Particle[] = [
            ...spawnBurst(originX, originY, 90),
            ...spawnDrizzle(size.width, 22),
        ];

        let raf = 0;
        let prev = performance.now();
        const start = prev;

        const tick = (now: number) => {
            const dt = Math.min(50, now - prev) / 16.67;
            prev = now;
            const age = now - start;

            ctx.clearRect(0, 0, size.width, size.height);

            for (const p of particles) {
                // Ambient sway gives falling pieces their float
                p.swayPhase += 0.06 * p.sway * dt;
                p.x += (p.vx + Math.sin(p.swayPhase) * 0.5 * p.sway) * dt;
                p.y += p.vy * dt;
                p.vy += 0.115 * dt; // gravity
                p.vx *= Math.pow(0.985, dt);
                p.rot += p.vr * dt;

                // Drizzle pieces fade in as they enter from the top
                if (p.opacity < 1) {
                    p.opacity = Math.min(1, p.opacity + 0.04 * dt);
                }

                // Unified fade-out near the end of the show
                const tail = DURATION_MS - 900;
                if (age > tail) {
                    p.opacity = Math.max(0, p.opacity - (age - tail) / 700);
                }

                drawParticle(ctx, p);
            }

            if (age < DURATION_MS && particles.some((p) => p.opacity > 0)) {
                raf = requestAnimationFrame(tick);
            } else {
                ctx.clearRect(0, 0, size.width, size.height);
            }
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [anchorId]);

    return (
        <canvas
            ref={ref}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        />
    );
}
