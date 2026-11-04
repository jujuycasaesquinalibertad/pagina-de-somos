import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RegionId, CiberbaseNode } from '../../types';
import { REGIONS_DATA, CIBERBASES_NODES } from '../../data/regionsData';
import { soundscape } from '../../audio/soundscape';

interface ScenicCanvasProps {
  activeRegion: RegionId;
  onSelectNode: (node: CiberbaseNode) => void;
  isCinemaMode?: boolean;
}

// Reusable scratch vectors to avoid Garbage Collection in render loop
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _currentLook = new THREE.Vector3(0, 4, 0);

// Algoritmo procedural de ruido fractal para modelar relieve natural y geológico
function pseudoNoise(x: number, z: number): number {
  const sinVal = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return sinVal - Math.floor(sinVal);
}

function smoothNoise(x: number, z: number): number {
  const iX = Math.floor(x);
  const iZ = Math.floor(z);
  const fX = x - iX;
  const fZ = z - iZ;

  // Curva de interpolación suave (Hermite / Smoothstep)
  const u = fX * fX * (3.0 - 2.0 * fX);
  const v = fZ * fZ * (3.0 - 2.0 * fZ);

  const n00 = pseudoNoise(iX, iZ);
  const n10 = pseudoNoise(iX + 1, iZ);
  const n01 = pseudoNoise(iX, iZ + 1);
  const n11 = pseudoNoise(iX + 1, iZ + 1);

  return (
    n00 * (1.0 - u) * (1.0 - v) +
    n10 * u * (1.0 - v) +
    n01 * (1.0 - u) * v +
    n11 * u * v
  );
}

// Fractal Brownian Motion (fBm) multi-octava para relieve montañoso realista
function fbm(x: number, z: number, octaves = 5): number {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, z * frequency);
    frequency *= 2.05;
    amplitude *= 0.5;
  }
  return value;
}

// Ruido de crestas agudas (Ridge Noise) para imitar las sierras del Hornocal y quebradas
function ridgeNoise(x: number, z: number): number {
  const n = fbm(x, z, 4);
  return 1.0 - Math.abs(n * 2.0 - 1.0);
}

export const ScenicCanvas: React.FC<ScenicCanvasProps> = ({
  activeRegion,
  onSelectNode,
  isCinemaMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CiberbaseNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const terrainMeshesRef = useRef<Record<RegionId, THREE.Mesh>>({} as Record<RegionId, THREE.Mesh>);
  const beaconMeshesRef = useRef<Map<THREE.Object3D, CiberbaseNode>>(new Map());
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointerNorm = useRef({ x: 0, y: 0 });
  const activeRegionRef = useRef<RegionId>(activeRegion);

  activeRegionRef.current = activeRegion;

  // Coordenadas cinemáticas naturales de cámara para cada paisaje
  const naturalCameraConfig: Record<RegionId, { x: number; y: number; z: number; tx: number; ty: number; tz: number }> = {
    quebrada: { x: 0, y: 16, z: 28, tx: 0, ty: 8, tz: -5 },
    puna: { x: -35, y: 12, z: 24, tx: -35, ty: 3, tz: -8 },
    valles: { x: 38, y: 14, z: 24, tx: 38, ty: 5, tz: -6 },
    yungas: { x: 2, y: 15, z: -38, tx: 2, ty: 6, tz: -65 },
  };

  const setCameraForRegion = useCallback((regionId: RegionId) => {
    const config = naturalCameraConfig[regionId];
    _camTarget.set(config.x, config.y, config.z);
    _lookTarget.set(config.tx, config.ty, config.tz);
  }, []);

  useEffect(() => {
    setCameraForRegion(activeRegion);
  }, [activeRegion, setCameraForRegion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detección de aceleración WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebGlSupported(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Escena y Niebla Atmosférica Natural
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c2340); // Azul Profundo
    scene.fog = new THREE.FogExp2(0x0c2340, 0.016);
    sceneRef.current = scene;

    // 3. Cámara Cinemática
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      350
    );
    const initialCam = naturalCameraConfig[activeRegionRef.current];
    camera.position.set(initialCam.x, initialCam.y, initialCam.z);
    camera.lookAt(initialCam.tx, initialCam.ty, initialCam.tz);
    _currentLook.set(initialCam.tx, initialCam.ty, initialCam.tz);
    cameraRef.current = camera;

    // 4. Reflejos de Entorno Natural (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Iluminación Solar Realista (Luz de atardecer andino)
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0c2340, 0.85);
    scene.add(hemiLight);

    // Sol andino dorado en ángulo bajo para proyectar sombras largas en las serranías
    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    sunLight.position.set(45, 55, 30);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 180;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00aeef, 0.7);
    rimLight.position.set(-40, 30, -30);
    scene.add(rimLight);

    // -------------------------------------------------------------
    // 6. GENERACIÓN DE PAISAJES NATURALES PROCEDURALES (SIN FIGURAS INFANTILES)
    // -------------------------------------------------------------

    // A. QUEBRADA DE HUMAHUACA - SERRANÍA DEL HORNOCAL (Estratos policromáticos reales)
    const hornocalGeo = new THREE.PlaneGeometry(55, 55, 120, 120);
    hornocalGeo.rotateX(-Math.PI / 2);
    const hornocalPos = hornocalGeo.attributes.position;
    const hornocalColors = new Float32Array(hornocalPos.count * 3);

    // Paleta mineral estratigráfica del Hornocal (14 colores naturales)
    const strataPalette = [
      new THREE.Color(0xb91c1c), // Óxido ferroso rojo
      new THREE.Color(0xd97706), // Ocre arcilloso
      new THREE.Color(0xfef08a), // Caliza amarillo pálido
      new THREE.Color(0x78350f), // Pardo tierra
      new THREE.Color(0x6b21a8), // Violeta mineral
      new THREE.Color(0x38bdf8), // Acento celeste andino
      new THREE.Color(0x475569), // Pizarra gris
    ];

    for (let i = 0; i < hornocalPos.count; i++) {
      const vx = hornocalPos.getX(i);
      const vz = hornocalPos.getZ(i);

      // Crestas triangulares naturales con ridge noise y gradiente de elevación hacia el fondo
      const distFromCenter = Math.sqrt(vx * vx + vz * vz);
      const ridge = Math.pow(ridgeNoise(vx * 0.12, vz * 0.12), 1.6);
      const detail = fbm(vx * 0.35, vz * 0.35, 3) * 1.8;
      const elevation = (ridge * 12.0 + detail) * Math.max(0.15, 1.0 - distFromCenter * 0.022);

      hornocalPos.setY(i, elevation);

      // Estratificación geológica sinusoidal que envuelve el relieve
      const strataIndex = Math.floor(Math.abs(elevation * 1.8 + Math.sin(vx * 0.5) * 1.2)) % strataPalette.length;
      const col = strataPalette[strataIndex];
      // Modulación por iluminación natural
      const shadowFactor = 0.8 + 0.2 * (elevation / 12.0);
      hornocalColors[i * 3] = col.r * shadowFactor;
      hornocalColors[i * 3 + 1] = col.g * shadowFactor;
      hornocalColors[i * 3 + 2] = col.b * shadowFactor;
    }

    hornocalGeo.setAttribute('color', new THREE.BufferAttribute(hornocalColors, 3));
    hornocalGeo.computeVertexNormals();

    const hornocalMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.08,
      flatShading: false,
    });
    const hornocalMesh = new THREE.Mesh(hornocalGeo, hornocalMat);
    hornocalMesh.position.set(0, 0, -5);
    hornocalMesh.receiveShadow = !isSoftwareGl;
    hornocalMesh.castShadow = !isSoftwareGl;
    scene.add(hornocalMesh);
    terrainMeshesRef.current.quebrada = hornocalMesh;

    // -------------------------------------------------------------
    // B. PUNA - SALINAS GRANDES (Inmensidad blanca, costras de sal y laguna de salmuera)
    const punaGroup = new THREE.Group();
    punaGroup.position.set(-35, 0, -8);

    // Salar plano infinito con micro-ondulación de costras de sal
    const saltGeo = new THREE.PlaneGeometry(60, 60, 80, 80);
    saltGeo.rotateX(-Math.PI / 2);
    const saltPos = saltGeo.attributes.position;
    const saltColors = new Float32Array(saltPos.count * 3);

    for (let i = 0; i < saltPos.count; i++) {
      const vx = saltPos.getX(i);
      const vz = saltPos.getZ(i);
      const saltCrust = smoothNoise(vx * 0.8, vz * 0.8) * 0.18;
      saltPos.setY(i, saltCrust);

      // Tonalidades de sal blanca brillante con vetas minerales suaves
      const brightness = 0.92 + 0.08 * saltCrust;
      saltColors[i * 3] = brightness;
      saltColors[i * 3 + 1] = brightness * 0.98;
      saltColors[i * 3 + 2] = brightness * 0.96;
    }
    saltGeo.setAttribute('color', new THREE.BufferAttribute(saltColors, 3));
    saltGeo.computeVertexNormals();

    const saltMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.3,
      metalness: 0.35,
    });
    const saltMesh = new THREE.Mesh(saltGeo, saltMat);
    saltMesh.receiveShadow = !isSoftwareGl;
    punaGroup.add(saltMesh);

    // Piscina natural de salmuera turquesa (espejo de agua cristalino)
    const poolGeo = new THREE.CircleGeometry(12, 64);
    poolGeo.rotateX(-Math.PI / 2);
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x00aeef,
      roughness: 0.08,
      metalness: 0.9,
    });
    const poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.position.set(0, 0.22, 2);
    punaGroup.add(poolMesh);

    // Silueta de Volcán lejano en el horizonte puneño
    const volcanoGeo = new THREE.ConeGeometry(14, 18, 32);
    const volcanoMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      flatShading: false,
    });
    const volcanoMesh = new THREE.Mesh(volcanoGeo, volcanoMat);
    volcanoMesh.position.set(4, 9, -24);
    punaGroup.add(volcanoMesh);

    scene.add(punaGroup);
    terrainMeshesRef.current.puna = saltMesh;

    // -------------------------------------------------------------
    // C. VALLES CENTRALES - VALLE DEL RÍO GRANDE (Lomas verdes y cauce serpenteante)
    const vallesGroup = new THREE.Group();
    vallesGroup.position.set(38, 0, -6);

    const vallesGeo = new THREE.PlaneGeometry(55, 55, 100, 100);
    vallesGeo.rotateX(-Math.PI / 2);
    const vallesPos = vallesGeo.attributes.position;
    const vallesColors = new Float32Array(vallesPos.count * 3);

    const greenLush = new THREE.Color(0x15803d); // Verde pastizal
    const greenForest = new THREE.Color(0x166534); // Verde bosque denso
    const soilEarth = new THREE.Color(0x78350f); // Tierra fértil

    for (let i = 0; i < vallesPos.count; i++) {
      const vx = vallesPos.getX(i);
      const vz = vallesPos.getZ(i);

      // Colinas onduladas suaves y depresión central del cauce del río
      const hills = fbm(vx * 0.1, vz * 0.1, 4) * 8.0;
      const riverBed = Math.pow(Math.sin(vx * 0.18 + vz * 0.08), 2.0) * 3.5;
      const elev = Math.max(0.2, hills - riverBed);

      vallesPos.setY(i, elev);

      // Color orgánico: riberas terrosas y lomas verdes
      const mixRatio = Math.min(1.0, Math.max(0.0, (elev - 1.2) / 4.0));
      const col = elev < 1.0 ? soilEarth : greenLush.clone().lerp(greenForest, mixRatio);

      vallesColors[i * 3] = col.r;
      vallesColors[i * 3 + 1] = col.g;
      vallesColors[i * 3 + 2] = col.b;
    }
    vallesGeo.setAttribute('color', new THREE.BufferAttribute(vallesColors, 3));
    vallesGeo.computeVertexNormals();

    const vallesMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.75,
      metalness: 0.1,
    });
    const vallesMesh = new THREE.Mesh(vallesGeo, vallesMat);
    vallesMesh.receiveShadow = !isSoftwareGl;
    vallesGroup.add(vallesMesh);

    // Río plateado curvado de deshielo
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-22, 0.35, -20),
      new THREE.Vector3(-10, 0.35, -8),
      new THREE.Vector3(2, 0.35, 2),
      new THREE.Vector3(12, 0.35, 12),
      new THREE.Vector3(22, 0.35, 22),
    ]);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 40, 1.4, 8, false);
    riverGeo.scale(1, 0.1, 1); // Aplanado contra el cauce
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.85,
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    vallesGroup.add(riverMesh);

    scene.add(vallesGroup);
    terrainMeshesRef.current.valles = vallesMesh;

    // -------------------------------------------------------------
    // D. YUNGAS - PARQUE NACIONAL CALILEGUA (Selva de montaña nubosa con brumas)
    const yungasGroup = new THREE.Group();
    yungasGroup.position.set(2, 0, -65);

    const yungasGeo = new THREE.PlaneGeometry(60, 60, 110, 110);
    yungasGeo.rotateX(-Math.PI / 2);
    const yungasPos = yungasGeo.attributes.position;
    const yungasColors = new Float32Array(yungasPos.count * 3);

    const jungleDeep = new THREE.Color(0x064e3b); // Verde selva profunda
    const jungleEmerald = new THREE.Color(0x047857); // Esmeralda tropical
    const jungleMist = new THREE.Color(0x10b981); // Verde musgo húmedo

    for (let i = 0; i < yungasPos.count; i++) {
      const vx = yungasPos.getX(i);
      const vz = yungasPos.getZ(i);

      // Relieve escarpado selvático con múltiples pisos ecológicos
      const mountainSwell = Math.pow(fbm(vx * 0.08, vz * 0.08, 4), 1.4) * 14.0;
      const canopyTexture = smoothNoise(vx * 0.9, vz * 0.9) * 0.6;
      const totalElev = mountainSwell + canopyTexture;

      yungasPos.setY(i, totalElev);

      const col = jungleDeep.clone().lerp(jungleEmerald, Math.min(1.0, totalElev / 10.0));
      yungasColors[i * 3] = col.r;
      yungasColors[i * 3 + 1] = col.g;
      yungasColors[i * 3 + 2] = col.b;
    }
    yungasGeo.setAttribute('color', new THREE.BufferAttribute(yungasColors, 3));
    yungasGeo.computeVertexNormals();

    const yungasMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.05,
    });
    const yungasMesh = new THREE.Mesh(yungasGeo, yungasMat);
    yungasMesh.receiveShadow = !isSoftwareGl;
    yungasGroup.add(yungasMesh);

    // Capas de niebla volumétrica baja (característica de la nuboselva)
    for (let m = 0; m < 4; m++) {
      const mistGeo = new THREE.PlaneGeometry(45, 20);
      mistGeo.rotateX(-Math.PI / 2);
      const mistMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
        roughness: 1.0,
      });
      const mistMesh = new THREE.Mesh(mistGeo, mistMat);
      mistMesh.position.set(-6 + m * 5, 4.5 + m * 1.2, -8 + m * 6);
      yungasGroup.add(mistMesh);
    }

    scene.add(yungasGroup);
    terrainMeshesRef.current.yungas = yungasMesh;

    // -------------------------------------------------------------
    // 7. BALIZAS DISCRETAS Y ELEGANTES DE LUGARES ICÓNICOS
    // -------------------------------------------------------------
    // Puntos de luz y geolocalización que no interfieren con la naturaleza
    const beaconGeo = new THREE.SphereGeometry(0.35, 16, 16);

    CIBERBASES_NODES.forEach((node) => {
      const markerGroup = new THREE.Group();

      // Ajuste de coordenadas para situarse naturalmente sobre cada terreno
      let adjustedCoords: [number, number, number] = [node.coordinates3D[0], node.coordinates3D[1], node.coordinates3D[2]];
      if (node.region === 'quebrada') {
        adjustedCoords = [node.coordinates3D[0] * 1.5, 4.5, -5 + node.coordinates3D[2]];
      } else if (node.region === 'puna') {
        adjustedCoords = [-35 + node.coordinates3D[0] * 0.8, 1.2, -8 + node.coordinates3D[2]];
      } else if (node.region === 'valles') {
        adjustedCoords = [38 + node.coordinates3D[0] * 0.8, 3.2, -6 + node.coordinates3D[2]];
      } else if (node.region === 'yungas') {
        adjustedCoords = [2 + node.coordinates3D[0] * 0.8, 6.2, -65 + node.coordinates3D[2]];
      }

      markerGroup.position.set(...adjustedCoords);

      const colorHex =
        node.region === 'quebrada'
          ? 0xee007c
          : node.region === 'puna'
          ? 0x00aeef
          : node.region === 'valles'
          ? 0xf8c300
          : 0x10b981;

      // Núcleo luminoso sutil
      const coreMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const core = new THREE.Mesh(beaconGeo, coreMat);
      markerGroup.add(core);

      // Anillo de pulso exterior
      const ringGeo = new THREE.RingGeometry(0.5, 0.7, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      markerGroup.add(ring);

      // Hitbox para interacción táctil y con mouse
      const hitBoxGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.userData = { isBeacon: true, nodeData: node };
      markerGroup.add(hitBox);

      scene.add(markerGroup);
      beaconMeshesRef.current.set(hitBox, node);
    });

    // -------------------------------------------------------------
    // 8. PARTÍCULAS DE POLEN, MINERALES Y VIENTO DE ALTURA
    // -------------------------------------------------------------
    const particleCount = isSoftwareGl ? 350 : 800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const atmosphereColors = [
      new THREE.Color(0xfffbeb), // Polvo dorado
      new THREE.Color(0x00aeef), // Partícula celeste
      new THREE.Color(0xee007c), // Partícula magenta
      new THREE.Color(0xffffff), // Cristal de sal
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 120;
      particlePositions[i * 3 + 1] = Math.random() * 25 + 0.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const c = atmosphereColors[i % atmosphereColors.length];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // -------------------------------------------------------------
    // 9. RAYCASTING E INTERACCIÓN DEL MOUSE
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      pointerNorm.current.x = mouse.x;
      pointerNorm.current.y = mouse.y;

      if (!cameraRef.current) return;
      raycaster.setFromCamera(mouse, cameraRef.current);

      const interactiveTargets = Array.from(beaconMeshesRef.current.keys());
      const intersects = raycaster.intersectObjects(interactiveTargets, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const node = beaconMeshesRef.current.get(hit);
        if (node && hoveredNode?.id !== node.id) {
          setHoveredNode(node);
          setTooltipPos({ x: e.clientX, y: e.clientY });
          soundscape.playClick();
        }
      } else {
        if (hoveredNode) {
          setHoveredNode(null);
          setTooltipPos(null);
        }
      }
    };

    const handleClick = () => {
      if (hoveredNode) {
        onSelectNode(hoveredNode);
        soundscape.playClick();
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // 10. LOOP DE ANIMACIÓN CINEMÁTICA CON DAMPING
    // -------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Desplazamiento cinematográfico suave de la cámara
      if (cameraRef.current) {
        cameraRef.current.position.x = THREE.MathUtils.damp(
          cameraRef.current.position.x,
          _camTarget.x + pointerNorm.current.x * 2.2,
          3.2,
          delta
        );
        cameraRef.current.position.y = THREE.MathUtils.damp(
          cameraRef.current.position.y,
          _camTarget.y + pointerNorm.current.y * 1.2,
          3.2,
          delta
        );
        cameraRef.current.position.z = THREE.MathUtils.damp(
          cameraRef.current.position.z,
          _camTarget.z,
          3.2,
          delta
        );

        _currentLook.x = THREE.MathUtils.damp(_currentLook.x, _lookTarget.x, 3.2, delta);
        _currentLook.y = THREE.MathUtils.damp(_currentLook.y, _lookTarget.y, 3.2, delta);
        _currentLook.z = THREE.MathUtils.damp(_currentLook.z, _lookTarget.z, 3.2, delta);

        cameraRef.current.lookAt(_currentLook);
      }

      // Animación de partículas de brisa
      if (particlesRef.current) {
        const pArr = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          pArr[i * 3] += Math.sin(time * 0.4 + i) * 0.02 - 0.035;
          pArr[i * 3 + 1] += Math.cos(time * 0.3 + i) * 0.015;
          if (pArr[i * 3] < -60) pArr[i * 3] = 60;
          if (pArr[i * 3 + 1] > 26) pArr[i * 3 + 1] = 0.5;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      hornocalGeo.dispose();
      hornocalMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [setCameraForRegion]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0C2340] text-center p-8">
        <p className="text-[#00AEEF] font-bold">Modo Visual Optimizado</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Tooltip Reactivo sobre el punto icónico */}
      {hoveredNode && tooltipPos && (
        <div
          className="fixed pointer-events-none z-30 transition-opacity duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 12}px` }}
        >
          <div className="bg-[#0C2340]/95 border border-[#00AEEF] text-white px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EE007C]" />
              <span className="font-bold text-xs uppercase tracking-wider text-[#00AEEF]">
                {hoveredNode.municipio}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">{hoveredNode.name}</p>
            <div className="text-[11px] text-[#F8C300] mt-1 flex items-center gap-2">
              <span>Clic para sumarme aquí</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicador sutil de orientación del paisaje icónico */}
      {!isCinemaMode && (
        <div className="absolute top-20 right-6 pointer-events-none hidden md:block text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00AEEF]/80">
            Paisaje Natural Jujeño
          </p>
          <p className="text-xl font-black font-montserrat text-white/90 uppercase tracking-wider">
            {REGIONS_DATA[activeRegion].name}
          </p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            {REGIONS_DATA[activeRegion].geologyDescription}
          </p>
        </div>
      )}
    </div>
  );
};
