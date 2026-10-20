import React from 'react';
import { CITY_LANDMARKS } from '../types/game';
import { Compass, MapPin, X } from 'lucide-react';

interface CityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CityMapModal: React.FC<CityMapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#090C15] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-lg font-bold text-white">Shahar GPS Xaritasi & Muhim Nuqtalar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2D GPS Radar Graphic */}
        <div className="p-6">
          <div className="relative w-full h-72 bg-[#05070D] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 border-white/20 divide-x divide-y divide-white/10 pointer-events-none" />

            {/* Roads visualization */}
            <div className="absolute w-full h-8 bg-slate-800/80 top-1/2 -translate-y-1/2" />
            <div className="absolute h-full w-8 bg-slate-800/80 left-1/2 -translate-x-1/2" />
            <div className="absolute w-full h-5 bg-slate-800/60 top-1/4" />
            <div className="absolute w-full h-5 bg-slate-800/60 bottom-1/4" />
            <div className="absolute h-full w-5 bg-slate-800/60 left-1/4" />
            <div className="absolute h-full w-5 bg-slate-800/60 right-1/4" />

            {/* Landmarks Pins */}
            {CITY_LANDMARKS.map((lm) => {
              // Map world coords (-150 to 150) to percentage (10% to 90%)
              const leftPercent = 50 + (lm.position.x / 240) * 45;
              const topPercent = 50 + (lm.position.z / 240) * 45;

              return (
                <div
                  key={lm.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                    style={{ backgroundColor: lm.color }}
                  />
                  <span className="text-[10px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap">
                    {lm.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}

            {/* Player Indicator in Center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_12px_#38bdf8] flex items-center justify-center" />
          </div>

          {/* Landmarks Legend List */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CITY_LANDMARKS.map((lm) => (
              <div
                key={lm.id}
                className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center gap-3"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: lm.color }}
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-100 truncate">{lm.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    X: {lm.position.x} · Z: {lm.position.z}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
