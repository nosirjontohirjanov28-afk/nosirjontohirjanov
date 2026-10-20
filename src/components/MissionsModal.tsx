import React from 'react';
import { CITY_MISSIONS, Mission } from '../types/game';
import { Award, CheckCircle, Clock, Coins, Compass, X } from 'lucide-react';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMission: Mission | null;
  onStartMission: (mission: Mission) => void;
  onCancelMission: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  activeMission,
  onStartMission,
  onCancelMission,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#090D18] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">Shahar Topshiriqlari & Real Hayot Ishlari</h2>
              <p className="text-xs text-slate-400">Pul va obro‘ (Reputation) to‘plash uchun buyurtmalarni bajaring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {CITY_MISSIONS.map((mis) => {
            const isActive = activeMission?.id === mis.id;

            return (
              <div
                key={mis.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-400 text-white'
                    : 'bg-slate-900/60 border-white/10 text-slate-200 hover:border-white/25'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {mis.category === 'drift'
                        ? '🔥 DRIFT SHOW'
                        : mis.category === 'taxi'
                        ? '🚖 VIP TAKSI'
                        : mis.category === 'delivery'
                        ? '📦 TEZKOR YETKAZISH'
                        : '🏁 KO‘CHA POYGASI'}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-amber-400 font-bold">+${mis.rewardCash.toLocaleString()}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-400">+{mis.rewardRep} REP</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-base text-white mt-1">{mis.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mis.description}</p>

                  <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Vaqt: {mis.timeLimitSec}s
                    </span>
                    <span>Mo‘ljal: {mis.targetLocation.name}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end">
                  {isActive ? (
                    <button
                      onClick={() => onCancelMission()}
                      className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-200 text-xs font-bold transition-colors"
                    >
                      Topshiriqni Bekor Qilish
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onStartMission(mis);
                        onClose();
                      }}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs shadow-md transition-colors"
                    >
                      Topshiriqni Boshlash
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
