import { useRef, type PointerEvent } from 'react';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { HERO_IMAGE } from '../data/cybernexData';
import { SmartImage } from './SmartImage';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const scrollImageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const scrollImageScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.11]);
  const scrollRingY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const scrollForegroundY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 24 });

  const backLayerX = useTransform(smoothX, [-0.5, 0.5], [14, -14]);
  const midLayerX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const midLayerY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const auraX = useTransform(smoothX, [-0.5, 0.5], [-24, 24]);
  const auraY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(nx);
    pointerY.set(ny);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#05070D] pt-20 pb-12 text-white sm:pb-16 md:items-center lg:pt-24 lg:pb-20"
    >
      {/* Depth Layer 1: Distant Volumetric Atmospheric Aura & Orbital Depth Geometry */}
      <motion.div
        aria-hidden="true"
        style={
          prefersReducedMotion
            ? undefined
            : { x: backLayerX, y: scrollRingY }
        }
        className="pointer-events-none absolute inset-0 z-0 flex items-start justify-center pt-14 md:items-center md:justify-end md:pt-0 md:pr-[8%]"
      >
        <div className="relative h-[340px] w-[340px] sm:h-[520px] sm:w-[520px] lg:h-[780px] lg:w-[780px]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16)_0%,rgba(139,92,246,0.11)_42%,transparent_70%)] blur-2xl" />
          <svg
            viewBox="0 0 600 600"
            className="h-full w-full opacity-35"
            fill="none"
          >
            <circle
              cx="300"
              cy="300"
              r="268"
              stroke="url(#hero-depth-ring)"
              strokeWidth="0.75"
              strokeDasharray="6 10"
            />
            <circle
              cx="300"
              cy="300"
              r="210"
              stroke="rgba(56, 189, 248, 0.28)"
              strokeWidth="0.75"
            />
            <circle
              cx="300"
              cy="300"
              r="148"
              stroke="rgba(139, 92, 246, 0.24)"
              strokeWidth="0.75"
              strokeDasharray="2 8"
            />
            <defs>
              <linearGradient id="hero-depth-ring" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Depth Layer 2: Large Cinematic Cyborg Character with Responsive Framing */}
      <motion.div
        style={
          prefersReducedMotion
            ? undefined
            : {
                y: scrollImageY,
                scale: scrollImageScale,
              }
        }
        className="pointer-events-none absolute inset-[-2%] z-[1] will-change-transform"
      >
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : {
                  x: midLayerX,
                  y: midLayerY,
                }
          }
          className="h-full w-full will-change-transform"
        >
          <SmartImage
            src={HERO_IMAGE}
            alt="Cinematic futuristic cyborg hybrid character standing inside an illuminated obsidian chamber"
            fallbackTitle="CYBERNEX Cyborg Architecture"
            aspectClassName="h-full w-full"
            className="h-full w-full object-cover object-[76%_12%] sm:object-[74%_14%] md:object-[78%_16%] opacity-95"
          />
        </motion.div>
      </motion.div>

      {/* Depth Layer 3: Dynamic Rim Lighting & Responsive Contrast Scrims */}
      <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
        <motion.div
          style={prefersReducedMotion ? undefined : { x: auraX, y: auraY }}
          className="absolute top-[12%] right-[12%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),rgba(139,92,246,0.09)_50%,transparent_75%)] blur-3xl sm:h-[420px] sm:w-[420px]"
        />

        {/* Mobile bottom-heavy vertical scrim so cyborg head/shoulders shine cleanly above copy */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/80 via-45% to-[#05070D]/35 md:hidden" />

        {/* Desktop directional left-side scrim */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#05070D] via-[#05070D]/72 to-transparent" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-[#05070D]/65" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(5,7,13,0.72)_100%)]" />
        <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
      </div>

      {/* Depth Layer 4: Foreground Editorial Typography & Primary CTAs */}
      <motion.div
        style={prefersReducedMotion ? undefined : { y: scrollForegroundY }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-[30vh] sm:px-6 md:pt-0 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.18em] text-cyan-300/95 uppercase sm:mb-5 sm:text-xs">
            CYBERNEX · Beyond Human Intelligence
          </p>

          <h1
            className="font-display text-[2.15rem] leading-[1.08] font-semibold tracking-tight text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.7)] sm:text-5xl lg:text-[3.85rem] lg:leading-[1.05]"
            style={{ textWrap: 'balance' }}
          >
            THE FUTURE IS NO LONGER HUMAN.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200/95 sm:mt-6 sm:text-lg lg:text-xl">
            Where artificial intelligence meets human evolution.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={() => onNavigate('innovations')}
              className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase whitespace-nowrap shrink-0 shadow-[0_0_32px_-6px_rgba(56,189,248,0.65)] transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_0_40px_-4px_rgba(34,211,238,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:w-auto cursor-pointer"
            >
              <span>EXPLORE THE FUTURE</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('technology')}
              className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-slate-700/90 bg-slate-950/70 px-6 py-3 text-xs font-semibold tracking-wider text-slate-100 uppercase whitespace-nowrap shrink-0 backdrop-blur-md transition-all duration-200 hover:border-cyan-400/60 hover:bg-slate-900/85 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-auto cursor-pointer"
            >
              <span>DISCOVER TECHNOLOGY</span>
              <ArrowDownRight
                className="h-4 w-4 text-cyan-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="mt-10 border-t border-slate-800/80 pt-5 sm:mt-14 sm:pt-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 sm:gap-x-5">
              <span className="font-medium text-slate-200">Four Research Pillars</span>
              <span aria-hidden="true" className="text-slate-600">
                /
              </span>
              <span>Artificial Intelligence</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>Neural Interfaces</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>Robotic Engineering</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>Human Augmentation</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
