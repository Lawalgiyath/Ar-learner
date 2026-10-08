// ARLearner Simulation Engine
// Built on Three.js with WebXR-readiness, KTX2/Meshopt/Draco decoders,
// photorealistic PBR materials, procedural audio synthesis, and interactive spatial HUD.

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import type { SimulationStep } from '../store'

// ============================================================
// PROCEDURAL AUDIO ENGINE (Web Audio API - Zero External Assets)
// ============================================================

export class SimulationAudio {
  private ctx: AudioContext | null = null
  private enabled = true

  private init(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public playClick(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  }

  public playDrip(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.09)
  }

  public playSwirl(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const bufferSize = Math.floor(ctx.sampleRate * 0.35)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(450, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.15)
    filter.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.35)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()
  }

  public playStopcockTurn(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.linearRampToValueAtTime(160, now + 0.06)
    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.06)
  }

  public playPipetteSuction(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(240, now)
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.18)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.18)
  }

  public playWashSquirt(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const now = ctx.currentTime
    const bufferSize = Math.floor(ctx.sampleRate * 0.16)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.Q.setValueAtTime(3.0, now)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start(now)
  }

  public playSuccess(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.07)
      gain.gain.setValueAtTime(0.08, now + i * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.07)
      osc.stop(now + i * 0.07 + 0.25)
    })
  }

  public playHeartbeat(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const now = ctx.currentTime
    // Lub-Dub
    ;[0, 0.14].forEach((delay) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(65, now + delay)
      osc.frequency.exponentialRampToValueAtTime(35, now + delay + 0.09)
      gain.gain.setValueAtTime(0.2, now + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + delay)
      osc.stop(now + delay + 0.09)
    })
  }

  public playHiss(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const bufferSize = ctx.sampleRate * 0.25
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800, ctx.currentTime)
    filter.Q.setValueAtTime(2.5, ctx.currentTime)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()
  }

  public playWeldSpark(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  }

  public playAlarm(): void {
    if (!this.enabled) return
    const ctx = this.init()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(440, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.16)
  }
}

// Global audio singleton
export const simulationAudio = new SimulationAudio()

// ============================================================
// ECS - ENTITY COMPONENT SYSTEM
// ============================================================

type ComponentData = Record<string, unknown>

class Entity {
  readonly id: string
  private components: Map<string, ComponentData> = new Map()

  constructor(id: string) {
    this.id = id
  }

  add<T extends ComponentData>(type: string, data: T): this {
    this.components.set(type, data)
    return this
  }

  get<T extends ComponentData>(type: string): T | undefined {
    return this.components.get(type) as T | undefined
  }

  has(type: string): boolean {
    return this.components.has(type)
  }

  remove(type: string): this {
    this.components.delete(type)
    return this
  }
}

interface System {
  name: string
  update: (world: SimulationWorld, delta: number) => void
  dispose?: () => void
}

export class SimulationWorld {
  private entities: Map<string, Entity> = new Map()
  private systems: System[] = []
  private running = false

  createEntity(id: string): Entity {
    const entity = new Entity(id)
    this.entities.set(id, entity)
    return entity
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id)
  }

  removeEntity(id: string): void {
    this.entities.delete(id)
  }

  query(componentTypes: string[]): Entity[] {
    return Array.from(this.entities.values()).filter((e) =>
      componentTypes.every((t) => e.has(t))
    )
  }

  addSystem(system: System): void {
    this.systems.push(system)
  }

  update(delta: number): void {
    if (!this.running) return
    for (const system of this.systems) {
      system.update(this, delta)
    }
  }

  start(): void {
    this.running = true
  }

  stop(): void {
    this.running = false
  }

  dispose(): void {
    this.stop()
    for (const system of this.systems) {
      system.dispose?.()
    }
    this.entities.clear()
    this.systems = []
  }
}

// ============================================================
// SCENE CONFIGS PER MODULE (Sourced Real Models + Procedural Rigging)
// ============================================================

export interface ObjectConfig {
  id: string
  url?: string
  type: 'box' | 'cylinder' | 'sphere' | 'plane' | 'torus' | 'cone' | 'model'
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  color: number
  emissive?: number
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
  label?: string
  description?: string
  interactive?: boolean
  wireframe?: boolean
  normalizeSize?: number // Auto-fit model into bounding box radius
  playAnimation?: boolean
}

export interface SceneConfig {
  backgroundColor: number
  fogColor: number
  fogNear: number
  fogFar: number
  ambientIntensity: number
  objects: ObjectConfig[]
  environmentPreset?: 'lab' | 'industrial' | 'medical' | 'outdoor'
  cameraTarget?: [number, number, number]
  defaultCameraDistance?: number
}

export const SCENE_CONFIGS: Record<string, SceneConfig> = {
  // 1. ACID-BASE TITRATION (Virtual Science Lab)
  'mod_science_001': {
    backgroundColor: 0x070b14,
    fogColor: 0x070b14,
    fogNear: 8,
    fogFar: 22,
    ambientIntensity: 0.95,
    cameraTarget: [-0.15, 0.44, 0],
    defaultCameraDistance: 1.65,
    objects: [], // Built dynamically with photorealistic apparatus generator
  },

  // 2. MICROSCOPIC CELL ANALYSIS (Virtual Science Lab)
  'mod_science_002': {
    backgroundColor: 0x070a12,
    fogColor: 0x070a12,
    fogNear: 6,
    fogFar: 18,
    ambientIntensity: 0.9,
    cameraTarget: [0, 0.4, 0],
    defaultCameraDistance: 2.8,
    objects: [
      {
        id: 'microscope',
        type: 'model',
        url: '/models/microscope.glb',
        position: [0, 0, 0],
        scale: [1, 1, 1],
        normalizeSize: 1.4,
        color: 0xffffff,
        interactive: true,
        label: 'Compound Optical Microscope',
        description: 'Binocular laboratory microscope with 4x/10x/40x/100x revolving objectives and mechanical stage.',
      },
      {
        id: 'bench',
        type: 'box',
        position: [0, -0.06, 0],
        scale: [3.2, 0.12, 2.0],
        color: 0x141824,
        metalness: 0.2,
        roughness: 0.3,
        label: 'Laboratory Bench',
      },
      {
        id: 'specimen_slide',
        type: 'box',
        position: [0.55, 0.01, 0.25],
        scale: [0.18, 0.008, 0.06],
        color: 0xbbdefb,
        emissive: 0x003366,
        emissiveIntensity: 0.2,
        roughness: 0.1,
        metalness: 0.1,
        interactive: true,
        label: 'Prepared Specimen Slide (Onion Epithelium)',
        description: 'Stained with iodine solution for cellular cell wall and nucleus contrast.',
      },
      {
        id: 'coarse_focus_knob',
        type: 'cylinder',
        position: [-0.42, 0.28, -0.05],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.05, 0.04, 0.05],
        color: 0x334155,
        metalness: 0.8,
        roughness: 0.2,
        interactive: true,
        label: 'Coarse Adjustment Knob',
        description: 'Controls rapid vertical stage displacement to bring specimen into initial focal plane.',
      },
      {
        id: 'objective_lens_turret',
        type: 'cylinder',
        position: [0, 0.46, 0.08],
        scale: [0.08, 0.05, 0.08],
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.15,
        interactive: true,
        label: 'Revolving Objective Nosepiece (10x / 40x)',
        description: 'Parfocal quad-objective turret containing plan-achromatic lens optics.',
      },
    ],
  },

  // 3. HUMAN ANATOMY: DIGESTIVE SYSTEM (Virtual Science Lab)
  'mod_science_003': {
    backgroundColor: 0x06070d,
    fogColor: 0x06070d,
    fogNear: 5,
    fogFar: 16,
    ambientIntensity: 0.95,
    cameraTarget: [0, 0.35, 0],
    defaultCameraDistance: 2.6,
    objects: [
      {
        id: 'pedestal',
        type: 'cylinder',
        position: [0, -0.15, 0],
        scale: [1.2, 0.1, 1.2],
        color: 0x111625,
        metalness: 0.3,
        roughness: 0.4,
      },
      {
        id: 'liver',
        type: 'model',
        url: '/models/liver.glb',
        position: [0.15, 0.48, 0],
        scale: [1, 1, 1],
        normalizeSize: 0.65,
        color: 0xffffff,
        interactive: true,
        label: 'Human Liver (Hepar)',
        description: 'Largest visceral organ. Secretes bile for emulsifying lipids and metabolizes portal nutrients.',
      },
      {
        id: 'small_intestine',
        type: 'model',
        url: '/models/small_intestine.glb',
        position: [0, 0.18, 0.05],
        scale: [1, 1, 1],
        normalizeSize: 0.75,
        color: 0xffffff,
        interactive: true,
        label: 'Small Intestine (Duodenum, Jejunum & Ileum)',
        description: 'Primary site of nutrient digestion and microvilli-mediated absorption into capillary networks.',
      },
      {
        id: 'large_intestine',
        type: 'model',
        url: '/models/large_intestine.glb',
        position: [0, 0.28, -0.05],
        scale: [1, 1, 1],
        normalizeSize: 0.9,
        color: 0xffffff,
        interactive: true,
        label: 'Large Intestine (Colon & Rectum)',
        description: 'Reabsorbs water, sodium and electrolytes from digestive residues and forms solid feces.',
      },
    ],
  },

  // 4. MIG WELDING FUNDAMENTALS (Vocational Skills)
  'mod_voc_001': {
    backgroundColor: 0x07090f,
    fogColor: 0x07090f,
    fogNear: 6,
    fogFar: 18,
    ambientIntensity: 0.8,
    cameraTarget: [0, 0.3, 0],
    defaultCameraDistance: 2.9,
    objects: [
      {
        id: 'welding_bench',
        type: 'box',
        position: [0, -0.08, 0],
        scale: [3.0, 0.14, 1.8],
        color: 0x1a1f2b,
        metalness: 0.85,
        roughness: 0.35,
        label: 'Heavy Steel Welding Platen',
      },
      {
        id: 'welding_helmet',
        type: 'model',
        url: '/models/welding_helmet.glb',
        position: [-0.6, 0.32, 0.1],
        rotation: [0, 0.6, 0],
        scale: [1, 1, 1],
        normalizeSize: 0.85,
        color: 0xffffff,
        interactive: true,
        label: 'Auto-Darkening MIG Welding Helmet',
        description: 'DIN 9-13 shade filter with dual photo-sensors for eye protection against UV/IR radiation.',
      },
      {
        id: 'workpiece_joint',
        type: 'box',
        position: [0.15, 0.05, 0],
        scale: [0.55, 0.03, 0.35],
        color: 0x5a6578,
        metalness: 0.92,
        roughness: 0.25,
        interactive: true,
        label: 'Mild Steel Butt Joint Workpiece (10mm)',
        description: 'Prepared double-V bevel joint clamped for MIG/MAG penetration testing.',
      },
      {
        id: 'mig_torch',
        type: 'cylinder',
        position: [0.25, 0.22, 0.15],
        rotation: [-Math.PI / 4, 0, Math.PI / 6],
        scale: [0.02, 0.32, 0.02],
        color: 0xb87333,
        metalness: 0.8,
        roughness: 0.2,
        interactive: true,
        label: 'MIG Torch Gun & Copper Gas Shroud',
        description: 'Delivers continuous wire electrode and argon/CO2 shielding gas to the molten weld puddle.',
      },
      {
        id: 'ground_clamp',
        type: 'box',
        position: [-0.2, 0.03, -0.2],
        scale: [0.12, 0.06, 0.08],
        color: 0xd97706,
        metalness: 0.7,
        roughness: 0.3,
        interactive: true,
        label: 'Heavy-Duty Earth Ground Clamp (300A)',
        description: 'Ensures safe return electrical circuit path to the DC power source.',
      },
    ],
  },

  // 5. SOLAR PV INSTALLATION (Vocational Skills)
  'mod_voc_002': {
    backgroundColor: 0x060911,
    fogColor: 0x060911,
    fogNear: 8,
    fogFar: 22,
    ambientIntensity: 0.85,
    cameraTarget: [0, 0.45, 0],
    defaultCameraDistance: 3.4,
    objects: [
      {
        id: 'roof_platform',
        type: 'box',
        position: [0, -0.1, 0],
        scale: [3.8, 0.15, 2.8],
        color: 0x1f2430,
        metalness: 0.1,
        roughness: 0.8,
        label: 'Mounting Roof Structure',
      },
      {
        id: 'solar_panel',
        type: 'model',
        url: '/models/solar_panel.glb',
        position: [-0.2, 0.35, 0],
        rotation: [Math.PI / 10, -Math.PI / 12, 0],
        scale: [1, 1, 1],
        normalizeSize: 1.6,
        color: 0xffffff,
        interactive: true,
        label: 'Monocrystalline PV Module (400W)',
        description: 'High-efficiency PERC solar cells with tempered anti-reflective glass and bypass diodes.',
      },
      {
        id: 'inverter_unit',
        type: 'box',
        position: [1.1, 0.4, -0.4],
        scale: [0.35, 0.55, 0.2],
        color: 0xe2e8f0,
        emissive: 0x0284c7,
        emissiveIntensity: 0.15,
        metalness: 0.6,
        roughness: 0.25,
        interactive: true,
        label: 'Hybrid Solar Inverter (3kW)',
        description: 'Converts DC array output to 230V AC pure sine wave with built-in MPPT charge controller.',
      },
      {
        id: 'battery_storage',
        type: 'box',
        position: [1.1, 0.05, 0.3],
        scale: [0.45, 0.3, 0.3],
        color: 0x0f172a,
        metalness: 0.5,
        roughness: 0.5,
        interactive: true,
        label: 'LiFePO4 Deep Cycle Battery Bank',
        description: '48V 100Ah lithium iron phosphate energy storage with integrated BMS protection.',
      },
      {
        id: 'dc_isolator',
        type: 'box',
        position: [0.75, 0.35, -0.4],
        scale: [0.1, 0.15, 0.08],
        color: 0xdc2626,
        interactive: true,
        label: 'DC Safety Disconnect Switch',
        description: 'Rapid arc-interrupting isolator between solar array and power electronics.',
      },
    ],
  },

  // 6. PLUMBING: PVC PIPE INSTALLATION (Vocational Skills)
  'mod_voc_003': {
    backgroundColor: 0x070913,
    fogColor: 0x070913,
    fogNear: 6,
    fogFar: 18,
    ambientIntensity: 0.85,
    cameraTarget: [0, 0.3, 0],
    defaultCameraDistance: 2.8,
    objects: [
      {
        id: 'bench',
        type: 'box',
        position: [0, -0.06, 0],
        scale: [3.2, 0.12, 1.8],
        color: 0x1b202e,
        metalness: 0.2,
        roughness: 0.7,
      },
      {
        id: 'pvc_main_pipe',
        type: 'cylinder',
        position: [0, 0.25, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.035, 1.2, 0.035],
        color: 0xf8fafc,
        metalness: 0.1,
        roughness: 0.3,
        interactive: true,
        label: 'Schedule 40 PVC Pipe (32mm / 1-1/4")',
        description: 'Rigid polyvinyl chloride pipework rated for cold potable water pressure distribution.',
      },
      {
        id: 'ball_valve',
        type: 'cylinder',
        position: [0, 0.25, 0],
        rotation: [Math.PI / 2, 0, 0],
        scale: [0.065, 0.12, 0.065],
        color: 0xd97706,
        metalness: 0.85,
        roughness: 0.25,
        interactive: true,
        label: 'Full-Port Brass Ball Valve',
        description: 'Quarter-turn shutoff mechanism for isolating water supply sections.',
      },
      {
        id: 'valve_lever',
        type: 'box',
        position: [0, 0.34, 0],
        scale: [0.18, 0.02, 0.04],
        color: 0xdc2626,
        interactive: true,
        label: 'Valve Actuation Lever (Red)',
        description: 'Rotate 90 degrees perpendicular to pipe axis to stop fluid flow.',
      },
      {
        id: 'pressure_gauge',
        type: 'cylinder',
        position: [-0.4, 0.38, 0],
        rotation: [Math.PI / 2, 0, 0],
        scale: [0.05, 0.03, 0.05],
        color: 0xe2e8f0,
        emissive: 0x0284c7,
        emissiveIntensity: 0.2,
        interactive: true,
        label: 'Hydrostatic Pressure Test Gauge (0-10 Bar)',
        description: 'Monitors line integrity during code-mandated 15-minute pressure retention inspection.',
      },
    ],
  },

  // 7. BASIC LIFE SUPPORT: CPR (Medical Simulation)
  'mod_medical_001': {
    backgroundColor: 0x06070e,
    fogColor: 0x06070e,
    fogNear: 6,
    fogFar: 18,
    ambientIntensity: 0.9,
    cameraTarget: [0, 0.3, 0],
    defaultCameraDistance: 2.8,
    objects: [
      {
        id: 'floor',
        type: 'plane',
        position: [0, -0.05, 0],
        rotation: [-Math.PI / 2, 0, 0],
        scale: [6, 6, 1],
        color: 0x0e111a,
        roughness: 0.85,
      },
      {
        id: 'heart_anatomy',
        type: 'model',
        url: '/models/heart.glb',
        position: [0.75, 0.45, -0.3],
        scale: [1, 1, 1],
        normalizeSize: 0.7,
        color: 0xffffff,
        interactive: true,
        label: 'Human Heart (Biomechanical Cardiac Model)',
        description: 'Four-chamber pump showing left/right ventricles, aorta, and coronary arteries being compressed.',
      },
      {
        id: 'brain_model',
        type: 'model',
        url: '/models/brain.glb',
        position: [-0.75, 0.4, -0.3],
        scale: [1, 1, 1],
        normalizeSize: 0.75,
        color: 0xffffff,
        interactive: true,
        playAnimation: true,
        label: 'Cerebral Perfusion Reference (Brain Stem)',
        description: 'Illustrates critical oxygenated blood delivery to brain tissue maintained by uninterrupted compressions.',
      },
      {
        id: 'patient_mannequin',
        type: 'box',
        position: [0, 0.08, 0],
        scale: [0.55, 0.2, 1.4],
        color: 0x334155,
        roughness: 0.75,
        label: 'Clinical Resuscitation Mannequin',
      },
      {
        id: 'chest_compression_point',
        type: 'cylinder',
        position: [0, 0.19, 0.05],
        scale: [0.14, 0.04, 0.14],
        color: 0xef4444,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.4,
        interactive: true,
        label: 'Chest Compression Point (Lower Half of Sternum)',
        description: 'Target for 5-6cm depth compressions at 100-120 bpm per Nigerian Resuscitation Council 2025 guidelines.',
      },
      {
        id: 'airway_head',
        type: 'sphere',
        position: [0, 0.18, -0.75],
        scale: [0.16, 0.16, 0.16],
        color: 0x475569,
        interactive: true,
        label: 'Airway Head Tilt & Chin Lift',
        description: 'Elevate mandible to displace tongue from posterior pharyngeal wall.',
      },
      {
        id: 'aed_device',
        type: 'box',
        position: [0.65, 0.1, 0.4],
        scale: [0.32, 0.14, 0.26],
        color: 0xfacc15,
        emissive: 0xca8a04,
        emissiveIntensity: 0.35,
        interactive: true,
        label: 'Automated External Defibrillator (AED)',
        description: 'Analyzes cardiac rhythm (VF/VT) and prompts synchronized defibrillation shock delivery.',
      },
    ],
  },

  // 8. INTRAVENOUS CANNULATION (Medical Simulation)
  'mod_medical_002': {
    backgroundColor: 0x070912,
    fogColor: 0x070912,
    fogNear: 5,
    fogFar: 16,
    ambientIntensity: 0.9,
    cameraTarget: [0, 0.25, 0],
    defaultCameraDistance: 2.5,
    objects: [
      {
        id: 'procedure_tray',
        type: 'box',
        position: [0, -0.05, 0],
        scale: [2.6, 0.1, 1.8],
        color: 0x1e293b,
        metalness: 0.6,
        roughness: 0.3,
        label: 'Stainless Steel Procedure Tray',
      },
      {
        id: 'arm_simulation',
        type: 'cylinder',
        position: [0, 0.12, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.12, 1.4, 0.12],
        color: 0x64748b,
        roughness: 0.7,
        label: 'Patient Forearm Model',
      },
      {
        id: 'median_cubital_vein',
        type: 'cylinder',
        position: [0, 0.24, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.016, 0.8, 0.016],
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.3,
        interactive: true,
        label: 'Median Cubital / Cephalic Vein',
        description: 'Superficial palpable vein of the upper extremity selected for cannulation.',
      },
      {
        id: 'iv_cannula_assembly',
        type: 'box',
        position: [0.2, 0.32, 0.15],
        scale: [0.22, 0.04, 0.06],
        color: 0xf59e0b,
        interactive: true,
        label: '20G IV Safety Cannula (Pink Wings)',
        description: 'Features flashback chamber confirming venous lumen entry, flexible polyurethane catheter and needle bevel.',
      },
      {
        id: 'tourniquet',
        type: 'torus',
        position: [-0.4, 0.12, 0],
        rotation: [0, Math.PI / 2, 0],
        scale: [0.14, 0.14, 0.14],
        color: 0x3b82f6,
        interactive: true,
        label: 'Quick-Release Vein Tourniquet',
        description: 'Applied 10-15cm proximal to intended venepuncture site to promote venous engorgement.',
      },
    ],
  },

  // 9. FIRE EVACUATION PROCEDURES & EXTINGUISHER (Industrial Safety)
  'mod_ind_001': {
    backgroundColor: 0x07080f,
    fogColor: 0x07080f,
    fogNear: 6,
    fogFar: 18,
    ambientIntensity: 0.85,
    cameraTarget: [0, 0.45, 0],
    defaultCameraDistance: 3.0,
    objects: [
      {
        id: 'safety_station_wall',
        type: 'plane',
        position: [0, 0.8, -0.6],
        scale: [3.5, 2.2, 1],
        color: 0x1e2433,
        roughness: 0.8,
        label: 'Industrial Safety Station Wall',
      },
      {
        id: 'fire_extinguisher',
        type: 'model',
        url: '/models/extinguisher.glb',
        position: [-0.3, 0.45, 0],
        scale: [1, 1, 1],
        normalizeSize: 1.1,
        color: 0xffffff,
        interactive: true,
        label: 'ABC Dry Chemical Powder Fire Extinguisher (6kg)',
        description: 'Pressurized cylinder with safety pull-pin, pressure gauge, operating squeeze lever, and discharge hose.',
      },
      {
        id: 'fire_alarm_station',
        type: 'model',
        url: '/models/alarm.glb',
        position: [0.7, 0.75, -0.4],
        scale: [1, 1, 1],
        normalizeSize: 0.6,
        color: 0xffffff,
        interactive: true,
        label: 'Manual Break-Glass Fire Alarm Call Point',
        description: 'Triggers building-wide evacuation siren and signals local emergency dispatch services.',
      },
      {
        id: 'exit_sign',
        type: 'box',
        position: [0, 1.4, -0.55],
        scale: [0.6, 0.25, 0.05],
        color: 0x15803d,
        emissive: 0x22c55e,
        emissiveIntensity: 0.5,
        interactive: true,
        label: 'Illuminated Emergency Exit Route Sign',
        description: 'Complies with ISPON building safety egress pathway guidelines.',
      },
    ],
  },

  // 10. CHEMICAL SPILL RESPONSE (Industrial Safety)
  'mod_ind_002': {
    backgroundColor: 0x060810,
    fogColor: 0x060810,
    fogNear: 6,
    fogFar: 18,
    ambientIntensity: 0.85,
    cameraTarget: [0, 0.35, 0],
    defaultCameraDistance: 2.9,
    objects: [
      {
        id: 'floor',
        type: 'plane',
        position: [0, -0.05, 0],
        rotation: [-Math.PI / 2, 0, 0],
        scale: [6, 6, 1],
        color: 0x0f1420,
        roughness: 0.85,
      },
      {
        id: 'spill_zone',
        type: 'cylinder',
        position: [0, -0.03, 0],
        scale: [0.6, 0.01, 0.6],
        color: 0xfacc15,
        emissive: 0xca8a04,
        emissiveIntensity: 0.3,
        roughness: 0.1,
        metalness: 0.2,
        interactive: true,
        label: 'Hydrochloric Acid Spill Pool (HCl 2.0M)',
        description: 'Corrosive chemical puddle requiring immediate perimeter containment and sodium bicarbonate neutralization.',
      },
      {
        id: 'hazmat_drum',
        type: 'cylinder',
        position: [0.85, 0.38, -0.4],
        scale: [0.28, 0.8, 0.28],
        color: 0xeab308,
        metalness: 0.6,
        roughness: 0.3,
        interactive: true,
        label: 'Yellow Chemical Waste Recovery Overpack Drum',
        description: 'UN-rated poly container for holding contaminated absorbents and neutralized residues.',
      },
      {
        id: 'absorbent_sock',
        type: 'torus',
        position: [0, 0.01, 0],
        rotation: [Math.PI / 2, 0, 0],
        scale: [0.65, 0.65, 0.65],
        color: 0x475569,
        interactive: true,
        label: 'Polypropylene Chemical Containment Berm Sock',
        description: 'Placed around spill perimeter to prevent migration toward drains or footpaths.',
      },
      {
        id: 'neutralizer_shaker',
        type: 'cylinder',
        position: [-0.6, 0.25, 0.3],
        scale: [0.08, 0.3, 0.08],
        color: 0xffffff,
        interactive: true,
        label: 'Sodium Bicarbonate Neutralizer Powder (NaHCO3)',
        description: 'Buffer salt applied gradually until foaming effervescence ceases and pH reaches 7.0.',
      },
    ],
  },

  // 11. TRACTOR OPERATION & SAFETY (Agricultural Simulation)
  'mod_agric_001': {
    backgroundColor: 0x060910,
    fogColor: 0x060910,
    fogNear: 8,
    fogFar: 22,
    ambientIntensity: 0.9,
    cameraTarget: [0, 0.45, 0],
    defaultCameraDistance: 3.5,
    objects: [
      {
        id: 'terrain',
        type: 'plane',
        position: [0, -0.1, 0],
        rotation: [-Math.PI / 2, 0, 0],
        scale: [10, 10, 1],
        color: 0x1f241d,
        roughness: 0.9,
        label: 'Agricultural Soil Field Surface',
      },
      {
        id: 'rotary_tiller',
        type: 'model',
        url: '/models/tiller.glb',
        position: [-0.2, 0.25, 0],
        scale: [1, 1, 1],
        normalizeSize: 1.8,
        color: 0xffffff,
        interactive: true,
        label: 'Heavy Power Rotary Tiller Implement',
        description: 'PTO-driven cultivation machinery with curved soil-pulverizing tines and safety debris flap.',
      },
      {
        id: 'three_point_hitch',
        type: 'box',
        position: [0.85, 0.3, 0],
        scale: [0.25, 0.45, 0.35],
        color: 0x16a34a,
        metalness: 0.8,
        roughness: 0.3,
        interactive: true,
        label: 'Tractor 3-Point Linkage & Top Link Hitch',
        description: 'Category 2 hydraulic linkage system transmitting tractive power and draft depth control.',
      },
      {
        id: 'pto_shaft_guard',
        type: 'cylinder',
        position: [0.55, 0.3, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.07, 0.4, 0.07],
        color: 0xfacc15,
        interactive: true,
        label: 'PTO Drive Shaft & Yellow Safety Shield',
        description: '540 RPM power transfer shaft protected by mandatory free-spinning protective casing.',
      },
    ],
  },

  // 12. DRIP IRRIGATION SYSTEM SETUP (Agricultural Simulation)
  'mod_agric_002': {
    backgroundColor: 0x050a0e,
    fogColor: 0x050a0e,
    fogNear: 7,
    fogFar: 20,
    ambientIntensity: 0.95,
    cameraTarget: [0, 0.4, 0],
    defaultCameraDistance: 3.0,
    objects: [
      {
        id: 'crop_soil_bed',
        type: 'box',
        position: [0, -0.06, 0],
        scale: [3.4, 0.12, 2.2],
        color: 0x1e221a,
        roughness: 0.95,
        label: 'Cultivated Tomato Crop Bed (0.5 Ha)',
      },
      {
        id: 'crop_plant',
        type: 'model',
        url: '/models/crop_plant.glb',
        position: [0, 0.1, 0],
        scale: [1, 1, 1],
        normalizeSize: 1.25,
        color: 0xffffff,
        interactive: true,
        playAnimation: true,
        label: 'Horticultural Crop Plant (Solanum lycopersicum)',
        description: 'High-yield tomato plant configured for root-zone moisture delivery and transpiration optimization.',
      },
      {
        id: 'drip_lateral_tubing',
        type: 'cylinder',
        position: [0, 0.02, 0.25],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.014, 2.6, 0.014],
        color: 0x111827,
        roughness: 0.4,
        interactive: true,
        label: '16mm UV-Resistant Polyethylene Drip Lateral',
        description: 'Low-density PE distribution line carrying filtered water under 1.5 bar operating pressure.',
      },
      {
        id: 'pressure_emitter',
        type: 'cylinder',
        position: [0, 0.03, 0.25],
        scale: [0.025, 0.02, 0.025],
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.35,
        interactive: true,
        label: 'Pressure-Compensating Drip Emitter (2.0 L/hr)',
        description: 'Delivers precise uniform discharge directly to root zone regardless of line elevation variations.',
      },
      {
        id: 'filter_manifold',
        type: 'cylinder',
        position: [-1.1, 0.15, 0.25],
        rotation: [Math.PI / 2, 0, 0],
        scale: [0.06, 0.22, 0.06],
        color: 0x15803d,
        interactive: true,
        label: '120 Mesh Disc Filtration Unit',
        description: 'Prevents algae and particulate clogging of micro-irrigation emitter labyrinths.',
      },
    ],
  },

  // FALLBACK DEFAULT
  default: {
    backgroundColor: 0x080810,
    fogColor: 0x080810,
    fogNear: 8,
    fogFar: 18,
    ambientIntensity: 0.8,
    cameraTarget: [0, 0.3, 0],
    defaultCameraDistance: 3.0,
    objects: [
      {
        id: 'platform',
        type: 'box',
        position: [0, -0.1, 0],
        scale: [2.5, 0.08, 2.5],
        color: 0x1a1a2e,
        metalness: 0.2,
        roughness: 0.8,
      },
      {
        id: 'model_display',
        type: 'model',
        url: '/models/microscope.glb',
        position: [0, 0, 0],
        scale: [1, 1, 1],
        normalizeSize: 1.2,
        color: 0xffffff,
        interactive: true,
        label: 'Laboratory Instrument',
      },
    ],
  },
}

// ============================================================
// PHOTOREALISTIC TITRATION PROCEDURAL GENERATOR & APPARATUS
// ============================================================

export interface TitrationState {
  volumeAdded: number
  buretteReading: number
  initialReading: number
  analyteVolume: number
  titrantMolarity: number
  analyteMolarity: number
  currentPH: number
  flowRate: 'closed' | 'single_drop' | 'dropwise' | 'stream'
  stopcockAngle: number // 0 to 90 degrees
  isSwirling: boolean
  isEndpoint: boolean
  isOvershot: boolean
  colorName: string
  colorHex: string
  dropCount: number
  // Interactive portable apparatus state
  activeTool: 'none' | 'wash_bottle' | 'indicator' | 'pipette' | 'reagent_beaker' | 'litmus_strip' | 'flask'
  isSqueezing: boolean
  beakerTiltAngle: number // 0 to 85 degrees
  litmusDipped: boolean
  litmusColorHex: string
  pipetteVolume: number // 0 to 25.00 mL
  pipetteState: 'empty' | 'filled' | 'dispensed'
}

export function getLitmusColor(ph: number): string {
  if (ph <= 2.5) return '#dc2626' // Red (Strong Acid)
  if (ph <= 4.5) return '#ea580c' // Orange (Moderate Acid)
  if (ph <= 6.5) return '#ca8a04' // Yellow (Weak Acid)
  if (ph <= 7.5) return '#16a34a' // Green (Neutral pH 7)
  if (ph <= 9.5) return '#0891b2' // Teal (Weak Base)
  if (ph <= 11.5) return '#2563eb' // Blue (Moderate Base)
  return '#7c3aed' // Purple / Violet (Strong Base)
}

function createValveBadgeTexture(letter: 'A' | 'S' | 'E'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 128, 128)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(64, 64, 54, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 8
    ctx.strokeStyle = '#991b1b'
    ctx.stroke()

    ctx.fillStyle = '#991b1b'
    ctx.font = '900 68px "Arial", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letter, 64, 66)
  }
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function createLitmusChartTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, 512, 256)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 4
    ctx.strokeRect(4, 4, 504, 248)

    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('UNIVERSAL pH TEST STRIPS (pH 1 - 14)', 256, 36)

    // 14 Color Swatches
    const colors = [
      '#dc2626', '#ef4444', '#f97316', '#fb923c', '#facc15',
      '#eab308', '#22c55e', '#16a34a', '#06b6d4', '#0284c7',
      '#3b82f6', '#2563eb', '#8b5cf6', '#6d28d9'
    ]
    const swatchW = 32
    const startX = 32
    colors.forEach((col, i) => {
      const x = startX + i * swatchW
      ctx.fillStyle = col
      ctx.fillRect(x, 60, swatchW - 4, 80)
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, 60, swatchW - 4, 80)

      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px monospace'
      ctx.fillText(`${i + 1}`, x + (swatchW - 4) / 2, 165)
    })

    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.fillText('Acidic (1-6) • Neutral (7) • Basic (8-14)', 256, 215)
  }
  return new THREE.CanvasTexture(canvas)
}

function createReagentLabelTexture(title: string, sub: string, note: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 256)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 4
    ctx.strokeRect(6, 6, 500, 244)

    ctx.fillStyle = '#b91c1c'
    ctx.fillRect(10, 10, 492, 14)

    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 34px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, 256, 75)

    ctx.font = 'bold 22px sans-serif'
    ctx.fillStyle = '#334155'
    ctx.fillText(sub, 256, 120)

    ctx.font = '16px monospace'
    ctx.fillStyle = '#64748b'
    ctx.fillText(note, 256, 160)

    // Hazard diamond
    ctx.save()
    ctx.translate(256, 210)
    ctx.rotate(Math.PI / 4)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 3
    ctx.strokeRect(-16, -16, 32, 32)
    ctx.restore()
  }
  return new THREE.CanvasTexture(canvas)
}

function createBuretteScaleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 2048
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Rear white Schellbach contrast stripe with central blue line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fillRect(80, 0, 110, 2048)
    ctx.fillStyle = '#0284c7'
    ctx.fillRect(130, 0, 14, 2048)

    // Front Class A volumetric graduation marks
    const startY = 80
    const endY = 1960
    const totalLines = 500 // 0.1 mL subdivisions for 50 mL

    ctx.strokeStyle = '#0a2540'
    ctx.fillStyle = '#0a2540'
    ctx.font = 'bold 30px "JetBrains Mono", monospace'
    ctx.textAlign = 'left'

    // Vertical alignment guide line
    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.moveTo(270, startY)
    ctx.lineTo(270, endY)
    ctx.stroke()

    for (let i = 0; i <= totalLines; i++) {
      const y = startY + (i / totalLines) * (endY - startY)
      const ml = i / 10
      const isWhole = i % 10 === 0
      const isHalf = i % 5 === 0

      ctx.beginPath()
      if (isWhole) {
        ctx.lineWidth = 5
        ctx.moveTo(200, y)
        ctx.lineTo(270, y)
        ctx.stroke()
        ctx.fillText(`${ml}`, 286, y + 10)
      } else if (isHalf) {
        ctx.lineWidth = 3.5
        ctx.moveTo(225, y)
        ctx.lineTo(270, y)
        ctx.stroke()
      } else {
        ctx.lineWidth = 2
        ctx.moveTo(242, y)
        ctx.lineTo(270, y)
        ctx.stroke()
      }
    }

    // Class A specification text at top
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('CLASS A 50mL : 0.1mL', 280, 50)
    ctx.font = '18px sans-serif'
    ctx.fillText('Ex 20°C ±0.05mL', 280, 72)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function createFlaskDecalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('PYREX®', 256, 70)
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('250 mL', 256, 110)
    ctx.font = '18px sans-serif'
    ctx.fillText('No. 4980 • BOROSILICATE', 256, 140)

    // Graduation approximate lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(180, 180); ctx.lineTo(332, 180)
    ctx.moveTo(200, 215); ctx.lineTo(312, 215)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function createErlenmeyerFlaskGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = []
  // Proportions matching standard Pyrex 250mL flask: base r=43mm, neck r=17mm, h=142mm
  points.push(new THREE.Vector2(0, 0))
  points.push(new THREE.Vector2(0.040, 0))
  points.push(new THREE.Vector2(0.043, 0.003))
  points.push(new THREE.Vector2(0.018, 0.105))
  points.push(new THREE.Vector2(0.0165, 0.138))
  points.push(new THREE.Vector2(0.0195, 0.142)) // rim bead
  points.push(new THREE.Vector2(0.0195, 0.145))
  points.push(new THREE.Vector2(0.015, 0.145))
  points.push(new THREE.Vector2(0.0145, 0.138)) // inner wall
  points.push(new THREE.Vector2(0.016, 0.105))
  points.push(new THREE.Vector2(0.0405, 0.005))
  points.push(new THREE.Vector2(0, 0.005))
  return new THREE.LatheGeometry(points, 64)
}

function createFlaskLiquidGeometry(level: number = 0.5): THREE.BufferGeometry {
  const points: THREE.Vector2[] = []
  const baseR = 0.040
  const clampedLevel = Math.max(0.1, Math.min(1.0, level))
  // Inner volume from bottom y=0.005 to h=0.005 + 0.095 * level
  const h = 0.005 + 0.088 * clampedLevel
  const topR = baseR - (baseR - 0.016) * clampedLevel
  points.push(new THREE.Vector2(0, 0.005))
  points.push(new THREE.Vector2(baseR, 0.005))
  points.push(new THREE.Vector2(topR, h))
  points.push(new THREE.Vector2(topR * 0.75, h - 0.002)) // concave meniscus center
  points.push(new THREE.Vector2(0, h - 0.002))
  return new THREE.LatheGeometry(points, 48)
}

function createLabTilesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#0d131f'
    ctx.fillRect(0, 0, 1024, 1024)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 3

    const tileW = 128
    const tileH = 64
    for (let y = 0; y < 1024; y += tileH) {
      const offsetX = (Math.floor(y / tileH) % 2) * (tileW / 2)
      for (let x = -tileW; x < 1024 + tileW; x += tileW) {
        ctx.fillStyle = (Math.floor((x + y) / 100) % 2 === 0) ? '#0f172a' : '#111c33'
        ctx.fillRect(x + offsetX + 2, y + 2, tileW - 4, tileH - 4)
        ctx.strokeRect(x + offsetX, y, tileW, tileH)
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 2)
  return texture
}

// ============================================================
// SIMULATION RENDERER CLASS (Advanced Multi-Model 3D Engine)
// ============================================================

export interface ApparatusScreenInfo {
  id: string
  label: string
  description: string
  category: string
  actionHint: string
  screenX: number
  screenY: number
  visible: boolean
}

export interface SimulationRendererOptions {
  canvas: HTMLCanvasElement
  moduleId: string
  onObjectClick?: (objectId: string, label: string) => void
  onHoverChange?: (objectId: string | null, label: string | null, description: string | null) => void
  onApparatusScreenInfo?: (info: ApparatusScreenInfo | null) => void
  onLoad?: () => void
  onProgress?: (pct: number, item: string) => void
  onTitrationUpdate?: (state: TitrationState) => void
}

export class SimulationRenderer {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private animationId: number | null = null
  private world: SimulationWorld
  private objects: Map<string, THREE.Object3D> = new Map()
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private mouseDownPos = { x: 0, y: 0 }
  private hoveredObject: string | null = null
  private highlightedObject: string | null = null
  private options: SimulationRendererOptions
  private sceneConfig: SceneConfig

  // Loaders
  private gltfLoader: GLTFLoader
  private dracoLoader: DRACOLoader
  private ktx2Loader: KTX2Loader

  // Animation mixers
  private mixers: THREE.AnimationMixer[] = []

  // Titration simulation state & dynamic 3D elements
  private titrationState: TitrationState = {
    volumeAdded: 0,
    buretteReading: 0.0,
    initialReading: 0.0,
    analyteVolume: 25.0,
    titrantMolarity: 0.1,
    analyteMolarity: 0.0896,
    currentPH: 1.05,
    flowRate: 'closed',
    stopcockAngle: 0,
    isSwirling: false,
    isEndpoint: false,
    isOvershot: false,
    colorName: 'Colorless (Acidic pH)',
    colorHex: '#f8fafc',
    dropCount: 0,
    activeTool: 'none',
    isSqueezing: false,
    beakerTiltAngle: 0,
    litmusDipped: false,
    litmusColorHex: '#ca8a04',
    pipetteVolume: 0,
    pipetteState: 'empty',
  }
  private flaskLiquidMesh: THREE.Mesh | null = null
  private buretteLiquidMesh: THREE.Mesh | null = null
  private stopcockHandleGroup: THREE.Group | null = null
  private flaskSwirlGroup: THREE.Group | null = null
  private titrationDropMesh: THREE.Mesh | null = null
  private dropTimer = 0
  private swirlTimer = 0
  private transientBlush = 0
  private isMeniscusZoom = false

  // Interactive portable apparatus & continuous controls
  private isDraggingStopcock = false
  private activeTool: 'none' | 'wash_bottle' | 'indicator' | 'pipette' | 'reagent_beaker' | 'litmus_strip' | 'flask' = 'none'
  private toolRestTransforms: Map<string, { position: THREE.Vector3; rotation: THREE.Euler }> = new Map()
  private washBottleBody: THREE.Mesh | null = null
  private washSprayMesh: THREE.Mesh | null = null
  private indicatorBulbMesh: THREE.Mesh | null = null
  private litmusStripTipMesh: THREE.Mesh | null = null
  private pipetteLiquidMesh: THREE.Mesh | null = null

  // Camera & Orbit controls state
  private isDragging = false
  private previousMousePosition = { x: 0, y: 0 }
  private spherical = { theta: 0.45, phi: 1.1, radius: 3.2 }
  private targetSpherical = { theta: 0.45, phi: 1.1, radius: 3.2 }
  private targetLookAt = new THREE.Vector3(0, 0.45, 0)
  private currentLookAt = new THREE.Vector3(0, 0.45, 0)
  private autoRotate = false
  private lastTime = 0

  constructor(options: SimulationRendererOptions) {
    this.options = options
    this.sceneConfig = SCENE_CONFIGS[options.moduleId] ?? SCENE_CONFIGS.default
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.world = new SimulationWorld()

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    // Clamp pixel ratio to max 1.75 to prevent VRAM memory crashes on Retina/4K displays
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    const initialW = Math.max(1, options.canvas.clientWidth || 800)
    const initialH = Math.max(1, options.canvas.clientHeight || 600)
    this.renderer.setSize(initialW, initialH, false)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.3
    this.renderer.xr.enabled = true

    // Loaders initialization
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')

    this.ktx2Loader = new KTX2Loader()
    this.ktx2Loader.setTranscoderPath('/basis/')
    this.ktx2Loader.detectSupport(this.renderer)

    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
    this.gltfLoader.setKTX2Loader(this.ktx2Loader)
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder)

    // Scene & Fog
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.sceneConfig.backgroundColor)
    this.scene.fog = new THREE.Fog(
      this.sceneConfig.fogColor,
      this.sceneConfig.fogNear,
      this.sceneConfig.fogFar
    )

    // Camera setup
    const dist = this.sceneConfig.defaultCameraDistance ?? 3.2
    this.spherical.radius = dist
    this.targetSpherical.radius = dist
    if (this.sceneConfig.cameraTarget) {
      this.targetLookAt.set(...this.sceneConfig.cameraTarget)
      this.currentLookAt.set(...this.sceneConfig.cameraTarget)
    }

    this.camera = new THREE.PerspectiveCamera(
      48,
      options.canvas.clientWidth / options.canvas.clientHeight,
      0.01,
      100
    )
    this.camera.position.set(0, 1.2, dist)
    this.camera.lookAt(this.currentLookAt)

    this.setupEnvironment()
    this.setupLights()
    this.buildScene()
    this.setupEventListeners()
    this.world.start()
    this.animate()
  }

  private setupEnvironment(): void {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    pmremGenerator.compileEquirectangularShader()

    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color(0x070b14)

    // Overhead diffuse studio light
    const softbox1 = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    softbox1.position.set(0, 7, 0)
    softbox1.rotation.x = Math.PI / 2
    envScene.add(softbox1)

    // Cyan/Cool rim fill
    const softbox2 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa })
    )
    softbox2.position.set(-6, 3, 2)
    softbox2.rotation.y = Math.PI / 2
    envScene.add(softbox2)

    // Warm accent rim
    const softbox3 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    )
    softbox3.position.set(6, 3, -2)
    softbox3.rotation.y = -Math.PI / 2
    envScene.add(softbox3)

    const renderTarget = pmremGenerator.fromScene(envScene)
    this.scene.environment = renderTarget.texture
    pmremGenerator.dispose()
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, this.sceneConfig.ambientIntensity)
    this.scene.add(ambient)

    // Key directional light with high-res soft shadow mapping
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(3, 5, 3)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 15
    key.shadow.bias = -0.0001
    this.scene.add(key)

    // Cool fill light from opposing angle
    const fill = new THREE.DirectionalLight(0x93c5fd, 0.6)
    fill.position.set(-3, 2.5, 2)
    this.scene.add(fill)

    // Rim highlight light from back
    const rim = new THREE.DirectionalLight(0xe0e7ff, 0.75)
    rim.position.set(0, 4, -3.5)
    this.scene.add(rim)

    if (this.options.moduleId === 'mod_science_001') {
      // Soft laboratory luminaire downlight
      const labDownlight = new THREE.DirectionalLight(0xffffff, 0.9)
      labDownlight.position.set(0, 3.5, 0.2)
      this.scene.add(labDownlight)
    } else {
      // Subtle neon accent glow point light for industrial scenes
      const accentSpot = new THREE.PointLight(0x38bdf8, 0.5, 8)
      accentSpot.position.set(0, 0.8, 1.2)
      this.scene.add(accentSpot)
    }
  }

  private buildScene(): void {
    if (this.options.moduleId === 'mod_science_001') {
      this.buildPhotorealisticTitrationScene()
      this.options.onLoad?.()
      return
    }

    const { objects } = this.sceneConfig
    let loadedCount = 0
    const totalModels = objects.filter((o) => o.type === 'model').length

    if (totalModels === 0) {
      this.options.onLoad?.()
    }

    for (const obj of objects) {
      if (obj.type === 'model' && obj.url) {
        this.gltfLoader.load(
          obj.url,
          (gltf) => {
            const model = gltf.scene

            // Normalize size if requested so any arbitrary 3D asset fits the scene nicely
            if (obj.normalizeSize) {
              const bbox = new THREE.Box3().setFromObject(model)
              const size = new THREE.Vector3()
              bbox.getSize(size)
              const maxDim = Math.max(size.x, size.y, size.z)
              if (maxDim > 0) {
                const s = obj.normalizeSize / maxDim
                model.scale.set(s, s, s)
              }
              // Center model at origin before applying target position
              const center = new THREE.Vector3()
              bbox.getCenter(center)
              model.position.sub(center.clone().multiply(model.scale))
            } else if (obj.scale) {
              model.scale.set(...obj.scale)
            }

            model.position.add(new THREE.Vector3(...obj.position))
            if (obj.rotation) model.rotation.set(...obj.rotation)

            model.userData = {
              id: obj.id,
              label: obj.label ?? obj.id,
              description: obj.description ?? '',
              interactive: obj.interactive ?? false,
              isGroup: true,
            }
            model.name = obj.id

            // Traverse and enable shadows & material PBR tuning
            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh
                mesh.castShadow = true
                mesh.receiveShadow = true
                if (mesh.material) {
                  const mat = mesh.material as THREE.MeshStandardMaterial
                  if (mat.isMeshStandardMaterial) {
                    mat.envMapIntensity = 1.2
                    mesh.userData = {
                      originalEmissive: mat.emissive ? mat.emissive.getHex() : 0x000000,
                      originalEmissiveIntensity: mat.emissiveIntensity ?? 0,
                    }
                  }
                }
              }
            })

            // Play animation if present
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(model)
              gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play()
              })
              this.mixers.push(mixer)
            }

            this.scene.add(model)
            this.objects.set(obj.id, model)

            loadedCount++
            const pct = Math.round((loadedCount / totalModels) * 100)
            this.options.onProgress?.(pct, obj.label ?? obj.id)

            if (loadedCount >= totalModels) {
              this.options.onLoad?.()
            }
          },
          (xhr) => {
            if (xhr.lengthComputable) {
              const progress = Math.round((xhr.loaded / xhr.total) * 100)
              this.options.onProgress?.(progress, obj.label ?? obj.id)
            }
          },
          (error) => {
            console.error(`Error loading model ${obj.url}:`, error)
            loadedCount++
            if (loadedCount >= totalModels) {
              this.options.onLoad?.()
            }
          }
        )
        continue
      }

      // Procedural shapes
      let geometry: THREE.BufferGeometry
      switch (obj.type) {
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(1, 1, 1, 32)
          break
        case 'sphere':
          geometry = new THREE.SphereGeometry(1, 32, 32)
          break
        case 'plane':
          geometry = new THREE.PlaneGeometry(1, 1)
          break
        case 'torus':
          geometry = new THREE.TorusGeometry(1, 0.25, 16, 64)
          break
        case 'cone':
          geometry = new THREE.ConeGeometry(1, 1, 32)
          break
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1)
      }

      const material = new THREE.MeshStandardMaterial({
        color: obj.color,
        emissive: obj.emissive ? new THREE.Color(obj.emissive) : new THREE.Color(0x000000),
        emissiveIntensity: obj.emissiveIntensity ?? 0,
        metalness: obj.metalness ?? 0.1,
        roughness: obj.roughness ?? 0.6,
        wireframe: obj.wireframe ?? false,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...obj.position)
      if (obj.rotation) mesh.rotation.set(...obj.rotation)
      if (obj.scale) mesh.scale.set(...obj.scale)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = {
        id: obj.id,
        label: obj.label ?? obj.id,
        description: obj.description ?? '',
        interactive: obj.interactive ?? false,
        originalColor: obj.color,
        originalEmissive: obj.emissive ?? 0x000000,
        originalEmissiveIntensity: obj.emissiveIntensity ?? 0,
      }
      mesh.name = obj.id

      this.scene.add(mesh)
      this.objects.set(obj.id, mesh)
    }

    // Ground orientation grid
    const grid = new THREE.GridHelper(6, 24, 0x1e293b, 0x0f172a)
    grid.position.y = -0.1
    this.scene.add(grid)
  }

  // ============================================================
  // PHOTOREALISTIC TITRATION SCENE GENERATOR
  // ============================================================
  private buildPhotorealisticTitrationScene(): void {
    const benchGroup = new THREE.Group()

    // 1. High-Performance Epoxy Resin Lab Workbench
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.22,
      metalness: 0.12,
    })
    const benchMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 1.6), tableMat)
    benchMesh.position.set(0, -0.04, 0)
    benchMesh.receiveShadow = true
    benchGroup.add(benchMesh)

    // Beveled front worktop edge
    const beveledEdge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 3.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x1f2430, roughness: 0.3, metalness: 0.2 })
    )
    beveledEdge.rotation.z = Math.PI / 2
    beveledEdge.position.set(0, 0, 0.8)
    benchGroup.add(beveledEdge)

    // 2. Ceramic Subway Tile Splashback Wall
    const tileTex = createLabTilesTexture()
    const wallMat = new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.14,
      metalness: 0.05,
    })
    const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), wallMat)
    wallMesh.position.set(0, 1.02, -0.75)
    wallMesh.receiveShadow = true
    benchGroup.add(wallMesh)

    // Stainless steel utility service conduit & gas turret
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.15, metalness: 0.92 })
    const utilityPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.5, 16), pipeMat)
    utilityPipe.rotation.z = Math.PI / 2
    utilityPipe.position.set(0, 0.12, -0.71)
    benchGroup.add(utilityPipe)

    const gasTurret = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), pipeMat)
    gasTurret.position.set(-0.8, 0.16, -0.71)
    benchGroup.add(gasTurret)

    // Reagent shelf on wall with chrome brackets
    const shelfGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.04,
      ior: 1.5,
      thickness: 0.02,
    })
    const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.015, 0.22), shelfGlassMat)
    shelfMesh.position.set(0.1, 0.65, -0.62)
    benchGroup.add(shelfMesh)

    // Wall shelf auxiliary reagent bottles
    const amberShelfMat = new THREE.MeshPhysicalMaterial({
      color: 0x78350f,
      transmission: 0.65,
      roughness: 0.15,
      ior: 1.54,
    })
    const shelfBottle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.13, 24), amberShelfMat)
    shelfBottle1.position.set(-0.55, 0.725, -0.62)
    benchGroup.add(shelfBottle1)

    const shelfBottle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.13, 24), shelfGlassMat)
    shelfBottle2.position.set(-0.43, 0.725, -0.62)
    benchGroup.add(shelfBottle2)

    // Overhead softbox luminaire fixture
    const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    const luminaire = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.45), fixtureMat)
    luminaire.position.set(0, 2.3, -0.1)
    benchGroup.add(luminaire)

    const diffuser = new THREE.Mesh(
      new THREE.PlaneGeometry(1.54, 0.41),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    diffuser.rotation.x = Math.PI / 2
    diffuser.position.set(0, 2.27, -0.1)
    benchGroup.add(diffuser)

    benchGroup.userData = { id: 'bench', label: 'University Laboratory Workbench', interactive: false }
    this.scene.add(benchGroup)
    this.objects.set('bench', benchGroup)

    // Materials Library for Apparatus
    const pyrexGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.52,
      thickness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: new THREE.Color(0xddeeff),
      attenuationDistance: 0.6,
    })

    const castIronMat = new THREE.MeshStandardMaterial({
      color: 0x242832,
      roughness: 0.48,
      metalness: 0.85,
    })

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.08,
      metalness: 0.96,
    })

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.88,
    })

    const redPtfeMat = new THREE.MeshStandardMaterial({
      color: 0xd92626,
      roughness: 0.28,
      metalness: 0.1,
    })

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.65,
      metalness: 0.05,
    })

    // 3. Glazed White Porcelain Tile (Crucial for endpoint color contrast)
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.04,
      metalness: 0.02,
    })
    const ceramicTile = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.010, 0.18), ceramicMat)
    ceramicTile.position.set(-0.15, 0.005, 0.00)
    ceramicTile.receiveShadow = true
    ceramicTile.castShadow = true
    ceramicTile.userData = {
      id: 'ceramic_tile',
      label: 'Glazed White Porcelain Contrast Tile',
      description: 'Neutral white ceramic tile placed beneath Erlenmeyer flask to provide maximum optical contrast for detecting faint pink endpoint transition.',
      interactive: true,
    }
    this.scene.add(ceramicTile)
    this.objects.set('ceramic_tile', ceramicTile)

    // 4. Retort Stand & Dual-Finger Clamp Assembly (Rigid Analytical Chemistry Laboratory Setup)
    const standGroup = new THREE.Group()
    standGroup.position.set(-0.15, 0, 0)

    // Solid cast iron rectangular base sitting to the left of the titration zone
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.024, 0.28), castIronMat)
    baseMesh.position.set(-0.18, 0.012, 0.0)
    baseMesh.castShadow = true
    baseMesh.receiveShadow = true
    standGroup.add(baseMesh)

    // 4 vibration-dampening rubber feet under base
    const footGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.004, 16)
    const footPositions = [
      [-0.25, 0.002, -0.11],
      [-0.25, 0.002, 0.11],
      [-0.11, 0.002, -0.11],
      [-0.11, 0.002, 0.11],
    ]
    for (const [fx, fy, fz] of footPositions) {
      const foot = new THREE.Mesh(footGeom, rubberMat)
      foot.position.set(fx, fy, fz)
      standGroup.add(foot)
    }

    // Stainless steel upright vertical rod screwed directly into base plate at [-0.18, 0.024, 0.0]
    const rodMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 1.40, 32), chromeMat)
    rodMesh.position.set(-0.18, 0.720, 0.0)
    rodMesh.castShadow = true
    standGroup.add(rodMesh)

    // Chrome spherical top cap on upright rod
    const rodCap = new THREE.Mesh(new THREE.SphereGeometry(0.007, 16, 16), chromeMat)
    rodCap.position.set(-0.18, 1.420, 0.0)
    standGroup.add(rodCap)

    // --- Upper Clamp Assembly (holding burette barrel at y = 0.850) ---
    // Cast iron bosshead clamped to vertical rod
    const bosshead = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.052, 0.048), castIronMat)
    bosshead.position.set(-0.18, 0.850, 0.0)
    bosshead.castShadow = true
    standGroup.add(bosshead)

    // Bosshead rear locking T-screw (clamps onto vertical rod)
    const bossheadScrewStem = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.028, 16), brassMat)
    bossheadScrewStem.rotation.x = Math.PI / 2
    bossheadScrewStem.position.set(-0.18, 0.850, -0.034)
    standGroup.add(bossheadScrewStem)

    const bossheadScrewBar = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.028, 16), brassMat)
    bossheadScrewBar.rotation.z = Math.PI / 2
    bossheadScrewBar.position.set(-0.18, 0.850, -0.048)
    standGroup.add(bossheadScrewBar)

    // Bosshead top locking thumbscrew (clamps horizontal arm)
    const bossheadArmScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.024, 16), brassMat)
    bossheadArmScrew.position.set(-0.160, 0.880, 0.0)
    standGroup.add(bossheadArmScrew)

    // Upper horizontal chrome clamp arm (spans continuously from bosshead at x = -0.18 to clamp body at x = -0.025)
    const upperArmLength = 0.155 // Exactly spans from x = -0.18 to x = -0.025
    const clampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, upperArmLength, 24), chromeMat)
    clampArm.rotation.z = Math.PI / 2
    clampArm.position.set(-0.1025, 0.850, 0.0)
    clampArm.castShadow = true
    standGroup.add(clampArm)

    // Burette dual-jaw clamp body housing
    const clampBody = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.028, 0.032), chromeMat)
    clampBody.position.set(-0.025, 0.850, 0.0)
    clampBody.castShadow = true
    standGroup.add(clampBody)

    // Clamp adjustment thumbscrew and washer
    const clampThumbscrew = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.020, 16), brassMat)
    clampThumbscrew.position.set(-0.025, 0.868, 0.0)
    standGroup.add(clampThumbscrew)

    const clampWasher = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.003, 16), brassMat)
    clampWasher.position.set(-0.025, 0.858, 0.0)
    standGroup.add(clampWasher)

    // Clamp hinge pivot pin
    const clampHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.032, 16), chromeMat)
    clampHinge.position.set(-0.025, 0.850, 0.0)
    standGroup.add(clampHinge)

    // Clamp jaw extension prongs reaching from clamp body (x = -0.025) to curved jaws (x = -0.008)
    const jawProngGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.022, 16)
    const rearProng = new THREE.Mesh(jawProngGeom, chromeMat)
    rearProng.rotation.z = Math.PI / 2
    rearProng.position.set(-0.015, 0.850, 0.010)
    standGroup.add(rearProng)

    const frontProng = new THREE.Mesh(jawProngGeom, chromeMat)
    frontProng.rotation.z = Math.PI / 2
    frontProng.position.set(-0.015, 0.850, -0.010)
    standGroup.add(frontProng)

    // Curved clamp jaws wrapping around the burette barrel at [0, 0.850, 0]
    const upperJaw = new THREE.Mesh(new THREE.TorusGeometry(0.0118, 0.0028, 16, 24, Math.PI * 1.15), chromeMat)
    upperJaw.rotation.x = Math.PI / 2
    upperJaw.rotation.z = -Math.PI * 0.58
    upperJaw.position.set(0.0, 0.858, 0.0)
    standGroup.add(upperJaw)

    const lowerJaw = new THREE.Mesh(new THREE.TorusGeometry(0.0118, 0.0028, 16, 24, Math.PI * 1.15), chromeMat)
    lowerJaw.rotation.x = Math.PI / 2
    lowerJaw.rotation.z = -Math.PI * 0.58
    lowerJaw.position.set(0.0, 0.842, 0.0)
    standGroup.add(lowerJaw)

    // Neoprene protective rubber sleeve grips (touching glass at r = 0.0088)
    const rubberSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.0112, 0.0112, 0.034, 32, 1, false), rubberMat)
    rubberSleeve.position.set(0.0, 0.850, 0.0)
    standGroup.add(rubberSleeve)

    // --- Lower Auxiliary Guide Assembly (stabilizing burette tube at y = 0.480) ---
    const lowerBosshead = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.046, 0.042), castIronMat)
    lowerBosshead.position.set(-0.18, 0.480, 0.0)
    standGroup.add(lowerBosshead)

    const lowerBossheadScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.024, 16), brassMat)
    lowerBossheadScrew.rotation.x = Math.PI / 2
    lowerBossheadScrew.position.set(-0.18, 0.480, -0.028)
    standGroup.add(lowerBossheadScrew)

    // Lower horizontal chrome arm (spans from bosshead at x = -0.18 to guide ring outer edge at x = -0.014)
    const lowerArmLength = 0.166
    const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, lowerArmLength, 20), chromeMat)
    lowerArm.rotation.z = Math.PI / 2
    lowerArm.position.set(-0.097, 0.480, 0.0)
    standGroup.add(lowerArm)

    // Lower circular guide ring encircling burette tube
    const lowerRing = new THREE.Mesh(new THREE.TorusGeometry(0.0115, 0.0025, 16, 28), chromeMat)
    lowerRing.rotation.x = Math.PI / 2
    lowerRing.position.set(0.0, 0.480, 0.0)
    standGroup.add(lowerRing)

    standGroup.userData = {
      id: 'burette_stand',
      label: 'Cast-Iron Retort Stand & Dual Clamp',
      description: 'Heavy laboratory stand with vibration-dampened neoprene rubber sleeves supporting Class-A 50mL burette.',
      interactive: false,
    }
    this.scene.add(standGroup)
    this.objects.set('burette_stand', standGroup)

    // 5. 50.00 mL Class-A Borosilicate Burette (Continuous Anatomical Glass Assembly)
    const buretteGroup = new THREE.Group()
    buretteGroup.position.set(-0.15, 0, 0)

    // Graduation scale texture with Schellbach blue contrast stripe
    const scaleTex = createBuretteScaleTexture()
    const buretteGlassMat = pyrexGlassMat.clone()
    buretteGlassMat.map = scaleTex
    buretteGlassMat.transparent = true

    // 5a. Top Funnel Rim Bead
    const topRim = new THREE.Mesh(new THREE.TorusGeometry(0.0098, 0.0018, 16, 32), pyrexGlassMat)
    topRim.rotation.x = Math.PI / 2
    topRim.position.set(0, 1.355, 0)
    topRim.userData = { isGlass: true }
    buretteGroup.add(topRim)

    // 5b. Flared Funnel Mouth (y = 1.337 to y = 1.355)
    const funnelMouth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0112, 0.0088, 0.018, 32, 1, true),
      pyrexGlassMat
    )
    funnelMouth.position.set(0, 1.346, 0)
    funnelMouth.userData = { isGlass: true }
    buretteGroup.add(funnelMouth)

    // 5c. Main Graduated Cylinder (y = 0.355 to y = 1.337, length = 0.982m)
    const buretteTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0088, 0.0088, 0.982, 32, 1, true),
      buretteGlassMat
    )
    buretteTube.position.set(0, 0.846, 0)
    buretteTube.castShadow = true
    buretteTube.receiveShadow = true
    buretteTube.userData = { isGlass: true }
    buretteGroup.add(buretteTube)

    // 5d. Upper Tapered Reduction Neck (y = 0.328 to y = 0.355, bridges tube bottom to stopcock top)
    const neckCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0088, 0.0060, 0.027, 32, 1, true),
      pyrexGlassMat
    )
    neckCone.position.set(0, 0.3415, 0)
    neckCone.userData = { isGlass: true }
    buretteGroup.add(neckCone)

    // 5e. Lower Delivery Stem (y = 0.250 to y = 0.312, bridges stopcock bottom to jet nozzle)
    const deliveryStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0042, 0.0042, 0.062, 24, 1, true),
      pyrexGlassMat
    )
    deliveryStem.position.set(0, 0.281, 0)
    deliveryStem.userData = { isGlass: true }
    buretteGroup.add(deliveryStem)

    // 5f. Delivery Jet Capillary Nozzle (y = 0.205 to y = 0.250, precise tapered dispensing tip)
    const tipCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0042, 0.0016, 0.045, 24, 1, true),
      pyrexGlassMat
    )
    tipCone.position.set(0, 0.2275, 0)
    tipCone.userData = { isGlass: true }
    buretteGroup.add(tipCone)

    // Titrant Material Definition
    const titrantLiquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0f9ff,
      transmission: 0.95,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.333,
      thickness: 0.12,
      attenuationColor: new THREE.Color(0xe0f2fe),
      attenuationDistance: 0.4,
    })

    // 5g. Internal Dynamic Graduated Liquid Column (scales with burette reading)
    const buretteLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0068, 0.0068, 0.85, 24),
      titrantLiquidMat
    )
    buretteLiquid.position.set(0, 0.78, 0)
    buretteLiquid.userData = { isLiquid: true }
    buretteGroup.add(buretteLiquid)
    this.buretteLiquidMesh = buretteLiquid

    // 5h. Primed Titrant Liquid in Lower Stem & Capillary Nozzle (static primed liquid)
    const primedStemLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0028, 0.0028, 0.062, 16),
      titrantLiquidMat
    )
    primedStemLiquid.position.set(0, 0.281, 0)
    primedStemLiquid.userData = { isLiquid: true }
    buretteGroup.add(primedStemLiquid)

    const primedTipLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0028, 0.0009, 0.044, 16),
      titrantLiquidMat
    )
    primedTipLiquid.position.set(0, 0.2275, 0)
    primedTipLiquid.userData = { isLiquid: true }
    buretteGroup.add(primedTipLiquid)

    buretteGroup.userData = {
      id: 'burette',
      label: '50.00 mL Class-A Borosilicate Burette',
      description: 'Graduated in 0.10 mL divisions with rear Schellbach contrast stripe. Filled with standardized 0.1000 M NaOH.',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(buretteGroup)
    this.objects.set('burette', buretteGroup)

    // 6. Precision PTFE Stopcock Assembly (Centered exactly at y = 0.320, flush with neck and stem)
    const stopcockGroup = new THREE.Group()
    stopcockGroup.position.set(-0.15, 0.320, 0)

    // Glass Valve Housing Sleeve (Outer radius 0.008m, spanning y = 0.312 to 0.328, flush with neck and stem)
    const valveBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0080, 0.0076, 0.040, 32),
      pyrexGlassMat
    )
    valveBarrel.rotation.z = Math.PI / 2
    valveBarrel.userData = { isGlass: true }
    stopcockGroup.add(valveBarrel)

    // Internal vertical fluid passage through stopcock housing
    const valveFluidPassage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0030, 0.0030, 0.016, 16),
      titrantLiquidMat
    )
    valveFluidPassage.userData = { isLiquid: true }
    stopcockGroup.add(valveFluidPassage)

    // Rotatable PTFE Plug & Handle Group
    const handlePivot = new THREE.Group()
    handlePivot.position.set(0, 0, 0)

    // PTFE precision ground plug core
    const valvePlug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0065, 0.0058, 0.044, 24),
      redPtfeMat
    )
    valvePlug.rotation.z = Math.PI / 2
    handlePivot.add(valvePlug)

    // Ergonomic red PTFE T-handle
    const valveHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.028, 0.058),
      redPtfeMat
    )
    valveHandle.position.set(0.024, 0, 0)
    valveHandle.castShadow = true
    handlePivot.add(valveHandle)

    // Handle hub ring
    const handleHub = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 20), redPtfeMat)
    handleHub.rotation.z = Math.PI / 2
    handleHub.position.set(0.020, 0, 0)
    handlePivot.add(handleHub)

    // Brass retaining washer and O-ring on opposite end
    const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.004, 16), brassMat)
    washer.rotation.z = Math.PI / 2
    washer.position.set(-0.022, 0, 0)
    handlePivot.add(washer)

    stopcockGroup.add(handlePivot)
    this.stopcockHandleGroup = handlePivot

    stopcockGroup.userData = {
      id: 'stopcock',
      label: 'Precision PTFE Stopcock Valve',
      description: 'Controls titrant flow rate. Closed (horizontal), Dropwise (45°), or Stream (vertical).',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(stopcockGroup)
    this.objects.set('stopcock', stopcockGroup)

    // 7. Dynamic Droplet Mesh (Forms at nozzle orifice y = 0.205 and drops into flask)
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transmission: 0.96,
      transparent: true,
      roughness: 0.02,
      ior: 1.333,
      thickness: 0.08,
    })
    const dropMesh = new THREE.Mesh(new THREE.SphereGeometry(0.0030, 16, 16), dropMat)
    dropMesh.scale.set(0.8, 1.4, 0.8)
    dropMesh.position.set(-0.15, 0.202, 0)
    dropMesh.visible = false
    dropMesh.userData = { isLiquid: true }
    this.scene.add(dropMesh)
    this.titrationDropMesh = dropMesh

    // 8. 250 mL Pyrex Erlenmeyer Conical Flask & Swirl Pivot
    const flaskSwirlPivot = new THREE.Group()
    flaskSwirlPivot.position.set(-0.15, 0, 0)

    const flaskGroup = new THREE.Group()
    flaskGroup.position.set(0, 0.010, 0) // Sits squarely on top of 10mm white tile

    const flaskGeom = createErlenmeyerFlaskGeometry()
    const flaskMesh = new THREE.Mesh(flaskGeom, pyrexGlassMat)
    flaskMesh.castShadow = true
    flaskMesh.receiveShadow = true
    flaskMesh.userData = { isGlass: true }
    flaskGroup.add(flaskMesh)

    // Flask Decal (PYREX 250mL Silk Screen)
    const decalTex = createFlaskDecalTexture()
    const decalMat = new THREE.MeshBasicMaterial({
      map: decalTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
    const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.028), decalMat)
    decalMesh.position.set(0, 0.055, 0.034)
    flaskGroup.add(decalMesh)

    // Flask Internal Dynamic Liquid Mesh
    const flaskLiquidGeom = createFlaskLiquidGeometry(0.38)
    const flaskLiquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fcff,
      transmission: 0.94,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.333,
      thickness: 0.16,
      attenuationColor: new THREE.Color(0xe2e8f0),
      attenuationDistance: 0.45,
    })
    const flaskLiquid = new THREE.Mesh(flaskLiquidGeom, flaskLiquidMat)
    flaskLiquid.userData = { isLiquid: true }
    flaskGroup.add(flaskLiquid)
    this.flaskLiquidMesh = flaskLiquid

    flaskGroup.userData = {
      id: 'flask',
      label: '250 mL Pyrex Erlenmeyer Conical Flask',
      description: 'Contains 25.00 mL aliquot of standardized HCl analyte with 3 drops phenolphthalein indicator.',
      interactive: true,
      isGroup: true,
    }
    flaskSwirlPivot.add(flaskGroup)
    this.flaskSwirlGroup = flaskSwirlPivot
    this.scene.add(flaskSwirlPivot)
    this.objects.set('flask', flaskGroup)

    // 9. 25.00 mL Class-A Volumetric Pipette & Authentic 3-Way Propipette Bulb
    const pipetteGroup = new THREE.Group()
    pipetteGroup.position.set(0.24, 0.01, -0.04)

    // Acrylic pipette rest block
    const rackMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, roughness: 0.1, ior: 1.49 })
    const rackMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.05, 0.22), rackMat)
    rackMesh.position.set(0, 0.025, 0)
    rackMesh.castShadow = true
    pipetteGroup.add(rackMesh)

    // Class A volumetric pipette
    const pipGroup = new THREE.Group()
    pipGroup.rotation.z = Math.PI / 10
    pipGroup.position.set(-0.02, 0.03, 0)

    const pipSuction = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.28, 16), pyrexGlassMat)
    pipSuction.position.set(0, 0.38, 0)
    pipSuction.userData = { isGlass: true }
    pipGroup.add(pipSuction)

    // Calibration Ring Mark (25.00 mL mark at y = 0.380)
    const calibRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.0042, 0.0006, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    )
    calibRing.rotation.x = Math.PI / 2
    calibRing.position.set(0, 0.380, 0)
    pipGroup.add(calibRing)

    // Expanded central bulb
    const pipBulb = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.11, 24), pyrexGlassMat)
    pipBulb.position.set(0, 0.21, 0)
    pipBulb.userData = { isGlass: true }
    pipGroup.add(pipBulb)

    const pipBulbTop = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.035, 24), pyrexGlassMat)
    pipBulbTop.position.set(0, 0.28, 0)
    pipBulbTop.userData = { isGlass: true }
    pipGroup.add(pipBulbTop)

    const pipBulbBottom = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.035, 24), pyrexGlassMat)
    pipBulbBottom.rotation.x = Math.PI
    pipBulbBottom.position.set(0, 0.14, 0)
    pipBulbBottom.userData = { isGlass: true }
    pipGroup.add(pipBulbBottom)

    const pipDelivery = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0015, 0.14, 16), pyrexGlassMat)
    pipDelivery.position.set(0, 0.06, 0)
    pipDelivery.userData = { isGlass: true }
    pipGroup.add(pipDelivery)

    // Pipette internal dynamic liquid column
    const pipLiquidGeom = new THREE.CylinderGeometry(0.0032, 0.0012, 0.32, 16)
    const pipLiquidMesh = new THREE.Mesh(pipLiquidGeom, titrantLiquidMat)
    pipLiquidMesh.position.set(0, 0.22, 0)
    pipLiquidMesh.scale.set(1, 0.001, 1)
    pipLiquidMesh.visible = false
    pipLiquidMesh.userData = { isLiquid: true }
    pipGroup.add(pipLiquidMesh)
    this.pipetteLiquidMesh = pipLiquidMesh

    // --- Authentic University-Grade 3-Way Propipette Rubber Bulb ---
    const propipetteMat = new THREE.MeshStandardMaterial({
      color: 0xc92a2a,
      roughness: 0.55,
      metalness: 0.04,
    })

    // Central pear-shaped rubber reservoir
    const mainBulb = new THREE.Mesh(new THREE.SphereGeometry(0.024, 32, 24), propipetteMat)
    mainBulb.scale.set(1.0, 1.36, 0.95)
    mainBulb.position.set(0, 0.535, 0)
    mainBulb.castShadow = true
    pipGroup.add(mainBulb)

    // Mold parting line seams
    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.001, 8, 32), propipetteMat)
    seam.scale.set(1.0, 1.36, 1.0)
    seam.position.set(0, 0.535, 0)
    pipGroup.add(seam)

    // Top neck collar & Valve 'A' (Air release / aspirate)
    const neckA = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.008, 0.020, 20), propipetteMat)
    neckA.position.set(0, 0.575, 0)
    pipGroup.add(neckA)

    const beadA = new THREE.Mesh(new THREE.SphereGeometry(0.006, 16, 16), propipetteMat)
    beadA.position.set(0, 0.590, 0)
    pipGroup.add(beadA)

    const badgeMatA = new THREE.MeshBasicMaterial({ map: createValveBadgeTexture('A') })
    const badgeA = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 0.014), badgeMatA)
    badgeA.position.set(0, 0.575, 0.009)
    pipGroup.add(badgeA)

    // Bottom neck sleeve & Valve 'S' (Suction)
    const neckS = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.0065, 0.024, 20), propipetteMat)
    neckS.position.set(0, 0.495, 0)
    pipGroup.add(neckS)

    const badgeMatS = new THREE.MeshBasicMaterial({ map: createValveBadgeTexture('S') })
    const badgeS = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 0.014), badgeMatS)
    badgeS.position.set(0, 0.495, 0.009)
    pipGroup.add(badgeS)

    // Side branch arm & Valve 'E' (Expel / empty) with side purge bulb
    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.510, 0),
      new THREE.Vector3(0.016, 0.510, 0),
      new THREE.Vector3(0.026, 0.495, 0),
    ])
    const branchTube = new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 16, 0.004, 12, false), propipetteMat)
    pipGroup.add(branchTube)

    const bulbE = new THREE.Mesh(new THREE.SphereGeometry(0.009, 20, 20), propipetteMat)
    bulbE.scale.set(0.9, 1.25, 0.9)
    bulbE.position.set(0.028, 0.492, 0)
    pipGroup.add(bulbE)

    const badgeMatE = new THREE.MeshBasicMaterial({ map: createValveBadgeTexture('E') })
    const badgeE = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 0.014), badgeMatE)
    badgeE.position.set(0.028, 0.492, 0.010)
    pipGroup.add(badgeE)

    pipetteGroup.add(pipGroup)
    pipetteGroup.userData = {
      id: 'pipette',
      label: '25.00 mL Class-A Volumetric Pipette & 3-Valve Propipette Bulb',
      description: 'Class A volumetric transfer pipette calibrated at 20°C (±0.03 mL) with 3-way rubber aspirator bulb.',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(pipetteGroup)
    this.objects.set('pipette', pipetteGroup)
    this.toolRestTransforms.set('pipette', { position: pipetteGroup.position.clone(), rotation: pipetteGroup.rotation.clone() })

    // 10. Amber Phenolphthalein pH Indicator Dropper Bottle
    const indicatorGroup = new THREE.Group()
    indicatorGroup.position.set(0.09, 0.01, 0.13)

    const amberGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x854d0e,
      transmission: 0.72,
      opacity: 1,
      transparent: true,
      roughness: 0.12,
      ior: 1.54,
      thickness: 0.18,
      clearcoat: 0.85,
    })
    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.088, 32), amberGlassMat)
    bottleBody.position.set(0, 0.044, 0)
    bottleBody.castShadow = true
    bottleBody.userData = { isGlass: true }
    indicatorGroup.add(bottleBody)

    // Chemical Label
    const indicLabelTex = createReagentLabelTexture(
      'PHENOLPHTHALEIN',
      '0.1% Indicator Solution',
      'pH 8.2 (Clear) - 10.0 (Pink)'
    )
    const indicLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.038, 0.048),
      new THREE.MeshBasicMaterial({ map: indicLabelTex, depthWrite: false })
    )
    indicLabelMesh.position.set(0, 0.044, 0.023)
    indicatorGroup.add(indicLabelMesh)

    // Ribbed black cap
    const capMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.020, 24),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 })
    )
    capMesh.position.set(0, 0.096, 0)
    indicatorGroup.add(capMesh)

    // Rubber dropper squeeze bulb
    const dropperBulb = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 16), rubberMat)
    dropperBulb.scale.set(0.9, 1.3, 0.9)
    dropperBulb.position.set(0, 0.116, 0)
    indicatorGroup.add(dropperBulb)
    this.indicatorBulbMesh = dropperBulb

    indicatorGroup.userData = {
      id: 'indicator',
      label: 'Phenolphthalein Indicator Dropper Bottle (0.1%)',
      description: 'Acid-base indicator solution. Colorless below pH 8.2; turns pale pink at true equivalence point.',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(indicatorGroup)
    this.objects.set('indicator', indicatorGroup)
    this.toolRestTransforms.set('indicator', { position: indicatorGroup.position.clone(), rotation: indicatorGroup.rotation.clone() })

    // 11. 500 mL LDPE Wash Bottle (Deionized Water)
    const washGroup = new THREE.Group()
    washGroup.position.set(0.28, 0.01, 0.16)

    const ldpeMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transmission: 0.62,
      roughness: 0.38,
      ior: 1.42,
      thickness: 0.1,
    })
    const washBody = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.16, 32), ldpeMat)
    washBody.position.set(0, 0.08, 0)
    washBody.castShadow = true
    washGroup.add(washBody)
    this.washBottleBody = washBody

    const washCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.016, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    )
    washCap.position.set(0, 0.168, 0)
    washGroup.add(washCap)

    // Swan-neck dispensing tube
    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.176, 0),
      new THREE.Vector3(0.01, 0.22, 0),
      new THREE.Vector3(0.04, 0.23, 0),
      new THREE.Vector3(0.06, 0.19, 0),
    ])
    const tubeMesh = new THREE.Mesh(new THREE.TubeGeometry(tubeCurve, 20, 0.003, 12, false), ldpeMat)
    washGroup.add(tubeMesh)

    // Squeeze spray jet water stream mesh
    const sprayCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.19, 0),
      new THREE.Vector3(0.12, 0.14, 0),
      new THREE.Vector3(0.18, 0.02, 0),
    ])
    const washSprayMesh = new THREE.Mesh(new THREE.TubeGeometry(sprayCurve, 16, 0.002, 8, false), titrantLiquidMat)
    washSprayMesh.visible = false
    washGroup.add(washSprayMesh)
    this.washSprayMesh = washSprayMesh

    washGroup.userData = {
      id: 'wash_bottle',
      label: '500 mL LDPE Deionized Water Wash Bottle',
      description: 'Used for quantitative rinsing of burette tip droplets and flask inner walls into the titrand aliquot.',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(washGroup)
    this.objects.set('wash_bottle', washGroup)
    this.toolRestTransforms.set('wash_bottle', { position: washGroup.position.clone(), rotation: washGroup.rotation.clone() })

    // 12. 250 mL Waste / Priming Beaker
    const wasteGroup = new THREE.Group()
    wasteGroup.position.set(-0.38, 0.01, -0.05)

    const wasteBeaker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.034, 0.095, 32, 1, true),
      pyrexGlassMat
    )
    wasteBeaker.position.set(0, 0.048, 0)
    wasteBeaker.castShadow = true
    wasteBeaker.userData = { isGlass: true }
    wasteGroup.add(wasteBeaker)

    // Glass stirring rod resting inside
    const rodGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 16), pyrexGlassMat)
    rodGlass.rotation.z = Math.PI / 6
    rodGlass.position.set(0.012, 0.065, 0)
    rodGlass.userData = { isGlass: true }
    wasteGroup.add(rodGlass)

    wasteGroup.userData = {
      id: 'waste_beaker',
      label: '250 mL Waste & Priming Beaker',
      description: 'Borosilicate beaker for receiving initial burette air bubble expulsion and nozzle rinse flush.',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(wasteGroup)
    this.objects.set('waste_beaker', wasteGroup)
    this.toolRestTransforms.set('waste_beaker', { position: wasteGroup.position.clone(), rotation: wasteGroup.rotation.clone() })

    // 13. Universal pH Litmus Paper Booklet, Tweezers & Active Strip
    const litmusGroup = new THREE.Group()
    litmusGroup.position.set(0.08, 0.005, -0.06)

    // Cardboard booklet folder with 1-14 color chart
    const bookletCoverMat = new THREE.MeshBasicMaterial({ map: createLitmusChartTexture() })
    const bookletCover = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.006, 0.045), bookletCoverMat)
    bookletCover.position.set(0, 0.003, 0)
    bookletCover.castShadow = true
    litmusGroup.add(bookletCover)

    // Stainless steel tweezers
    const tweezerArmGeom = new THREE.CylinderGeometry(0.0012, 0.0012, 0.045, 12)
    const tweezer1 = new THREE.Mesh(tweezerArmGeom, chromeMat)
    tweezer1.rotation.z = Math.PI / 3
    tweezer1.position.set(0.015, 0.014, 0.004)
    litmusGroup.add(tweezer1)

    const tweezer2 = new THREE.Mesh(tweezerArmGeom, chromeMat)
    tweezer2.rotation.z = Math.PI / 3
    tweezer2.position.set(0.015, 0.014, -0.004)
    litmusGroup.add(tweezer2)

    // Absorbent pH test paper strip held by tweezers
    const stripPaperMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 })
    const paperStrip = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.0006, 0.006), stripPaperMat)
    paperStrip.rotation.z = Math.PI / 3
    paperStrip.position.set(0.024, 0.022, 0)
    litmusGroup.add(paperStrip)

    // Chemically sensitive tip (reacts dynamically to pH)
    const tipReactiveMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.85 })
    const paperTip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.0007, 0.006), tipReactiveMat)
    paperTip.rotation.z = Math.PI / 3
    paperTip.position.set(0.036, 0.032, 0)
    litmusGroup.add(paperTip)
    this.litmusStripTipMesh = paperTip

    litmusGroup.userData = {
      id: 'litmus_paper',
      label: 'Universal pH Indicator Test Strips & Color Chart',
      description: 'Rapid diagnostic test strips. Dipping into solution produces instantaneous color matching pH 1-14 standard scale.',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(litmusGroup)
    this.objects.set('litmus_paper', litmusGroup)
    this.toolRestTransforms.set('litmus_paper', { position: litmusGroup.position.clone(), rotation: litmusGroup.rotation.clone() })
  }

  // ============================================================
  // EVENT LISTENERS & USER INPUT
  // ============================================================
  private setupEventListeners(): void {
    const canvas = this.options.canvas
    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mouseup', this.onMouseUp)
    canvas.addEventListener('click', this.onClick)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
    canvas.addEventListener('touchend', this.onTouchEnd)
    canvas.addEventListener('webglcontextlost', this.onContextLost, false)
    canvas.addEventListener('webglcontextrestored', this.onContextRestored, false)
    window.addEventListener('resize', this.onResize)
  }

  private onContextLost = (e: Event): void => {
    e.preventDefault()
    console.warn('[WebGL] Context lost detected. Pausing animation loop to prevent crash.')
  }

  private onContextRestored = (): void => {
    console.info('[WebGL] Context restored successfully.')
    this.onResize()
  }

  private onMouseDown = (e: MouseEvent): void => {
    this.previousMousePosition = { x: e.clientX, y: e.clientY }
    this.mouseDownPos = { x: e.clientX, y: e.clientY }

    // Check if clicking directly on the stopcock handle to turn it
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const interactables = Array.from(this.objects.values()).filter((m) => m.userData.interactive)
    const hits = this.raycaster.intersectObjects(interactables, true)
    if (hits.length > 0) {
      let obj: THREE.Object3D | null = hits[0].object
      while (obj && !obj.userData.interactive) {
        obj = obj.parent
      }
      if (obj && obj.userData.id === 'stopcock') {
        this.isDraggingStopcock = true
        this.options.canvas.style.cursor = 'ew-resize'
        return
      }
    }

    this.isDragging = true
  }

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.options.canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    if (this.isDraggingStopcock) {
      // Direct physical dragging of stopcock handle (rotates from 0° to 90°)
      const dy = this.previousMousePosition.y - e.clientY
      const dx = e.clientX - this.previousMousePosition.x
      const delta = (Math.abs(dy) > Math.abs(dx) ? dy : dx) * 0.75
      this.setStopcockAngle(this.titrationState.stopcockAngle + delta)
      this.previousMousePosition = { x: e.clientX, y: e.clientY }
      return
    }

    if (this.isDragging) {
      const dx = e.clientX - this.previousMousePosition.x
      const dy = e.clientY - this.previousMousePosition.y
      this.targetSpherical.theta -= dx * 0.008
      this.targetSpherical.phi = Math.max(
        0.15,
        Math.min(Math.PI / 2 - 0.05, this.targetSpherical.phi + dy * 0.008)
      )
      this.previousMousePosition = { x: e.clientX, y: e.clientY }
    }

    this.updateHover()
  }

  private onMouseUp = (): void => {
    this.isDragging = false
    this.isDraggingStopcock = false
  }

  private onTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      this.isDragging = true
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      this.mouseDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  private onTouchMove = (e: TouchEvent): void => {
    if (e.touches.length === 1 && this.isDragging) {
      e.preventDefault()
      const dx = e.touches[0].clientX - this.previousMousePosition.x
      const dy = e.touches[0].clientY - this.previousMousePosition.y
      this.targetSpherical.theta -= dx * 0.008
      this.targetSpherical.phi = Math.max(
        0.15,
        Math.min(Math.PI / 2 - 0.05, this.targetSpherical.phi + dy * 0.008)
      )
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  private onTouchEnd = (): void => {
    this.isDragging = false
    this.isDraggingStopcock = false
  }

  private onClick = (e: MouseEvent): void => {
    // If user dragged more than 7px, this was an orbit rotation rather than a deliberate click
    const distMoved = Math.hypot(e.clientX - this.mouseDownPos.x, e.clientY - this.mouseDownPos.y)
    if (distMoved > 7) return

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const interactables = Array.from(this.objects.values()).filter((m) => m.userData.interactive)
    const hits = this.raycaster.intersectObjects(interactables, true)

    if (hits.length > 0) {
      let obj: THREE.Object3D | null = hits[0].object
      while (obj && !obj.userData.interactive) {
        obj = obj.parent
      }
      if (obj && obj.userData.id) {
        const id = obj.userData.id as string
        const label = (obj.userData.label as string) || id
        this.options.onObjectClick?.(id, label)
        this.pulseObject(id)
        this.playContextAudio(id)
        this.emitSpatialScreenInfo(id)
      }
    }
  }

  private playContextAudio(id: string): void {
    if (id === 'stopcock') {
      simulationAudio.playStopcockTurn()
    } else if (id === 'pipette') {
      simulationAudio.playPipetteSuction()
    } else if (id === 'indicator') {
      simulationAudio.playDrip()
    } else if (id === 'wash_bottle') {
      simulationAudio.playWashSquirt()
    } else if (id === 'flask') {
      simulationAudio.playSwirl()
    } else if (id === 'burette') {
      simulationAudio.playClick()
    } else if (id.includes('heart') || id.includes('compression')) {
      simulationAudio.playHeartbeat()
    } else if (id.includes('extinguisher')) {
      simulationAudio.playHiss()
    } else if (id.includes('weld') || id.includes('torch')) {
      simulationAudio.playWeldSpark()
    } else if (id.includes('alarm')) {
      simulationAudio.playAlarm()
    } else {
      simulationAudio.playClick()
    }
  }

  private onWheel = (e: WheelEvent): void => {
    // If hovering over stopcock, wheel rotates valve angle
    if (this.hoveredObject === 'stopcock') {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 5 : -5
      this.setStopcockAngle(this.titrationState.stopcockAngle + delta)
      return
    }

    this.targetSpherical.radius = Math.max(1.1, Math.min(7.0, this.targetSpherical.radius + e.deltaY * 0.0035))
  }

  private onResize = (): void => {
    const canvas = this.options.canvas
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    // Safeguard against NaN/divide-by-zero during DOM unmount or initial display none
    if (!w || !h || w <= 0 || h <= 0) return

    this.camera.aspect = Math.max(0.1, w / h)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
  }

  public getApparatusMetadata(id: string): { label: string; description: string; category: string; actionHint: string } {
    switch (id) {
      case 'stopcock':
        return {
          label: 'PTFE Precision Metering Stopcock',
          description: 'Smooth rotary barrel valve. Rotate from 0° (fully sealed) to 90° (free stream) for accurate dropwise acid-base titration.',
          category: 'Flow Regulation Valve',
          actionHint: 'Drag vertically or use rotary dial to control flow (0° - 90°)',
        }
      case 'burette':
        return {
          label: 'Class A 50.00 mL Schellbach Burette',
          description: 'Borosilicate precision delivery tube with Schellbach blue line against white backing for parallax-free meniscus readings.',
          category: 'Volumetric Glassware',
          actionHint: 'Read bottom of concave meniscus at eye level (Ex 20°C ±0.05 mL)',
        }
      case 'flask':
        return {
          label: 'Pyrex 250 mL Conical Erlenmeyer Flask',
          description: 'Narrow neck and conical base allow vigorous manual swirling without spilling during indicator-guided neutralization.',
          category: 'Reaction Vessel',
          actionHint: 'Swirl to dissolve and mix transient pink swirls into bulk aliquot',
        }
      case 'wash_bottle':
        return {
          label: 'LDPE Squeeze Wash Bottle (Deionized Water)',
          description: 'Flexible low-density polyethylene bottle with swan-neck delivery tube. Squeeze to jet deionized water and rinse splattered titrant down flask walls.',
          category: 'Laboratory Dispenser',
          actionHint: 'Click "Pick Up" and squeeze to rinse flask neck with DI water',
        }
      case 'indicator':
        return {
          label: 'Phenolphthalein Indicator Dropper Bottle',
          description: 'Standard 0.1% ethanolic pH indicator solution (pKa ≈ 9.4). Clear colorless below pH 8.2; turns persistent baby-pink between pH 8.2-10.0.',
          category: 'Chemical Indicator',
          actionHint: 'Click "Pick Up" and squeeze dropper to add indicator drops',
        }
      case 'reagent_beaker':
        return {
          label: 'Borosilicate 250 mL Reagent Beaker',
          description: 'Low-form Griffin beaker containing standardized 0.1000 M NaOH titrant. Features pour spout for refilling volumetric apparatus.',
          category: 'Reagent Vessel',
          actionHint: 'Click "Pick Up" and adjust tilt angle to pour titrant into burette',
        }
      case 'pipette':
        return {
          label: 'Class A 25.00 mL Volumetric Pipette & 3-Way Propipette Bulb',
          description: 'Precision transfer pipette fitted with safety rubber bulb: "A" (Aspirate/Evacuate bulb), "S" (Suction analyte into barrel), "E" (Empty/Drain into receiving flask).',
          category: 'Quantitative Transfer Tool',
          actionHint: 'Click "Pick Up" then use A/S/E bulb valves to draw and deliver 25.00 mL',
        }
      case 'litmus_paper':
        return {
          label: 'Universal pH Test Strip Booklet & Tweezers',
          description: 'Full-range pH 1-14 chemical diagnostic strips with comparator color chart. Dipping strip produces rapid colorimetric pH confirmation.',
          category: 'Diagnostic pH Sensor',
          actionHint: 'Click "Pick Up" and dip strip into solution to reveal pH color',
        }
      default:
        return {
          label: id.replace(/_/g, ' ').toUpperCase(),
          description: 'Laboratory apparatus component.',
          category: 'Apparatus',
          actionHint: 'Click or drag to inspect',
        }
    }
  }

  private emitSpatialScreenInfo(id: string | null): void {
    if (!id) {
      this.options.onApparatusScreenInfo?.(null)
      return
    }

    const obj = this.objects.get(id)
    if (!obj) {
      this.options.onApparatusScreenInfo?.(null)
      return
    }

    const meta = this.getApparatusMetadata(id)
    const box = new THREE.Box3().setFromObject(obj)
    const center = new THREE.Vector3()
    box.getCenter(center)
    // Anchor slightly above top of bounding box
    const anchor = new THREE.Vector3(center.x, box.max.y + 0.045, center.z)
    anchor.project(this.camera)

    // Verify anchor is in front of camera lens
    if (anchor.z > 1 || anchor.z < -1) {
      this.options.onApparatusScreenInfo?.(null)
      return
    }

    const canvas = this.options.canvas
    const screenX = (anchor.x * 0.5 + 0.5) * canvas.clientWidth
    const screenY = (-anchor.y * 0.5 + 0.5) * canvas.clientHeight

    this.options.onApparatusScreenInfo?.({
      id,
      label: meta.label,
      description: meta.description,
      category: meta.category,
      actionHint: meta.actionHint,
      screenX,
      screenY,
      visible: true,
    })
  }

  private updateHover(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const interactables = Array.from(this.objects.values()).filter((m) => m.userData.interactive)
    const hits = this.raycaster.intersectObjects(interactables, true)

    if (this.hoveredObject && this.hoveredObject !== this.highlightedObject) {
      const prev = this.objects.get(this.hoveredObject)
      if (prev) this.applyEmissive(prev, false, false)
    }

    if (hits.length > 0) {
      let obj: THREE.Object3D | null = hits[0].object
      while (obj && !obj.userData.interactive) {
        obj = obj.parent
      }
      if (obj && obj.userData.id) {
        const id = obj.userData.id as string
        const label = (obj.userData.label as string) || id
        const desc = (obj.userData.description as string) || null
        this.hoveredObject = id
        this.options.canvas.style.cursor = id === 'stopcock' ? 'grab' : 'pointer'
        if (id !== this.highlightedObject) {
          const rootObj = this.objects.get(id)
          if (rootObj) this.applyEmissive(rootObj, true, false)
        }
        this.options.onHoverChange?.(id, label, desc)
        this.emitSpatialScreenInfo(id)
      }
    } else {
      if (this.hoveredObject) {
        this.options.onHoverChange?.(null, null, null)
        this.emitSpatialScreenInfo(null)
      }
      this.hoveredObject = null
      this.options.canvas.style.cursor = 'grab'
    }
  }

  private applyEmissive(obj: THREE.Object3D, isHover: boolean, isHighlight: boolean): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        // Never apply flat emissive tints to transparent glassware or liquids
        if (mesh.userData?.isGlass || mesh.userData?.isLiquid) {
          return
        }
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
        if (mat) {
          if (isHighlight) {
            mat.emissive = new THREE.Color(0x38bdf8)
            mat.emissiveIntensity = 0.45
          } else if (isHover) {
            mat.emissive = new THREE.Color(0x0284c7)
            mat.emissiveIntensity = 0.3
          } else {
            mat.emissive = new THREE.Color(mesh.userData.originalEmissive ?? 0x000000)
            mat.emissiveIntensity = mesh.userData.originalEmissiveIntensity ?? 0
          }
        }
      }
    })
  }

  public highlightObject(objectId: string | undefined): void {
    if (this.highlightedObject) {
      const prev = this.objects.get(this.highlightedObject)
      if (prev) this.applyEmissive(prev, false, false)
    }

    this.highlightedObject = objectId ?? null

    if (objectId) {
      const mesh = this.objects.get(objectId)
      if (mesh) this.applyEmissive(mesh, false, true)
    }
  }

  public moveCameraTo(position: [number, number, number]): void {
    const [x, y, z] = position
    const dist = Math.sqrt(x * x + z * z)
    this.targetSpherical.radius = Math.max(1.3, dist + 0.4)
    this.targetSpherical.theta = Math.atan2(x, z)
    this.targetSpherical.phi = Math.max(0.25, Math.min(1.4, Math.PI / 2 - Math.atan2(y - 0.45, dist)))
  }

  public setViewPreset(preset: 'front' | 'top' | 'side' | 'reset' | 'titration' | 'meniscus' | 'overview'): void {
    if (this.options.moduleId === 'mod_science_001') {
      switch (preset) {
        case 'titration':
          this.targetLookAt.set(-0.15, 0.34, 0)
          this.targetSpherical.theta = 0.08
          this.targetSpherical.phi = 1.25
          this.targetSpherical.radius = 0.95
          return
        case 'meniscus':
          this.targetLookAt.set(-0.15, 0.85, 0)
          this.targetSpherical.theta = 0.0
          this.targetSpherical.phi = 1.48
          this.targetSpherical.radius = 0.52
          return
        case 'overview':
          this.targetLookAt.set(-0.06, 0.44, 0)
          this.targetSpherical.theta = 0.35
          this.targetSpherical.phi = 1.15
          this.targetSpherical.radius = 1.85
          return
        case 'reset':
          this.targetLookAt.set(-0.15, 0.44, 0)
          this.targetSpherical.theta = 0.22
          this.targetSpherical.phi = 1.18
          this.targetSpherical.radius = 1.65
          return
      }
    }

    switch (preset) {
      case 'front':
        this.targetSpherical.theta = 0
        this.targetSpherical.phi = Math.PI / 2 - 0.1
        break
      case 'top':
        this.targetSpherical.theta = 0
        this.targetSpherical.phi = 0.2
        break
      case 'side':
        this.targetSpherical.theta = Math.PI / 2
        this.targetSpherical.phi = Math.PI / 2 - 0.1
        break
      case 'reset':
        this.targetSpherical.theta = 0.45
        this.targetSpherical.phi = 1.1
        this.targetSpherical.radius = this.sceneConfig.defaultCameraDistance ?? 3.2
        break
    }
  }

  public toggleAutoRotate(): boolean {
    this.autoRotate = !this.autoRotate
    return this.autoRotate
  }

  public isAutoRotating(): boolean {
    return this.autoRotate
  }

  private pulseObject(objectId: string): void {
    const obj = this.objects.get(objectId)
    if (!obj) return
    let t = 0
    const original = obj.scale.clone()
    const pulse = () => {
      t += 0.12
      if (t < Math.PI) {
        const s = 1 + Math.sin(t) * 0.08
        obj.scale.copy(original).multiplyScalar(s)
        requestAnimationFrame(pulse)
      } else {
        obj.scale.copy(original)
      }
    }
    requestAnimationFrame(pulse)
  }

  // WebXR AR Session trigger
  public async startARSession(): Promise<boolean> {
    if (!navigator.xr) return false
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar').catch(() => false)
    if (!isSupported) return false
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
        optionalFeatures: ['dom-overlay'],
      })
      await this.renderer.xr.setSession(session)
      this.scene.background = null // Camera passthrough
      return true
    } catch (e) {
      console.warn('Failed to start AR session:', e)
      return false
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)
    const time = performance.now() / 1000
    const delta = this.lastTime ? Math.min(0.1, time - this.lastTime) : 0.016
    this.lastTime = time

    // Auto-rotate in inspection turntable mode
    if (this.autoRotate && !this.isDragging && !this.isDraggingStopcock) {
      this.targetSpherical.theta += 0.005
    }

    // Smooth camera orbit lerp
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * 0.08
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * 0.08
    this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * 0.08
    this.currentLookAt.lerp(this.targetLookAt, 0.05)

    const { theta, phi, radius } = this.spherical
    this.camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta) + this.currentLookAt.x,
      radius * Math.cos(phi) + this.currentLookAt.y,
      radius * Math.sin(phi) * Math.cos(theta) + this.currentLookAt.z
    )
    this.camera.lookAt(this.currentLookAt)

    // Update loaded model animation mixers
    for (const mixer of this.mixers) {
      mixer.update(delta)
    }

    // Subtle liquid shimmer for titration
    if (this.flaskLiquidMesh) {
      const mat = this.flaskLiquidMesh.material as THREE.MeshPhysicalMaterial
      mat.thickness = 0.16 + Math.sin(time * 1.5) * 0.01
    }

    // Update titration simulation
    if (this.options.moduleId === 'mod_science_001') {
      this.updateTitrationSimulation(delta, time)
    }

    // Update persistent 3D spatial screen bubble coordinates
    if (this.hoveredObject) {
      this.emitSpatialScreenInfo(this.hoveredObject)
    }

    // Guard against WebGL context crash or shader failure
    try {
      this.world.update(delta)
      this.renderer.render(this.scene, this.camera)
    } catch (err) {
      console.warn('[RenderLoop] Suppressed render exception:', err)
    }
  }

  private updateTitrationSimulation(delta: number, time: number): void {
    const s = this.titrationState

    // 1. Continuous Stopcock Flow Physics based on stopcockAngle (0° to 90°)
    if (s.stopcockAngle < 8) {
      s.flowRate = 'closed'
      if (this.titrationDropMesh) {
        this.titrationDropMesh.visible = false
        this.titrationDropMesh.scale.set(0.8, 1.4, 0.8)
      }
      this.dropTimer = 0
    } else if (s.stopcockAngle < 38) {
      // Dropwise flow: drip period scales from 2.0s down to 0.45s as angle increases from 8° to 38°
      s.flowRate = 'dropwise'
      const norm = (s.stopcockAngle - 8) / 30
      const cycle = 2.0 - norm * 1.55 // seconds per drop
      this.dropTimer += delta
      const progress = (this.dropTimer % cycle) / cycle
      if (this.titrationDropMesh) {
        this.titrationDropMesh.visible = true
        this.titrationDropMesh.scale.set(0.8, 1.4, 0.8)
        // Drop falls from capillary nozzle tip y = 0.202 down into flask liquid at y = 0.055
        this.titrationDropMesh.position.y = 0.202 - progress * (0.202 - 0.055)
      }
      if (this.dropTimer >= cycle) {
        this.dropTimer -= cycle
        simulationAudio.playDrip()
        s.volumeAdded = Math.min(50.0, +(s.volumeAdded + 0.05).toFixed(3))
        s.buretteReading = Math.min(50.0, +(s.initialReading + s.volumeAdded).toFixed(3))
        s.dropCount++
        this.transientBlush = 1.0
      }
    } else {
      // Continuous stream: flow rate scales from 0.20 mL/s to 1.25 mL/s as angle increases from 38° to 90°
      s.flowRate = 'stream'
      const norm = (s.stopcockAngle - 38) / 52
      const flowRateMlPerSec = 0.20 + norm * 1.05
      const added = flowRateMlPerSec * delta
      s.volumeAdded = Math.min(50.0, +(s.volumeAdded + added).toFixed(3))
      s.buretteReading = Math.min(50.0, +(s.initialReading + s.volumeAdded).toFixed(3))
      this.transientBlush = 1.0
      if (this.titrationDropMesh) {
        this.titrationDropMesh.visible = true
        this.titrationDropMesh.scale.set(0.6 + norm * 0.4, 14, 0.6 + norm * 0.4)
        this.titrationDropMesh.position.y = 0.1285
      }
      this.dropTimer += delta
      if (this.dropTimer >= 0.25) {
        this.dropTimer = 0
        simulationAudio.playDrip()
      }
    }

    // 2. Exact Stoichiometry & Henderson-Hasselbalch calculation
    // Analyte: 25.00 mL of 0.0896 M HCl (moles HCl = 0.00224 mol)
    // Titrant: 0.1000 M NaOH
    // Equivalence point Ve = 0.00224 / 0.1000 * 1000 = 22.40 mL
    const V = s.volumeAdded
    const V_tot_L = (s.analyteVolume + V) / 1000.0
    const molesH_init = (s.analyteVolume / 1000.0) * s.analyteMolarity
    const molesOH_added = (V / 1000.0) * s.titrantMolarity

    let calculatedPH = 1.05
    if (molesOH_added < molesH_init - 0.0000005) {
      const excessH = molesH_init - molesOH_added
      const concH = excessH / V_tot_L
      calculatedPH = -Math.log10(Math.max(1e-7, concH))
    } else if (Math.abs(molesOH_added - molesH_init) <= 0.000001) {
      calculatedPH = 7.00
    } else {
      const excessOH = molesOH_added - molesH_init
      const concOH = excessOH / V_tot_L
      const pOH = -Math.log10(Math.max(1e-7, concOH))
      calculatedPH = 14.0 - pOH
    }
    s.currentPH = Number(Math.max(1.0, Math.min(13.2, calculatedPH)).toFixed(2))

    // 3. Phenolphthalein color state determination
    s.isEndpoint = V >= 22.36 && V <= 22.48
    s.isOvershot = V > 22.55

    // Swirl Decay
    if (s.isSwirling) {
      this.swirlTimer -= delta
      if (this.swirlTimer <= 0) {
        s.isSwirling = false
      }
      this.transientBlush = Math.max(0, this.transientBlush - delta * 3.2)
    } else {
      this.transientBlush = Math.max(0, this.transientBlush - delta * 0.45)
    }

    // Target color and description
    const targetColor = new THREE.Color(0xf8fcff)
    const targetAttenuation = new THREE.Color(0xe2e8f0)

    if (s.isOvershot) {
      s.colorName = 'Overshot (Dark Magenta / Fuchsia)'
      s.colorHex = '#d9048e'
      targetColor.set(0xd9048e)
      targetAttenuation.set(0xbe185d)
    } else if (s.isEndpoint) {
      s.colorName = 'Faint Permanent Baby-Pink (Equivalence Point)'
      s.colorHex = '#ffc0cb'
      targetColor.set(0xffc0cb)
      targetAttenuation.set(0xfbcfe8)
    } else if (V >= 21.0 && this.transientBlush > 0.05) {
      s.colorName = 'Transient Pink Swirls (Mix by Swirling)'
      s.colorHex = '#f472b6'
      targetColor.lerp(new THREE.Color(0xffb6c1), this.transientBlush * 0.7)
      targetAttenuation.lerp(new THREE.Color(0xf472b6), this.transientBlush * 0.7)
    } else {
      s.colorName = 'Clear Colorless (Acidic Aliquot)'
      s.colorHex = '#f8fafc'
      targetColor.set(0xf8fcff)
      targetAttenuation.set(0xe2e8f0)
    }

    // 4. Update 3D Apparatus Meshes
    // Stopcock rotary handle rotation around its central pivot
    if (this.stopcockHandleGroup) {
      const targetRad = (s.stopcockAngle * Math.PI) / 180
      this.stopcockHandleGroup.rotation.x += (targetRad - this.stopcockHandleGroup.rotation.x) * 0.25
    }

    // Burette Liquid Meniscus Level (Scale from y = 1.250 down to y = 0.400)
    const meniscusY = 1.250 - (s.buretteReading / 50.0) * 0.850
    if (this.buretteLiquidMesh) {
      const liquidHeight = Math.max(0.01, meniscusY - 0.355)
      this.buretteLiquidMesh.scale.y = liquidHeight / 0.85
      this.buretteLiquidMesh.position.y = 0.355 + liquidHeight / 2
    }

    // Flask Liquid Mesh Color and Level
    if (this.flaskLiquidMesh) {
      const mat = this.flaskLiquidMesh.material as THREE.MeshPhysicalMaterial
      mat.color.lerp(targetColor, 0.08)
      mat.attenuationColor.lerp(targetAttenuation, 0.08)
      const volRatio = (25.0 + s.volumeAdded) / 25.0
      this.flaskLiquidMesh.scale.set(1, Math.min(1.4, 0.95 + volRatio * 0.15), 1)
    }

    // Flask Swirl Wobble Animation
    if (this.flaskSwirlGroup) {
      if (s.isSwirling) {
        const swirlAngle = time * 18
        this.flaskSwirlGroup.position.x = -0.15 + Math.cos(swirlAngle) * 0.005
        this.flaskSwirlGroup.position.z = 0.0 + Math.sin(swirlAngle) * 0.005
        this.flaskSwirlGroup.rotation.z = Math.sin(swirlAngle) * 0.025
      } else {
        this.flaskSwirlGroup.position.x += (-0.15 - this.flaskSwirlGroup.position.x) * 0.1
        this.flaskSwirlGroup.position.z += (0.0 - this.flaskSwirlGroup.position.z) * 0.1
        this.flaskSwirlGroup.rotation.z += (0.0 - this.flaskSwirlGroup.rotation.z) * 0.1
      }
    }

    // Dynamic Squeezing Physics
    if (s.activeTool === 'wash_bottle') {
      if (this.washBottleBody) {
        const targetScaleX = s.isSqueezing ? 0.84 : 1.0
        this.washBottleBody.scale.x += (targetScaleX - this.washBottleBody.scale.x) * 0.25
        this.washBottleBody.scale.z += (targetScaleX - this.washBottleBody.scale.z) * 0.25
      }
      if (this.washSprayMesh) {
        this.washSprayMesh.visible = s.isSqueezing
      }
    } else if (s.activeTool === 'indicator') {
      if (this.indicatorBulbMesh) {
        const targetBulbY = s.isSqueezing ? 0.72 : 1.0
        const targetBulbXZ = s.isSqueezing ? 1.15 : 1.0
        this.indicatorBulbMesh.scale.y += (targetBulbY - this.indicatorBulbMesh.scale.y) * 0.25
        this.indicatorBulbMesh.scale.x += (targetBulbXZ - this.indicatorBulbMesh.scale.x) * 0.25
        this.indicatorBulbMesh.scale.z += (targetBulbXZ - this.indicatorBulbMesh.scale.z) * 0.25
      }
    }

    // Dynamic Beaker Pour Tilt Physics
    const beakerObj = this.objects.get('reagent_beaker')
    if (beakerObj && s.activeTool === 'reagent_beaker') {
      const targetTilt = -(s.beakerTiltAngle * Math.PI) / 180
      beakerObj.rotation.z += (targetTilt - beakerObj.rotation.z) * 0.2
      // If tilted > 35 degrees, stream pours titrant and refills burette
      if (s.beakerTiltAngle > 35) {
        s.initialReading = Math.max(0.0, +(s.initialReading - delta * 4.0).toFixed(3))
        s.buretteReading = Math.max(0.0, +(s.initialReading + s.volumeAdded).toFixed(3))
      }
    }

    // Meniscus Zoom Camera lerp
    if (this.isMeniscusZoom) {
      this.targetLookAt.set(-0.15, meniscusY, 0)
      this.targetSpherical.theta = 0
      this.targetSpherical.phi = Math.PI / 2
      this.targetSpherical.radius = 0.38
    }

    // 5. Notify React UI callback
    this.options.onTitrationUpdate?.(s)
  }

  public setStopcockAngle(degrees: number): void {
    const clamped = Math.max(0, Math.min(90, Math.round(degrees * 10) / 10))
    const prev = this.titrationState.stopcockAngle
    this.titrationState.stopcockAngle = clamped
    if (Math.abs(clamped - prev) > 1.0) {
      simulationAudio.playStopcockTurn()
    }
  }

  public setTitrationFlow(mode: 'closed' | 'single_drop' | 'dropwise' | 'stream'): void {
    switch (mode) {
      case 'closed':
        this.setStopcockAngle(0)
        break
      case 'single_drop':
        this.setStopcockAngle(18)
        setTimeout(() => this.setStopcockAngle(0), 750)
        break
      case 'dropwise':
        this.setStopcockAngle(22)
        break
      case 'stream':
        this.setStopcockAngle(65)
        break
    }
  }

  public cycleStopcock(): 'closed' | 'dropwise' | 'stream' {
    const curr = this.titrationState.stopcockAngle
    let next: 'closed' | 'dropwise' | 'stream'
    if (curr < 8) {
      this.setStopcockAngle(22)
      next = 'dropwise'
    } else if (curr < 38) {
      this.setStopcockAngle(65)
      next = 'stream'
    } else {
      this.setStopcockAngle(0)
      next = 'closed'
    }
    return next
  }

  public pickUpTool(tool: 'none' | 'wash_bottle' | 'indicator' | 'pipette' | 'reagent_beaker' | 'litmus_strip'): void {
    // If returning previous tool, restore its rest transform
    if (this.activeTool !== 'none' && this.activeTool !== tool) {
      this.putDownTool()
    }

    this.activeTool = tool
    this.titrationState.activeTool = tool
    this.titrationState.isSqueezing = false

    const obj = this.objects.get(tool === 'litmus_strip' ? 'litmus_paper' : tool)
    if (!obj) return

    // Position tool at active work stage above flask or burette
    switch (tool) {
      case 'wash_bottle':
        obj.position.set(-0.10, 0.26, 0.08)
        obj.rotation.set(0.2, -0.4, 0.35)
        break
      case 'indicator':
        obj.position.set(-0.15, 0.30, 0)
        obj.rotation.set(Math.PI, 0, 0)
        break
      case 'reagent_beaker':
        obj.position.set(-0.12, 1.38, 0.10)
        obj.rotation.set(0, 0, 0)
        break
      case 'pipette':
        obj.position.set(-0.15, 0.34, 0)
        obj.rotation.set(0, 0, 0)
        break
      case 'litmus_strip':
        obj.position.set(-0.15, 0.22, 0.05)
        obj.rotation.set(0.1, 0, 0)
        break
    }
    simulationAudio.playClick()
    this.emitSpatialScreenInfo(tool === 'litmus_strip' ? 'litmus_paper' : tool)
  }

  public putDownTool(): void {
    if (this.activeTool === 'none') return
    const key = this.activeTool === 'litmus_strip' ? 'litmus_paper' : this.activeTool
    const rest = this.toolRestTransforms.get(key)
    const obj = this.objects.get(key)
    if (obj && rest) {
      obj.position.copy(rest.position)
      obj.rotation.copy(rest.rotation)
    }
    this.activeTool = 'none'
    this.titrationState.activeTool = 'none'
    this.titrationState.isSqueezing = false
    this.titrationState.beakerTiltAngle = 0
    if (this.washSprayMesh) this.washSprayMesh.visible = false
    simulationAudio.playClick()
  }

  public squeezeTool(isSqueezing: boolean): void {
    this.titrationState.isSqueezing = isSqueezing
    if (isSqueezing) {
      if (this.activeTool === 'wash_bottle') {
        simulationAudio.playWashSquirt()
        this.rinseNeck()
      } else if (this.activeTool === 'indicator') {
        simulationAudio.playDrip()
        this.addIndicator()
      }
    }
  }

  public setBeakerTilt(angleDegrees: number): void {
    const clamped = Math.max(0, Math.min(85, angleDegrees))
    this.titrationState.beakerTiltAngle = clamped
  }

  public suctionPipette(): void {
    if (this.titrationState.pipetteState === 'filled') return
    simulationAudio.playPipetteSuction()
    this.titrationState.pipetteVolume = 25.00
    this.titrationState.pipetteState = 'filled'
    if (this.pipetteLiquidMesh) {
      this.pipetteLiquidMesh.scale.y = 1.0
      this.pipetteLiquidMesh.position.y = 0.22
    }
    this.pulseObject('pipette')
  }

  public dispensePipette(): void {
    if (this.titrationState.pipetteState !== 'filled') return
    simulationAudio.playDrip()
    this.titrationState.pipetteVolume = 0.0
    this.titrationState.pipetteState = 'dispensed'
    if (this.pipetteLiquidMesh) {
      this.pipetteLiquidMesh.scale.y = 0.01
      this.pipetteLiquidMesh.position.y = 0.04
    }
    this.titrationState.analyteVolume = 25.00
    this.pulseObject('pipette')
  }

  public dipLitmusStrip(): void {
    simulationAudio.playDrip()
    const litmusObj = this.objects.get('litmus_paper')
    if (litmusObj) {
      const originalY = litmusObj.position.y
      litmusObj.position.y = 0.06
      setTimeout(() => {
        litmusObj.position.y = originalY
        const hex = getLitmusColor(this.titrationState.currentPH)
        this.titrationState.litmusDipped = true
        this.titrationState.litmusColorHex = hex
        if (this.litmusStripTipMesh) {
          const mat = this.litmusStripTipMesh.material as THREE.MeshStandardMaterial
          mat.color.set(hex)
          mat.emissive.set(hex)
          mat.emissiveIntensity = 0.35
        }
      }, 350)
    }
  }

  public pipetteAliquot(): void {
    this.suctionPipette()
  }

  public addIndicator(): void {
    simulationAudio.playDrip()
    this.pulseObject('indicator')
  }

  public rinseNeck(): void {
    simulationAudio.playWashSquirt()
    this.pulseObject('wash_bottle')
  }

  public swirlFlask(): void {
    this.titrationState.isSwirling = true
    this.swirlTimer = 2.0
    simulationAudio.playSwirl()
  }

  public resetTitration(): void {
    this.titrationState.volumeAdded = 0
    this.titrationState.buretteReading = this.titrationState.initialReading
    this.titrationState.currentPH = 1.05
    this.titrationState.flowRate = 'closed'
    this.titrationState.stopcockAngle = 0
    this.titrationState.isSwirling = false
    this.titrationState.isEndpoint = false
    this.titrationState.isOvershot = false
    this.titrationState.colorName = 'Clear Colorless (Acidic Aliquot)'
    this.titrationState.colorHex = '#f8fafc'
    this.titrationState.dropCount = 0
    this.titrationState.activeTool = 'none'
    this.titrationState.isSqueezing = false
    this.titrationState.beakerTiltAngle = 0
    this.titrationState.litmusDipped = false
    this.titrationState.litmusColorHex = '#ca8a04'
    this.titrationState.pipetteVolume = 0
    this.titrationState.pipetteState = 'empty'
    this.transientBlush = 0
    this.dropTimer = 0
    if (this.titrationDropMesh) this.titrationDropMesh.visible = false
    this.putDownTool()
    simulationAudio.playClick()
  }

  public getTitrationState(): TitrationState {
    return { ...this.titrationState }
  }

  public setMeniscusZoom(enabled: boolean): void {
    this.isMeniscusZoom = enabled
    if (!enabled) {
      this.targetLookAt.set(...(this.sceneConfig.cameraTarget ?? [-0.15, 0.52, 0]))
      this.targetSpherical.radius = this.sceneConfig.defaultCameraDistance ?? 2.15
      this.targetSpherical.phi = 1.1
      this.targetSpherical.theta = 0.45
    }
  }

  public dispose(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId)
    const canvas = this.options.canvas
    canvas.removeEventListener('mousedown', this.onMouseDown)
    canvas.removeEventListener('mousemove', this.onMouseMove)
    canvas.removeEventListener('mouseup', this.onMouseUp)
    canvas.removeEventListener('click', this.onClick)
    canvas.removeEventListener('wheel', this.onWheel)
    canvas.removeEventListener('touchstart', this.onTouchStart)
    canvas.removeEventListener('touchmove', this.onTouchMove)
    canvas.removeEventListener('touchend', this.onTouchEnd)
    canvas.removeEventListener('webglcontextlost', this.onContextLost)
    canvas.removeEventListener('webglcontextrestored', this.onContextRestored)
    window.removeEventListener('resize', this.onResize)

    this.objects.forEach((obj) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.geometry.dispose()
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          } else {
            mesh.material.dispose()
          }
        }
      })
    })

    this.dracoLoader.dispose()
    this.ktx2Loader.dispose()
    this.world.dispose()
    this.renderer.dispose()
  }
}

// ============================================================
// WEBXR CHECK UTILITY
// ============================================================

export async function checkWebXRSupport(): Promise<{
  supported: boolean
  arSupported: boolean
  vrSupported: boolean
  message: string
}> {
  if (!navigator.xr) {
    return {
      supported: false,
      arSupported: false,
      vrSupported: false,
      message: 'WebXR is not supported in this browser. Running in interactive 3D desktop mode.',
    }
  }

  const [ar, vr] = await Promise.all([
    navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
    navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
  ])

  return {
    supported: ar || vr,
    arSupported: ar,
    vrSupported: vr,
    message: ar
      ? 'Augmented Reality (WebXR) is supported on this device.'
      : 'AR not supported. Running in high-fidelity 3D mode.',
  }
}

// ============================================================
// MODULE-LEVEL STEP UTILITIES
// ============================================================

export function getStepProgress(steps: SimulationStep[]): number {
  if (steps.length === 0) return 0
  const done = steps.filter((s) => s.isCompleted).length
  return Math.round((done / steps.length) * 100)
}
