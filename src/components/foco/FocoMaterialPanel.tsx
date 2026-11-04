import React from 'react';
import { X, ArrowRight, ShieldAlert, CheckCircle2, Users, MapPin } from 'lucide-react';
import { RegionId } from '../../types';
import { REGIONS_DATA } from '../../data/regionsData';
import { soundscape } from '../../audio/soundscape';

interface FocoMaterialPanelProps {
  regionId: RegionId;
  isOpen: boolean;
  onClose: () => void;
  onOpenCarnet: (municipio?: string) => void;
}

export const FocoMaterialPanel: React.FC<FocoMaterialPanelProps> = ({
  regionId,
  isOpen,
  onClose,
  onOpenCarnet,
}) => {
  if (!isOpen) return null;

  const data = REGIONS_DATA[regionId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl h-full bg-[#0C2340] border-l border-[#00AEEF]/40 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Cabecera */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#00AEEF] uppercase">
                Foco Material · Diagnóstico y Salida
              </span>
              <h2 className="text-2xl font-black font-montserrat text-white uppercase mt-0.5">
                {data.name}
              </h2>
            </div>
            <button
              onClick={() => {
                soundscape.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Caja de Cifras ("Foco Material" según Manual de Marca) */}
          <div className="my-6 p-5 bg-slate-900/90 border-l-4 border-[#EE007C] rounded-r-xl shadow-lg">
            <span className="text-[11px] font-bold text-[#EE007C] uppercase tracking-wider block mb-1">
              Dato Clave de Realidad Material
            </span>
            <div className="text-4xl sm:text-5xl font-black font-montserrat text-white tracking-tight tabular-nums">
              {data.focoMaterial.statNumber}
            </div>
            <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
              {data.focoMaterial.statLabel}
            </p>
          </div>

          {/* Diagnóstico Raw */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>La Situación Real</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {data.focoMaterial.diagnostic}
              </p>
            </div>

            {/* Propuesta Concreta */}
            <div className="p-4 bg-[#00AEEF]/10 border border-[#00AEEF]/30 rounded-xl">
              <div className="flex items-center gap-2 text-[#00AEEF] font-bold text-xs uppercase tracking-wider mb-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>La Salida con SOMOS</span>
              </div>
              <p className="text-sm text-slate-100 font-medium leading-relaxed">
                {data.focoMaterial.propuesta}
              </p>
            </div>
          </div>

          {/* Municipios y Ciberbases en esta Región */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F8C300]" />
                Localidades de la región
              </span>
              <span className="text-xs text-[#00AEEF] font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {data.focoMaterial.ciberbasesActivas} Ciberbases Activas
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {data.keyTowns.map((town) => (
                <button
                  key={town}
                  onClick={() => {
                    soundscape.playClick();
                    onOpenCarnet(town);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-white/5 hover:bg-[#EE007C]/20 border border-white/10 hover:border-[#EE007C] text-slate-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {town}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botón de Llamado a la Acción */}
        <div className="pt-6 border-t border-white/10 mt-6">
          <button
            onClick={() => {
              soundscape.playClick();
              onOpenCarnet(data.keyTowns[0]);
              onClose();
            }}
            className="w-full py-3 px-4 bg-[#EE007C] hover:bg-[#d4006e] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Sumarme a la Ciberbase de {data.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Organizate con vecinos de tu departamento en ciberbases territoriales.
          </p>
        </div>
      </div>
    </div>
  );
};
