import React from 'react';
import { X, BookOpen, Heart, ArrowRight } from 'lucide-react';
import { SomosLogo } from '../ui/SomosLogo';
import { soundscape } from '../../audio/soundscape';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCarnet: () => void;
}

export const ManifestoModal: React.FC<ManifestoModalProps> = ({
  isOpen,
  onClose,
  onOpenCarnet,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0C2340] border border-[#00AEEF]/50 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0C2340]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00AEEF] flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-montserrat text-white uppercase tracking-wider">
                Manifiesto y Fundamentos Políticos
              </h2>
              <p className="text-xs text-slate-400">
                Plataforma de Identidad Política y Marco Estratégico · SOMOS Jujuy
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundscape.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar manifiesto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Manifiesto */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-200 text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Logo y Kicker */}
          <div className="text-center py-2">
            <SomosLogo size="lg" showSubtitle={true} variant="light" className="mx-auto" />
            <p className="font-merriweather italic text-slate-300 mt-4 text-base max-w-lg mx-auto">
              «Cercanía Radicada y Dignidad Material»
            </p>
          </div>

          {/* Propósito y Misión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-900/80 border border-[#EE007C]/40 rounded-xl">
              <span className="text-[11px] font-bold text-[#EE007C] uppercase tracking-wider block mb-1">
                Nuestro Propósito
              </span>
              <p className="text-sm font-medium text-white leading-relaxed">
                Devolver a la comunidad jujeña la dignidad material, el protagonismo participativo y la
                certeza de prosperar en su propia tierra.
              </p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-[#00AEEF]/40 rounded-xl">
              <span className="text-[11px] font-bold text-[#00AEEF] uppercase tracking-wider block mb-1">
                Nuestra Misión
              </span>
              <p className="text-sm font-medium text-white leading-relaxed">
                Organizar una fuerza política transparente que combine ciberbases digitales con
                movilización territorial de base en cada municipio.
              </p>
            </div>
          </div>

          {/* Los 3 Pilares Rectores */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="font-montserrat font-bold text-white text-base uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#EE007C]" />
              Tres Pilares del Arraigo Popular
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/50 rounded-xl border border-white/5">
                <span className="font-bold text-white text-xs block mb-1">
                  1. Autenticidad Raw: Realidad sin Maquillaje
                </span>
                <p className="text-xs text-slate-300">
                  Imágenes y relatos reales de la calle, las ferias, las escuelas y los talleres jujeños.
                  Sin retoques de estudio ni sobreproducción publicitaria artificial.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/50 rounded-xl border border-white/5">
                <span className="font-bold text-white text-xs block mb-1">
                  2. Foco Material: Lo que Cuesta Vivir
                </span>
                <p className="text-xs text-slate-300">
                  Priorizamos números reales: salarios docentes y de salud, tarifas de energía y luz,
                  costos de transporte y planes de acceso a tierra y vivienda con la máxima claridad.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/50 rounded-xl border border-white/5">
                <span className="font-bold text-white text-xs block mb-1">
                  3. Arraigo Jujeño y Ayni Comunitario
                </span>
                <p className="text-xs text-slate-300">
                  Integración del afecto comunitario andino y los colores patrios, huyendo del folclorismo
                  meramente decorativo para construir soberanía viva.
                </p>
              </div>
            </div>
          </div>

          {/* Tono de Acción */}
          <div className="p-4 bg-[#0C2340] border border-[#F8C300]/40 rounded-xl">
            <span className="text-[11px] font-bold text-[#F8C300] uppercase tracking-wider block mb-1">
              Nuestro Compromiso Verbal y Político
            </span>
            <p className="font-merriweather text-xs text-slate-200 italic leading-relaxed">
              «Llegar a fin de mes en Jujuy no puede ser una hazaña. Hablamos con claridad, cercanía,
              firmeza y rigor técnico. Evitamos la jerga vacía y la agresión estéril, priorizando la
              organización con nuestros vecinos.»
            </p>
          </div>
        </div>

        {/* Footer con CTA */}
        <div className="p-6 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            SOMOS Jujuy es un espacio abierto a cada ciudadana y ciudadano de la provincia.
          </p>
          <button
            onClick={() => {
              soundscape.playClick();
              onClose();
              onOpenCarnet();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#EE007C] hover:bg-[#d4006e] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
          >
            <span>Generar Mi Carnet de Afiliación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
