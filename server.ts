import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// BASE DE DATOS DUAL: POSTGRESQL (PRODUCCIÓN / CLOUD) + JSON PERSISTENTE (LOCAL)
// -------------------------------------------------------------
import pg from 'pg';
const { Pool } = pg;

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'afiliaciones.json');

// Detección de PostgreSQL: Si existe DATABASE_URL o PGHOST en variables de entorno
const hasPostgres = Boolean(process.env.DATABASE_URL || process.env.PGHOST);
let pgPool: pg.Pool | null = null;

if (hasPostgres) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    console.log('[Base de Datos] Conectado a PostgreSQL (Modo Relacional SQL Activo)');
  } catch (err) {
    console.error('[Base de Datos] Error conectando a PostgreSQL, usando JSON persistente:', err);
    pgPool = null;
  }
} else {
  console.log('[Base de Datos] Usando almacenamiento JSON persistente en data/afiliaciones.json');
}

// Inicializar esquemas (PostgreSQL o JSON)
async function initDatabase() {
  if (pgPool) {
    try {
      // Crear tabla de afiliados en PostgreSQL y secuencia numérica única
      await pgPool.query(`
        CREATE SEQUENCE IF NOT EXISTS afiliado_seq START WITH 101;

        CREATE TABLE IF NOT EXISTS afiliados (
          id VARCHAR(50) PRIMARY KEY,
          numero_afiliado VARCHAR(50) UNIQUE NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          municipio VARCHAR(255) NOT NULL,
          area_accion VARCHAR(255) DEFAULT 'General',
          telefono VARCHAR(100) DEFAULT '',
          fecha_registro TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('[PostgreSQL] Esquema y secuencia numérica inicializados con éxito');
      return;
    } catch (err) {
      console.error('[PostgreSQL] Error creando esquema:', err);
    }
  }

  // Fallback JSON
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

function readJsonDatabase() {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error leyendo base de datos JSON:', error);
    return { lastNumber: 100, afiliados: [] };
  }
}

function writeJsonDatabase(data: unknown) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error guardando en base de datos JSON:', error);
  }
}

// -------------------------------------------------------------
// ENDPOINTS DE LA API DE AFILIACIONES Y CARNETS
// -------------------------------------------------------------

// 1. POST /api/afiliaciones - Registro y asignación de número único no repetible
app.post('/api/afiliaciones', async (req, res) => {
  try {
    const { nombre, municipio, areaAccion, telefono } = req.body;

    if (!nombre || !municipio) {
      return res.status(400).json({ error: 'Nombre y municipio son requeridos' });
    }

    const cleanNombre = String(nombre).trim();
    const cleanMunicipio = String(municipio).trim();
    const cleanArea = String(areaAccion || 'General').trim();
    const cleanTel = String(telefono || '').trim();

    // Si PostgreSQL está activo:
    if (pgPool) {
      const seqRes = await pgPool.query("SELECT nextval('afiliado_seq') as num");
      const nextNum = seqRes.rows[0].num;
      const formattedNum = String(nextNum).padStart(4, '0');
      const numeroAfiliado = `SOMOS-JUJ-${formattedNum}`;

      const insertRes = await pgPool.query(
        `INSERT INTO afiliados (id, numero_afiliado, nombre, municipio, area_accion, telefono, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, numero_afiliado as "numeroAfiliado", nombre, municipio, area_accion as "areaAccion", telefono, fecha_registro as "fechaRegistro"`,
        [numeroAfiliado, numeroAfiliado, cleanNombre, cleanMunicipio, cleanArea, cleanTel]
      );

      const countRes = await pgPool.query('SELECT count(*) as total FROM afiliados');
      const totalAfiliados = parseInt(countRes.rows[0].total, 10);

      const nuevoAfiliado = insertRes.rows[0];
      console.log(`[Afiliación PostgreSQL] ${numeroAfiliado} - ${cleanNombre} (${cleanMunicipio})`);

      return res.status(201).json({
        success: true,
        afiliado: nuevoAfiliado,
        totalAfiliados,
        engine: 'postgresql',
      });
    }

    // Almacenamiento JSON persistente
    const db = readJsonDatabase();
    db.lastNumber += 1;

    // Formato de numeración oficial estricto: SOMOS-JUJ-0101, SOMOS-JUJ-0102, ...
    const formattedNum = String(db.lastNumber).padStart(4, '0');
    const numeroAfiliado = `SOMOS-JUJ-${formattedNum}`;

    const nuevoAfiliado = {
      id: numeroAfiliado,
      numeroAfiliado,
      nombre: cleanNombre,
      municipio: cleanMunicipio,
      areaAccion: cleanArea,
      telefono: cleanTel,
      fechaRegistro: new Date().toISOString(),
    };

    db.afiliados.push(nuevoAfiliado);
    writeJsonDatabase(db);

    console.log(`[Afiliación JSON] ${numeroAfiliado} - ${nuevoAfiliado.nombre} (${nuevoAfiliado.municipio})`);

    return res.status(201).json({
      success: true,
      afiliado: nuevoAfiliado,
      totalAfiliados: db.afiliados.length,
      engine: 'json',
    });
  } catch (error) {
    console.error('Error en POST /api/afiliaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar afiliación' });
  }
});

// 2. GET /api/afiliaciones/stats - Estadísticas de afiliaciones
app.get('/api/afiliaciones/stats', async (req, res) => {
  try {
    if (pgPool) {
      const countRes = await pgPool.query('SELECT count(*) as total FROM afiliados');
      const total = parseInt(countRes.rows[0].total, 10);

      const maxRes = await pgPool.query('SELECT numero_afiliado FROM afiliados ORDER BY fecha_registro DESC LIMIT 1');
      const ultimoNumero = maxRes.rows[0]?.numero_afiliado || 'SOMOS-JUJ-0100';

      const groupRes = await pgPool.query('SELECT municipio, count(*) as count FROM afiliados GROUP BY municipio');
      const porMunicipio: Record<string, number> = {};
      groupRes.rows.forEach((r: { municipio: string; count: string }) => {
        porMunicipio[r.municipio] = parseInt(r.count, 10);
      });

      return res.json({
        total,
        ultimoNumero,
        porMunicipio,
        engine: 'postgresql',
      });
    }

    const db = readJsonDatabase();
    const porMunicipio: Record<string, number> = {};

    db.afiliados.forEach((af: { municipio: string }) => {
      const mun = af.municipio || 'Otros';
      porMunicipio[mun] = (porMunicipio[mun] || 0) + 1;
    });

    return res.json({
      total: db.afiliados.length,
      ultimoNumero: `SOMOS-JUJ-${String(db.lastNumber).padStart(4, '0')}`,
      porMunicipio,
      engine: 'json',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// 3. GET /api/afiliaciones/validar/:numero - Validación pública de credenciales
app.get('/api/afiliaciones/validar/:numero', async (req, res) => {
  try {
    const { numero } = req.params;

    if (pgPool) {
      const findRes = await pgPool.query(
        'SELECT id, numero_afiliado as "numeroAfiliado", nombre, municipio, area_accion as "areaAccion", fecha_registro as "fechaRegistro" FROM afiliados WHERE UPPER(numero_afiliado) = UPPER($1)',
        [numero]
      );

      if (findRes.rows.length === 0) {
        return res.status(404).json({ valid: false, message: 'Carnet no encontrado en el padrón' });
      }

      const row = findRes.rows[0];
      return res.json({
        valid: true,
        numeroAfiliado: row.numeroAfiliado,
        nombre: row.nombre,
        municipio: row.municipio,
        areaAccion: row.areaAccion,
        fechaRegistro: row.fechaRegistro,
      });
    }

    const db = readJsonDatabase();
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
app.get('/api/afiliaciones/csv', async (req, res) => {
  try {
    let csv = 'NumeroAfiliado,Nombre,Municipio,AreaAccion,Telefono,FechaRegistro\n';

    if (pgPool) {
      const allRes = await pgPool.query('SELECT numero_afiliado, nombre, municipio, area_accion, telefono, fecha_registro FROM afiliados ORDER BY fecha_registro ASC');
      allRes.rows.forEach((af: { numero_afiliado: string; nombre: string; municipio: string; area_accion: string; telefono: string; fecha_registro: string }) => {
        const cleanName = `"${(af.nombre || '').replace(/"/g, '""')}"`;
        const cleanMun = `"${(af.municipio || '').replace(/"/g, '""')}"`;
        const cleanArea = `"${(af.area_accion || '').replace(/"/g, '""')}"`;
        const cleanTel = `"${(af.telefono || '').replace(/"/g, '""')}"`;
        csv += `${af.numero_afiliado},${cleanName},${cleanMun},${cleanArea},${cleanTel},${af.fecha_registro}\n`;
      });
    } else {
      const db = readJsonDatabase();
      db.afiliados.forEach((af: { numeroAfiliado: string; nombre: string; municipio: string; areaAccion: string; telefono: string; fechaRegistro: string }) => {
        const cleanName = `"${(af.nombre || '').replace(/"/g, '""')}"`;
        const cleanMun = `"${(af.municipio || '').replace(/"/g, '""')}"`;
        const cleanArea = `"${(af.areaAccion || '').replace(/"/g, '""')}"`;
        const cleanTel = `"${(af.telefono || '').replace(/"/g, '""')}"`;
        csv += `${af.numeroAfiliado},${cleanName},${cleanMun},${cleanArea},${cleanTel},${af.fechaRegistro}\n`;
      });
    }

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
