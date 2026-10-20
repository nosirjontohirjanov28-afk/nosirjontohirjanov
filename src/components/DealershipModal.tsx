import React, { useState } from 'react';
import { CAR_CATALOG, CarId, CarStats } from '../types/game';
import {
  Car,
  Check,
  Coins,
  Palette,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

interface DealershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerCash: number;
  ownedCarIds: CarId[];
  currentCarId: CarId;
  onSelectCar: (carId: CarId) => void;
  onBuyCar: (carId: CarId, price: number) => void;
  onCreateCustomCar?: (customCar: CarStats) => void;
}

const PRESET_BODY_COLORS = [
  { name: 'Shark Blue (Porsche)', hex: '#0284C7' },
  { name: 'Nismo Stealth Gray', hex: '#64748B' },
  { name: 'Isle of Man Green (BMW)', hex: '#10B981' },
  { name: 'Yas Marina Moviy', hex: '#3B82F6' },
  { name: 'Ferrari Crimson Qizil', hex: '#EF4444' },
  { name: 'Oltin Sunset Drift', hex: '#F59E0B' },
  { name: 'Midnight Purple', hex: '#8B5CF6' },
  { name: 'Obsidian Qora Met.', hex: '#0F172A' },
  { name: 'Kumush Titan Xrom', hex: '#E2E8F0' },
  { name: 'Neon Pushti Synth', hex: '#EC4899' },
];

const PRESET_RIM_COLORS = [
  { name: 'Pyro Red (GT3 RS)', hex: '#DC2626' },
  { name: 'Forged Qora Mat', hex: '#0F172A' },
  { name: 'Volk Oltin Bronza', hex: '#F59E0B' },
  { name: 'Kumush Titan Xrom', hex: '#E2E8F0' },
  { name: 'Sky Blue Xrom', hex: '#38BDF8' },
];

const BASE_ARCHITECTURES: { id: CarId; name: string; desc: string; icon: string }[] = [
  {
    id: 'porsche_gt3rs',
    name: 'Porsche 911 GT3 RS Weissach',
    desc: 'Teardrop fastback siluet, kapotda ikkita chuqur havo chiqarish shaxtasi, old qanotlarda 4 ta aerodinamik louver va baland swan-neck DRS qanoti',
    icon: '🏎️',
  },
  {
    id: 'gtr_r35',
    name: 'Nissan GT-R Nismo Special Edition R35',
    desc: 'V-motion panjara, Nismo qizil pinstripe, kapotda NACA kanallari, orqada afsonaviy 4 ta dumaloq halo LED chiroqlar va titan exhaust',
    icon: '⚡',
  },
  {
    id: 'bmw_m4',
    name: 'BMW M4 Competition G82',
    desc: 'Mashhur qo‘shaloq vertikal kidney panjarasi, M havo to‘lqinli kapot, S58 3.0L dvigatel va 4 ta round M trubalar',
    icon: '🚀',
  },
  {
    id: 'supra_mk4',
    name: 'Toyota Supra MK4 2JZ Monster',
    desc: '90-yillar silliq aero korpusi, gigant Garrett turbinali 2JZ-GTE, baland kamarli Supra hoop spoyler va 4 ta dumaloq optika',
    icon: '🔥',
  },
  {
    id: 'amg_gtr',
    name: 'Mercedes-AMG GT-R Green Hell',
    desc: 'Panamericana vertikal xrom panjara, uzun agressiv kapot va 4.0L V8 Biturbo blok',
    icon: '🏁',
  },
  {
    id: 'silvia_s15',
    name: 'Nissan Silvia S15 Spec-R Drift',
    desc: 'O‘tkir burchakli proyektor optika, drift-spec tana va yengil JDM korpus',
    icon: '🔰',
  },
];

export const DealershipModal: React.FC<DealershipModalProps> = ({
  isOpen,
  onClose,
  playerCash,
  ownedCarIds,
  currentCarId,
  onSelectCar,
  onBuyCar,
  onCreateCustomCar,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'create'>('catalog');

  // Custom Car Creator Form State
  const [newModel, setNewModel] = useState('Porsche 911 GT3 RS Weissach Aero');
  const [newManufacturer, setNewManufacturer] = useState('Porsche Motorsport');
  const [newYear, setNewYear] = useState(2024);
  const [newBaseArch, setNewBaseArch] = useState<CarId>('porsche_gt3rs');
  const [newColor, setNewColor] = useState('#0284C7');
  const [newRimColor, setNewRimColor] = useState('#DC2626');
  const [newEngine, setNewEngine] = useState('4.0L High-Revving Flat-6 (9,000 RPM)');
  const [newHorsePower, setNewHorsePower] = useState(750);
  const [newTopSpeed, setNewTopSpeed] = useState(335);
  const [newDriftGrip, setNewDriftGrip] = useState(0.58);
  const [newSpoiler, setNewSpoiler] = useState<'gt_wing' | 'ducktail' | 'none'>('gt_wing');
  const [newNeonColor, setNewNeonColor] = useState('#0284C7');
  const [newNeonEnabled, setNewNeonEnabled] = useState(true);

  if (!isOpen) return null;

  const handleBuildAndDrive = () => {
    const customId = `custom_${Date.now()}`;
    const customCar: CarStats = {
      id: customId,
      name: `${newModel} (${newYear})`,
      manufacturer: newManufacturer,
      model: newModel,
      year: newYear,
      price: 0,
      engine: newEngine,
      horsePower: newHorsePower,
      topSpeedKmh: newTopSpeed,
      driftGrip: newDriftGrip,
      bodyColor: newColor,
      rimColor: newRimColor,
      neonColor: newNeonColor,
      neonEnabled: newNeonEnabled,
      spoiler: newSpoiler,
      hoodOpen: false,
      doorsOpen: false,
      camberAngle: -6,
      rideHeight: -0.06,
      turboStage: 3,
    };

    if (onCreateCustomCar) {
      onCreateCustomCar(customCar);
    } else {
      CAR_CATALOG[customId] = customCar;
      onSelectCar(customId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-[#090D18] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-wide">
                Premium Avtosalon & Moshina Yaratish Markazi
              </h2>
              <p className="text-xs text-slate-400">
                Mavjud modellarni tanlang yoki o‘zingizning yangi realistik moshinangizni loyihalashtiring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl font-mono text-xs text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>${playerCash.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-white/10 flex gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Moshina Bozor ({Object.keys(CAR_CATALOG).length} ta Model)</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-amber-300 hover:text-white hover:bg-amber-500/10'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yangi Moshina Yaratish (Custom Order)</span>
          </button>
        </div>

        {/* Tab 1: Catalog Grid */}
        {activeTab === 'catalog' && (
          <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(CAR_CATALOG) as CarId[]).map((cId) => {
              const car: CarStats = CAR_CATALOG[cId];
              const isOwned = ownedCarIds.includes(cId);
              const isSelected = currentCarId === cId;
              const canAfford = playerCash >= car.price;

              return (
                <div
                  key={cId}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-white/10 text-slate-200 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-white/30"
                          style={{ backgroundColor: car.bodyColor }}
                        />
                        {car.manufacturer} · {car.year}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {car.price === 0 ? 'Boshlang‘ich' : `$${car.price.toLocaleString()}`}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-white mt-1.5">{car.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{car.engine}</p>

                    {/* Specs */}
                    <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 bg-black/40 rounded-xl border border-white/5 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Quvvat</div>
                        <div className="font-bold text-amber-400">{car.horsePower} HP</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Maks. Tezlik</div>
                        <div className="font-bold text-white">{car.topSpeedKmh} km/h</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Drift Balans</div>
                        <div className="font-bold text-cyan-400">
                          {Math.round((1 - car.driftGrip) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    {isOwned ? (
                      isSelected ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Hozir Minilgan Moshina
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectCar(cId);
                            onClose();
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                        >
                          Buni Haydash (Minish)
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => onBuyCar(cId, car.price)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                          canAfford
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{canAfford ? 'Xarid Qilish' : 'Mablag‘ Yetarli Emas'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Car Creator Studio */}
        {activeTab === 'create' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Yangi moshina modeli spetsifikatsiyasini kiriting: rang, model nomi, yil, dvigatel quvvati va
                aerodinamik qismlar to‘liq 3D da render qilinadi va garajingizga qo‘shiladi!
              </span>
            </div>

            {/* Step 1: Model Identification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Model Nomi:</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="masalan: BMW M5 CS, Porsche 911 GT3 RS"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-display"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Ishlab Chiqaruvchi:</label>
                <input
                  type="text"
                  value={newManufacturer}
                  onChange={(e) => setNewManufacturer(e.target.value)}
                  placeholder="masalan: Porsche Motorsport, BMW M, Nismo"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-display"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Ishlab Chiqarilgan Yili:</label>
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                >
                  {[2025, 2024, 2023, 2022, 2020, 2018, 2002, 1998].map((y) => (
                    <option key={y} value={y}>
                      {y}-yil
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Base Exterior 3D Architecture */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Asosiy 3D Kuzov va Aerodinamika Arxitekturasi:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BASE_ARCHITECTURES.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => {
                      setNewBaseArch(arch.id);
                      if (arch.id === 'porsche_gt3rs') {
                        setNewModel('Porsche 911 GT3 RS Weissach');
                        setNewManufacturer('Porsche Motorsport');
                        setNewColor('#0284C7');
                        setNewRimColor('#DC2626');
                      } else if (arch.id === 'gtr_r35') {
                        setNewModel('Nissan GT-R Nismo Special Edition');
                        setNewManufacturer('Nissan Nismo');
                        setNewColor('#64748B');
                        setNewRimColor('#0F172A');
                      } else if (arch.id === 'bmw_m4') {
                        setNewModel('BMW M4 Competition G82');
                        setNewManufacturer('BMW M Power');
                        setNewColor('#3B82F6');
                        setNewRimColor('#1E293B');
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      newBaseArch === arch.id
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <span className="text-2xl">{arch.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold font-display">{arch.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">{arch.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Color Customization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Body Color */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center justify-between">
                  <span>Kuzov Rangi (Metallic Clearcoat):</span>
                  <span className="font-mono text-slate-400 text-[11px]">{newColor}</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_BODY_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => setNewColor(col.hex)}
                      className={`h-9 rounded-xl border flex items-center justify-center transition-transform ${
                        newColor.toLowerCase() === col.hex.toLowerCase()
                          ? 'border-white scale-105 shadow-md ring-2 ring-white/40'
                          : 'border-white/15 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {newColor.toLowerCase() === col.hex.toLowerCase() && (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-slate-400">Erkin rang tanlash palitrasi</span>
                </div>
              </div>

              {/* Rim Color */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center justify-between">
                  <span>Disk Rangi (Rim Finish):</span>
                  <span className="font-mono text-slate-400 text-[11px]">{newRimColor}</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_RIM_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => setNewRimColor(col.hex)}
                      className={`h-9 rounded-xl border flex items-center justify-center transition-transform ${
                        newRimColor.toLowerCase() === col.hex.toLowerCase()
                          ? 'border-white scale-105 shadow-md ring-2 ring-white/40'
                          : 'border-white/15 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {newRimColor.toLowerCase() === col.hex.toLowerCase() && (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Engine Specs & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black/40 rounded-xl border border-white/10 font-mono text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Dvigatel Nomi:</label>
                <input
                  type="text"
                  value={newEngine}
                  onChange={(e) => setNewEngine(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/15 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Quvvat: <span className="text-amber-400 font-bold">{newHorsePower} HP</span>
                </label>
                <input
                  type="range"
                  min="520"
                  max="1150"
                  step="10"
                  value={newHorsePower}
                  onChange={(e) => setNewHorsePower(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Maks. Tezlik: <span className="text-cyan-400 font-bold">{newTopSpeed} km/h</span>
                </label>
                <input
                  type="range"
                  min="260"
                  max="360"
                  step="5"
                  value={newTopSpeed}
                  onChange={(e) => setNewTopSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Step 5: Spoilers & Neon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Aerodinamik Spoyler:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gt_wing', name: 'Swan-Neck GT Qanot' },
                    { id: 'ducktail', name: 'Carbon Ducktail' },
                    { id: 'none', name: 'Spoylersiz (Clean)' },
                  ].map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => setNewSpoiler(sp.id as 'gt_wing' | 'ducktail' | 'none')}
                      className={`p-2.5 rounded-xl border text-center text-xs transition-colors ${
                        newSpoiler === sp.id
                          ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                          : 'bg-slate-900/60 border-white/10 text-slate-300'
                      }`}
                    >
                      {sp.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Taglik Neon Chirog‘i:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewNeonEnabled(!newNeonEnabled)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      newNeonEnabled
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    {newNeonEnabled ? 'Neon Yoqilgan' : 'Neon O‘chiq'}
                  </button>
                  <input
                    type="color"
                    value={newNeonColor}
                    onChange={(e) => setNewNeonColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-slate-400 font-mono">{newNeonColor}</span>
                </div>
              </div>
            </div>

            {/* Create CTA Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleBuildAndDrive}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-display font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ushbu Yangi Moshinani Yaratish va Minish (Create & Drive)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
