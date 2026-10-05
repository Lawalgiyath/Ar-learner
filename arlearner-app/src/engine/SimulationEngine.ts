// ARLearner Simulation Engine
// Built on Three.js with WebXR-readiness and photorealistic physical materials

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Module, SimulationStep } from '../store'

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
// SCENE CONFIGS PER MODULE
// ============================================================

interface SceneConfig {
  backgroundColor: number
  fogColor: number
  fogNear: number
  fogFar: number
  ambientIntensity: number
  objects: ObjectConfig[]
}

interface ObjectConfig {
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
  interactive?: boolean
  wireframe?: boolean
}

const SCENE_CONFIGS: Record<string, SceneConfig> = {
  'mod_science_001': {
    backgroundColor: 0x05070a,
    fogColor: 0x05070a,
    fogNear: 8,
    fogFar: 20,
    ambientIntensity: 0.8,
    objects: [], // Built dynamically with photorealistic generator
  },

  'mod_medical_001': {
    backgroundColor: 0x05070a,
    fogColor: 0x05070a,
    fogNear: 6,
    fogFar: 15,
    ambientIntensity: 0.8,
    objects: [
      {
        id: 'brain_model',
        type: 'model',
        url: '/models/brain.glb',
        position: [0.7, 0, -0.5],
        scale: [1.2, 1.2, 1.2],
        color: 0xffffff,
        interactive: false,
        label: 'Human Brain Stem (Reference)',
      },
      {
        id: 'floor', type: 'plane',
        position: [0, -0.5, 0],
        rotation: [-Math.PI / 2, 0, 0],
        scale: [8, 8, 1],
        color: 0x0f1117, roughness: 0.9,
      },
      {
        id: 'patient_body', type: 'box',
        position: [0, -0.2, 0],
        scale: [0.35, 0.12, 0.9],
        color: 0x2a1f1a, roughness: 0.8,
        label: 'Patient', interactive: true,
      },
      {
        id: 'patient_chest', type: 'box',
        position: [0, -0.08, 0.1],
        scale: [0.3, 0.08, 0.3],
        color: 0x3a2a2a, emissive: 0x220000, emissiveIntensity: 0.1,
        label: 'Chest - Compression Point', interactive: true,
      },
      {
        id: 'patient_head', type: 'sphere',
        position: [0, -0.08, -0.55],
        scale: [0.14, 0.14, 0.14],
        color: 0x2a1f1a, roughness: 0.8,
        label: 'Airway', interactive: true,
      },
      {
        id: 'aed', type: 'box',
        position: [0.7, -0.3, -0.3],
        scale: [0.2, 0.1, 0.15],
        color: 0xffcc00, emissive: 0x442200, emissiveIntensity: 0.3,
        label: 'AED Device', interactive: true,
      },
      {
        id: 'phone', type: 'box',
        position: [-0.7, -0.3, 0.3],
        scale: [0.05, 0.01, 0.1],
        color: 0x111111, emissive: 0x002244, emissiveIntensity: 0.5,
        label: 'Emergency Phone (112)', interactive: true,
      },
    ],
  },

  default: {
    backgroundColor: 0x080810,
    fogColor: 0x080810,
    fogNear: 8,
    fogFar: 18,
    ambientIntensity: 0.5,
    objects: [
      {
        id: 'platform', type: 'box',
        position: [0, -0.3, 0],
        scale: [2, 0.05, 2],
        color: 0x1a1a2e, metalness: 0.2, roughness: 0.8,
      },
      {
        id: 'real_asset_example',
        type: 'model',
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF/WaterBottle.gltf',
        position: [0, 0, 0],
        scale: [5, 5, 5],
        color: 0xffffff,
        interactive: true,
        label: 'Real Asset (GLTF)',
      },
    ],
  },
}

// ============================================================
// PHOTOREALISTIC PROCEDURAL GEOMETRY & MATERIALS HELPERS
// ============================================================

function createBuretteScaleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 2048
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(0, 30, 60, 0.9)'
    ctx.fillStyle = 'rgba(0, 30, 60, 0.95)'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'left'

    // Central scale line
    ctx.beginPath()
    ctx.lineWidth = 4
    ctx.moveTo(256, 100)
    ctx.lineTo(256, 1948)
    ctx.stroke()

    // Tick marks and numbers
    for (let i = 0; i <= 50; i++) {
      const y = 100 + (i / 50) * 1848
      const isHeader = i % 10 === 0
      const isMajor = i % 5 === 0

      ctx.beginPath()
      ctx.lineWidth = isHeader ? 6 : isMajor ? 4 : 2
      const len = isHeader ? 90 : isMajor ? 60 : 35
      ctx.moveTo(256 - len / 2, y)
      ctx.lineTo(256 + len / 2, y)
      ctx.stroke()

      if (isHeader) {
        ctx.fillText(`${i} mL`, 310, y + 12)
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture
}

function createErlenmeyerFlaskGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = []
  // Outer profile from bottom center out
  points.push(new THREE.Vector2(0, 0))
  points.push(new THREE.Vector2(0.20, 0))
  points.push(new THREE.Vector2(0.22, 0.015)) // Rounded outer base corner
  points.push(new THREE.Vector2(0.065, 0.32)) // Conical body slope
  points.push(new THREE.Vector2(0.055, 0.42)) // Cylindrical neck
  points.push(new THREE.Vector2(0.068, 0.44)) // Flared lip bottom
  points.push(new THREE.Vector2(0.068, 0.455)) // Flared lip outer edge
  points.push(new THREE.Vector2(0.052, 0.455)) // Lip top rim
  // Inner profile down for realistic hollow glass thickness
  points.push(new THREE.Vector2(0.048, 0.42))
  points.push(new THREE.Vector2(0.057, 0.32))
  points.push(new THREE.Vector2(0.208, 0.025))
  points.push(new THREE.Vector2(0, 0.025))

  return new THREE.LatheGeometry(points, 64)
}

function createFlaskLiquidGeometry(level: number = 0.5): THREE.BufferGeometry {
  const points: THREE.Vector2[] = []
  const baseR = 0.202
  const topR = baseR - (baseR - 0.055) * level
  const h = 0.026 + 0.29 * level

  points.push(new THREE.Vector2(0, 0.026))
  points.push(new THREE.Vector2(baseR, 0.026))
  points.push(new THREE.Vector2(topR, h))

  // Meniscus curve on surface
  points.push(new THREE.Vector2(topR * 0.7, h - 0.005))
  points.push(new THREE.Vector2(0, h - 0.003))

  return new THREE.LatheGeometry(points, 48)
}

// ============================================================
// RENDERER CLASS
// ============================================================

export interface SimulationRendererOptions {
  canvas: HTMLCanvasElement
  moduleId: string
  onObjectClick?: (objectId: string) => void
  onLoad?: () => void
}

export class SimulationRenderer {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private clock: THREE.Clock
  private animationId: number | null = null
  private world: SimulationWorld
  private objects: Map<string, THREE.Object3D> = new Map()
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private hoveredObject: string | null = null
  private highlightedObject: string | null = null
  private options: SimulationRendererOptions
  private sceneConfig: SceneConfig

  // Dynamic liquids for simulation state
  private flaskLiquidMesh: THREE.Mesh | null = null
  private buretteLiquidMesh: THREE.Mesh | null = null

  // Camera controls state
  private isDragging = false
  private previousMousePosition = { x: 0, y: 0 }
  private spherical = { theta: 0.5, phi: 1.1, radius: 3.2 }
  private targetSpherical = { theta: 0.5, phi: 1.1, radius: 3.2 }

  private lastTime: number = 0

  constructor(options: SimulationRendererOptions) {
    this.options = options
    this.sceneConfig = SCENE_CONFIGS[options.moduleId] ?? SCENE_CONFIGS.default
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.world = new SimulationWorld()
    this.clock = new THREE.Clock()

    // WebGL Renderer setup with ACES filmi tone mapping & realistic shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(options.canvas.clientWidth, options.canvas.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.25

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.sceneConfig.backgroundColor)
    this.scene.fog = new THREE.Fog(
      this.sceneConfig.fogColor,
      this.sceneConfig.fogNear,
      this.sceneConfig.fogFar
    )

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      options.canvas.clientWidth / options.canvas.clientHeight,
      0.01,
      100
    )
    this.camera.position.set(0, 1.3, 3.2)
    this.camera.lookAt(0, 0.45, 0)

    this.setupEnvironment()
    this.buildScene()
    this.setupLights()
    this.setupEventListeners()
    this.world.start()
    this.animate()

    options.onLoad?.()
  }

  private setupEnvironment(): void {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    pmremGenerator.compileEquirectangularShader()

    // Studio environment scene for realistic glass reflections
    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color(0x0a0e17)

    // Key softbox overhead
    const softbox1 = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    softbox1.position.set(0, 6, 0)
    softbox1.rotation.x = Math.PI / 2
    envScene.add(softbox1)

    // Cool fill softbox left
    const softbox2 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: 0x90caf9 })
    )
    softbox2.position.set(-6, 3, 2)
    softbox2.rotation.y = Math.PI / 2
    envScene.add(softbox2)

    // Warm rim light right
    const softbox3 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe0b2 })
    )
    softbox3.position.set(6, 3, -2)
    softbox3.rotation.y = -Math.PI / 2
    envScene.add(softbox3)

    const renderTarget = pmremGenerator.fromScene(envScene)
    this.scene.environment = renderTarget.texture
    pmremGenerator.dispose()
  }

  private buildScene(): void {
    if (this.options.moduleId === 'mod_science_001') {
      this.buildPhotorealisticTitrationScene()
      return
    }

    const { objects } = this.sceneConfig
    const gltfLoader = new GLTFLoader()

    for (const obj of objects) {
      if (obj.type === 'model' && obj.url) {
        gltfLoader.load(
          obj.url,
          (gltf) => {
            const model = gltf.scene
            model.position.set(...obj.position)
            if (obj.rotation) model.rotation.set(...obj.rotation)
            if (obj.scale) model.scale.set(...obj.scale)

            model.userData = {
              id: obj.id,
              label: obj.label ?? '',
              interactive: obj.interactive ?? false,
              isGroup: true,
            }
            model.name = obj.id

            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                const mesh = child as THREE.Mesh
                if (mesh.material) {
                  const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
                  mesh.userData = {
                    originalEmissive: mat.emissive ? mat.emissive.getHex() : 0x000000,
                    originalEmissiveIntensity: mat.emissiveIntensity ?? 0,
                  }
                }
              }
            })

            this.scene.add(model)
            this.objects.set(obj.id, model)
          },
          undefined,
          (error) => console.error(`Error loading model ${obj.url}:`, error)
        )
        continue
      }

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
          geometry = new THREE.TorusGeometry(1, 0.3, 16, 64)
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
        metalness: obj.metalness ?? 0,
        roughness: obj.roughness ?? 0.7,
        transparent: obj.color === 0xaaddff || obj.color === 0x88ccff,
        opacity: obj.color === 0xaaddff || obj.color === 0x88ccff ? 0.65 : 1,
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
        label: obj.label ?? '',
        interactive: obj.interactive ?? false,
        originalColor: obj.color,
        originalEmissive: obj.emissive ?? 0x000000,
        originalEmissiveIntensity: obj.emissiveIntensity ?? 0,
      }
      mesh.name = obj.id

      this.scene.add(mesh)
      this.objects.set(obj.id, mesh)
    }

    // Grid helper
    const grid = new THREE.GridHelper(4, 20, 0x1a1a2e, 0x1a1a2e)
    grid.position.y = -0.26
    this.scene.add(grid)
  }

  // ============================================================
  // PHOTOREALISTIC ACID-BASE TITRATION SCENE GENERATOR
  // ============================================================
  private buildPhotorealisticTitrationScene(): void {
    // 1. LAB WORKBENCH & OBSERVATION PAD
    const benchGroup = new THREE.Group()

    // Polished dark slate granite table top
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.18,
      metalness: 0.15,
    })
    const benchMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.8), tableMat)
    benchMesh.position.set(0, -0.06, 0)
    benchMesh.receiveShadow = true
    benchGroup.add(benchMesh)

    // White ceramic observation tile under flask
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7fa,
      roughness: 0.08,
      metalness: 0.05,
    })
    const ceramicTile = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.5), ceramicMat)
    ceramicTile.position.set(-0.4, 0.006, 0)
    ceramicTile.receiveShadow = true
    benchGroup.add(ceramicTile)

    benchGroup.userData = { id: 'bench', label: 'Lab Workbench', interactive: false }
    this.scene.add(benchGroup)
    this.objects.set('bench', benchGroup)

    // 2. MATERIALS FOR APPARATUS
    const pyrexGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.52, // Glass refraction index
      thickness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: new THREE.Color(0xddeeff),
      attenuationDistance: 0.6,
    })

    const castIronMat = new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.45,
      metalness: 0.8,
    })

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.08,
      metalness: 0.96,
    })

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.88,
    })

    const redPtfeMat = new THREE.MeshStandardMaterial({
      color: 0xcc2222,
      roughness: 0.3,
      metalness: 0.1,
    })

    // 3. RETORT STAND & DOUBLE BURETTE CLAMP
    const standGroup = new THREE.Group()
    standGroup.position.set(-0.4, 0, 0.22)

    // Heavy cast-iron base
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.035, 0.55), castIronMat)
    baseMesh.position.set(0, 0.0175, 0)
    baseMesh.castShadow = true
    baseMesh.receiveShadow = true
    standGroup.add(baseMesh)

    // Rubber cushion feet under base
    for (const [fx, fz] of [[-0.15, -0.24], [0.15, -0.24], [-0.15, 0.24], [0.15, 0.24]]) {
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.01, 16),
        new THREE.MeshBasicMaterial({ color: 0x111111 })
      )
      foot.position.set(fx, -0.005, fz)
      standGroup.add(foot)
    }

    // Vertical polished rod
    const rodMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 1.4, 32),
      chromeMat
    )
    rodMesh.position.set(0, 0.72, 0.18)
    rodMesh.castShadow = true
    standGroup.add(rodMesh)

    // Bosshead clamp holding burette
    const bosshead = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.06), castIronMat)
    bosshead.position.set(0, 0.85, 0.18)
    bosshead.castShadow = true
    standGroup.add(bosshead)

    const clampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.2, 16),
      chromeMat
    )
    clampArm.rotation.x = Math.PI / 2
    clampArm.position.set(0, 0.85, 0.08)
    standGroup.add(clampArm)

    // Clamp jaws holding glass tube
    const clampJaws = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.006, 16, 32, Math.PI * 1.4),
      chromeMat
    )
    clampJaws.rotation.x = Math.PI / 2
    clampJaws.position.set(0, 0.85, -0.22)
    standGroup.add(clampJaws)

    standGroup.userData = { id: 'burette_stand', label: 'Retort Stand', interactive: false }
    this.scene.add(standGroup)
    this.objects.set('burette_stand', standGroup)

    // 4. PHOTOREALISTIC BURETTE TUBE & SCALE
    const buretteGroup = new THREE.Group()
    buretteGroup.position.set(-0.4, 0.85, 0)

    // Outer glass tube
    const scaleTex = createBuretteScaleTexture()
    const buretteGlassMat = pyrexGlassMat.clone()
    buretteGlassMat.map = scaleTex

    const buretteTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.1, 32, 1, true),
      buretteGlassMat
    )
    buretteTube.castShadow = true
    buretteTube.receiveShadow = true
    buretteGroup.add(buretteTube)

    // Top funnel rim
    const topRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.02, 0.003, 16, 32),
      pyrexGlassMat
    )
    topRim.rotation.x = Math.PI / 2
    topRim.position.y = 0.55
    buretteGroup.add(topRim)

    // Bottom tip cone narrowing to stopcock
    const tipCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.018, 0.08, 32, 1, true),
      pyrexGlassMat
    )
    tipCone.rotation.x = Math.PI
    tipCone.position.y = -0.59
    buretteGroup.add(tipCone)

    buretteGroup.userData = {
      id: 'burette',
      label: 'Burette (0.1M NaOH)',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(buretteGroup)
    this.objects.set('burette', buretteGroup)

    // 5. NAOH LIQUID COLUMN IN BURETTE
    const naohGroup = new THREE.Group()
    naohGroup.position.set(-0.4, 0.85, 0)

    const naohMat = new THREE.MeshPhysicalMaterial({
      color: 0xeeffff,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.333,
      thickness: 0.03,
      attenuationColor: new THREE.Color(0xb2ebf2),
      attenuationDistance: 0.4,
    })

    const naohColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.95, 32),
      naohMat
    )
    naohColumn.position.y = 0.02
    naohGroup.add(naohColumn)

    // Meniscus surface top
    const meniscus = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      naohMat
    )
    meniscus.rotation.x = Math.PI
    meniscus.position.y = 0.495
    naohGroup.add(meniscus)

    naohGroup.userData = { id: 'naoh_liquid', label: 'NaOH Solution', interactive: true }
    this.scene.add(naohGroup)
    this.objects.set('naoh_liquid', naohGroup)
    this.buretteLiquidMesh = naohColumn

    // 6. STOPCOCK VALVE AT BASE
    const stopcockGroup = new THREE.Group()
    stopcockGroup.position.set(-0.4, 0.22, 0)

    // Glass valve housing barrel
    const valveBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.014, 0.05, 32),
      pyrexGlassMat
    )
    valveBarrel.rotation.z = Math.PI / 2
    stopcockGroup.add(valveBarrel)

    // Red PTFE rotating knob handle
    const valveHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.032, 0.06),
      redPtfeMat
    )
    valveHandle.position.set(0.022, 0, 0)
    valveHandle.castShadow = true
    stopcockGroup.add(valveHandle)

    // Brass retaining washer
    const washer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.005, 16),
      brassMat
    )
    washer.rotation.z = Math.PI / 2
    washer.position.set(-0.02, 0, 0)
    stopcockGroup.add(washer)

    // Fine nozzle glass tip extending down
    const fineNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.002, 0.08, 16),
      pyrexGlassMat
    )
    fineNozzle.position.y = -0.065
    stopcockGroup.add(fineNozzle)

    stopcockGroup.userData = { id: 'stopcock', label: 'Precision Stopcock Valve', interactive: true }
    this.scene.add(stopcockGroup)
    this.objects.set('stopcock', stopcockGroup)

    // 7. ERLENMEYER FLASK & TITRANT SOLUTION
    const flaskGroup = new THREE.Group()
    flaskGroup.position.set(-0.4, 0.01, 0)

    const flaskGeom = createErlenmeyerFlaskGeometry()
    const flaskMesh = new THREE.Mesh(flaskGeom, pyrexGlassMat)
    flaskMesh.castShadow = true
    flaskMesh.receiveShadow = true
    flaskGroup.add(flaskMesh)

    // Flask graduation lines overlay
    const gradRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.002, 32),
      new THREE.MeshBasicMaterial({ color: 0x003366, transparent: true, opacity: 0.6 })
    )
    gradRing.position.y = 0.2
    flaskGroup.add(gradRing)

    // Hydrochloric acid liquid inside flask
    const flaskLiquidGeom = createFlaskLiquidGeometry(0.45)
    const flaskLiquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0faff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.333,
      thickness: 0.15,
      attenuationColor: new THREE.Color(0xe0f7fa),
      attenuationDistance: 0.3,
    })
    const flaskLiquid = new THREE.Mesh(flaskLiquidGeom, flaskLiquidMat)
    flaskGroup.add(flaskLiquid)
    this.flaskLiquidMesh = flaskLiquid

    flaskGroup.userData = {
      id: 'flask',
      label: '250mL Erlenmeyer Flask (HCl Solution)',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(flaskGroup)
    this.objects.set('flask', flaskGroup)

    // 8. VOLUMETRIC GLASS PIPETTE & REST BLOCK
    const pipetteGroup = new THREE.Group()
    pipetteGroup.position.set(0.45, 0.05, 0.15)
    pipetteGroup.rotation.z = Math.PI / 12

    // Wooden resting block
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.6,
    })
    const restBlock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.25), woodMat)
    restBlock.position.set(0, 0.01, 0)
    restBlock.castShadow = true
    pipetteGroup.add(restBlock)

    // Glass pipette stem
    const pipetteStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.6, 24),
      pyrexGlassMat
    )
    pipetteStem.position.set(0, 0.25, 0)
    pipetteGroup.add(pipetteStem)

    // Central volumetric expansion bulb
    const pipetteBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 32, 16),
      pyrexGlassMat
    )
    pipetteBulb.scale.set(1, 2.2, 1)
    pipetteBulb.position.set(0, 0.25, 0)
    pipetteGroup.add(pipetteBulb)

    // Blue rubber filler bulb on top
    const rubberBulbMat = new THREE.MeshStandardMaterial({
      color: 0x1565c0,
      roughness: 0.4,
      metalness: 0.1,
    })
    const fillerBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 32, 16),
      rubberBulbMat
    )
    fillerBulb.position.set(0, 0.56, 0)
    fillerBulb.castShadow = true
    pipetteGroup.add(fillerBulb)

    pipetteGroup.userData = {
      id: 'pipette',
      label: '25 mL Volumetric Pipette',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(pipetteGroup)
    this.objects.set('pipette', pipetteGroup)

    // 9. AMBER GLASS PHENOLPHTHALEIN DROPPER BOTTLE
    const indicatorGroup = new THREE.Group()
    indicatorGroup.position.set(0.55, 0.1, -0.2)

    const amberGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7a3803,
      transmission: 0.7,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.54,
      thickness: 0.2,
      clearcoat: 0.8,
      attenuationColor: new THREE.Color(0x3e1800),
      attenuationDistance: 0.2,
    })

    // Bottle body
    const bottleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.14, 32),
      amberGlassMat
    )
    bottleBody.castShadow = true
    indicatorGroup.add(bottleBody)

    // Shoulder & neck
    const bottleNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.035, 0.04, 32),
      amberGlassMat
    )
    bottleNeck.position.y = 0.09
    indicatorGroup.add(bottleNeck)

    // Black rubber teat cap
    const teatCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 })
    )
    teatCap.scale.set(1, 1.4, 1)
    teatCap.position.y = 0.13
    indicatorGroup.add(teatCap)

    // Dropper pipette tube extending into bottle
    const dropperTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.003, 0.18, 16),
      pyrexGlassMat
    )
    dropperTube.position.y = 0.04
    indicatorGroup.add(dropperTube)

    indicatorGroup.userData = {
      id: 'indicator',
      label: 'Phenolphthalein Indicator Bottle',
      interactive: true,
      isGroup: true,
    }
    this.scene.add(indicatorGroup)
    this.objects.set('indicator', indicatorGroup)
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, this.sceneConfig.ambientIntensity)
    this.scene.add(ambient)

    // Key directional light with high-res soft shadow mapping
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(2.5, 4.5, 2.5)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 15
    key.shadow.bias = -0.0001
    this.scene.add(key)

    // Soft cool fill light from opposing angle
    const fill = new THREE.DirectionalLight(0x82b1ff, 0.45)
    fill.position.set(-2.5, 2.0, 1.5)
    this.scene.add(fill)

    // Rim highlight light from back
    const rim = new THREE.DirectionalLight(0xe0e7ff, 0.6)
    rim.position.set(0, 3.5, -3)
    this.scene.add(rim)

    // Neon lime accent glow spot for ARLearner theme integration
    const accentSpot = new THREE.PointLight(0xccff00, 0.4, 6)
    accentSpot.position.set(-0.4, 0.5, 0.8)
    this.scene.add(accentSpot)
  }

  private setupEventListeners(): void {
    const canvas = this.options.canvas
    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mouseup', this.onMouseUp)
    canvas.addEventListener('click', this.onClick)
    canvas.addEventListener('wheel', this.onWheel, { passive: true })
    window.addEventListener('resize', this.onResize)
  }

  private onMouseDown = (e: MouseEvent): void => {
    this.isDragging = true
    this.previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.options.canvas.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    if (this.isDragging) {
      const dx = e.clientX - this.previousMousePosition.x
      const dy = e.clientY - this.previousMousePosition.y
      this.targetSpherical.theta -= dx * 0.008
      this.targetSpherical.phi = Math.max(
        0.2,
        Math.min(Math.PI / 2 - 0.05, this.targetSpherical.phi + dy * 0.008)
      )
      this.previousMousePosition = { x: e.clientX, y: e.clientY }
    }

    this.updateHover()
  }

  private onMouseUp = (): void => {
    this.isDragging = false
  }

  private onClick = (): void => {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const interactables = Array.from(this.objects.values()).filter((m) => m.userData.interactive)
    const hits = this.raycaster.intersectObjects(interactables, true)

    if (hits.length > 0) {
      let obj: THREE.Object3D | null = hits[0].object
      while (obj && !obj.userData.interactive) {
        obj = obj.parent
      }
      if (obj && obj.userData.id) {
        this.options.onObjectClick?.(obj.userData.id)
        this.pulseObject(obj.userData.id)
      }
    }
  }

  private onWheel = (e: WheelEvent): void => {
    this.targetSpherical.radius = Math.max(1.2, Math.min(6.5, this.targetSpherical.radius + e.deltaY * 0.004))
  }

  private onResize = (): void => {
    const canvas = this.options.canvas
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
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
        this.hoveredObject = obj.userData.id
        this.options.canvas.style.cursor = 'pointer'
        if (obj.userData.id !== this.highlightedObject) {
          const rootObj = this.objects.get(obj.userData.id)
          if (rootObj) this.applyEmissive(rootObj, true, false)
        }
      }
    } else {
      this.hoveredObject = null
      this.options.canvas.style.cursor = 'grab'
    }
  }

  private applyEmissive(obj: THREE.Object3D, isHover: boolean, isHighlight: boolean) {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
        if (mat) {
          if (isHighlight) {
            mat.emissive = new THREE.Color(0xccff00)
            mat.emissiveIntensity = 0.5
          } else if (isHover) {
            mat.emissive = new THREE.Color(0x00e5ff)
            mat.emissiveIntensity = 0.35
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
    this.targetSpherical.radius = Math.max(1.5, dist + 0.5)
    this.targetSpherical.theta = Math.atan2(x, z)
    this.targetSpherical.phi = Math.max(0.3, Math.min(1.4, Math.PI / 2 - Math.atan2(y - 0.45, dist)))
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

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)
    const time = performance.now() / 1000
    const delta = this.lastTime ? time - this.lastTime : 0
    this.lastTime = time

    // Smooth camera orbit lerp
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * 0.08
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * 0.08
    this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * 0.08

    const { theta, phi, radius } = this.spherical
    this.camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi) + 0.45,
      radius * Math.sin(phi) * Math.cos(theta)
    )
    this.camera.lookAt(0, 0.45, 0)

    // Subtle idle animation & liquid shimmer
    if (this.flaskLiquidMesh) {
      const mat = this.flaskLiquidMesh.material as THREE.MeshPhysicalMaterial
      mat.thickness = 0.15 + Math.sin(time * 1.5) * 0.01
    }

    this.world.update(delta)
    this.renderer.render(this.scene, this.camera)
  }

  public dispose(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId)
    const canvas = this.options.canvas
    canvas.removeEventListener('mousedown', this.onMouseDown)
    canvas.removeEventListener('mousemove', this.onMouseMove)
    canvas.removeEventListener('mouseup', this.onMouseUp)
    canvas.removeEventListener('click', this.onClick)
    canvas.removeEventListener('wheel', this.onWheel)
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
      message: 'WebXR is not supported in this browser. Use Chrome on Android or a Meta Quest browser.',
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
      ? 'Augmented Reality is supported on this device.'
      : 'AR not supported. Running in 3D desktop mode.',
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
