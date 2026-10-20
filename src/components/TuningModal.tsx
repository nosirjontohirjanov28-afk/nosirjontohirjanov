import React, { useState } from 'react';
import { CarStats } from '../types/game';
import { Gauge, Sparkles, Wrench, X } from 'lucide-react';

interface TuningModalProps {
  isOpen: boolean;
  onClose: () => void;
  carStats: CarStats;
  onChangeStats: (updater: (prev: CarStats) => CarStats) => void;
  playerCash: number;
  onSpendCash: (amount: number) => boolean;
}

const BODY_COLORS = [
  { name: 'Oltin Drift', hex: '#F59E0B' },
  { name: 'Ferrari Qizil', hex: '#EF4444' },
  { name: 'Bayside Moviy', hex: '#3B82F6' },
  { name: 'Zumrad Yashil', hex: '#10B981' },
  { name: 'Midnight Purple', hex: '#8B5CF6' },
  { name: 'Kumush Titan', hex: '#E2E8F0' },
  { name: 'Obsidian Qora', hex: '#0F172A' },
  { name: 'Neon Pushti', hex: '#EC4899' },
];

const RIM_COLORS = [
  { name: 'Oq Kumush', hex: '#E2E8F0' },
  { name: 'Oltin Volk', hex: '#F59E0B' },
  { name: 'Qora Mat', hex: '#1E293B' },
  { name: 'Bronza', hex: '#B45309' },
  { name: 'Moviy Xrom', hex: '#38BDF8' },
];

export const TuningModal: React.FC<TuningModalProps> = ({
  isOpen,
  onClose,
  carStats,
  onChangeStats,
  playerCash,
  onSpendCash,
}) => {
  const [tab, setTab] = useState<'parts' | 'visual' | 'stance'>('parts');

  if (!isOpen) return null;

  const upgradeTurbo = (stage: 1 | 2 | 3, cost: number) => {
    if (carStats.turboStage === stage) return;
    if (onSpendCash(cost)) {
      onChangeStats((prev) => ({
        ...prev,
        turboStage: stage,
        horsePower: prev.horsePower + (stage === 3 ? 140 : 70),
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#0B0F19] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">Apex Tyuning Garaji & Ustaxona</h2>
              <p className="text-xs text-slate-400">{carStats.name} sozlamalari</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setTab('parts')}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'parts' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Dvigatel & Turbina
            </button>
            <button
              onClick={() => setTab('visual')}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'visual' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Kuzov & Bo‘yoq
            </button>
            <button
              onClick={() => setTab('stance')}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'stance' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Podveska & Stance
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {tab === 'parts' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Twin-Turbocharger Bosqichini O‘rnatish:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { stage: 1, name: 'Stage 1 Turbo', boost: '+0.8 Bar', cost: 1200 },
                    { stage: 2, name: 'Stage 2 Twin', boost: '+1.5 Bar', cost: 2800 },
                    { stage: 3, name: 'Stage 3 Big Single', boost: '+2.4 Bar', cost: 5500 },
                  ].map((s) => {
                    const isCurrent = carStats.turboStage === s.stage;
                    return (
                      <button
                        key={s.stage}
                        onClick={() => upgradeTurbo(s.stage as 1 | 2 | 3, s.cost)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{s.name}</div>
                          <div className="text-[11px] text-cyan-400 font-mono mt-0.5">{s.boost}</div>
                        </div>
                        <div className="mt-3 text-xs font-mono font-bold text-amber-400">
                          {isCurrent ? 'O‘RNATILGAN' : `$${s.cost}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Open Hood & Doors for 3D inspection */}
              <div className="pt-3 border-t border-white/10">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  3D Mexanik Qismlarni Ko‘rish:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onChangeStats((p) => ({ ...p, hoodOpen: !p.hoodOpen }))}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      carStats.hoodOpen
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold">Kapotni Ochish / Yopish</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {carStats.hoodOpen ? 'Ochiq · Dvigatel ko‘rinmoqda' : 'Yopiq'}
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeStats((p) => ({ ...p, doorsOpen: !p.doorsOpen }))}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      carStats.doorsOpen
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold">Sport Eshiklarni Ochish</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {carStats.doorsOpen ? 'Lambo eshik ochiq' : 'Yopiq'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'visual' && (
            <div className="space-y-5">
              {/* Paint Color */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Kuzov Rangi (Metallic Clearcoat):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BODY_COLORS.map((bc) => (
                    <button
                      key={bc.hex}
                      onClick={() => onChangeStats((p) => ({ ...p, bodyColor: bc.hex }))}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        carStats.bodyColor.toLowerCase() === bc.hex.toLowerCase()
                          ? 'border-white bg-white/15'
                          : 'border-white/10 bg-slate-900/60'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: bc.hex }}
                      />
                      <span className="text-[10px] text-slate-300 truncate w-full text-center">
                        {bc.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rim Color */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Sport Disklar Rangi:
                </label>
                <div className="flex gap-2">
                  {RIM_COLORS.map((rc) => (
                    <button
                      key={rc.hex}
                      onClick={() => onChangeStats((p) => ({ ...p, rimColor: rc.hex }))}
                      className={`flex-1 p-2 rounded-xl border flex flex-col items-center gap-1 ${
                        carStats.rimColor.toLowerCase() === rc.hex.toLowerCase()
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-white/10 bg-slate-900/60'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full" style={{ backgroundColor: rc.hex }} />
                      <span className="text-[10px] text-slate-300 truncate">{rc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spoiler Style */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Aerodinamik Spoiler:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gt_wing', name: 'GT Karbon Qanot' },
                    { id: 'ducktail', name: 'Pastki Ducktail' },
                    { id: 'none', name: 'Spoilersiz' },
                  ].map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => onChangeStats((p) => ({ ...p, spoiler: sp.id as any }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium ${
                        carStats.spoiler === sp.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-900 border-white/10 text-slate-300'
                      }`}
                    >
                      {sp.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neon Underglow */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    Taglik Neon Chiroqlari (Underglow):
                  </label>
                  <button
                    onClick={() => onChangeStats((p) => ({ ...p, neonEnabled: !p.neonEnabled }))}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      carStats.neonEnabled
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {carStats.neonEnabled ? 'YOQILGAN' : 'O‘CHIQLIG‘'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'stance' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300">G‘ildirak Kamber Qiyaligi:</span>
                  <span className="font-bold text-amber-400">{carStats.camberAngle}°</span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={0}
                  step={1}
                  value={carStats.camberAngle}
                  onChange={(e) =>
                    onChangeStats((p) => ({ ...p, camberAngle: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300">Klirens (Podveska Balandligi):</span>
                  <span className="font-bold text-amber-400">{Math.round(carStats.rideHeight * 100)} sm</span>
                </div>
                <input
                  type="range"
                  min={-0.12}
                  max={0.06}
                  step={0.01}
                  value={carStats.rideHeight}
                  onChange={(e) =>
                    onChangeStats((p) => ({ ...p, rideHeight: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300">Drift / Grip Shina Balansi:</span>
                  <span className="font-bold text-cyan-400">
                    {Math.round((1 - carStats.driftGrip) * 100)}% Sirpanish
                  </span>
                </div>
                <input
                  type="range"
                  min={0.45}
                  max={0.85}
                  step={0.02}
                  value={carStats.driftGrip}
                  onChange={(e) =>
                    onChangeStats((p) => ({ ...p, driftGrip: Number(e.target.value) }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
