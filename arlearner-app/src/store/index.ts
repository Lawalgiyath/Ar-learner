// ARLearner - Global Store (Zustand)
// Central application state management

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type UserRole = 'learner' | 'educator' | 'institution_admin' | 'super_admin'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  institutionId?: string
  institutionName?: string
  avatarUrl?: string
  xp: number
  level: number
  streakDays: number
  completedModules: string[]
  enrolledModules: string[]
  createdAt: string
}

export type DomainSlug =
  | 'virtual-science-lab'
  | 'vocational-skills'
  | 'medical-simulation'
  | 'industrial-safety'
  | 'agricultural-simulation'

export interface LearningDomain {
  id: string
  slug: DomainSlug
  name: string
  description: string
  color: string
  accentVar: string
  badgeClass: string
  iconName: string
  moduleCount: number
  totalLearners: number
}

export type DifficultyLevel = 1 | 2 | 3

export interface Module {
  id: string
  domainId: string
  domainSlug: DomainSlug
  domainName: string
  title: string
  description: string
  longDescription: string
  difficulty: DifficultyLevel
  estimatedMinutes: number
  totalSteps: number
  thumbnailColor: string
  isPublished: boolean
  tags: string[]
  learnerCount: number
  averageScore: number
  completionRate: number
  simulationType: '3d-ar' | 'guided-steps' | 'hybrid'
}

export interface SimulationStep {
  id: string
  index: number
  title: string
  instruction: string
  hint: string
  expectedAction: string
  cameraPosition: [number, number, number]
  highlightObject?: string
  isCompleted: boolean
}

export interface ActiveSession {
  moduleId: string
  moduleName: string
  startedAt: string
  currentStepIndex: number
  totalSteps: number
  steps: SimulationStep[]
  score: number
  timeSpentSeconds: number
  platform: 'web' | 'mobile'
  hintsUsed: number
}

export interface ProgressRecord {
  moduleId: string
  moduleTitle: string
  completionPct: number
  score: number
  lastAccessedAt: string
  timeSpentSeconds: number
  attempts: number
  passed: boolean
}

export type NotificationKind = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  kind: NotificationKind
  title: string
  message?: string
  duration?: number
}

// ============================================================
// STORE INTERFACE
// ============================================================

interface ARLearnerStore {
  // Auth
  user: User | null
  isAuthenticated: boolean
  authLoading: boolean

  // Navigation
  activePage: string
  sidebarOpen: boolean

  // Simulation
  activeSession: ActiveSession | null
  sessionLoading: boolean

  // Progress
  progressRecords: Record<string, ProgressRecord>

  // UI
  notifications: Notification[]
  theme: 'dark'

  // Actions - Auth
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void

  // Actions - Navigation
  setActivePage: (page: string) => void
  toggleSidebar: () => void

  // Actions - Session
  startSession: (module: Module) => void
  advanceStep: () => void
  completeStep: (stepIndex: number, score: number) => void
  useHint: () => void
  endSession: () => void

  // Actions - Progress
  updateProgress: (moduleId: string, record: Partial<ProgressRecord>) => void

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

// ============================================================
// MOCK USER FOR DEMO
// ============================================================

export const DEMO_USER: User = {
  id: 'usr_demo_001',
  firstName: 'Amaka',
  lastName: 'Okonkwo',
  email: 'amaka.okonkwo@university.edu.ng',
  role: 'learner',
  institutionId: 'inst_001',
  institutionName: 'University of Lagos',
  xp: 2450,
  level: 7,
  streakDays: 12,
  completedModules: ['mod_science_001', 'mod_science_002'],
  enrolledModules: ['mod_science_001', 'mod_science_002', 'mod_medical_001', 'mod_voc_001'],
  createdAt: '2026-01-15T08:00:00Z',
}

// ============================================================
// ZUSTAND STORE
// ============================================================

export const useStore = create<ARLearnerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: DEMO_USER,
      isAuthenticated: true,
      authLoading: false,
      activePage: 'dashboard',
      sidebarOpen: false,
      activeSession: null,
      sessionLoading: false,
      progressRecords: {
        'mod_science_001': {
          moduleId: 'mod_science_001',
          moduleTitle: 'Chemical Titration',
          completionPct: 100,
          score: 92,
          lastAccessedAt: '2026-10-02T14:30:00Z',
          timeSpentSeconds: 1820,
          attempts: 2,
          passed: true,
        },
        'mod_science_002': {
          moduleId: 'mod_science_002',
          moduleTitle: 'Microscopic Analysis',
          completionPct: 100,
          score: 88,
          lastAccessedAt: '2026-10-03T10:15:00Z',
          timeSpentSeconds: 2100,
          attempts: 1,
          passed: true,
        },
        'mod_medical_001': {
          moduleId: 'mod_medical_001',
          moduleTitle: 'CPR Technique',
          completionPct: 60,
          score: 0,
          lastAccessedAt: '2026-10-04T16:45:00Z',
          timeSpentSeconds: 900,
          attempts: 1,
          passed: false,
        },
      },
      notifications: [],
      theme: 'dark',

      // Auth Actions
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, activeSession: null }),
      updateUser: (updates) => {
        const current = get().user
        if (current) set({ user: { ...current, ...updates } })
      },

      // Navigation Actions
      setActivePage: (page) => set({ activePage: page }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // Session Actions
      startSession: (module) => {
        const steps = generateStepsForModule(module)
        set({
          activeSession: {
            moduleId: module.id,
            moduleName: module.title,
            startedAt: new Date().toISOString(),
            currentStepIndex: 0,
            totalSteps: steps.length,
            steps,
            score: 0,
            timeSpentSeconds: 0,
            platform: 'web',
            hintsUsed: 0,
          },
          sessionLoading: false,
        })
      },

      advanceStep: () => {
        const session = get().activeSession
        if (!session) return
        const next = Math.min(session.currentStepIndex + 1, session.totalSteps - 1)
        set({ activeSession: { ...session, currentStepIndex: next } })
      },

      completeStep: (stepIndex, score) => {
        const session = get().activeSession
        if (!session) return
        const steps = session.steps.map((s, i) =>
          i === stepIndex ? { ...s, isCompleted: true } : s
        )
        const newScore = Math.round((session.score + score) / 2)
        set({ activeSession: { ...session, steps, score: newScore } })
      },

      useHint: () => {
        const session = get().activeSession
        if (!session) return
        set({ activeSession: { ...session, hintsUsed: session.hintsUsed + 1 } })
      },

      endSession: () => {
        const session = get().activeSession
        if (!session) return
        const completedCount = session.steps.filter((s) => s.isCompleted).length
        const pct = Math.round((completedCount / session.totalSteps) * 100)
        get().updateProgress(session.moduleId, {
          completionPct: pct,
          score: session.score,
          lastAccessedAt: new Date().toISOString(),
          timeSpentSeconds: session.timeSpentSeconds,
          passed: pct >= 80,
        })
        // Award XP
        const xpGained = Math.round(session.score * 2.5)
        get().updateUser({ xp: (get().user?.xp ?? 0) + xpGained })
        set({ activeSession: null })
        get().addNotification({
          kind: 'success',
          title: 'Session Complete',
          message: `You earned ${xpGained} XP. Score: ${session.score}%`,
          duration: 5000,
        })
      },

      // Progress Actions
      updateProgress: (moduleId, record) => {
        set((s) => ({
          progressRecords: {
            ...s.progressRecords,
            [moduleId]: {
              ...s.progressRecords[moduleId],
              moduleId,
              ...record,
            } as ProgressRecord,
          },
        }))
      },

      // Notification Actions
      addNotification: (notification) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const full: Notification = { id, duration: 4000, ...notification }
        set((s) => ({ notifications: [...s.notifications, full] }))
        if (full.duration && full.duration > 0) {
          setTimeout(() => get().removeNotification(id), full.duration)
        }
      },
      removeNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
    }),
    {
      name: 'arlearner-store',
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        progressRecords: s.progressRecords,
      }),
    }
  )
)

// ============================================================
// HELPERS
// ============================================================

function generateStepsForModule(module: Module): SimulationStep[] {
  const stepTemplates: Record<string, SimulationStep[]> = {
    // 1. CHEMISTRY TITRATION
    'mod_science_001': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Prepare the Burette',
        instruction: 'Fill the burette with 0.1M NaOH solution up to the 0.00 mL mark. Ensure no air bubbles are present.',
        hint: 'Click the burette to inspect graduation scale and remove trapped bubbles from the nozzle.',
        expectedAction: 'fill_burette',
        cameraPosition: [-0.4, 1.2, 2.2],
        highlightObject: 'burette',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Prepare the Conical Flask',
        instruction: 'Pipette exactly 25 mL of hydrochloric acid into a conical flask. Add 3 drops of phenolphthalein indicator.',
        hint: 'Click the flask to verify initial colorless acidic solution.',
        expectedAction: 'fill_flask',
        cameraPosition: [-0.3, 0.4, 1.8],
        highlightObject: 'flask',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Begin Titration',
        instruction: 'Open the precision PTFE stopcock slowly and add NaOH dropwise while swirling continuously.',
        hint: 'Click the stopcock valve to regulate drop flow.',
        expectedAction: 'open_stopcock',
        cameraPosition: [-0.3, 0.6, 1.6],
        highlightObject: 'stopcock',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Detect Endpoint',
        instruction: 'Close the stopcock the moment the solution turns permanently faint pink (30 seconds persistence).',
        hint: 'Inspect the Erlenmeyer flask for pale pink color transition at pH 8.2.',
        expectedAction: 'close_stopcock',
        cameraPosition: [-0.4, 0.35, 1.5],
        highlightObject: 'flask',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'Stoichiometric Calculation',
        instruction: 'Calculate the analyte concentration using C1V1 = C2V2 with the endpoint volume reading.',
        hint: 'Titre volume = 24.80 mL. Molarity = (0.100 * 24.80) / 25.00 = 0.0992 M.',
        expectedAction: 'enter_calculation',
        cameraPosition: [0, 0.9, 2.8],
      },
    ],

    // 2. MICROSCOPE CELL ANALYSIS
    'mod_science_002': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Specimen Mount Placement',
        instruction: 'Pick up the prepared stained cell slide and mount it securely under the mechanical stage clips.',
        hint: 'Click the specimen slide on the bench to transfer to the microscope stage.',
        expectedAction: 'mount_slide',
        cameraPosition: [0.3, 0.4, 1.8],
        highlightObject: 'specimen_slide',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Low Power Scanning (10x)',
        instruction: 'Rotate the nosepiece turret to engage the 10x low-power objective lens for field orientation.',
        hint: 'Click the objective lens turret to click into alignment.',
        expectedAction: 'select_objective',
        cameraPosition: [0, 0.6, 1.6],
        highlightObject: 'objective_lens_turret',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Coarse Stage Adjustment',
        instruction: 'Turn the coarse adjustment knob to raise the stage until specimen outline becomes visible.',
        hint: 'Click the coarse focus knob on the microscope body.',
        expectedAction: 'adjust_coarse',
        cameraPosition: [-0.4, 0.5, 1.7],
        highlightObject: 'coarse_focus_knob',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'High Power Examination (40x)',
        instruction: 'Switch to the 40x high-dry objective. Refine focal plane with fine adjustment to observe nucleus and cell walls.',
        hint: 'Click the microscope to enter high-resolution ocular view.',
        expectedAction: 'fine_focus',
        cameraPosition: [0, 0.55, 1.4],
        highlightObject: 'microscope',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'Organelle Identification',
        instruction: 'Identify and record the plant cell features: cellulosic cell wall, large central vacuole, and stained nucleus.',
        hint: 'Record cellular dimensions and membrane boundaries.',
        expectedAction: 'record_observation',
        cameraPosition: [0, 0.8, 2.4],
      },
    ],

    // 3. HUMAN DIGESTIVE SYSTEM
    'mod_science_003': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Inspect Hepatic Structure',
        instruction: 'Locate the liver. Examine the right and left lobes and note the biliary synthesis pathway.',
        hint: 'Click the liver model to inspect gallbladder fossa and portal vein entry.',
        expectedAction: 'inspect_liver',
        cameraPosition: [0.2, 0.6, 1.6],
        highlightObject: 'liver',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Small Intestine Nutrient Absorption',
        instruction: 'Trace the small intestine (duodenum, jejunum, ileum) and understand microvilli surface area expansion.',
        hint: 'Click the small intestine to review enzymatic breakdown and vascular uptake.',
        expectedAction: 'inspect_small_intestine',
        cameraPosition: [0, 0.35, 1.6],
        highlightObject: 'small_intestine',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Colon Water Reabsorption',
        instruction: 'Examine the large intestine: ascending, transverse, and descending colon and fluid recovery mechanisms.',
        hint: 'Click the large intestine colon structure to review electrolyte recovery.',
        expectedAction: 'inspect_large_intestine',
        cameraPosition: [0, 0.45, 1.8],
        highlightObject: 'large_intestine',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Digestive Tract Integration',
        instruction: 'Complete the physiological mapping of peristalsis from gastric chyme to fecal excretion.',
        hint: 'Review the symbiotic gut microbiome and bile salt recycling.',
        expectedAction: 'complete_pathway',
        cameraPosition: [0, 0.6, 2.2],
      },
    ],

    // 4. MIG WELDING FUNDAMENTALS
    'mod_voc_001': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Personal Protective Equipment',
        instruction: 'Inspect the auto-darkening welding helmet. Ensure DIN 10 shade lens is free from spatter.',
        hint: 'Click the welding helmet on the bench to confirm UV/IR eye protection.',
        expectedAction: 'inspect_helmet',
        cameraPosition: [-0.6, 0.5, 1.6],
        highlightObject: 'welding_helmet',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Connect Earth Ground Clamp',
        instruction: 'Secure the heavy-duty ground clamp firmly to the mild steel platen to complete the electrical circuit.',
        hint: 'Click the ground clamp to establish return current path.',
        expectedAction: 'attach_ground',
        cameraPosition: [-0.2, 0.25, 1.2],
        highlightObject: 'ground_clamp',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Position Joint Workpiece',
        instruction: 'Align the mild steel plates with a 2mm root gap and check 70° included bevel angle.',
        hint: 'Click the joint workpiece to verify fit-up tolerance.',
        expectedAction: 'align_workpiece',
        cameraPosition: [0.15, 0.35, 1.4],
        highlightObject: 'workpiece_joint',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'MIG Torch Angle & Travel Speed',
        instruction: 'Maintain a 10-15° pushing torch travel angle and 12mm stick-out length while triggering the arc.',
        hint: 'Click the MIG torch to ignite arc and deposit root bead.',
        expectedAction: 'strike_arc',
        cameraPosition: [0.25, 0.4, 1.3],
        highlightObject: 'mig_torch',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'Weld Bead Quality Inspection',
        instruction: 'Inspect the deposited weld bead for uniform penetration, absence of porosity, and undercut.',
        hint: 'Assess bead width and toe blend consistency.',
        expectedAction: 'inspect_weld',
        cameraPosition: [0.1, 0.35, 1.5],
      },
    ],

    // 5. SOLAR PV INSTALLATION
    'mod_voc_002': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Solar Panel Orientation & Tilt',
        instruction: 'Set solar array tilt angle based on latitude (10-15° for Lagos/Nigeria) facing true south.',
        hint: 'Click the photovoltaic solar panel module to verify tilt orientation.',
        expectedAction: 'check_tilt',
        cameraPosition: [-0.2, 0.7, 2.0],
        highlightObject: 'solar_panel',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'DC Isolation Switch Testing',
        instruction: 'Test the DC isolator switch to ensure zero circuit voltage before connecting string cabling.',
        hint: 'Click the red DC safety disconnect switch.',
        expectedAction: 'test_isolator',
        cameraPosition: [0.75, 0.55, 1.3],
        highlightObject: 'dc_isolator',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Charge Controller Configuration',
        instruction: 'Program the MPPT inverter charging profile for LiFePO4 battery absorption voltage (56.8V).',
        hint: 'Click the hybrid solar inverter unit.',
        expectedAction: 'program_mppt',
        cameraPosition: [1.0, 0.65, 1.4],
        highlightObject: 'inverter_unit',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Battery Bank Integration',
        instruction: 'Connect battery main terminals with appropriate DC breaker and class-T overcurrent fuse.',
        hint: 'Click the lithium battery storage unit.',
        expectedAction: 'connect_battery',
        cameraPosition: [1.0, 0.35, 1.4],
        highlightObject: 'battery_storage',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'System Commissioning',
        instruction: 'Energize AC output, verify grid-frequency synchronisation (50Hz), and record yield telemetry.',
        hint: 'Confirm VOC open circuit and ISC short circuit values match datasheet.',
        expectedAction: 'commission_system',
        cameraPosition: [0, 0.8, 2.6],
      },
    ],

    // 6. PLUMBING: PVC INSTALLATION
    'mod_voc_003': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Pipe Deburring & Chamfer',
        instruction: 'Square-cut and bevel the PVC pipe end to prevent solvent cement push-out during insertion.',
        hint: 'Click the PVC main pipe to inspect joint preparation.',
        expectedAction: 'deburr_pipe',
        cameraPosition: [0, 0.45, 1.5],
        highlightObject: 'pvc_main_pipe',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Solvent Cement Weld',
        instruction: 'Apply primer and solvent cement rapidly. Push into fitting with a 90° twist and hold for 30s.',
        hint: 'Click the brass ball valve union to seal.',
        expectedAction: 'weld_fitting',
        cameraPosition: [0, 0.4, 1.4],
        highlightObject: 'ball_valve',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Valve Alignment',
        instruction: 'Check valve handle clearance and verify unobstructed flow orientation.',
        hint: 'Click the red valve actuation lever to cycle open and closed.',
        expectedAction: 'cycle_valve',
        cameraPosition: [0, 0.5, 1.3],
        highlightObject: 'valve_lever',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Hydrostatic Pressure Test',
        instruction: 'Pressurize system to 6 bar using test pump. Hold pressure for 15 minutes to verify zero drop.',
        hint: 'Click the analog pressure test gauge.',
        expectedAction: 'read_gauge',
        cameraPosition: [-0.4, 0.55, 1.3],
        highlightObject: 'pressure_gauge',
      },
    ],

    // 7. MEDICAL CPR
    'mod_medical_001': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Scene Assessment & Response',
        instruction: 'Verify scene safety. Tap patient shoulders and shout: "Are you okay?" Check for carotid pulse and breathing.',
        hint: 'Assess patient responsiveness, check carotid pulse and breathing.',
        expectedAction: 'assess_patient',
        cameraPosition: [0, 0.8, 2.2],
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Deploy AED & Call Emergency',
        instruction: 'Call 112 / emergency dispatch. Turn on AED and prepare electrode pads on bare chest.',
        hint: 'Click the AED device to power on and listen to voice prompts.',
        expectedAction: 'power_aed',
        cameraPosition: [0.65, 0.45, 1.5],
        highlightObject: 'aed_device',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'High-Quality Chest Compressions',
        instruction: 'Place heel of hand on lower half of sternum. Deliver 30 compressions at 100-120 bpm, 5-6 cm depth with full recoil.',
        hint: 'Click the chest compression point to deliver compressions.',
        expectedAction: 'start_compressions',
        cameraPosition: [0, 0.6, 1.6],
        highlightObject: 'chest_compression_point',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Maintain Airway & Rescue Breaths',
        instruction: 'Perform head-tilt chin-lift maneuver. Deliver 2 rescue breaths (1 sec each) watching for chest rise.',
        hint: 'Click the airway head to ensure patent airway.',
        expectedAction: 'open_airway',
        cameraPosition: [0, 0.5, 1.5],
        highlightObject: 'airway_head',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'Cardiac Rhythm Analysis & Perfusion',
        instruction: 'Examine coronary perfusion and cerebral blood flow under continuous cycles until spontaneous circulation returns.',
        hint: 'Inspect the anatomical heart model to visualize ventricle ejection fractions.',
        expectedAction: 'analyze_rhythm',
        cameraPosition: [0.75, 0.7, 1.6],
        highlightObject: 'heart_anatomy',
      },
    ],

    // 8. IV CANNULATION
    'mod_medical_002': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Apply Venous Tourniquet',
        instruction: 'Apply quick-release tourniquet 10-15cm above puncture site. Palpate median cubital vein.',
        hint: 'Click the tourniquet band to constrict venous return.',
        expectedAction: 'apply_tourniquet',
        cameraPosition: [-0.35, 0.35, 1.2],
        highlightObject: 'tourniquet',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Vein Palpation & Aseptic Prep',
        instruction: 'Confirm resilient vein bounce without pulse. Disinfect skin with 70% isopropyl alcohol for 30 seconds.',
        hint: 'Click the median cubital vein to locate puncture trajectory.',
        expectedAction: 'palpate_vein',
        cameraPosition: [0, 0.4, 1.2],
        highlightObject: 'median_cubital_vein',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Venepuncture & Flashback Confirmation',
        instruction: 'Hold 20G cannula bevel up at 15-30° angle. Puncture skin and confirm immediate blood flash in chamber.',
        hint: 'Click the IV cannula assembly to introduce catheter.',
        expectedAction: 'insert_needle',
        cameraPosition: [0.2, 0.5, 1.3],
        highlightObject: 'iv_cannula_assembly',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Advance Catheter & Release Tourniquet',
        instruction: 'Lower needle angle to 10°, advance plastic catheter over needle into lumen, release tourniquet, and apply dressing.',
        hint: 'Release tourniquet before withdrawing stylet to prevent haematoma.',
        expectedAction: 'secure_cannula',
        cameraPosition: [0, 0.45, 1.5],
      },
    ],

    // 9. INDUSTRIAL FIRE SAFETY
    'mod_ind_001': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Raise the Fire Alarm',
        instruction: 'Upon detecting smoke or fire, activate the nearest manual break-glass pull station immediately.',
        hint: 'Click the fire alarm call point to sound evacuation siren.',
        expectedAction: 'pull_alarm',
        cameraPosition: [0.65, 0.9, 1.6],
        highlightObject: 'fire_alarm_station',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Retrieve & Inspect Fire Extinguisher',
        instruction: 'Verify gauge needle is in green operating zone. Inspect ABC dry chemical extinguisher rating.',
        hint: 'Click the fire extinguisher to inspect pressure charge.',
        expectedAction: 'inspect_extinguisher',
        cameraPosition: [-0.3, 0.7, 1.8],
        highlightObject: 'fire_extinguisher',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Execute P.A.S.S. Protocol - Pull Pin',
        instruction: 'P: Pull the safety pin breaking the tamper seal wire to unlock operating lever.',
        hint: 'Click the extinguisher to unlock discharge lever.',
        expectedAction: 'pull_pin',
        cameraPosition: [-0.3, 0.8, 1.4],
        highlightObject: 'fire_extinguisher',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Aim, Squeeze & Sweep (P.A.S.S.)',
        instruction: 'Aim low at base of fire from 2.5 meters. Squeeze handles and sweep nozzle side to side across fuel bed.',
        hint: 'Discharge powder in continuous controlled sweeping arc.',
        expectedAction: 'discharge_extinguisher',
        cameraPosition: [-0.2, 0.6, 2.0],
        highlightObject: 'fire_extinguisher',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'Evacuate via Designated Exit',
        instruction: 'Keep low under smoke layers and follow illuminated green emergency exit route to exterior assembly point.',
        hint: 'Click the emergency exit sign.',
        expectedAction: 'evacuate_exit',
        cameraPosition: [0, 1.2, 2.2],
        highlightObject: 'exit_sign',
      },
    ],

    // 10. CHEMICAL SPILL RESPONSE
    'mod_ind_002': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Evacuate & Isolate Spill Area',
        instruction: 'Identify 2.0M hydrochloric acid puddle. Cordon off zone and consult chemical Safety Data Sheet (SDS).',
        hint: 'Click the acid spill pool to assess spill diameter.',
        expectedAction: 'assess_spill',
        cameraPosition: [0, 0.35, 1.6],
        highlightObject: 'spill_zone',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Deploy Containment Berm Sock',
        instruction: 'Encircle outer perimeter with absorbent polypropylene sock to block pathways toward floor drains.',
        hint: 'Click the absorbent berm sock to contain chemical migration.',
        expectedAction: 'place_berm',
        cameraPosition: [0, 0.45, 1.8],
        highlightObject: 'absorbent_sock',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Apply Neutralizer Agent',
        instruction: 'Dust sodium bicarbonate powder inward from perimeter. Continue until effervescence carbon dioxide bubbling stops.',
        hint: 'Click the neutralizer canister to neutralize acid.',
        expectedAction: 'apply_neutralizer',
        cameraPosition: [-0.5, 0.5, 1.4],
        highlightObject: 'neutralizer_shaker',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Hazmat Overpack Drum Disposal',
        instruction: 'Collect spent absorbents using non-sparking poly shovel and seal into yellow UN-rated recovery drum.',
        hint: 'Click the hazmat recovery drum to package hazardous waste.',
        expectedAction: 'package_waste',
        cameraPosition: [0.75, 0.6, 1.7],
        highlightObject: 'hazmat_drum',
      },
    ],

    // 11. AGRICULTURAL TRACTOR OPERATION
    'mod_agric_001': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Pre-Operation Walkaround & 3-Point Hitch',
        instruction: 'Inspect lower draft links, sway chains, and lift arm locking pins on the 3-point linkage hitch.',
        hint: 'Click the 3-point hitch linkage to check pin engagement.',
        expectedAction: 'check_hitch',
        cameraPosition: [0.7, 0.55, 1.6],
        highlightObject: 'three_point_hitch',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'PTO Shaft Connection & Guard Check',
        instruction: 'Connect 540 RPM PTO shaft splines and ensure yellow free-spinning guard safety tether is secured.',
        hint: 'Click the PTO drive shaft guard.',
        expectedAction: 'connect_pto',
        cameraPosition: [0.45, 0.5, 1.4],
        highlightObject: 'pto_shaft_guard',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Rotary Tiller Depth & Tines Inspection',
        instruction: 'Check curved rotary tiller tines for wear and set adjustable skid depth shoes for 15cm seedbed tilth.',
        hint: 'Click the rotary tiller implement.',
        expectedAction: 'inspect_tiller',
        cameraPosition: [-0.2, 0.65, 2.2],
        highlightObject: 'rotary_tiller',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Headland Turn & Safe Shutdown',
        instruction: 'Disengage PTO before raising implement on headland turn. Idle engine for 2 minutes before key shutoff.',
        hint: 'Lower implement fully to ground and set parking brake before dismounting.',
        expectedAction: 'safe_shutdown',
        cameraPosition: [0, 0.9, 3.0],
      },
    ],

    // 12. DRIP IRRIGATION SETUP
    'mod_agric_002': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Crop Water Requirements & Row Spacing',
        instruction: 'Evaluate tomato crop canopy evapotranspiration (ETc = 5.2 mm/day) and root distribution depth.',
        hint: 'Click the crop plant to inspect vegetative foliage and root crown.',
        expectedAction: 'assess_crop',
        cameraPosition: [0, 0.5, 1.8],
        highlightObject: 'crop_plant',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Disc Filter Manifold Inspection',
        instruction: 'Clean 120 mesh disc filter rings to protect drip lateral emitters from algae and silt clogging.',
        hint: 'Click the filter manifold unit.',
        expectedAction: 'flush_filter',
        cameraPosition: [-0.9, 0.45, 1.4],
        highlightObject: 'filter_manifold',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Drip Lateral Layout & Tension',
        instruction: 'Roll out 16mm UV-stabilized polyethylene tubing along tomato plant rows with zero kinks.',
        hint: 'Click the drip lateral tubing to check line alignment.',
        expectedAction: 'layout_tubing',
        cameraPosition: [0, 0.35, 1.5],
        highlightObject: 'drip_lateral_tubing',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Emitter Calibration & Flow Test',
        instruction: 'Punch and install 2.0 L/hr pressure-compensating emitters directly beside each plant crown.',
        hint: 'Click the blue pressure-compensating emitter.',
        expectedAction: 'test_emitter',
        cameraPosition: [0, 0.3, 1.2],
        highlightObject: 'pressure_emitter',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'System Pressurization & Uniformity',
        instruction: 'Run irrigation cycle at 1.5 bar. Verify emission uniformity exceeds 92% across entire lateral run.',
        hint: 'Flush terminal end-caps before final clamp closure.',
        expectedAction: 'verify_uniformity',
        cameraPosition: [0, 0.7, 2.5],
      },
    ],
  }

  const defaultSteps: SimulationStep[] = [
    {
      id: 's1', index: 0, isCompleted: false,
      title: 'Equipment Inspection',
      instruction: `Welcome to the ${module.title} simulation. Inspect all apparatus, controls, and safety equipment.`,
      hint: 'Click highlighted 3D objects to examine their function.',
      expectedAction: 'inspect_equipment',
      cameraPosition: [0, 0.8, 2.8],
    },
    {
      id: 's2', index: 1, isCompleted: false,
      title: 'Operational Procedure',
      instruction: 'Follow procedural standards and execute the task step by step.',
      hint: 'Interact with the 3D model to proceed.',
      expectedAction: 'execute_step',
      cameraPosition: [0, 0.6, 2.2],
    },
    {
      id: 's3', index: 2, isCompleted: false,
      title: 'Quality & Safety Verification',
      instruction: 'Verify parameters against curriculum benchmarks and complete assessment.',
      hint: 'Confirm all readings before finalizing score.',
      expectedAction: 'verify_outcome',
      cameraPosition: [0, 0.8, 3.0],
    },
  ]

  return stepTemplates[module.id] ?? defaultSteps
}
