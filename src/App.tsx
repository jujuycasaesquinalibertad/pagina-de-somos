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

import imgYungas from './assets/images/jujuy_yungas_mist_1793819887266.jpg';
import imgHornocal from './assets/images/jujuy_hornocal_strata_1793819888783.jpg';
import imgSalinas from './assets/images/jujuy_salinas_grandes_1793819889557.jpg';
import imgComunidad from './assets/images/jujuy_comunidad_encuentro_1793819889846.jpg';

const SLIDE_IMAGES = [
  imgYungas,
  imgHornocal,
  imgSalinas,
  imgComunidad,
];

const SLIDES = CAMPAIGN_COPY.slides.map((slide, idx) => ({
  ...slide,
  imagePath: SLIDE_IMAGES[idx],
}));

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarnetOpen, setIsCarnetOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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
    <div className="relative w-screen h-screen overflow-hidden bg-[#0C2340] text-slate-100 select-none font-sans">
      {/* 1. Barra de Navegación Superior Limpia con Redes Oficiales */}
      <TopBar onOpenCarnet={() => setIsCarnetOpen(true)} />

      {/* 2. Lienzo WebGL Cinemático con Distorsión Líquida y Partículas */}
      <CinematicCanvas currentSlideIndex={currentSlide} slides={SLIDES} />

      {/* 3. Contenido Editorial Inmersivo en Pantalla Completa */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between pt-24 pb-10 px-6 sm:px-12 md:px-20 pointer-events-none">
        {/* Encabezado del Slide Actual */}
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.25em] text-white/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EE007C]" />
            <span className="text-[#00AEEF] font-bold">{activeSlide.tag}</span>
            <span className="text-white/40">·</span>
            <span>{activeSlide.location}</span>
          </div>

          <div className="hidden sm:block text-slate-300 font-sans tracking-normal text-xs">
            {CAMPAIGN_COPY.controls.navigationHint}
          </div>
        </div>

        {/* Título Principal Editorial y Llamado a la Acción */}
        <div className="max-w-3xl pointer-events-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-montserrat text-white leading-[1.08] tracking-tight drop-shadow-xl">
            {activeSlide.title}
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-200/90 leading-relaxed font-sans max-w-2xl drop-shadow-md">
            {activeSlide.subtitle}
          </p>

          {/* Lema Institucional / Hook Final */}
          <div className="mt-4 inline-flex items-center gap-2 py-1.5 px-3.5 bg-black/40 backdrop-blur-md border border-white/15 rounded-xl shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#EE007C] shrink-0" />
            <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-white font-montserrat">
              {CAMPAIGN_COPY.brand.hookFinal}
            </span>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                soundscape.playClick();
                setIsCarnetOpen(true);
              }}
              className="py-3 px-6 bg-[#EE007C] hover:bg-[#d4006e] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-2xl transition-all active:scale-95 cursor-pointer"
            >
              <IdCard className="w-4 h-4" />
              <span>{CAMPAIGN_COPY.controls.heroCtaButton}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {/* Control de Audio con Nombre del Paisaje Sonoro Activo */}
            <button
              onClick={handleAudioToggle}
              className={`py-3 px-4 rounded-xl text-xs font-semibold border backdrop-blur-md flex items-center gap-2.5 transition-colors cursor-pointer ${
                isPlayingAudio && !isMuted
                  ? 'bg-[#00AEEF]/20 border-[#00AEEF] text-[#00AEEF]'
                  : 'bg-black/40 border-white/20 text-slate-300 hover:text-white'
              }`}
            >
              {isPlayingAudio && !isMuted ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#00AEEF]" />
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-[#00AEEF] animate-pulse" />
                    <span className="w-0.5 h-3 bg-[#00AEEF] animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-[#00AEEF] animate-pulse delay-150" />
                  </div>
                  <span>{activeSlide.soundName}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>
                    {CAMPAIGN_COPY.controls.audioInactivePrefix} {activeSlide.soundName}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Barra de Navegación de Diapositivas (Dock Inferior Minimalista) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/10 pointer-events-auto">
          {/* Selector de Paisajes */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            {SLIDES.map((slide, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => {
                    soundscape.playRegionTransition(idx);
                    setCurrentSlide(idx);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0C2340] font-bold shadow-lg'
                      : 'bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 border border-white/5'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-[#EE007C]' : 'bg-slate-400'
                    }`}
                  />
                  <span>{slide.tag.split(' / ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Flechas de Navegación Anterior / Siguiente */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundscape.playClick();
                setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
              }}
              className="p-2.5 bg-black/40 hover:bg-black/70 border border-white/15 rounded-xl text-white transition-colors cursor-pointer"
              title="Anterior [←]"
              aria-label={CAMPAIGN_COPY.controls.previousAria}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-slate-300 px-2">
              0{currentSlide + 1} / 0{SLIDES.length}
            </span>

            <button
              onClick={() => {
                soundscape.playClick();
                setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
              }}
              className="p-2.5 bg-black/40 hover:bg-black/70 border border-white/15 rounded-xl text-white transition-colors cursor-pointer"
              title="Siguiente [→]"
              aria-label={CAMPAIGN_COPY.controls.nextAria}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Modal de Carnet Oficial de Afiliación (Padrón Permanente con Números Únicos) */}
      <CarnetModal isOpen={isCarnetOpen} onClose={() => setIsCarnetOpen(false)} />
    </div>
  );
}
