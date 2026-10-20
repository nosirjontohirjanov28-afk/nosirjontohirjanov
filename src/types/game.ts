export type CarId = 'bmw_m4' | 'porsche_gt3rs' | 'gtr_r35' | 'silvia_s15' | 'amg_gtr' | 'supra_mk4' | (string & {});
export type CameraMode = 'chase' | 'dynamic_drift' | 'cockpit' | 'hood' | 'orbit' | 'drone';
export type DayNightTime = 'day' | 'sunset' | 'night';

export interface CarStats {
  id: CarId;
  name: string;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  engine: string;
  horsePower: number;
  topSpeedKmh: number;
  driftGrip: number; // 0.4 to 0.85
  bodyColor: string;
  rimColor: string;
  neonColor: string;
  neonEnabled: boolean;
  spoiler: 'gt_wing' | 'ducktail' | 'none';
  hoodOpen: boolean;
  doorsOpen: boolean;
  camberAngle: number;
  rideHeight: number;
  turboStage: 1 | 2 | 3;
}

export interface PlayerState {
  cash: number;
  currentCarId: CarId;
  ownedCarIds: CarId[];
  fuel: number; // 0 to 100%
  mileageKm: number;
  totalDriftScore: number;
  reputation: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'drift' | 'delivery' | 'taxi' | 'race';
  rewardCash: number;
  rewardRep: number;
  targetLocation: { x: number; z: number; name: string };
  timeLimitSec?: number;
  targetDriftScore?: number;
}

export interface Landmark {
  id: string;
  name: string;
  type: 'gas_station' | 'garage' | 'dealership' | 'plaza' | 'race_track';
  position: { x: number; z: number };
  color: string;
}

export interface Telemetry {
  speedKmh: number;
  rpm: number;
  gear: number;
  driftAngle: number;
  isDrifting: boolean;
  currentDriftScore: number;
  comboMultiplier: number;
  turboBoostBar: number;
  tireTempC: number;
  fuelLevel: number;
  inGasStation: boolean;
  inGarage: boolean;
  inDealership: boolean;
  headlightsOn: boolean;
  policeAlert: boolean;
  fps: number;
}

export const CAR_CATALOG: Record<CarId, CarStats> = {
  bmw_m4: {
    id: 'bmw_m4',
    name: 'BMW M4 Competition G82 (M Power)',
    manufacturer: 'BMW M Motorsport',
    model: 'M4 Competition G82',
    year: 2024,
    price: 0, // Primary starter car
    engine: '3.0L BMW S58 TwinPower Turbo I6',
    horsePower: 720,
    topSpeedKmh: 310,
    driftGrip: 0.58,
    bodyColor: '#3B82F6',
    rimColor: '#1E293B',
    neonColor: '#3B82F6',
    neonEnabled: true,
    spoiler: 'ducktail',
    hoodOpen: false,
    doorsOpen: false,
    camberAngle: -6,
    rideHeight: -0.05,
    turboStage: 2,
  },
  porsche_gt3rs: {
    id: 'porsche_gt3rs',
    name: 'Porsche 911 GT3 RS (Weissach Aero)',
    manufacturer: 'Porsche Motorsport',
    model: '911 GT3 RS (992)',
    year: 2024,
    price: 85000,
    engine: '4.0L High-Revving Flat-6 (9,000 RPM)',
    horsePower: 585,
    topSpeedKmh: 320,
    driftGrip: 0.63,
    bodyColor: '#0284C7', // Shark Blue with exposed carbon accents
    rimColor: '#DC2626', // Pyro Red Lightweight Magnesium Wheels
    neonColor: '#0284C7',
    neonEnabled: true,
    spoiler: 'gt_wing',
    hoodOpen: false,
    doorsOpen: false,
    camberAngle: -5,
    rideHeight: -0.06,
    turboStage: 2,
  },
  gtr_r35: {
    id: 'gtr_r35',
    name: 'Nissan GT-R Nismo Special Edition R35',
    manufacturer: 'Nissan Nismo',
    model: 'GT-R Nismo (R35)',
    year: 2024,
    price: 110000,
    engine: '3.8L VR38DETT Twin-Turbo V6 (Nismo Tuned)',
    horsePower: 860,
    topSpeedKmh: 340,
    driftGrip: 0.60,
    bodyColor: '#64748B', // Stealth Nismo Gray with exposed carbon accents
    rimColor: '#0F172A', // Rays 20-inch Forged Lightweight Wheels
    neonColor: '#EF4444',
    neonEnabled: true,
    spoiler: 'gt_wing',
    hoodOpen: false,
    doorsOpen: false,
    camberAngle: -5,
    rideHeight: -0.06,
    turboStage: 3,
  },
  silvia_s15: {
    id: 'silvia_s15',
    name: 'Silvia S15 Spec-R Drift',
    manufacturer: 'Nissan JDM',
    model: 'Silvia Spec-R (S15)',
    year: 2002,
    price: 25000,
    engine: 'SR20DET 2.0L Turbo',
    horsePower: 520,
    topSpeedKmh: 245,
    driftGrip: 0.58,
    bodyColor: '#F59E0B',
    rimColor: '#E2E8F0',
    neonColor: '#06B6D4',
    neonEnabled: true,
    spoiler: 'gt_wing',
    hoodOpen: false,
    doorsOpen: false,
    camberAngle: -7,
    rideHeight: -0.05,
    turboStage: 2,
  },
  amg_gtr: {
    id: 'amg_gtr',
    name: 'AMG GT-R Green Hell',
    manufacturer: 'Mercedes-AMG',
    model: 'AMG GT-R Coupe',
    year: 2020,
    price: 65000,
    engine: '4.0L V8 Biturbo',
    horsePower: 790,
    topSpeedKmh: 315,
    driftGrip: 0.60,
    bodyColor: '#10B981',
    rimColor: '#0F172A',
    neonColor: '#10B981',
    neonEnabled: true,
    spoiler: 'gt_wing',
    hoodOpen: false,
    doorsOpen: false,
    camberAngle: -6,
    rideHeight: -0.06,
    turboStage: 3,
  },
  supra_mk4: {
    id: 'supra_mk4',
    name: 'Supra MK4 2JZ Monster',
    manufacturer: 'Toyota Racing',
    model: 'Supra RZ (A80)',
    year: 1998,
    price: 98000,
    engine: '3.0L 2JZ-GTE Big Turbo',
    horsePower: 1050,
    topSpeedKmh: 345,
    driftGrip: 0.54,
    bodyColor: '#EF4444',
    rimColor: '#F59E0B',
    neonColor: '#EF4444',
    neonEnabled: true,
    spoiler: 'gt_wing',
    hoodOpen: false,
    doorsOpen: false,
    camberAngle: -8,
    rideHeight: -0.07,
    turboStage: 3,
  },
};

export const CITY_LANDMARKS: Landmark[] = [
  { id: 'gas_1', name: 'Shell Yoqilg‘i Shoxobchasi (Zapravka)', type: 'gas_station', position: { x: 35, z: 25 }, color: '#EAB308' },
  { id: 'gas_2', name: 'Lukoil Markaziy Zapravka', type: 'gas_station', position: { x: -85, z: -40 }, color: '#EAB308' },
  { id: 'garage_1', name: 'Apex Custom Tyuning Garaji', type: 'garage', position: { x: -45, z: 65 }, color: '#3B82F6' },
  { id: 'dealer_1', name: 'Premium Avtosalon (Moshina Bozor)', type: 'dealership', position: { x: 75, z: -70 }, color: '#10B981' },
  { id: 'plaza_1', name: 'Shahar Markaziy Maydoni (Drift Zona)', type: 'plaza', position: { x: 0, z: 0 }, color: '#F97316' },
  { id: 'track_1', name: 'Tungi Touge Tog‘ Yo‘li', type: 'race_track', position: { x: -120, z: 110 }, color: '#A855F7' },
];

export const CITY_MISSIONS: Mission[] = [
  {
    id: 'mis_drift_1',
    title: 'Markaziy Maydonda Drift Show',
    description: 'Shahar markazidagi aylanma maydonda 5,000 ball to‘plang va muxlislarni hayratda qoldiring.',
    category: 'drift',
    rewardCash: 4500,
    rewardRep: 250,
    targetLocation: { x: 0, z: 0, name: 'Markaziy Maydon' },
    targetDriftScore: 5000,
    timeLimitSec: 90,
  },
  {
    id: 'mis_taxi_1',
    title: 'VIP Mehmonni Avtosalonga Yetkazish',
    description: 'Mehmonni Zapravkadan yangi Premium Avtosalonga tez va xavfsiz yetkazing.',
    category: 'taxi',
    rewardCash: 3200,
    rewardRep: 180,
    targetLocation: { x: 75, z: -70, name: 'Premium Avtosalon' },
    timeLimitSec: 75,
  },
  {
    id: 'mis_delivery_1',
    title: 'Tezkor Ehtiyot Qismlar Yetkazib Berish',
    description: 'Tyuning garaji uchun yangi turbina yetkazib berish kerak. Vaqt g‘animat!',
    category: 'delivery',
    rewardCash: 6000,
    rewardRep: 350,
    targetLocation: { x: -45, z: 65, name: 'Tyuning Garaji' },
    timeLimitSec: 60,
  },
  {
    id: 'mis_race_1',
    title: 'Tungi Shahar Ko‘cha Poygasi',
    description: 'Ko‘cha poygachilariga qarshi trassa bo‘ylab eng tez vaqt qayd eting.',
    category: 'race',
    rewardCash: 8500,
    rewardRep: 500,
    targetLocation: { x: -120, z: 110, name: 'Tog‘ Yo‘li Boshlanishi' },
    timeLimitSec: 100,
  },
];
