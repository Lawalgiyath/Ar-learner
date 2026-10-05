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
    'mod_science_001': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Prepare the Burette',
        instruction: 'Fill the burette with 0.1M NaOH solution up to the 0.00 mL mark. Ensure no air bubbles are present.',
        hint: 'Tilt the burette and open the stopcock briefly to remove air from the tip.',
        expectedAction: 'fill_burette',
        cameraPosition: [0, 1.5, 3],
        highlightObject: 'burette',
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Prepare the Conical Flask',
        instruction: 'Pipette exactly 25 mL of hydrochloric acid into a conical flask. Add 3 drops of phenolphthalein indicator.',
        hint: 'Hold the pipette vertically for accurate measurement.',
        expectedAction: 'fill_flask',
        cameraPosition: [0.5, 1.2, 2.5],
        highlightObject: 'flask',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Begin Titration',
        instruction: 'Open the stopcock slowly and add NaOH dropwise while swirling the flask continuously.',
        hint: 'Near the endpoint, add one drop at a time. Watch for a faint pink colour.',
        expectedAction: 'open_stopcock',
        cameraPosition: [0.2, 1.4, 2.8],
        highlightObject: 'stopcock',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Detect Endpoint',
        instruction: 'Close the stopcock the moment the solution turns permanently pink. Record the burette reading.',
        hint: 'The endpoint is a faint pink that persists for at least 30 seconds.',
        expectedAction: 'close_stopcock',
        cameraPosition: [0, 1.2, 2],
        highlightObject: 'flask',
      },
      {
        id: 's5', index: 4, isCompleted: false,
        title: 'Calculate Concentration',
        instruction: 'Use the formula C1V1 = C2V2 to calculate the exact concentration of HCl.',
        hint: 'C1 = 0.1M (NaOH), V1 = volume used, V2 = 25 mL',
        expectedAction: 'enter_calculation',
        cameraPosition: [0, 2, 4],
      },
    ],
    'mod_medical_001': [
      {
        id: 's1', index: 0, isCompleted: false,
        title: 'Scene Assessment',
        instruction: 'Check the environment for safety hazards before approaching the patient. Shout to get a response.',
        hint: 'Always ensure your own safety first. Do not enter an unsafe scene.',
        expectedAction: 'assess_scene',
        cameraPosition: [0, 1.6, 4],
      },
      {
        id: 's2', index: 1, isCompleted: false,
        title: 'Call for Help',
        instruction: 'Call emergency services (112 in Nigeria). If an AED is available, send someone to retrieve it.',
        hint: 'Be specific when asking for help. Point to someone and assign them to call.',
        expectedAction: 'call_emergency',
        cameraPosition: [0.3, 1.6, 3],
        highlightObject: 'phone',
      },
      {
        id: 's3', index: 2, isCompleted: false,
        title: 'Begin Chest Compressions',
        instruction: 'Place heel of hand on centre of chest. Compress 5-6 cm deep at 100-120 per minute.',
        hint: 'Push hard and fast. Allow full chest recoil between compressions.',
        expectedAction: 'start_compressions',
        cameraPosition: [0, 1.2, 2.5],
        highlightObject: 'patient_chest',
      },
      {
        id: 's4', index: 3, isCompleted: false,
        title: 'Rescue Breaths',
        instruction: 'After 30 compressions, tilt head back, lift chin, and give 2 rescue breaths (1 second each).',
        hint: 'Watch for chest rise. If no rise, reposition the airway.',
        expectedAction: 'give_breaths',
        cameraPosition: [0.1, 1.5, 2.2],
        highlightObject: 'patient_head',
      },
    ],
  }

  const defaultSteps: SimulationStep[] = [
    {
      id: 's1', index: 0, isCompleted: false,
      title: 'Introduction',
      instruction: `Welcome to the ${module.title} simulation. Review the equipment and objectives before starting.`,
      hint: 'Take a moment to familiarise yourself with all the tools available.',
      expectedAction: 'acknowledge',
      cameraPosition: [0, 1.5, 4],
    },
    {
      id: 's2', index: 1, isCompleted: false,
      title: 'Step 1',
      instruction: 'Follow the on-screen instructions for each step carefully.',
      hint: 'Click the highlighted object to interact with it.',
      expectedAction: 'interact',
      cameraPosition: [0, 1.2, 3],
    },
    {
      id: 's3', index: 2, isCompleted: false,
      title: 'Assessment',
      instruction: 'Complete the practical assessment to earn your score.',
      hint: 'Review your notes before submitting.',
      expectedAction: 'submit',
      cameraPosition: [0, 1.5, 4],
    },
  ]

  return stepTemplates[module.id] ?? defaultSteps
}
