import { useEffect, useRef, useState } from 'react';
import { Activity, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { DASHBOARD_MODES, type DashboardMode } from '../data/cybernexData';

interface TechnologyDashboardProps {
  onInteract?: () => void;
}

const NETWORK_LAYERS = [
  { id: 'input', label: 'Sensory Input', nodes: [0.22, 0.5, 0.78] },
  { id: 'fusion', label: 'Semantic Fusion', nodes: [0.18, 0.4, 0.62, 0.84] },
  { id: 'router', label: 'Neural Router', nodes: [0.28, 0.5, 0.72] },
  { id: 'output', label: 'Kinetic Sync', nodes: [0.35, 0.65] },
];

function NeuralNetworkCanvas({
  mode,
  selectedLayerIdx,
}: {
  mode: DashboardMode;
  selectedLayerIdx: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let rafId = 0;
    let isVisible = true;
    let phase = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
        if (isVisible && !prefersReducedMotion && !rafId) {
          rafId = window.requestAnimationFrame(draw);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const speed =
      mode.id === 'kinetic' ? 0.022 : mode.id === 'cognitive' ? 0.016 : 0.008;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width <= 0 || height <= 0) return;
      const isDark = document.documentElement.classList.contains('dark');

      ctx.clearRect(0, 0, width, height);

      const xPositions = NETWORK_LAYERS.map(
        (_, i) => ((i + 0.65) / (NETWORK_LAYERS.length + 0.3)) * width
      );

      // Compute node coords
      const layerCoords = NETWORK_LAYERS.map((layer, layerIdx) =>
        layer.nodes.map((ny) => ({
          x: xPositions[layerIdx],
          y: ny * (height - 36) + 18,
        }))
      );

      // Draw edges & traveling pulses
      for (let l = 0; l < layerCoords.length - 1; l++) {
        const fromNodes = layerCoords[l];
        const toNodes = layerCoords[l + 1];

        for (let i = 0; i < fromNodes.length; i++) {
          for (let j = 0; j < toNodes.length; j++) {
            const a = fromNodes[i];
            const b = toNodes[j];
            const isHighlighted =
              l === selectedLayerIdx || l + 1 === selectedLayerIdx;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = isHighlighted
              ? isDark
                ? 'rgba(56, 189, 248, 0.34)'
                : 'rgba(37, 99, 235, 0.28)'
              : isDark
              ? 'rgba(148, 163, 184, 0.14)'
              : 'rgba(100, 116, 139, 0.16)';
            ctx.lineWidth = isHighlighted ? 1.25 : 0.8;
            ctx.stroke();

            if (!prefersReducedMotion && (i + j) % 2 === 0) {
              const t = (phase + (i * 0.27 + j * 0.19 + l * 0.33)) % 1;
              const px = a.x + (b.x - a.x) * t;
              const py = a.y + (b.y - a.y) * t;
              ctx.beginPath();
              ctx.arc(px, py, isHighlighted ? 2.4 : 1.7, 0, Math.PI * 2);
              ctx.fillStyle =
                mode.id === 'kinetic'
                  ? 'rgba(34, 211, 238, 0.9)'
                  : mode.id === 'cognitive'
                  ? 'rgba(139, 92, 246, 0.9)'
                  : 'rgba(59, 130, 246, 0.78)';
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      layerCoords.forEach((nodes, layerIdx) => {
        const isLayerActive = layerIdx === selectedLayerIdx;
        nodes.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isLayerActive ? 6.5 : 4.8, 0, Math.PI * 2);
          ctx.fillStyle = isLayerActive
            ? isDark
              ? '#22D3EE'
              : '#2563EB'
            : isDark
            ? '#0F172A'
            : '#FFFFFF';
          ctx.fill();
          ctx.lineWidth = isLayerActive ? 2 : 1.4;
          ctx.strokeStyle = isLayerActive
            ? isDark
              ? '#E0F2FE'
              : '#1D4ED8'
            : isDark
            ? '#38BDF8'
            : '#3B82F6';
          ctx.stroke();
        });
      });

      if (!prefersReducedMotion && isVisible && !document.hidden) {
        phase = (phase + speed) % 1;
        rafId = window.requestAnimationFrame(draw);
      } else {
        rafId = 0;
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [mode, selectedLayerIdx]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Simulated neural network signal routing visualization"
      className="h-56 w-full sm:h-64"
    />
  );
}

export function TechnologyDashboard({ onInteract }: TechnologyDashboardProps) {
  const [modeId, setModeId] = useState<DashboardMode['id']>('cognitive');
  const [selectedLayerIdx, setSelectedLayerIdx] = useState(1);

  const activeMode =
    DASHBOARD_MODES.find((m) => m.id === modeId) ?? DASHBOARD_MODES[0];

  const statItems = [
    {
      label: 'Active Model Nodes',
      value: `${activeMode.simulatedStats.activeNodes}`,
      unit: 'nodes',
      icon: Cpu,
    },
    {
      label: 'Signal Throughput Index',
      value: `${activeMode.simulatedStats.throughputIndex}`,
      unit: '/ 100',
      icon: Zap,
    },
    {
      label: 'Coherence Calibration',
      value: `${activeMode.simulatedStats.coherenceScore}%`,
      unit: 'simulated',
      icon: Activity,
    },
    {
      label: 'Thermal Envelope',
      value: `${activeMode.simulatedStats.thermalLoad}%`,
      unit: 'budget',
      icon: ShieldCheck,
    },
  ];

  return (
    <section
      aria-labelledby="dashboard-heading"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-28 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header + Mode Switcher + Clear Simulated Data Disclosure */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between dark:border-slate-800/80"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-blue-600 uppercase dark:text-cyan-300">
              System Simulation · Illustrative Telemetry
            </p>
            <h2
              id="dashboard-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Conceptual Neural Architecture Console
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Explore how CYBERNEX subsystems route signals under different operational profiles. All figures and status indicators below are illustrative simulations.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Simulated Operational Modes"
            className="flex flex-wrap gap-1.5 self-start rounded-xl border border-slate-200 bg-white/80 p-1 lg:self-end dark:border-slate-800 dark:bg-[#060913]"
          >
            {DASHBOARD_MODES.map((m) => {
              const active = m.id === activeMode.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setModeId(m.id);
                    onInteract?.();
                  }}
                  className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm dark:border dark:border-cyan-400/40 dark:bg-gradient-to-r dark:from-blue-600/35 dark:to-violet-600/35 dark:text-cyan-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Simulated Telemetry Stat Strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="glass-surface glow-ring-hover rounded-2xl border border-slate-200 p-4 sm:p-5 dark:border-slate-800/90"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {item.label}
                  </span>
                  <Icon
                    className="h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-300"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-3xl dark:text-white">
                    {item.value}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 uppercase">
                    {item.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Neural Network Visualization + Subsystem Matrix */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Interactive Neural Network Canvas */}
          <div className="glass-surface flex flex-col justify-between rounded-2xl border border-slate-200 p-5 sm:p-6 lg:col-span-7 dark:border-slate-800/90">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    Neural Routing Topology
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    {activeMode.summary}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-blue-700 uppercase dark:text-cyan-300">
                  Simulated Signal Flow
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200/90 bg-slate-100/70 p-2 dark:border-slate-800/90 dark:bg-[#050812]/85">
                <NeuralNetworkCanvas
                  mode={activeMode}
                  selectedLayerIdx={selectedLayerIdx}
                />
              </div>
            </div>

            {/* Layer Focus Selector */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {NETWORK_LAYERS.map((layer, idx) => {
                const isSelected = idx === selectedLayerIdx;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => {
                      setSelectedLayerIdx(idx);
                      onInteract?.();
                    }}
                    aria-pressed={isSelected}
                    className={`min-h-[40px] rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600/10 text-blue-800 dark:border-cyan-400/50 dark:bg-cyan-400/15 dark:text-cyan-200'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {layer.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Subsystem Status Indicators */}
          <div className="glass-surface flex flex-col justify-between rounded-2xl border border-slate-200 p-5 sm:p-6 lg:col-span-5 dark:border-slate-800/90">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Simulated Subsystems
                </h3>
                <span className="font-mono text-[11px] text-slate-500 uppercase">
                  Illustrative
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {activeMode.subsystems.map((sub) => {
                  const statusColor =
                    sub.state === 'Active'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : sub.state === 'Calibrated'
                      ? 'text-blue-700 dark:text-cyan-300'
                      : 'text-slate-600 dark:text-slate-400';

                  const dotColor =
                    sub.state === 'Active'
                      ? 'bg-emerald-500'
                      : sub.state === 'Calibrated'
                      ? 'bg-cyan-400'
                      : 'bg-slate-400';

                  return (
                    <div
                      key={sub.id}
                      className="rounded-xl border border-slate-200/90 bg-white/60 p-4 dark:border-slate-800/80 dark:bg-[#060B17]/80"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                            {sub.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {sub.role}
                          </p>
                        </div>

                        <div className={`flex items-center gap-2 font-mono text-xs ${statusColor}`}>
                          <span
                            aria-hidden="true"
                            className={`h-2 w-2 rounded-full ${dotColor} ${
                              sub.state === 'Active' ? 'animate-pulse' : ''
                            }`}
                          />
                          <span>{sub.state}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full w-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-violet-500 transition-transform duration-300"
                            style={{
                              transform: `scaleX(${sub.load / 100})`,
                              transformOrigin: '0% 50%',
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-600 tabular-nums dark:text-slate-400">
                          {sub.load}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 border-t border-slate-200 pt-3.5 text-xs text-slate-500 dark:border-slate-800/80">
              Simulated dashboard telemetry for architectural demonstration only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
