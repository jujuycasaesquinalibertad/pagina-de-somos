import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CinematicCanvasProps {
  currentSlideIndex: number;
  slides: {
    id: string;
    title: string;
    subtitle: string;
    imagePath: string;
  }[];
}

export const CinematicCanvas: React.FC<CinematicCanvasProps> = ({
  currentSlideIndex,
  slides,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, speed: 0 });
  const prevSlideRef = useRef(currentSlideIndex);
  const transitionProgress = useRef(1.0);

  useEffect(() => {
    prevSlideRef.current = currentSlideIndex;
    transitionProgress.current = 0.0;
  }, [currentSlideIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Renderer WebGL
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // 2. Carga de texturas fotográficas auténticas de Jujuy
    const textureLoader = new THREE.TextureLoader();
    const loadedTextures = slides.map((slide) => {
      const tex = textureLoader.load(
        slide.imagePath,
        () => {
          if (materialRef.current) {
            materialRef.current.needsUpdate = true;
          }
        },
        undefined,
        (err) => {
          console.warn(`[CinematicCanvas] Error cargando textura ${slide.imagePath}:`, err);
        }
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    });
    texturesRef.current = loadedTextures;

    // 3. Shader GLSL de Distorsión Líquida e Interacción de Ondas (Estilo Awwwards / OHZI)
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTextureCurrent;
      uniform sampler2D uTexturePrev;
      uniform float uProgress;
      uniform vec2 uMouse;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uImageResolution;
      varying vec2 vUv;

      // Deformación líquida sinusoidal orgánica
      vec2 liquidDistortion(vec2 uv, vec2 mouse, float strength) {
        float dist = distance(uv, mouse);
        float wave = sin(dist * 18.0 - uTime * 2.5) * exp(-dist * 3.5);
        vec2 dir = normalize(uv - mouse);
        return uv + dir * wave * strength;
      }

      // Corrección de aspecto cover para imágenes a pantalla completa
      vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
        float screenAspect = screenRes.x / screenRes.y;
        float imgAspect = imgRes.x / imgRes.y;
        vec2 newUv = uv;
        if (screenAspect > imgAspect) {
          float scale = screenAspect / imgAspect;
          newUv.y = (uv.y - 0.5) * (1.0 / scale) + 0.5;
        } else {
          float scale = imgAspect / screenAspect;
          newUv.x = (uv.x - 0.5) * (1.0 / scale) + 0.5;
        }
        return newUv;
      }

      void main() {
        vec2 coverUv = getCoverUv(vUv, uResolution, uImageResolution);
        
        // Efecto de ondulación líquida reactivo al cursor
        vec2 distortedUv = liquidDistortion(coverUv, uMouse, 0.022);

        // Dispersión cromática sutil en los bordes de la onda
        float r = texture2D(uTextureCurrent, distortedUv + vec2(0.0018, 0.0) * (1.0 - uProgress)).r;
        float g = texture2D(uTextureCurrent, distortedUv).g;
        float b = texture2D(uTextureCurrent, distortedUv - vec2(0.0018, 0.0) * (1.0 - uProgress)).b;
        vec4 currentCol = vec4(r, g, b, 1.0);

        vec4 prevCol = texture2D(uTexturePrev, distortedUv);

        // Transición de fundido cruzado cinemático
        float t = smoothstep(0.0, 1.0, uProgress);
        vec4 finalColor = mix(prevCol, currentCol, t);

        // Viñeteado oscuro cinemático para acentuar la atmósfera y legibilidad de textos
        float vignette = 1.0 - smoothstep(0.4, 1.4, length(vUv - 0.5));
        finalColor.rgb *= (0.75 + 0.25 * vignette);

        // Tinte institucional sutil de profundidad azul noche en las sombras
        vec3 shadowTint = vec3(0.047, 0.137, 0.251); // #0C2340
        finalColor.rgb = mix(shadowTint, finalColor.rgb, 0.88);

        gl_FragColor = finalColor;
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTextureCurrent: { value: loadedTextures[currentSlideIndex] || null },
        uTexturePrev: { value: loadedTextures[currentSlideIndex] || null },
        uProgress: { value: 1.0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        uImageResolution: { value: new THREE.Vector2(1920, 1080) },
      },
    });
    materialRef.current = shaderMaterial;

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial);
    scene.add(quad);

    // 4. Partículas Flotantes de Polvo Dorado y Viento (Three.js real)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colors = [
      new THREE.Color(0xf8c300), // Sol Dorado
      new THREE.Color(0x00aeef), // Celeste Patrio
      new THREE.Color(0xee007c), // Magenta SOMOS
      new THREE.Color(0xffffff), // Blanco puro
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 2;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      particlePos[i * 3 + 2] = 0;

      const col = colors[i % colors.length];
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 5. Manejo del Cursor y Táctil con Inercia Líquida
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = 1.0 - (e.clientY - rect.top) / rect.height; // Inversión Y en WebGL
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const nx = (touch.clientX - rect.left) / rect.width;
        const ny = 1.0 - (touch.clientY - rect.top) / rect.height;
        mouseRef.current.targetX = nx;
        mouseRef.current.targetY = ny;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      if (!container || !renderer || !materialRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      materialRef.current.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 6. Loop de Animación Continuo
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Suavizado del cursor (Damping)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsed;
        materialRef.current.uniforms.uMouse.value.set(
          mouseRef.current.x,
          mouseRef.current.y
        );

        // Transición suave de slide
        if (transitionProgress.current < 1.0) {
          transitionProgress.current = Math.min(1.0, transitionProgress.current + delta * 1.5);
          materialRef.current.uniforms.uProgress.value = transitionProgress.current;
        }
      }

      // Animación suave de partículas de polvo andino
      const pArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pArr[i * 3] += Math.sin(elapsed * 0.5 + i) * 0.0004 - 0.0002;
        pArr[i * 3 + 1] += Math.cos(elapsed * 0.3 + i) * 0.0003;

        // Wrap around
        if (pArr[i * 3] < -1.0) pArr[i * 3] = 1.0;
        if (pArr[i * 3] > 1.0) pArr[i * 3] = -1.0;
        if (pArr[i * 3 + 1] < -1.0) pArr[i * 3 + 1] = 1.0;
        if (pArr[i * 3 + 1] > 1.0) pArr[i * 3 + 1] = -1.0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);

      quad.geometry.dispose();
      shaderMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [slides]);

  // Actualización de texturas al cambiar de diapositiva
  useEffect(() => {
    if (materialRef.current && texturesRef.current.length > 0) {
      const prevTex = materialRef.current.uniforms.uTextureCurrent.value;
      const nextTex = texturesRef.current[currentSlideIndex];
      materialRef.current.uniforms.uTexturePrev.value = prevTex;
      materialRef.current.uniforms.uTextureCurrent.value = nextTex;
      materialRef.current.uniforms.uProgress.value = 0.0;
      transitionProgress.current = 0.0;
    }
  }, [currentSlideIndex]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <div ref={mountRef} className="w-full h-full pointer-events-auto" />
    </div>
  );
};
