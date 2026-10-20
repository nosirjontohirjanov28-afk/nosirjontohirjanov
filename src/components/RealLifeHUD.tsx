import React from 'react';
import { CameraMode, DayNightTime, Mission, PlayerState, Telemetry } from '../types/game';
import { RADIO_STATIONS, RadioStationId } from '../utils/audioSystem';
import {
  Camera,
  Coins,
  Compass,
  Fuel,
  Headphones,
  Moon,
  Radio,
  Sun,
  Sunrise,
  Wrench,
  Zap,
} from 'lucide-react';

interface RealLifeHUDProps {
  telemetry: Telemetry;
  playerState: PlayerState;
  carName: string;
  cameraMode: CameraMode;
  dayTime: DayNightTime;
  activeRadio: RadioStationId;
  activeMission: Mission | null;
  onCycleCamera: () => void;
  onCycleDayTime: () => void;
  onCycleRadio: () => void;
  onToggleHeadlights: () => void;
  onOpenMap: () => void;
  onOpenGarage: () => void;
  onOpenDealership: () => void;
  onOpenMissions: () => void;
  onRefuel: () => void;
  onTouchStart: (key: 'gas' | 'brake' | 'left' | 'right' | 'handbrake' | 'nitro') => void;
  onTouchEnd: (key: 'gas' | 'brake' | 'left' | 'right' | 'handbrake' | 'nitro') => void;
}

export const RealLifeHUD: React.FC<RealLifeHUDProps> = ({
  telemetry,
  playerState,
  carName,
  cameraMode,
  dayTime,
  activeRadio,
  activeMission,
  onCycleCamera,
  onCycleDayTime,
  onCycleRadio,
  onToggleHeadlights,
  onOpenMap,
  onOpenGarage,
  onOpenDealership,
  onOpenMissions,
  onRefuel,
  onTouchStart,
  onTouchEnd,
}) => {
  const currentRadio = RADIO_STATIONS.find((r) => r.id === activeRadio) || RADIO_STATIONS[0];
  const isLowFuel = telemetry.fuelLevel < 15;

  const cameraNames: Record<CameraMode, string> = {
    chase: 'Kuzatuv (Orqadan)',
    dynamic_drift: 'Dinamik Drift',
    cockpit: 'Kokpit (Ruldan)',
    hood: 'Kapot Usti',
    orbit: '360° Ko‘rik',
    drone: 'Dron Yuqoridan',
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-5">
      {/* 1. Top Bar: Economy, Time, Radio & Navigation Quick Links */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Player Wallet, Reputation & 120 FPS Live Counter */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-white text-base sm:text-lg tabular-nums">
              ${playerState.cash.toLocaleString()}
            </span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="text-xs font-mono text-cyan-400">
            REP: <span className="text-white font-bold">{playerState.reputation}</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-emerald-300 tabular-nums">
              {telemetry.fps || 120} FPS
            </span>
          </div>
        </div>

        {/* Center: In-Game Radio Station Bar */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
          <button
            onClick={onCycleRadio}
            className="flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-amber-400 transition-colors"
          >
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono">{currentRadio.name}</span>
            <span className="text-[10px] text-slate-400">({currentRadio.genre})</span>
          </button>
        </div>

        {/* Right: City Actions & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onOpenMissions}
            className="px-3 py-2 bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Topshiriqlar</span>
          </button>

          <button
            onClick={onOpenMap}
            className="px-3 py-2 bg-white/10 border border-white/15 hover:bg-white/20 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <span>GPS Xarita</span>
          </button>

          <button
            onClick={onCycleDayTime}
            className="p-2 bg-white/10 border border-white/15 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="Kun / Tun vaqtini o‘zgartirish"
          >
            {dayTime === 'day' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : dayTime === 'sunset' ? (
              <Sunrise className="w-4 h-4 text-orange-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          <button
            onClick={onCycleCamera}
            className="px-2.5 py-2 bg-white/10 border border-white/15 hover:bg-white/20 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
            title="Kamera burchagini almashtirish"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline font-mono">{cameraNames[cameraMode]}</span>
          </button>
        </div>
      </div>

      {/* 2. Center Prompt: Real Life Proximity Actions (Zapravka / Garaj / Avtosalon) */}
      <div className="flex flex-col items-center gap-2">
        {/* Drift Score Combo Animation */}
        {telemetry.isDrifting && (
          <div className="bg-black/70 backdrop-blur-md border border-amber-500/60 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
            <span className="text-xs font-mono text-amber-400">DRIFT:</span>
            <span className="font-display font-bold text-2xl text-white tabular-nums">
              +{telemetry.currentDriftScore.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              ×{telemetry.comboMultiplier.toFixed(1)}
            </span>
          </div>
        )}

        {/* Real Life Landmark Interaction Prompts */}
        {telemetry.inGasStation && (
          <div className="pointer-events-auto bg-amber-500/90 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm animate-pulse">
            <Fuel className="w-5 h-5" />
            <span>Zapravkadasiz: Bakni to‘ldirish ($120)</span>
            <button
              onClick={onRefuel}
              className="px-3 py-1 bg-black text-amber-400 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors"
            >
              BENZIN QUYISH (F)
            </button>
          </div>
        )}

        {telemetry.inGarage && (
          <div className="pointer-events-auto bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm">
            <Wrench className="w-5 h-5 text-cyan-300" />
            <span>Apex Tyuning Garaji Ostonasidasiz</span>
            <button
              onClick={onOpenGarage}
              className="px-3 py-1 bg-white text-blue-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              GARAJGA KIRISH (G)
            </button>
          </div>
        )}

        {telemetry.inDealership && (
          <div className="pointer-events-auto bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm">
            <span>Premium Avtosalon (Moshina Bozor)</span>
            <button
              onClick={onOpenDealership}
              className="px-3 py-1 bg-white text-emerald-950 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              MOSHINALARNI KO‘RISH
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom Layer: Telemetry Cluster & On-Screen Touch Driving Controls */}
      <div className="flex items-end justify-between gap-3">
        {/* Bottom Left: Car Model, Fuel Gauge & Quick Lights */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="bg-black/65 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl w-60 sm:w-68 shadow-xl">
            <div className="text-xs font-display font-bold text-white truncate flex items-center justify-between">
              <span>{carName}</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">///M POWER</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">
              BMW S58 TwinPower Turbo (720 HP)
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Ovoz: BMW M Burble & Pops · Probeg: {playerState.mileageKm.toFixed(1)} km
            </div>

            {/* Fuel Gauge */}
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Fuel className={`w-3.5 h-3.5 ${isLowFuel ? 'text-red-400 animate-ping' : 'text-amber-400'}`} />
                  Benzin:
                </span>
                <span className={`font-bold ${isLowFuel ? 'text-red-400' : 'text-emerald-400'}`}>
                  {telemetry.fuelLevel}% {isLowFuel && '(Kam!)'}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    isLowFuel ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                  }`}
                  style={{ width: `${telemetry.fuelLevel}%` }}
                />
              </div>
            </div>

            {/* Headlights and Open Hood/Doors quick buttons */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={onToggleHeadlights}
                className={`text-[11px] px-2 py-1 rounded-md font-mono ${
                  telemetry.headlightsOn
                    ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                Faralar: {telemetry.headlightsOn ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={onOpenGarage}
                className="text-[11px] px-2 py-1 rounded-md font-mono bg-white/5 hover:bg-white/15 text-slate-300"
              >
                Tyuning (G)
              </button>
            </div>
          </div>

          {/* Mobile Steering Touch Buttons (Left / Right) */}
          <div className="flex sm:hidden items-center gap-2 pt-1">
            <button
              onTouchStart={() => onTouchStart('left')}
              onTouchEnd={() => onTouchEnd('left')}
              onMouseDown={() => onTouchStart('left')}
              onMouseUp={() => onTouchEnd('left')}
              className="w-16 h-16 rounded-2xl bg-black/60 border border-white/20 active:bg-amber-500 active:text-slate-950 text-white font-bold text-xl flex items-center justify-center shadow-lg"
            >
              ←
            </button>
            <button
              onTouchStart={() => onTouchStart('right')}
              onTouchEnd={() => onTouchEnd('right')}
              onMouseDown={() => onTouchStart('right')}
              onMouseUp={() => onTouchEnd('right')}
              className="w-16 h-16 rounded-2xl bg-black/60 border border-white/20 active:bg-amber-500 active:text-slate-950 text-white font-bold text-xl flex items-center justify-center shadow-lg"
            >
              →
            </button>
          </div>
        </div>

        {/* Bottom Right: Digital Dashboard & Tachometer */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Mobile Pedals (Gas / Brake / Handbrake / Nitro) */}
          <div className="flex sm:hidden items-center gap-2 pb-1">
            <button
              onTouchStart={() => onTouchStart('nitro')}
              onTouchEnd={() => onTouchEnd('nitro')}
              className="w-13 h-13 rounded-xl bg-cyan-600/80 border border-cyan-300 text-white text-xs font-bold flex items-center justify-center"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onTouchStart={() => onTouchStart('handbrake')}
              onTouchEnd={() => onTouchEnd('handbrake')}
              className="w-13 h-13 rounded-xl bg-amber-600/80 border border-amber-300 text-white text-xs font-bold flex items-center justify-center"
            >
              DRIFT
            </button>
            <button
              onTouchStart={() => onTouchStart('brake')}
              onTouchEnd={() => onTouchEnd('brake')}
              className="w-15 h-16 rounded-2xl bg-red-600/80 border border-red-300 text-white font-bold text-sm flex items-center justify-center"
            >
              TORMOZ
            </button>
            <button
              onTouchStart={() => onTouchStart('gas')}
              onTouchEnd={() => onTouchEnd('gas')}
              className="w-15 h-20 rounded-2xl bg-emerald-600/90 border border-emerald-300 text-white font-bold text-base flex items-center justify-center"
            >
              GAZ
            </button>
          </div>

          {/* Speedometer & Gear HUD */}
          <div className="bg-black/65 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="text-center pr-3 border-r border-white/10">
              <div className="text-[10px] font-mono text-slate-400">UZATMA</div>
              <div className="font-display font-bold text-3xl text-amber-400 tabular-nums">
                {telemetry.gear}
              </div>
              <div className="text-[10px] font-mono text-slate-500">6-TEZLIK</div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-5xl font-bold text-white tabular-nums tracking-tight leading-none">
                  {telemetry.speedKmh}
                </span>
                <span className="font-mono text-xs font-semibold text-amber-400">KM/SOAT</span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
                <span>{telemetry.rpm} RPM</span>
                <span>·</span>
                <span className="text-cyan-400">+{telemetry.turboBoostBar} bar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
