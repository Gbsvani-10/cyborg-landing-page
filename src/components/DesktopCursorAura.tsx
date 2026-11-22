import { useEffect, useRef, useState } from 'react';

export function DesktopCursorAura() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    let rafId = 0;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isInteractive = false;
    let isVisible = false;

    const update = () => {
      currentX += (targetX - currentX) * 0.24;
      currentY += (targetY - currentY) * 0.24;

      const node = ringRef.current;
      if (node) {
        const scale = isInteractive ? 1.55 : 1;
        node.style.opacity = isVisible ? '1' : '0';
        node.style.transform = `translate3d(${currentX - 16}px, ${currentY - 16}px, 0) scale(${scale})`;
      }

      if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
        rafId = window.requestAnimationFrame(update);
      } else {
        rafId = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      isVisible = true;

      const el = event.target as HTMLElement | null;
      isInteractive = Boolean(
        el?.closest('button, a, input, textarea, [role="slider"], [role="tab"]')
      );

      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    const handlePointerLeave = () => {
      isVisible = false;
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[70] h-8 w-8 rounded-full border border-blue-500/45 opacity-0 transition-[opacity,border-color] duration-150 dark:border-cyan-300/45"
      style={{ willChange: 'transform, opacity' }}
    />
  );
}
