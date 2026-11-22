import { useEffect, useMemo, useState } from 'react';
import { Check, Cpu, Download, RefreshCw, Shield, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';
import {
  ACCENT_SPECTRUMS,
  ARM_OPTIONS,
  ID_DIVISIONS,
  ID_MOTTOS,
  ID_NEURAL_TIERS,
  ID_ORIGIN_SECTORS,
  NEURAL_OPTIONS,
  OPTIC_OPTIONS,
  type AccentSpectrumId,
  type CyborgBuildConfig,
} from '../data/experiencesData';

interface IdentityCardGeneratorSectionProps {
  build: CyborgBuildConfig;
  syncCounter?: number;
  onInteract?: () => void;
  onConfirm?: () => void;
}

const RANDOM_CALLSIGNS = [
  'KAIROS-07',
  'NYX-VECTRA',
  'ORION-IX',
  'SOLARIS-42',
  'AETHER-VALE',
  'KINETA-09',
];

function computeSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function IdentityCardGeneratorSection({
  build,
  syncCounter = 0,
  onInteract,
  onConfirm,
}: IdentityCardGeneratorSectionProps) {
  const [callsign, setCallsign] = useState('AETHER-09');
  const [division, setDivision] = useState<string>(ID_DIVISIONS[0]);
  const [neuralTier, setNeuralTier] = useState<string>(ID_NEURAL_TIERS[0]);
  const [originSector, setOriginSector] = useState<string>(ID_ORIGIN_SECTORS[0]);
  const [motto, setMotto] = useState<string>(ID_MOTTOS[0]);
  const [accentId, setAccentId] = useState<AccentSpectrumId>(build.accent);
  const [downloaded, setDownloaded] = useState(false);
  const [syncedFromBuild, setSyncedFromBuild] = useState(false);

  useEffect(() => {
    if (syncCounter > 0) {
      setAccentId(build.accent);
      setSyncedFromBuild(true);
      const timer = window.setTimeout(() => setSyncedFromBuild(false), 2000);
      return () => window.clearTimeout(timer);
    }
  }, [syncCounter, build.accent]);

  const accent =
    ACCENT_SPECTRUMS.find((a) => a.id === accentId) ?? ACCENT_SPECTRUMS[0];

  const opticName =
    OPTIC_OPTIONS.find((o) => o.id === build.optics)?.name ?? 'Sapphire Retinal Array';
  const armName =
    ARM_OPTIONS.find((a) => a.id === build.arms)?.name ?? 'Carbon Tendon Precision';
  const neuralName =
    NEURAL_OPTIONS.find((n) => n.id === build.neural)?.name ?? 'Cortical Optical Bridge';

  const cleanCallsign = (callsign.trim() || 'CYBERNEX-01').toUpperCase().slice(0, 22);

  const seed = useMemo(
    () => computeSeed(`${cleanCallsign}:${division}:${originSector}`),
    [cleanCallsign, division, originSector]
  );

  const serialCode = useMemo(() => {
    const hex = seed.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
    return `CNX-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  }, [seed]);

  const matrixCells = useMemo(() => {
    const cells: boolean[] = [];
    for (let i = 0; i < 25; i++) {
      cells.push(((seed >> (i % 24)) ^ (i * 7)) % 3 !== 0);
    }
    return cells;
  }, [seed]);

  const handleSyncFromBuilder = () => {
    setAccentId(build.accent);
    setSyncedFromBuild(true);
    onConfirm?.();
    window.setTimeout(() => setSyncedFromBuild(false), 2000);
  };

  const handleRandomizePersona = () => {
    const pick = <T,>(arr: readonly T[]): T =>
      arr[Math.floor(Math.random() * arr.length)];
    setCallsign(pick(RANDOM_CALLSIGNS));
    setDivision(pick(ID_DIVISIONS));
    setNeuralTier(pick(ID_NEURAL_TIERS));
    setOriginSector(pick(ID_ORIGIN_SECTORS));
    setMotto(pick(ID_MOTTOS));
    setAccentId(pick(ACCENT_SPECTRUMS).id);
    onInteract?.();
  };

  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background obsidian gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 720);
    bgGrad.addColorStop(0, '#050814');
    bgGrad.addColorStop(0.55, '#091124');
    bgGrad.addColorStop(1, '#040710');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 720);

    // Subtle geometric grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1200; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y <= 720; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Ambient radial glow
    const radGrad = ctx.createRadialGradient(940, 160, 20, 940, 160, 460);
    radGrad.addColorStop(0, accent.glow.replace('0.45', '0.26'));
    radGrad.addColorStop(1, 'rgba(5, 8, 20, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 1200, 720);

    // Outer card border frame
    drawRoundedRect(ctx, 28, 28, 1144, 664, 28);
    ctx.strokeStyle = accent.primary;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Header band
    ctx.fillStyle = accent.primary;
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText('CYBERNEX // SYMBIOTIC CITIZEN CREDENTIAL', 72, 92);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 17px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`SERIAL ${serialCode}`, 1128, 92);
    ctx.textAlign = 'left';

    // Top divider
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(72, 118);
    ctx.lineTo(1128, 118);
    ctx.stroke();

    // Left geometric cyber emblem box
    drawRoundedRect(ctx, 72, 160, 230, 260, 20);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric emblem rings inside box
    ctx.strokeStyle = accent.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(187, 274, 62, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = accent.secondary;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(187, 274, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = accent.primary;
    ctx.beginPath();
    ctx.arc(187, 274, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FICTIONAL ID EMBLEM', 187, 392);
    ctx.textAlign = 'left';

    // Main Callsign & Role
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillText('DESIGNATION / CALLSIGN', 344, 184);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 54px "Outfit", sans-serif';
    ctx.fillText(cleanCallsign, 344, 242);

    ctx.fillStyle = accent.primary;
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${division}  ·  ${neuralTier}`, 344, 286);

    // Spec grid
    const specs = [
      { label: 'ORIGIN SECTOR', value: originSector },
      { label: 'OPTIC MODULE', value: opticName },
      { label: 'KINETIC LIMB', value: armName },
      { label: 'NEURAL LINK', value: neuralName },
    ];
    specs.forEach((s, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const sx = 344 + col * 320;
      const sy = 344 + row * 78;

      ctx.fillStyle = '#64748B';
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillText(s.label, sx, sy);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(s.value.slice(0, 28), sx, sy + 28);
    });

    // Deterministic 5x5 Matrix on bottom-right
    const mx = 1002;
    const my = 326;
    const cellSize = 20;
    const gap = 5;
    matrixCells.forEach((on, idx) => {
      const r = Math.floor(idx / 5);
      const c = idx % 5;
      ctx.fillStyle = on ? accent.primary : 'rgba(148, 163, 184, 0.16)';
      ctx.fillRect(mx + c * (cellSize + gap), my + r * (cellSize + gap), cellSize, cellSize);
    });

    // Bottom Divider & Motto
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(72, 548);
    ctx.lineTo(1128, 548);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillText('DIRECTIVE MOTTO', 72, 594);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`"${(motto.trim() || ID_MOTTOS[0]).slice(0, 68)}"`, 72, 632);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('CYBERNEX CONCEPT · BEYOND HUMAN INTELLIGENCE', 1128, 632);
    ctx.textAlign = 'left';

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${cleanCallsign.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}-cybernex-id.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      onConfirm?.();
      window.setTimeout(() => setDownloaded(false), 2400);
    }, 'image/png');
  };

  return (
    <section
      id="identity-card"
      aria-labelledby="identity-card-heading"
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
              Identity Card Generator
            </p>
            <h2
              id="identity-card-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Create your downloadable cybernetic pass.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Select fictional cybernetic traits, sync your customizer hardware build, and export a high-resolution PNG identity card generated directly inside your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSyncFromBuilder}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 transition-colors hover:border-blue-500/50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 cursor-pointer"
            >
              {syncedFromBuild ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{syncedFromBuild ? 'Synced Build' : 'Sync Customizer'}</span>
            </button>

            <button
              type="button"
              onClick={handleRandomizePersona}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 transition-colors hover:border-blue-500/50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Random Persona</span>
            </button>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left: Trait Configuration Form (No sensitive info) */}
          <div className="glass-surface rounded-2xl border border-slate-200 p-5 sm:p-7 lg:col-span-5 dark:border-slate-800/90">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="id-callsign-input"
                  className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                >
                  Fictional Callsign
                </label>
                <input
                  id="id-callsign-input"
                  type="text"
                  maxLength={22}
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="e.g. AETHER-09"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-slate-900 uppercase focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#050812]/90 dark:text-white dark:focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="id-division-select"
                  className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                >
                  Research Division
                </label>
                <select
                  id="id-division-select"
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    onInteract?.();
                  }}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#050812]/90 dark:text-white"
                >
                  {ID_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="id-tier-select"
                  className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                >
                  Neural Classification
                </label>
                <select
                  id="id-tier-select"
                  value={neuralTier}
                  onChange={(e) => {
                    setNeuralTier(e.target.value);
                    onInteract?.();
                  }}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#050812]/90 dark:text-white"
                >
                  {ID_NEURAL_TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="id-sector-select"
                  className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                >
                  Fictional Origin Sector
                </label>
                <select
                  id="id-sector-select"
                  value={originSector}
                  onChange={(e) => {
                    setOriginSector(e.target.value);
                    onInteract?.();
                  }}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#050812]/90 dark:text-white"
                >
                  {ID_ORIGIN_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="id-motto-input"
                  className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                >
                  Directive Motto
                </label>
                <input
                  id="id-motto-input"
                  type="text"
                  maxLength={68}
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#050812]/90 dark:text-white"
                />
              </div>

              <div>
                <span className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300">
                  Card Spectrum
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {ACCENT_SPECTRUMS.map((spec) => {
                    const active = spec.id === accentId;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setAccentId(spec.id);
                          onInteract?.();
                        }}
                        className={`flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-blue-600 bg-blue-50 text-slate-900 dark:border-cyan-400/60 dark:bg-slate-900 dark:text-white'
                            : 'border-slate-200 bg-white/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: spec.primary }}
                          aria-hidden="true"
                        />
                        <span>{spec.label.split(' ')[1] || spec.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleDownloadCard}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Identity Card Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Download PNG Identity Card</span>
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-cyan-300" aria-hidden="true" />
                <span>
                  Fictional generator only—no sensitive personal information is collected or sent to any server.
                </span>
              </p>
            </div>
          </div>

          {/* Right: Live Futuristic Card Preview */}
          <div className="lg:col-span-7">
            <div
              className="relative overflow-hidden rounded-2xl border bg-[#060A16] p-6 text-white shadow-2xl sm:p-8"
              style={{ borderColor: accent.primary }}
            >
              {/* Background grid & accent aura */}
              <div
                aria-hidden="true"
                className="cyber-grid-bg pointer-events-none absolute inset-0 opacity-60"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl"
                style={{ backgroundColor: accent.glow.replace('0.45', '0.24') }}
              />

              {/* Top Card Header */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <span
                  className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase"
                  style={{ color: accent.primary }}
                >
                  CYBERNEX // SYMBIOTIC CREDENTIAL
                </span>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {serialCode}
                </span>
              </div>

              {/* Card Body */}
              <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 sm:grid-cols-12">
                {/* Emblem Box */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#090F20]/90 p-5 sm:col-span-4">
                  <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke={accent.primary}
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="33"
                      fill="none"
                      stroke={accent.secondary}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <circle cx="60" cy="60" r="12" fill={accent.primary} />
                  </svg>
                  <span className="mt-3 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                    Verified Fiction ID
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between sm:col-span-8">
                  <div>
                    <span className="font-mono text-[11px] text-slate-400 uppercase">
                      Designation
                    </span>
                    <h3 className="mt-0.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {cleanCallsign}
                    </h3>
                    <p
                      className="mt-1 text-sm font-medium"
                      style={{ color: accent.primary }}
                    >
                      {division} · {neuralTier}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-2">
                    <div>
                      <span className="block font-mono text-[10px] text-slate-400 uppercase">
                        Origin Sector
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-100">
                        {originSector}
                      </span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] text-slate-400 uppercase">
                        Equipped Optics
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-100">
                        {opticName}
                      </span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] text-slate-400 uppercase">
                        Kinetic Arms
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-100">
                        {armName}
                      </span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] text-slate-400 uppercase">
                        Neural Bridge
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-100">
                        {neuralName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Strip with Deterministic Verification Grid */}
              <div className="relative z-10 mt-6 flex flex-col justify-between gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-end">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">
                    Directive Motto
                  </span>
                  <p className="mt-1 text-sm text-slate-100">
                    &ldquo;{motto.trim() || ID_MOTTOS[0]}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-end">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 uppercase">
                    <Cpu className="h-3.5 w-3.5" style={{ color: accent.primary }} aria-hidden="true" />
                    <span>Matrix</span>
                  </div>
                  <div
                    className="grid grid-cols-5 gap-1 rounded-md border border-slate-800 bg-[#040710] p-1.5"
                    aria-hidden="true"
                  >
                    {matrixCells.map((on, i) => (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-[2px]"
                        style={{
                          backgroundColor: on
                            ? accent.primary
                            : 'rgba(148, 163, 184, 0.16)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
