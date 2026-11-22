import { useState, type PointerEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Cpu, Layers, Radio, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TECHNOLOGY_DOMAINS, type TechnologyDomain } from '../data/cybernexData';
import { SmartImage } from './SmartImage';

interface TechnologySectionProps {
  onInteract?: () => void;
}

function DomainIcon({ id }: { id: string }) {
  switch (id) {
    case 'artificial-intelligence':
      return <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true" />;
    case 'neural-interfaces':
      return <Radio className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />;
    case 'robotic-engineering':
      return <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />;
    default:
      return <Shield className="h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true" />;
  }
}

function ConceptualDiagram({ domain }: { domain: TechnologyDomain }) {
  if (domain.imageUrl) {
    return (
      <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/90 sm:h-48">
        <SmartImage
          src={domain.imageUrl}
          alt={domain.imageAlt}
          fallbackTitle={domain.title}
          aspectClassName="h-full w-full"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080C17]/80 via-transparent to-transparent opacity-70"
        />
      </div>
    );
  }

  const isAI = domain.id === 'artificial-intelligence';

  return (
    <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-[#091225] to-[#130D28] dark:border-slate-800/90 sm:h-48">
      <div className="cyber-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <svg
        viewBox="0 0 320 160"
        className="relative z-10 h-32 w-full max-w-[260px] transition-transform duration-500 group-hover:scale-[1.03] sm:h-36 sm:max-w-[280px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-${domain.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isAI ? '#38BDF8' : '#60A5FA'} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {isAI ? (
          <g fill="none" stroke={`url(#grad-${domain.id})`} strokeWidth="1.25">
            <circle cx="160" cy="80" r="46" strokeOpacity="0.3" strokeDasharray="4 4" />
            <circle cx="160" cy="80" r="24" strokeOpacity="0.65" />
            <path d="M52 40 L136 80 L52 120" strokeOpacity="0.45" />
            <path d="M268 40 L184 80 L268 120" strokeOpacity="0.45" />
            <path d="M100 26 L160 56 L220 26" strokeOpacity="0.4" />
            <path d="M100 134 L160 104 L220 134" strokeOpacity="0.4" />
            <circle cx="52" cy="40" r="3.5" fill="#38BDF8" />
            <circle cx="52" cy="120" r="3.5" fill="#8B5CF6" />
            <circle cx="268" cy="40" r="3.5" fill="#38BDF8" />
            <circle cx="268" cy="120" r="3.5" fill="#8B5CF6" />
            <circle cx="160" cy="80" r="5" fill="#E0F2FE" />
          </g>
        ) : (
          <g fill="none" stroke={`url(#grad-${domain.id})`} strokeWidth="1.25">
            <ellipse cx="160" cy="80" rx="88" ry="42" strokeOpacity="0.28" />
            <ellipse cx="160" cy="80" rx="56" ry="28" strokeOpacity="0.55" />
            <path d="M72 80 L248 80" strokeOpacity="0.35" strokeDasharray="3 5" />
            <path d="M160 22 L160 138" strokeOpacity="0.35" strokeDasharray="3 5" />
            <polygon points="160,46 192,80 160,114 128,80" strokeOpacity="0.85" />
            <circle cx="160" cy="46" r="3.5" fill="#22D3EE" />
            <circle cx="192" cy="80" r="3.5" fill="#8B5CF6" />
            <circle cx="160" cy="114" r="3.5" fill="#3B82F6" />
            <circle cx="128" cy="80" r="3.5" fill="#22D3EE" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function TechnologySection({ onInteract }: TechnologySectionProps) {
  const [selectedId, setSelectedId] = useState<string>(TECHNOLOGY_DOMAINS[0].id);

  const selectedDomain =
    TECHNOLOGY_DOMAINS.find((item) => item.id === selectedId) ?? TECHNOLOGY_DOMAINS[0];

  const handleCardPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    event.currentTarget.style.setProperty('--sx', `${x}px`);
    event.currentTarget.style.setProperty('--sy', `${y}px`);
  };

  return (
    <section id="technology" className="relative z-10 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:gap-6 sm:pb-10 lg:flex-row lg:items-end lg:justify-between dark:border-slate-800/80"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-blue-600 uppercase dark:text-cyan-300">
              Core Technology
            </p>
            <h2
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Four disciplines converging into one living architecture.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            Select any subsystem below to inspect how cognitive software, optical neural coupling, and precision robotics integrate around the human form.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2">
          {TECHNOLOGY_DOMAINS.map((domain, idx) => {
            const isSelected = domain.id === selectedDomain.id;

            return (
              <motion.button
                key={domain.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedId(domain.id);
                  onInteract?.();
                }}
                onPointerMove={handleCardPointerMove}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.992 }}
                viewport={{ once: true, amount: 'some' }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`group glass-surface glow-ring-hover relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer sm:p-7 ${
                  isSelected
                    ? 'border-blue-600/60 shadow-[0_14px_34px_-16px_rgba(37,99,235,0.3)] dark:border-cyan-400/60 dark:shadow-[0_0_36px_-12px_rgba(34,211,238,0.4)]'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800/90 dark:hover:border-slate-700'
                }`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(340px circle at var(--sx, 50%) var(--sy, 50%), rgba(56, 189, 248, 0.12), rgba(139, 92, 246, 0.05) 45%, transparent 72%)',
                  }}
                />

                <div className="relative z-10 w-full">
                  <ConceptualDiagram domain={domain} />

                  <div className="mt-5 flex items-center justify-between gap-4 sm:mt-6">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-blue-600 tabular-nums dark:text-cyan-300">
                        {domain.index}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span>{domain.category}</span>
                    </div>

                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-blue-500/40 bg-blue-50 dark:border-cyan-400/50 dark:bg-cyan-400/15'
                          : 'border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/70'
                      }`}
                    >
                      <DomainIcon id={domain.id} />
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                    {domain.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                    {domain.description}
                  </p>
                </div>

                <div className="relative z-10 mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs font-medium sm:mt-6 dark:border-slate-800/80">
                  <span
                    className={
                      isSelected
                        ? 'text-blue-700 dark:text-cyan-300'
                        : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }
                  >
                    {isSelected ? 'Active Blueprint Selected' : 'Inspect Architecture'}
                  </span>
                  <ArrowUpRight
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isSelected
                        ? 'text-blue-700 translate-x-0.5 -translate-y-0.5 dark:text-cyan-300'
                        : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-slate-500 dark:group-hover:text-cyan-300'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div
          className="glass-surface mt-6 overflow-hidden rounded-2xl border border-slate-200 p-5 sm:mt-8 sm:p-8 dark:border-slate-800/90"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDomain.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8"
            >
              <div className="lg:col-span-5">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-blue-600 tabular-nums dark:text-cyan-300">
                    {selectedDomain.index}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                    /
                  </span>
                  <span>{selectedDomain.architectureFocus}</span>
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
                  {selectedDomain.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-300">
                  {selectedDomain.tagline}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 sm:mt-4 dark:text-slate-400">
                  {selectedDomain.conceptNotes}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-slate-800/80">
                <p className="font-mono text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Architectural Design Principles
                </p>
                <ul className="mt-4 space-y-3 sm:space-y-3.5">
                  {selectedDomain.designPrinciples.map((principle) => (
                    <li
                      key={principle}
                      className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-200"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-300"
                        aria-hidden="true"
                      />
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
