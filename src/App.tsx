import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AboutSection } from './components/AboutSection';
import { AiStudioSection } from './components/AiStudioSection';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { ConceptAssistant } from './components/ConceptAssistant';
import { ContactSection } from './components/ContactSection';
import { CyberCommandCenter } from './components/CyberCommandCenter';
import { CyborgCustomizerSection } from './components/CyborgCustomizerSection';
import { DesktopCursorAura } from './components/DesktopCursorAura';
import { EvolutionTimelineSection } from './components/EvolutionTimelineSection';
import { FloatingUtilityDock } from './components/FloatingUtilityDock';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { HumanVsMachineSection } from './components/HumanVsMachineSection';
import { IdentityCardGeneratorSection } from './components/IdentityCardGeneratorSection';
import { InnovationsSection } from './components/InnovationsSection';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { NeuralExplorerSection } from './components/NeuralExplorerSection';
import { NewsletterSection } from './components/NewsletterSection';
import { RoboticShowcase3D } from './components/RoboticShowcase3D';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { TechnologyDashboard } from './components/TechnologyDashboard';
import { TechnologySection } from './components/TechnologySection';
import { NAV_LINKS } from './data/cybernexData';
import {
  DEFAULT_CYBORG_BUILD,
  type CyborgBuildConfig,
} from './data/experiencesData';
import { playSoftCue } from './utils/soundEffects';

const INTERACTIVE_LAB_LINKS = [
  { id: 'showcase-3d', label: '3D Robotic Arm' },
  { id: 'customizer', label: 'Cyborg Customizer' },
  { id: 'neural-explorer', label: 'Neural Explorer' },
  { id: 'command-center', label: 'Command Center' },
  { id: 'timeline', label: 'Evolution Timeline' },
  { id: 'identity-card', label: 'Identity Card' },
  { id: 'ai-studio', label: 'Multimodal AI Lab' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem('cybernex-theme');
    return stored === 'light' ? 'light' : 'dark';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [chatPrefill, setChatPrefill] = useState<string | null>(null);
  const [cyborgBuild, setCyborgBuild] =
    useState<CyborgBuildConfig>(DEFAULT_CYBORG_BUILD);
  const [idCardSyncCounter, setIdCardSyncCounter] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('cybernex-theme', theme);
    } catch {
      // Ignore storage failures
    }
  }, [theme]);

  const handleTapCue = useCallback(() => {
    playSoftCue(soundEnabled, 'tap');
  }, [soundEnabled]);

  const handleConfirmCue = useCallback(() => {
    playSoftCue(soundEnabled, 'confirm');
  }, [soundEnabled]);

  const handleToggleTheme = useCallback(
    (explicitTheme?: 'dark' | 'light') => {
      setTheme((prev) => explicitTheme ?? (prev === 'dark' ? 'light' : 'dark'));
      playSoftCue(soundEnabled, 'toggle');
    },
    [soundEnabled]
  );

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        playSoftCue(true, 'toggle');
      }
      return next;
    });
  }, []);

  const handleSendTranscriptToChat = useCallback(
    (transcript: string) => {
      setChatPrefill(transcript);
      setAssistantOpen(true);
      playSoftCue(soundEnabled, 'toggle');
    },
    [soundEnabled]
  );

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      setActiveSection(sectionId);
      playSoftCue(soundEnabled, 'tap');
    },
    [soundEnabled]
  );

  const handleSyncToIdCard = useCallback(() => {
    setIdCardSyncCounter((c) => c + 1);
    scrollToSection('identity-card');
  }, [scrollToSection]);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.15, 0.4, 0.65],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#05070D] dark:text-slate-100">
        <LoadingScreen />
        <DesktopCursorAura />
        <ScrollProgressBar />
        <AmbientBackdrop />
        <Navbar activeSection={activeSection} onNavigate={scrollToSection} />
        <main>
          <HeroSection onNavigate={scrollToSection} />

          {/* Interactive Experiences Directory Strip */}
          <div className="relative z-10 border-b border-slate-200/80 bg-white/75 backdrop-blur-md dark:border-slate-900 dark:bg-[#060914]/90">
            <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
              <span className="mr-2 shrink-0 font-mono text-[11px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Interactive Labs:
              </span>
              {INTERACTIVE_LAB_LINKS.map((lab) => (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => scrollToSection(lab.id)}
                  className="min-h-[36px] shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 whitespace-nowrap transition-colors hover:border-blue-500/50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-cyan-400/50 dark:hover:text-cyan-200 cursor-pointer"
                >
                  {lab.label}
                </button>
              ))}
            </div>
          </div>

          <TechnologySection onInteract={handleTapCue} />
          <HumanVsMachineSection onInteract={handleTapCue} />
          <TechnologyDashboard onInteract={handleTapCue} />
          <RoboticShowcase3D onInteract={handleTapCue} />
          <CyborgCustomizerSection
            build={cyborgBuild}
            onChangeBuild={setCyborgBuild}
            onSyncToIdCard={handleSyncToIdCard}
            onInteract={handleTapCue}
            onConfirm={handleConfirmCue}
          />
          <NeuralExplorerSection
            onInteract={handleTapCue}
            onConfirm={handleConfirmCue}
          />
          <CyberCommandCenter
            build={cyborgBuild}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onNavigate={scrollToSection}
            onInteract={handleTapCue}
            onConfirm={handleConfirmCue}
          />
          <AiStudioSection
            onInteract={handleTapCue}
            onConfirm={handleConfirmCue}
            onSendTranscriptToChat={handleSendTranscriptToChat}
          />
          <AboutSection />
          <EvolutionTimelineSection onInteract={handleTapCue} />
          <InnovationsSection onInteract={handleTapCue} />
          <IdentityCardGeneratorSection
            build={cyborgBuild}
            syncCounter={idCardSyncCounter}
            onInteract={handleTapCue}
            onConfirm={handleConfirmCue}
          />
          <ContactSection onInteract={handleTapCue} onConfirm={handleConfirmCue} />
          <NewsletterSection onConfirm={handleConfirmCue} />
        </main>
        <Footer onNavigate={scrollToSection} />
        <ConceptAssistant
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          onInteract={handleTapCue}
          prefillText={chatPrefill}
          onConsumePrefill={() => setChatPrefill(null)}
        />
        <FloatingUtilityDock
          theme={theme}
          onToggleTheme={() => handleToggleTheme()}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          assistantOpen={assistantOpen}
          onToggleAssistant={() => {
            setAssistantOpen((prev) => !prev);
            playSoftCue(soundEnabled, 'toggle');
          }}
        />
      </div>
    </MotionConfig>
  );
}
