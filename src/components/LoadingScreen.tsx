import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export function LoadingScreen() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (prefersReducedMotion || !visible) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Initializing CYBERNEX interface"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05070D] px-6 text-slate-100"
        >
          <div className="cyber-grid-bg pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full max-w-xs flex-col items-center text-center"
          >
            <div className="relative flex h-16 w-16 items-center justify-center">
              <motion.span
                aria-hidden="true"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-cyan-400/25 border-t-cyan-300"
              />
              <span className="font-display text-sm font-semibold tracking-[0.2em] text-cyan-200">
                CX
              </span>
            </div>

            <p className="mt-5 font-display text-lg font-semibold tracking-[0.24em] text-white">
              CYBERNEX
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.16em] text-slate-400 uppercase">
              Beyond Human Intelligence
            </p>

            <div className="mt-6 h-[2px] w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: '0% 50%' }}
                className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-300 to-violet-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setVisible(false)}
              className="mt-6 min-h-[36px] rounded-md px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
            >
              Skip intro
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
