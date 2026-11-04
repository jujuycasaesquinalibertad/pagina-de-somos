/**
 * Motor de Paisajes Sonoros Procedurales Diferenciados por Región (Web Audio API)
 * Cada una de las 4 imágenes de Jujuy tiene su propia firma sonora procedural:
 * 0. Yungas: Selva subtropical, gotas de niebla y brisa húmeda de montaña
 * 1. Hornocal: Viento de quebrada, armónicos de quena y resonancia de cañadones
 * 2. Salinas Grandes: Silencio cristalino de salar, resonancia de cuarzo y aire diáfano
 * 3. Comunidad: Pulso cardíaco humano, acordes cálidos acústicos y esperanza popular
 */

type LandscapeType = 'yungas' | 'hornocal' | 'salinas' | 'comunidad';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentLandscapeGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private currentLandscape: LandscapeType = 'yungas';
  private activeNodes: AudioNode[] = [];
  private rainInterval: number | null = null;
  private birdInterval: number | null = null;
  private pulseInterval: number | null = null;
  private listeners: Set<(isPlaying: boolean, isMuted: boolean, landscape: LandscapeType) => void> = new Set();

  private initContext() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public subscribe(fn: (isPlaying: boolean, isMuted: boolean, landscape: LandscapeType) => void) {
    this.listeners.add(fn);
    fn(this.isPlaying, this.isMuted, this.currentLandscape);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isPlaying, this.isMuted, this.currentLandscape));
  }

  // -------------------------------------------------------------
  // GENERADORES SONOROS ESPECÍFICOS PARA CADA PAISAJE
  // -------------------------------------------------------------

  // 1. YUNGAS: Brisa de selva, micro-gotas de nuboselva y trinos distantes
  private buildYungasSoundscape(dest: GainNode) {
    if (!this.ctx) return;

    // A. Brisa húmeda filtrada (Ruido rosa de baja frecuencia)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noiseSource.start();
    this.activeNodes.push(noiseSource);

    // B. Pad cálido y húmedo (acorde en Sol Mayor / Do)
    [196.0, 246.94, 293.66].forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      oscGain.gain.setValueAtTime(0.04 / (i + 1), this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start();
      this.activeNodes.push(osc);
    });

    // C. Micro-gotas procedurales periódicas
    this.rainInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || this.isMuted) return;
      try {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const freq = 1600 + Math.random() * 800;
        const now = this.ctx.currentTime;

        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(freq, now);
        dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.06);

        dropGain.gain.setValueAtTime(0.015, now);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        dropOsc.connect(dropGain);
        dropGain.connect(dest);
        dropOsc.start(now);
        dropOsc.stop(now + 0.07);
      } catch {
        // Safe
      }
    }, 450);
  }

  // 2. HORNOCAL / QUEBRADA: Viento de quebrada y armónicos de quena andina
  private buildHornocalSoundscape(dest: GainNode) {
    if (!this.ctx) return;

    // A. Viento de quebrada con barrido de cañadón
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const wind = this.ctx.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // LFO que modula el silbido del viento
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(windFilter.frequency);
    lfo.start();
    this.activeNodes.push(lfo);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(dest);
    wind.start();
    this.activeNodes.push(wind);

    // B. Armónicos de quena / siku andino (pentatónica en La menor: A3, E4, A4)
    [220.0, 329.63, 440.0].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Trémolo de aliento andino
      const breathLfo = this.ctx.createOscillator();
      const breathGain = this.ctx.createGain();
      breathLfo.frequency.setValueAtTime(4.5, this.ctx.currentTime);
      breathGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      breathLfo.connect(osc.frequency);
      breathLfo.start();
      this.activeNodes.push(breathLfo);

      gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      this.activeNodes.push(osc);
    });
  }

  // 3. SALINAS GRANDES / PUNA: Silencio cristalino y cuencos de sal
  private buildSalinasSoundscape(dest: GainNode) {
    if (!this.ctx) return;

    // A. Aire diáfano y frío de altura (filtro pasa-altos)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }

    const air = this.ctx.createBufferSource();
    air.buffer = noiseBuffer;
    air.loop = true;

    const airFilter = this.ctx.createBiquadFilter();
    airFilter.type = 'highpass';
    airFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);

    const airGain = this.ctx.createGain();
    airGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(dest);
    air.start();
    this.activeNodes.push(air);

    // B. Resonancia cristalina pura (tonos puros de cuarzo a 528Hz y 880Hz)
    [528.0, 792.0, 1056.0].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.025 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      this.activeNodes.push(osc);
    });
  }

  // 4. COMUNIDAD: Pulso de corazón humano y acordes cálidos de encuentro
  private buildComunidadSoundscape(dest: GainNode) {
    if (!this.ctx) return;

    // A. Acordes cálidos de charango / guitarra andina (Do Mayor / La Menor)
    [130.81, 164.81, 196.0, 261.63, 329.63].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.028 / (idx + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start();
      this.activeNodes.push(osc);
    });

    // B. Pulso rítmico cardíaco sutil (65 BPM) representando el latido popular
    this.pulseInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(65, now);
        subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

        subGain.gain.setValueAtTime(0.09, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        subOsc.connect(subGain);
        subGain.connect(dest);
        subOsc.start(now);
        subOsc.stop(now + 0.18);
      } catch {
        // Safe
      }
    }, 920);
  }

  // -------------------------------------------------------------
  // CONTROL Y TRANSICIONES SUAVES (CROSSFADE)
  // -------------------------------------------------------------

  public setLandscapeByIndex(index: number) {
    const landscapes: LandscapeType[] = ['yungas', 'hornocal', 'salinas', 'comunidad'];
    const chosen = landscapes[index % landscapes.length];
    this.transitionToLandscape(chosen);
  }

  public transitionToLandscape(newLandscape: LandscapeType) {
    this.currentLandscape = newLandscape;
    if (!this.isPlaying) {
      this.notify();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Detener intervalos anteriores
    if (this.rainInterval) {
      clearInterval(this.rainInterval);
      this.rainInterval = null;
    }
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }

    // Crear un nuevo nodo de ganancia para el nuevo paisaje con fundido cruzado (fade-in)
    const newGain = this.ctx.createGain();
    newGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    newGain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 0.8);
    newGain.connect(this.masterGain);

    // Apagar con fade-out el anterior si existe
    if (this.currentLandscapeGain) {
      const oldGain = this.currentLandscapeGain;
      oldGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      setTimeout(() => {
        try {
          oldGain.disconnect();
        } catch {
          // Safe
        }
      }, 700);
    }

    // Detener osciladores viejos
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as unknown as { stop: () => void }).stop === 'function') {
          (node as unknown as { stop: () => void }).stop();
        }
        node.disconnect();
      } catch {
        // Safe
      }
    });
    this.activeNodes = [];

    this.currentLandscapeGain = newGain;

    // Construir la nueva atmósfera según la imagen activa
    switch (newLandscape) {
      case 'yungas':
        this.buildYungasSoundscape(newGain);
        break;
      case 'hornocal':
        this.buildHornocalSoundscape(newGain);
        break;
      case 'salinas':
        this.buildSalinasSoundscape(newGain);
        break;
      case 'comunidad':
        this.buildComunidadSoundscape(newGain);
        break;
    }

    this.notify();
  }

  public async startAmbient() {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isPlaying = true;
    this.transitionToLandscape(this.currentLandscape);
  }

  public stopAmbient() {
    this.isPlaying = false;
    if (this.rainInterval) clearInterval(this.rainInterval);
    if (this.pulseInterval) clearInterval(this.pulseInterval);
    this.rainInterval = null;
    this.pulseInterval = null;

    if (this.currentLandscapeGain && this.ctx) {
      this.currentLandscapeGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    }

    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as unknown as { stop: () => void }).stop === 'function') {
          (node as unknown as { stop: () => void }).stop();
        }
        node.disconnect();
      } catch {
        // Safe
      }
    });
    this.activeNodes = [];
    this.notify();
  }

  public toggleAmbient() {
    if (this.isPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  public toggleMute() {
    this.initContext();
    if (!this.masterGain || !this.ctx) return;
    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0.0001 : 0.7;
    this.masterGain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 0.15);
    this.notify();
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Safe
    }
  }

  public playCarnetIssued() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteTime = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    } catch {
      // Safe
    }
  }

  public playRegionTransition(index: number = 0) {
    this.setLandscapeByIndex(index);
    this.playClick();
  }
}

export const soundscape = new SoundscapeEngine();
