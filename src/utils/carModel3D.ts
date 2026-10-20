import * as THREE from 'three';
import { CarStats } from '../types/game';

export interface WheelAssembly {
  root: THREE.Group;
  steerGroup: THREE.Group;
  camberGroup: THREE.Group;
  spinGroup: THREE.Group;
  brakeDiscMat: THREE.MeshStandardMaterial;
  rimMat: THREE.MeshStandardMaterial;
  isFront: boolean;
  isLeft: boolean;
}

export interface RealisticCarRig {
  root: THREE.Group;
  chassisGroup: THREE.Group;
  hoodPivot: THREE.Group;
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
  steeringWheelMesh: THREE.Group;
  coolingFanMesh: THREE.Group;
  gtWing: THREE.Group;
  ducktail: THREE.Mesh;
  wheels: WheelAssembly[];
  bodyMat: THREE.MeshPhysicalMaterial;
  neonMat: THREE.MeshStandardMaterial;
  neonLight: THREE.PointLight;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
  headlightCones: THREE.Group;
  tailLightMat: THREE.MeshStandardMaterial;
  flameL: THREE.Mesh;
  flameR: THREE.Mesh;
  flameLight: THREE.PointLight;
  cockpitCamAnchor: THREE.Group;
}

export function buildRealisticCarRig(stats: CarStats): RealisticCarRig {
  const root = new THREE.Group();
  const chassisGroup = new THREE.Group();
  root.add(chassisGroup);

  // Materials
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(stats.bodyColor),
    metalness: 0.75,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x11141c,
    metalness: 0.5,
    roughness: 0.35,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x080b11,
    metalness: 0.3,
    roughness: 0.7,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a101d,
    metalness: 0.15,
    roughness: 0.06,
    transmission: 0.6,
    transparent: true,
    opacity: 0.82,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.12,
  });

  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: new THREE.Color(0xef4444),
    emissiveIntensity: 2.0,
  });

  const neonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(stats.neonColor),
    emissive: new THREE.Color(stats.neonColor),
    emissiveIntensity: stats.neonEnabled ? 3.0 : 0,
  });

  // Main Chassis geometry tailored by car model
  const idLower = (stats.id || '').toLowerCase();
  const modelLower = (stats.model || '').toLowerCase();

  const isBMW = idLower === 'bmw_m4' || modelLower.includes('bmw') || modelLower.includes('m4');
  const isPorsche = idLower === 'porsche_gt3rs' || modelLower.includes('porsche') || modelLower.includes('gt3') || modelLower.includes('911');
  const isGTR = idLower === 'gtr_r35' || modelLower.includes('gtr') || modelLower.includes('r35');
  const isAMG = idLower === 'amg_gtr' || modelLower.includes('amg') || modelLower.includes('mercedes');
  const isSupra = idLower === 'supra_mk4' || modelLower.includes('supra');
  const isSilvia = idLower === 'silvia_s15' || modelLower.includes('silvia');

  const carLength = isGTR ? 4.65 : isAMG ? 4.6 : isSupra ? 4.52 : isPorsche ? 4.45 : isBMW ? 4.46 : 4.38;
  const carWidth = isGTR ? 2.06 : isPorsche ? 2.04 : isBMW ? 2.05 : isAMG ? 2.02 : 1.98;

  // Dedicated Accent Materials
  const nismoRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.2 });
  const burntTitaniumMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.15 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });

  // Lower Body Tub
  const lowerBody = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth, 0.46, carLength),
    bodyMat
  );
  lowerBody.position.set(0, 0.5, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  chassisGroup.add(lowerBody);

  // Aerodynamic Front Nose
  const frontNose = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth - (isPorsche ? 0.12 : 0.08), 0.36, 1.25),
    bodyMat
  );
  frontNose.position.set(0, 0.44, carLength * 0.4);
  frontNose.rotation.x = isPorsche ? 0.18 : 0.12;
  frontNose.castShadow = true;
  chassisGroup.add(frontNose);

  // Front Carbon Splitter + Canards
  const frontSplitter = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth + 0.15, 0.06, 0.65),
    carbonMat
  );
  frontSplitter.position.set(0, 0.22, carLength * 0.5 + 0.1);
  chassisGroup.add(frontSplitter);

  // Nismo Red Pinstripe on Splitter (for GT-R Nismo)
  if (isGTR) {
    const redStripe = new THREE.Mesh(
      new THREE.BoxGeometry(carWidth + 0.17, 0.02, 0.04),
      nismoRedMat
    );
    redStripe.position.set(0, 0.22, carLength * 0.5 + 0.42);
    chassisGroup.add(redStripe);

    // Front Bumper Dive Planes (Canards)
    [-1, 1].forEach((dir) => {
      const canard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.28), carbonMat);
      canard.position.set(dir * (carWidth * 0.5 + 0.08), 0.38, carLength * 0.5 - 0.05);
      canard.rotation.z = dir * 0.35;
      canard.rotation.y = dir * 0.2;
      chassisGroup.add(canard);
    });
  }

  // Front Radiator Grille by Model
  if (isBMW) {
    // Iconic BMW Twin Vertical Kidney Grilles with horizontal slats
    [-0.32, 0.32].forEach((kx) => {
      const kidney = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.42, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
      );
      kidney.position.set(kx, 0.42, carLength * 0.5 + 0.04);
      chassisGroup.add(kidney);

      for (let s = -0.16; s <= 0.16; s += 0.08) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 0.14), chromeMat);
        slat.position.set(kx + s, 0.42, carLength * 0.5 + 0.05);
        chassisGroup.add(slat);
      }
    });
  } else if (isGTR) {
    // Aggressive GT-R V-Motion Grille
    const vGrille = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.36, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.3, metalness: 0.7 })
    );
    vGrille.position.set(0, 0.38, carLength * 0.5 + 0.03);
    chassisGroup.add(vGrille);

    const vChrome = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.16), chromeMat);
    vChrome.position.set(0, 0.44, carLength * 0.5 + 0.04);
    chassisGroup.add(vChrome);

    const gtrBadge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.18), nismoRedMat);
    gtrBadge.position.set(0, 0.39, carLength * 0.5 + 0.05);
    chassisGroup.add(gtrBadge);
  } else if (isPorsche) {
    // Porsche 911 GT3 RS low central radiator mouth
    const pGrille = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.25, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.4, metalness: 0.6 })
    );
    pGrille.position.set(0, 0.32, carLength * 0.5 + 0.02);
    chassisGroup.add(pGrille);
  } else if (isAMG) {
    // Panamericana Vertical Chrome Grille
    const amgGrille = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.32, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
    );
    amgGrille.position.set(0, 0.38, carLength * 0.5 + 0.03);
    chassisGroup.add(amgGrille);

    for (let s = -0.5; s <= 0.5; s += 0.08) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.28, 0.14), chromeMat);
      slat.position.set(s, 0.38, carLength * 0.5 + 0.04);
      chassisGroup.add(slat);
    }
  } else if (isSupra) {
    // Supra MK4 Wide Intercooler Mouth with Polished Core
    const icMouth = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.3, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.5 })
    );
    icMouth.position.set(0, 0.35, carLength * 0.5 + 0.02);
    chassisGroup.add(icMouth);

    const intercooler = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.24, 0.06),
      chromeMat
    );
    intercooler.position.set(0, 0.35, carLength * 0.5 + 0.01);
    chassisGroup.add(intercooler);
  } else {
    // Silvia / Generic Sport Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 0.1), chromeMat);
    grille.position.set(0, 0.36, carLength * 0.5 + 0.02);
    chassisGroup.add(grille);
  }

  // Widebody Fender Overfenders
  const flareZ = carLength * 0.32;
  [-1, 1].forEach((dir) => {
    // Front flares
    const fFlare = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 1.05), bodyMat);
    fFlare.position.set(dir * (carWidth * 0.5 + 0.05), 0.52, flareZ);
    fFlare.castShadow = true;
    chassisGroup.add(fFlare);

    // Front Fender Aero Louvers (Porsche 911 GT3 RS Signature Feature!)
    if (isPorsche) {
      for (let l = -0.18; l <= 0.18; l += 0.09) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.06), carbonMat);
        louver.position.set(dir * (carWidth * 0.5 + 0.05), 0.74, flareZ + l);
        louver.rotation.z = dir * 0.25;
        louver.rotation.x = 0.2;
        chassisGroup.add(louver);
      }
    }

    // Rear flares (GT3 RS & GTR have extra wide muscular rear haunches)
    const rFlare = new THREE.Mesh(
      new THREE.BoxGeometry(isPorsche || isGTR ? 0.22 : 0.18, 0.44, 1.15),
      bodyMat
    );
    rFlare.position.set(dir * (carWidth * 0.5 + (isPorsche || isGTR ? 0.08 : 0.06)), 0.54, -flareZ);
    rFlare.castShadow = true;
    chassisGroup.add(rFlare);

    // Carbon Side Skirts (With Nismo red accent stripe for GT-R)
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, carLength * 0.55), carbonMat);
    skirt.position.set(dir * (carWidth * 0.5 + 0.04), 0.24, 0);
    chassisGroup.add(skirt);

    if (isGTR) {
      const skirtStripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, carLength * 0.55), nismoRedMat);
      skirtStripe.position.set(dir * (carWidth * 0.5 + 0.09), 0.22, 0);
      chassisGroup.add(skirtStripe);
    }
  });

  // Carbon Diffuser & Rear Bumper
  const diffuser = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth - 0.1, 0.16, 0.4),
    carbonMat
  );
  diffuser.position.set(0, 0.26, -carLength * 0.5);
  chassisGroup.add(diffuser);

  // 3D Engine Bay (Revealed when hood opens) - Distinct Real Motors
  const engineBay = new THREE.Group();
  engineBay.position.set(0, 0.52, carLength * 0.3);
  chassisGroup.add(engineBay);

  const bayFloor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.2), darkTrimMat);
  engineBay.add(bayFloor);

  if (isPorsche) {
    // 4.0L High-Revving 9,000 RPM Flat-6 (Weissach Aero Carbon Package)
    const flat6Block = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.22, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
    );
    flat6Block.position.set(0, 0.14, 0);
    engineBay.add(flat6Block);

    // Dual Carbon Intake Plenums
    [-0.28, 0.28].forEach((px) => {
      const plenum = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.45), carbonMat);
      plenum.position.set(px, 0.26, -0.05);
      engineBay.add(plenum);
    });

    // Weissach Gold/Yellow Oil Filler Cap & Coolant Tank
    const oilCap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), goldMat);
    oilCap.position.set(0.35, 0.32, 0.18);
    engineBay.add(oilCap);

    // Weissach Carbon Fiber Strut Cross-Brace
    const brace1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 8), carbonMat);
    brace1.rotation.z = Math.PI / 4;
    brace1.position.set(0, 0.35, 0);
    engineBay.add(brace1);
    const brace2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 8), carbonMat);
    brace2.rotation.z = -Math.PI / 4;
    brace2.position.set(0, 0.35, 0);
    engineBay.add(brace2);
  } else if (isGTR) {
    // 3.8L VR38DETT Twin-Turbo V6 (Nismo Tuned)
    const vr38Block = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.32, 0.75),
      new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 })
    );
    vr38Block.position.set(0, 0.18, 0);
    engineBay.add(vr38Block);

    // Iconic Nismo Red Intake Manifold Runners
    [-0.2, 0.2].forEach((ix) => {
      const redRunner = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.65), nismoRedMat);
      redRunner.position.set(ix, 0.32, 0);
      engineBay.add(redRunner);
    });

    // Twin Polished Aluminum Boost Charge Pipes
    [-0.25, 0.25].forEach((px) => {
      const chargePipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12),
        chromeMat
      );
      chargePipe.rotation.x = Math.PI / 2;
      chargePipe.position.set(px, 0.26, 0.05);
      engineBay.add(chargePipe);
    });

    // Takumi Handcrafted Plaque
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.08), chromeMat);
    plaque.position.set(0, 0.34, 0.15);
    engineBay.add(plaque);
  } else if (isSupra) {
    // 2JZ-GTE Big Turbo Monster
    const jzBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.32, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
    );
    jzBlock.position.set(0, 0.16, 0);
    engineBay.add(jzBlock);

    // Giant Polished Garrett Turbocharger
    const bigTurbo = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 16), chromeMat);
    bigTurbo.rotation.z = Math.PI / 2;
    bigTurbo.position.set(-0.25, 0.28, -0.1);
    engineBay.add(bigTurbo);

    // Chrome Intercooler Piping & Strut Bar
    const jzPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.8, 12), chromeMat);
    jzPipe.rotation.x = Math.PI / 2;
    jzPipe.position.set(0.18, 0.26, 0);
    engineBay.add(jzPipe);

    const jzStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.45, 8), chromeMat);
    jzStrut.rotation.z = Math.PI / 2;
    jzStrut.position.set(0, 0.38, 0.12);
    engineBay.add(jzStrut);
  } else {
    // BMW S58 3.0L TwinPower Turbo Inline-6
    const engineBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.3, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    engineBlock.position.set(0, 0.16, 0);
    engineBay.add(engineBlock);

    const bmwEngineCover = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.08, 0.75),
      carbonMat
    );
    bmwEngineCover.position.set(0, 0.32, 0);
    engineBay.add(bmwEngineCover);

    // Iconic BMW ///M Tri-Color Stripes (Cyan, Dark Blue, Red)
    const mCyanMat = new THREE.MeshBasicMaterial({ color: 0x00a3e0 });
    const mNavyMat = new THREE.MeshBasicMaterial({ color: 0x002b49 });
    const mRedMat = new THREE.MeshBasicMaterial({ color: 0xe31b23 });

    const stripeCyan = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.082, 0.55), mCyanMat);
    stripeCyan.position.set(-0.06, 0.325, 0.05);
    engineBay.add(stripeCyan);

    const stripeNavy = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.082, 0.55), mNavyMat);
    stripeNavy.position.set(-0.015, 0.325, 0.05);
    engineBay.add(stripeNavy);

    const stripeRed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.082, 0.55), mRedMat);
    stripeRed.position.set(0.03, 0.325, 0.05);
    engineBay.add(stripeRed);

    // Aluminum Charge Pipes
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    [-0.18, 0.18].forEach((px) => {
      const chargePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.75, 12), pipeMat);
      chargePipe.rotation.x = Math.PI / 2;
      chargePipe.position.set(px, 0.28, -0.05);
      engineBay.add(chargePipe);
    });

    const strutBar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.48, 8), carbonMat);
    strutBar.rotation.z = Math.PI / 2;
    strutBar.position.set(0, 0.38, 0.12);
    engineBay.add(strutBar);
  }

  // Spinning Cooling Fan
  const coolingFanMesh = new THREE.Group();
  coolingFanMesh.position.set(0, 0.16, 0.52);
  for (let b = 0; b < 6; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.015), chromeMat);
    blade.rotation.z = (b * Math.PI) / 3;
    coolingFanMesh.add(blade);
  }
  engineBay.add(coolingFanMesh);

  // Openable Vented Hood
  const hoodPivot = new THREE.Group();
  hoodPivot.position.set(0, 0.72, carLength * 0.16);
  chassisGroup.add(hoodPivot);

  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth - 0.22, 0.05, carLength * 0.34),
    bodyMat
  );
  hood.position.set(0, 0.01, carLength * 0.17);
  hood.rotation.x = 0.08;
  hood.castShadow = true;
  hoodPivot.add(hood);

  // Hood Aerodynamic Vents / Ducts
  if (isPorsche) {
    // Dual Sunken GT3 RS Extraction Vents
    [-0.28, 0.28].forEach((vx) => {
      const pVent = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.42), carbonMat);
      pVent.position.set(vx, 0.028, carLength * 0.18);
      pVent.rotation.x = 0.08;
      hoodPivot.add(pVent);
    });
  } else if (isGTR) {
    // Dual NACA Cooling Ducts
    [-0.25, 0.25].forEach((vx) => {
      const nacaDuct = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.35), carbonMat);
      nacaDuct.position.set(vx, 0.028, carLength * 0.18);
      nacaDuct.rotation.x = 0.08;
      hoodPivot.add(nacaDuct);
    });
  } else {
    // Standard Performance Hood Vent
    const hoodVent = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.45), carbonMat);
    hoodVent.position.set(0, 0.025, carLength * 0.18);
    hoodVent.rotation.x = 0.08;
    hoodPivot.add(hoodVent);
  }

  // Cabin Glass & Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth - 0.42, 0.08, carLength * 0.32),
    bodyMat
  );
  roof.position.set(0, 1.22, -carLength * 0.08);
  roof.castShadow = true;
  chassisGroup.add(roof);

  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth - 0.38, 0.65, 0.04),
    glassMat
  );
  windshield.position.set(0, 0.98, carLength * 0.12);
  windshield.rotation.x = -0.82;
  chassisGroup.add(windshield);

  // Rear Window
  const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth - 0.4, 0.68, 0.04),
    glassMat
  );
  rearWindow.position.set(0, 0.96, -carLength * 0.28);
  rearWindow.rotation.x = 0.88;
  chassisGroup.add(rearWindow);

  // Interior Cockpit (Racing bucket seats, Roll cage & Steering Wheel)
  const interior = new THREE.Group();
  interior.position.set(0, 0.52, -0.05);
  chassisGroup.add(interior);

  // Bucket Seats
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  [-0.42, 0.42].forEach((sx) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.6, 0.14), seatMat);
    seat.position.set(sx, 0.3, -0.22);
    seat.rotation.x = -0.16;
    interior.add(seat);
  });

  // Dashboard & Steering Wheel
  const dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.42), darkTrimMat);
  dashboard.position.set(0, 0.28, 0.48);
  interior.add(dashboard);

  const steeringWheelMesh = new THREE.Group();
  steeringWheelMesh.position.set(-0.42, 0.36, 0.3);
  const steerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.02, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 })
  );
  steeringWheelMesh.add(steerRing);
  interior.add(steeringWheelMesh);

  // Cockpit Camera Anchor Point (inside driver's head position)
  const cockpitCamAnchor = new THREE.Group();
  cockpitCamAnchor.position.set(-0.42, 0.95, -0.1);
  chassisGroup.add(cockpitCamAnchor);

  // Openable Sport Scissor Doors
  const createDoor = (isLeft: boolean) => {
    const pivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    pivot.position.set(sign * (carWidth * 0.48), 0.72, carLength * 0.1);

    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, carLength * 0.28), bodyMat);
    doorPanel.position.set(0, -0.15, -carLength * 0.14);
    doorPanel.castShadow = true;
    pivot.add(doorPanel);

    const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.38, carLength * 0.24), glassMat);
    doorGlass.position.set(-sign * 0.05, 0.2, -carLength * 0.14);
    doorGlass.rotation.z = sign * 0.22;
    pivot.add(doorGlass);

    // Side Mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.12), bodyMat);
    mirror.position.set(sign * 0.12, 0.08, -0.05);
    pivot.add(mirror);

    chassisGroup.add(pivot);
    return pivot;
  };

  const leftDoorPivot = createDoor(true);
  const rightDoorPivot = createDoor(false);

  // Spoilers: Tailored Swan-Neck GT3 RS, Nismo GT-R, Supra Arched Hoop & M Ducktail
  const gtWing = new THREE.Group();
  gtWing.position.set(0, 0.82, -carLength * 0.45);
  chassisGroup.add(gtWing);

  if (isPorsche) {
    // Massive Porsche 911 GT3 RS Swan-Neck Wing (Top-Mounted Gooseneck Uprights)
    [-0.45, 0.45].forEach((ux) => {
      const gooseneck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, 0.24), carbonMat);
      gooseneck.position.set(ux, 0.26, 0.05);
      gooseneck.rotation.x = 0.25;
      gtWing.add(gooseneck);
    });
    // Curved Aerodynamic Main Airfoil Blade
    const rsBlade = new THREE.Mesh(new THREE.BoxGeometry(carWidth + 0.16, 0.06, 0.44), carbonMat);
    rsBlade.position.set(0, 0.52, -0.08);
    rsBlade.rotation.x = 0.18;
    rsBlade.castShadow = true;
    gtWing.add(rsBlade);

    // DRS Hydraulic Actuator Pod in Center
    const drsPod = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.16), carbonMat);
    drsPod.position.set(0, 0.54, -0.08);
    gtWing.add(drsPod);

    // Large Endplates
    [-1, 1].forEach((dir) => {
      const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.32, 0.48), carbonMat);
      endplate.position.set(dir * (carWidth * 0.5 + 0.08), 0.52, -0.08);
      gtWing.add(endplate);
    });
  } else if (isSupra) {
    // Iconic Curved Supra Arched Hoop Spoiler
    [-0.65, 0.65].forEach((ux) => {
      const archStalk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.18), bodyMat);
      archStalk.position.set(ux, 0.24, 0);
      archStalk.rotation.x = -0.15;
      gtWing.add(archStalk);
    });
    const supraHoop = new THREE.Mesh(new THREE.BoxGeometry(carWidth + 0.05, 0.07, 0.38), bodyMat);
    supraHoop.position.set(0, 0.48, -0.04);
    supraHoop.rotation.x = 0.14;
    gtWing.add(supraHoop);
  } else {
    // GT Wing Uprights
    [-0.58, 0.58].forEach((ux) => {
      const upright = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.38, 0.2), carbonMat);
      upright.position.set(ux, 0.16, 0);
      upright.rotation.x = -0.2;
      gtWing.add(upright);
    });
    const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(carWidth + 0.1, 0.05, 0.36), carbonMat);
    wingBlade.position.set(0, 0.35, -0.05);
    wingBlade.rotation.x = 0.15;
    wingBlade.castShadow = true;
    gtWing.add(wingBlade);

    // Endplates with Nismo Red trim if GT-R
    [-1, 1].forEach((dir) => {
      const ep = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.38), isGTR ? nismoRedMat : carbonMat);
      ep.position.set(dir * (carWidth * 0.5 + 0.05), 0.35, -0.05);
      gtWing.add(ep);
    });
  }

  const ducktail = new THREE.Mesh(
    new THREE.BoxGeometry(carWidth - 0.15, 0.16, 0.22),
    bodyMat
  );
  ducktail.position.set(0, 0.8, -carLength * 0.48);
  ducktail.rotation.x = -0.45;
  chassisGroup.add(ducktail);

  // Headlights & Taillights Tailored per Model
  if (isGTR) {
    // Iconic Quad Round Circular Halo LED Taillights (Two circular rings per side!)
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: new THREE.Color(0xff0000),
      emissiveIntensity: 3.5,
    });
    [-0.58, -0.38, 0.38, 0.58].forEach((rx) => {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 20), haloMat);
      halo.position.set(rx, 0.62, -carLength * 0.5 - 0.02);
      chassisGroup.add(halo);
    });
  } else if (isPorsche) {
    // Porsche Continuous Ultra-Slim 3D Full-Width LED Lightbar
    const pLightbar = new THREE.Mesh(
      new THREE.BoxGeometry(carWidth - 0.15, 0.05, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: new THREE.Color(0xff2222), emissiveIntensity: 3.8 })
    );
    pLightbar.position.set(0, 0.66, -carLength * 0.5 - 0.02);
    chassisGroup.add(pLightbar);
  } else if (isSupra) {
    // Supra MK4 Quad Circular Taillights inside tinted enclosure
    const podHousing = new THREE.Mesh(
      new THREE.BoxGeometry(carWidth - 0.22, 0.14, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.8 })
    );
    podHousing.position.set(0, 0.62, -carLength * 0.5 - 0.01);
    chassisGroup.add(podHousing);

    [-0.55, -0.4, 0.4, 0.55].forEach((cx) => {
      const cLight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16),
        tailLightMat
      );
      cLight.rotateX(Math.PI / 2);
      cLight.position.set(cx, 0.62, -carLength * 0.5 - 0.03);
      chassisGroup.add(cLight);
    });
  } else {
    // Standard Tail Light Bar
    const tailLightBar = new THREE.Mesh(
      new THREE.BoxGeometry(carWidth - 0.18, 0.12, 0.08),
      tailLightMat
    );
    tailLightBar.position.set(0, 0.62, -carLength * 0.5 - 0.01);
    chassisGroup.add(tailLightBar);
  }

  // Headlight Projectors by Model
  const hlGlowMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: new THREE.Color(isPorsche ? 0x67e8f9 : 0x38bdf8),
    emissiveIntensity: 3.5,
  });

  if (isPorsche) {
    // Porsche 4-Point Round PDLS Matrix LED Lenses
    [-0.65, 0.65].forEach((hx) => {
      const pLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 16), hlGlowMat);
      pLens.rotateX(Math.PI / 2.3);
      pLens.position.set(hx, 0.58, carLength * 0.48);
      chassisGroup.add(pLens);
    });
  } else {
    [-0.65, 0.65].forEach((hx) => {
      const lens = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.06), hlGlowMat);
      lens.position.set(hx, 0.54, carLength * 0.5 + 0.02);
      chassisGroup.add(lens);
    });
  }

  const headlightL = new THREE.SpotLight(0xe0f2fe, 6.0, 48, Math.PI / 5, 0.45, 1.2);
  headlightL.position.set(-0.65, 0.6, carLength * 0.5);
  headlightL.target.position.set(-1.0, 0, 18);
  chassisGroup.add(headlightL);
  chassisGroup.add(headlightL.target);

  const headlightR = new THREE.SpotLight(0xe0f2fe, 6.0, 48, Math.PI / 5, 0.45, 1.2);
  headlightR.position.set(0.65, 0.6, carLength * 0.5);
  headlightR.target.position.set(1.0, 0, 18);
  chassisGroup.add(headlightR);
  chassisGroup.add(headlightR.target);

  // Volumetric Headlight Beams
  const headlightCones = new THREE.Group();
  const coneGeo = new THREE.ConeGeometry(1.4, 7.5, 16, 1, true);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  [-0.65, 0.65].forEach((hx) => {
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(hx, 0.5, 6.2);
    headlightCones.add(cone);
  });
  chassisGroup.add(headlightCones);

  // Exhaust Tips Tailored per Model
  const exTipGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.28, 12);
  exTipGeo.rotateX(Math.PI / 2);

  if (isPorsche) {
    // Dual Central High-Exit Lightweight Titanium Round Pipes
    [-0.12, 0.12].forEach((tx) => {
      const tip = new THREE.Mesh(exTipGeo, burntTitaniumMat);
      tip.position.set(tx, 0.34, -carLength * 0.5 - 0.08);
      chassisGroup.add(tip);
    });
  } else if (isGTR) {
    // Quad Large-Bore Burnt Titanium Tips with Heat Anodized Blue Tint
    const gtrTipGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.3, 12);
    gtrTipGeo.rotateX(Math.PI / 2);
    [-0.62, -0.48, 0.48, 0.62].forEach((tx) => {
      const tip = new THREE.Mesh(gtrTipGeo, burntTitaniumMat);
      tip.position.set(tx, 0.28, -carLength * 0.5 - 0.1);
      chassisGroup.add(tip);
    });
  } else if (isSupra) {
    // Giant 5-inch Single Slant Cannon on Left Side
    const cannonGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.36, 16);
    cannonGeo.rotateX(Math.PI / 2);
    const cannon = new THREE.Mesh(cannonGeo, chromeMat);
    cannon.position.set(-0.55, 0.26, -carLength * 0.5 - 0.12);
    cannon.rotation.y = 0.15;
    chassisGroup.add(cannon);
  } else {
    // BMW M Quad Tips / Standard Dual
    [-0.58, -0.46, 0.46, 0.58].forEach((tx) => {
      const tip = new THREE.Mesh(exTipGeo, chromeMat);
      tip.position.set(tx, 0.28, -carLength * 0.5 - 0.1);
      chassisGroup.add(tip);
    });
  }

  // Exhaust Flames
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const flameGeo = new THREE.ConeGeometry(0.1, 0.7, 12);
  flameGeo.rotateX(-Math.PI / 2);

  const flameXOffset = isPorsche ? 0.12 : isSupra ? 0.55 : 0.54;

  const flameL = new THREE.Mesh(flameGeo, flameMat);
  flameL.position.set(-flameXOffset, isPorsche ? 0.34 : 0.28, -carLength * 0.5 - 0.4);
  chassisGroup.add(flameL);

  const flameR = new THREE.Mesh(flameGeo, flameMat);
  flameR.position.set(flameXOffset, isPorsche ? 0.34 : 0.28, -carLength * 0.5 - 0.4);
  chassisGroup.add(flameR);

  const flameLight = new THREE.PointLight(0xff6600, 0, 8);
  flameLight.position.set(0, 0.35, -carLength * 0.5 - 0.5);
  chassisGroup.add(flameLight);

  // Neon Underglow
  const neonLight = new THREE.PointLight(new THREE.Color(stats.neonColor), stats.neonEnabled ? 4.5 : 0, 6);
  neonLight.position.set(0, 0.18, 0);
  chassisGroup.add(neonLight);

  [-carWidth * 0.45, carWidth * 0.45].forEach((nx) => {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, carLength * 0.6), neonMat);
    tube.position.set(nx, 0.18, 0);
    chassisGroup.add(tube);
  });

  // 4 Articulated Wheels with Brake Discs & Calipers
  const wheels: WheelAssembly[] = [];
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.85, metalness: 0.05 });
  const caliperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });

  const wheelPositions = [
    { x: -carWidth * 0.48, z: carLength * 0.32, isFront: true, isLeft: true },
    { x: carWidth * 0.48, z: carLength * 0.32, isFront: true, isLeft: false },
    { x: -carWidth * 0.49, z: -carLength * 0.31, isFront: false, isLeft: true },
    { x: carWidth * 0.49, z: -carLength * 0.31, isFront: false, isLeft: false },
  ];

  wheelPositions.forEach((wp) => {
    const wheelRoot = new THREE.Group();
    wheelRoot.position.set(wp.x, 0.36, wp.z);
    root.add(wheelRoot);

    const steerGroup = new THREE.Group();
    wheelRoot.add(steerGroup);

    const camberGroup = new THREE.Group();
    steerGroup.add(camberGroup);

    // Glowing Brake Disc
    const brakeDiscMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.88,
      roughness: 0.22,
      emissive: new THREE.Color(0xff4500),
      emissiveIntensity: 0,
    });
    const discGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24);
    discGeo.rotateZ(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, brakeDiscMat);
    camberGroup.add(disc);

    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.12), caliperMat);
    caliper.position.set(wp.isLeft ? 0.03 : -0.03, 0.08, -0.14);
    camberGroup.add(caliper);

    // Spinning Wheel & Multi-spoke Rim
    const spinGroup = new THREE.Group();
    camberGroup.add(spinGroup);

    const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 28);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    spinGroup.add(tire);

    const rimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stats.rimColor),
      metalness: 0.9,
      roughness: 0.16,
    });

    // Deep dish rim barrel & 6 spokes
    const rimBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.31, 24, 1, true), rimMat);
    rimBarrel.rotateZ(Math.PI / 2);
    spinGroup.add(rimBarrel);

    for (let s = 0; s < 6; s++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.05), rimMat);
      spoke.rotation.x = (s * Math.PI) / 3;
      spoke.position.x = wp.isLeft ? -0.11 : 0.11;
      spinGroup.add(spoke);
    }

    wheels.push({
      root: wheelRoot,
      steerGroup,
      camberGroup,
      spinGroup,
      brakeDiscMat,
      rimMat,
      isFront: wp.isFront,
      isLeft: wp.isLeft,
    });
  });

  const rig: RealisticCarRig = {
    root,
    chassisGroup,
    hoodPivot,
    leftDoorPivot,
    rightDoorPivot,
    steeringWheelMesh,
    coolingFanMesh,
    gtWing,
    ducktail,
    wheels,
    bodyMat,
    neonMat,
    neonLight,
    headlightL,
    headlightR,
    headlightCones,
    tailLightMat,
    flameL,
    flameR,
    flameLight,
    cockpitCamAnchor,
  };

  updateCarRigStyles(rig, stats);
  return rig;
}

export function updateCarRigStyles(rig: RealisticCarRig, stats: CarStats) {
  rig.bodyMat.color.set(stats.bodyColor);
  rig.gtWing.visible = stats.spoiler === 'gt_wing';
  rig.ducktail.visible = stats.spoiler === 'ducktail';

  rig.neonMat.color.set(stats.neonColor);
  rig.neonMat.emissive.set(stats.neonColor);
  rig.neonMat.emissiveIntensity = stats.neonEnabled ? 3.0 : 0;
  rig.neonLight.color.set(stats.neonColor);
  rig.neonLight.intensity = stats.neonEnabled ? 4.5 : 0;

  const camberRad = THREE.MathUtils.degToRad(stats.camberAngle);
  rig.wheels.forEach((w) => {
    w.rimMat.color.set(stats.rimColor);
    w.camberGroup.rotation.z = w.isLeft ? -camberRad : camberRad;
  });
}
