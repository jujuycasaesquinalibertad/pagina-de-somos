import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta y estructura de la base de datos persistente de afiliaciones
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'afiliaciones.json');

// Inicializar archivo de base de datos si no existe
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      lastNumber: 100, // Comienza la numeración oficial en 0101
      afiliados: [
        {
          id: 'SOMOS-JUJ-0100',
          numeroAfiliado: 'SOMOS-JUJ-0100',
          nombre: 'Comisión Promotora Fundacional',
          municipio: 'San Salvador de Jujuy',
          areaAccion: 'Organización Barrial y Territorial',
          telefono: '',
          fechaRegistro: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

initDatabase();

function readDatabase() {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error leyendo base de datos:', error);
    return { lastNumber: 100, afiliados: [] };
  }
}

function writeDatabase(data: unknown) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error guardando en base de datos:', error);
  }
}

// -------------------------------------------------------------
// ENDPOINTS DE LA API DE AFILIACIONES Y CARNETS
// -------------------------------------------------------------

// 1. POST /api/afiliaciones - Registro y asignación de número único no repetible
app.post('/api/afiliaciones', (req, res) => {
  try {
    const { nombre, municipio, areaAccion, telefono } = req.body;

    if (!nombre || !municipio) {
      return res.status(400).json({ error: 'Nombre y municipio son requeridos' });
    }

    const db = readDatabase();
    db.lastNumber += 1;

    // Formato de numeración oficial estricto: SOMOS-JUJ-0101, SOMOS-JUJ-0102, ...
    const formattedNum = String(db.lastNumber).padStart(4, '0');
    const numeroAfiliado = `SOMOS-JUJ-${formattedNum}`;

    const nuevoAfiliado = {
      id: numeroAfiliado,
      numeroAfiliado,
      nombre: String(nombre).trim(),
      municipio: String(municipio).trim(),
      areaAccion: String(areaAccion || 'General').trim(),
      telefono: String(telefono || '').trim(),
      fechaRegistro: new Date().toISOString(),
    };

    db.afiliados.push(nuevoAfiliado);
    writeDatabase(db);

    console.log(`[Afiliación Registrada] ${numeroAfiliado} - ${nuevoAfiliado.nombre} (${nuevoAfiliado.municipio})`);

    return res.status(201).json({
      success: true,
      afiliado: nuevoAfiliado,
      totalAfiliados: db.afiliados.length,
    });
  } catch (error) {
    console.error('Error en POST /api/afiliaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar afiliación' });
  }
});

// 2. GET /api/afiliaciones/stats - Estadísticas de afiliaciones
app.get('/api/afiliaciones/stats', (req, res) => {
  try {
    const db = readDatabase();
    const porMunicipio: Record<string, number> = {};

    db.afiliados.forEach((af: { municipio: string }) => {
      const mun = af.municipio || 'Otros';
      porMunicipio[mun] = (porMunicipio[mun] || 0) + 1;
    });

    return res.json({
      total: db.afiliados.length,
      ultimoNumero: `SOMOS-JUJ-${String(db.lastNumber).padStart(4, '0')}`,
      porMunicipio,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// 3. GET /api/afiliaciones/validar/:numero - Validación pública de credenciales
app.get('/api/afiliaciones/validar/:numero', (req, res) => {
  try {
    const { numero } = req.params;
    const db = readDatabase();
    const encontrado = db.afiliados.find(
      (af: { numeroAfiliado: string }) => af.numeroAfiliado.toUpperCase() === numero.toUpperCase()
    );

    if (!encontrado) {
      return res.status(404).json({ valid: false, message: 'Carnet no encontrado en el padrón' });
    }

    return res.json({
      valid: true,
      numeroAfiliado: encontrado.numeroAfiliado,
      nombre: encontrado.nombre,
      municipio: encontrado.municipio,
      areaAccion: encontrado.areaAccion,
      fechaRegistro: encontrado.fechaRegistro,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al validar credencial' });
  }
});

// 4. GET /api/afiliaciones/csv - Exportación de padrón para el partido
app.get('/api/afiliaciones/csv', (req, res) => {
  try {
    const db = readDatabase();
    let csv = 'NumeroAfiliado,Nombre,Municipio,AreaAccion,Telefono,FechaRegistro\n';

    db.afiliados.forEach((af: { numeroAfiliado: string; nombre: string; municipio: string; areaAccion: string; telefono: string; fechaRegistro: string }) => {
      const cleanName = `"${(af.nombre || '').replace(/"/g, '""')}"`;
      const cleanMun = `"${(af.municipio || '').replace(/"/g, '""')}"`;
      const cleanArea = `"${(af.areaAccion || '').replace(/"/g, '""')}"`;
      const cleanTel = `"${(af.telefono || '').replace(/"/g, '""')}"`;
      csv += `${af.numeroAfiliado},${cleanName},${cleanMun},${cleanArea},${cleanTel},${af.fechaRegistro}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Padron_Afiliados_SOMOS_Jujuy.csv"');
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ error: 'Error exportando CSV' });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE EN DESARROLLO / SERVICIO ESTÁTICO EN PRODUCCIÓN
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor SOMOS Jujuy] Escuchando en http://localhost:${PORT}`);
  });
}

startServer();
