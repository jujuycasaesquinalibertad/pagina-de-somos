import React, { useState } from 'react';
import { X, Users, MapPin, Search, ArrowRight, MessageCircle } from 'lucide-react';
import { CIBERBASES_NODES } from '../../data/regionsData';
import { RegionId } from '../../types';
import { soundscape } from '../../audio/soundscape';

interface CiberbasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCarnet: (municipio?: string) => void;
  onJumpToRegion: (region: RegionId) => void;
}

export const CiberbasesModal: React.FC<CiberbasesModalProps> = ({
  isOpen,
  onClose,
  onOpenCarnet,
  onJumpToRegion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | RegionId>('all');

  if (!isOpen) return null;

  const filteredNodes = CIBERBASES_NODES.filter((node) => {
    const matchesFilter = selectedFilter === 'all' || node.region === selectedFilter;
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.focoPrioritario.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRegionBadge = (region: RegionId) => {
    switch (region) {
      case 'quebrada':
        return { label: 'Quebrada', color: 'text-[#EE007C] border-[#EE007C]/40 bg-[#EE007C]/10' };
      case 'puna':
        return { label: 'Puna', color: 'text-[#00AEEF] border-[#00AEEF]/40 bg-[#00AEEF]/10' };
      case 'valles':
        return { label: 'Valles', color: 'text-[#F8C300] border-[#F8C300]/40 bg-[#F8C300]/10' };
      case 'yungas':
        return { label: 'Yungas', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0C2340] border border-[#00AEEF]/50 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0C2340]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00AEEF] flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-montserrat text-white uppercase tracking-wider">
                Red Territorial de Ciberbases
              </h2>
              <p className="text-xs text-slate-400">
                Puntos de organización territorial y digital en los municipios jujeños
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundscape.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-6 border-b border-white/10 bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por localidad o problemática..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
            />
          </div>

          {/* Filtros por Región */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(['all', 'quebrada', 'puna', 'valles', 'yungas'] as const).map((reg) => (
              <button
                key={reg}
                onClick={() => {
                  soundscape.playClick();
                  setSelectedFilter(reg);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === reg
                    ? 'bg-white text-slate-950 shadow'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {reg === 'all' ? 'Todas' : reg.charAt(0).toUpperCase() + reg.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Ciberbases */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {filteredNodes.map((node) => {
            const badge = getRegionBadge(node.region);
            return (
              <div
                key={node.id}
                className="p-4 bg-slate-900/70 border border-white/10 hover:border-[#00AEEF]/50 rounded-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#F8C300]" />
                      {node.membersCount} militantes
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-montserrat text-white group-hover:text-[#00AEEF] transition-colors">
                    {node.name}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#EE007C]" />
                    <span>Municipio: {node.municipio}</span>
                  </p>

                  <div className="mt-3 p-2.5 bg-black/30 rounded-lg text-xs text-slate-300">
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                      Foco Prioritario:
                    </span>
                    {node.focoPrioritario}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      soundscape.playClick();
                      onJumpToRegion(node.region);
                      onClose();
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Ver en 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      soundscape.playClick();
                      onOpenCarnet(node.municipio);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-[#EE007C] hover:bg-[#d4006e] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Sumarme Aquí</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400">
            ¿Tu barrio o municipio no figura en la lista?{' '}
            <button
              onClick={() => {
                soundscape.playClick();
                onOpenCarnet();
                onClose();
              }}
              className="text-[#00AEEF] font-bold hover:underline cursor-pointer"
            >
              Creá tu carnet y abrí la ciberbase de tu localidad
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
