// ARLearner - Static Data Layer
// All learning domains, modules, and curriculum data

import type { LearningDomain, Module } from '../store'

// ============================================================
// LEARNING DOMAINS
// ============================================================

export const DOMAINS: LearningDomain[] = [
  {
    id: 'domain_science',
    slug: 'virtual-science-lab',
    name: 'Virtual Science Laboratory',
    description: 'Conduct chemical experiments, microscopic analysis, and biological dissections in a fully simulated laboratory environment.',
    color: '#06b6d4',
    accentVar: '--domain-science',
    badgeClass: 'badge-science',
    iconName: 'FlaskConical',
    moduleCount: 8,
    totalLearners: 4821,
  },
  {
    id: 'domain_vocational',
    slug: 'vocational-skills',
    name: 'Vocational Skills',
    description: 'Master welding, plumbing, electrical installation, carpentry, and solar HVAC through interactive step-by-step simulations.',
    color: '#f59e0b',
    accentVar: '--domain-vocational',
    badgeClass: 'badge-vocational',
    iconName: 'Wrench',
    moduleCount: 12,
    totalLearners: 3640,
  },
  {
    id: 'domain_medical',
    slug: 'medical-simulation',
    name: 'Medical Simulation',
    description: 'Practise emergency response, CPR, injection techniques, surgical assistance, and clinical childbirth procedures safely.',
    color: '#ef4444',
    accentVar: '--domain-medical',
    badgeClass: 'badge-medical',
    iconName: 'HeartPulse',
    moduleCount: 10,
    totalLearners: 2910,
  },
  {
    id: 'domain_industrial',
    slug: 'industrial-safety',
    name: 'Industrial Safety',
    description: 'Train in fire evacuation, confined-space management, hazard identification, and chemical-spill response without real-world risk.',
    color: '#f97316',
    accentVar: '--domain-industrial',
    badgeClass: 'badge-industrial',
    iconName: 'ShieldAlert',
    moduleCount: 7,
    totalLearners: 1870,
  },
  {
    id: 'domain_agric',
    slug: 'agricultural-simulation',
    name: 'Agricultural Simulation',
    description: 'Simulate tractor operation, automated irrigation, pest control, poultry management, and aquaculture techniques.',
    color: '#22c55e',
    accentVar: '--domain-agric',
    badgeClass: 'badge-agric',
    iconName: 'Sprout',
    moduleCount: 9,
    totalLearners: 2210,
  },
]

// ============================================================
// MODULES
// ============================================================

export const MODULES: Module[] = [
  // SCIENCE LAB
  {
    id: 'mod_science_001',
    domainId: 'domain_science',
    domainSlug: 'virtual-science-lab',
    domainName: 'Virtual Science Laboratory',
    title: 'Acid-Base Titration',
    description: 'Perform a complete NaOH / HCl titration using a burette, conical flask, and phenolphthalein indicator.',
    longDescription: 'This module walks you through a full quantitative acid-base titration. You will learn to prepare a burette, standardise a solution, identify the equivalence point using colour indicators, and calculate concentration using stoichiometry. The simulation accurately models liquid dynamics, colour transitions at the endpoint, and equipment handling procedures.',
    difficulty: 2,
    estimatedMinutes: 35,
    totalSteps: 5,
    thumbnailColor: '#06b6d4',
    isPublished: true,
    tags: ['chemistry', 'quantitative', 'laboratory', 'titration', 'WAEC'],
    learnerCount: 1842,
    averageScore: 84,
    completionRate: 78,
    simulationType: '3d-ar',
  },
  {
    id: 'mod_science_002',
    domainId: 'domain_science',
    domainSlug: 'virtual-science-lab',
    domainName: 'Virtual Science Laboratory',
    title: 'Microscopic Cell Analysis',
    description: 'Prepare and examine blood, plant, and onion cell slides under a compound microscope.',
    longDescription: 'Operate a compound microscope from low to high power, prepare wet-mount slides, stain specimens with methylene blue and iodine, and identify cell organelles. Includes an identification quiz where you label structures on real microscopy images.',
    difficulty: 1,
    estimatedMinutes: 25,
    totalSteps: 6,
    thumbnailColor: '#38bdf8',
    isPublished: true,
    tags: ['biology', 'cells', 'microscopy', 'laboratory', 'UTME'],
    learnerCount: 2104,
    averageScore: 91,
    completionRate: 89,
    simulationType: '3d-ar',
  },
  {
    id: 'mod_science_003',
    domainId: 'domain_science',
    domainSlug: 'virtual-science-lab',
    domainName: 'Virtual Science Laboratory',
    title: 'Human Anatomy: Digestive System',
    description: 'Explore and label the full human digestive tract in an interactive 3D anatomical model.',
    longDescription: 'Navigate a high-resolution 3D human body model. Click organs to learn their function, trace the path of food from ingestion to excretion, and complete timed identification challenges. Includes comparative anatomy with ruminant digestive systems.',
    difficulty: 2,
    estimatedMinutes: 40,
    totalSteps: 7,
    thumbnailColor: '#a78bfa',
    isPublished: true,
    tags: ['biology', 'anatomy', 'physiology', '3D-model', 'JAMB'],
    learnerCount: 1560,
    averageScore: 79,
    completionRate: 72,
    simulationType: '3d-ar',
  },

  // VOCATIONAL
  {
    id: 'mod_voc_001',
    domainId: 'domain_vocational',
    domainSlug: 'vocational-skills',
    domainName: 'Vocational Skills',
    title: 'MIG Welding Fundamentals',
    description: 'Set up and operate a MIG welder to produce butt, fillet, and lap joints on mild steel.',
    longDescription: 'This module covers wire feed speed, voltage settings, shield gas selection, and joint preparation. You will practise torch angle, travel speed, and bead consistency in a physics-simulated welding environment with real-time feedback on penetration and spatter.',
    difficulty: 2,
    estimatedMinutes: 45,
    totalSteps: 6,
    thumbnailColor: '#f59e0b',
    isPublished: true,
    tags: ['welding', 'MIG', 'fabrication', 'NABTEB', 'trade'],
    learnerCount: 987,
    averageScore: 76,
    completionRate: 65,
    simulationType: 'hybrid',
  },
  {
    id: 'mod_voc_002',
    domainId: 'domain_vocational',
    domainSlug: 'vocational-skills',
    domainName: 'Vocational Skills',
    title: 'Solar PV Installation',
    description: 'Design and install a 1kWp off-grid solar photovoltaic system from panel mounting to battery connection.',
    longDescription: 'Follow a complete installation workflow: site assessment and shading analysis, panel tilt angle calculation, wiring DC circuits, connecting charge controllers and inverters, and system commissioning. Includes a fault-finding challenge simulating common installation errors.',
    difficulty: 3,
    estimatedMinutes: 60,
    totalSteps: 8,
    thumbnailColor: '#fbbf24',
    isPublished: true,
    tags: ['solar', 'energy', 'electrical', 'renewable', 'NCBE'],
    learnerCount: 743,
    averageScore: 71,
    completionRate: 58,
    simulationType: 'hybrid',
  },
  {
    id: 'mod_voc_003',
    domainId: 'domain_vocational',
    domainSlug: 'vocational-skills',
    domainName: 'Vocational Skills',
    title: 'Plumbing: PVC Pipe Installation',
    description: 'Cut, join, and pressure-test PVC pipework for a domestic cold water supply system.',
    longDescription: 'Learn solvent-cement joining technique, correct pipe sizing, valve placement, and slope calculation for gravity drainage. The simulation tests pressure integrity and leak detection using virtual pressure gauges.',
    difficulty: 1,
    estimatedMinutes: 30,
    totalSteps: 5,
    thumbnailColor: '#fb923c',
    isPublished: true,
    tags: ['plumbing', 'pipework', 'domestic', 'water-supply', 'City-Guilds'],
    learnerCount: 1120,
    averageScore: 85,
    completionRate: 81,
    simulationType: 'guided-steps',
  },

  // MEDICAL
  {
    id: 'mod_medical_001',
    domainId: 'domain_medical',
    domainSlug: 'medical-simulation',
    domainName: 'Medical Simulation',
    title: 'Basic Life Support: CPR',
    description: 'Master hands-on CPR technique for adults following the Nigerian Resuscitation Council 2025 guidelines.',
    longDescription: 'Covers scene safety assessment, recognition of cardiac arrest, activation of emergency services, high-quality chest compressions (depth, rate, recoil), rescue breathing, and AED integration. The simulation uses a biomechanical model that gives real-time feedback on compression depth and rate.',
    difficulty: 2,
    estimatedMinutes: 40,
    totalSteps: 4,
    thumbnailColor: '#ef4444',
    isPublished: true,
    tags: ['CPR', 'BLS', 'emergency', 'nursing', 'NRC-2025'],
    learnerCount: 1643,
    averageScore: 88,
    completionRate: 85,
    simulationType: '3d-ar',
  },
  {
    id: 'mod_medical_002',
    domainId: 'domain_medical',
    domainSlug: 'medical-simulation',
    domainName: 'Medical Simulation',
    title: 'Intravenous Cannulation',
    description: 'Practise IV cannula insertion technique including vein selection, skin preparation, and securement.',
    longDescription: 'Work through patient assessment, tourniquet application, vein palpation, needle angle and insertion technique, flashback identification, and cannula advancement. Includes complications module covering extravasation, haematoma, and phlebitis recognition.',
    difficulty: 3,
    estimatedMinutes: 50,
    totalSteps: 7,
    thumbnailColor: '#f87171',
    isPublished: true,
    tags: ['IV-cannulation', 'nursing', 'clinical', 'venepuncture', 'NMCN'],
    learnerCount: 920,
    averageScore: 74,
    completionRate: 61,
    simulationType: '3d-ar',
  },

  // INDUSTRIAL SAFETY
  {
    id: 'mod_ind_001',
    domainId: 'domain_industrial',
    domainSlug: 'industrial-safety',
    domainName: 'Industrial Safety',
    title: 'Fire Evacuation Procedures',
    description: 'Coordinate a complete building fire evacuation including warden duties, roll call, and emergency service liaison.',
    longDescription: 'Simulate discovering a fire, raising the alarm, directing occupants to assembly points, conducting roll-call, and briefing fire services on arrival. Includes scenarios for mobility-impaired occupants and smoke-filled corridors.',
    difficulty: 1,
    estimatedMinutes: 25,
    totalSteps: 5,
    thumbnailColor: '#f97316',
    isPublished: true,
    tags: ['fire-safety', 'evacuation', 'HSE', 'workplace', 'ISPON'],
    learnerCount: 876,
    averageScore: 90,
    completionRate: 92,
    simulationType: 'guided-steps',
  },
  {
    id: 'mod_ind_002',
    domainId: 'domain_industrial',
    domainSlug: 'industrial-safety',
    domainName: 'Industrial Safety',
    title: 'Chemical Spill Response',
    description: 'Safely contain and clean up a hydrochloric acid spill in a laboratory setting using correct PPE and neutralisation.',
    longDescription: 'Assess spill severity, select appropriate PPE (gloves, respirator, splash goggles), apply sodium bicarbonate neutraliser, absorb with inert material, and package waste for disposal. Includes decontamination procedures and incident report completion.',
    difficulty: 3,
    estimatedMinutes: 45,
    totalSteps: 6,
    thumbnailColor: '#fb923c',
    isPublished: true,
    tags: ['chemical-safety', 'spill-response', 'PPE', 'COSHH', 'HSE-Nigeria'],
    learnerCount: 534,
    averageScore: 82,
    completionRate: 70,
    simulationType: 'hybrid',
  },

  // AGRICULTURAL
  {
    id: 'mod_agric_001',
    domainId: 'domain_agric',
    domainSlug: 'agricultural-simulation',
    domainName: 'Agricultural Simulation',
    title: 'Tractor Operation & Safety',
    description: 'Operate a 75HP tractor through pre-start checks, field manoeuvres, and implement attachment.',
    longDescription: 'Complete a full pre-operation inspection, start and warm up procedure, three-point linkage operation, headland turns, and safe shutdown. Includes a simulated sloped terrain challenge to practise stability and rollover prevention.',
    difficulty: 2,
    estimatedMinutes: 50,
    totalSteps: 7,
    thumbnailColor: '#22c55e',
    isPublished: true,
    tags: ['tractor', 'mechanisation', 'farm-safety', 'ADE', 'agricultural-engineering'],
    learnerCount: 743,
    averageScore: 80,
    completionRate: 74,
    simulationType: '3d-ar',
  },
  {
    id: 'mod_agric_002',
    domainId: 'domain_agric',
    domainSlug: 'agricultural-simulation',
    domainName: 'Agricultural Simulation',
    title: 'Drip Irrigation System Setup',
    description: 'Design and install a drip irrigation system for a 0.5-hectare tomato plot including emitter placement and scheduling.',
    longDescription: 'Calculate crop water requirements, design lateral layout, install mainline, sub-mains, and drip laterals, configure a timer-based controller, and diagnose common blockage and pressure issues in a simulated field environment.',
    difficulty: 2,
    estimatedMinutes: 40,
    totalSteps: 6,
    thumbnailColor: '#4ade80',
    isPublished: true,
    tags: ['irrigation', 'water-management', 'horticulture', 'tomato', 'FAO-guidelines'],
    learnerCount: 612,
    averageScore: 77,
    completionRate: 68,
    simulationType: 'guided-steps',
  },
]

// ============================================================
// HELPERS
// ============================================================

export function getDomainBySlug(slug: string): LearningDomain | undefined {
  return DOMAINS.find((d) => d.slug === slug)
}

export function getModulesByDomain(domainSlug: string): Module[] {
  return MODULES.filter((m) => m.domainSlug === domainSlug)
}

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id)
}

export function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' }
  return labels[level] ?? 'Unknown'
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const PLATFORM_STATS = {
  totalLearners: 15451,
  totalModules: 46,
  totalInstitutions: 38,
  countriesCovered: 3,
  averageEngagement: 87,
  successRate: 79,
}
