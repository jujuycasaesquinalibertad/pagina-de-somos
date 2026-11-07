/**
 * DICCIONARIO DEFINITIVO DE TEXTOS DE CAMPAÑA - SOMOS JUJUY
 * Actualizado con el documento de campaña oficial.
 */

export const CAMPAIGN_COPY = {
  // 1. Marca y Cabecera
  brand: {
    name: 'SOMOS',
    province: 'JUJUY',
    hookFinal: 'NO SOMOS UNA SIGLA. SOMOS LOS QUE QUEREMOS NUESTRA TIERRA.',
    topCtaButton: 'Sumarme a SOMOS',
  },

  // 2. Diapositivas Cinemáticas de Apertura (Los 4 Ejes de Campaña)
  slides: [
    {
      id: 'yungas',
      tag: '01 / YUNGAS',
      location: 'Yungas y Ramal Jujeño',
      title: 'Que la riqueza de la selva se note en la mesa.',
      subtitle:
        'Parque Nacional Calilegua y el Ramal. Defender nuestros bienes naturales es garantizar salud pública, agua limpia y trabajo local para que las familias no tengan que elegir entre pagar la luz o comprar remedios.',
      soundName: 'Brisa & Gotas de Nuboselva',
    },
    {
      id: 'hornocal',
      tag: '02 / QUEBRADA',
      location: 'Quebrada de Humahuaca',
      title: 'Que nuestros pibes no tengan que irse.',
      subtitle:
        'Serranía del Hornocal y nuestros pueblos. Soberanía es tener salarios dignos, arraigo y futuro acá. Nadie debería verse obligado a dejar su tierra por falta de oportunidades.',
      soundName: 'Viento & Quena de Quebrada',
    },
    {
      id: 'salinas',
      tag: '03 / PUNA',
      location: 'Puna Jujeña',
      title: 'El litio es nuestro, la pobreza no puede serlo.',
      subtitle:
        'Salinas Grandes y el altiplano. Los minerales estratégicos deben traducirse en infraestructura, escuelas y desarrollo directo para las comunidades. Basta de riqueza en origen con miseria en el territorio.',
      soundName: 'Silencio & Resonancia de Sal',
    },
    {
      id: 'comunidad',
      tag: '04 / COMUNIDAD',
      location: 'Provincia de Jujuy',
      title: 'Llegar a fin de mes no puede ser una hazaña.',
      subtitle:
        'Eso es lo que preguntan en toda la provincia. Por eso este espacio es abierto para que tu voz en el barrio y la tecnología resuelvan problemas concretos: alquileres, tarifas y trabajo genuino.',
      soundName: 'Pulso & Esperanza Popular',
    },
  ],

  // 3. Controles e Instrucciones de Navegación
  controls: {
    heroCtaButton: 'Sumarme a SOMOS Jujuy',
    navigationHint: 'Deslizá el cursor para revelar el territorio · [← →] Navegar',
    audioActivePrefix: 'Sonido Activo:',
    audioInactivePrefix: 'Activar Sonido:',
    previousAria: 'Paisaje anterior',
    nextAria: 'Paisaje siguiente',
  },

  // 4. Modal de Afiliación y Credencial Oficial
  carnetModal: {
    title: 'Mi Credencial Digital SOMOS',
    description:
      'Sumate. Tu voz en el barrio vale, y acá se escucha. Generá tu credencial y empezá a construir el Jujuy que queremos, entre todos.',
    form: {
      nombreLabel: 'Nombre y Apellido *',
      nombrePlaceholder: 'Ej: Marcelo Morales',
      municipioLabel: 'Municipio / Barrio donde vivís *',
      areaLabel: '¿En qué te gustaría militar?',
      telefonoLabel: 'WhatsApp (Opcional)',
      telefonoPlaceholder: 'Para avisos urgentes y novedades',
      submitButton: 'Generar Mi Credencial',
      submittingButton: 'Conectando con el Padrón Digital...',
      disclaimer:
        'Cada credencial tiene su número único. Acá se viene a construir en conjunto, sin sombras y sin trampas.',
    },
    cardDesign: {
      headerCategory: 'JUJUY',
      statusBadge: 'Padrón Verificado',
      titularLabel: 'TITULAR',
      defaultTitular: 'NOMBRE Y APELLIDO',
      territorioLabel: 'TERRITORIO',
      accionLabel: 'ACCIÓN',
      numeroPadronLabel: 'ID',
      qrVerificationLabel: 'Validación en Padrón',
      partySubFooter: 'PARTIDO SOMOS JUJUY',
      movementFooter: 'Tu lugar en Jujuy · 2026',
    },
    actions: {
      whatsappButtonText: (afiliadoId: string) =>
        `Escribir a SOMOS Jujuy con mi Credencial #${afiliadoId}`,
      whatsappMessageTemplate: (municipio: string, afiliadoId: string, nombre: string, area: string) =>
        `¡Hola SOMOS Jujuy! Me acabo de sumar desde ${municipio}. Mi Credencial Digital es la N° ${afiliadoId} a nombre de ${nombre}. Quiero empezar a militar y participar en el área de "${area}".`,
      downloadButton: 'Descargar Credencial (PNG)',
      downloadingButton: 'Generando...',
      shareButton: 'Invitar a un vecino',
      copiedButton: '¡Enlace Copiado!',
      shareMessageText: (afiliadoId: string, url: string) =>
        `Ya tengo mi Credencial de SOMOS Jujuy (#${afiliadoId}). Sumate a transformar nuestra provincia: ${url}`,
    },
  },

  // 5. Áreas de Participación / Militancia Disponibles
  actionAreas: [
    { id: 'economia', label: 'Economía, Salarios y Trabajo Joven' },
    { id: 'territorio', label: 'Organización Barrial y Territorial' },
    { id: 'guerrilla_digital', label: 'Guerrilla Digital y Comunicación' },
    { id: 'juventudes', label: 'Juventudes y Estudiantes' },
    { id: 'salud_educacion', label: 'Salud Pública y Educación Digna' },
    { id: 'litio_ambiente', label: 'Litio, Ambiente y Bienes Comunes' },
  ],

  // 6. Lista de Municipios Cargados en el Selector
  municipalities: [
    'San Salvador de Jujuy',
    'Palpalá',
    'San Pedro de Jujuy',
    'Libertador Gral. San Martín',
    'Perico',
    'Tilcara',
    'Humahuaca',
    'La Quiaca',
    'Abra Pampa',
    'El Carmen',
    'Monterrico',
    'Calilegua',
    'Purmamarca',
    'Maimará',
    'Susques',
    'Santa Clara',
    'Yuto',
    'Fraile Pintado',
  ],

  // 7. Redes Sociales Oficiales de SOMOS Jujuy
  socialLinks: {
    facebook: 'https://www.facebook.com/SomosPartidoPoliticoJujuy',
    instagram: 'https://www.instagram.com/partidosomosjujuy?srtk=ZzZzMTZyaGx1bGc2',
    tiktok: 'https://www.tiktok.com/@somosesperanzajujuy?_r=1&_t=ZS-9B8F3458X7C',
  },
};
