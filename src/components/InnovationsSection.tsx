import { useEffect, useRef, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CONCEPT_STATISTICS,
  INNOVATION_IMAGE,
  INNOVATION_MODULES,
  type ConceptMetric,
} from '../data/cybernexData';
import { SmartImage } from './SmartImage';

interface InnovationsSectionProps {
  onInteract?: () => void;
}

function AnimatedStatValue({ metric }: { metric: ConceptMetric }) {
  const [displayValue, setDisplayValue] = useState(metric.target);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || hasAnimated) return;

    const node = ref.current;
    if (!node) return;

    let rafId = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setHasAnimated(true);

        const duration = 900;
        const start = performance.now();

        const step = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * metric.target);
          setDisplayValue(current);
          if (progress < 1) {
            rafId = window.requestAnimationFrame(step);
          }
        };

        rafId = window.requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [hasAnimated, metric.target]);

  return (
    <div
      ref={ref}
      className="font-display text-2xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-4xl dark:text-white"
    >
      {metric.prefix}
      {displayValue}
      <span className="text-blue-600 dark:text-cyan-300">{metric.suffix}</span>
    </div>
  );
}

export function InnovationsSection({ onInteract }: InnovationsSectionProps) {
  const [activeModuleId, setActiveModuleId] = useState<string>(
    INNOVATION_MODULES[0].id
  );

  const activeModule =
    INNOVATION_MODULES.find((m) => m.id === activeModuleId) ??
    INNOVATION_MODULES[0];

  return (
    <section
      id="innovations"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-32 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-blue-600 uppercase dark:text-cyan-300">
            Innovations & Roadmap
          </p>
          <h2
            className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] dark:text-white"
            style={{ textWrap: 'balance' }}
          >
            Conceptual milestones charting symbiotic evolution.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base dark:text-slate-400">
            Interactive system concepts and design targets illustrating how CYBERNEX unifies cognition, signal translation, and kinetic support.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4">
          {CONCEPT_STATISTICS.map((metric, idx) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 'some' }}
              transition={{
                duration: 0.45,
                delay: idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass-surface glow-ring-hover rounded-2xl border border-slate-200 p-4 sm:p-6 dark:border-slate-800/90"
            >
              <AnimatedStatValue metric={metric} />
              <p className="mt-1.5 font-display text-xs font-semibold tracking-wide text-slate-800 sm:mt-2 sm:text-sm dark:text-slate-200">
                {metric.label}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:mt-1.5 sm:text-xs dark:text-slate-400">
                {metric.context}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#05070D] lg:aspect-auto lg:h-full lg:min-h-[420px] dark:border-slate-800/90">
              <SmartImage
                src={INNOVATION_IMAGE}
                alt="Suspended futuristic titanium kinetic augmentation spine and neural core module"
                fallbackTitle="CYBERNEX Kinetic Spine Concept"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070D]/95 via-[#05070D]/25 to-transparent"
              />
              <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8">
                <div className="flex items-center gap-2 text-[11px] text-cyan-300 sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="font-mono tracking-wider uppercase">
                    Conceptual Hardware Showcase
                  </span>
                </div>
                <p className="mt-1 font-display text-lg font-semibold text-white sm:mt-1.5 sm:text-xl">
                  Modular Titanium Kinetic Core
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass-surface flex flex-col justify-between rounded-2xl border border-slate-200 p-5 sm:p-8 lg:col-span-5 dark:border-slate-800/90"
          >
            <div>
              <div
                role="tablist"
                aria-label="Innovation Architecture Layers"
                className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-100/90 p-1 sm:grid sm:grid-cols-3 dark:border-slate-800 dark:bg-[#060913]"
              >
                {INNOVATION_MODULES.map((mod) => {
                  const active = mod.id === activeModule.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setActiveModuleId(mod.id);
                        onInteract?.();
                      }}
                      className={`relative min-h-[42px] flex-1 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer sm:px-2.5 ${
                        active
                          ? 'text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="innovation-tab-pill"
                          transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-lg bg-blue-600 shadow-sm dark:border dark:border-cyan-400/40 dark:bg-gradient-to-r dark:from-blue-600/35 dark:to-violet-600/35"
                        />
                      )}
                      <span className="relative z-10">{mod.label}</span>
                    </button>
                  );
                })}
              </div>

              <div role="tabpanel" className="mt-6 min-h-[220px] sm:mt-7 sm:min-h-[250px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModule.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-blue-600 tabular-nums dark:text-cyan-300">
                        {activeModule.index}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span>{activeModule.subtitle}</span>
                    </div>

                    <h3 className="mt-2 font-display text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
                      {activeModule.title}
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-base dark:text-slate-300">
                      {activeModule.summary}
                    </p>

                    <ul className="mt-5 space-y-2.5 border-t border-slate-200 pt-4 sm:mt-6 sm:space-y-3 sm:pt-5 dark:border-slate-800/80">
                      {activeModule.highlights.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-300"
                            aria-hidden="true"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:mt-8 dark:border-slate-800/80">
              All parameters shown reflect conceptual design specifications for the CYBERNEX exploration framework.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
