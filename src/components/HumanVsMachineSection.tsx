import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import {
  HUMAN_COMPARE_IMAGE,
  HUMAN_VS_MACHINE_DIMENSIONS,
  MACHINE_COMPARE_IMAGE,
} from '../data/cybernexData';
import { SmartImage } from './SmartImage';

interface HumanVsMachineSectionProps {
  onInteract?: () => void;
}

const PRESETS = [
  { label: 'Human Focus', value: 82 },
  { label: 'Symbiosis', value: 50 },
  { label: 'Machine Focus', value: 18 },
] as const;

export function HumanVsMachineSection({ onInteract }: HumanVsMachineSectionProps) {
  const [splitPercent, setSplitPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const updateFromClientX = (clientX: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(4, Math.min(96, Math.round(raw)));
    setSplitPercent(clamped);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromClientX(event.clientX);
    onInteract?.();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromClientX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore if capture already released
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setSplitPercent((p) => Math.max(4, p - 4));
      onInteract?.();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setSplitPercent((p) => Math.min(96, p + 4));
      onInteract?.();
    }
  };

  return (
    <section
      id="comparison"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-32 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Quick Presets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between dark:border-slate-800/80"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-blue-600 uppercase dark:text-cyan-300">
              Comparative Intelligence
            </p>
            <h2
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Human intuition meets machine precision.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Drag the interactive divider or use the presets below to compare organic biological cognition against synthetic photonic processing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white/80 p-1 lg:self-end dark:border-slate-800 dark:bg-[#060913]">
            {PRESETS.map((preset) => {
              const active = Math.abs(splitPercent - preset.value) <= 3;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSplitPercent(preset.value);
                    onInteract?.();
                  }}
                  className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-600/35 dark:text-cyan-100 dark:border dark:border-cyan-400/40'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive Split Comparison Viewport */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-[#05070D] shadow-xl dark:border-slate-800/90"
        >
          <div
            ref={stageRef}
            role="slider"
            tabIndex={0}
            aria-label="Human versus Machine Intelligence comparison slider"
            aria-valuemin={4}
            aria-valuemax={96}
            aria-valuenow={splitPercent}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
            className="relative aspect-[16/10] w-full touch-none select-none overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9] cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {/* Base Right Layer: Machine Intelligence */}
            <div className="absolute inset-0">
              <SmartImage
                src={MACHINE_COMPARE_IMAGE}
                alt="Conceptual cybernetic machine intelligence with photonic neural circuit lattice"
                fallbackTitle="Machine Intelligence"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover object-center"
              />
            </div>

            {/* Clipped Left Layer: Human Intelligence */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
                transition: isDragging ? 'none' : 'clip-path 240ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <SmartImage
                src={HUMAN_COMPARE_IMAGE}
                alt="Conceptual biological human intelligence with organic neural pathways"
                fallbackTitle="Human Intelligence"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover object-center"
              />
            </div>

            {/* Subtle Top/Bottom Edge Scrims for Labels */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070D]/80 via-transparent to-[#05070D]/40"
            />

            {/* Corner Unboxed Labels */}
            <div className="pointer-events-none absolute top-4 left-4 z-10 sm:top-6 sm:left-6">
              <p className="font-mono text-[11px] tracking-[0.16em] text-amber-200/95 uppercase sm:text-xs">
                Human Intelligence
              </p>
              <p className="mt-0.5 text-xs text-slate-300 hidden sm:block">
                Biological intuition & consciousness
              </p>
            </div>

            <div className="pointer-events-none absolute top-4 right-4 z-10 text-right sm:top-6 sm:right-6">
              <p className="font-mono text-[11px] tracking-[0.16em] text-cyan-300 uppercase sm:text-xs">
                Machine Intelligence
              </p>
              <p className="mt-0.5 text-xs text-slate-300 hidden sm:block">
                Photonic synthesis & precision
              </p>
            </div>

            {/* Bottom Balance Telemetry Readout */}
            <div className="pointer-events-none absolute right-4 bottom-4 left-4 z-10 flex items-center justify-between text-xs text-slate-300 sm:right-6 sm:bottom-5 sm:left-6">
              <span className="font-mono tabular-nums">
                Human {splitPercent}%
              </span>
              <span className="font-mono tabular-nums text-cyan-300">
                Machine {100 - splitPercent}%
              </span>
            </div>

            {/* Divider Line & Handle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-gradient-to-b from-amber-300/70 via-cyan-300 to-violet-400/80 shadow-[0_0_16px_rgba(34,211,238,0.8)]"
              style={{
                left: `${splitPercent}%`,
                transition: isDragging ? 'none' : 'left 240ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-300/70 bg-[#070B16]/90 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.5)] backdrop-blur-md">
                <MoveHorizontal className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comparative Matrix Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {HUMAN_VS_MACHINE_DIMENSIONS.map((row) => (
            <div
              key={row.id}
              className="glass-surface glow-ring-hover rounded-2xl border border-slate-200 p-5 sm:p-6 dark:border-slate-800/90"
            >
              <h3 className="font-display text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
                {row.dimension}
              </h3>
              <div className="mt-4 space-y-3 text-xs leading-relaxed sm:text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] text-amber-700 uppercase dark:text-amber-300/90">
                    Human
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">{row.human}</span>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-slate-200/80 pt-2.5 dark:border-slate-800/80">
                  <span className="font-mono text-[11px] text-blue-700 uppercase dark:text-cyan-300">
                    Machine
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">{row.machine}</span>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-slate-200/80 pt-2.5 dark:border-slate-800/80">
                  <span className="font-mono text-[11px] text-violet-700 uppercase dark:text-violet-300">
                    CYBERNEX Symbiosis
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {row.symbiosis}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
