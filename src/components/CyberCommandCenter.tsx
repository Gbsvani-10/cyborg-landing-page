import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { CornerDownLeft, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import {
  ARM_OPTIONS,
  NEURAL_OPTIONS,
  OPTIC_OPTIONS,
  TORSO_OPTIONS,
  type CyborgBuildConfig,
} from '../data/experiencesData';

interface CyberCommandCenterProps {
  build: CyborgBuildConfig;
  theme: 'dark' | 'light';
  onToggleTheme: (next?: 'dark' | 'light') => void;
  onNavigate: (sectionId: string) => void;
  onInteract?: () => void;
  onConfirm?: () => void;
}

interface TerminalLine {
  id: string;
  kind: 'input' | 'output' | 'accent' | 'error';
  text: string;
}

const QUICK_COMMANDS = ['help', 'status', 'systems', 'neural', 'timeline', 'clear'];

const INITIAL_LINES: TerminalLine[] = [
  {
    id: 'boot-1',
    kind: 'accent',
    text: 'CYBERNEX Command Console · Simulated Diagnostic Interface',
  },
  {
    id: 'boot-2',
    kind: 'output',
    text: 'Type "help" or click any command shortcut below to inspect simulated subsystems, neural topology, or navigate sections.',
  },
];

export function CyberCommandCenter({
  build,
  theme,
  onToggleTheme,
  onNavigate,
  onInteract,
  onConfirm,
}: CyberCommandCenterProps) {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const appendLines = (newEntries: Omit<TerminalLine, 'id'>[]) => {
    const stamp = Date.now();
    setLines((prev) => [
      ...prev,
      ...newEntries.map((entry, idx) => ({
        ...entry,
        id: `term-${stamp}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      })),
    ]);
  };

  const executeCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    setHistory((prev) => [trimmed, ...prev.slice(0, 24)]);
    setHistoryIdx(-1);

    if (cmd === 'clear') {
      setLines([
        {
          id: `cleared-${Date.now()}`,
          kind: 'accent',
          text: 'Console buffer cleared. Type "help" for available commands.',
        },
      ]);
      onInteract?.();
      return;
    }

    const entries: Omit<TerminalLine, 'id'>[] = [
      { kind: 'input', text: `cybernex@console:~$ ${trimmed}` },
    ];

    if (cmd === 'help') {
      entries.push(
        { kind: 'accent', text: 'Available Commands:' },
        { kind: 'output', text: '  help              List supported commands and syntax' },
        { kind: 'output', text: '  status            Show simulated system telemetry & live session info' },
        { kind: 'output', text: '  systems           Inspect core CYBERNEX architecture modules' },
        { kind: 'output', text: '  neural            Inspect simulated 4-layer neural bus topology' },
        { kind: 'output', text: '  customizer        Display your active Cyborg Customizer loadout' },
        { kind: 'output', text: '  timeline          Summarize major historical AI & robotics milestones' },
        { kind: 'output', text: '  theme [dark|light] Switch site display theme' },
        { kind: 'output', text: '  goto <section>    Scroll to: customizer, neural-explorer, showcase-3d, timeline, identity-card, ai-studio' },
        { kind: 'output', text: '  clear             Reset terminal output buffer' }
      );
    } else if (cmd === 'status') {
      const vp =
        typeof window !== 'undefined'
          ? `${window.innerWidth}x${window.innerHeight}`
          : '1440x900';
      const nowTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      entries.push(
        { kind: 'accent', text: '[Simulated Subsystem Envelope + Live Browser State]' },
        { kind: 'output', text: `  Session Theme     : ${theme.toUpperCase()} MODE` },
        { kind: 'output', text: `  Viewport Matrix   : ${vp} px · Local Time ${nowTime}` },
        { kind: 'output', text: '  Optical Bridge    : Calibrated (Simulated · Local-only isolation)' },
        { kind: 'output', text: '  Thermal Loop      : Nominal Envelope (Simulated)' },
        { kind: 'output', text: '  Human Override    : Engaged (Manual hardware decoupling ready)' }
      );
    } else if (cmd === 'systems') {
      entries.push(
        { kind: 'accent', text: 'CYBERNEX Four-Pillar Architecture:' },
        { kind: 'output', text: '  [01] Artificial Intelligence  — Edge-first co-reasoning & contextual synthesis' },
        { kind: 'output', text: '  [02] Neural Interfaces        — Non-invasive bio-optical signal translation' },
        { kind: 'output', text: '  [03] Robotic Engineering      — Tendon-driven carbon-titanium actuation' },
        { kind: 'output', text: '  [04] Human Augmentation       — Ergonomic load-sharing & sensory cues' }
      );
    } else if (cmd === 'neural') {
      entries.push(
        { kind: 'accent', text: 'Simulated Neural Bus Topology (4 Layers / 11 Nodes):' },
        { kind: 'output', text: '  L0 Input (3)    : Optical Edge -> Myoelectric Intent -> Tactile Pressure' },
        { kind: 'output', text: '  L1 Feature (3)  : Signal Correlation -> Spatial Geometry -> Temporal Cadence' },
        { kind: 'output', text: '  L2 Context (3)  : Intent Hub -> Boundary Gatekeeper -> Kinematics Router' },
        { kind: 'output', text: '  L3 Output (2)   : Cognitive HUD Cue | Actuator Torque Command' },
        { kind: 'output', text: '  Tip: Run "goto neural-explorer" to click individual nodes.' }
      );
    } else if (cmd === 'customizer') {
      const optic = OPTIC_OPTIONS.find((o) => o.id === build.optics)?.name ?? build.optics;
      const arm = ARM_OPTIONS.find((a) => a.id === build.arms)?.name ?? build.arms;
      const neural = NEURAL_OPTIONS.find((n) => n.id === build.neural)?.name ?? build.neural;
      const torso = TORSO_OPTIONS.find((t) => t.id === build.torso)?.name ?? build.torso;
      entries.push(
        { kind: 'accent', text: 'Active Cyborg Customizer Loadout:' },
        { kind: 'output', text: `  Optics  : ${optic}` },
        { kind: 'output', text: `  Arms    : ${arm}` },
        { kind: 'output', text: `  Neural  : ${neural}` },
        { kind: 'output', text: `  Torso   : ${torso}` },
        { kind: 'output', text: `  Finish  : ${build.chassis.toUpperCase()} / Accent: ${build.accent.toUpperCase()}` }
      );
    } else if (cmd === 'timeline') {
      entries.push(
        { kind: 'accent', text: 'Historical Robotics & AI Milestones:' },
        { kind: 'output', text: '  1950 · Alan Turing proposes the Turing Test' },
        { kind: 'output', text: '  1961 · Unimate #001 programmable arm enters GM factory service' },
        { kind: 'output', text: '  1968 · Douglas Engelbart unveils modern HMI in "Mother of All Demos"' },
        { kind: 'output', text: '  1973 · Jacques Vidal coins Brain-Computer Interface (BCI)' },
        { kind: 'output', text: '  2006 · BrainGate clinical neural array controls robotic arm' },
        { kind: 'output', text: '  2017 · Transformer architecture reshapes sequence & multimodal AI' },
        { kind: 'output', text: '  Tip: Run "goto timeline" to explore all 13 interactive milestones.' }
      );
    } else if (cmd === 'theme') {
      if (arg === 'dark' || arg === 'light') {
        onToggleTheme(arg);
        entries.push({
          kind: 'accent',
          text: `Display theme switched to ${arg} mode.`,
        });
      } else {
        const next = theme === 'dark' ? 'light' : 'dark';
        onToggleTheme(next);
        entries.push({
          kind: 'accent',
          text: `Display theme toggled to ${next} mode.`,
        });
      }
    } else if (cmd === 'goto') {
      const targetMap: Record<string, string> = {
        home: 'home',
        technology: 'technology',
        showcase: 'showcase-3d',
        '3d': 'showcase-3d',
        'showcase-3d': 'showcase-3d',
        customizer: 'customizer',
        neural: 'neural-explorer',
        'neural-explorer': 'neural-explorer',
        timeline: 'timeline',
        'id-card': 'identity-card',
        'identity-card': 'identity-card',
        'ai-studio': 'ai-studio',
        innovations: 'innovations',
        about: 'about',
        contact: 'contact',
      };
      const resolved = targetMap[arg];
      if (resolved) {
        onNavigate(resolved);
        entries.push({
          kind: 'accent',
          text: `Navigating smoothly to #${resolved}...`,
        });
      } else {
        entries.push({
          kind: 'error',
          text: `Unknown section "${arg || '(empty)'}". Try: customizer, neural-explorer, showcase-3d, timeline, identity-card, ai-studio.`,
        });
      }
    } else {
      entries.push({
        kind: 'error',
        text: `Command not recognized: "${trimmed}". Type "help" for available commands.`,
      });
    }

    appendLines(entries);
    onConfirm?.();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeCommand(commandInput);
    setCommandInput('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      const nextIdx = Math.min(history.length - 1, historyIdx + 1);
      setHistoryIdx(nextIdx);
      setCommandInput(history[nextIdx]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIdx <= 0) {
        setHistoryIdx(-1);
        setCommandInput('');
      } else {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setCommandInput(history[nextIdx]);
      }
    } else if (event.key === 'Tab') {
      const current = commandInput.trim().toLowerCase();
      if (!current) return;
      const allCmds = ['help', 'status', 'systems', 'neural', 'customizer', 'timeline', 'theme', 'goto', 'clear'];
      const match = allCmds.find((c) => c.startsWith(current));
      if (match) {
        event.preventDefault();
        setCommandInput(match);
      }
    }
  };

  return (
    <section
      id="command-center"
      aria-labelledby="command-center-heading"
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
              Cyber Command Center
            </p>
            <h2
              id="command-center-heading"
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Query architecture telemetry directly from the console.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Execute commands to inspect simulated subsystem telemetry, query your active cyborg build, toggle display themes, or jump between labs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  executeCommand(cmd);
                  inputRef.current?.focus();
                }}
                className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-700 transition-colors hover:border-blue-500/50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-cyan-200 dark:hover:border-cyan-400/60 cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Terminal Window */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-300 bg-[#070B16] text-slate-100 shadow-2xl dark:border-slate-800">
          {/* Terminal Top Chrome */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0A1020] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <TerminalIcon className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <span className="font-mono text-xs text-slate-300">
                cybernex-shell · simulated diagnostics
              </span>
            </div>
            <button
              type="button"
              onClick={() => executeCommand('clear')}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white cursor-pointer"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>

          {/* Scrollable Log Output */}
          <div
            ref={outputRef}
            onClick={() => {
              if (!window.getSelection()?.toString()) {
                inputRef.current?.focus();
              }
            }}
            role="log"
            aria-live="polite"
            aria-label="Cyber Command Center output log"
            className="h-72 space-y-1.5 overflow-y-auto p-4 font-mono text-xs leading-relaxed sm:h-80 sm:p-6 sm:text-[13px]"
          >
            {lines.map((line) => (
              <div
                key={line.id}
                className={`whitespace-pre-wrap break-words ${
                  line.kind === 'input'
                    ? 'pt-1 text-cyan-300 font-semibold'
                    : line.kind === 'accent'
                    ? 'text-violet-300 font-medium'
                    : line.kind === 'error'
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {line.text}
              </div>
            ))}
          </div>

          {/* Command Prompt Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-800 bg-[#050812] px-4 py-3 sm:px-6"
          >
            <span className="shrink-0 font-mono text-xs font-semibold text-cyan-400 sm:text-sm">
              $
            </span>
            <label htmlFor="cyber-terminal-input" className="sr-only">
              Enter terminal command
            </label>
            <input
              ref={inputRef}
              id="cyber-terminal-input"
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
              placeholder='Enter command (e.g. "help", "status", "systems", "neural", "goto 3d")...'
              className="min-h-[40px] flex-1 bg-transparent font-mono text-xs text-white placeholder-slate-500 focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-blue-600/25 px-3.5 py-1.5 font-mono text-xs font-medium text-cyan-200 transition-colors hover:bg-blue-600/40 cursor-pointer"
            >
              <span>Run</span>
              <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
