import React, { useState, useEffect } from 'react';
import { TopBar } from './components/ui/TopBar';
import { CinematicCanvas } from './components/scene/CinematicCanvas';
import { CarnetModal } from './components/carnet/CarnetModal';
import { soundscape } from './audio/soundscape';
import { CAMPAIGN_COPY } from './data/campaignCopy';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  IdCard,
} from 'lucide-react';

// Fotografías reales documentales de Jujuy bajo licencia libre Creative Commons
import imgYungas from './assets/images/real_yungas_desktop.jpg';
import imgHornocal from './assets/images/real_hornocal_desktop.jpg';
import imgSalinas from './assets/images/real_salinas_desktop.jpg';
import imgComunidad from './assets/images/real_comunidad_desktop.jpg';

import imgYungasPortrait from './assets/images/real_yungas_mobile.jpg';
import imgHornocalPortrait from './assets/images/real_hornocal_mobile.jpg';
import imgSalinasPortrait from './assets/images/real_salinas_mobile.jpg';
import imgComunidadPortrait from './assets/images/real_comunidad_mobile.jpg';

const SLIDE_IMAGES = [
  imgYungas,
  imgHornocal,
  imgSalinas,
  imgComunidad,
];

const SLIDE_PORTRAIT_IMAGES = [
  imgYungasPortrait,
  imgHornocalPortrait,
  imgSalinasPortrait,
  imgComunidadPortrait,
];

const SLIDES = CAMPAIGN_COPY.slides.map((slide, idx) => ({
  ...slide,
  imagePath: SLIDE_IMAGES[idx],
  mobileImagePath: SLIDE_PORTRAIT_IMAGES[idx],
}));

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarnetOpen, setIsCarnetOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Detección de gestos táctiles (Swipe) para dispositivos móviles
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Solo deslizar si el movimiento horizontal es mayor que el vertical (swipe intencional)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Deslizar izquierda -> siguiente
        soundscape.playClick();
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      } else {
        // Deslizar derecha -> anterior
        soundscape.playClick();
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    return soundscape.subscribe((playing, muted) => {
      setIsPlayingAudio(playing);
      setIsMuted(muted);
    });
  }, []);

  // Actualizar el paisaje sonoro específico al cambiar de diapositiva
  useEffect(() => {
    soundscape.setLandscapeByIndex(currentSlide);
  }, [currentSlide]);

  // Atajos de teclado para navegación fluida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        soundscape.playClick();
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      } else if (e.key === 'ArrowLeft') {
        soundscape.playClick();
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        soundscape.playRegionTransition(Number(e.key) - 1);
        setCurrentSlide(Number(e.key) - 1);
      } else if (e.key === 'Escape') {
        setIsCarnetOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAudioToggle = () => {
    soundscape.playClick();
    if (!isPlayingAudio) {
      soundscape.startAmbient();
    } else {
      soundscape.toggleMute();
    }
  };

  const activeSlide = SLIDES[currentSlide];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#0C2340] text-slate-100 select-none font-sans"
    >
      {/* 1. Barra de Navegación Superior Limpia con Redes Oficiales */}
      <TopBar onOpenCarnet={() => setIsCarnetOpen(true)} />

      {/* 2. Lienzo WebGL Cinemático con Distorsión Líquida y Partículas (Dual Desktop/Móvil) */}
      <CinematicCanvas currentSlideIndex={currentSlide} slides={SLIDES} />

      {/* 3. Contenido Editorial Inmersivo en Pantalla Completa (Adaptado a móviles) */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between pt-16 sm:pt-24 pb-3 sm:pb-8 px-4 sm:px-12 md:px-20 pointer-events-none">
        {/* Encabezado del Slide Actual */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-[0.25em] text-white/80">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EE007C] shrink-0 animate-pulse" />
            <span className="text-[#00AEEF] font-bold">{activeSlide.tag}</span>
            <span className="text-white/40">·</span>
            <span className="truncate max-w-[150px] sm:max-w-none">{activeSlide.location}</span>
          </div>

          <div className="hidden sm:block text-slate-300 font-sans tracking-normal text-xs">
            {CAMPAIGN_COPY.controls.navigationHint}
          </div>

          {/* Indicador táctil sutil en móviles */}
          <div className="sm:hidden text-[10px] text-white/60 font-sans tracking-normal bg-black/30 px-2 py-0.5 rounded-full border border-white/10">
            Desliza ⟷
          </div>
        </div>

        {/* Título Principal Editorial y Llamado a la Acción */}
        <div className="max-w-3xl pointer-events-auto my-auto sm:my-0">
          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black font-montserrat text-white leading-[1.12] sm:leading-[1.08] tracking-tight drop-shadow-2xl">
            {activeSlide.title}
          </h1>

          <p className="mt-2.5 sm:mt-5 text-xs sm:text-base md:text-lg text-slate-200/90 leading-relaxed font-sans max-w-2xl drop-shadow-md line-clamp-3 sm:line-clamp-none">
            {activeSlide.subtitle}
          </p>

          {/* Lema Institucional / Hook Final */}
          <div className="mt-2.5 sm:mt-4 inline-flex items-center gap-2 py-1 sm:py-1.5 px-2.5 sm:px-3.5 bg-black/50 backdrop-blur-md border border-white/15 rounded-xl shadow-lg">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#EE007C] shrink-0" />
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-white font-montserrat">
              {CAMPAIGN_COPY.brand.hookFinal}
            </span>
          </div>

          {/* Botones de Acción Optimizados para Móvil y Desktop */}
          <div className="mt-3.5 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 max-w-md sm:max-w-none">
            <button
              onClick={() => {
                soundscape.playClick();
                setIsCarnetOpen(true);
              }}
              className="py-2.5 sm:py-3 px-5 sm:px-6 bg-[#EE007C] hover:bg-[#d4006e] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-95 cursor-pointer"
            >
              <IdCard className="w-4 h-4 shrink-0" />
              <span>{CAMPAIGN_COPY.controls.heroCtaButton}</span>
              <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
            </button>

            {/* Control de Audio con Nombre del Paisaje Sonoro Activo */}
            <button
              onClick={handleAudioToggle}
              className={`py-2 sm:py-3 px-3.5 sm:px-4 rounded-xl text-xs font-semibold border backdrop-blur-md flex items-center justify-center gap-2.5 transition-colors cursor-pointer ${
                isPlayingAudio && !isMuted
                  ? 'bg-[#00AEEF]/20 border-[#00AEEF] text-[#00AEEF]'
                  : 'bg-black/50 border-white/20 text-slate-300 hover:text-white'
              }`}
            >
              {isPlayingAudio && !isMuted ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#00AEEF] shrink-0" />
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-[#00AEEF] animate-pulse" />
                    <span className="w-0.5 h-3 bg-[#00AEEF] animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-[#00AEEF] animate-pulse delay-150" />
                  </div>
                  <span className="truncate">{activeSlide.soundName}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {CAMPAIGN_COPY.controls.audioInactivePrefix} {activeSlide.soundName}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Barra de Navegación de Diapositivas (Dock Inferior sin recortes) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 pt-2.5 sm:pt-6 border-t border-white/10 pointer-events-auto">
          {/* Selector de Paisajes */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            {SLIDES.map((slide, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => {
                    soundscape.playRegionTransition(idx);
                    setCurrentSlide(idx);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white text-[#0C2340] font-bold shadow-lg'
                      : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/70 border border-white/10'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isActive ? 'bg-[#EE007C]' : 'bg-slate-400'
                    }`}
                  />
                  <span>{slide.tag.split(' / ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Flechas de Navegación Anterior / Siguiente */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="sm:hidden text-[10px] text-slate-400 font-mono">
              Región 0{currentSlide + 1} de 0{SLIDES.length}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  soundscape.playClick();
                  setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
                }}
                className="p-2 sm:p-2.5 bg-black/50 hover:bg-black/70 border border-white/15 rounded-xl text-white transition-colors cursor-pointer active:scale-95"
                title="Anterior [←]"
                aria-label={CAMPAIGN_COPY.controls.previousAria}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="hidden sm:inline-block text-xs font-mono text-slate-300 px-2">
                0{currentSlide + 1} / 0{SLIDES.length}
              </span>

              <button
                onClick={() => {
                  soundscape.playClick();
                  setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
                }}
                className="p-2 sm:p-2.5 bg-black/50 hover:bg-black/70 border border-white/15 rounded-xl text-white transition-colors cursor-pointer active:scale-95"
                title="Siguiente [→]"
                aria-label={CAMPAIGN_COPY.controls.nextAria}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Modal de Carnet Oficial de Afiliación (Padrón Permanente con Números Únicos) */}
      <CarnetModal isOpen={isCarnetOpen} onClose={() => setIsCarnetOpen(false)} />
    </div>
  );
}
