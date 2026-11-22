import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: 'cyan' | 'blue' | 'violet';
}

export function AmbientBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let pointerRafId = 0;
    let pendingX = 0;
    let pendingY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (!glowRef.current || prefersReducedMotion) return;
      pendingX = event.clientX;
      pendingY = event.clientY;
      if (!pointerRafId) {
        pointerRafId = window.requestAnimationFrame(() => {
          glowRef.current?.style.setProperty('--mx', `${pendingX}px`);
          glowRef.current?.style.setProperty('--my', `${pendingY}px`);
          pointerRafId = 0;
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) {
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        if (pointerRafId) window.cancelAnimationFrame(pointerRafId);
      };
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        if (pointerRafId) window.cancelAnimationFrame(pointerRafId);
      };
    }

    let animationFrameId = 0;
    let isPageVisible = !document.hidden;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const particleCount = width < 768 ? 20 : 40;
    const hues: Array<'cyan' | 'blue' | 'violet'> = ['cyan', 'blue', 'violet'];
    const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.4 + 0.7,
      alpha: Math.random() * 0.35 + 0.15,
      hue: hues[i % hues.length],
    }));

    const colorForHue = (hue: Particle['hue'], alpha: number, isDark: boolean) => {
      const scaled = isDark ? alpha : alpha * 0.7;
      if (hue === 'cyan') return `rgba(34, 211, 238, ${scaled})`;
      if (hue === 'violet') return `rgba(139, 92, 246, ${scaled})`;
      return `rgba(59, 130, 246, ${scaled})`;
    };

    const drawFrame = () => {
      const isDark = document.documentElement.classList.contains('dark');
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorForHue(p.hue, p.alpha, isDark);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 16900) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${(1 - dist / 130) * 0.08})`
              : `rgba(37, 99, 235, ${(1 - dist / 130) * 0.06})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion && isPageVisible) {
        animationFrameId = window.requestAnimationFrame(drawFrame);
      }
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && !prefersReducedMotion) {
        if (!animationFrameId) {
          animationFrameId = window.requestAnimationFrame(drawFrame);
        }
      } else if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    drawFrame();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      if (pointerRafId) window.cancelAnimationFrame(pointerRafId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="cyber-grid-bg absolute inset-0 opacity-55 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      <div
        ref={glowRef}
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(540px circle at var(--mx, 50%) var(--my, 28%), rgba(56, 189, 248, 0.08), rgba(139, 92, 246, 0.04) 42%, transparent 72%)',
        }}
      />

      <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-blue-600/8 blur-[140px] dark:bg-blue-600/10" />
      <div className="absolute top-1/3 -right-32 h-[440px] w-[440px] rounded-full bg-violet-600/8 blur-[140px] dark:bg-violet-600/10" />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />
    </div>
  );
}
