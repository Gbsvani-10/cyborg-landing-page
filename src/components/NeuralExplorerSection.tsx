import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, GitBranch, Play, Sparkles, Zap } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  EXPLORER_LAYERS,
  EXPLORER_NEURONS,
  type ExplorerNeuron,
} from '../data/experiencesData';

interface NeuralExplorerSectionProps {
  onInteract?: () => void;
  onConfirm?: () => void;
}

export function NeuralExplorerSection({
  onInteract,
  onConfirm,
}: NeuralExplorerSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>('h1-spatial');
  const [inputs, setInputs] = useState<Record<string, boolean>>({
    'in-vision': true,
    'in-bio': true,
    'in-tactile': false,
  });
  const [synapticGain, setSynapticGain] = useState<number>(1.0);
  const [waveStep, setWaveStep] = useState<number | null>(null);
  const waveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (waveTimerRef.current) {
        window.clearInterval(waveTimerRef.current);
      }
    };
  }, []);

  const selectedNeuron: ExplorerNeuron =
    EXPLORER_NEURONS.find((n) => n.id === selectedId) ?? EXPLORER_NEURONS[0];

  // Compute deterministic live activations across all 4 layers based on active inputs & synaptic gain
  const activations = useMemo(() => {
    const map: Record<string, number> = {};
    const incomingMap: Record<string, string[]> = {};

    EXPLORER_NEURONS.forEach((n) => {
      incomingMap[n.id] = [];
    });
    EXPLORER_NEURONS.forEach((n) => {
      n.connections.forEach((targetId) => {
        incomingMap[targetId]?.push(n.id);
      });
    });

    // Layer 0
    EXPLORER_NEURONS.filter((n) => n.layerIndex === 0).forEach((n) => {
      map[n.id] = inputs[n.id] ? 0.92 : 0.14;
    });

    // Layers 1..3
    for (let layer = 1; layer <= 3; layer++) {
      EXPLORER_NEURONS.filter((n) => n.layerIndex === layer).forEach((n) => {
        const parents = incomingMap[n.id] || [];
        const avg =
          parents.reduce((sum, pid) => sum + (map[pid] ?? 0.2), 0) /
          Math.max(1, parents.length);
        // Boundary Gatekeeper dampens slightly when tactile pressure is off vs on
        const modifier =
          n.id === 'h2-safety'
            ? inputs['in-tactile']
              ? 0.85
              : 1.05
            : 1.0;
        map[n.id] = Math.min(0.99, Math.max(0.08, Number((avg * synapticGain * modifier).toFixed(2))));
      });
    }

    return map;
  }, [inputs, synapticGain]);

  const incomingToSelected = useMemo(() => {
    return EXPLORER_NEURONS.filter((n) =>
      n.connections.includes(selectedNeuron.id)
    ).map((n) => n.id);
  }, [selectedNeuron]);

  const edges = useMemo(() => {
    const list: { from: ExplorerNeuron; to: ExplorerNeuron; id: string }[] = [];
    EXPLORER_NEURONS.forEach((from) => {
      from.connections.forEach((targetId) => {
        const to = EXPLORER_NEURONS.find((n) => n.id === targetId);
        if (to) {
          list.push({ from, to, id: `${from.id}->${to.id}` });
        }
      });
    });
    return list;
  }, []);

  const triggerSignalWave = () => {
    if (waveTimerRef.current) {
      window.clearInterval(waveTimerRef.current);
    }
    setWaveStep(0);
    onConfirm?.();

    let step = 0;
    waveTimerRef.current = window.setInterval(() => {
      step += 1;
      if (step > 3) {
        if (waveTimerRef.current) {
          window.clearInterval(waveTimerRef.current);
          waveTimerRef.current = null;
        }
        setWaveStep(null);
      } else {
        setWaveStep(step);
      }
    }, 450);
  };

  const toggleInput = (id: string) => {
    setInputs((prev) => ({ ...prev, [id]: !prev[id] }));
    onInteract?.();
  };

  return (
    <section
      id="neural-explorer"
      aria-labelledby="neural-explorer-heading"
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
              Neural Network Explorer
            </p>
            <h2
              id="neural-explorer-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Inspect how neurons, weights, and signals compute together.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Click any neuron node below to trace its incoming and outgoing pathways, toggle sensory inputs, and watch how weighted connections transform signals into clear actions.
            </p>
          </div>

          <button
            type="button"
            onClick={triggerSignalWave}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 self-start rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase shadow-[0_0_24px_-6px_rgba(139,92,246,0.55)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 lg:self-end cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Fire Signal Wave</span>
          </button>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Interactive Clickable Network Topology */}
          <div className="glass-surface flex flex-col justify-between rounded-2xl border border-slate-200 p-5 sm:p-6 lg:col-span-7 dark:border-slate-800/90">
            {/* Input Stimulus & Synaptic Gain Controls */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-slate-500 uppercase">
                  Inputs:
                </span>
                {[
                  { id: 'in-vision', label: 'Optical' },
                  { id: 'in-bio', label: 'Intent' },
                  { id: 'in-tactile', label: 'Tactile' },
                ].map((item) => {
                  const active = inputs[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleInput(item.id)}
                      className={`min-h-[36px] rounded-lg border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'border-blue-600/50 bg-blue-600 text-white dark:border-cyan-400/50 dark:bg-cyan-400/20 dark:text-cyan-100'
                          : 'border-slate-300 bg-white/70 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {item.label}: {active ? 'On' : 'Low'}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2.5">
                <label
                  htmlFor="synaptic-gain-slider"
                  className="font-mono text-[11px] text-slate-500 uppercase whitespace-nowrap"
                >
                  Gain {synapticGain.toFixed(1)}x
                </label>
                <input
                  id="synaptic-gain-slider"
                  type="range"
                  min={0.5}
                  max={1.4}
                  step={0.1}
                  value={synapticGain}
                  onChange={(e) => {
                    setSynapticGain(Number(e.target.value));
                    onInteract?.();
                  }}
                  className="h-2 w-24 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Interactive SVG + Accessible Overlay Nodes */}
            <div className="relative my-5 h-[320px] w-full overflow-hidden rounded-xl border border-slate-200/90 bg-[#060914] sm:h-[360px] dark:border-slate-800">
              {/* Layer Column Headers */}
              <div className="pointer-events-none absolute top-3 right-0 left-0 z-10 grid grid-cols-4 px-2 text-center">
                {EXPLORER_LAYERS.map((layer) => (
                  <div key={layer.index}>
                    <span className="block font-mono text-[10px] tracking-wider text-cyan-300/80 uppercase">
                      {layer.name}
                    </span>
                    <span className="hidden text-[10px] text-slate-400 sm:block">
                      {layer.subtitle}
                    </span>
                  </div>
                ))}
              </div>

              {/* SVG Synaptic Edges & Animated Pulses */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient id="edge-active-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>

                {edges.map((edge, idx) => {
                  const isConnected =
                    edge.from.id === selectedNeuron.id ||
                    edge.to.id === selectedNeuron.id;
                  const isWaveActive =
                    waveStep !== null && edge.from.layerIndex === waveStep;
                  const strength = activations[edge.from.id] ?? 0.5;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={edge.from.xPercent}
                        y1={edge.from.yPercent}
                        x2={edge.to.xPercent}
                        y2={edge.to.yPercent}
                        stroke={
                          isWaveActive
                            ? '#22D3EE'
                            : isConnected
                            ? 'url(#edge-active-grad)'
                            : 'rgba(148, 163, 184, 0.22)'
                        }
                        strokeWidth={
                          isWaveActive ? 0.85 : isConnected ? 0.65 : 0.3
                        }
                        strokeOpacity={
                          isWaveActive || isConnected ? 0.95 : 0.55
                        }
                      />
                      {!prefersReducedMotion && (isConnected || isWaveActive || idx % 3 === 0) && (
                        <circle
                          r={isWaveActive ? '1.15' : isConnected ? '0.85' : '0.55'}
                          fill={isWaveActive ? '#22D3EE' : '#38BDF8'}
                          opacity={strength > 0.3 ? 0.9 : 0.4}
                        >
                          <animateMotion
                            dur={`${Math.max(1.2, 2.8 - strength * 1.2)}s`}
                            repeatCount="indefinite"
                            path={`M${edge.from.xPercent},${edge.from.yPercent} L${edge.to.xPercent},${edge.to.yPercent}`}
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Accessible Interactive Neuron Node Buttons */}
              {EXPLORER_NEURONS.map((neuron) => {
                const isSelected = neuron.id === selectedNeuron.id;
                const isRelated =
                  selectedNeuron.connections.includes(neuron.id) ||
                  incomingToSelected.includes(neuron.id);
                const isWaveLit =
                  waveStep !== null && neuron.layerIndex === waveStep;
                const value = activations[neuron.id] ?? 0.5;

                return (
                  <button
                    key={neuron.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(neuron.id);
                      onInteract?.();
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${neuron.title} (${neuron.layerName}), activation ${value.toFixed(
                      2
                    )}`}
                    style={{
                      left: `${neuron.xPercent}%`,
                      top: `${neuron.yPercent}%`,
                    }}
                    className={`group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus-visible:outline-none cursor-pointer`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[10px] font-semibold tabular-nums transition-all sm:h-11 sm:w-11 sm:text-[11px] ${
                        isSelected
                          ? 'scale-110 border-cyan-300 bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.8)]'
                          : isWaveLit
                          ? 'scale-105 border-violet-300 bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.75)]'
                          : isRelated
                          ? 'border-blue-400 bg-blue-600/80 text-white shadow-[0_0_16px_rgba(59,130,246,0.45)]'
                          : 'border-slate-600 bg-[#0B1222] text-slate-200 hover:border-cyan-400/70'
                      } group-focus-visible:ring-2 group-focus-visible:ring-cyan-300`}
                    >
                      {value.toFixed(2)}
                    </span>
                    <span className="mt-1 rounded bg-[#050812]/90 px-1.5 py-0.5 font-mono text-[9px] text-slate-200 whitespace-nowrap sm:text-[10px]">
                      {neuron.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Tip: Click any numbered node to inspect its synaptic role.</span>
              <span className="font-mono text-[11px] tabular-nums">
                Outputs · Cue: {(activations['out-assist'] ?? 0).toFixed(2)} / Actuate:{' '}
                {(activations['out-grip'] ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Right: Selected Neuron Concept Inspector */}
          <div className="glass-surface flex flex-col justify-between rounded-2xl border border-slate-200 p-5 sm:p-7 lg:col-span-5 dark:border-slate-800/90">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNeuron.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-blue-600 uppercase dark:text-cyan-300">
                    {selectedNeuron.layerName}
                  </span>
                  <span className="font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
                    Activation: {(activations[selectedNeuron.id] ?? 0).toFixed(2)}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
                  {selectedNeuron.title}
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-800 dark:bg-[#060B17]/85">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-300" aria-hidden="true" />
                      <span>Node Function</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {selectedNeuron.role}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-800 dark:bg-[#060B17]/85">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <Activity className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" aria-hidden="true" />
                      <span>Biological Analogy</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {selectedNeuron.biologicalAnalogy}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-800 dark:bg-[#060B17]/85">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-300" aria-hidden="true" />
                      <span>Information Processing</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {selectedNeuron.howItProcesses}
                    </p>
                  </div>
                </div>

                {/* Connected Nodes Jump Pills */}
                <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase">
                    <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Direct Pathways</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {incomingToSelected.map((inId) => {
                      const n = EXPLORER_NEURONS.find((x) => x.id === inId);
                      if (!n) return null;
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(n.id);
                            onInteract?.();
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-blue-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
                        >
                          From: {n.shortLabel}
                        </button>
                      );
                    })}
                    {selectedNeuron.connections.map((outId) => {
                      const n = EXPLORER_NEURONS.find((x) => x.id === outId);
                      if (!n) return null;
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(n.id);
                            onInteract?.();
                          }}
                          className="rounded-lg border border-blue-500/35 bg-blue-50 px-2.5 py-1 text-xs text-blue-800 hover:border-blue-500 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-200 cursor-pointer"
                        >
                          To: {n.shortLabel}
                        </button>
                      );
                    })}
                    {incomingToSelected.length === 0 &&
                      selectedNeuron.connections.length === 0 && (
                        <span className="text-xs text-slate-500">
                          Endpoint node.
                        </span>
                      )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
