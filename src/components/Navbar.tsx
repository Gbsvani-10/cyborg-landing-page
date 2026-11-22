import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NAV_LINKS } from '../data/cybernexData';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLinkClick = (sectionId: string) => {
    setMobileOpen(false);
    onNavigate(sectionId);
  };

  const solidHeader = isScrolled || mobileOpen;

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-200 ${
        solidHeader
          ? 'border-b border-slate-200/90 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#05070D]/90'
          : 'border-b border-transparent bg-gradient-to-b from-[#05070D]/80 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
          className={`font-display text-lg font-semibold tracking-[0.18em] whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm ${
            solidHeader
              ? 'text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-cyan-300'
              : 'text-white hover:text-cyan-300'
          }`}
        >
          CYBERNEX
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_LINKS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm ${
                  solidHeader
                    ? isActive
                      ? 'text-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                    : isActive
                    ? 'text-white'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    aria-hidden="true"
                    className="absolute right-0 -bottom-0.5 left-0 h-px bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('contact')}
            className={`hidden md:inline-flex min-h-[40px] items-center justify-center rounded-lg border px-5 py-2 text-xs font-semibold tracking-wider uppercase whitespace-nowrap shrink-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer ${
              solidHeader
                ? 'border-blue-600/30 bg-blue-600 text-white hover:bg-blue-700 dark:border-cyan-400/40 dark:bg-blue-600/20 dark:text-cyan-100 dark:hover:border-cyan-300 dark:hover:bg-blue-500/30 dark:hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)]'
                : 'border-cyan-400/40 bg-blue-600/25 text-cyan-100 hover:border-cyan-300 hover:bg-blue-500/35'
            }`}
          >
            Connect
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:hidden cursor-pointer ${
              solidHeader
                ? 'border-slate-200 bg-slate-100/80 text-slate-800 hover:border-blue-500/40 dark:border-slate-800 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:border-cyan-400/50 dark:hover:text-white'
                : 'border-slate-700/80 bg-slate-950/65 text-slate-100 hover:border-cyan-400/50'
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden dark:border-slate-800/80 dark:bg-[#05070D]/95"
          >
            <nav
              aria-label="Mobile Navigation"
              className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-4 sm:px-6"
            >
              {NAV_LINKS.map((item, idx) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item.id);
                    }}
                    className={`flex min-h-[46px] items-center justify-between rounded-lg px-4 text-base font-medium transition-colors ${
                      isActive
                        ? 'border border-blue-500/30 bg-blue-50 text-blue-700 dark:border-cyan-400/30 dark:bg-blue-500/15 dark:text-cyan-200'
                        : 'border border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-xs text-slate-400 tabular-nums dark:text-slate-500">
                      0{idx + 1}
                    </span>
                  </a>
                );
              })}
              <button
                type="button"
                onClick={() => handleLinkClick('contact')}
                className="mt-2 flex min-h-[46px] w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-4 text-xs font-semibold tracking-wider text-white uppercase shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] transition-colors cursor-pointer"
              >
                Connect with CYBERNEX
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
