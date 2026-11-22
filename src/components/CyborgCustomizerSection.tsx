import { useState } from 'react';
import {
  BadgeCheck,
  Cpu,
  Eye,
  Hand,
  Palette,
  RotateCcw,
  Shield,
  Shuffle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ACCENT_SPECTRUMS,
  ARM_OPTIONS,
  CHASSIS_FINISHES,
  DEFAULT_CYBORG_BUILD,
  NEURAL_OPTIONS,
  OPTIC_OPTIONS,
  TORSO_OPTIONS,
  type CyborgBuildConfig,
} from '../data/experiencesData';

interface CyborgCustomizerSectionProps {
  build: CyborgBuildConfig;
  onChangeBuild: (next: CyborgBuildConfig) => void;
  onSyncToIdCard: () => void;
  onInteract?: () => void;
  onConfirm?: () => void;
}

type CategoryTab = 'optics' | 'arms' | 'neural' | 'torso' | 'finish';

export function CyborgCustomizerSection({
  build,
  onChangeBuild,
  onSyncToIdCard,
  onInteract,
  onConfirm,
}: CyborgCustomizerSectionProps) {
  const [activeTab, setActiveTab] = useState<CategoryTab>('optics');
  const [showCallouts, setShowCallouts] = useState(true);

  const accent =
    ACCENT_SPECTRUMS.find((a) => a.id === build.accent) ?? ACCENT_SPECTRUMS[0];
  const chassis =
    CHASSIS_FINISHES.find((c) => c.id === build.chassis) ?? CHASSIS_FINISHES[0];

  const selectedOptic =
    OPTIC_OPTIONS.find((o) => o.id === build.optics) ?? OPTIC_OPTIONS[0];
  const selectedArm =
    ARM_OPTIONS.find((a) => a.id === build.arms) ?? ARM_OPTIONS[0];
  const selectedNeural =
    NEURAL_OPTIONS.find((n) => n.id === build.neural) ?? NEURAL_OPTIONS[0];
  const selectedTorso =
    TORSO_OPTIONS.find((t) => t.id === build.torso) ?? TORSO_OPTIONS[0];

  const handleRandomize = () => {
    const pick = <T,>(arr: T[]): T =>
      arr[Math.floor(Math.random() * arr.length)];
    onChangeBuild({
      optics: pick(OPTIC_OPTIONS).id,
      arms: pick(ARM_OPTIONS).id,
      neural: pick(NEURAL_OPTIONS).id,
      torso: pick(TORSO_OPTIONS).id,
      accent: pick(ACCENT_SPECTRUMS).id,
      chassis: pick(CHASSIS_FINISHES).id,
    });
    onConfirm?.();
  };

  const handleReset = () => {
    onChangeBuild(DEFAULT_CYBORG_BUILD);
    onInteract?.();
  };

  const tabs: { id: CategoryTab; label: string; icon: typeof Eye }[] = [
    { id: 'optics', label: 'Optics', icon: Eye },
    { id: 'arms', label: 'Arms', icon: Hand },
    { id: 'neural', label: 'Neural', icon: Cpu },
    { id: 'torso', label: 'Torso', icon: Shield },
    { id: 'finish', label: 'Finish', icon: Palette },
  ];

  const activePartOptions =
    activeTab === 'optics'
      ? { key: 'optics' as const, items: OPTIC_OPTIONS, current: build.optics }
      : activeTab === 'arms'
      ? { key: 'arms' as const, items: ARM_OPTIONS, current: build.arms }
      : activeTab === 'neural'
      ? { key: 'neural' as const, items: NEURAL_OPTIONS, current: build.neural }
      : activeTab === 'torso'
      ? { key: 'torso' as const, items: TORSO_OPTIONS, current: build.torso }
      : null;

  return (
    <section
      id="customizer"
      aria-labelledby="customizer-heading"
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
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-blue-600 uppercase dark:text-cyan-300">
              Cyborg Customizer
            </p>
            <h2
              id="customizer-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Configure your symbiotic cybernetic chassis.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Select robotic optics, articulated limbs, cranial neural links, and structural finishes. Every selection updates the live anatomical schematic in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 transition-colors hover:border-blue-500/50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-cyan-400/50 dark:hover:text-cyan-200 cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Randomize</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSyncToIdCard();
                onConfirm?.();
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 cursor-pointer"
            >
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Use in ID Card</span>
            </button>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* Left: Live Interactive Cyborg Blueprint Preview */}
          <div className="glass-surface relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 p-5 sm:p-7 lg:col-span-6 dark:border-slate-800/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Live Chassis Schematic · {chassis.label}
                </p>
                <p className="mt-0.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                  {selectedOptic.name} + {selectedArm.name}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={showCallouts}
                onClick={() => {
                  setShowCallouts((prev) => !prev);
                  onInteract?.();
                }}
                className={`min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  showCallouts
                    ? 'border-blue-600/40 bg-blue-600/10 text-blue-700 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-200'
                    : 'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                {showCallouts ? 'Callouts: On' : 'Callouts: Off'}
              </button>
            </div>

            {/* Interactive SVG Chassis Stage */}
            <div className="relative my-5 flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200/90 bg-[#060914] p-4 sm:p-6 dark:border-slate-800">
              {/* Subtle radial illumination driven by accent spectrum */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at 50% 42%, ${accent.glow.replace(
                    '0.45',
                    '0.2'
                  )} 0%, rgba(15, 23, 42, 0.25) 48%, transparent 75%)`,
                }}
              />

              <svg
                viewBox="0 0 420 480"
                role="img"
                aria-label={`Customized cyborg chassis featuring ${selectedOptic.name}, ${selectedArm.name}, ${selectedNeural.name}, and ${selectedTorso.name}`}
                className="relative z-10 h-[340px] w-full max-w-[380px] sm:h-[420px]"
              >
                <defs>
                  <linearGradient id="cyber-accent-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={accent.primary} />
                    <stop offset="100%" stopColor={accent.secondary} />
                  </linearGradient>
                  <filter
                    id="cyber-soft-glow"
                    x="0"
                    y="0"
                    width="420"
                    height="480"
                    filterUnits="userSpaceOnUse"
                  >
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background calibration arcs */}
                <circle
                  cx="210"
                  cy="215"
                  r="176"
                  fill="none"
                  stroke={accent.primary}
                  strokeOpacity="0.16"
                  strokeDasharray="4 8"
                />
                <circle
                  cx="210"
                  cy="215"
                  r="134"
                  fill="none"
                  stroke={accent.secondary}
                  strokeOpacity="0.14"
                />

                {/* --- TORSO & SPINE VARIATIONS --- */}
                <g>
                  {/* Base neck column */}
                  <rect
                    x="190"
                    y="148"
                    width="40"
                    height="34"
                    rx="8"
                    fill={chassis.jointFill}
                    stroke={chassis.plateStroke}
                    strokeWidth="1.5"
                  />
                  {/* Shoulders & clavicle yoke */}
                  <path
                    d="M116 196 C140 172, 280 172, 304 196 L292 246 L128 246 Z"
                    fill={chassis.plateFill}
                    stroke={chassis.plateStroke}
                    strokeWidth="1.8"
                  />

                  {build.torso === 'kinetic-spine' && (
                    <g>
                      <path
                        d="M142 246 L278 246 L262 396 L158 396 Z"
                        fill={chassis.plateFill}
                        stroke={chassis.plateStroke}
                        strokeWidth="1.8"
                      />
                      {[215, 245, 275, 305, 335, 365].map((yPos, idx) => (
                        <g key={yPos}>
                          <rect
                            x={168 + idx * 2}
                            y={yPos}
                            width={84 - idx * 4}
                            height="12"
                            rx="5"
                            fill={chassis.jointFill}
                            stroke={accent.primary}
                            strokeOpacity={0.55}
                            strokeWidth="1.2"
                          />
                          <circle
                            cx="210"
                            cy={yPos + 6}
                            r="3"
                            fill={accent.primary}
                            filter="url(#cyber-soft-glow)"
                          />
                        </g>
                      ))}
                    </g>
                  )}

                  {build.torso === 'cryo-core' && (
                    <g>
                      <path
                        d="M138 246 L282 246 L264 398 L156 398 Z"
                        fill={chassis.plateFill}
                        stroke={chassis.plateStroke}
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="210"
                        cy="268"
                        r="38"
                        fill={chassis.jointFill}
                        stroke={accent.primary}
                        strokeWidth="2"
                      />
                      <circle
                        cx="210"
                        cy="268"
                        r="24"
                        fill="none"
                        stroke={accent.secondary}
                        strokeDasharray="6 4"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="210"
                        cy="268"
                        r="11"
                        fill="url(#cyber-accent-grad)"
                        filter="url(#cyber-soft-glow)"
                      />
                      <path
                        d="M168 324 L252 324 M176 346 L244 346 M184 368 L236 368"
                        stroke={accent.primary}
                        strokeOpacity="0.65"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  )}

                  {build.torso === 'stealth-carapace' && (
                    <g>
                      <polygon
                        points="134,210 210,192 286,210 264,398 156,398"
                        fill={chassis.plateFill}
                        stroke={chassis.plateStroke}
                        strokeWidth="2"
                      />
                      <polygon
                        points="152,226 205,214 205,310 162,292"
                        fill={chassis.jointFill}
                        stroke={accent.primary}
                        strokeOpacity="0.5"
                        strokeWidth="1.4"
                      />
                      <polygon
                        points="268,226 215,214 215,310 258,292"
                        fill={chassis.jointFill}
                        stroke={accent.primary}
                        strokeOpacity="0.5"
                        strokeWidth="1.4"
                      />
                      <line
                        x1="210"
                        y1="205"
                        x2="210"
                        y2="386"
                        stroke={accent.primary}
                        strokeWidth="2.2"
                        filter="url(#cyber-soft-glow)"
                      />
                    </g>
                  )}
                </g>

                {/* --- CYBERNETIC ARMS VARIATIONS (Left & Right Symmetrical) --- */}
                {[-1, 1].map((side) => {
                  const isRight = side === 1;
                  const transformStr = isRight
                    ? 'translate(420, 0) scale(-1, 1)'
                    : undefined;
                  return (
                    <g key={side} transform={transformStr}>
                      {/* Shoulder joint ball */}
                      <circle
                        cx="106"
                        cy="210"
                        r="21"
                        fill={chassis.jointFill}
                        stroke={chassis.plateStroke}
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="106"
                        cy="210"
                        r="8"
                        fill={accent.primary}
                        fillOpacity="0.85"
                      />

                      {build.arms === 'carbon-tendon' && (
                        <g>
                          <path
                            d="M90 228 L118 228 L112 316 L84 312 Z"
                            fill={chassis.plateFill}
                            stroke={chassis.plateStroke}
                            strokeWidth="1.6"
                          />
                          <line
                            x1="101"
                            y1="234"
                            x2="96"
                            y2="310"
                            stroke={accent.primary}
                            strokeWidth="2"
                          />
                          <circle
                            cx="96"
                            cy="322"
                            r="13"
                            fill={chassis.jointFill}
                            stroke={accent.primary}
                            strokeWidth="1.5"
                          />
                          <path
                            d="M84 334 L108 334 L102 414 L78 410 Z"
                            fill={chassis.plateFill}
                            stroke={chassis.plateStroke}
                            strokeWidth="1.6"
                          />
                          {/* Articulated slim hand */}
                          <path
                            d="M78 416 L102 416 L100 448 L88 456 L74 446 Z"
                            fill={chassis.jointFill}
                            stroke={accent.primary}
                            strokeWidth="1.3"
                          />
                        </g>
                      )}

                      {build.arms === 'titanium-exolimb' && (
                        <g>
                          <rect
                            x="78"
                            y="224"
                            width="42"
                            height="92"
                            rx="10"
                            fill={chassis.plateFill}
                            stroke={chassis.plateStroke}
                            strokeWidth="2"
                          />
                          {/* Hydraulic piston strut */}
                          <line
                            x1="74"
                            y1="238"
                            x2="70"
                            y2="314"
                            stroke={accent.primary}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            filter="url(#cyber-soft-glow)"
                          />
                          <circle
                            cx="98"
                            cy="326"
                            r="16"
                            fill={chassis.jointFill}
                            stroke={chassis.plateStroke}
                            strokeWidth="2"
                          />
                          <rect
                            x="76"
                            y="340"
                            width="38"
                            height="78"
                            rx="8"
                            fill={chassis.plateFill}
                            stroke={accent.secondary}
                            strokeWidth="1.8"
                          />
                          {/* Heavy exo hand */}
                          <rect
                            x="75"
                            y="420"
                            width="34"
                            height="32"
                            rx="6"
                            fill={chassis.jointFill}
                            stroke={accent.primary}
                            strokeWidth="1.6"
                          />
                        </g>
                      )}

                      {build.arms === 'magnetic-tactile' && (
                        <g>
                          <path
                            d="M86 228 L116 228 L108 314 L82 314 Z"
                            fill={chassis.plateFill}
                            stroke={chassis.plateStroke}
                            strokeWidth="1.6"
                          />
                          {/* Harmonic levitation ring */}
                          <ellipse
                            cx="94"
                            cy="326"
                            rx="22"
                            ry="7"
                            fill="none"
                            stroke={accent.primary}
                            strokeWidth="2"
                            filter="url(#cyber-soft-glow)"
                          />
                          <path
                            d="M80 340 L106 340 L98 416 L76 416 Z"
                            fill={chassis.plateFill}
                            stroke={chassis.plateStroke}
                            strokeWidth="1.6"
                          />
                          <ellipse
                            cx="87"
                            cy="402"
                            rx="20"
                            ry="6"
                            fill="none"
                            stroke={accent.secondary}
                            strokeWidth="2"
                          />
                          {/* Tactile fingertip pads */}
                          <path
                            d="M74 420 L100 420 L98 446 L72 446 Z"
                            fill={chassis.jointFill}
                            stroke={chassis.plateStroke}
                            strokeWidth="1.4"
                          />
                          {[76, 83, 90, 97].map((fx) => (
                            <circle
                              key={fx}
                              cx={fx}
                              cy="453"
                              r="2.4"
                              fill={accent.primary}
                              filter="url(#cyber-soft-glow)"
                            />
                          ))}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* --- CRANIAL HEAD & NEURAL IMPLANT VARIATIONS --- */}
                <g>
                  {/* Neural Implant: Occipital Crown (behind head) */}
                  {build.neural === 'occipital-crown' && (
                    <g>
                      <path
                        d="M150 96 L136 52 L174 62 M270 96 L284 52 L246 62"
                        fill="none"
                        stroke={accent.primary}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#cyber-soft-glow)"
                      />
                      <path
                        d="M164 60 Q210 38 256 60"
                        fill="none"
                        stroke={accent.secondary}
                        strokeWidth="2.5"
                      />
                    </g>
                  )}

                  {/* Sculpted Cybernetic Cranium */}
                  <path
                    d="M162 96 C162 56, 258 56, 258 96 L254 142 C248 164, 228 176, 210 176 C192 176, 172 164, 166 142 Z"
                    fill={chassis.plateFill}
                    stroke={chassis.plateStroke}
                    strokeWidth="2"
                  />
                  {/* Jaw seam */}
                  <path
                    d="M168 134 L188 148 L232 148 L252 134"
                    fill="none"
                    stroke={chassis.plateStroke}
                    strokeWidth="1.4"
                  />

                  {/* Neural Implant: Optical Bridge */}
                  {build.neural === 'optical-bridge' && (
                    <g>
                      <rect
                        x="154"
                        y="102"
                        width="10"
                        height="26"
                        rx="4"
                        fill={accent.primary}
                        filter="url(#cyber-soft-glow)"
                      />
                      <rect
                        x="256"
                        y="102"
                        width="10"
                        height="26"
                        rx="4"
                        fill={accent.primary}
                        filter="url(#cyber-soft-glow)"
                      />
                      <path
                        d="M164 106 Q210 74 256 106"
                        fill="none"
                        stroke={accent.secondary}
                        strokeOpacity="0.7"
                        strokeWidth="1.6"
                        strokeDasharray="4 3"
                      />
                    </g>
                  )}

                  {/* Neural Implant: Synaptic Halo */}
                  {build.neural === 'synaptic-halo' && (
                    <g>
                      <path
                        d="M162 84 Q210 66 258 84"
                        fill="none"
                        stroke={accent.primary}
                        strokeWidth="4"
                        strokeLinecap="round"
                        filter="url(#cyber-soft-glow)"
                      />
                      <circle cx="210" cy="75" r="5" fill={accent.secondary} />
                    </g>
                  )}

                  {/* --- ROBOTIC OPTICS VARIATIONS --- */}
                  {build.optics === 'sapphire-array' && (
                    <g filter="url(#cyber-soft-glow)">
                      <circle
                        cx="188"
                        cy="112"
                        r="11"
                        fill="#05070D"
                        stroke={accent.primary}
                        strokeWidth="2.2"
                      />
                      <circle cx="188" cy="112" r="4.5" fill={accent.primary} />
                      <circle
                        cx="232"
                        cy="112"
                        r="11"
                        fill="#05070D"
                        stroke={accent.primary}
                        strokeWidth="2.2"
                      />
                      <circle cx="232" cy="112" r="4.5" fill={accent.primary} />
                    </g>
                  )}

                  {build.optics === 'thermal-visor' && (
                    <g filter="url(#cyber-soft-glow)">
                      <path
                        d="M168 104 Q210 100 252 104 L248 122 Q210 126 172 122 Z"
                        fill="#05070D"
                        stroke={accent.primary}
                        strokeWidth="2.2"
                      />
                      <line
                        x1="176"
                        y1="113"
                        x2="244"
                        y2="113"
                        stroke={accent.primary}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </g>
                  )}

                  {build.optics === 'tri-lens' && (
                    <g filter="url(#cyber-soft-glow)">
                      <circle
                        cx="186"
                        cy="113"
                        r="10"
                        fill="#05070D"
                        stroke={accent.primary}
                        strokeWidth="2"
                      />
                      <circle cx="186" cy="113" r="4" fill={accent.primary} />
                      <circle
                        cx="228"
                        cy="108"
                        r="8"
                        fill="#05070D"
                        stroke={accent.primary}
                        strokeWidth="2"
                      />
                      <circle cx="228" cy="108" r="3" fill={accent.primary} />
                      <circle
                        cx="240"
                        cy="121"
                        r="5.5"
                        fill="#05070D"
                        stroke={accent.secondary}
                        strokeWidth="1.8"
                      />
                      <circle cx="240" cy="121" r="2" fill={accent.secondary} />
                    </g>
                  )}
                </g>

                {/* Interactive Callout Pins */}
                {showCallouts && (
                  <g>
                    {[
                      { tab: 'neural' as const, x: 256, y: 76, label: 'Neural' },
                      { tab: 'optics' as const, x: 188, y: 112, label: 'Optics' },
                      { tab: 'torso' as const, x: 210, y: 268, label: 'Torso' },
                      { tab: 'arms' as const, x: 96, y: 326, label: 'Arms' },
                    ].map((pin) => {
                      const isActivePin = activeTab === pin.tab;
                      return (
                        <g
                          key={pin.tab}
                          onClick={() => {
                            setActiveTab(pin.tab);
                            onInteract?.();
                          }}
                          className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-white [&:focus-visible>circle:first-child]:stroke-[2.5]"
                          role="button"
                          tabIndex={0}
                          aria-label={`Inspect ${pin.label} module`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveTab(pin.tab);
                              onInteract?.();
                            }
                          }}
                        >
                          <circle
                            cx={pin.x}
                            cy={pin.y}
                            r={isActivePin ? 14 : 11}
                            fill={accent.primary}
                            fillOpacity={isActivePin ? 0.28 : 0.14}
                            stroke={accent.primary}
                            strokeWidth="1.4"
                          />
                          <circle cx={pin.x} cy={pin.y} r="4" fill="#FFFFFF" />
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            </div>

            {/* Active Spec Summary Footer */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-xs sm:grid-cols-4 dark:border-slate-800/80">
              <div>
                <span className="block font-mono text-[10px] text-slate-500 uppercase">
                  Optics
                </span>
                <span className="mt-0.5 block truncate font-medium text-slate-800 dark:text-slate-200">
                  {selectedOptic.name}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-slate-500 uppercase">
                  Arms
                </span>
                <span className="mt-0.5 block truncate font-medium text-slate-800 dark:text-slate-200">
                  {selectedArm.name}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-slate-500 uppercase">
                  Neural
                </span>
                <span className="mt-0.5 block truncate font-medium text-slate-800 dark:text-slate-200">
                  {selectedNeural.name}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-slate-500 uppercase">
                  Torso
                </span>
                <span className="mt-0.5 block truncate font-medium text-slate-800 dark:text-slate-200">
                  {selectedTorso.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Modular Configuration Selector */}
          <div className="glass-surface flex flex-col justify-between rounded-2xl border border-slate-200 p-5 sm:p-7 lg:col-span-6 dark:border-slate-800/90">
            <div>
              <div
                role="tablist"
                aria-label="Cyborg module categories"
                className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-100/90 p-1 dark:border-slate-800 dark:bg-[#060913]"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setActiveTab(tab.id);
                        onInteract?.();
                      }}
                      className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm dark:border dark:border-cyan-400/40 dark:bg-gradient-to-r dark:from-blue-600/35 dark:to-violet-600/35 dark:text-cyan-100'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {activePartOptions ? (
                  <motion.div
                    key={activePartOptions.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 space-y-3.5"
                  >
                    {activePartOptions.items.map((opt) => {
                      const isSelected = opt.id === activePartOptions.current;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            onChangeBuild({
                              ...build,
                              [activePartOptions.key]: opt.id,
                            });
                            onInteract?.();
                          }}
                          aria-pressed={isSelected}
                          className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:p-5 ${
                            isSelected
                              ? 'border-blue-600/60 bg-blue-50/70 dark:border-cyan-400/60 dark:bg-[#0B1224]'
                              : 'border-slate-200 bg-white/60 hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#060B17]/80 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                                {opt.name}
                              </h3>
                              <p className="mt-0.5 font-mono text-[11px] text-blue-600 dark:text-cyan-300">
                                {opt.subtitle} · {opt.powerDraw}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 font-mono text-[11px] uppercase ${
                                isSelected
                                  ? 'text-blue-700 dark:text-cyan-300'
                                  : 'text-slate-400'
                              }`}
                            >
                              {isSelected ? 'Equipped' : 'Select'}
                            </span>
                          </div>
                          <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {opt.description}
                          </p>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Material: {opt.material}
                          </p>
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="finish-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 space-y-6"
                  >
                    <div>
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        Optical Accent Spectrum
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Select the illumination wavelength for sensors, joint arcs, and neural bus paths.
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {ACCENT_SPECTRUMS.map((spec) => {
                          const selected = spec.id === build.accent;
                          return (
                            <button
                              key={spec.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                onChangeBuild({ ...build, accent: spec.id });
                                onInteract?.();
                              }}
                              className={`flex min-h-[46px] items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                                selected
                                  ? 'border-blue-600 bg-blue-50/70 text-slate-900 dark:border-cyan-400/60 dark:bg-[#0B1224] dark:text-white'
                                  : 'border-slate-200 bg-white/60 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300'
                              }`}
                            >
                              <span
                                className="h-4 w-4 shrink-0 rounded-full border border-white/30"
                                style={{ backgroundColor: spec.primary }}
                                aria-hidden="true"
                              />
                              <span>{spec.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        Primary Chassis Material
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Swap structural armor plates between matte composite, brushed titanium, and ceramic finish.
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {CHASSIS_FINISHES.map((fin) => {
                          const selected = fin.id === build.chassis;
                          return (
                            <button
                              key={fin.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                onChangeBuild({ ...build, chassis: fin.id });
                                onInteract?.();
                              }}
                              className={`flex min-h-[46px] items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                                selected
                                  ? 'border-blue-600 bg-blue-50/70 text-slate-900 dark:border-cyan-400/60 dark:bg-[#0B1224] dark:text-white'
                                  : 'border-slate-200 bg-white/60 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300'
                              }`}
                            >
                              <span
                                className="h-4 w-4 shrink-0 rounded-md border border-slate-500/40"
                                style={{ backgroundColor: fin.plateFill }}
                                aria-hidden="true"
                              />
                              <span>{fin.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800/80">
              Conceptual modular chassis builder. Export your active configuration directly into the Identity Card Generator.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
