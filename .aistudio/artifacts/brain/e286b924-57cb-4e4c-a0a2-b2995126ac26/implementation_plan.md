# SOMOS Jujuy — Plataforma Inmersiva 3D & Ciberbases Territoriales

Plataforma web modular de vanguardia para el espacio político **SOMOS — Jujuy**, inspirada en la estética audiovisual e interactiva de **OHZI.io**, combinando un **recorrido escénico 3D procedural por las cuatro regiones jujeñas** (Quebrada, Puna, Valles y Yungas), un **paisaje sonoro procedural sintetizado en Web Audio API** y un **generador interactivo de carnet digital comunitario con código QR y vinculación directa a WhatsApp** para movilizar y sumar ciudadanas y ciudadanos a las ciberbases locales.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones Confirmadas con el Usuario en la Fase de Clarificación:**
> 1. **Metáfora 3D Central**: Recorrido escénico 3D interactivo por las **cuatro regiones de Jujuy** (Quebrada, Puna, Valles y Yungas), con topografía estilizada procedural, partículas lumínicas representativas del calor popular/energía comunitaria, y transiciones fluidas de cámara cinemática.
> 2. **Mecanismo de Contacto y Adhesión**: **Generador interactivo de Carnet Digital Comunitario** con personalización de datos, municipio/localidad, rol de militancia/participación, generación instantánea de QR único de verificación, exportación gráfica y enlace automático a la ciberbase territorial de WhatsApp.
> 3. **Dimensión Sonora & Audiovisual**: **Paisaje sonoro procedural ambiental conmutable (Web Audio API)** inspirado en texturas de viento andino y síntesis analógica sutil, complementado con micro-efectos sonoros en clics, cambios de región y generación de carnet, con control maestro de mute/volumen siempre accesible.
> 4. **Arquitectura Modular Extensible**: Diseñado desde la raíz con una estructura de módulos independientes (3D Scenic Engine, Audio Synthesizer, Carnet Generator, Ciberbases Territoriales, Foco Material / Propuestas) para habilitar fácilmente futuras expansiones (asambleas, votación de proyectos, calculadora de tarifas).

---

## 1. Overview & Core Concept

- **Qué hace**: Proporciona una experiencia de entrada impactante y contemporánea que rompe con la política tradicional estática. El visitante navega por un entorno 3D inmersivo de Jujuy, descubre los pilares de *Cercanía Radicada y Dignidad Material*, escucha una atmósfera sonora reactiva y se afilia en segundos obteniendo su credencial comunitaria personalizada.
- **Público Objetivo**: Juventudes, trabajadores, familias y profesionales jujeños en los distintos departamentos (San Salvador, Palpalá, San Pedro, Perico, Tilcara, Humahuaca, La Quiaca, etc.) que buscan una alternativa transparente que combine organización territorial de base con la agilidad de las redes digitales.
- **Valor Clave**: Reemplazar el formulario de contacto aburrido por una experiencia memorable donde el usuario se convierte en protagonista inmediato al recibir su carnet y sumarse a la ciberbase de su barrio o municipio.

---

## 2. User Experience & Visual Design

### A. Identidad Visual & Manual de Marca SOMOS Jujuy
Siguiendo con exactitud el **Manual Oficial de Identidad Visual y Comunicacional V1.0**:
- **Paleta Cromática Oficial**:
  - **Magenta SOMOS** (`#EE007C`): Elementos de llamado a la acción prioritarios, acentos en títulos y logotipo principal.
  - **Celeste Patrio** (`#00AEEF`): Isotipo de corazón central, líneas de encuadre, acentos estructurales.
  - **Sol Amarillo** (`#F8C300`): Núcleo del corazón patrio y resaltador focal de datos.
  - **Azul Profundo** (`#0C2340`): Fondo institucional de alta profundidad, contraste escénico y bases tipográficas.
  - **Blanco Puro** (`#FFFFFF`): Textos contrastantes y fondos de lectura limpia.
- **Tipografía**:
  - *Titulares & Logotipo*: **Montserrat** (Black / Bold, con el corazón patrio patrio argentino integrado en la segunda letra 'O').
  - *Cuerpos de Texto & Cifras*: **Inter** (Regular / Medium / SemiBold, con cifras tabulares `tabular-nums` para los datos de "Foco Material").
  - *Citas y Manifiesto*: **Merriweather** para reflexiones doctrinales y citas de arraigo.
- **Tono de Comunicación**: Directo, cotidiano, horizontal y riguroso ("Cercanía Radicada y Dignidad Material"), prescindiendo de retórica vacía o agresiones estériles.

### B. Core User Flows
1. **Llegada & Activación Inmersiva**:
   - Apertura con el logotipo animado SOMOS, switch sonoro discreto ("Audio Ambiente: ON/OFF") y viewport 3D interactivo en pantalla completa.
   - Navegación ágil mediante el **Dock Inferior Cinemático** (estilo OHZI) que permite alternar entre las 4 regiones de Jujuy o entrar directamente a "Sumarme / Mi Carnet".
2. **El Recorrido Escénico por las 4 Regiones**:
   - **Quebrada**: Formaciones de estratos de colores (Hornocal / Cerro de Siete Colores), luz dorada y partículas minerales.
   - **Puna**: Salar infinito, horizonte etéreo de altura, geometría de prismas de sal y cielo azul profundo.
   - **Valles**: Verde fértil, corrientes fluviales estilizadas, actividad productiva y urbana.
   - **Yungas**: Vegetación densa procedural, bruma biofílica y energía de reserva natural.
   - Cada región despliega una ficha editorial condensada de "Foco Material": datos de salarios, transporte, vivienda y propuestas concretas para esa zona.
3. **Generador Interactivo de Carnet Digital SOMOS**:
   - Modal/Panel interactivo fluido donde el simpatizante ingresa: Nombre/Apodo, Localidad/Municipio, Área de Interés (Trabajo, Ciberbases, Territorio, Salud/Educación, Juventudes).
   - Vista previa en tiempo real en 3D/2D con efecto holográfico del carnet, avatar estilizado o iniciales, número de credencial ciberbase y código QR de validación comunitaria.
   - Botón de descarga directa como imagen (PNG) y botón directo "Unirme por WhatsApp a mi Ciberbase Local" con mensaje prearmado que incluye su localidad y número de militante.
4. **Dock de Navegación & Modo Zen (Sin Oclusiones)**:
   - Siguiendo las directrices de diseño 3D, todos los controles se ubican en un **dock inferior colapsable**, dejando el centro visual 100% despejado para la experiencia audiovisual.

---

## 3. Key Product Decisions & Trade-Offs

### 1. Motor 3D Procedural con Three.js
- **Elección**: Generación matemática y procedural de los paisajes regionales mediante shaders, mallas de relieve (`BufferGeometry`), materiales PBR con `MeshStandardMaterial` y niebla volumétrica calculada en tiempo real.
- **Por qué**: Garantiza cero dependencias externas de modelos `.glb` pesados (carga instantánea en menos de 1 segundo en conexiones móviles jujeñas), compatibilidad universal con WebGL y estética estilizada refinada afín a los labs de OHZI.

### 2. Audio Procedural Nativo con Web Audio API
- **Elección**: Sintetizador sustractivo y generador de ruido rosa/armónicos andinos programado 100% en Web Audio API, sin archivos `.mp3` pesados ni bloqueos de autoplay de navegador.
- **Por qué**: Cero retraso, volumen adaptativo, inicio respetuoso del usuario (requiere un clic o activación inicial) y micro-sonidos reactivos al interactuar con las regiones y botones.

### 3. Generación Local del Carnet & Enlace Inmediato a WhatsApp
- **Elección**: Renderizado del carnet mediante Canvas 2D de alta resolución (exportable como PNG nítido) con generación de QR vectorial en memoria, sin requerir base de datos inicial obligatoria ni registrar credenciales sensibles.
- **Por qué**: Elimina la fricción de onboarding (la persona se afilia en 30 segundos), respeta la privacidad y permite la acción comunitaria directa hacia los grupos de WhatsApp territoriales de SOMOS.

### 4. Estructura Modular Lista para Nuevos Módulos
- **Elección**: Separación estricta entre el motor 3D escénico (`/src/components/scene/`), el sistema de audio (`/src/audio/`), el generador de carnet (`/src/components/carnet/`), los datos regionales y de ciberbases (`/src/data/`), y la barra de navegación modular.
- **Por qué**: Permite en fases siguientes incorporar módulos de: propuestas legislativas, asamblea virtual de votación, mapa de calor territorial o calculadora de canasta básica sin rehacer la arquitectura.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SOMOS JUJUY SPA (React)                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Top Bar Contract    │  │       Audio Manager (Web Audio)      │  │
│  │ Brand Wordmark + Nav  │  │ Ambient Pad · Frequency · Click SFX  │  │
│  └───────────────────────┘  └──────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Three.js Scenic Viewport (Fullscreen)              │  │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────┐ │  │
│  │ │ Quebrada Scene│ │  Puna Scene   │ │ Valles Scene  │ │ Yungas │ │  │
│  │ └───────────────┘ └───────────────┘ └───────────────┘ └────────┘ │  │
│  │      Procedural Shaders · Camera Damping · Particle Stream       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  Collapsible Bottom Control Dock                 │  │
│  │ [Quebrada] [Puna] [Valles] [Yungas] │ [Sumarme / Carnet] [Audio] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────┐            ┌───────────────────────────┐  │
│  │ Regional Data Card      │            │ Carnet Generator Modal    │  │
│  │ "Foco Material" & Prop. │            │ 2D Canvas · QR · WhatsApp │  │
│  └─────────────────────────┘            └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping
- `App.tsx`: Orquestador principal, estado de región activa (`'quebrada' | 'puna' | 'valles' | 'yungas'`), estado de audio (`muted: boolean`, `volume: number`), y visibilidad de modales.
- `src/components/scene/ScenicCanvas.tsx`: Canvas WebGL Three.js con detección `isSoftwareGl`, `RoomEnvironment`, `FogExp2` reactivo a la paleta cromática, partículas ambientales y cámara orbital amortiguada.
- `src/components/scene/regions.ts`: Modelado procedural de las formaciones geológicas de cada región y sus paletas de color con acentos institucionales.
- `src/audio/soundscape.ts`: Motor Web Audio API con osciladores sinusoidales en frecuencias pentatónicas andinas, filtro paso-bajo dinámico y generador de bleeps táctiles para clics.
- `src/components/carnet/CarnetModal.tsx`: Formulario de alta rápida, renderizado de credencial con el logotipo oficial SOMOS con corazón patrio, QR instantáneo, descarga de PNG y enlace a WhatsApp de la ciberbase correspondiente al municipio seleccionado.
- `src/components/ui/TopBar.tsx`: Cumplimiento estricto del Top Bar Contract con logotipo SOMOS tipográfico oficial, enlaces de navegación ("Regiones", "Manifiesto", "Ciberbases") y botón de llamado a la acción.
- `src/components/ui/BottomDock.tsx`: Barra de control estilizada, colapsable con atajo de teclado y selector de regiones.

---

## 5. Implementation Sequence

1. **Dependencias & Tipografías**:
   - Instalar `three` y `@types/three`.
   - Cargar las familias tipográficas oficiales en `index.html` (Montserrat, Inter, Merriweather) y configurar variables temáticas en `src/index.css`.
2. **Motor Sonoro Web Audio**:
   - Implementar `soundscape.ts` con sintetizador ambiental ambiental suave y efectos de respuesta táctil.
3. **Motor 3D Regional (Inspiración OHZI)**:
   - Crear el lienzo Three.js con cámara cinemática, terreno procedural multifacético para Quebrada, Puna, Valles y Yungas, y sistema de partículas.
4. **Módulo de Carnet Digital Comunitario & Ciberbases**:
   - Generación de carnet gráfico en Canvas con QR dinámico y redirección automática hacia los canales territoriales de WhatsApp según municipio.
5. **Fichas Territoriales de "Foco Material"**:
   - Fichas informativas con datos duros y propuestas claras para cada región jujeña.
6. **Verificación & Optimización**:
   - Pruebas de rendimiento en software WebGL y dispositivos táctiles, y verificación de compilación sin errores.
