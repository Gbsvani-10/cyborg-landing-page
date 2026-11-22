import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, History, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  EVOLUTION_MILESTONES,
  TIMELINE_CATEGORIES,
  type TimelineCategory,
} from '../data/experiencesData';

interface EvolutionTimelineSectionProps {
  onInteract?: () => void;
}

export function EvolutionTimelineSection({
  onInteract,
}: EvolutionTimelineSectionProps) {
  const [category, setCategory] = useState<TimelineCategory>('all');
  const filtered =
    category === 'all'
      ? EVOLUTION_MILESTONES
      : EVOLUTION_MILESTONES.filter((m) => m.category === category);

  const [selectedId, setSelectedId] = useState<string>(
    EVOLUTION_MILESTONES[0].id
  );

  useEffect(() => {
    if (!filtered.some((m) => m.id === selectedId) && filtered[0]) {
      setSelectedId(filtered[0].id);
    }
  }, [category, filtered, selectedId]);

  const currentIdx = Math.max(
    0,
    filtered.findIndex((m) => m.id === selectedId)
  );
  const activeMilestone = filtered[currentIdx] ?? filtered[0];

  const handleStep = (delta: number) => {
    const nextIdx = Math.min(
      filtered.length - 1,
      Math.max(0, currentIdx + delta)
    );
    if (filtered[nextIdx]) {
      setSelectedId(filtered[nextIdx].id);
      onInteract?.();
    }
  };

  return (
    <section
      id="timeline"
      aria-labelledby="timeline-heading"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-28 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between dark:border-slate-800/80"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-violet-700 uppercase dark:text-cyan-300">
              Evolution Timeline
            </p>
            <h2
              id="timeline-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Historical milestones shaping robotics, AI, and prosthetics.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Trace seven decades of real scientific breakthroughs—from the 1950 Turing Test and 1961 Unimate arm to BrainGate neuroprosthetics and modern transformer architectures.
            </p>
          </div>

          {/* Category Filters */}
          <div
            role="tablist"
            aria-label="Filter evolution milestones by discipline"
            className="flex flex-wrap gap-1.5 self-start rounded-xl border border-slate-200 bg-white/80 p-1 lg:self-end dark:border-slate-800 dark:bg-[#060913]"
          >
            {TIMELINE_CATEGORIES.map((cat) => {
              const active = cat.id === category;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setCategory(cat.id);
                    onInteract?.();
                  }}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm dark:border dark:border-cyan-400/40 dark:bg-gradient-to-r dark:from-blue-600/35 dark:to-violet-600/35 dark:text-cyan-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Horizontal Era Rail */}
        <div className="mt-8 glass-surface rounded-2xl border border-slate-200 p-4 sm:p-6 dark:border-slate-800/90">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800/80">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-500 uppercase">
              <History className="h-4 w-4 text-blue-600 dark:text-cyan-300" aria-hidden="true" />
              <span>
                Milestone {currentIdx + 1} of {filtered.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                disabled={currentIdx <= 0}
                aria-label="Previous milestone"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:border-blue-500/50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                disabled={currentIdx >= filtered.length - 1}
                aria-label="Next milestone"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:border-blue-500/50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Scrollable Chronological Rail */}
          <div
            role="list"
            aria-label="Chronological timeline nodes"
            className="mt-5 flex gap-2.5 overflow-x-auto pb-3"
          >
            {filtered.map((item) => {
              const selected = item.id === activeMilestone?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  aria-current={selected ? 'step' : undefined}
                  onClick={() => {
                    setSelectedId(item.id);
                    onInteract?.();
                  }}
                  className={`flex min-h-[76px] min-w-[148px] shrink-0 flex-col justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    selected
                      ? 'border-blue-600/60 bg-blue-50/80 shadow-sm dark:border-cyan-400/60 dark:bg-[#0B1224]'
                      : 'border-slate-200 bg-white/60 hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#060B17]/80 dark:hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      selected
                        ? 'text-blue-700 dark:text-cyan-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.year}
                  </span>
                  <span className="mt-1.5 line-clamp-2 font-display text-xs font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Milestone Detail Stage */}
          {activeMilestone && (
            <div className="mt-5 border-t border-slate-200 pt-6 dark:border-slate-800/80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMilestone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                >
                  <div className="lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-blue-600 tabular-nums dark:text-cyan-300">
                        {activeMilestone.year}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeMilestone.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeMilestone.pioneers}</span>
                    </div>

                    <h3 className="mt-2.5 font-display text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-white">
                      {activeMilestone.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                      {activeMilestone.summary}
                    </p>
                  </div>

                  <div className="space-y-3.5 lg:col-span-5">
                    <div className="rounded-xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-800 dark:bg-[#060B17]/85">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                        <Layers
                          className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-300"
                          aria-hidden="true"
                        />
                        <span>Core Breakthrough</span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {activeMilestone.breakthrough}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-800 dark:bg-[#060B17]/85">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                        <Clock
                          className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300"
                          aria-hidden="true"
                        />
                        <span>Why It Matters</span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {activeMilestone.significance}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
