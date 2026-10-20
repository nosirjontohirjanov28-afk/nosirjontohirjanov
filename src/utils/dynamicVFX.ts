import * as THREE from 'three';

export interface DynamicVFXManager {
  update: (
    dt: number,
    carPos: THREE.Vector3,
    carVel: THREE.Vector3,
    heading: number,
    speedKmh: number,
    isDrifting: boolean,
    absDriftDeg: number,
    steerInput: number,
    angularVel: number,
    isBraking: boolean,
    isNitro: boolean
  ) => void;
  dispose: () => void;
}

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  age: number;
  maxAge: number;
  initScale: number;
  maxScale: number;
  baseOpacity: number;
  rotSpeed: number;
  active: boolean;
  type: 'smoke' | 'dust' | 'spark';
}

interface SpeedTrail {
  mesh: THREE.Line;
  localAnchor: THREE.Vector3;
  length: number;
}

export function createDynamicVFX(scene: THREE.Scene): DynamicVFXManager {
  const upAxis = new THREE.Vector3(0, 1, 0);

  // 1. TIRE SMOKE POOL (Dense billowing volumetric white friction smoke)
  const smokeParticles: Particle[] = [];
  const smokeCount = 42;
  const smokeGeo = new THREE.DodecahedronGeometry(0.35, 1);

  for (let i = 0; i < smokeCount; i++) {
    const smokeMat = new THREE.MeshLambertMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(smokeGeo, smokeMat);
    mesh.visible = false;
    scene.add(mesh);

    smokeParticles.push({
      mesh,
      vel: new THREE.Vector3(),
      age: 0,
      maxAge: 0.85,
      initScale: 0.4,
      maxScale: 2.8,
      baseOpacity: 0.55,
      rotSpeed: (Math.random() - 0.5) * 3.5,
      active: false,
      type: 'smoke',
    });
  }
  let smokeIdx = 0;

  // 2. ROAD DUST POOL (Warm sandy/earthy dust kicked up by motion and sharp turns)
  const dustParticles: Particle[] = [];
  const dustCount = 45;
  const dustGeo = new THREE.IcosahedronGeometry(0.28, 0);
  const dustColors = [0xd4be9b, 0xb8a282, 0x8f7d67, 0xcab598];

  for (let i = 0; i < dustCount; i++) {
    const col = dustColors[i % dustColors.length];
    const dustMat = new THREE.MeshLambertMaterial({
      color: col,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(dustGeo, dustMat);
    mesh.visible = false;
    scene.add(mesh);

    dustParticles.push({
      mesh,
      vel: new THREE.Vector3(),
      age: 0,
      maxAge: 0.75,
      initScale: 0.35,
      maxScale: 2.2,
      baseOpacity: 0.42,
      rotSpeed: (Math.random() - 0.5) * 4.2,
      active: false,
      type: 'dust',
    });
  }
  let dustIdx = 0;

  // 3. CHASSIS GROUND SPARKS (Fiery titanium friction sparks)
  const sparkParticles: Particle[] = [];
  const sparkCount = 20;
  const sparkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.22);
  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });

  for (let i = 0; i < sparkCount; i++) {
    const mesh = new THREE.Mesh(sparkGeo, sparkMat.clone());
    mesh.visible = false;
    scene.add(mesh);

    sparkParticles.push({
      mesh,
      vel: new THREE.Vector3(),
      age: 0,
      maxAge: 0.28,
      initScale: 1.0,
      maxScale: 1.0,
      baseOpacity: 0.95,
      rotSpeed: 0,
      active: false,
      type: 'spark',
    });
  }
  let sparkIdx = 0;

  // 4. AERODYNAMIC HIGH-SPEED AIR TRAILS (Streamlines slicing past vehicle)
  const trails: SpeedTrail[] = [];
  const trailAnchors = [
    new THREE.Vector3(-0.95, 0.8, -0.4),  // Left mirror / window edge
    new THREE.Vector3(0.95, 0.8, -0.4),   // Right mirror / window edge
    new THREE.Vector3(-0.55, 1.25, -1.2), // Left roofline / wing
    new THREE.Vector3(0.55, 1.25, -1.2),  // Right roofline / wing
    new THREE.Vector3(-0.95, 1.15, -2.1), // Left wing endplate
    new THREE.Vector3(0.95, 1.15, -2.1),  // Right wing endplate
  ];

  trailAnchors.forEach((anchor) => {
    const lineGeo = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, 0, 0, -2.5]);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
    trails.push({
      mesh: line,
      localAnchor: anchor,
      length: 2.8,
    });
  });

  // Reusable scratch vectors to ensure zero heap allocations
  const _wheelWorldPos = new THREE.Vector3();
  const _tempOffset = new THREE.Vector3();
  const _tangentWake = new THREE.Vector3();
  const _sparkOrigin = new THREE.Vector3();

  let smokeTimer = 0;
  let dustTimer = 0;
  let sparkTimer = 0;

  const spawnSmokePuff = (
    pos: THREE.Vector3,
    carVelocity: THREE.Vector3,
    intensity: number
  ) => {
    const p = smokeParticles[smokeIdx];
    smokeIdx = (smokeIdx + 1) % smokeCount;

    p.active = true;
    p.age = 0;
    p.maxAge = 0.65 + Math.random() * 0.45;
    p.initScale = 0.35 + intensity * 0.2;
    p.maxScale = 2.4 + intensity * 1.2;
    p.mesh.visible = true;
    p.mesh.position.copy(pos);
    p.mesh.position.x += (Math.random() - 0.5) * 0.25;
    p.mesh.position.y = 0.16 + Math.random() * 0.1;
    p.mesh.position.z += (Math.random() - 0.5) * 0.25;
    p.mesh.scale.setScalar(p.initScale);

    // Dynamic puff momentum: expands upward and drifts back with vortex swirl
    p.vel.set(
      -carVelocity.x * 0.1 + (Math.random() - 0.5) * 1.8,
      0.9 + Math.random() * 1.2,
      -carVelocity.z * 0.1 + (Math.random() - 0.5) * 1.8
    );
    p.baseOpacity = Math.min(0.65, 0.25 + intensity * 0.4);
    (p.mesh.material as THREE.MeshLambertMaterial).opacity = p.baseOpacity;
  };

  const spawnDustPuff = (
    pos: THREE.Vector3,
    carVelocity: THREE.Vector3,
    intensity: number,
    spraySide: number
  ) => {
    const p = dustParticles[dustIdx];
    dustIdx = (dustIdx + 1) % dustCount;

    p.active = true;
    p.age = 0;
    p.maxAge = 0.55 + Math.random() * 0.35;
    p.initScale = 0.3 + intensity * 0.25;
    p.maxScale = 1.9 + intensity * 0.9;
    p.mesh.visible = true;
    p.mesh.position.copy(pos);
    p.mesh.position.x += (Math.random() - 0.5) * 0.2;
    p.mesh.position.y = 0.12 + Math.random() * 0.08;
    p.mesh.position.z += (Math.random() - 0.5) * 0.2;
    p.mesh.scale.setScalar(p.initScale);

    // Dust sprays outward and kicks up from tires
    p.vel.set(
      -carVelocity.x * 0.12 + spraySide * (1.2 + Math.random() * 2.2),
      0.45 + Math.random() * 0.85 + intensity * 0.4,
      -carVelocity.z * 0.12 + (Math.random() - 0.5) * 1.6
    );
    p.baseOpacity = Math.min(0.5, 0.18 + intensity * 0.3);
    (p.mesh.material as THREE.MeshLambertMaterial).opacity = p.baseOpacity;
  };

  const spawnSpark = (origin: THREE.Vector3, backwardDir: THREE.Vector3) => {
    const p = sparkParticles[sparkIdx];
    sparkIdx = (sparkIdx + 1) % sparkCount;

    p.active = true;
    p.age = 0;
    p.maxAge = 0.22 + Math.random() * 0.14;
    p.mesh.visible = true;
    p.mesh.position.copy(origin);
    p.vel.set(
      backwardDir.x * (10 + Math.random() * 12) + (Math.random() - 0.5) * 4,
      1.2 + Math.random() * 2.8,
      backwardDir.z * (10 + Math.random() * 12) + (Math.random() - 0.5) * 4
    );
    (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
  };

  const update = (
    dt: number,
    carPos: THREE.Vector3,
    carVel: THREE.Vector3,
    heading: number,
    speedKmh: number,
    isDrifting: boolean,
    absDriftDeg: number,
    steerInput: number,
    angularVel: number,
    isBraking: boolean,
    isNitro: boolean
  ) => {
    const inMotion = speedKmh > 8;
    const isSharpTurn = Math.abs(steerInput) > 0.35 || Math.abs(angularVel) > 0.85;

    // A. TIRE SMOKE GENERATION (During drift, hard brake, or high angle slide)
    if (isDrifting || (isBraking && speedKmh > 32)) {
      smokeTimer += dt;
      const smokeInterval = isDrifting ? 0.045 : 0.07;
      if (smokeTimer >= smokeInterval) {
        smokeTimer = 0;
        const smokeIntensity = isDrifting ? Math.min(1.0, absDriftDeg / 45 + 0.2) : 0.6;

        // Rear Left Wheel contact
        _tempOffset.set(-0.96, 0.08, -1.35).applyAxisAngle(upAxis, heading);
        _wheelWorldPos.copy(carPos).add(_tempOffset);
        spawnSmokePuff(_wheelWorldPos, carVel, smokeIntensity);

        // Rear Right Wheel contact
        _tempOffset.set(0.96, 0.08, -1.35).applyAxisAngle(upAxis, heading);
        _wheelWorldPos.copy(carPos).add(_tempOffset);
        spawnSmokePuff(_wheelWorldPos, carVel, smokeIntensity);

        // Extreme drift angle (> 30°): Front tires also smoke from scrubbing
        if (absDriftDeg > 30 && speedKmh > 45) {
          const frontSide = steerInput > 0 ? 0.95 : -0.95;
          _tempOffset.set(frontSide, 0.08, 1.35).applyAxisAngle(upAxis, heading);
          _wheelWorldPos.copy(carPos).add(_tempOffset);
          spawnSmokePuff(_wheelWorldPos, carVel, smokeIntensity * 0.7);
        }
      }
    }

    // B. GROUND ROAD DUST & GRAVEL GENERATION (Active whenever car is in motion, erupting in sharp turns)
    if (inMotion) {
      dustTimer += dt;
      // Dust spawns faster when turning sharply or drifting
      const dustInterval = isSharpTurn || isDrifting ? 0.045 : 0.09;
      if (dustTimer >= dustInterval) {
        dustTimer = 0;
        const dustIntensity = (speedKmh / 160) * (isSharpTurn ? 1.8 : 1.0) + (isDrifting ? 0.5 : 0.1);

        // Left wheels dust kick-up
        _tempOffset.set(-0.95, 0.06, -1.35).applyAxisAngle(upAxis, heading);
        _wheelWorldPos.copy(carPos).add(_tempOffset);
        spawnDustPuff(_wheelWorldPos, carVel, dustIntensity, -Math.cos(heading));

        // Right wheels dust kick-up
        _tempOffset.set(0.95, 0.06, -1.35).applyAxisAngle(upAxis, heading);
        _wheelWorldPos.copy(carPos).add(_tempOffset);
        spawnDustPuff(_wheelWorldPos, carVel, dustIntensity, Math.cos(heading));

        // In sharp turns, front outside tire also kicks up heavy dust plumes
        if (isSharpTurn && speedKmh > 25) {
          const frontSide = steerInput >= 0 ? 0.95 : -0.95;
          _tempOffset.set(frontSide, 0.06, 1.35).applyAxisAngle(upAxis, heading);
          _wheelWorldPos.copy(carPos).add(_tempOffset);
          spawnDustPuff(_wheelWorldPos, carVel, dustIntensity * 1.2, steerInput);
        }
      }
    }

    // C. CHASSIS GROUND SPARKS (Extreme drift transitions, bottoming out or curbs)
    if ((isDrifting && absDriftDeg > 42) || (isBraking && speedKmh > 90) || isNitro) {
      sparkTimer += dt;
      if (sparkTimer > 0.08) {
        sparkTimer = 0;
        const backDir = _tangentWake.set(-Math.sin(heading), 0, -Math.cos(heading));
        _sparkOrigin.set((Math.random() - 0.5) * 1.4, 0.05, -2.1).applyAxisAngle(upAxis, heading).add(carPos);
        spawnSpark(_sparkOrigin, backDir);
      }
    }

    // D. UPDATE ACTIVE SMOKE PARTICLES (Expanding billows, rising, fading)
    for (let i = 0; i < smokeParticles.length; i++) {
      const p = smokeParticles[i];
      if (!p.active) continue;

      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      const lifeProgress = p.age / p.maxAge;
      // Air drag slows horizontal motion
      p.vel.x *= Math.pow(0.85, dt * 10);
      p.vel.z *= Math.pow(0.85, dt * 10);
      // Thermal convection rises
      p.vel.y += dt * 0.45;

      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.y += p.rotSpeed * dt;

      // Volumetric cloud expansion: puffs swell up over time
      const currentScale = THREE.MathUtils.lerp(p.initScale, p.maxScale, Math.pow(lifeProgress, 0.65));
      p.mesh.scale.setScalar(currentScale);

      // Smooth alpha decay
      const alpha = p.baseOpacity * (1 - lifeProgress);
      (p.mesh.material as THREE.MeshLambertMaterial).opacity = alpha;
    }

    // E. UPDATE ACTIVE DUST PARTICLES (Swirling ground plumes, drag, fading)
    for (let i = 0; i < dustParticles.length; i++) {
      const p = dustParticles[i];
      if (!p.active) continue;

      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      const lifeProgress = p.age / p.maxAge;
      p.vel.x *= Math.pow(0.82, dt * 10);
      p.vel.z *= Math.pow(0.82, dt * 10);
      p.vel.y += dt * 0.25; // Gentle upward rise

      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.rotSpeed * dt;
      p.mesh.rotation.y += p.rotSpeed * dt;

      const currentScale = THREE.MathUtils.lerp(p.initScale, p.maxScale, Math.pow(lifeProgress, 0.7));
      p.mesh.scale.setScalar(currentScale);

      const alpha = p.baseOpacity * (1 - lifeProgress);
      (p.mesh.material as THREE.MeshLambertMaterial).opacity = alpha;
    }

    // F. UPDATE ACTIVE SPARKS
    for (let i = 0; i < sparkParticles.length; i++) {
      const p = sparkParticles[i];
      if (!p.active) continue;

      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      p.vel.y -= dt * 12.0; // Gravity pulling sparks down to road
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.mesh.position.y < 0.03) {
        p.mesh.position.y = 0.03;
        p.vel.y *= -0.4; // Bounce on asphalt
      }

      const lifeProgress = p.age / p.maxAge;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - lifeProgress;
    }

    // G. UPDATE AERODYNAMIC SPEED TRAILS (Wind streamlines slicing past car body)
    const trailAlpha = speedKmh > 75 || isNitro ? THREE.MathUtils.clamp((speedKmh - 75) / 120 + (isNitro ? 0.45 : 0), 0, 0.75) : 0;
    trails.forEach((trail) => {
      if (trailAlpha <= 0.02) {
        trail.mesh.visible = false;
        return;
      }
      trail.mesh.visible = true;

      // Position trail at car's local anchor in world space
      _tempOffset.copy(trail.localAnchor).applyAxisAngle(upAxis, heading);
      trail.mesh.position.copy(carPos).add(_tempOffset);
      trail.mesh.rotation.y = heading;

      const mat = trail.mesh.material as THREE.LineBasicMaterial;
      mat.opacity = trailAlpha * (0.6 + Math.random() * 0.4);
      mat.color.setHex(isNitro ? 0x60a5fa : 0xe0f2fe);
    });
  };

  const dispose = () => {
    smokeParticles.forEach((p) => {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    });
    dustParticles.forEach((p) => {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    });
    sparkParticles.forEach((p) => {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    });
    trails.forEach((t) => {
      scene.remove(t.mesh);
      t.mesh.geometry.dispose();
      (t.mesh.material as THREE.Material).dispose();
    });
  };

  return {
    update,
    dispose,
  };
}
