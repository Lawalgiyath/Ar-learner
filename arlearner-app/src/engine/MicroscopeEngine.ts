// MicroscopeEngine - Core Optical Physics, Procedural 3D Compound Microscope Apparatus,
// 6-Specimen Histological Library & Volumetric Subcellular Organelle Explorer

import * as THREE from 'three'

export type ObjectiveMagnification = 4 | 10 | 40 | 100

export type SpecimenId =
  | 'blood_smear'
  | 'onion_epidermis'
  | 'gram_stain'
  | 'cheek_epithelium'
  | 'allium_mitosis'
  | 'motor_neuron'

export interface SpecimenInfo {
  id: SpecimenId
  name: string
  scientificName: string
  stainType: string
  stainDescription: string
  specimenType: 'human_histology' | 'plant_cytology' | 'microbiology' | 'neurohistology'
  typicalSizeUm: string
  idealMagnification: ObjectiveMagnification
  requiresOil: boolean
  description: string
  keyStructures: string[]
  clinicalRelevance: string
}

export const SPECIMEN_CATALOG: Record<SpecimenId, SpecimenInfo> = {
  blood_smear: {
    id: 'blood_smear',
    name: 'Peripheral Blood Smear',
    scientificName: 'Homo sapiens (Peripheral Blood)',
    stainType: 'Wright-Giemsa Stain',
    stainDescription: 'Eosin Y (acidic, stains basic RBC hemoglobin pink) & Methylene Blue/Azure B (basic, stains acidic leukocyte nuclei deep purple).',
    specimenType: 'human_histology',
    typicalSizeUm: 'RBCs: 7.2–7.8 µm | Neutrophils: 12–15 µm | Platelets: 2–3 µm',
    idealMagnification: 100,
    requiresOil: true,
    description: 'Human venous blood monolayer featuring biconcave non-nucleated erythrocytes, polymorphonuclear neutrophils, small mature lymphocytes, and thrombocyte clusters.',
    keyStructures: ['Erythrocyte Central Pallor', 'Multilobed Neutrophil Nucleus', 'Lymphocyte Chromatin Rim', 'Platelet Clusters'],
    clinicalRelevance: 'Gold standard for diagnosing anemia (microcytic, macrocytic, sickle cell crisis), leukemias, malaria, and thrombocytopenia.',
  },
  onion_epidermis: {
    id: 'onion_epidermis',
    name: 'Onion Bulb Epidermis',
    scientificName: 'Allium cepa (Epithelial Peel)',
    stainType: "Lugol's Iodine Solution (IKI)",
    stainDescription: "Potassium iodide & iodine binds cellular polysaccharides, contrasting cellulosic cell walls and staining the eukaryotic nucleus yellowish-brown.",
    specimenType: 'plant_cytology',
    typicalSizeUm: 'Length: 200–350 µm | Width: 40–80 µm | Nucleus: 15–20 µm',
    idealMagnification: 40,
    requiresOil: false,
    description: 'Single-cell thick monolayer of turgid plant epidermis demonstrating rigid cellulosic cell walls, prominent nuclei, nucleoli, and massive central fluid-filled vacuoles.',
    keyStructures: ['Cellulose Cell Wall', 'Nucleus with Nucleolus', 'Cytoplasmic Strands', 'Central Vacuole (Tonoplast)'],
    clinicalRelevance: 'Classic model for plant tissue geometry, osmosis, and turgor regulation (plasmolysis vs deplasmolysis).',
  },
  gram_stain: {
    id: 'gram_stain',
    name: 'Bacterial Gram Stain Mixed Smear',
    scientificName: 'Staphylococcus aureus & Escherichia coli',
    stainType: 'Differential Gram Staining Protocol',
    stainDescription: 'Crystal violet primary stain, Gram iodine mordant, acetone-alcohol decolorizer, and safranin O pink counterstain.',
    specimenType: 'microbiology',
    typicalSizeUm: 'S. aureus: 0.8–1.0 µm | E. coli: 0.5 × 1.5–2.5 µm',
    idealMagnification: 100,
    requiresOil: true,
    description: 'Differential diagnostic microbiology smear contrasting Gram-positive thick peptidoglycan cocci (deep crystal purple) and Gram-negative thin peptidoglycan bacilli (bright pink).',
    keyStructures: ['Gram-Positive Purple Cocci Clusters', 'Gram-Negative Pink Bacilli Rods', 'Decolorized Background'],
    clinicalRelevance: 'Cornerstone diagnostic test in medical microbiology for guiding immediate empirical antibiotic therapy (e.g. beta-lactams vs vancomycin).',
  },
  cheek_epithelium: {
    id: 'cheek_epithelium',
    name: 'Human Buccal Epithelial Cells',
    scientificName: 'Homo sapiens (Stratified Squamous Epithelium)',
    stainType: '0.1% Methylene Blue Aqueous',
    stainDescription: 'Simple positive cationic stain that binds negatively charged nucleic acids, highlighting the nucleus and cytoplasmic granules.',
    specimenType: 'human_histology',
    typicalSizeUm: 'Cell: 50–70 µm | Nucleus: 8–12 µm',
    idealMagnification: 40,
    requiresOil: false,
    description: 'Desquamated non-keratinized stratified squamous cells from human oral mucosa showing polygonal irregular borders, folded membranes, dense nuclei, and oral microbiome bacteria.',
    keyStructures: ['Squamous Plasma Membrane', 'Centrally Positioned Nucleus', 'Perinuclear Granules', 'Surface Bacteria (Microbiome)'],
    clinicalRelevance: 'Used in cytology, DNA buccal swabs, forensic medicine, and oral squamous cell carcinoma screening.',
  },
  allium_mitosis: {
    id: 'allium_mitosis',
    name: 'Allium Root Tip Mitotic Phases',
    scientificName: 'Allium cepa (Apical Meristem)',
    stainType: 'Acetocarmine / Feulgen Nuclear Stain',
    stainDescription: 'Binds specifically to DNA deoxyribose, staining condensed mitotic chromosomes intense magenta-crimson.',
    specimenType: 'plant_cytology',
    typicalSizeUm: 'Meristematic Cell: 25–40 µm | Chromosome Width: ~1 µm',
    idealMagnification: 40,
    requiresOil: false,
    description: 'Rapidly dividing root apical meristem showing all sequential cell cycle phases: Interphase, Prophase, Metaphase, Anaphase, Telophase, and Cytokinesis.',
    keyStructures: ['Interphase Chromatin', 'Prophase Condensation', 'Metaphase Equatorial Plate', 'Anaphase Chromatid Separation', 'Telophase Cell Plate'],
    clinicalRelevance: 'Essential cytogenetic study for calculating mitotic index, evaluating chemotherapeutic spindle poisons, and karyotyping.',
  },
  motor_neuron: {
    id: 'motor_neuron',
    name: 'Multipolar Spinal Motor Neuron',
    scientificName: 'Mammalia (Ventral Horn Spinal Cord)',
    stainType: 'Cresyl Violet (Nissl Stain)',
    stainDescription: 'Basic dye binding polyribosomes and rough endoplasmic reticulum in neuronal perikaryon (Nissl bodies).',
    specimenType: 'neurohistology',
    typicalSizeUm: 'Soma: 50–90 µm | Nucleus: 20 µm | Axon: ~5 µm width',
    idealMagnification: 40,
    requiresOil: false,
    description: 'Large multipolar motor neuron soma located in the spinal anterior horn with intense basophilic Nissl granules, clear vesicular nucleus with owl-eye nucleolus, axon hillock, and dendrites.',
    keyStructures: ['Neuronal Soma (Perikaryon)', 'Nissl Substance (Rough ER)', 'Vesicular Nucleus & Nucleolus', 'Axon Hillock (Trigger Zone)', 'Supporting Glial Nuclei'],
    clinicalRelevance: 'Crucial for studying amyotrophic lateral sclerosis (ALS), poliomyelitis, chromatolysis following axonal transection, and motor neuropathies.',
  },
}

export interface OrganelleInfo {
  id: string
  name: string
  category: 'Genetic' | 'Energy' | 'Biosynthesis' | 'Digestion' | 'Structural'
  dimensionsNm: string
  membraneCount: number
  primaryFunction: string
  ultrastructureDetails: string
  biochemicalMarker: string
  clinicalPathology: string
  colorHex: string
}

export const ORGANELLE_CATALOG: Record<string, OrganelleInfo> = {
  nucleus: {
    id: 'nucleus',
    name: 'Cell Nucleus & Nucleolus',
    category: 'Genetic',
    dimensionsNm: '5,000–10,000 nm (5–10 µm)',
    membraneCount: 2,
    primaryFunction: 'Harbors nuclear genome, orchestrates DNA replication, transcription, and ribosomal biogenesis.',
    ultrastructureDetails: 'Double nuclear envelope with nuclear pore complexes (NPCs, ~120 nm), dense heterochromatin lining lamina, diffuse euchromatin, and prominent ribonuclear nucleolus.',
    biochemicalMarker: 'Histone H3 / Lamin A/C / RNA Polymerase II',
    clinicalPathology: 'Nuclear atypia (hyperchromasia, enlarged nucleoli) is the diagnostic hallmark of malignancy in histopathology.',
    colorHex: '#3b82f6',
  },
  mitochondria: {
    id: 'mitochondria',
    name: 'Mitochondrion (ATP Powerhouse)',
    category: 'Energy',
    dimensionsNm: '500–2,000 nm (0.5–2 µm)',
    membraneCount: 2,
    primaryFunction: 'Generates cellular ATP via oxidative phosphorylation, regulates intrinsic apoptosis and Krebs cycle.',
    ultrastructureDetails: 'Smooth outer membrane with porins, intermembrane space, deeply invaginated cristae harboring complexes I–V, and inner matrix containing circular mtDNA.',
    biochemicalMarker: 'Cytochrome c Oxidase / ATP Synthase / Citrate Synthase',
    clinicalPathology: 'Mitochondrial myopathies (e.g. MELAS, MERRF) cause "ragged red fibers" on Gomori trichrome histology.',
    colorHex: '#f59e0b',
  },
  rough_er: {
    id: 'rough_er',
    name: 'Rough Endoplasmic Reticulum (RER)',
    category: 'Biosynthesis',
    dimensionsNm: 'Cisternal lumen ~40–50 nm width',
    membraneCount: 1,
    primaryFunction: 'Synthesis, co-translational folding, core N-glycosylation, and quality control of secretory & membrane proteins.',
    ultrastructureDetails: 'Interconnected flattened cisternal sheets studded on cytoplasmic face with dense 80S ribosomes (responsible for basophilic Nissl bodies).',
    biochemicalMarker: 'Calreticulin / BiP (GRP78) / Sec61 Translocon',
    clinicalPathology: 'Persistent ER stress triggers unfolded protein response (UPR) and apoptosis in neurodegenerative diseases.',
    colorHex: '#8b5cf6',
  },
  smooth_er: {
    id: 'smooth_er',
    name: 'Smooth Endoplasmic Reticulum (SER)',
    category: 'Biosynthesis',
    dimensionsNm: 'Tubular network ~30–60 nm diameter',
    membraneCount: 1,
    primaryFunction: 'Lipid and steroid hormone biosynthesis, hepatic xenobiotic detoxification (CYP450), and sarcoplasmic calcium sequestering.',
    ultrastructureDetails: 'Non-ribosome studded branching tubular meshwork continuous with rough ER.',
    biochemicalMarker: 'Cytochrome P450 / Glucose-6-Phosphatase / SERCA ATPase',
    clinicalPathology: 'Massively proliferates in hepatocytes following barbiturate or alcohol exposure due to enzyme induction.',
    colorHex: '#10b981',
  },
  golgi: {
    id: 'golgi',
    name: 'Golgi Apparatus',
    category: 'Biosynthesis',
    dimensionsNm: 'Stack diameter ~1,000 nm',
    membraneCount: 1,
    primaryFunction: 'Post-translational modification (O-glycosylation, phosphorylation, sulfation), sorting, and packaging into secretory granules or lysosomes.',
    ultrastructureDetails: 'Polarized stack of 4–8 curved cisternae with cis-Golgi network (entry from ER), medial cisternae, and trans-Golgi network (TGN, sorting exit).',
    biochemicalMarker: 'Mannosidase II / TGN38 / Galactosyltransferase',
    clinicalPathology: 'Golgi fragmentation occurs early in Alzheimer’s and Parkinson’s motor neuron degeneration.',
    colorHex: '#ec4899',
  },
  lysosome: {
    id: 'lysosome',
    name: 'Lysosome & Peroxisome',
    category: 'Digestion',
    dimensionsNm: '100–1,200 nm',
    membraneCount: 1,
    primaryFunction: 'Degrades macromolecules, damaged organelles (autophagy), and engulfed pathogens via 60+ acid hydrolases (pH ~4.5–5.0).',
    ultrastructureDetails: 'Electron-dense spherical vesicle bounded by single membrane heavily glycosylated on lumenal face (LAMP1/2) to prevent self-digestion.',
    biochemicalMarker: 'Acid Phosphatase / Cathepsin D / LAMP-1',
    clinicalPathology: 'Deficiencies in lysosomal hydrolases cause Lysosomal Storage Diseases (e.g. Tay-Sachs, Gaucher, Pompe disease).',
    colorHex: '#ef4444',
  },
  cytoskeleton: {
    id: 'cytoskeleton',
    name: 'Microtubules & Cytoskeleton',
    category: 'Structural',
    dimensionsNm: 'Microtubules: 25 nm | Actin: 7 nm',
    membraneCount: 0,
    primaryFunction: 'Maintains cell morphology, mediates vesicular trafficking via kinesin/dynein motors, forms mitotic spindle.',
    ultrastructureDetails: 'Hollow cylinder formed by 13 protofilaments of alpha/beta tubulin heterodimers with dynamic plus and minus ends.',
    biochemicalMarker: 'Alpha/Beta Tubulin / F-Actin / Vimentin',
    clinicalPathology: 'Primary target of chemotherapeutic microtubule inhibitors (e.g. Paclitaxel, Vincristine) in oncology.',
    colorHex: '#06b6d4',
  },
  chloroplast: {
    id: 'chloroplast',
    name: 'Chloroplast (Plant Cells)',
    category: 'Energy',
    dimensionsNm: '4,000–6,000 nm (4–6 µm)',
    membraneCount: 3,
    primaryFunction: 'Carries out oxygenic photosynthesis, capturing photons to synthesize carbohydrates via the Calvin cycle.',
    ultrastructureDetails: 'Double envelope membrane surrounding aqueous stroma containing circular cpDNA and stacked disc-like thylakoid grana with chlorophyll.',
    biochemicalMarker: 'RuBisCO (Large Subunit) / Chlorophyll a/b',
    clinicalPathology: 'Vital model for endosymbiotic theory and agricultural photosynthesis bioengineering.',
    colorHex: '#22c55e',
  },
}

export interface MicroscopeState {
  activeSpecimen: SpecimenId
  slideMounted: boolean
  objective: ObjectiveMagnification
  coarseFocus: number // 0 to 100
  fineFocus: number // 0 to 100
  stageX: number // -15 to +15 mm
  stageY: number // -15 to +15 mm
  condenserHeight: number // 0 to 100%
  irisAperture: number // 0 to 100% (contrast vs resolution tradeoff)
  lightIntensity: number // 0 to 100%
  hasImmersionOil: boolean
  viewMode: 'bench' | 'ocular' | 'organelle_3d'
  activeCellType: CellTypeId // Selected 3D cell model: animal, plant, neuron, macrophage, bacterium, erythrocyte
  isSickleCellMode: boolean // Peripheral blood clinical comparison
  isPlasmolysisMode: boolean // Onion epidermis hypertonic osmosis
  activeOrganelle: string | null
  caliperDistanceUm: number | null
}

export interface OpticalParameters {
  magnification: number
  numericalAperture: number
  workingDistanceMm: number
  depthOfFieldUm: number
  resolutionLimitUm: number // Abbe limit: lambda / (2 * NA)
  fieldOfViewDiameterUm: number
  scaleBarLengthUm: number
  scaleBarUnitsPerPixel: number
}

export function getOpticalParameters(
  objective: ObjectiveMagnification,
  hasOil: boolean,
  irisAperture: number
): OpticalParameters {
  const ocularPower = 10
  const totalMag = objective * ocularPower
  const lambda = 0.55 // Green light 550 nm

  let baseNA = 0.1
  let wd = 25.0
  let fov = 4500

  switch (objective) {
    case 4:
      baseNA = 0.10
      wd = 25.0
      fov = 4500
      break
    case 10:
      baseNA = 0.25
      wd = 7.0
      fov = 1800
      break
    case 40:
      baseNA = 0.65
      wd = 0.6
      fov = 450
      break
    case 100:
      // At 100x, if no oil, NA is clamped to 0.72 due to air gap refraction (n=1.0)
      // With oil, NA reaches full 1.25 oil immersion
      baseNA = hasOil ? 1.25 : 0.72
      wd = 0.13
      fov = 180
      break
  }

  // Iris diaphragm modulates effective NA between 0.35 * baseNA and 1.0 * baseNA
  const effectiveNA = Math.max(0.08, baseNA * (0.35 + (irisAperture / 100) * 0.65))
  const resolutionLimitUm = +(lambda / (2 * effectiveNA)).toFixed(2)
  const depthOfFieldUm = +(lambda / (effectiveNA * effectiveNA) + 0.34 / (totalMag * effectiveNA)).toFixed(1)

  let scaleBarLengthUm = 250
  if (objective === 10) scaleBarLengthUm = 100
  if (objective === 40) scaleBarLengthUm = 25
  if (objective === 100) scaleBarLengthUm = 10

  const scaleBarUnitsPerPixel = fov / 500

  return {
    magnification: totalMag,
    numericalAperture: +effectiveNA.toFixed(2),
    workingDistanceMm: wd,
    depthOfFieldUm,
    resolutionLimitUm,
    fieldOfViewDiameterUm: fov,
    scaleBarLengthUm,
    scaleBarUnitsPerPixel,
  }
}

/**
 * Calculates optical focus blur (0 = perfect focus, >0 = blurred)
 * Uses parabolic Z-stack depth with sweet spots calibrated to realistic microscope mechanics
 */
export function calculateFocalBlur(
  coarseFocus: number,
  fineFocus: number,
  objective: ObjectiveMagnification,
  hasOil: boolean
): { blurPx: number; isSweetSpot: boolean; aberrationPenalty: number } {
  // Parfocal sweet spot: coarse focus optimal around 52%
  const optimalCoarse = 52.0
  // Fine focus sweet spot around 50%
  const optimalFine = 50.0

  const coarseDiff = Math.abs(coarseFocus - optimalCoarse)
  const fineDiff = Math.abs(fineFocus - optimalFine)

  let sensitivity = 1.0
  if (objective === 4) sensitivity = 0.4
  if (objective === 10) sensitivity = 0.9
  if (objective === 40) sensitivity = 2.4
  if (objective === 100) sensitivity = 4.8

  let blurPx = (coarseDiff * 0.7 + fineDiff * 0.25) * sensitivity

  // Immersion oil penalty at 100x: severe refractive glare if dry
  let aberrationPenalty = 0
  if (objective === 100 && !hasOil) {
    aberrationPenalty = 12.0 // Severe spherical aberration & contrast loss
    blurPx += 10.0
  }

  const isSweetSpot = blurPx < 1.2
  return {
    blurPx: Math.min(32, Math.max(0, +blurPx.toFixed(1))),
    isSweetSpot,
    aberrationPenalty,
  }
}

// ============================================================
// PROCEDURAL 3D RESEARCH MICROSCOPE APPARATUS BUILDER
// ============================================================

// ============================================================
// COMPOUND MICROSCOPE APPARATUS RIG & INTERACTIVE 3D SYSTEM
// ============================================================

export interface MicroscopeApparatusRig {
  rootGroup: THREE.Group
  stageCarrierGroup: THREE.Group
  stageGroup: THREE.Group
  turretGroup: THREE.Group
  coarseKnobGroup: THREE.Group
  fineKnobGroup: THREE.Group
  condenserGroup: THREE.Group
  slideMesh: THREE.Mesh | null
  oilDropletMesh: THREE.Mesh | null
  illuminatorLight: THREE.PointLight
  stageClipMesh: THREE.Mesh | null
  irisLeverMesh: THREE.Mesh | null
  rheostatMesh: THREE.Mesh | null
  xyUpperKnob: THREE.Mesh | null
  xyLowerKnob: THREE.Mesh | null
  slideBoxGroup: THREE.Group | null
  oilBottleGroup: THREE.Group | null
  interactiveParts: Map<string, THREE.Object3D>
}

export function buildCompoundMicroscopeRig(): MicroscopeApparatusRig {
  const root = new THREE.Group()
  root.position.set(0, 0, 0)
  const interactiveParts = new Map<string, THREE.Object3D>()

  // Premium Laboratory PBR Materials
  const whiteEnamelMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.16,
    metalness: 0.08,
  })

  const blackAnodizedMat = new THREE.MeshStandardMaterial({
    color: 0x111418,
    roughness: 0.22,
    metalness: 0.85,
  })

  const knurledGripMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.65,
    metalness: 0.45,
  })

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.08,
    metalness: 0.96,
  })

  const opticalGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96,
    opacity: 1,
    transparent: true,
    roughness: 0.02,
    ior: 1.515, // Crown optical glass
    thickness: 0.04,
  })

  // ------------------------------------------------------------
  // 1. Heavy Base Platform (Trapezoidal Cast Alloy Foot)
  // ------------------------------------------------------------
  const baseGroup = new THREE.Group()
  
  // Cast base foot
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.36), whiteEnamelMat)
  baseMesh.position.set(0, 0.025, 0.01)
  baseMesh.castShadow = true
  baseMesh.receiveShadow = true
  baseGroup.add(baseMesh)

  // 4 Vibration-Damping Rubber Foot Pads
  const footGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.008, 16)
  const footMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85 })
  const footCoords: [number, number, number][] = [
    [-0.10, 0.004, -0.14],
    [0.10, 0.004, -0.14],
    [-0.11, 0.004, 0.16],
    [0.11, 0.004, 0.16],
  ]
  footCoords.forEach(([fx, fy, fz]) => {
    const foot = new THREE.Mesh(footGeom, footMat)
    foot.position.set(fx, fy, fz)
    baseGroup.add(foot)
  })

  // Kohler Field Diaphragm Bezel & Collector Lens (on base top front)
  const fieldDiaphragmBezel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.044, 0.016, 32),
    blackAnodizedMat
  )
  fieldDiaphragmBezel.position.set(0, 0.058, 0.07)
  baseGroup.add(fieldDiaphragmBezel)

  const illuminatorLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.030, 0.030, 0.006, 32),
    opticalGlassMat
  )
  illuminatorLens.position.set(0, 0.063, 0.07)
  baseGroup.add(illuminatorLens)

  // Upward Transmitted Light Source
  const illuminatorLight = new THREE.PointLight(0xfff7ed, 2.2, 1.4)
  illuminatorLight.position.set(0, 0.08, 0.07)
  baseGroup.add(illuminatorLight)

  // Power Rocker Switch (Rear Left of Base)
  const powerSwitch = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.012, 0.028),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 })
  )
  powerSwitch.position.set(-0.115, 0.045, -0.12)
  powerSwitch.userData = {
    id: 'microscope_power_switch',
    label: 'Microscope Illuminator Power (I/O)',
    interactive: true,
    interactionType: 'microscope_rheostat',
  }
  baseGroup.add(powerSwitch)
  interactiveParts.set('microscope_power_switch', powerSwitch)

  // Continuous Rotary Lamp Rheostat Dimmer Dial (Right side of Base)
  const rheostatMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.014, 24),
    knurledGripMat
  )
  rheostatMesh.rotation.z = Math.PI / 2
  rheostatMesh.position.set(0.134, 0.025, 0.08)
  rheostatMesh.userData = {
    id: 'microscope_rheostat',
    label: 'Illumination Rheostat Dimmer (Drag to adjust brightness)',
    interactive: true,
    interactionType: 'microscope_rheostat',
  }
  baseGroup.add(rheostatMesh)
  interactiveParts.set('microscope_rheostat', rheostatMesh)

  root.add(baseGroup)

  // ------------------------------------------------------------
  // 2. Rigid Structural Arm Pillar & Vertical Precision Dovetail Rail
  // ------------------------------------------------------------
  const armGroup = new THREE.Group()

  // Cast Alloy Pillar Column (firmly anchored to rear base)
  const armPillar = new THREE.Mesh(
    new THREE.BoxGeometry(0.088, 0.36, 0.12),
    whiteEnamelMat
  )
  armPillar.position.set(0, 0.21, -0.11)
  armPillar.castShadow = true
  armPillar.receiveShadow = true
  armGroup.add(armPillar)

  // Upper Forward Neck & Head Carrier (seamless connection to pillar)
  const armArch = new THREE.Mesh(
    new THREE.BoxGeometry(0.082, 0.08, 0.22),
    whiteEnamelMat
  )
  armArch.position.set(0, 0.39, -0.02)
  armArch.castShadow = true
  armGroup.add(armArch)

  // Nosepiece Carrier Block (above optical axis)
  const noseCarrier = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.052, 0.08, 32),
    whiteEnamelMat
  )
  noseCarrier.position.set(0, 0.385, 0.07)
  armGroup.add(noseCarrier)

  // Precision Steel Vertical Dovetail Guide Rail (on front face of pillar)
  const dovetailRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.052, 0.24, 0.018),
    chromeMat
  )
  dovetailRail.position.set(0, 0.20, -0.045)
  dovetailRail.castShadow = true
  armGroup.add(dovetailRail)

  // Brass Rack-and-Pinion Gear Teeth Strip on Rail
  const rackStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.22, 0.008),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 })
  )
  rackStrip.position.set(0.022, 0.20, -0.035)
  armGroup.add(rackStrip)

  root.add(armGroup)

  // ------------------------------------------------------------
  // 3. Concentric Coaxial Focus Control Knobs (Left & Right)
  // ------------------------------------------------------------
  const coarseKnobGroup = new THREE.Group()
  const fineKnobGroup = new THREE.Group()

  const coarseGeom = new THREE.CylinderGeometry(0.036, 0.036, 0.024, 32)
  const fineGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.038, 32)

  // Left Side Knobs
  const coarseLeft = new THREE.Mesh(coarseGeom, knurledGripMat)
  coarseLeft.rotation.z = Math.PI / 2
  coarseLeft.position.set(-0.070, 0.16, -0.09)
  coarseLeft.userData = {
    id: 'microscope_coarse_knob',
    label: 'Coarse Focus Knob (Drag vertically to adjust stage height)',
    interactive: true,
    interactionType: 'microscope_coarse_knob',
  }
  coarseKnobGroup.add(coarseLeft)
  interactiveParts.set('microscope_coarse_knob_left', coarseLeft)

  const fineLeft = new THREE.Mesh(fineGeom, blackAnodizedMat)
  fineLeft.rotation.z = Math.PI / 2
  fineLeft.position.set(-0.084, 0.16, -0.09)
  fineLeft.userData = {
    id: 'microscope_fine_knob',
    label: 'Fine Focus Knob (Drag vertically for micro-tuning)',
    interactive: true,
    interactionType: 'microscope_fine_knob',
  }
  fineKnobGroup.add(fineLeft)
  interactiveParts.set('microscope_fine_knob_left', fineLeft)

  // Right Side Knobs
  const coarseRight = new THREE.Mesh(coarseGeom, knurledGripMat)
  coarseRight.rotation.z = Math.PI / 2
  coarseRight.position.set(0.070, 0.16, -0.09)
  coarseRight.userData = {
    id: 'microscope_coarse_knob',
    label: 'Coarse Focus Knob (Drag vertically to adjust stage height)',
    interactive: true,
    interactionType: 'microscope_coarse_knob',
  }
  coarseKnobGroup.add(coarseRight)
  interactiveParts.set('microscope_coarse_knob_right', coarseRight)

  const fineRight = new THREE.Mesh(fineGeom, blackAnodizedMat)
  fineRight.rotation.z = Math.PI / 2
  fineRight.position.set(0.084, 0.16, -0.09)
  fineRight.userData = {
    id: 'microscope_fine_knob',
    label: 'Fine Focus Knob (Drag vertically for micro-tuning)',
    interactive: true,
    interactionType: 'microscope_fine_knob',
  }
  fineKnobGroup.add(fineRight)
  interactiveParts.set('microscope_fine_knob_right', fineRight)

  // Central Transverse Steel Axle Shaft through Arm
  const transverseShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.17, 16),
    chromeMat
  )
  transverseShaft.rotation.z = Math.PI / 2
  transverseShaft.position.set(0, 0.16, -0.09)
  armGroup.add(transverseShaft)

  root.add(coarseKnobGroup)
  root.add(fineKnobGroup)

  // ------------------------------------------------------------
  // 4. Heavy-Duty Stage Carrier Assembly (Rides vertically on Rail)
  // ------------------------------------------------------------
  const stageCarrierGroup = new THREE.Group()
  stageCarrierGroup.position.set(0, 0.205, 0) // Default focus height

  // Cast Alloy Dovetail Slide Shoe (Clamps onto Dovetail Rail)
  const carrierShoe = new THREE.Mesh(
    new THREE.BoxGeometry(0.084, 0.085, 0.038),
    whiteEnamelMat
  )
  carrierShoe.position.set(0, 0, -0.035)
  carrierShoe.castShadow = true
  stageCarrierGroup.add(carrierShoe)

  // Forward Cantilever Support Gusset (Extends forward directly under stage)
  const carrierGusset = new THREE.Mesh(
    new THREE.BoxGeometry(0.068, 0.040, 0.12),
    whiteEnamelMat
  )
  carrierGusset.position.set(0, -0.02, 0.03)
  carrierGusset.castShadow = true
  stageCarrierGroup.add(carrierGusset)

  // ------------------------------------------------------------
  // 5. Mechanical Stage Assembly (Mounted ON Carrier Gusset)
  // ------------------------------------------------------------
  const stageGroup = new THREE.Group()
  stageGroup.position.set(0, 0.008, 0.07) // On optical axis at z=0.07

  // Main Stage Plate (140mm x 130mm anodized black plate)
  const stagePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.014, 0.13),
    blackAnodizedMat
  )
  stagePlate.castShadow = true
  stagePlate.receiveShadow = true
  stagePlate.userData = {
    id: 'microscope_stage',
    label: 'Mechanical Stage Plate (Drag to pan specimen field in X/Y)',
    interactive: true,
    interactionType: 'microscope_stage',
  }
  stageGroup.add(stagePlate)
  interactiveParts.set('microscope_stage', stagePlate)

  // Center Condenser Aperture Ring
  const stageAperture = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.016, 32),
    new THREE.MeshBasicMaterial({ color: 0x050508 })
  )
  stagePlate.add(stageAperture)

  // Vernier Scale Plates (Etched millimeters on stage surface)
  const vernierPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.045, 0.012),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
  )
  vernierPlate.rotation.x = -Math.PI / 2
  vernierPlate.position.set(0.045, 0.0076, -0.045)
  stageGroup.add(vernierPlate)

  // Curved Spring-Loaded Mechanical Stage Slide Clip
  const clipCurve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0028, 0.0028, 0.072, 16),
    chromeMat
  )
  clipCurve.rotation.z = Math.PI / 3
  clipCurve.position.set(-0.042, 0.012, 0.02)
  clipCurve.userData = {
    id: 'microscope_stage_clip',
    label: 'Mechanical Stage Specimen Caliper Clip',
    interactive: true,
    interactionType: 'microscope_stage_clip',
  }
  stageGroup.add(clipCurve)
  const stageClipMesh = clipCurve
  interactiveParts.set('microscope_stage_clip', stageClipMesh)

  // Drop-down Coaxial X-Y Mechanical Drive Knobs (Right Side)
  const xyDropStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.062, 16),
    chromeMat
  )
  xyDropStem.position.set(0.068, -0.032, 0.035)
  stageGroup.add(xyDropStem)

  const xyUpperKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.024, 24),
    knurledGripMat
  )
  xyUpperKnob.position.set(0.068, -0.040, 0.035)
  xyUpperKnob.userData = {
    id: 'microscope_xy_upper',
    label: 'Coaxial Stage X-Axis Drive Knob (Drag horizontally to translate)',
    interactive: true,
    interactionType: 'microscope_xy_knobs',
  }
  stageGroup.add(xyUpperKnob)
  interactiveParts.set('microscope_xy_upper', xyUpperKnob)

  const xyLowerKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.010, 0.010, 0.020, 24),
    knurledGripMat
  )
  xyLowerKnob.position.set(0.068, -0.058, 0.035)
  xyLowerKnob.userData = {
    id: 'microscope_xy_lower',
    label: 'Coaxial Stage Y-Axis Drive Knob (Drag vertically to translate)',
    interactive: true,
    interactionType: 'microscope_xy_knobs',
  }
  stageGroup.add(xyLowerKnob)
  interactiveParts.set('microscope_xy_lower', xyLowerKnob)

  // Mounted Specimen Slide (75mm x 25mm Standard Glass Slide)
  const slideGeom = new THREE.BoxGeometry(0.075, 0.0018, 0.025)
  const slideMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transmission: 0.94,
    opacity: 0.9,
    transparent: true,
    roughness: 0.04,
    ior: 1.515,
  })
  const slideMesh = new THREE.Mesh(slideGeom, slideMat)
  slideMesh.position.set(0, 0.0085, 0)
  slideMesh.castShadow = true
  slideMesh.userData = {
    id: 'microscope_slide',
    label: 'Mounted Prepared Specimen Glass Slide (Click to remove/swap)',
    interactive: true,
    interactionType: 'microscope_slide',
  }
  stageGroup.add(slideMesh)
  interactiveParts.set('microscope_slide', slideMesh)

  // Square Coverslip (18mm x 18mm square in center)
  const coverslipMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.0006, 0.018),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.98, transparent: true })
  )
  coverslipMesh.position.set(0, 0.0012, 0)
  slideMesh.add(coverslipMesh)

  // Stained Biological Specimen Dot in center of coverslip
  const specimenDot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0055, 0.0008, 24),
    new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Wright-Giemsa purple
      roughness: 0.45,
      transparent: true,
      opacity: 0.9,
    })
  )
  specimenDot.position.set(0, 0.0007, 0)
  coverslipMesh.add(specimenDot)

  // Dynamic Immersion Oil Droplet Mesh (between coverslip and 100x lens)
  const oilDropGeom = new THREE.SphereGeometry(0.0034, 24, 16)
  oilDropGeom.scale(1, 0.45, 1)
  const oilDropMat = new THREE.MeshPhysicalMaterial({
    color: 0xfef08a,
    transmission: 0.88,
    transparent: true,
    roughness: 0.02,
    ior: 1.518, // Synthetic immersion oil
  })
  const oilDropletMesh = new THREE.Mesh(oilDropGeom, oilDropMat)
  oilDropletMesh.position.set(0, 0.0024, 0)
  oilDropletMesh.visible = false
  coverslipMesh.add(oilDropletMesh)

  stageCarrierGroup.add(stageGroup)

  // ------------------------------------------------------------
  // 6. Sub-Stage Abbe Condenser Assembly (Bolted UNDER Carrier Gusset)
  // ------------------------------------------------------------
  const condenserGroup = new THREE.Group()
  condenserGroup.position.set(0, -0.050, 0.07) // Suspended right below the stage

  // Condenser Mounting Bracket Tube
  const condenserBracket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.030, 0.028, 32),
    blackAnodizedMat
  )
  condenserGroup.add(condenserBracket)

  // Abbe Condenser Optical Barrel (NA 1.25)
  const condenserBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.026, 0.034, 32),
    chromeMat
  )
  condenserBarrel.position.set(0, 0.015, 0)
  condenserGroup.add(condenserBarrel)

  // Condenser Top Optical Lens Element
  const condenserTopLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.004, 32),
    opticalGlassMat
  )
  condenserTopLens.position.set(0, 0.033, 0)
  condenserGroup.add(condenserTopLens)

  // Aperture Iris Diaphragm Lever (Chrome rod protruding from condenser side)
  const irisLeverMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0026, 0.0026, 0.036, 12),
    chromeMat
  )
  irisLeverMesh.rotation.z = Math.PI / 2
  irisLeverMesh.position.set(0.028, 0, 0)
  irisLeverMesh.userData = {
    id: 'microscope_iris_lever',
    label: 'Condenser Iris Diaphragm Lever (Drag horizontally to adjust contrast/NA)',
    interactive: true,
    interactionType: 'microscope_iris_lever',
  }
  condenserGroup.add(irisLeverMesh)
  interactiveParts.set('microscope_iris_lever', irisLeverMesh)

  // Blue Daylight Optical Filter Swing-out Ring
  const blueFilter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.004, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.88,
      transparent: true,
      roughness: 0.05,
    })
  )
  blueFilter.position.set(0, -0.018, 0)
  condenserGroup.add(blueFilter)

  stageCarrierGroup.add(condenserGroup)
  root.add(stageCarrierGroup)

  // ------------------------------------------------------------
  // 7. Revolving Quadruple Objective Turret (Nosepiece)
  // ------------------------------------------------------------
  const turretGroup = new THREE.Group()
  turretGroup.position.set(0, 0.355, 0.07) // Optical center

  // Central Knurled Turret Dome
  const turretDome = new THREE.Mesh(
    new THREE.CylinderGeometry(0.046, 0.052, 0.022, 32),
    blackAnodizedMat
  )
  turretDome.userData = {
    id: 'microscope_turret',
    label: 'Revolving Objective Turret (Click or drag to switch objective lens)',
    interactive: true,
    interactionType: 'microscope_turret',
  }
  turretGroup.add(turretDome)
  interactiveParts.set('microscope_turret', turretDome)

  const turretGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.049, 0.049, 0.008, 32),
    knurledGripMat
  )
  turretGroup.add(turretGrip)

  // 4 Plan-Achromatic Objectives with DIN Standard Color Rings
  const objectiveConfigs: {
    power: ObjectiveMagnification
    angle: number
    ringColor: number
    length: number
    label: string
  }[] = [
    { power: 4, angle: 0, ringColor: 0xef4444, length: 0.038, label: 'Plan 4x / 0.10 NA (Red)' },
    { power: 10, angle: Math.PI / 2, ringColor: 0xeab308, length: 0.046, label: 'Plan 10x / 0.25 NA (Yellow)' },
    { power: 40, angle: Math.PI, ringColor: 0x3b82f6, length: 0.055, label: 'Plan 40x / 0.65 NA (Blue)' },
    { power: 100, angle: (3 * Math.PI) / 2, ringColor: 0xf8fafc, length: 0.058, label: 'Plan 100x / 1.25 NA Oil (White)' },
  ]

  objectiveConfigs.forEach((cfg) => {
    const objGroup = new THREE.Group()
    const rad = 0.035
    objGroup.position.set(Math.cos(cfg.angle) * rad, -cfg.length / 2, Math.sin(cfg.angle) * rad)
    // Incline objectives slightly outwards (DIN standard 15 degrees)
    objGroup.rotation.z = Math.cos(cfg.angle) * 0.15
    objGroup.rotation.x = Math.sin(cfg.angle) * 0.15

    // Chrome/brass main barrel
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.011, cfg.length, 24),
      chromeMat
    )
    barrel.userData = {
      id: `microscope_objective_${cfg.power}`,
      label: `${cfg.label} (Click to select)`,
      interactive: true,
      interactionType: 'microscope_turret',
    }
    objGroup.add(barrel)
    interactiveParts.set(`microscope_objective_${cfg.power}`, barrel)

    // DIN Color Identification Ring
    const colorRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0112, 0.0112, 0.004, 24),
      new THREE.MeshStandardMaterial({ color: cfg.ringColor, roughness: 0.3 })
    )
    colorRing.position.set(0, -cfg.length * 0.25, 0)
    objGroup.add(colorRing)

    // Objective Front Optical Lens
    const frontLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.002, 16),
      opticalGlassMat
    )
    frontLens.position.set(0, -cfg.length / 2, 0)
    objGroup.add(frontLens)

    turretGroup.add(objGroup)
  })

  root.add(turretGroup)

  // ------------------------------------------------------------
  // 8. Siedentopf Binocular Viewing Head (30° Inclined) & Dual Eyepieces
  // ------------------------------------------------------------
  const headGroup = new THREE.Group()
  headGroup.position.set(0, 0.40, 0.07)

  // Circular Dovetail Clamp Ring (Clamps head to top of arm)
  const headClampRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.046, 0.048, 0.018, 32),
    blackAnodizedMat
  )
  headClampRing.position.set(0, 0.009, 0)
  headGroup.add(headClampRing)

  // Head Lock Thumbscrew on right side
  const headLockScrew = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.014, 16),
    chromeMat
  )
  headLockScrew.rotation.z = Math.PI / 2
  headLockScrew.position.set(0.052, 0.009, 0)
  headGroup.add(headLockScrew)

  // Head Base Casing
  const headCasing = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.06, 0.10),
    whiteEnamelMat
  )
  headCasing.position.set(0, 0.038, -0.01)
  headGroup.add(headCasing)

  // Vertical Trinocular Photo Port (for C-mount HD digital camera)
  const photoPort = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.016, 0.045, 24),
    blackAnodizedMat
  )
  photoPort.position.set(0, 0.088, -0.02)
  headGroup.add(photoPort)

  // Digital CMOS Camera Attached to Photo Port
  const cmosCamera = new THREE.Mesh(
    new THREE.BoxGeometry(0.046, 0.036, 0.046),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.65 })
  )
  cmosCamera.position.set(0, 0.128, -0.02)
  headGroup.add(cmosCamera)

  // Dual Eyepiece Tubes (30° forward tilt, 65mm Siedentopf interpupillary distance)
  const leftEyepieceGroup = new THREE.Group()
  leftEyepieceGroup.position.set(-0.032, 0.065, 0.04)
  leftEyepieceGroup.rotation.x = Math.PI / 6

  const rightEyepieceGroup = new THREE.Group()
  rightEyepieceGroup.position.set(0.032, 0.065, 0.04)
  rightEyepieceGroup.rotation.x = Math.PI / 6

  const tubeGeom = new THREE.CylinderGeometry(0.013, 0.014, 0.075, 24)
  const cupGeom = new THREE.CylinderGeometry(0.017, 0.014, 0.016, 24)
  const cupMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 })

  // Left Eyepiece
  const tubeLeft = new THREE.Mesh(tubeGeom, blackAnodizedMat)
  tubeLeft.position.set(0, 0.037, 0)
  leftEyepieceGroup.add(tubeLeft)
  const eyecupLeft = new THREE.Mesh(cupGeom, cupMat)
  eyecupLeft.position.set(0, 0.075, 0)
  leftEyepieceGroup.add(eyecupLeft)

  // Right Eyepiece
  const tubeRight = new THREE.Mesh(tubeGeom, blackAnodizedMat)
  tubeRight.position.set(0, 0.037, 0)
  rightEyepieceGroup.add(tubeRight)
  const eyecupRight = new THREE.Mesh(cupGeom, cupMat)
  eyecupRight.position.set(0, 0.075, 0)
  rightEyepieceGroup.add(eyecupRight)

  headGroup.add(leftEyepieceGroup)
  headGroup.add(rightEyepieceGroup)

  root.add(headGroup)

  // ------------------------------------------------------------
  // 9. Laboratory Bench Accessories
  // ------------------------------------------------------------
  
  // Prepared Slide Storage Box (on left bench holding 6 slides)
  const slideBoxGroup = new THREE.Group()
  slideBoxGroup.position.set(-0.34, 0.02, 0.12)

  const boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.04, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4 })
  )
  slideBoxGroup.add(boxMesh)

  const boxLid = new THREE.Mesh(
    new THREE.BoxGeometry(0.145, 0.01, 0.185),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3 })
  )
  boxLid.position.set(0, 0.025, 0)
  slideBoxGroup.add(boxLid)

  // 6 Prepared Glass Slides Inside/Next to Box
  const slideIds: SpecimenId[] = [
    'blood_smear',
    'onion_epidermis',
    'gram_stain',
    'cheek_epithelium',
    'allium_mitosis',
    'motor_neuron',
  ]
  slideIds.forEach((sId, idx) => {
    const sMini = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.0016, 0.018),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.85, transparent: true })
    )
    sMini.position.set(-0.04 + (idx % 2) * 0.05, 0.032, -0.06 + Math.floor(idx / 2) * 0.04)
    sMini.userData = {
      id: `microscope_slide_box_${sId}`,
      label: `Prepared Slide: ${SPECIMEN_CATALOG[sId].name} (Click to load onto stage)`,
      interactive: true,
      interactionType: 'microscope_slide_box',
      specimenId: sId,
    }
    slideBoxGroup.add(sMini)
    interactiveParts.set(`microscope_slide_box_${sId}`, sMini)
  })

  root.add(slideBoxGroup)

  // Synthetic Immersion Oil Bottle with Dropper (on right bench)
  const oilBottleGroup = new THREE.Group()
  oilBottleGroup.position.set(0.32, 0.035, 0.15)

  const bottleBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.020, 0.065, 24),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, transparent: true, opacity: 0.88 })
  )
  oilBottleGroup.add(bottleBody)

  const bottleCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.014, 0.022, 24),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
  )
  bottleCap.position.set(0, 0.042, 0)
  oilBottleGroup.add(bottleCap)

  const pipetteBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.009, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
  )
  pipetteBulb.position.set(0, 0.058, 0)
  oilBottleGroup.add(pipetteBulb)

  bottleBody.userData = {
    id: 'microscope_oil_bottle',
    label: 'Synthetic Immersion Oil Dropper Bottle (Click to apply oil onto slide)',
    interactive: true,
    interactionType: 'microscope_oil_bottle',
  }
  oilBottleGroup.userData = {
    id: 'microscope_oil_bottle',
    label: 'Synthetic Immersion Oil Dropper Bottle (Click to apply oil onto slide)',
    interactive: true,
    interactionType: 'microscope_oil_bottle',
  }
  interactiveParts.set('microscope_oil_bottle', bottleBody)

  root.add(oilBottleGroup)

  // Laboratory Bench Surface Plate (Polished Granite / Epoxy Resin Worktop)
  const benchPlate = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.04, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.28, metalness: 0.18 })
  )
  benchPlate.position.set(0, -0.02, 0)
  benchPlate.receiveShadow = true
  root.add(benchPlate)

  return {
    rootGroup: root,
    stageCarrierGroup,
    stageGroup,
    turretGroup,
    coarseKnobGroup,
    fineKnobGroup,
    condenserGroup,
    slideMesh,
    oilDropletMesh,
    illuminatorLight,
    stageClipMesh,
    irisLeverMesh,
    rheostatMesh,
    xyUpperKnob,
    xyLowerKnob,
    slideBoxGroup,
    oilBottleGroup,
    interactiveParts,
  }
}

// ============================================================
// COMPREHENSIVE MULTI-CELL 3D ARCHITECTURE & ORGANELLE CATALOG
// ============================================================

export type CellTypeId =
  | 'animal'
  | 'plant'
  | 'neuron'
  | 'macrophage'
  | 'bacterium'
  | 'erythrocyte'

export interface OrganelleDetail {
  id: string
  name: string
  biochemicalMarker: string
  ultrastructure: string
  function: string
  clinicalPathology: string
  position: [number, number, number]
  colorHex: string
}

export interface CellModelDefinition {
  id: CellTypeId
  name: string
  scientificCategory: string
  modelUrl?: string
  scale: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  dimensionsUm: string
  description: string
  isProcedural?: boolean
  organelles: OrganelleDetail[]
}

export const CELL_MODELS_CATALOG: Record<CellTypeId, CellModelDefinition> = {
  animal: {
    id: 'animal',
    name: 'Mammalian Eukaryotic Cell',
    scientificCategory: 'Animal Cytology (NIH 3D Model)',
    modelUrl: '/models/cells/animal-cell-nih.glb',
    scale: [0.0055, 0.0055, 0.0055],
    position: [0, 0.35, 0],
    rotation: [0, 0, 0],
    dimensionsUm: 'Diameter: 15–25 µm',
    description: 'High-resolution NIH 3D model cross-section of a mammalian eukaryotic cell displaying nuclear pores, dense nucleolus, double-membrane mitochondria with cristae, and secretory endomembrane system.',
    organelles: [
      {
        id: 'nucleus',
        name: 'Cell Nucleus & Nucleolus',
        biochemicalMarker: 'Histone H3 & Fibrillarin',
        ultrastructure: 'Double nuclear envelope with nuclear pore complexes (NPCs) enclosing dense fibrillar nucleolar RNA transcription centers.',
        function: 'Stores genomic chromatin; orchestrates ribosomal RNA transcription and pre-ribosome assembly.',
        clinicalPathology: 'Dysplastic enlarged nucleoli and irregular nuclear membranes are cardinal hallmarks of malignant carcinoma.',
        position: [-0.05, 0.38, -0.02],
        colorHex: '#3b82f6',
      },
      {
        id: 'mitochondria',
        name: 'Mitochondria (Inner Cristae)',
        biochemicalMarker: 'Cytochrome c Oxidase & ATP Synthase F1F0',
        ultrastructure: 'Outer permeable membrane and inner cardiolipin-rich folded cristae enclosing mitochondrial matrix DNA.',
        function: 'Generates cellular ATP via oxidative phosphorylation and the electron transport chain; regulates intrinsic apoptosis.',
        clinicalPathology: 'Mitochondrial encephalomyopathies (MELAS syndrome), Leber hereditary optic neuropathy.',
        position: [0.22, 0.28, 0.12],
        colorHex: '#f59e0b',
      },
      {
        id: 'rough_er',
        name: 'Rough Endoplasmic Reticulum (RER)',
        biochemicalMarker: 'Ribophorin I & Calnexin',
        ultrastructure: 'Interconnected flattened cisternal sheets studded with 80S ribosomes on the cytosolic leaflet.',
        function: 'Translates, folds, and N-glycosylates secretory, lysosomal, and integral membrane proteins.',
        clinicalPathology: 'ER stress induces unfolded protein response (UPR) implicated in neurodegenerative diseases and diabetes.',
        position: [-0.18, 0.32, 0.08],
        colorHex: '#8b5cf6',
      },
      {
        id: 'golgi',
        name: 'Golgi Apparatus (Cis / Trans)',
        biochemicalMarker: 'Mannosidase II & Galactosyltransferase',
        ultrastructure: 'Polarized stack of 4–6 curved cisternae with budding COPI/COPII vesicles and trans-Golgi sorting network.',
        function: 'Post-translational O-linked glycosylation, sulfation, and sorting of proteins to lysosomes or secretory granules.',
        clinicalPathology: 'Congenital disorders of glycosylation (CDG syndromes), I-cell disease (phosphotransferase deficiency).',
        position: [0.18, 0.42, -0.10],
        colorHex: '#ec4899',
      },
      {
        id: 'lysosome',
        name: 'Lysosome & Peroxisome',
        biochemicalMarker: 'Acid Phosphatase & LAMP-1',
        ultrastructure: 'Acidic lumen (pH 4.5–5.0) maintained by v-ATPase proton pumps, packed with >50 acid hydrolases.',
        function: 'Degrades endocytosed macromolecules, cellular debris, and autophagic cargo.',
        clinicalPathology: 'Lysosomal storage diseases including Tay-Sachs, Gaucher, and Pompe disease.',
        position: [-0.15, 0.48, 0.14],
        colorHex: '#ef4444',
      },
    ],
  },
  plant: {
    id: 'plant',
    name: 'Plant Cell (Mesophyll / Allium)',
    scientificCategory: 'Plant Cytology (High-Res 3D Model)',
    modelUrl: '/models/cells/plant-cell.glb',
    scale: [0.08, 0.08, 0.08],
    position: [0, 0.35, 0],
    rotation: [0, 0, 0],
    dimensionsUm: 'Dimensions: 30–80 µm',
    description: 'Authentic 3D model of a photosynthetic plant cell featuring a rigid polyhedral cellulose cell wall, large central fluid vacuole maintaining turgor pressure, and thylakoid-stacked chloroplasts.',
    organelles: [
      {
        id: 'cell_wall',
        name: 'Cellulose Cell Wall & Middle Lamella',
        biochemicalMarker: 'Cellulose Synthase (CESA) & Pectin',
        ultrastructure: 'Microfibrillar crystalline cellulose network embedded in hemicellulose and calcium pectate matrix.',
        function: 'Resists internal osmotic turgor pressure; provides tensile architectural support and pathogen barrier.',
        clinicalPathology: 'Target of agricultural herbicides; essential for plant growth and transpiration mechanics.',
        position: [0, 0.65, 0],
        colorHex: '#22c55e',
      },
      {
        id: 'central_vacuole',
        name: 'Central Vacuole (Tonoplast)',
        biochemicalMarker: 'V-PPase & Aquaporin (TIPs)',
        ultrastructure: 'Single bounding tonoplast lipid bilayer enclosing hydrostatic cell sap, ions, and secondary metabolites.',
        function: 'Maintains hydrostatic turgor pressure; stores hydrolytic enzymes, pigments (anthocyanins), and nutrient reserves.',
        clinicalPathology: 'Loss of turgor in hypertonic solute induces acute plasmolysis (cytoplasmic detachment).',
        position: [0.02, 0.35, 0.02],
        colorHex: '#38bdf8',
      },
      {
        id: 'chloroplast',
        name: 'Chloroplast (Thylakoids & Stroma)',
        biochemicalMarker: 'RuBisCO & Chlorophyll a/b',
        ultrastructure: 'Double envelope enclosing stroma, stacked granal thylakoids containing photosystems I and II.',
        function: 'Drives oxygenic photosynthesis: light reactions synthesize ATP/NADPH, Calvin cycle fixes CO2 into sucrose.',
        clinicalPathology: 'Chlorosis caused by magnesium or iron deficiency; herbicide inhibition of Photosystem II.',
        position: [-0.25, 0.38, 0.15],
        colorHex: '#16a34a',
      },
      {
        id: 'nucleus',
        name: 'Plant Nucleus & Chromatin',
        biochemicalMarker: 'Histone H2B & DAPI Fluorescence',
        ultrastructure: 'Peripherally displaced eukaryotic nucleus compressed against the rigid wall by the central vacuole.',
        function: 'Houses genetic program regulating developmental morphogen gradients and circadian cycles.',
        clinicalPathology: 'Polyploidy in crop varieties; endoreduplication in vascular tissues.',
        position: [0.28, 0.32, -0.12],
        colorHex: '#60a5fa',
      },
    ],
  },
  neuron: {
    id: 'neuron',
    name: 'Multipolar Motor Neuron',
    scientificCategory: 'Neurohistology (NIH 3D Model)',
    modelUrl: '/models/cells/neuron-nih.glb',
    scale: [0.012, 0.012, 0.012],
    position: [0, 0.35, 0],
    rotation: [0, 0, 0],
    dimensionsUm: 'Soma: 50–100 µm | Axon: Up to 1 Meter',
    description: 'National Institutes of Health 3D model of an alpha motor neuron showing extensive multipolar dendritic arborization, pyramidal soma, unmyelinated axon hillock initial segment, and long axon.',
    organelles: [
      {
        id: 'soma',
        name: 'Stellate Soma & Nissl Granules',
        biochemicalMarker: 'Choline Acetyltransferase (ChAT) & NeuN',
        ultrastructure: 'Extensive ribosomal/RER basophilic clumps (Nissl bodies) surrounding a large vesicular euchromatic nucleus.',
        function: 'Synthesizes neurotransmitter precursors and maintains axonal metabolic homeostasis.',
        clinicalPathology: 'Chromatolysis and motor neuron degeneration in Amyotrophic Lateral Sclerosis (ALS) and Poliomyelitis.',
        position: [0, 0.35, 0],
        colorHex: '#a855f7',
      },
      {
        id: 'dendrites',
        name: 'Dendritic Tree & Postsynaptic Spines',
        biochemicalMarker: 'MAP2 (Microtubule-Associated Protein 2)',
        ultrastructure: 'Tapering processes covered with mushroom-shaped dendritic spines containing postsynaptic density (PSD-95).',
        function: 'Receives convergent synaptic inputs (EPSPs and IPSPs) from interneurons and descending pyramidal tracts.',
        clinicalPathology: 'Loss of dendritic spines correlates directly with cognitive impairment and neurotrauma.',
        position: [-0.30, 0.52, -0.15],
        colorHex: '#c084fc',
      },
      {
        id: 'axon_hillock',
        name: 'Axon Hillock & Initial Segment (AIS)',
        biochemicalMarker: 'Voltage-Gated Na+ Channels (Nav1.6) & Ankyrin-G',
        ultrastructure: 'Conical region devoid of Nissl bodies; dense subaxolemmal actin-spectrin cytoskeleton.',
        function: 'Integration zone that sums dendritic potentials to generate all-or-none action potentials.',
        clinicalPathology: 'AIS disruption by focal cerebral ischemia or autoimmune channelopathies.',
        position: [0.15, 0.22, 0.12],
        colorHex: '#e11d48',
      },
    ],
  },
  macrophage: {
    id: 'macrophage',
    name: 'Leukocyte / Amoeboid Macrophage',
    scientificCategory: 'Immunology (High-Res 3D Model)',
    modelUrl: '/models/cells/white-blood-cell.glb',
    scale: [0.08, 0.08, 0.08],
    position: [0, 0.35, 0],
    rotation: [0, 0, 0],
    dimensionsUm: 'Diameter: 18–25 µm',
    description: 'Dynamic 3D model of an activated tissue macrophage featuring ruffled lamellipodia, phagocytic cups, abundant digestive phagolysosomes, and lobulated nucleus.',
    organelles: [
      {
        id: 'pseudopodia',
        name: 'Ruffled Lamellipodia & Pseudopodia',
        biochemicalMarker: 'F-Actin & Arp2/3 Complex',
        ultrastructure: 'Dynamic branching filamentous actin meshwork pushing against the flexible plasma membrane.',
        function: 'Mediates directional chemotactic migration toward complement fragments (C5a) and phagocytic engulfment.',
        clinicalPathology: 'Defective chemotaxis in leukocyte adhesion deficiency (LAD-I).',
        position: [-0.32, 0.30, 0.18],
        colorHex: '#38bdf8',
      },
      {
        id: 'phagolysosome',
        name: 'Phagolysosomes & Phagocytic Vacuoles',
        biochemicalMarker: 'iNOS & Myeloperoxidase / Lysozyme',
        ultrastructure: 'Phagosome fused with primary lysosomes containing reactive oxygen species (ROS) and nitric oxide.',
        function: 'Kills and enzymatically dismantles phagocytosed microbial pathogens and apoptotic host cells.',
        clinicalPathology: 'Chronic Granulomatous Disease (defective NADPH oxidase superoxide production).',
        position: [0.18, 0.36, -0.12],
        colorHex: '#f43f5e',
      },
      {
        id: 'nucleus_lobed',
        name: 'Reniform / Lobulated Nucleus',
        biochemicalMarker: 'Lamin B Receptor',
        ultrastructure: 'Kidney-shaped indented nucleus allowing pliable cellular deformation during extravasation.',
        function: 'Transcribes inflammatory cytokine cassettes (TNF-alpha, IL-1beta, IL-6) upon Toll-like receptor activation.',
        clinicalPathology: 'Atypical mononuclear infiltrates in granulomatous diseases (Tuberculosis, Sarcoidosis).',
        position: [0.02, 0.38, 0.02],
        colorHex: '#818cf8',
      },
    ],
  },
  bacterium: {
    id: 'bacterium',
    name: 'Prokaryotic Bacterium (E. coli)',
    scientificCategory: 'Microbiology (NIH 3D Model)',
    modelUrl: '/models/cells/bacteria-wall-nih.glb',
    scale: [0.015, 0.015, 0.015],
    position: [0, 0.35, 0],
    rotation: [0, 0, 0],
    dimensionsUm: 'Dimensions: 0.5 × 2.0 µm',
    description: 'NIH 3D structural model of a Gram-negative bacillus featuring the protective peptidoglycan cell wall envelope, periplasmic space, inner/outer membranes, and uncoiled nucleoid DNA region.',
    organelles: [
      {
        id: 'cell_envelope',
        name: 'Peptidoglycan Cell Wall & Outer Membrane',
        biochemicalMarker: 'Lipopolysaccharide (Endotoxin) & Penicillin-Binding Proteins',
        ultrastructure: 'Thin crosslinked glycan-peptide mesh sandwiched between asymmetric lipid bilayer and outer membrane.',
        function: 'Confers rigid rod shape; outer membrane acts as selective permeability barrier against bile salts and detergents.',
        clinicalPathology: 'Lipid A component of LPS induces systemic septic shock, DIC, and hypotension.',
        position: [0, 0.45, 0],
        colorHex: '#f97316',
      },
      {
        id: 'nucleoid',
        name: 'Nucleoid (Circular Bacterial Chromosome)',
        biochemicalMarker: 'DNA Gyrase & Topoisomerase IV',
        ultrastructure: 'Non-membrane-bound supercoiled circular double-stranded DNA complexed with HU nucleoid proteins.',
        function: 'Stores prokaryotic genome; replicates bidirectionally from single origin (oriC).',
        clinicalPathology: 'Target of fluoroquinolone antibiotics (Ciprofloxacin, Levofloxacin).',
        position: [0, 0.35, 0],
        colorHex: '#a855f7',
      },
    ],
  },
  erythrocyte: {
    id: 'erythrocyte',
    name: 'Human Erythrocyte (Red Blood Cell)',
    scientificCategory: 'Hematology (Parametric Evans-Fung Geometry)',
    isProcedural: true,
    scale: [1, 1, 1],
    position: [0, 0.35, 0],
    rotation: [0, 0, 0],
    dimensionsUm: 'Diameter: 7.5–8.0 µm | Rim: 2.0 µm | Center: 0.8 µm',
    description: 'Biophysically exact mathematical Evans-Fung model of the human erythrocyte biconcave disc, with normal flexible morphology versus drepanocyte sickle cell polymer deformation.',
    organelles: [
      {
        id: 'biconcave_rim',
        name: 'Biconcave Thick Outer Rim',
        biochemicalMarker: 'Spectrin (Alpha/Beta) & Ankyrin Complex',
        ultrastructure: 'Triangular two-dimensional spectrin-actin-protein 4.1R hexagonal cytoskeletal lattice anchored to Band 3.',
        function: 'Optimizes surface-area-to-volume ratio (135 µm²); imparts reversible capillary deformability through 3 µm sinusoids.',
        clinicalPathology: 'Hereditary spherocytosis (spectrin/ankyrin gene mutations causing extravascular splenic hemolysis).',
        position: [0.32, 0.35, 0],
        colorHex: '#ef4444',
      },
      {
        id: 'central_pallor',
        name: 'Central Biconcave Pallor Dimple',
        biochemicalMarker: 'Band 3 (Anion Exchanger 1) & Glycophorin A',
        ultrastructure: 'Thin 0.8 µm central zone facilitating instantaneous trans-membrane O2 and CO2 passive diffusion.',
        function: 'Enables rapid oxygen loading in alveolar capillaries and unloading in peripheral respiring tissues.',
        clinicalPathology: 'Exaggerated central pallor in iron deficiency microcytic hypochromic anemia.',
        position: [0, 0.35, 0],
        colorHex: '#dc2626',
      },
      {
        id: 'hemoglobin',
        name: 'Cytoplasmic Hemoglobin Tetramers',
        biochemicalMarker: 'Hemoglobin A (Alpha2Beta2) & Carbonic Anhydrase',
        ultrastructure: 'Concentrated quaternary metalloprotein tetramers (~270 million molecules per RBC) containing 4 heme irons.',
        function: 'Cooperative sigmoidal oxygen binding via Allosteric T-to-R transition; Bohr effect proton buffering.',
        clinicalPathology: 'Sickle Cell Anemia (HbS Glu6Val mutation) causing deoxygenated polymer fibers and sickle crises.',
        position: [-0.18, 0.35, 0.18],
        colorHex: '#b91c1c',
      },
    ],
  },
}

// ============================================================
// MATHEMATICAL EVANS-FUNG ERYTHROCYTE 3D RIG BUILDER
// ============================================================

export function buildErythrocyteRig(isSickleCell: boolean = false): SubcellularRig {
  const root = new THREE.Group()
  root.position.set(0, 0.35, 0)
  const organelles = new Map<string, THREE.Object3D>()

  if (isSickleCell) {
    // Sickle Cell / Drepanocyte (Elongated Curved Crescent Torus)
    const curvePoints: THREE.Vector3[] = []
    const numPoints = 32
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 0.95 - Math.PI * 0.475
      const rad = 0.55
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * rad - 0.2, Math.sin(angle) * rad * 0.5, 0))
    }
    const path = new THREE.CatmullRomCurve3(curvePoints)
    const drepanocyteGeom = new THREE.TubeGeometry(path, 48, 0.09, 24, false)
    const sickleMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.45,
      metalness: 0.1,
    })
    const sickleMesh = new THREE.Mesh(drepanocyteGeom, sickleMat)
    sickleMesh.castShadow = true
    root.add(sickleMesh)

    // Stiffened HbS Polymer Fiber Ridges inside
    const fiberMat = new THREE.MeshBasicMaterial({ color: 0x450a0a })
    for (let f = -1; f <= 1; f++) {
      const fiber = new THREE.Mesh(new THREE.TubeGeometry(path, 32, 0.015, 8, false), fiberMat)
      fiber.position.set(0, f * 0.03, f * 0.02)
      root.add(fiber)
    }

    organelles.set('sickle_cell', sickleMesh)
  } else {
    // True Evans-Fung Parametric Biconcave Disc Geometry
    // Radial radius R = 0.65 units
    // Equation: z(r) = 0.5 * D * sqrt(1 - (r/R)^2) * (c0 + c1*(r/R)^2 + c2*(r/R)^4)
    const segmentsR = 36
    const segmentsTheta = 48
    const R = 0.62
    const c0 = 0.207
    const c1 = 2.00
    const c2 = -1.12

    const geom = new THREE.BufferGeometry()
    const positions: number[] = []
    const normals: number[] = []
    const indices: number[] = []

    // Build upper and lower biconcave surfaces
    for (let sign = 1; sign >= -1; sign -= 2) {
      const baseIdx = positions.length / 3

      // Center point
      positions.push(0, sign * 0.5 * R * c0, 0)
      normals.push(0, sign, 0)

      for (let i = 1; i <= segmentsR; i++) {
        const u = i / segmentsR
        const r = u * R
        const term = Math.max(0, 1 - u * u)
        const poly = c0 + c1 * u * u + c2 * u * u * u * u
        const y = sign * 0.5 * R * Math.sqrt(term) * poly

        for (let j = 0; j < segmentsTheta; j++) {
          const theta = (j / segmentsTheta) * Math.PI * 2
          const x = r * Math.cos(theta)
          const z = r * Math.sin(theta)
          positions.push(x, y, z)

          // Approximate normal pointing outwards
          const norm = new THREE.Vector3(x, sign * 0.2, z).normalize()
          normals.push(norm.x, norm.y * sign, norm.z)
        }
      }

      // Triangles for concentric rings
      for (let j = 0; j < segmentsTheta; j++) {
        const nextJ = (j + 1) % segmentsTheta
        if (sign === 1) {
          indices.push(baseIdx, baseIdx + 1 + j, baseIdx + 1 + nextJ)
        } else {
          indices.push(baseIdx, baseIdx + 1 + nextJ, baseIdx + 1 + j)
        }
      }

      for (let i = 1; i < segmentsR; i++) {
        const r1 = baseIdx + 1 + (i - 1) * segmentsTheta
        const r2 = baseIdx + 1 + i * segmentsTheta
        for (let j = 0; j < segmentsTheta; j++) {
          const nextJ = (j + 1) % segmentsTheta
          if (sign === 1) {
            indices.push(r1 + j, r2 + j, r2 + nextJ)
            indices.push(r1 + j, r2 + nextJ, r1 + nextJ)
          } else {
            indices.push(r1 + j, r2 + nextJ, r2 + j)
            indices.push(r1 + j, r1 + nextJ, r2 + nextJ)
          }
        }
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geom.setIndex(indices)
    geom.computeVertexNormals()

    const rbcMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.32,
      metalness: 0.12,
    })
    const rbcMesh = new THREE.Mesh(geom, rbcMat)
    rbcMesh.castShadow = true
    rbcMesh.receiveShadow = true
    root.add(rbcMesh)
    organelles.set('erythrocyte_disc', rbcMesh)
  }

  return { rootGroup: root, organelles }
}

// ============================================================
// VOLUMETRIC SUBCELLULAR RIG BUILDER (Fallback / Procedural)
// ============================================================

export interface SubcellularRig {
  rootGroup: THREE.Group
  organelles: Map<string, THREE.Object3D>
}

export function buildVolumetricSubcellularRig(
  cellType: CellTypeId = 'animal',
  isSickleCell: boolean = false
): SubcellularRig {
  if (cellType === 'erythrocyte') {
    return buildErythrocyteRig(isSickleCell)
  }

  const root = new THREE.Group()
  root.position.set(0, 0.45, 0)
  const organelles = new Map<string, THREE.Object3D>()

  const isPlantMode = cellType === 'plant'

  // Plasma Membrane (Translucent cross-section hemisphere)
  const cellMembraneGeom = new THREE.SphereGeometry(0.70, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.72)
  const cellMembraneMat = new THREE.MeshPhysicalMaterial({
    color: isPlantMode ? 0x15803d : 0x0284c7,
    transmission: 0.82,
    opacity: 0.65,
    transparent: true,
    roughness: 0.2,
    ior: 1.4,
    side: THREE.DoubleSide,
  })
  const cellMembrane = new THREE.Mesh(cellMembraneGeom, cellMembraneMat)
  cellMembrane.rotation.x = Math.PI / 2
  root.add(cellMembrane)

  // Rigid Plant Cell Wall
  if (isPlantMode) {
    const wallGeom = new THREE.BoxGeometry(1.4, 0.9, 1.2)
    const wallEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(wallGeom),
      new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 })
    )
    root.add(wallEdges)
  }

  // Volumetric Nucleus & Dense Nucleolus
  const nucleusGroup = new THREE.Group()
  nucleusGroup.position.set(-0.12, 0.08, -0.05)

  const nucleusGeom = new THREE.SphereGeometry(0.24, 32, 32)
  const nucleusMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.25,
    roughness: 0.35,
    metalness: 0.1,
  })
  const nucleusMesh = new THREE.Mesh(nucleusGeom, nucleusMat)
  nucleusGroup.add(nucleusMesh)

  const nucleolusMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2 })
  )
  nucleolusMesh.position.set(0.04, 0.02, 0.03)
  nucleusGroup.add(nucleolusMesh)

  nucleusGroup.userData = { id: 'nucleus', label: 'Cell Nucleus & Nucleolus' }
  root.add(nucleusGroup)
  organelles.set('nucleus', nucleusGroup)

  // Mitochondria
  const mitoGroup = new THREE.Group()
  const mitoPositions: [number, number, number, number][] = [
    [0.32, -0.12, 0.15, 0.4],
    [-0.30, -0.18, 0.10, -0.6],
    [0.18, 0.24, -0.20, 1.1],
  ]
  mitoPositions.forEach(([mx, my, mz, rotY]) => {
    const mMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.055, 0.12, 16, 24),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.3,
        roughness: 0.3,
      })
    )
    mMesh.position.set(mx, my, mz)
    mMesh.rotation.y = rotY
    mMesh.rotation.z = 0.3
    mitoGroup.add(mMesh)
  })
  mitoGroup.userData = { id: 'mitochondria', label: 'Mitochondria (ATP Synthase)' }
  root.add(mitoGroup)
  organelles.set('mitochondria', mitoGroup)

  // Rough Endoplasmic Reticulum (RER)
  const rerGroup = new THREE.Group()
  rerGroup.position.set(-0.12, 0.08, -0.05)
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.28 + r * 0.045, 0.016, 12, 32, Math.PI * 1.3),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.4,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.2,
      })
    )
    ring.rotation.x = Math.PI / 2 + r * 0.2
    ring.rotation.y = r * 0.3
    rerGroup.add(ring)
  }
  rerGroup.userData = { id: 'rough_er', label: 'Rough Endoplasmic Reticulum (RER)' }
  root.add(rerGroup)
  organelles.set('rough_er', rerGroup)

  // Golgi Apparatus
  const golgiGroup = new THREE.Group()
  golgiGroup.position.set(0.28, 0.05, 0.08)
  for (let g = 0; g < 4; g++) {
    const cisterna = new THREE.Mesh(
      new THREE.TorusGeometry(0.12 - g * 0.015, 0.014, 12, 24, Math.PI * 0.8),
      new THREE.MeshStandardMaterial({
        color: 0xec4899,
        roughness: 0.3,
        emissive: 0xdb2777,
        emissiveIntensity: 0.25,
      })
    )
    cisterna.position.set(0, g * 0.022, 0)
    cisterna.rotation.x = Math.PI / 2
    golgiGroup.add(cisterna)
  }
  golgiGroup.userData = { id: 'golgi', label: 'Golgi Apparatus (Protein Sorting)' }
  root.add(golgiGroup)
  organelles.set('golgi', golgiGroup)

  // Lysosomes
  const lysoGroup = new THREE.Group()
  const lysoCoords: [number, number, number][] = [
    [-0.22, 0.22, 0.18],
    [0.10, -0.20, 0.25],
    [-0.38, 0.02, -0.15],
  ]
  lysoCoords.forEach(([lx, ly, lz]) => {
    const vesicle = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xb91c1c,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      })
    )
    vesicle.position.set(lx, ly, lz)
    lysoGroup.add(vesicle)
  })
  lysoGroup.userData = { id: 'lysosome', label: 'Lysosomes & Peroxisomes' }
  root.add(lysoGroup)
  organelles.set('lysosome', lysoGroup)

  // Plant Mode: Chloroplasts & Central Vacuole
  if (isPlantMode) {
    const chloroGroup = new THREE.Group()
    const chloroCoords: [number, number, number][] = [
      [0.35, 0.15, -0.10],
      [-0.35, -0.10, -0.18],
    ]
    chloroCoords.forEach(([cx, cy, cz]) => {
      const cMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x16a34a,
          emissiveIntensity: 0.4,
          roughness: 0.3,
        })
      )
      cMesh.scale.set(1.4, 0.8, 1.0)
      cMesh.position.set(cx, cy, cz)
      chloroGroup.add(cMesh)
    })
    chloroGroup.userData = { id: 'chloroplast', label: 'Chloroplasts (Thylakoids)' }
    root.add(chloroGroup)
    organelles.set('chloroplast', chloroGroup)
  }

  return {
    rootGroup: root,
    organelles,
  }
}
