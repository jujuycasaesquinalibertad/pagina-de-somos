import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ChevronDown, ChevronUp, IdCard } from 'lucide-react';
import { RegionId } from '../../types';
import { soundscape } from '../../audio/soundscape';

interface BottomDockProps {
  activeRegion: RegionId;
  onSelectRegion: (id: RegionId) => void;
  onOpenCarnet: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeRegion,
  onSelectRegion,
  onOpenCarnet,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    return soundscape.subscribe((playing, muted) => {
      setIsPlayingAudio(playing);
      setIsMuted(muted);
    });
  }, []);

  const handleAudioToggle = () => {
    soundscape.playClick();
    if (!isPlayingAudio) {
      soundscape.startAmbient();
    } else {
      soundscape.toggleMute();
    }
  };

  const regions: { id: RegionId; label: string; color: string }[] = [
    { id: 'quebrada', label: 'Quebrada (Hornocal)', color: '#EE007C' },
    { id: 'puna', label: 'Puna (Salinas)', color: '#00AEEF' },
    { id: 'valles', label: 'Valles (Río Grande)', color: '#F8C300' },
    { id: 'yungas', label: 'Yungas (Calilegua)', color: '#10B981' },
  ];

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 transition-transform duration-300 ${
        isCollapsed ? 'translate-y-[calc(100%+12px)]' : 'translate-y-0'
      }`}
    >
      {/* Botón Flotante para Colapsar / Expandir Dock (Modo Inmersivo) */}
      <div className="flex justify-center mb-1.5">
        <button
          onClick={() => {
            soundscape.playClick();
            onToggleCollapse();
          }}
          className="px-3 py-1 bg-[#0C2340]/90 border border-white/10 hover:border-[#00AEEF]/60 rounded-full text-[11px] font-medium text-slate-300 hover:text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
          title="Atajo: Presiona H para ocultar/mostrar"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#00AEEF]" />
              <span>Explorar Regiones</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Modo Inmersivo</span>
            </>
          )}
        </button>
      </div>

      {/* Panel Principal del Dock */}
      <div className="bg-[#0C2340]/95 border border-white/15 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Selector de Lugares Icónicos / Regiones de Jujuy */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl overflow-x-auto max-w-full">
          {regions.map((r, idx) => {
            const isActive = activeRegion === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  soundscape.playRegionTransition(idx);
                  onSelectRegion(r.id);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Acciones: Control de Audio & Mi Carnet */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Botón de Audio Ambiental con Visualizador de Ondas */}
          <button
            onClick={handleAudioToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-colors cursor-pointer ${
              isPlayingAudio && !isMuted
                ? 'bg-[#00AEEF]/20 border-[#00AEEF] text-[#00AEEF]'
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title="Activar/Desactivar Paisaje Sonoro"
          >
            {isPlayingAudio && !isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-[#00AEEF] animate-pulse" />
                  <span className="w-0.5 h-3 bg-[#00AEEF] animate-pulse delay-75" />
                  <span className="w-0.5 h-1.5 bg-[#00AEEF] animate-pulse delay-150" />
                </div>
                <span className="hidden sm:inline text-[11px]">Audio</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">Sonido</span>
              </>
            )}
          </button>

          {/* Botón Directo a Carnet */}
          <button
            onClick={() => {
              soundscape.playClick();
              onOpenCarnet();
            }}
            className="px-4 py-1.5 bg-[#EE007C] hover:bg-[#d4006e] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Mi Carnet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
