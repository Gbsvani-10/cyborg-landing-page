import { NAV_LINKS } from '../data/cybernexData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white/80 dark:border-slate-900 dark:bg-[#04060B]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 pb-20 sm:px-6 md:flex-row md:items-center md:justify-between md:py-10 lg:px-8">
        <div>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="font-display text-base font-semibold tracking-[0.18em] text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-cyan-300"
          >
            CYBERNEX
          </a>
          <p className="mt-1 text-xs text-slate-500">
            Beyond Human Intelligence
          </p>
        </div>

        <nav
          aria-label="Footer Navigation"
          className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs text-slate-600 sm:flex sm:flex-wrap sm:items-center sm:gap-6 dark:text-slate-400"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(link.id);
              }}
              className="inline-flex min-h-[36px] items-center whitespace-nowrap transition-colors hover:text-slate-950 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="border-t border-slate-200 pt-4 text-xs text-slate-500 md:border-t-0 md:pt-0 dark:border-slate-900/90">
          © {new Date().getFullYear()} CYBERNEX Concept. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
