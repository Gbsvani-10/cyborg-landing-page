export interface NavLinkItem {
  label: string;
  href: string;
  id: string;
}

export interface TechnologyDomain {
  id: string;
  index: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl?: string;
  imageAlt: string;
  accentHue: 'blue' | 'violet' | 'cyan';
  architectureFocus: string;
  designPrinciples: string[];
  conceptNotes: string;
}

export interface InnovationModule {
  id: string;
  index: string;
  label: string;
  title: string;
  subtitle: string;
  summary: string;
  highlights: string[];
}

export interface ConceptMetric {
  id: string;
  target: number;
  suffix: string;
  prefix?: string;
  label: string;
  context: string;
}

export interface ComparisonDimension {
  id: string;
  dimension: string;
  human: string;
  machine: string;
  symbiosis: string;
}

export interface AssistantTopic {
  id: string;
  question: string;
  category: string;
  answer: string;
  followUpIds: string[];
}

export interface DashboardMode {
  id: 'baseline' | 'cognitive' | 'kinetic';
  label: string;
  summary: string;
  simulatedStats: {
    activeNodes: number;
    throughputIndex: number;
    coherenceScore: number;
    thermalLoad: number;
  };
  subsystems: {
    id: string;
    name: string;
    role: string;
    state: 'Active' | 'Calibrated' | 'Standby';
    load: number;
  }[];
}

export const HERO_IMAGE = '/src/assets/images/hero_cinematic_cyborg_1795325317693.jpg';
export const ABOUT_IMAGE = '/src/assets/images/about_symbiosis_atelier_1795325122339.jpg';
export const INNOVATION_IMAGE = '/src/assets/images/innovation_augmentation_core_1795325121712.jpg';
export const HUMAN_COMPARE_IMAGE = '/src/assets/images/compare_human_intelligence_1795325952809.jpg';
export const MACHINE_COMPARE_IMAGE = '/src/assets/images/compare_machine_aligned_1795325968364.jpg';

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'Technology', href: '#technology', id: 'technology' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Innovations', href: '#innovations', id: 'innovations' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export const TECHNOLOGY_DOMAINS: TechnologyDomain[] = [
  {
    id: 'artificial-intelligence',
    index: '01.',
    category: 'Cognitive Architecture',
    title: 'Artificial Intelligence',
    tagline: 'Context-aware reasoning designed to complement human judgment.',
    description:
      'Adaptive cognitive frameworks engineered to interpret complex environments in real time, filtering noise into clear spatial and analytical cues without overriding human agency.',
    imageAlt: 'Conceptual adaptive neural topology mesh',
    accentHue: 'blue',
    architectureFocus: 'Co-Reasoning & Situational Synthesis',
    designPrinciples: [
      'Intent-aligned inference that prioritizes human oversight at every decision node',
      'Low-power edge processing for responsive, private environmental awareness',
      'Continuous contextual adaptation calibrated to individual cognitive rhythms',
    ],
    conceptNotes:
      'Designed as an intuitive cognitive partner rather than an autonomous replacement.',
  },
  {
    id: 'neural-interfaces',
    index: '02.',
    category: 'Bio-Signal Bridge',
    title: 'Neural Interfaces',
    tagline: 'Seamless bidirectional communication between mind and machine.',
    description:
      'Precision bio-optical transducers and refined signal decoding architectures envisioned to translate subtle neural intent into fluid digital and mechanical control.',
    imageUrl: '/src/assets/images/tech_neural_interface_1795325122476.jpg',
    imageAlt: 'Futuristic sleek obsidian and sapphire neural interface bridge hardware',
    accentHue: 'violet',
    architectureFocus: 'Non-Invasive Optical & Bio-Signal Coupling',
    designPrinciples: [
      'Biocompatible materials engineered for prolonged ergonomic comfort',
      'Adaptive noise filtering to isolate intentional motor and cognitive signals',
      'Encrypted local signal pathways safeguarding neural privacy by design',
    ],
    conceptNotes:
      'Focuses on effortless fluency between biological thought and digital interfaces.',
  },
  {
    id: 'robotic-engineering',
    index: '03.',
    category: 'Precision Mechatronics',
    title: 'Robotic Engineering',
    tagline: 'Bio-inspired articulation built with aerospace-grade materials.',
    description:
      'Carbon-composite structures and micro-actuated joints crafted to mirror natural anatomical fluidity, restoring and extending physical dexterity with silent precision.',
    imageUrl: '/src/assets/images/tech_robotic_engineering_1795325122299.jpg',
    imageAlt: 'Articulated matte carbon and brushed titanium cybernetic robotic hand',
    accentHue: 'cyan',
    architectureFocus: 'Articulated Tactile Actuation',
    designPrinciples: [
      'Multi-axis tendon-driven kinematics for natural, balanced grip modulation',
      'Distributed pressure sensing providing responsive tactile feedback',
      'Modular titanium-carbon chassis built for durability and field serviceability',
    ],
    conceptNotes:
      'Bridges industrial robotics with the nuanced ergonomics of human anatomy.',
  },
  {
    id: 'human-augmentation',
    index: '04.',
    category: 'Symbiotic Evolution',
    title: 'Human Augmentation',
    tagline: 'Extending sensory perception and physical resilience harmoniously.',
    description:
      'Integrated wearable exo-structures and sensory-expansion systems designed to reduce physical strain and expand human capability in demanding environments.',
    imageAlt: 'Kinetic human augmentation framework schematic',
    accentHue: 'blue',
    architectureFocus: 'Sensory Expansion & Kinetic Support',
    designPrinciples: [
      'Featherweight load-sharing frames that move transparently with posture',
      'Haptic and visual cues translating thermal, acoustic, and spatial telemetry',
      'Failsafe mechanical decoupling ensuring natural movement at all times',
    ],
    conceptNotes:
      'Built to elevate human resilience while preserving natural bodily expression.',
  },
];

export const HUMAN_VS_MACHINE_DIMENSIONS: ComparisonDimension[] = [
  {
    id: 'reasoning',
    dimension: 'Reasoning Style',
    human: 'Contextual intuition, empathy, and moral discernment across novel situations.',
    machine: 'High-throughput pattern recognition and deterministic parallel calculation.',
    symbiosis: 'Co-reasoning loops pairing human values with rapid analytical synthesis.',
  },
  {
    id: 'perception',
    dimension: 'Sensory Bandwidth',
    human: 'Rich multi-sensory narrative grounded in lived spatial experience.',
    machine: 'Wide-spectrum optical, thermal, and acoustic signal telemetry.',
    symbiosis: 'Calm, filtered sensory translation surfaced only when relevant.',
  },
  {
    id: 'endurance',
    dimension: 'Physical & Focus Endurance',
    human: 'Creative leaps tempered by biological fatigue and cognitive load limits.',
    machine: 'Sustained repeatability and micro-precision actuator stability.',
    symbiosis: 'Assistive kinetic support that preserves natural human ergonomics.',
  },
  {
    id: 'agency',
    dimension: 'Governance & Intent',
    human: 'Conscious authorship, curiosity, and purposeful long-term direction.',
    machine: 'Rule-bound execution requiring transparent human constraints.',
    symbiosis: 'Local-first privacy and reversible override controls at every layer.',
  },
];

export const DASHBOARD_MODES: DashboardMode[] = [
  {
    id: 'baseline',
    label: 'Idle Baseline',
    summary:
      'Simulated standby state showing balanced low-power neural monitoring and passive kinetic alignment.',
    simulatedStats: {
      activeNodes: 12,
      throughputIndex: 38,
      coherenceScore: 94,
      thermalLoad: 24,
    },
    subsystems: [
      { id: 'opt', name: 'Optical Neural Bridge', role: 'Passive signal listening', state: 'Calibrated', load: 22 },
      { id: 'cog', name: 'Edge Inference Core', role: 'Ambient context model', state: 'Active', load: 34 },
      { id: 'kin', name: 'Kinetic Joint Loop', role: 'Zero-resistance freewheel', state: 'Standby', load: 12 },
      { id: 'sec', name: 'Local Vault Enclave', role: 'On-device signal isolation', state: 'Active', load: 41 },
    ],
  },
  {
    id: 'cognitive',
    label: 'Cognitive Assist',
    summary:
      'Simulated co-reasoning profile prioritizing rapid semantic synthesis and quiet attentional filtering.',
    simulatedStats: {
      activeNodes: 20,
      throughputIndex: 76,
      coherenceScore: 98,
      thermalLoad: 42,
    },
    subsystems: [
      { id: 'opt', name: 'Optical Neural Bridge', role: 'Bidirectional intent decode', state: 'Active', load: 68 },
      { id: 'cog', name: 'Edge Inference Core', role: 'Multi-modal synthesis', state: 'Active', load: 82 },
      { id: 'kin', name: 'Kinetic Joint Loop', role: 'Micro-stabilization ready', state: 'Calibrated', load: 28 },
      { id: 'sec', name: 'Local Vault Enclave', role: 'Zero-egress encryption', state: 'Active', load: 54 },
    ],
  },
  {
    id: 'kinetic',
    label: 'Kinetic Sync',
    summary:
      'Simulated full-motion bio-mechanical profile synchronizing motor intention with precision robotic actuators.',
    simulatedStats: {
      activeNodes: 24,
      throughputIndex: 88,
      coherenceScore: 96,
      thermalLoad: 56,
    },
    subsystems: [
      { id: 'opt', name: 'Optical Neural Bridge', role: 'Low-jitter motor routing', state: 'Active', load: 79 },
      { id: 'cog', name: 'Edge Inference Core', role: 'Predictive gait & grip', state: 'Active', load: 64 },
      { id: 'kin', name: 'Kinetic Joint Loop', role: 'Tactile force feedback', state: 'Active', load: 86 },
      { id: 'sec', name: 'Local Vault Enclave', role: 'Safety torque boundaries', state: 'Calibrated', load: 49 },
    ],
  },
];

export const ASSISTANT_TOPICS: AssistantTopic[] = [
  {
    id: 'vision',
    question: 'What is the core vision of CYBERNEX?',
    category: 'Vision',
    answer:
      'CYBERNEX is a futuristic technology concept exploring harmonious human-machine symbiosis. Instead of treating AI and robotics as replacements for people, every layer is designed to amplify human perception, mobility, and creative agency while keeping biological intent in command.',
    followUpIds: ['ai', 'ethics'],
  },
  {
    id: 'ai',
    question: 'How does CYBERNEX approach Artificial Intelligence?',
    category: 'AI Systems',
    answer:
      'Within the CYBERNEX concept, AI operates as an edge-first co-reasoning layer. It filters complex sensory environments into calm, actionable cues and adapts to individual rhythms without sending private biometric telemetry to external clouds.',
    followUpIds: ['neural', 'augmentation'],
  },
  {
    id: 'neural',
    question: 'How do Neural Interfaces fit into the architecture?',
    category: 'Neural Bridge',
    answer:
      'CYBERNEX envisions non-invasive bio-optical bridges made with biocompatible titanium and sapphire crystal optics. Their conceptual role is translating subtle motor and cognitive intent into fluid control with hardware-level signal isolation.',
    followUpIds: ['robotics', 'ethics'],
  },
  {
    id: 'robotics',
    question: 'What makes Robotic Engineering different here?',
    category: 'Robotics',
    answer:
      'Rather than rigid industrial arms, CYBERNEX focuses on bio-inspired carbon-titanium kinematics and tendon-driven actuation. Distributed tactile sensors allow prosthetics and exo-frames to match natural anatomical fluidity.',
    followUpIds: ['augmentation', 'vision'],
  },
  {
    id: 'augmentation',
    question: 'What is Human Augmentation in this concept?',
    category: 'Augmentation',
    answer:
      'Human augmentation spans featherweight load-sharing exo-spines and subtle sensory cues—helping reduce physical fatigue and extend spatial awareness while preserving natural posture and instant mechanical decoupling.',
    followUpIds: ['robotics', 'ethics'],
  },
  {
    id: 'ethics',
    question: 'How are privacy and human agency protected?',
    category: 'Ethics',
    answer:
      'Three core principles govern the CYBERNEX blueprint: local-only biometric signal processing, transparent physical override controls, and strict reversibility—ensuring the user always retains complete authorship.',
    followUpIds: ['vision', 'neural'],
  },
];

export const ABOUT_PILLARS = [
  {
    index: '01.',
    title: 'Human Agency First',
    detail:
      'Every conceptual layer places biological consciousness at the center—technology adapts to human intent, never the reverse.',
  },
  {
    index: '02.',
    title: 'Seamless Material Craft',
    detail:
      'From matte carbon composites to sapphire optical bridges, hardware is sculpted to feel like a natural extension of form.',
  },
  {
    index: '03.',
    title: 'Responsible Horizon',
    detail:
      'Privacy-by-architecture, reversibility, and transparent safety boundaries anchor our long-term vision for human-machine evolution.',
  },
];

export const INNOVATION_MODULES: InnovationModule[] = [
  {
    id: 'cognitive-layer',
    index: '01.',
    label: 'Cognitive Layer',
    title: 'Context-Aware Co-Intelligence',
    subtitle: 'Conceptual Architecture · Phase I',
    summary:
      'Unifies multi-modal environmental perception with real-time intent modeling so wearable systems anticipate user needs quietly in the background.',
    highlights: [
      'On-device inference architecture preserving full user data sovereignty',
      'Adaptive sensory filtering that prevents cognitive overload',
      'Transparent override controls accessible at any moment',
    ],
  },
  {
    id: 'neural-bridge',
    index: '02.',
    label: 'Neural Bridge',
    title: 'Symbiotic Signal Translation',
    subtitle: 'Interface Concept · Phase II',
    summary:
      'Reimagines human-computer interaction by replacing fragmented screens with calm, continuous bio-signal dialogue.',
    highlights: [
      'Directional optical coupling designed for non-invasive ergonomics',
      'Personalized calibration profiles that learn natural motor patterns',
      'Hardware-level isolation between sensory input and external networks',
    ],
  },
  {
    id: 'kinetic-frame',
    index: '03.',
    label: 'Kinetic Frame',
    title: 'Fluid Bio-Mechanical Integration',
    subtitle: 'Structural System · Phase III',
    summary:
      'Pairs articulated carbon-titanium exoskeleton geometry with micro-fluidic damping to support endurance and delicate precision alike.',
    highlights: [
      'Zero-backlash joint geometry tuned to natural skeletal arcs',
      'Regenerative kinetic capture integrated along primary load paths',
      'Modular component swaps for rapid maintenance and upgrades',
    ],
  },
];

export const CONCEPT_STATISTICS: ConceptMetric[] = [
  {
    id: 'pillars',
    target: 4,
    suffix: '',
    label: 'Core Disciplines',
    context: 'Unified across AI, neural, robotic, and augmentation concepts',
  },
  {
    id: 'layers',
    target: 16,
    suffix: '+',
    label: 'Modular Subsystems',
    context: 'Interoperable hardware and cognitive layers in the design blueprint',
  },
  {
    id: 'coverage',
    target: 360,
    suffix: '°',
    label: 'Spatial Awareness',
    context: 'Omnidirectional environmental sensing in the conceptual rig',
  },
  {
    id: 'horizon',
    target: 2040,
    suffix: '',
    label: 'Vision Horizon',
    context: 'Target era for mature, human-first symbiotic interfaces',
  },
];
