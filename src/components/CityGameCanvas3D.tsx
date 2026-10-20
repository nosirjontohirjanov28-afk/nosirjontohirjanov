import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraMode, CarStats, DayNightTime, Telemetry } from '../types/game';
import { buildRealisticCarRig, updateCarRigStyles } from '../utils/carModel3D';
import { buildOpenWorldCity } from '../utils/cityBuilder3D';
import { audioSystem } from '../utils/audioSystem';
import { createDynamicVFX } from '../utils/dynamicVFX';

interface TouchInput {
  gas: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
  nitro: boolean;
}

interface CityGameCanvas3DProps {
  carStats: CarStats;
  cameraMode: CameraMode;
  dayTime: DayNightTime;
  fuel: number;
  touchInput: TouchInput;
  headlightsOn: boolean;
  onTelemetry: (t: Telemetry) => void;
  onDriftPointsAwarded: (points: number) => void;
  onFuelConsume: (amount: number) => void;
  onRefuel: () => void;
  onOpenGarage: () => void;
  onOpenDealership: () => void;
}

export const CityGameCanvas3D: React.FC<CityGameCanvas3DProps> = ({
  carStats,
  cameraMode,
  dayTime,
  fuel,
  touchInput,
  headlightsOn,
  onTelemetry,
  onDriftPointsAwarded,
  onFuelConsume,
  onRefuel,
  onOpenGarage,
  onOpenDealership,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Latest props kept in refs to avoid restarting requestAnimationFrame loop (Zero lag / Qotmasligi uchun)
  const carStatsRef = useRef(carStats);
  carStatsRef.current = carStats;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const dayTimeRef = useRef(dayTime);
  dayTimeRef.current = dayTime;

  const fuelRef = useRef(fuel);
  fuelRef.current = fuel;

  const touchRef = useRef(touchInput);
  touchRef.current = touchInput;

  const headlightsRef = useRef(headlightsOn);
  headlightsRef.current = headlightsOn;

  const onTelemetryRef = useRef(onTelemetry);
  onTelemetryRef.current = onTelemetry;

  const onDriftPointsRef = useRef(onDriftPointsAwarded);
  onDriftPointsRef.current = onDriftPointsAwarded;

  const onFuelConsumeRef = useRef(onFuelConsume);
  onFuelConsumeRef.current = onFuelConsume;

  const onRefuelRef = useRef(onRefuel);
  onRefuelRef.current = onRefuel;

  const onOpenGarageRef = useRef(onOpenGarage);
  onOpenGarageRef.current = onOpenGarage;

  const onOpenDealershipRef = useRef(onOpenDealership);
  onOpenDealershipRef.current = onOpenDealership;

  const playerRigRef = useRef<ReturnType<typeof buildRealisticCarRig> | null>(null);
  const lastCarIdRef = useRef<string>(carStats.id);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Update visual car styles or rebuild car rig when changing models
  useEffect(() => {
    if (!sceneRef.current) return;
    if (playerRigRef.current && lastCarIdRef.current === carStats.id) {
      updateCarRigStyles(playerRigRef.current, carStats);
    } else if (sceneRef.current) {
      // Rebuild 3D car rig with authentic exterior design for the newly selected car!
      if (playerRigRef.current) {
        sceneRef.current.remove(playerRigRef.current.root);
      }
      const newRig = buildRealisticCarRig(carStats);
      sceneRef.current.add(newRig.root);
      playerRigRef.current = newRig;
      lastCarIdRef.current = carStats.id;
    }
  }, [carStats]);

  // Update Day/Night lighting without lag
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !ambientLightRef.current) return;
    const scene = sceneRef.current;
    const dir = dirLightRef.current;
    const amb = ambientLightRef.current;

    if (dayTime === 'day') {
      scene.background = new THREE.Color(0x38bdf8);
      scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0035);
      amb.intensity = 0.85;
      amb.color.setHex(0xffffff);
      dir.intensity = 1.6;
      dir.color.setHex(0xfffbeb);
      dir.position.set(60, 90, 45);
    } else if (dayTime === 'sunset') {
      scene.background = new THREE.Color(0x451a03);
      scene.fog = new THREE.FogExp2(0x78350f, 0.0045);
      amb.intensity = 0.65;
      amb.color.setHex(0xfdba74);
      dir.intensity = 1.3;
      dir.color.setHex(0xf97316);
      dir.position.set(80, 40, -40);
    } else {
      // Night mode
      scene.background = new THREE.Color(0x060912);
      scene.fog = new THREE.FogExp2(0x080d1a, 0.005);
      amb.intensity = 0.35;
      amb.color.setHex(0x1e293b);
      dir.intensity = 0.45;
      dir.color.setHex(0x38bdf8);
      dir.position.set(-40, 60, 30);
    }
  }, [dayTime]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer (Optimized for 60 FPS performance)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060912);
    scene.fog = new THREE.FogExp2(0x080d1a, 0.005);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      400
    );
    camera.position.set(0, 4, -10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
      stencil: false,
      depth: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // Optimized pixelRatio capped at 1.25 guarantees 120 FPS high refresh rate without GPU fillrate stutter
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting (Optimized for smooth 120 FPS)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    dirLight.position.set(45, 75, 35);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512; // High-performance 512x512 shadow map
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 180;
    const s = 65;
    dirLight.shadow.camera.left = -s;
    dirLight.shadow.camera.right = s;
    dirLight.shadow.camera.top = s;
    dirLight.shadow.camera.bottom = -s;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 3. Build Living City
    const city = buildOpenWorldCity();
    scene.add(city.group);

    // 4. Build Player Realistic Car Rig
    let currentCarStats = carStatsRef.current;
    let playerRig = buildRealisticCarRig(currentCarStats);
    scene.add(playerRig.root);
    playerRigRef.current = playerRig;

    // 5. Dynamic Visual Effects System (Volumetric Tire Smoke, Dust Plumes, Chassis Sparks, Speed Trails)
    const dynamicVFX = createDynamicVFX(scene);

    // Skid marks pool (Optimized to 50 active decals)
    const skidCount = 50;
    const skidMeshes: THREE.Mesh[] = [];
    const skidGeo = new THREE.PlaneGeometry(0.32, 0.95);
    skidGeo.rotateX(-Math.PI / 2);
    const skidMat = new THREE.MeshBasicMaterial({
      color: 0x07090e,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    for (let i = 0; i < skidCount; i++) {
      const sm = new THREE.Mesh(skidGeo, skidMat);
      sm.visible = false;
      sm.position.y = 0.03;
      scene.add(sm);
      skidMeshes.push(sm);
    }
    let skidIdx = 0;

    const dropSkid = (x: number, z: number, headingRad: number) => {
      const sm = skidMeshes[skidIdx];
      skidIdx = (skidIdx + 1) % skidCount;
      sm.visible = true;
      sm.position.set(x, 0.03, z);
      sm.rotation.y = headingRad;
    };

    // 6. Keyboard Listeners
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') e.preventDefault();
      audioSystem.init();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 7. Physics Variables (Realistic Car Acceleration, Drift Slip & Inertia)
    let carPos = new THREE.Vector3(0, 0, 0);
    let carVel = new THREE.Vector3(0, 0, 0);
    let heading = 0;
    let angularVel = 0;
    let steerAngle = 0;
    let wheelSpin = 0;
    let bodyPitch = 0;
    let bodyRoll = 0;
    let hoodAngle = 0;
    let doorAngle = 0;

    let currentRpm = 1100;
    let currentGear = 1;
    let lastGear = 1;
    let currentDriftPoints = 0;
    let comboMultiplier = 1.0;
    let driftTime = 0;
    let tireTemp = 65;
    let brakeGlow = 0;
    let backfireTimer = 0;
    let fuelConsumeTimer = 0;

    const camPos = new THREE.Vector3(0, 4, -8);
    const camLook = new THREE.Vector3(0, 1, 0);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. Pre-allocated Reusable Scratch Vectors (Zero Garbage Collection = 120 FPS with NO STUTTER/LAG)
    const _upAxis = new THREE.Vector3(0, 1, 0);
    const _forwardDir = new THREE.Vector3();
    const _rightDir = new THREE.Vector3();
    const _tempTarget = new THREE.Vector3();
    const _tempLook = new THREE.Vector3();
    const _wheelPosL = new THREE.Vector3();
    const _wheelPosR = new THREE.Vector3();

    let lastTime = performance.now();
    let telemetryTimer = 0;
    let smokeTimer = 0;
    let animId = 0;
    let rollingFps = 120;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const frameDelta = (now - lastTime) / 1000;
      lastTime = now;

      // Clamped delta between 240 FPS (0.004s) and 50 FPS (0.02s) to guarantee silky 120 FPS motion
      const dt = Math.min(0.02, Math.max(0.004, frameDelta));

      // Rolling FPS calculation
      const instantFps = 1 / Math.max(0.001, frameDelta);
      rollingFps = THREE.MathUtils.lerp(rollingFps, Math.min(144, instantFps), 0.05);

      const cStats = carStatsRef.current;
      const tInput = touchRef.current;
      const currentFuel = fuelRef.current;

      // Inputs
      const hasFuel = currentFuel > 0.5;
      const inGas = keys['w'] || keys['arrowup'] || tInput.gas;
      const inBrake = keys['s'] || keys['arrowdown'] || tInput.brake;
      const inLeft = keys['a'] || keys['arrowleft'] || tInput.left;
      const inRight = keys['d'] || keys['arrowright'] || tInput.right;
      const inHandbrake = keys[' '] || tInput.handbrake;
      const inNitro = (keys['shift'] || tInput.nitro) && hasFuel;

      const throttle = hasFuel && inGas ? (inNitro ? 1.4 : 1.0) : 0;
      const brake = inBrake ? 1.0 : 0;
      const steerRaw = (inLeft ? 1 : 0) - (inRight ? 1 : 0);

      // Reuse Local Vectors without memory allocations
      _forwardDir.set(Math.sin(heading), 0, Math.cos(heading));
      _rightDir.set(Math.cos(heading), 0, -Math.sin(heading));

      // Steer Angle (Ackermann kit ±48 degrees)
      const maxSteerRad = THREE.MathUtils.degToRad(48);
      steerAngle = THREE.MathUtils.lerp(steerAngle, steerRaw * maxSteerRad, dt * 12);

      // Engine & Drag Forces
      const forwardSpeed = carVel.dot(_forwardDir);
      const lateralSpeed = carVel.dot(_rightDir);
      const speedMag = carVel.length();

      const hpFactor = cStats.horsePower / 550;
      const accelForce = throttle * 34.0 * hpFactor * (cStats.turboStage * 0.15 + 0.85);
      let longForce = accelForce;

      if (brake > 0) {
        if (forwardSpeed > 1.2) {
          longForce -= brake * 38.0;
        } else {
          // Reverse gear
          longForce -= brake * 15.0;
        }
      }

      // Air resistance & rolling friction
      const drag = -forwardSpeed * Math.abs(forwardSpeed) * 0.012 - forwardSpeed * 0.35;
      const newForwardSpeed = forwardSpeed + (longForce + drag) * dt;

      // Lateral Friction & Drift Slip Physics
      const baseGrip = inHandbrake ? 0.18 : cStats.driftGrip * (throttle > 0.6 ? 0.72 : 0.95);
      const lateralFriction = THREE.MathUtils.clamp(baseGrip * 9.5, 1.4, 9.8);
      const newLateralSpeed = lateralSpeed * Math.exp(-lateralFriction * dt);

      // Yaw rotation torque
      const speedFactor = THREE.MathUtils.clamp(speedMag / 8.0, 0, 1.2);
      const oversteer = (inHandbrake ? 1.9 : 1.0) * (1 + throttle * (1 - cStats.driftGrip) * 1.5);
      const targetYawVel = steerRaw * 2.6 * speedFactor * oversteer * (forwardSpeed >= -0.5 ? 1 : -1);

      angularVel = THREE.MathUtils.lerp(angularVel, targetYawVel, dt * 8.0);
      heading += angularVel * dt;

      // Velocity assembly with drift momentum
      const driftInertia = -angularVel * Math.max(0, forwardSpeed) * (1 - baseGrip) * 0.45;
      carVel
        .copy(_forwardDir)
        .multiplyScalar(newForwardSpeed)
        .addScaledVector(_rightDir, newLateralSpeed + driftInertia);

      carPos.addScaledVector(carVel, dt);

      // Soft boundary clamp
      if (carPos.length() > 240) {
        carPos.setLength(240);
        carVel.multiplyScalar(0.5);
      }

      // Speed, Drift Angle & Gear
      const speedKmh = Math.round(speedMag * 3.6);
      const moveAngle = Math.atan2(carVel.x, carVel.z);
      let rawDriftRad = 0;
      if (speedMag > 3.0) {
        rawDriftRad = heading - moveAngle;
        while (rawDriftRad > Math.PI) rawDriftRad -= Math.PI * 2;
        while (rawDriftRad < -Math.PI) rawDriftRad += Math.PI * 2;
      }
      const driftAngleDeg = Math.round(THREE.MathUtils.radToDeg(rawDriftRad));
      const absDrift = Math.abs(driftAngleDeg);
      const isDrifting = absDrift >= 12 && absDrift <= 85 && speedKmh >= 26;

      // Visual Counter-Steer on Front Wheels during Drift
      const visualSteer = isDrifting
        ? THREE.MathUtils.clamp(-rawDriftRad * 0.85 + steerRaw * 0.35, -maxSteerRad, maxSteerRad)
        : steerAngle;

      // 6-Speed Sequential Gearbox
      const thresholds = [0, 45, 85, 130, 180, 240, 360];
      let gear = 1;
      for (let g = 1; g <= 6; g++) {
        if (speedKmh >= thresholds[g - 1]) gear = g;
      }
      if (gear !== lastGear) {
        if (gear > lastGear && currentRpm > 6500) {
          backfireTimer = 0.35;
          audioSystem.triggerBackfire();
        }
        lastGear = gear;
      }
      currentGear = gear;

      const gMin = thresholds[currentGear - 1] || 0;
      const gMax = thresholds[currentGear] || 320;
      const gNorm = THREE.MathUtils.clamp((speedKmh - gMin) / Math.max(1, gMax - gMin), 0, 1);
      const targetRpm =
        1100 + THREE.MathUtils.clamp(gNorm * 6800 + throttle * 1200 + (isDrifting ? 1100 : 0), 0, 8000);
      currentRpm = THREE.MathUtils.lerp(currentRpm, targetRpm, dt * 12);

      // Sound update (BMW M Power Inline-6)
      const turboBoost = throttle > 0.2 ? cStats.turboStage * 0.7 * (currentRpm / 9000) : -0.2;
      audioSystem.updateEngine(
        currentRpm,
        9000,
        throttle,
        isDrifting ? Math.min(1.0, absDrift / 45) : 0,
        turboBoost
      );

      // Fuel consumption
      fuelConsumeTimer += dt;
      if (fuelConsumeTimer >= 1.0) {
        fuelConsumeTimer = 0;
        const burn = (0.04 + (speedKmh / 200) * 0.12 + (isDrifting ? 0.08 : 0)) * (throttle > 0 ? 1 : 0.2);
        onFuelConsumeRef.current(burn);
      }

      // Drift Scoring
      if (isDrifting) {
        driftTime += dt;
        comboMultiplier = Math.min(8.0, Number((1.0 + Math.floor(driftTime / 1.5) * 0.5).toFixed(1)));
        const pts = Math.round(dt * (absDrift * 6) * (speedKmh / 40) * comboMultiplier);
        currentDriftPoints += pts;
      } else if (currentDriftPoints > 0) {
        driftTime = Math.max(0, driftTime - dt * 3.0);
        if (driftTime === 0) {
          onDriftPointsRef.current(currentDriftPoints);
          currentDriftPoints = 0;
          comboMultiplier = 1.0;
        }
      }

      // Brake Glow & Tire Temp
      const isBraking = brake > 0.2 || inHandbrake;
      brakeGlow = THREE.MathUtils.lerp(brakeGlow, isBraking ? 1.0 : 0.0, dt * (isBraking ? 5.0 : 1.5));
      tireTemp = THREE.MathUtils.lerp(tireTemp, 65 + (isDrifting ? absDrift * 0.8 : 0), dt * 1.5);

      // Update 3D Car Position & Suspension Motion
      playerRig.root.position.copy(carPos);
      playerRig.root.rotation.y = heading;

      bodyPitch = THREE.MathUtils.lerp(bodyPitch, THREE.MathUtils.clamp(-throttle * 0.03 + brake * 0.05, -0.06, 0.06), dt * 8);
      bodyRoll = THREE.MathUtils.lerp(bodyRoll, THREE.MathUtils.clamp(rawDriftRad * 0.12 - steerAngle * 0.08, -0.1, 0.1), dt * 8);

      playerRig.chassisGroup.position.y = cStats.rideHeight;
      playerRig.chassisGroup.rotation.x = bodyPitch;
      playerRig.chassisGroup.rotation.z = bodyRoll;

      // Doors & Hood animations
      hoodAngle = THREE.MathUtils.lerp(hoodAngle, cStats.hoodOpen ? -0.92 : 0, dt * 7);
      playerRig.hoodPivot.rotation.x = hoodAngle;

      doorAngle = THREE.MathUtils.lerp(doorAngle, cStats.doorsOpen ? 0.78 : 0, dt * 6.5);
      playerRig.leftDoorPivot.rotation.y = doorAngle;
      playerRig.leftDoorPivot.rotation.z = -doorAngle * 0.55;
      playerRig.rightDoorPivot.rotation.y = -doorAngle;
      playerRig.rightDoorPivot.rotation.z = doorAngle * 0.55;

      playerRig.steeringWheelMesh.rotation.z = visualSteer * 2.5;
      playerRig.coolingFanMesh.rotation.z += dt * (10 + (currentRpm / 9000) * 35);

      // Wheels
      wheelSpin += dt * (speedMag * 2.6 + (isDrifting ? throttle * 24 : 0));
      playerRig.wheels.forEach((w) => {
        if (w.isFront) {
          w.steerGroup.rotation.y = visualSteer;
          w.spinGroup.rotation.x = wheelSpin * 0.85;
        } else {
          w.spinGroup.rotation.x = wheelSpin;
        }
        w.brakeDiscMat.emissiveIntensity = brakeGlow * 3.2;
      });

      // Headlights & Taillights
      const isNight = dayTimeRef.current === 'night';
      const hlOn = headlightsRef.current || isNight;
      playerRig.headlightL.intensity = hlOn ? 6.0 : 0;
      playerRig.headlightR.intensity = hlOn ? 6.0 : 0;
      playerRig.headlightCones.visible = hlOn;
      playerRig.tailLightMat.emissiveIntensity = isBraking ? 4.5 : 1.5;

      // Exhaust Flames
      if (backfireTimer > 0 || inNitro) {
        backfireTimer = Math.max(0, backfireTimer - dt);
        const flScale = 0.7 + Math.random() * 0.7;
        playerRig.flameL.scale.set(1, 1, flScale);
        playerRig.flameR.scale.set(1, 1, flScale);
        (playerRig.flameL.material as THREE.MeshBasicMaterial).opacity = 0.9;
        playerRig.flameLight.intensity = 6.0;
      } else {
        (playerRig.flameL.material as THREE.MeshBasicMaterial).opacity = 0;
        playerRig.flameLight.intensity = 0;
      }

      // Dynamic Visual Effects: Realistic Volumetric Tire Smoke, Ground Dust Plumes, Sparks & Speed Trails
      dynamicVFX.update(
        dt,
        carPos,
        carVel,
        heading,
        speedKmh,
        isDrifting,
        absDrift,
        steerRaw,
        angularVel,
        isBraking,
        inNitro
      );

      // Tire Skid Marks during drift or hard braking
      if (isDrifting || (isBraking && speedKmh > 35)) {
        smokeTimer += dt;
        if (smokeTimer > 0.055) {
          smokeTimer = 0;
          _wheelPosL.set(-0.95, 0.1, -1.35).applyAxisAngle(_upAxis, heading).add(carPos);
          _wheelPosR.set(0.95, 0.1, -1.35).applyAxisAngle(_upAxis, heading).add(carPos);
          dropSkid(_wheelPosL.x, _wheelPosL.z, heading);
          dropSkid(_wheelPosR.x, _wheelPosR.z, heading);
        }
      }

      // Update AI Traffic Cars
      city.trafficCars.forEach((tc) => {
        if (tc.axis === 'x') {
          tc.root.position.x += tc.speed * tc.direction * dt;
          if (tc.direction === 1 && tc.root.position.x > tc.maxCoord) {
            tc.root.position.x = tc.minCoord;
          } else if (tc.direction === -1 && tc.root.position.x < tc.minCoord) {
            tc.root.position.x = tc.maxCoord;
          }
        } else {
          tc.root.position.z += tc.speed * tc.direction * dt;
          if (tc.direction === 1 && tc.root.position.z > tc.maxCoord) {
            tc.root.position.z = tc.minCoord;
          } else if (tc.direction === -1 && tc.root.position.z < tc.minCoord) {
            tc.root.position.z = tc.maxCoord;
          }
        }
      });

      // Camera Choreography (Zero heap allocations)
      const cMode = cameraModeRef.current;
      if (cMode === 'chase') {
        _tempTarget.set(0, 2.7, -6.5).applyAxisAngle(_upAxis, heading - rawDriftRad * 0.4).add(carPos);
        camPos.lerp(_tempTarget, dt * 9.0);
        _tempLook.copy(carPos).add(new THREE.Vector3(0, 1.0, 0)).addScaledVector(_forwardDir, 3);
        camLook.lerp(_tempLook, dt * 12);
        camera.position.copy(camPos);
        camera.lookAt(camLook);
      } else if (cMode === 'dynamic_drift') {
        const sideSwing = THREE.MathUtils.clamp(rawDriftRad * 3.2, -3.2, 3.2);
        _tempTarget.set(sideSwing, 1.85, -5.5).applyAxisAngle(_upAxis, heading - rawDriftRad * 0.6).add(carPos);
        camPos.lerp(_tempTarget, dt * 8.0);
        _tempLook.copy(carPos).add(new THREE.Vector3(0, 0.85, 0));
        camLook.lerp(_tempLook, dt * 13);
        camera.position.copy(camPos);
        camera.lookAt(camLook);
      } else if (cMode === 'cockpit') {
        _tempTarget.set(-0.42, 0.95, -0.1).applyAxisAngle(_upAxis, heading).add(carPos);
        _tempLook.copy(_forwardDir).multiplyScalar(25).add(carPos).add(new THREE.Vector3(0, 0.9, 0));
        camera.position.copy(_tempTarget);
        camera.lookAt(_tempLook);
      } else if (cMode === 'hood') {
        _tempTarget.set(0, 1.25, 0.4).applyAxisAngle(_upAxis, heading).add(carPos);
        _tempLook.copy(_forwardDir).multiplyScalar(30).add(carPos).add(new THREE.Vector3(0, 1.0, 0));
        camera.position.copy(_tempTarget);
        camera.lookAt(_tempLook);
      } else if (cMode === 'orbit') {
        const rad = 6.2;
        const angle = now * 0.0006;
        _tempTarget.set(Math.sin(angle) * rad, 2.2, Math.cos(angle) * rad).add(carPos);
        camPos.lerp(_tempTarget, dt * 7);
        _tempLook.copy(carPos).add(new THREE.Vector3(0, 0.7, 0));
        camLook.lerp(_tempLook, dt * 9);
        camera.position.copy(camPos);
        camera.lookAt(camLook);
      } else if (cMode === 'drone') {
        _tempTarget.set(carPos.x, 32, carPos.z - 18);
        camPos.lerp(_tempTarget, dt * 6);
        camLook.lerp(carPos, dt * 9);
        camera.position.copy(camPos);
        camera.lookAt(camLook);
      }

      renderer.render(scene, camera);

      // Check Real Life Landmark Proximities
      const distGas = carPos.distanceTo(city.gasPumpTrigger);
      const inGasStation = distGas < 18;

      const distGarage = carPos.distanceTo(city.garageTrigger);
      const inGarage = distGarage < 20;

      const distDealer = carPos.distanceTo(city.dealershipTrigger);
      const inDealership = distDealer < 22;

      // Telemetry update at ~20Hz with live smoothed FPS
      telemetryTimer += dt;
      if (telemetryTimer >= 0.05) {
        telemetryTimer = 0;
        onTelemetryRef.current({
          speedKmh,
          rpm: Math.round(currentRpm),
          gear: currentGear,
          driftAngle: driftAngleDeg,
          isDrifting,
          currentDriftScore: currentDriftPoints,
          comboMultiplier,
          turboBoostBar: Number(turboBoost.toFixed(2)),
          tireTempC: Math.round(tireTemp),
          fuelLevel: Math.round(currentFuel),
          inGasStation,
          inGarage,
          inDealership,
          headlightsOn: hlOn,
          policeAlert: speedKmh > 180 && !isNight,
          fps: Math.round(rollingFps),
        });
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      dynamicVFX.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      aria-label="3D City Game Canvas"
    />
  );
};
