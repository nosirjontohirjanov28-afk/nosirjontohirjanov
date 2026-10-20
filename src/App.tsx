import React, { useCallback, useEffect, useState } from 'react';
import {
  CameraMode,
  CarId,
  CAR_CATALOG,
  CarStats,
  DayNightTime,
  Mission,
  PlayerState,
  Telemetry,
} from './types/game';
import { CityGameCanvas3D } from './components/CityGameCanvas3D';
import { RealLifeHUD } from './components/RealLifeHUD';
import { CityMapModal } from './components/CityMapModal';
import { DealershipModal } from './components/DealershipModal';
import { TuningModal } from './components/TuningModal';
import { MissionsModal } from './components/MissionsModal';
import { audioSystem, RadioStationId } from './utils/audioSystem';

const CAMERA_MODES: CameraMode[] = ['chase', 'dynamic_drift', 'cockpit', 'hood', 'orbit', 'drone'];

export function App() {
  // Player state persisted in localStorage
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    try {
      const saved = localStorage.getItem('drift_master_save_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      cash: 25000,
      currentCarId: 'bmw_m4',
      ownedCarIds: ['bmw_m4'],
      fuel: 98,
      mileageKm: 8.5,
      totalDriftScore: 0,
      reputation: 500,
    };
  });

  // Active Car Stats
  const [carStats, setCarStats] = useState<CarStats>(() => {
    return { ...CAR_CATALOG[playerState.currentCarId || 'bmw_m4'] };
  });

  // Gameplay Settings
  const [cameraMode, setCameraMode] = useState<CameraMode>('dynamic_drift');
  const [dayTime, setDayTime] = useState<DayNightTime>('night');
  const [activeRadio, setActiveRadio] = useState<RadioStationId>('phonk');
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);

  // Active Mission
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  // Modals
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isDealerOpen, setIsDealerOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);

  // Touch controls state
  const [touchInput, setTouchInput] = useState({
    gas: false,
    brake: false,
    left: false,
    right: false,
    handbrake: false,
    nitro: false,
  });

  // Telemetry updated from 3D canvas
  const [telemetry, setTelemetry] = useState<Telemetry>({
    speedKmh: 0,
    rpm: 1100,
    gear: 1,
    driftAngle: 0,
    isDrifting: false,
    currentDriftScore: 0,
    comboMultiplier: 1.0,
    turboBoostBar: 0,
    tireTempC: 65,
    fuelLevel: 98,
    inGasStation: false,
    inGarage: false,
    inDealership: false,
    headlightsOn: true,
    policeAlert: false,
    fps: 120,
  });

  // Save progress periodically
  useEffect(() => {
    try {
      localStorage.setItem('drift_master_save_v2', JSON.stringify(playerState));
    } catch {
      // Ignore
    }
  }, [playerState]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'c') {
        cycleCamera();
      } else if (k === 'l') {
        toggleHeadlights();
      } else if (k === 'g') {
        setIsGarageOpen((p) => !p);
      } else if (k === 'm') {
        setIsMapOpen((p) => !p);
      } else if (k === 'f' && telemetry.inGasStation) {
        handleRefuel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [telemetry.inGasStation]);

  const cycleCamera = useCallback(() => {
    setCameraMode((prev) => {
      const idx = CAMERA_MODES.indexOf(prev);
      return CAMERA_MODES[(idx + 1) % CAMERA_MODES.length];
    });
  }, []);

  const cycleDayTime = useCallback(() => {
    setDayTime((prev) => (prev === 'day' ? 'sunset' : prev === 'sunset' ? 'night' : 'day'));
  }, []);

  const cycleRadio = useCallback(() => {
    const stations: RadioStationId[] = ['phonk', 'synthwave', 'tashkent', 'chill', 'off'];
    setActiveRadio((prev) => {
      const next = stations[(stations.indexOf(prev) + 1) % stations.length];
      audioSystem.setRadioStation(next);
      return next;
    });
  }, []);

  const toggleHeadlights = useCallback(() => {
    setHeadlightsOn((prev) => !prev);
  }, []);

  // Economy & Fuel Handlers
  const handleFuelConsume = useCallback((amount: number) => {
    setPlayerState((prev) => {
      const newFuel = Math.max(0, prev.fuel - amount);
      const newMileage = prev.mileageKm + (amount * 0.15);
      return {
        ...prev,
        fuel: Number(newFuel.toFixed(1)),
        mileageKm: Number(newMileage.toFixed(2)),
      };
    });
  }, []);

  const handleRefuel = useCallback(() => {
    const cost = 120;
    if (playerState.cash >= cost) {
      setPlayerState((prev) => ({
        ...prev,
        cash: prev.cash - cost,
        fuel: 100,
      }));
    }
  }, [playerState.cash]);

  const handleDriftPointsAwarded = useCallback(
    (points: number) => {
      // Convert drift points to in-game cash: 1,000 drift pts = $50
      const earnedCash = Math.round(points * 0.05);
      setPlayerState((prev) => ({
        ...prev,
        cash: prev.cash + earnedCash,
        totalDriftScore: prev.totalDriftScore + points,
        reputation: prev.reputation + Math.round(points * 0.01),
      }));

      // Check active drift mission
      if (activeMission && activeMission.category === 'drift' && activeMission.targetDriftScore) {
        if (points >= activeMission.targetDriftScore) {
          // Mission completed!
          setPlayerState((prev) => ({
            ...prev,
            cash: prev.cash + activeMission.rewardCash,
            reputation: prev.reputation + activeMission.rewardRep,
          }));
          setActiveMission(null);
        }
      }
    },
    [activeMission]
  );

  const handleSpendCash = useCallback(
    (amount: number) => {
      if (playerState.cash >= amount) {
        setPlayerState((prev) => ({ ...prev, cash: prev.cash - amount }));
        return true;
      }
      return false;
    },
    [playerState.cash]
  );

  const handleBuyCar = useCallback((carId: CarId, price: number) => {
    setPlayerState((prev) => {
      if (prev.cash >= price && !prev.ownedCarIds.includes(carId)) {
        return {
          ...prev,
          cash: prev.cash - price,
          ownedCarIds: [...prev.ownedCarIds, carId],
          currentCarId: carId,
        };
      }
      return prev;
    });
    setCarStats({ ...CAR_CATALOG[carId] });
    setIsDealerOpen(false);
  }, []);

  const handleSelectCar = useCallback((carId: CarId) => {
    setPlayerState((prev) => ({ ...prev, currentCarId: carId }));
    setCarStats({ ...CAR_CATALOG[carId] });
  }, []);

  const handleCreateCustomCar = useCallback((customCar: CarStats) => {
    CAR_CATALOG[customCar.id] = customCar;
    setPlayerState((prev) => ({
      ...prev,
      ownedCarIds: prev.ownedCarIds.includes(customCar.id) ? prev.ownedCarIds : [...prev.ownedCarIds, customCar.id],
      currentCarId: customCar.id,
    }));
    setCarStats({ ...customCar });
    setIsDealerOpen(false);
  }, []);

  const handleTouchStart = (key: keyof typeof touchInput) => {
    audioSystem.init();
    setTouchInput((p) => ({ ...p, [key]: true }));
  };

  const handleTouchEnd = (key: keyof typeof touchInput) => {
    setTouchInput((p) => ({ ...p, [key]: false }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06080E] select-none touch-none">
      {/* 3D Living Open World City & Car Simulation */}
      <CityGameCanvas3D
        carStats={carStats}
        cameraMode={cameraMode}
        dayTime={dayTime}
        fuel={playerState.fuel}
        touchInput={touchInput}
        headlightsOn={headlightsOn}
        onTelemetry={setTelemetry}
        onDriftPointsAwarded={handleDriftPointsAwarded}
        onFuelConsume={handleFuelConsume}
        onRefuel={handleRefuel}
        onOpenGarage={() => setIsGarageOpen(true)}
        onOpenDealership={() => setIsDealerOpen(true)}
      />

      {/* Real Life HUD Overlay */}
      <RealLifeHUD
        telemetry={telemetry}
        playerState={playerState}
        carName={carStats.name}
        cameraMode={cameraMode}
        dayTime={dayTime}
        activeRadio={activeRadio}
        activeMission={activeMission}
        onCycleCamera={cycleCamera}
        onCycleDayTime={cycleDayTime}
        onCycleRadio={cycleRadio}
        onToggleHeadlights={toggleHeadlights}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenGarage={() => setIsGarageOpen(true)}
        onOpenDealership={() => setIsDealerOpen(true)}
        onOpenMissions={() => setIsMissionsOpen(true)}
        onRefuel={handleRefuel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Interactive Modals */}
      <CityMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

      <DealershipModal
        isOpen={isDealerOpen}
        onClose={() => setIsDealerOpen(false)}
        playerCash={playerState.cash}
        ownedCarIds={playerState.ownedCarIds}
        currentCarId={playerState.currentCarId}
        onSelectCar={handleSelectCar}
        onBuyCar={handleBuyCar}
        onCreateCustomCar={handleCreateCustomCar}
      />

      <TuningModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        carStats={carStats}
        onChangeStats={setCarStats}
        playerCash={playerState.cash}
        onSpendCash={handleSpendCash}
      />

      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        activeMission={activeMission}
        onStartMission={setActiveMission}
        onCancelMission={() => setActiveMission(null)}
      />
    </div>
  );
}

export default App;
