import * as THREE from 'three';

export interface TrafficCar {
  root: THREE.Group;
  speed: number;
  direction: number; // 1 or -1
  axis: 'x' | 'z';
  minCoord: number;
  maxCoord: number;
  laneCoord: number;
}

export interface CityWorld {
  group: THREE.Group;
  trafficCars: TrafficCar[];
  streetLamps: THREE.Group;
  gasPumpTrigger: THREE.Vector3;
  garageTrigger: THREE.Vector3;
  dealershipTrigger: THREE.Vector3;
}

export function buildOpenWorldCity(): CityWorld {
  const group = new THREE.Group();

  // Materials
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x141822,
    roughness: 0.45,
    metalness: 0.2,
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.8,
    metalness: 0.1,
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.7,
  });

  const glassBuildingMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.12,
    transmission: 0.4,
    transparent: true,
  });

  const windowLitMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
  });

  // 1. Large Ground Base
  const baseGround = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: 0x080b12, roughness: 0.9 })
  );
  baseGround.rotation.x = -Math.PI / 2;
  baseGround.position.y = -0.05;
  baseGround.receiveShadow = true;
  group.add(baseGround);

  // 2. City Road Network (Main Avenues & Crossroads)
  // Major Crossroads: Avenue X (z = 0, z = 70, z = -70) and Avenue Z (x = 0, x = 70, x = -70)
  const roadWidth = 18;
  const roadGeoX = new THREE.PlaneGeometry(500, roadWidth);
  roadGeoX.rotateX(-Math.PI / 2);

  const roadGeoZ = new THREE.PlaneGeometry(roadWidth, 500);
  roadGeoZ.rotateX(-Math.PI / 2);

  [-70, 0, 70].forEach((coord) => {
    // X Roads
    const roadX = new THREE.Mesh(roadGeoX, asphaltMat);
    roadX.position.set(0, 0.01, coord);
    roadX.receiveShadow = true;
    group.add(roadX);

    // Z Roads
    const roadZ = new THREE.Mesh(roadGeoZ, asphaltMat);
    roadZ.position.set(coord, 0.01, 0);
    roadZ.receiveShadow = true;
    group.add(roadZ);
  });

  // Road Lane Dividers (Yellow & White Dashed)
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const dashGeoX = new THREE.PlaneGeometry(3.5, 0.35);
  dashGeoX.rotateX(-Math.PI / 2);

  for (let x = -240; x <= 240; x += 12) {
    [-70, 0, 70].forEach((zCoord) => {
      const d1 = new THREE.Mesh(dashGeoX, dashMat);
      d1.position.set(x, 0.02, zCoord);
      group.add(d1);
    });
  }

  // Sidewalks
  const blockW = 52;
  const blockPositions = [
    { x: -35, z: -35 },
    { x: 35, z: -35 },
    { x: -35, z: 35 },
    { x: 35, z: 35 },
    { x: -105, z: -35 },
    { x: 105, z: -35 },
    { x: -105, z: 35 },
    { x: 105, z: 35 },
  ];

  blockPositions.forEach((bp) => {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(blockW, 0.25, blockW), sidewalkMat);
    sw.position.set(bp.x, 0.12, bp.z);
    sw.receiveShadow = true;
    group.add(sw);
  });

  // 3. Central Drift Plaza at (0, 0)
  const plazaGeo = new THREE.CylinderGeometry(28, 28, 0.1, 48);
  const plazaMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.3 });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, 0.02, 0);
  group.add(plaza);

  // Central Illuminated Drift Monument
  const monument = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 2.2, 12, 16),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.6 })
  );
  monument.position.set(0, 6, 0);
  group.add(monument);

  // 4. Real Life Landmark 1: Shell Gas Station (Zapravka) at (35, 25)
  const gasStationGroup = new THREE.Group();
  gasStationGroup.position.set(35, 0, 25);

  // Canopy
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(22, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, metalness: 0.5 })
  );
  canopy.position.set(0, 5.5, 0);
  gasStationGroup.add(canopy);

  // Shell Brand Sign
  const shellSign = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 0.5 })
  );
  shellSign.position.set(0, 5.5, 8.05);
  gasStationGroup.add(shellSign);

  // Support Pillars
  [-8, 8].forEach((px) => {
    [-5, 5].forEach((pz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.5, 12), curbMat);
      col.position.set(px, 2.75, pz);
      gasStationGroup.add(col);
    });
  });

  // Fuel Pumps (2 fuel pump islands)
  [-4, 4].forEach((px) => {
    const pumpIsland = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.3, 7.0),
      curbMat
    );
    pumpIsland.position.set(px, 0.15, 0);
    gasStationGroup.add(pumpIsland);

    const pump = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 2.1, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4 })
    );
    pump.position.set(px, 1.2, 0);
    gasStationGroup.add(pump);
  });

  // Fuel Station Shop Building
  const gasShop = new THREE.Mesh(
    new THREE.BoxGeometry(16, 4.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  gasShop.position.set(0, 2.25, -12);
  gasStationGroup.add(gasShop);
  group.add(gasStationGroup);

  // 5. Real Life Landmark 2: Apex Custom Tuning Garage at (-45, 65)
  const garageGroup = new THREE.Group();
  garageGroup.position.set(-45, 0, 65);

  const garageBldg = new THREE.Mesh(
    new THREE.BoxGeometry(26, 6.5, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 })
  );
  garageBldg.position.set(0, 3.25, 0);
  garageGroup.add(garageBldg);

  // Shutter Doors
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  [-6, 6].forEach((sx) => {
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(7, 4.2, 0.2), shutterMat);
    shutter.position.set(sx, 2.1, 10.1);
    garageGroup.add(shutter);
  });

  // Neon Garage Sign
  const garageSign = new THREE.Mesh(
    new THREE.BoxGeometry(14, 1.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 })
  );
  garageSign.position.set(0, 5.2, 10.15);
  garageGroup.add(garageSign);
  group.add(garageGroup);

  // 6. Real Life Landmark 3: Premium Autosalon (Dealership) at (75, -70)
  const dealerGroup = new THREE.Group();
  dealerGroup.position.set(75, 0, -70);

  const showroom = new THREE.Mesh(
    new THREE.BoxGeometry(28, 7.5, 24),
    glassBuildingMat
  );
  showroom.position.set(0, 3.75, 0);
  dealerGroup.add(showroom);

  const dealerRoof = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.8, 26),
    new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 })
  );
  dealerRoof.position.set(0, 7.8, 0);
  dealerGroup.add(dealerRoof);

  // Neon Autosalon Billboard
  const dealerSign = new THREE.Mesh(
    new THREE.BoxGeometry(16, 1.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 2.5 })
  );
  dealerSign.position.set(0, 6.2, 12.1);
  dealerGroup.add(dealerSign);
  group.add(dealerGroup);

  // 7. City Skyscrapers & Commercial High-Rises
  const bldgConfigs = [
    { x: -35, z: -35, w: 22, h: 58, d: 24, col: 0x1e293b },
    { x: 35, z: -35, w: 24, h: 75, d: 22, col: 0x0f172a },
    { x: -35, z: 35, w: 20, h: 46, d: 20, col: 0x1e293b },
    { x: 105, z: 35, w: 26, h: 88, d: 26, col: 0x0f172a },
    { x: -105, z: -35, w: 24, h: 64, d: 24, col: 0x1e293b },
    { x: -105, z: 35, w: 22, h: 52, d: 22, col: 0x0f172a },
    { x: 105, z: -35, w: 28, h: 96, d: 26, col: 0x1e293b },
  ];

  bldgConfigs.forEach((bc) => {
    const bldg = new THREE.Mesh(
      new THREE.BoxGeometry(bc.w, bc.h, bc.d),
      new THREE.MeshStandardMaterial({ color: bc.col, roughness: 0.3, metalness: 0.6 })
    );
    bldg.position.set(bc.x, bc.h * 0.5 + 0.25, bc.z);
    bldg.receiveShadow = true;
    group.add(bldg);

    // Glowing window strips
    for (let f = 4; f < bc.h - 4; f += 5) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(bc.w * 0.85, 1.4, bc.d + 0.1),
        windowLitMat
      );
      win.position.set(bc.x, f, bc.z);
      group.add(win);
    }
  });

  // 8. Streetlights along Avenues
  const streetLamps = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  const lampPositions: THREE.Vector3[] = [];

  for (let x = -180; x <= 180; x += 45) {
    lampPositions.push(new THREE.Vector3(x, 0, 11));
    lampPositions.push(new THREE.Vector3(x, 0, -11));
  }
  for (let z = -180; z <= 180; z += 45) {
    lampPositions.push(new THREE.Vector3(11, 0, z));
    lampPositions.push(new THREE.Vector3(-11, 0, z));
  }

  lampPositions.forEach((lp) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 7.5, 8), poleMat);
    pole.position.set(lp.x, 3.75, lp.z);
    streetLamps.add(pole);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.25, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    head.position.set(lp.x, 7.4, lp.z);
    streetLamps.add(head);
  });
  group.add(streetLamps);

  // 9. Palm Trees along Avenues
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d });

  for (let x = -160; x <= 160; x += 40) {
    if (Math.abs(x) < 25) continue;
    const tree = new THREE.Group();
    tree.position.set(x, 0, 14);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 6, 8), trunkMat);
    trunk.position.y = 3;
    tree.add(trunk);

    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), leafMat);
    foliage.position.y = 6.2;
    tree.add(foliage);

    group.add(tree);
  }

  // 10. AI Traffic Cars
  const trafficColors = [0xef4444, 0x3b82f6, 0xe2e8f0, 0x10b981, 0xf59e0b, 0x8b5cf6];
  const trafficCars: TrafficCar[] = [];

  const trafficRoutes: {
    axis: 'x' | 'z';
    laneCoord: number;
    minCoord: number;
    maxCoord: number;
    direction: number;
    startCoord: number;
  }[] = [
    { axis: 'x', laneCoord: -4.5, minCoord: -200, maxCoord: 200, direction: 1, startCoord: -120 },
    { axis: 'x', laneCoord: 4.5, minCoord: -200, maxCoord: 200, direction: -1, startCoord: 80 },
    { axis: 'x', laneCoord: 65.5, minCoord: -180, maxCoord: 180, direction: 1, startCoord: -60 },
    { axis: 'z', laneCoord: -4.5, minCoord: -200, maxCoord: 200, direction: 1, startCoord: -100 },
    { axis: 'z', laneCoord: 4.5, minCoord: -200, maxCoord: 200, direction: -1, startCoord: 90 },
    { axis: 'z', laneCoord: -74.5, minCoord: -180, maxCoord: 180, direction: -1, startCoord: 40 },
  ];

  trafficRoutes.forEach((route, idx) => {
    const tCarRoot = new THREE.Group();
    const tColor = trafficColors[idx % trafficColors.length];

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.65, 4.1),
      new THREE.MeshStandardMaterial({ color: tColor, metalness: 0.5, roughness: 0.3 })
    );
    body.position.y = 0.55;
    tCarRoot.add(body);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    roof.position.set(0, 1.05, -0.2);
    tCarRoot.add(roof);

    // Headlights & Taillights
    const tHead = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.15, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    tHead.position.set(0, 0.55, 2.06);
    tCarRoot.add(tHead);

    const tTail = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.15, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    tTail.position.set(0, 0.55, -2.06);
    tCarRoot.add(tTail);

    if (route.axis === 'x') {
      tCarRoot.position.set(route.startCoord, 0, route.laneCoord);
      tCarRoot.rotation.y = route.direction === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      tCarRoot.position.set(route.laneCoord, 0, route.startCoord);
      tCarRoot.rotation.y = route.direction === 1 ? 0 : Math.PI;
    }

    group.add(tCarRoot);

    trafficCars.push({
      root: tCarRoot,
      speed: 12 + Math.random() * 6,
      direction: route.direction,
      axis: route.axis,
      minCoord: route.minCoord,
      maxCoord: route.maxCoord,
      laneCoord: route.laneCoord,
    });
  });

  return {
    group,
    trafficCars,
    streetLamps,
    gasPumpTrigger: new THREE.Vector3(35, 0, 25),
    garageTrigger: new THREE.Vector3(-45, 0, 65),
    dealershipTrigger: new THREE.Vector3(75, 0, -70),
  };
}
