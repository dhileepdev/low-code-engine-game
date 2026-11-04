import * as THREE from 'three';
import { KeyColor, ObjectType, ThemeType } from '../types/puzzle';

// Pre-allocate scratch material texture generators
export function createGridTexture(theme: ThemeType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background base
  if (theme === 'cyber') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 248, 248);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 232, 232);
  } else if (theme === 'ancient') {
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(16, 16, 224, 224);
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 216, 216);
  } else if (theme === 'scifi') {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 240);
  } else if (theme === 'lava') {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 244, 244);
  } else {
    // crystal
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 240);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 1. Hero Player Automaton (Composite 8-part THREE.Group)
export function createPlayerMesh(): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Heavy Metallic Base Platform / Treads (Primary Silhouette)
  const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.15, 16);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.25,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.075;
  base.castShadow = true;
  group.add(base);

  // Part 2: Spherical Automaton Torso Core
  const torsoGeo = new THREE.SphereGeometry(0.3, 24, 24);
  const torsoMat = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    metalness: 0.6,
    roughness: 0.2,
  });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.35;
  torso.castShadow = true;
  group.add(torso);

  // Part 3: Glowing Energy Core Ring
  const ringGeo = new THREE.TorusGeometry(0.32, 0.03, 12, 24);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.35;
  group.add(ring);

  // Part 4 & 5: Left & Right Brass Mechanical Shoulder Joints
  const jointGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const jointMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.15,
  });
  const leftJoint = new THREE.Mesh(jointGeo, jointMat);
  leftJoint.position.set(-0.32, 0.38, 0);
  const rightJoint = new THREE.Mesh(jointGeo, jointMat);
  rightJoint.position.set(0.32, 0.38, 0);
  group.add(leftJoint);
  group.add(rightJoint);

  // Part 6: Dome Head
  const headGeo = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.1,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 0.6;
  head.castShadow = true;
  group.add(head);

  // Part 7: Optical Sensor Visor Eye (Accent Detail)
  const eyeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.5,
  });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.rotation.x = Math.PI / 2;
  eye.position.set(0, 0.65, 0.16);
  group.add(eye);

  // Part 8: Top Antenna Probe
  const antGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8);
  const antMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
  const ant = new THREE.Mesh(antGeo, antMat);
  ant.position.set(0, 0.8, 0);
  const orbGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const orbMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1 });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.set(0, 0.9, 0);
  group.add(ant);
  group.add(orb);

  // Ground contact shadow disc
  const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  group.add(shadow);

  return group;
}

// 2. Laser Emitter Turret (Composite 6-part THREE.Group)
export function createLaserEmitterMesh(): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Heavy Pedestal
  const baseGeo = new THREE.BoxGeometry(0.8, 0.15, 0.8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.075;
  base.castShadow = true;
  group.add(base);

  // Part 2: Turret Body Housing
  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.45, 12);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.25 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.35;
  body.castShadow = true;
  group.add(body);

  // Part 3: Focusing Lens Barrel
  const barrelGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 16);
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.4, 0.25);
  group.add(barrel);

  // Part 4: High Energy Laser Lens Glass
  const lensGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 1.8,
  });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.position.set(0, 0.4, 0.38);
  group.add(lens);

  // Part 5 & 6: Side Cooling Vents
  const ventGeo = new THREE.BoxGeometry(0.05, 0.2, 0.25);
  const ventMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
  const leftVent = new THREE.Mesh(ventGeo, ventMat);
  leftVent.position.set(-0.32, 0.35, 0);
  const rightVent = new THREE.Mesh(ventGeo, ventMat);
  rightVent.position.set(0.32, 0.35, 0);
  group.add(leftVent);
  group.add(rightVent);

  return group;
}

// 3. Rotatable Reflector Mirror (Composite 5-part THREE.Group)
export function createMirrorMesh(rotation: number = 0): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Circular Brass Swivel Base
  const baseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.1, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.05;
  base.castShadow = true;
  group.add(base);

  // Part 2: Dual Support Arms
  const armGeo = new THREE.BoxGeometry(0.08, 0.45, 0.08);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
  const armLeft = new THREE.Mesh(armGeo, armMat);
  armLeft.position.set(-0.3, 0.28, 0);
  const armRight = new THREE.Mesh(armGeo, armMat);
  armRight.position.set(0.3, 0.28, 0);
  group.add(armLeft);
  group.add(armRight);

  // Part 3: Heavy Metal Mirror Frame
  const frameGeo = new THREE.BoxGeometry(0.65, 0.55, 0.08);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.15 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = 0.45;
  frame.castShadow = true;
  group.add(frame);

  // Part 4: Highly Reflective Chrome Mirror Surface (metalness 0.98, roughness 0.05)
  const mirrorSurfaceGeo = new THREE.PlaneGeometry(0.55, 0.45);
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.98,
    roughness: 0.05,
  });
  const mirrorFront = new THREE.Mesh(mirrorSurfaceGeo, mirrorMat);
  mirrorFront.position.set(0, 0.45, 0.045);
  group.add(mirrorFront);

  // Part 5: Rotation Direction Indicator Arrow on Rim
  const arrowGeo = new THREE.ConeGeometry(0.06, 0.12, 3);
  const arrowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.6 });
  const arrow = new THREE.Mesh(arrowGeo, arrowMat);
  arrow.rotation.x = Math.PI / 2;
  arrow.position.set(0, 0.12, 0.32);
  group.add(arrow);

  return group;
}

// 4. Optical Laser Sensor Target (Composite 5-part THREE.Group)
export function createLaserTargetMesh(active: boolean = false): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Hexagonal Sensor Housing Base
  const baseGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.12, 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.06;
  group.add(base);

  // Part 2: Concentric Sensor Ring Outer
  const ring1Geo = new THREE.TorusGeometry(0.3, 0.04, 12, 24);
  const ring1Mat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = 0.13;
  group.add(ring1);

  // Part 3: Photovoltaic Receptor Eye
  const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: active ? 0x22c55e : 0xef4444,
    emissive: active ? 0x22c55e : 0x7f1d1d,
    emissiveIntensity: active ? 1.5 : 0.4,
    roughness: 0.1,
  });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.y = 0.14;
  group.add(eye);

  // Part 4 & 5: Status Beacons
  const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: active ? 0x4ade80 : 0xf87171,
    emissive: active ? 0x22c55e : 0xef4444,
    emissiveIntensity: 1.2,
  });
  const b1 = new THREE.Mesh(beaconGeo, beaconMat);
  b1.position.set(-0.3, 0.15, 0);
  const b2 = new THREE.Mesh(beaconGeo, beaconMat);
  b2.position.set(0.3, 0.15, 0);
  group.add(b1);
  group.add(b2);

  return group;
}

// 5. Pushable Quantum Cube (Composite 4-part THREE.Group)
export function createPushCubeMesh(): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Main Block Silhouette (bevel edge box)
  const cubeGeo = new THREE.BoxGeometry(0.76, 0.76, 0.76);
  const cubeMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    metalness: 0.7,
    roughness: 0.2,
  });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.y = 0.38;
  cube.castShadow = true;
  group.add(cube);

  // Part 2: Metallic Corner Trim Guards
  const cornerGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const cornerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, wireframe: true });
  const corner = new THREE.Mesh(cornerGeo, cornerMat);
  corner.position.y = 0.38;
  group.add(corner);

  // Part 3: Glowing Central Power Core Emblem
  const coreGeo = new THREE.OctahedronGeometry(0.2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    emissive: 0x3b82f6,
    emissiveIntensity: 1.2,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0.38;
  group.add(core);

  // Part 4: Handle Grip Grooves on Sides
  const gripGeo = new THREE.BoxGeometry(0.5, 0.08, 0.78);
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.9 });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.y = 0.38;
  group.add(grip);

  return group;
}

// 6. Door & Key Gate (Composite 6-part THREE.Group)
export function createDoorMesh(color: KeyColor = 'red', isOpen: boolean = false): THREE.Group {
  const group = new THREE.Group();
  const hexColor = color === 'red' ? 0xef4444 : color === 'blue' ? 0x3b82f6 : color === 'green' ? 0x22c55e : 0xeab308;

  // Part 1 & 2: Gate Pillars Left and Right
  const pillarGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
  const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
  pLeft.position.set(-0.4, 0.6, 0);
  const pRight = new THREE.Mesh(pillarGeo, pillarMat);
  pRight.position.set(0.4, 0.6, 0);
  pLeft.castShadow = true;
  pRight.castShadow = true;
  group.add(pLeft);
  group.add(pRight);

  // Part 3: Top Arch Lintels
  const archGeo = new THREE.BoxGeometry(1.0, 0.18, 0.22);
  const arch = new THREE.Mesh(archGeo, pillarMat);
  arch.position.set(0, 1.1, 0);
  group.add(arch);

  // Part 4: Sliding Barrier Door Panel
  const panelGeo = new THREE.BoxGeometry(0.65, 0.95, 0.08);
  const panelMat = new THREE.MeshStandardMaterial({
    color: hexColor,
    metalness: 0.6,
    roughness: 0.2,
    transparent: true,
    opacity: isOpen ? 0.2 : 0.95,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, isOpen ? 1.5 : 0.525, 0);
  group.add(panel);

  // Part 5: Rune Lock Crest Badge
  const badgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8);
  const badgeMat = new THREE.MeshStandardMaterial({
    color: hexColor,
    emissive: hexColor,
    emissiveIntensity: isOpen ? 0.2 : 1.2,
  });
  const badge = new THREE.Mesh(badgeGeo, badgeMat);
  badge.rotation.x = Math.PI / 2;
  badge.position.set(0, 0.6, 0.06);
  group.add(badge);

  return group;
}

// 7. Pressure Plate (Composite 4-part THREE.Group)
export function createPressurePlateMesh(active: boolean = false): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Heavy Base Rim Frame
  const frameGeo = new THREE.BoxGeometry(0.9, 0.06, 0.9);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = 0.03;
  group.add(frame);

  // Part 2: Depressible Center Pad
  const padGeo = new THREE.BoxGeometry(0.75, 0.06, 0.75);
  const padMat = new THREE.MeshStandardMaterial({
    color: active ? 0x22c55e : 0xeab308,
    metalness: 0.5,
    roughness: 0.2,
    emissive: active ? 0x22c55e : 0xa16207,
    emissiveIntensity: active ? 0.8 : 0.2,
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = active ? 0.02 : 0.05;
  group.add(pad);

  // Part 3 & 4: Corner LED Status Lights
  const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const ledMat = new THREE.MeshStandardMaterial({
    color: active ? 0x4ade80 : 0xfef08a,
    emissive: active ? 0x22c55e : 0xeab308,
    emissiveIntensity: 1.5,
  });
  [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]].forEach(([x, z]) => {
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(x, 0.07, z);
    group.add(led);
  });

  return group;
}

// 8. Collectible Gem Crystal (Composite 3-part THREE.Group)
export function createGemMesh(): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Faceted Double Cone Crystal Mesh
  const crystalGeo = new THREE.OctahedronGeometry(0.25, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.1,
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 0.4;
  crystal.castShadow = true;
  group.add(crystal);

  // Part 2: Orbiting Energy Particle Ring
  const ringGeo = new THREE.TorusGeometry(0.32, 0.015, 8, 16);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x7dd3fc, emissiveIntensity: 1.2 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  ring.position.y = 0.4;
  group.add(ring);

  // Part 3: Soft Contact Shadow Base
  const shadowGeo = new THREE.PlaneGeometry(0.4, 0.4);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  group.add(shadow);

  return group;
}

// 9. Collectible Key Rune (Composite 4-part THREE.Group)
export function createKeyMesh(color: KeyColor = 'red'): THREE.Group {
  const group = new THREE.Group();
  const hexColor = color === 'red' ? 0xef4444 : color === 'blue' ? 0x3b82f6 : color === 'green' ? 0x22c55e : 0xeab308;

  // Part 1: Key Ring Loop
  const ringGeo = new THREE.TorusGeometry(0.12, 0.035, 12, 24);
  const mat = new THREE.MeshStandardMaterial({ color: hexColor, metalness: 0.8, roughness: 0.2, emissive: hexColor, emissiveIntensity: 0.5 });
  const ring = new THREE.Mesh(ringGeo, mat);
  ring.position.set(0, 0.5, 0);
  group.add(ring);

  // Part 2: Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12);
  const shaft = new THREE.Mesh(shaftGeo, mat);
  shaft.position.set(0, 0.28, 0);
  group.add(shaft);

  // Part 3: Bit Teeth
  const teethGeo = new THREE.BoxGeometry(0.12, 0.08, 0.03);
  const teeth = new THREE.Mesh(teethGeo, mat);
  teeth.position.set(0.06, 0.2, 0);
  group.add(teeth);

  return group;
}

// 10. Exit Goal Portal (Composite 5-part THREE.Group)
export function createGoalMesh(): THREE.Group {
  const group = new THREE.Group();

  // Part 1: Hexagonal Platform Plinth
  const plinthGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.12, 6);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.06;
  group.add(plinth);

  // Part 2: Glowing Vortex Archway
  const archGeo = new THREE.TorusGeometry(0.42, 0.05, 12, 24);
  const archMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0xa855f7,
    emissiveIntensity: 1.5,
  });
  const arch = new THREE.Mesh(archGeo, archMat);
  arch.rotation.x = Math.PI / 2;
  arch.position.y = 0.12;
  group.add(arch);

  // Part 3: Swirling Teleport Energy Disc
  const discGeo = new THREE.CircleGeometry(0.4, 24);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.13;
  group.add(disc);

  // Part 4 & 5: Energy Crystal Spire Obelisks
  const spireGeo = new THREE.ConeGeometry(0.08, 0.4, 4);
  const spireMat = new THREE.MeshStandardMaterial({ color: 0xe879f9, emissive: 0xd946ef, emissiveIntensity: 1 });
  const s1 = new THREE.Mesh(spireGeo, spireMat);
  s1.position.set(-0.38, 0.26, 0);
  const s2 = new THREE.Mesh(spireGeo, spireMat);
  s2.position.set(0.38, 0.26, 0);
  group.add(s1);
  group.add(s2);

  return group;
}

// 11. Wall Block (Composite 3-part THREE.Group)
export function createWallMesh(theme: ThemeType): THREE.Group {
  const group = new THREE.Group();

  const colorMap: Record<ThemeType, number> = {
    cyber: 0x1e293b,
    ancient: 0x44403c,
    scifi: 0x0f172a,
    lava: 0x292524,
    crystal: 0x312e81,
  };

  const wallGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
  const wallMat = new THREE.MeshStandardMaterial({
    color: colorMap[theme] || 0x1e293b,
    metalness: 0.6,
    roughness: 0.3,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = 0.48;
  wall.castShadow = true;
  group.add(wall);

  // Top Edge Trim Frame
  const trimGeo = new THREE.BoxGeometry(0.98, 0.08, 0.98);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.y = 0.92;
  group.add(trim);

  return group;
}
