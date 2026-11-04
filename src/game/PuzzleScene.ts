import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GridEntity, PuzzleLevel, ThemeType } from '../types/puzzle';
import {
  createDoorMesh,
  createGemMesh,
  createGoalMesh,
  createGridTexture,
  createKeyMesh,
  createLaserEmitterMesh,
  createLaserTargetMesh,
  createMirrorMesh,
  createPlayerMesh,
  createPressurePlateMesh,
  createPushCubeMesh,
  createWallMesh,
} from './proceduralMeshes';

export class PuzzleScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private pmremGenerator: THREE.PMREMGenerator;

  private isSoftwareGl: boolean = false;
  private animationFrameId: number = 0;
  private timeoutId: number = 0;
  private isDestroyed: boolean = false;

  private level: PuzzleLevel | null = null;
  private floorMeshes: THREE.Mesh[] = [];
  private entityGroups: Map<string, THREE.Group> = new Map();
  private playerGroup: THREE.Group | null = null;
  private laserLinesGroup: THREE.Group = new THREE.Group();

  // Grid Raycasting helper
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouseVec: THREE.Vector2 = new THREE.Vector2();

  constructor(container: HTMLDivElement) {
    this.container = container;

    // Detect Software WebGL (SwiftShader, llvmpipe, softpipe, WARP)
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return true;
      }
    })();

    // Initialize WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Initialize Scene
    this.scene = new THREE.Scene();

    // Studio Environment (RoomEnvironment + PMREMGenerator)
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(6, 10, 12);

    // Controls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.05; // don't go under ground
    this.controls.minDistance = 4;
    this.controls.maxDistance = 30;

    // Lighting Rig
    this.setupLighting();

    this.scene.add(this.laserLinesGroup);

    // Handle Window Resize
    window.addEventListener('resize', this.onResize);

    // Start render loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm Key Light with tight orthographic shadow map
    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    keyLight.position.set(10, 16, 12);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      keyLight.shadow.camera.left = -12;
      keyLight.shadow.camera.right = 12;
      keyLight.shadow.camera.top = 12;
      keyLight.shadow.camera.bottom = -12;
    }
    this.scene.add(keyLight);

    // Cool Hemisphere Fill Light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.8);
    this.scene.add(hemiLight);

    // Atmosphere Fog
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.025);
    this.scene.background = new THREE.Color(0x0f172a);
  }

  public loadLevel(level: PuzzleLevel) {
    this.level = level;

    // Clear old meshes
    this.floorMeshes.forEach((m) => this.scene.remove(m));
    this.floorMeshes = [];

    this.entityGroups.forEach((g) => this.scene.remove(g));
    this.entityGroups.clear();

    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
      this.playerGroup = null;
    }

    // Build Floor Grid
    const texture = createGridTexture(level.theme);
    const halfW = level.width / 2;
    const halfH = level.height / 2;

    for (let z = 0; z < level.height; z++) {
      for (let x = 0; x < level.width; x++) {
        const floorType = level.floors[z]?.[x] || 'stone';
        if (floorType === 'void') continue;

        const geo = new THREE.BoxGeometry(0.98, 0.2, 0.98);

        let color = 0x334155;
        let roughness = 0.4;
        let metalness = 0.2;

        if (floorType === 'ice') {
          color = 0x38bdf8;
          roughness = 0.05;
          metalness = 0.1;
        } else if (floorType === 'lava') {
          color = 0xea580c;
          roughness = 0.8;
        } else if (floorType.startsWith('conveyor')) {
          color = 0x475569;
          roughness = 0.3;
          metalness = 0.7;
        }

        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness,
          map: texture,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x - halfW + 0.5, -0.1, z - halfH + 0.5);
        mesh.receiveShadow = !this.isSoftwareGl;
        mesh.userData = { gridX: x, gridZ: z, floorType };
        this.scene.add(mesh);
        this.floorMeshes.push(mesh);
      }
    }

    // Build Entities
    level.entities.forEach((ent) => {
      this.spawnEntityMesh(ent);
    });

    // Position Camera over center of level
    this.camera.position.set(0, Math.max(level.width, level.height) * 1.1, Math.max(level.width, level.height) * 1.0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  public spawnEntityMesh(ent: GridEntity) {
    if (!this.level) return;

    if (this.entityGroups.has(ent.id)) {
      const old = this.entityGroups.get(ent.id)!;
      this.scene.remove(old);
      this.entityGroups.delete(ent.id);
    }

    const halfW = this.level.width / 2;
    const halfH = this.level.height / 2;

    let group: THREE.Group;

    switch (ent.type) {
      case 'player_start':
        group = createPlayerMesh();
        this.playerGroup = group;
        break;
      case 'laser_emitter':
        group = createLaserEmitterMesh();
        break;
      case 'mirror':
        group = createMirrorMesh(ent.rotation || 0);
        break;
      case 'laser_target':
        group = createLaserTargetMesh(ent.active || false);
        break;
      case 'push_cube':
        group = createPushCubeMesh();
        break;
      case 'door':
        group = createDoorMesh(ent.color || 'red', ent.state === 'open');
        break;
      case 'pressure_plate':
        group = createPressurePlateMesh(ent.active || false);
        break;
      case 'gem':
        group = createGemMesh();
        break;
      case 'key':
        group = createKeyMesh(ent.color || 'red');
        break;
      case 'goal':
        group = createGoalMesh();
        break;
      case 'wall':
        group = createWallMesh(this.level.theme);
        break;
      default:
        group = new THREE.Group();
    }

    group.position.set(ent.x - halfW + 0.5, 0, ent.z - halfH + 0.5);

    if (ent.rotation) {
      group.rotation.y = THREE.MathUtils.degToRad(ent.rotation);
    }

    group.userData = { entityId: ent.id, type: ent.type };
    this.scene.add(group);
    this.entityGroups.set(ent.id, group);
  }

  public updatePlayerPosition(x: number, z: number, rotationDeg: number) {
    if (!this.level || !this.playerGroup) return;
    const halfW = this.level.width / 2;
    const halfH = this.level.height / 2;

    const targetX = x - halfW + 0.5;
    const targetZ = z - halfH + 0.5;

    // Smooth movement damp
    this.playerGroup.position.x = THREE.MathUtils.damp(this.playerGroup.position.x, targetX, 15, 0.016);
    this.playerGroup.position.z = THREE.MathUtils.damp(this.playerGroup.position.z, targetZ, 15, 0.016);
    this.playerGroup.rotation.y = THREE.MathUtils.degToRad(rotationDeg);
  }

  public updateEntityState(id: string, x: number, z: number, active?: boolean, state?: string, rotation?: number) {
    if (!this.level) return;
    const group = this.entityGroups.get(id);
    if (!group) return;

    const halfW = this.level.width / 2;
    const halfH = this.level.height / 2;

    group.position.x = THREE.MathUtils.damp(group.position.x, x - halfW + 0.5, 12, 0.016);
    group.position.z = THREE.MathUtils.damp(group.position.z, z - halfH + 0.5, 12, 0.016);

    if (rotation !== undefined) {
      group.rotation.y = THREE.MathUtils.degToRad(rotation);
    }
  }

  public renderLaserBeams(lasers: Array<{ segments: Array<{ x1: number; z1: number; x2: number; z2: number }>; color: string }>) {
    if (!this.level) return;
    const halfW = this.level.width / 2;
    const halfH = this.level.height / 2;

    // Clear previous laser geometries
    while (this.laserLinesGroup.children.length > 0) {
      const child = this.laserLinesGroup.children.pop();
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    lasers.forEach((laser) => {
      laser.segments.forEach((seg) => {
        const start = new THREE.Vector3(seg.x1 - halfW + 0.5, 0.4, seg.z1 - halfH + 0.5);
        const end = new THREE.Vector3(seg.x2 - halfW + 0.5, 0.4, seg.z2 - halfH + 0.5);

        const distance = start.distanceTo(end);
        if (distance < 0.01) return;

        const cylinderGeo = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const mat = new THREE.MeshBasicMaterial({
          color: laser.color || '#ef4444',
          transparent: true,
          opacity: 0.9,
        });

        const beam = new THREE.Mesh(cylinderGeo, mat);

        // Position at midpoint
        beam.position.copy(start).add(end).multiplyScalar(0.5);

        // Align cylinder along laser direction
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const axis = new THREE.Vector3(0, 1, 0);
        beam.quaternion.setFromUnitVectors(axis, dir);

        this.laserLinesGroup.add(beam);
      });
    });
  }

  public raycastGridTile(mouseX: number, mouseY: number): { gridX: number; gridZ: number } | null {
    if (!this.level) return null;
    this.mouseVec.x = (mouseX / this.container.clientWidth) * 2 - 1;
    this.mouseVec.y = -(mouseY / this.container.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseVec, this.camera);
    const intersects = this.raycaster.intersectObjects(this.floorMeshes);

    if (intersects.length > 0 && intersects[0].object.userData) {
      const { gridX, gridZ } = intersects[0].object.userData;
      return { gridX, gridZ };
    }
    return null;
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();

    const poll = () => {
      if (this.isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.timeoutId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.timeoutId = window.setTimeout(cb, 80);
      }
    };
    this.timeoutId = window.setTimeout(poll, 5);
  }

  private startLoop = () => {
    const tick = () => {
      if (this.isDestroyed) return;

      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animationFrameId = requestAnimationFrame(tick);
      }
    };

    tick();
  };

  private onResize = () => {
    if (this.isDestroyed || !this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.animationFrameId);
    clearTimeout(this.timeoutId);
    this.pmremGenerator.dispose();
    this.renderer.dispose();
  }
}
