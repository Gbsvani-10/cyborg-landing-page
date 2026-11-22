import { useEffect, useState } from 'react';
import { ArrowUp, Bot, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface FloatingUtilityDockProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
}

export function FloatingUtilityDock({
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  assistantOpen,
  onToggleAssistant,
}: FloatingUtilityDockProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 sm:right-6">
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
            className="glass-surface inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 shadow-lg transition-colors hover:border-blue-500/50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700/90 dark:text-slate-200 dark:hover:border-cyan-400/60 dark:hover:text-cyan-200 cursor-pointer"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundEnabled}
        aria-label={soundEnabled ? 'Mute UI sound cues' : 'Enable subtle UI sound cues'}
        title={soundEnabled ? 'Sound cues: On' : 'Sound cues: Off'}
        className={`glass-surface inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer ${
          soundEnabled
            ? 'border-blue-500/50 text-blue-700 dark:border-cyan-400/50 dark:text-cyan-200'
            : 'border-slate-200 text-slate-600 hover:text-slate-900 dark:border-slate-700/90 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        className="glass-surface inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 shadow-lg transition-colors hover:border-blue-500/50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700/90 dark:text-slate-200 dark:hover:border-cyan-400/60 dark:hover:text-cyan-200 cursor-pointer"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        onClick={onToggleAssistant}
        aria-expanded={assistantOpen}
        aria-label={assistantOpen ? 'Close CYBERNEX Gemini Chat' : 'Open CYBERNEX Gemini Chat'}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-semibold tracking-wider uppercase whitespace-nowrap shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer ${
          assistantOpen
            ? 'border-blue-600 bg-blue-600 text-white dark:border-cyan-400/60 dark:bg-cyan-500/20 dark:text-cyan-100'
            : 'border-blue-500/40 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_24px_-6px_rgba(37,99,235,0.55)] hover:scale-[1.02]'
        }`}
      >
        <Bot className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Gemini Chat</span>
      </button>
    </div>
  );
}
