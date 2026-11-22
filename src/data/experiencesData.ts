export type AccentSpectrumId = 'blue' | 'cyan' | 'violet';
export type ChassisFinishId = 'obsidian' | 'titanium' | 'pearl';

export interface CustomizerPartOption {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  powerDraw: string;
  material: string;
}

export interface CyborgBuildConfig {
  optics: string;
  arms: string;
  neural: string;
  torso: string;
  accent: AccentSpectrumId;
  chassis: ChassisFinishId;
}

export const ACCENT_SPECTRUMS: {
  id: AccentSpectrumId;
  label: string;
  primary: string;
  secondary: string;
  glow: string;
}[] = [
  {
    id: 'cyan',
    label: 'Cyber Cyan',
    primary: '#22D3EE',
    secondary: '#3B82F6',
    glow: 'rgba(34, 211, 238, 0.45)',
  },
  {
    id: 'blue',
    label: 'Electric Blue',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.45)',
  },
  {
    id: 'violet',
    label: 'Ultraviolet',
    primary: '#8B5CF6',
    secondary: '#22D3EE',
    glow: 'rgba(139, 92, 246, 0.45)',
  },
];

export const CHASSIS_FINISHES: {
  id: ChassisFinishId;
  label: string;
  plateFill: string;
  plateStroke: string;
  jointFill: string;
}[] = [
  {
    id: 'obsidian',
    label: 'Obsidian Matte',
    plateFill: '#111827',
    plateStroke: '#334155',
    jointFill: '#1E293B',
  },
  {
    id: 'titanium',
    label: 'Brushed Titanium',
    plateFill: '#334155',
    plateStroke: '#64748B',
    jointFill: '#1E293B',
  },
  {
    id: 'pearl',
    label: 'Pearl Ceramic',
    plateFill: '#CBD5E1',
    plateStroke: '#64748B',
    jointFill: '#475569',
  },
];

export const OPTIC_OPTIONS: CustomizerPartOption[] = [
  {
    id: 'sapphire-array',
    name: 'Sapphire Retinal Array',
    subtitle: 'Dual Optical Rings',
    description:
      'Dual biometric-locked ocular rings engineered for low-light focus stabilization and micro-depth telemetry.',
    powerDraw: '1.2W nominal',
    material: 'Synthetic sapphire & titanium bezel',
  },
  {
    id: 'thermal-visor',
    name: 'Infrared Spectrum Visor',
    subtitle: 'Continuous Band Wrap',
    description:
      'Unified wraparound optical band combining wide-field visibility with subtle thermal edge contrast.',
    powerDraw: '2.1W nominal',
    material: 'Polarized polycarbonate & matte alloy',
  },
  {
    id: 'tri-lens',
    name: 'Tri-Aperture Telemetry',
    subtitle: 'Asymmetric Precision Optics',
    description:
      'Multi-focal three-lens cluster dedicated to macro inspection, spatial mapping, and optical rangefinding.',
    powerDraw: '1.8W nominal',
    material: 'Anodized carbon & coated quartz',
  },
];

export const ARM_OPTIONS: CustomizerPartOption[] = [
  {
    id: 'carbon-tendon',
    name: 'Carbon Tendon Precision',
    subtitle: 'High-Dexterity Articulation',
    description:
      'Slender tendon-driven manipulators tuned for delicate tactile handling and natural anatomical wrist rotation.',
    powerDraw: '4.5W active',
    material: 'Woven carbon fiber & elastomer',
  },
  {
    id: 'titanium-exolimb',
    name: 'Titanium Kinetic Exolimb',
    subtitle: 'Load-Bearing Frame',
    description:
      'Reinforced dual-servo forearm chassis with integrated hydraulic dampening for sustained endurance tasks.',
    powerDraw: '6.8W active',
    material: 'Grade-5 brushed titanium',
  },
  {
    id: 'magnetic-tactile',
    name: 'Harmonic Tactile Rig',
    subtitle: 'Sensory Feedback Array',
    description:
      'Distributed fingertip pressure transducers paired with electromagnetic joint suspension for silent precision.',
    powerDraw: '5.2W active',
    material: 'Ceramic polymer & copper-nickel',
  },
];

export const NEURAL_OPTIONS: CustomizerPartOption[] = [
  {
    id: 'optical-bridge',
    name: 'Cortical Optical Bridge',
    subtitle: 'Temple Bio-Photonic Link',
    description:
      'Non-invasive cranial light-guide coupler translating intentional motor cues via isolated local optics.',
    powerDraw: '0.8W steady',
    material: 'Biocompatible silicone & sapphire',
  },
  {
    id: 'occipital-crown',
    name: 'Occipital Co-Processor',
    subtitle: 'Dorsal Edge Cluster',
    description:
      'Slim cranial crest array running local-only spatial indexing and low-latency acoustic noise filtering.',
    powerDraw: '1.6W steady',
    material: 'Graphene composite & titanium',
  },
  {
    id: 'synaptic-halo',
    name: 'Synaptic Halo Transducer',
    subtitle: 'Supra-Orbital Band',
    description:
      'Minimalist forehead bridge that pairs ambient cognitive pacing cues with instant manual override switches.',
    powerDraw: '0.6W steady',
    material: 'Aerospace aluminum & hydrogel',
  },
];

export const TORSO_OPTIONS: CustomizerPartOption[] = [
  {
    id: 'kinetic-spine',
    name: 'Kinetic Load Spine',
    subtitle: 'Segmented Posture Support',
    description:
      'Articulated thoracic frame that distributes shoulder and lumbar strain evenly without restricting natural bending.',
    powerDraw: '3.0W passive',
    material: 'Segmented titanium & carbon rib',
  },
  {
    id: 'cryo-core',
    name: 'Cryo-Regulator Core',
    subtitle: 'Solid-State Thermal Loop',
    description:
      'Compact chest heat-exchanger keeping wearable edge processors cool and silent under prolonged workloads.',
    powerDraw: '2.4W steady',
    material: 'Micro-channeled alloy',
  },
  {
    id: 'stealth-carapace',
    name: 'Faceted Carbon Shell',
    subtitle: 'Lightweight Acoustic Shield',
    description:
      'Ultra-thin faceted composite shell shielding internal neural buses from electromagnetic interference.',
    powerDraw: '0.4W passive',
    material: 'Matte carbon laminate',
  },
];

export const DEFAULT_CYBORG_BUILD: CyborgBuildConfig = {
  optics: 'sapphire-array',
  arms: 'carbon-tendon',
  neural: 'optical-bridge',
  torso: 'kinetic-spine',
  accent: 'cyan',
  chassis: 'obsidian',
};

// --- Feature 2: Neural Network Explorer ---
export interface ExplorerNeuron {
  id: string;
  layerIndex: number;
  layerName: string;
  title: string;
  shortLabel: string;
  xPercent: number;
  yPercent: number;
  role: string;
  biologicalAnalogy: string;
  howItProcesses: string;
  connections: string[];
}

export const EXPLORER_LAYERS = [
  { index: 0, name: 'Input Layer', subtitle: 'Raw Sensory Reception' },
  { index: 1, name: 'Hidden Layer 1', subtitle: 'Feature Extraction' },
  { index: 2, name: 'Hidden Layer 2', subtitle: 'Context Integration' },
  { index: 3, name: 'Output Layer', subtitle: 'Decision & Action' },
];

export const EXPLORER_NEURONS: ExplorerNeuron[] = [
  {
    id: 'in-vision',
    layerIndex: 0,
    layerName: 'Input Layer',
    title: 'Optical Edge Receptor',
    shortLabel: 'Optical',
    xPercent: 14,
    yPercent: 24,
    role: 'Converts visual contrast, motion edges, and depth into normalized numeric signals (0.0 to 1.0).',
    biologicalAnalogy: 'Comparable to retinal photoreceptor cells translating light waves into electrical impulses.',
    howItProcesses:
      'Input neurons do not perform weighted reasoning; they encode raw environmental measurements so downstream layers can evaluate patterns.',
    connections: ['h1-pattern', 'h1-spatial'],
  },
  {
    id: 'in-bio',
    layerIndex: 0,
    layerName: 'Input Layer',
    title: 'Myoelectric Intent Node',
    shortLabel: 'Intent',
    xPercent: 14,
    yPercent: 52,
    role: 'Reads subtle bio-electric muscle or neural rhythm changes representing user movement intention.',
    biologicalAnalogy: 'Comparable to peripheral sensory nerves carrying motor readiness signals toward the spinal cord.',
    howItProcesses:
      'Filters baseline electrical noise and outputs a clean activation strength proportional to user intent.',
    connections: ['h1-pattern', 'h1-rhythm'],
  },
  {
    id: 'in-tactile',
    layerIndex: 0,
    layerName: 'Input Layer',
    title: 'Tactile Pressure Sensor',
    shortLabel: 'Tactile',
    xPercent: 14,
    yPercent: 80,
    role: 'Samples surface contact force and micro-vibration across robotic fingertips.',
    biologicalAnalogy: 'Comparable to mechanoreceptors in human skin sensing grip texture and slip.',
    howItProcesses:
      'Normalizes force readings so delicate objects and heavy loads share a unified numerical scale.',
    connections: ['h1-spatial', 'h1-rhythm'],
  },
  {
    id: 'h1-pattern',
    layerIndex: 1,
    layerName: 'Hidden Layer 1',
    title: 'Signal Correlation Unit',
    shortLabel: 'Correlate',
    xPercent: 39,
    yPercent: 22,
    role: 'Multiplies incoming visual and intent signals by learned synaptic weights to detect coherent patterns.',
    biologicalAnalogy: 'Comparable to cortical columns recognizing simple shapes or synchronized cues.',
    howItProcesses:
      'Sums weighted inputs (w1*x1 + w2*x2 + bias) and applies a non-linear activation curve to suppress weak noise.',
    connections: ['h2-intent', 'h2-safety'],
  },
  {
    id: 'h1-spatial',
    layerIndex: 1,
    layerName: 'Hidden Layer 1',
    title: 'Spatial Geometry Filter',
    shortLabel: 'Spatial',
    xPercent: 39,
    yPercent: 52,
    role: 'Combines optical depth with tactile contact timing to estimate object boundaries and distance.',
    biologicalAnalogy: 'Comparable to parietal cortex neurons aligning vision with reach coordinates.',
    howItProcesses:
      'Emphasizes strong overlapping signals while dampening conflicting sensor jitter through weighted inhibition.',
    connections: ['h2-intent', 'h2-precision'],
  },
  {
    id: 'h1-rhythm',
    layerIndex: 1,
    layerName: 'Hidden Layer 1',
    title: 'Temporal Cadence Node',
    shortLabel: 'Cadence',
    xPercent: 39,
    yPercent: 80,
    role: 'Tracks short-term timing across milliseconds to distinguish deliberate intent from reflexes.',
    biologicalAnalogy: 'Comparable to cerebellar timing circuits smoothing fluid motion sequences.',
    howItProcesses:
      'Retains a fading trace of recent activations so steady, purposeful cues cross the firing threshold.',
    connections: ['h2-safety', 'h2-precision'],
  },
  {
    id: 'h2-intent',
    layerIndex: 2,
    layerName: 'Hidden Layer 2',
    title: 'Intent Disambiguation Hub',
    shortLabel: 'Resolve',
    xPercent: 64,
    yPercent: 26,
    role: 'Synthesizes correlated features into a high-level representation of what action the user wants next.',
    biologicalAnalogy: 'Comparable to premotor association areas selecting a coherent movement plan.',
    howItProcesses:
      'High synaptic weights link aligned optical and myoelectric features, amplifying confidence when both agree.',
    connections: ['out-assist', 'out-grip'],
  },
  {
    id: 'h2-safety',
    layerIndex: 2,
    layerName: 'Hidden Layer 2',
    title: 'Boundary Gatekeeper',
    shortLabel: 'Guard',
    xPercent: 64,
    yPercent: 52,
    role: 'Applies learned safety thresholds to prevent excessive grip force or unintended sudden torque.',
    biologicalAnalogy: 'Comparable to inhibitory interneurons protecting tendons from sudden over-contraction.',
    howItProcesses:
      'Uses negative (inhibitory) weights whenever tactile pressure spikes unexpectedly, throttling downstream output.',
    connections: ['out-assist', 'out-grip'],
  },
  {
    id: 'h2-precision',
    layerIndex: 2,
    layerName: 'Hidden Layer 2',
    title: 'Fine Kinematics Router',
    shortLabel: 'Route',
    xPercent: 64,
    yPercent: 78,
    role: 'Balances speed against delicate micro-adjustment based on object fragility and spatial distance.',
    biologicalAnalogy: 'Comparable to fine motor tuning pathways coordinating finger opposition.',
    howItProcesses:
      'Modulates downstream signal amplitude smoothly rather than triggering binary on/off switches.',
    connections: ['out-grip'],
  },
  {
    id: 'out-assist',
    layerIndex: 3,
    layerName: 'Output Layer',
    title: 'Cognitive Cue Output',
    shortLabel: 'HUD Cue',
    xPercent: 87,
    yPercent: 35,
    role: 'Produces a calibrated confidence score determining whether to surface a subtle visual or haptic cue.',
    biologicalAnalogy: 'Comparable to conscious attentional focus highlighting a relevant detail.',
    howItProcesses:
      'Applies a soft threshold so the interface stays quiet during normal routines and speaks up only when useful.',
    connections: [],
  },
  {
    id: 'out-grip',
    layerIndex: 3,
    layerName: 'Output Layer',
    title: 'Actuator Torque Command',
    shortLabel: 'Actuate',
    xPercent: 87,
    yPercent: 68,
    role: 'Translates final integrated activation into smooth, proportional micro-actuator velocity.',
    biologicalAnalogy: 'Comparable to alpha motor neurons driving coordinated muscle fiber contraction.',
    howItProcesses:
      'Outputs a continuous target force curve capped by the Boundary Gatekeeper for gentle, predictable motion.',
    connections: [],
  },
];

// --- Feature 4: Historically Accurate Evolution Timeline ---
export type TimelineCategory = 'all' | 'robotics' | 'ai' | 'prosthetics' | 'hmi';

export interface TimelineMilestone {
  id: string;
  year: string;
  title: string;
  category: Exclude<TimelineCategory, 'all'>;
  categoryLabel: string;
  pioneers: string;
  summary: string;
  breakthrough: string;
  significance: string;
}

export const TIMELINE_CATEGORIES: { id: TimelineCategory; label: string }[] = [
  { id: 'all', label: 'All Eras' },
  { id: 'ai', label: 'Artificial Intelligence' },
  { id: 'robotics', label: 'Robotics' },
  { id: 'prosthetics', label: 'Prosthetics & BCI' },
  { id: 'hmi', label: 'Human-Machine Interaction' },
];

export const EVOLUTION_MILESTONES: TimelineMilestone[] = [
  {
    id: 'turing-1950',
    year: '1950',
    title: 'Computing Machinery and Intelligence',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    pioneers: 'Alan Turing',
    summary:
      'Alan Turing published his landmark paper in Mind, proposing the "Imitation Game"—later known as the Turing Test—as a practical benchmark for machine intelligence.',
    breakthrough: 'Framed machine cognition around observable conversational reasoning rather than biological replication.',
    significance: 'Laid the conceptual foundation for modern AI evaluation and human-machine dialogue.',
  },
  {
    id: 'dartmouth-1956',
    year: '1956',
    title: 'The Dartmouth AI Workshop',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    pioneers: 'John McCarthy, Marvin Minsky, Claude Shannon & Nathaniel Rochester',
    summary:
      'Researchers gathered at Dartmouth College for a summer research project that formally coined the term "Artificial Intelligence" and launched AI as an independent scientific field.',
    breakthrough: 'Unified symbolic logic, neural networks, and information theory under one research agenda.',
    significance: 'Established core questions in search, language processing, and machine learning still active today.',
  },
  {
    id: 'unimate-1961',
    year: '1961',
    title: 'Unimate #001 Industrial Robot',
    category: 'robotics',
    categoryLabel: 'Robotics',
    pioneers: 'George Devol & Joseph Engelberger',
    summary:
      'Unimate became the first digitally operated, programmable industrial robotic arm installed on a General Motors die-casting line in Ewing Township, New Jersey.',
    breakthrough: 'Stored step-by-step spatial coordinates on a magnetic drum to repeat hazardous tasks accurately.',
    significance: 'Inaugurated modern mechatronic manufacturing and precision multi-axis actuation.',
  },
  {
    id: 'engelbart-1968',
    year: '1968',
    title: 'The Mother of All Demos',
    category: 'hmi',
    categoryLabel: 'Human-Machine Interaction',
    pioneers: 'Douglas Engelbart & SRI Augmentation Research Center',
    summary:
      'In a 90-minute live demonstration in San Francisco, Engelbart unveiled the computer mouse, hypertext links, collaborative real-time editing, and graphical windows.',
    breakthrough: 'Treated computers as direct instruments to augment human intellect rather than batch calculators.',
    significance: 'Defined direct-manipulation interfaces that shaped every personal and wearable computer since.',
  },
  {
    id: 'shakey-1969',
    year: '1969',
    title: 'Shakey the Mobile Robot',
    category: 'robotics',
    categoryLabel: 'Robotics',
    pioneers: 'Charles Rosen, Nils Nilsson & SRI International',
    summary:
      'Shakey was the first general-purpose mobile robot capable of perceiving its surroundings via camera and rangefinder and planning multi-step physical actions.',
    breakthrough: 'Gave rise to the A* pathfinding algorithm and the STRIPS automated planning system.',
    significance: 'Bridged logical AI reasoning with real-world physical navigation.',
  },
  {
    id: 'vidal-bci-1973',
    year: '1973',
    title: 'Brain-Computer Interface Coined',
    category: 'prosthetics',
    categoryLabel: 'Prosthetics & BCI',
    pioneers: 'Jacques Vidal (UCLA)',
    summary:
      'Jacques Vidal published "Toward Direct Brain-Computer Communication," coining the term Brain-Computer Interface (BCI) and testing EEG visual evoked potentials for cursor control.',
    breakthrough: 'Demonstrated that non-invasive scalp electrical signals could carry structured directional intent.',
    significance: 'Created the academic discipline behind modern assistive neural bridges.',
  },
  {
    id: 'deep-blue-1997',
    year: '1997',
    title: 'Deep Blue Defeats World Champion',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    pioneers: 'Feng-hsiung Hsu, Murray Campbell & IBM Research',
    summary:
      'IBM’s specialized chess supercomputer Deep Blue defeated reigning world champion Garry Kasparov in a six-game tournament match in New York.',
    breakthrough: 'Evaluated up to 200 million board positions per second using custom VLSI chips and tree search.',
    significance: 'Proved that specialized computational architectures could master deeply structured strategic domains.',
  },
  {
    id: 'asimo-2000',
    year: '2000',
    title: 'ASIMO Bipedal Humanoid Debut',
    category: 'robotics',
    categoryLabel: 'Robotics',
    pioneers: 'Honda Robotics',
    summary:
      'Honda introduced ASIMO after 14 years of bipedal research, showcasing predictive center-of-gravity control for smooth walking, stair climbing, and turning.',
    breakthrough: 'Zero-Moment Point (ZMP) dynamic balance modeling for human-scale humanoid locomotion.',
    significance: 'Accelerated global research in human-centered assistive and companion robotics.',
  },
  {
    id: 'braingate-2006',
    year: '2006',
    title: 'BrainGate Clinical Neural Array',
    category: 'prosthetics',
    categoryLabel: 'Prosthetics & BCI',
    pioneers: 'John Donoghue, Leigh Hochberg & Brown/MGH Consortium',
    summary:
      'Clinical trial results published in Nature demonstrated that a 96-channel intracortical microelectrode implant enabled a paralyzed participant to move a screen cursor and robotic hand by thought.',
    breakthrough: 'Translated real-time motor cortex neuron firing patterns into multi-degree-of-freedom control.',
    significance: 'Validated bidirectional neuroprosthetic restoration for human motor independence.',
  },
  {
    id: 'alexnet-2012',
    year: '2012',
    title: 'AlexNet & GPU Deep Learning',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    pioneers: 'Alex Krizhevsky, Ilya Sutskever & Geoffrey Hinton',
    summary:
      'AlexNet cut top-5 image classification error nearly in half on the ImageNet challenge using deep convolutional layers trained on graphics processors.',
    breakthrough: 'Demonstrated that deep multi-layer neural networks scale dramatically with parallel GPU compute and data.',
    significance: 'Ignited modern computer vision, perception robotics, and neural network engineering.',
  },
  {
    id: 'luke-arm-2016',
    year: '2016',
    title: 'LUKE Advanced Prosthetic Limb',
    category: 'prosthetics',
    categoryLabel: 'Prosthetics & BCI',
    pioneers: 'Dean Kamen, DEKA Research & DARPA',
    summary:
      'Originally developed under DARPA’s Revolutionizing Prosthetics program, the LUKE arm entered commercial availability after FDA clearance as a multi-grip powered upper-limb prosthesis.',
    breakthrough: 'Combined electromyographic (EMG) muscle sensors, wireless foot controls, and grip-force feedback.',
    significance: 'Brought dexterous, multi-jointed prosthetics with delicate handling from lab prototypes into clinical use.',
  },
  {
    id: 'transformer-2017',
    year: '2017',
    title: 'The Transformer Architecture',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    pioneers: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser & Polosukhin',
    summary:
      'Researchers published "Attention Is All You Need," replacing sequential recurrence with parallel self-attention mechanisms across entire context windows.',
    breakthrough: 'Allowed neural networks to weigh relationships across long sequences simultaneously.',
    significance: 'Became the unifying backbone for modern language, voice, vision, and multimodal AI systems.',
  },
  {
    id: 'symbiotic-era-2026',
    year: '2020s',
    title: 'Multimodal Co-Intelligence & Tactile Symbiosis',
    category: 'hmi',
    categoryLabel: 'Human-Machine Interaction',
    pioneers: 'Global Robotics, BCI & AI Research Communities',
    summary:
      'Low-power edge transformers, high-resolution tactile skins, wireless neural speech decoders, and conversational voice interfaces now converge into unified assistive systems.',
    breakthrough: 'Real-time cross-modal reasoning linking speech, vision, and delicate physical actuation.',
    significance: 'Moves technology from passive tools toward adaptive, human-governed symbiotic partners.',
  },
];

// --- Feature 6: Identity Card Generator Presets ---
export const ID_DIVISIONS = [
  'Cognitive Architecture',
  'Neural Signal Bridge',
  'Kinetic Mechatronics',
  'Human Augmentation Lab',
  'Ethical Autonomy Council',
] as const;

export const ID_NEURAL_TIERS = [
  'Bio-Optical Symbiont · Class A',
  'Non-Invasive Co-Reasoner · Tier II',
  'Haptic Kinematic Specialist · Tier III',
  'Zero-Egress Enclave Guardian · Tier IV',
] as const;

export const ID_ORIGIN_SECTORS = [
  'Orbital Spire 04 · Low Orbit',
  'Kyoto Bio-Optic Atelier',
  'Zurich Horizon Enclave',
  'Neo-Pacific Floating Lab',
  'Nordic Cryo-Compute Station',
] as const;

export const ID_MOTTOS = [
  'Human agency commands every circuit.',
  'Precision in motion, clarity in thought.',
  'Built for symbiosis, governed by ethics.',
  'Beyond biological limits, rooted in empathy.',
] as const;
