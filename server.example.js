/**
 * ============================================
 * SERVIDOR DE DESARROLLO LOCAL - EJEMPLO
 * Simula el entorno de Vercel para pruebas locales
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo como "server.js"
 * 2. Crea un archivo ".env" con tus credenciales
 * 3. Ejecuta: node server.js
 * ============================================
 */

// Cargar variables de entorno desde .env
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types para archivos estáticos
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

// Cargar handlers de API dinámicamente
const apiHandlers = {};

/**
 * Carga un handler de API
 */
function loadApiHandler(apiPath) {
    const handlerPath = path.join(__dirname, 'api', apiPath + '.js');
    if (fs.existsSync(handlerPath)) {
        // Limpiar cache para hot reload
        delete require.cache[require.resolve(handlerPath)];
        return require(handlerPath);
    }
    return null;
}

/**
 * Parsea el body de una request
 */
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

/**
 * Servidor HTTP principal
 */
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${pathname}`);

    // Configurar CORS para todas las respuestas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Manejar rutas de API
    if (pathname.startsWith('/api/')) {
        try {
            // Parsear body para POST/PUT
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                req.body = await parseBody(req);
            }

            // Determinar el handler correcto
            let handler = null;
            let apiPath = pathname.replace('/api/', '');
            
            // Quitar trailing slash
            if (apiPath.endsWith('/')) {
                apiPath = apiPath.slice(0, -1);
            }

            // Parsear query params
            req.query = parsedUrl.query;

            // Rutas con ID dinámico
            const parts = apiPath.split('/');
            
            console.log(`[DEBUG] API Path: ${apiPath}, Parts:`, parts);
            
            if (parts.length === 2 && parts[0] === 'auth') {
                // Rutas de auth: /api/auth/login, /api/auth/register, /api/auth/me
                console.log(`[DEBUG] Loading auth handler: auth/${parts[1]}`);
                handler = loadApiHandler(`auth/${parts[1]}`);
            } else if (parts.length === 2 && parts[1] && !isNaN(parts[1])) {
                // Ruta tipo /api/users/123
                const [resource, id] = parts;
                req.query.id = id;
                console.log(`[DEBUG] Loading resource handler with ID: ${resource}/[id]`);
                handler = loadApiHandler(`${resource}/[id]`);
            } else if (parts.length === 1) {
                // Ruta tipo /api/users
                console.log(`[DEBUG] Loading index handler: ${parts[0]}/index`);
                handler = loadApiHandler(`${parts[0]}/index`);
            }

            if (handler) {
                console.log(`[DEBUG] Handler found, executing...`);
                
                // Crear objeto response compatible con Vercel
                const vercelRes = {
                    statusCode: 200,
                    headers: {},
                    setHeader: (name, value) => {
                        vercelRes.headers[name] = value;
                    },
                    status: (code) => {
                        vercelRes.statusCode = code;
                        return vercelRes;
                    },
                    json: (data) => {
                        console.log(`[DEBUG] Sending response: ${vercelRes.statusCode}`, data);
                        res.writeHead(vercelRes.statusCode, {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                            ...vercelRes.headers
                        });
                        res.end(JSON.stringify(data));
                    },
                    end: () => {
                        res.writeHead(vercelRes.statusCode, vercelRes.headers);
                        res.end();
                    }
                };

                await handler(req, vercelRes);
            } else {
                console.log(`[ERROR] No handler found for: ${apiPath}`);
                res.writeHead(404, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: false, error: `Endpoint no encontrado: ${pathname}` }));
            }
        } catch (error) {
            console.error('[ERROR] Error en API:', error);
            console.error('[ERROR] Stack:', error.stack);
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Error interno del servidor',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }));
        }
        return;
    }

    // Servir archivos estáticos
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 - Archivo no encontrado');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Error del servidor');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log('\n🚀 Servidor de desarrollo iniciado');
    console.log(`   URL: http://localhost:${PORT}\n`);
    console.log('📡 API Endpoints disponibles:');
    console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
    console.log(`   GET    http://localhost:${PORT}/api/users`);
    console.log(`   POST   http://localhost:${PORT}/api/users`);
    console.log(`   GET    http://localhost:${PORT}/api/users/:id`);
    console.log(`   PUT    http://localhost:${PORT}/api/users/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/users/:id`);
    console.log(`   GET    http://localhost:${PORT}/api/goals`);
    console.log(`   POST   http://localhost:${PORT}/api/goals`);
    console.log(`   GET    http://localhost:${PORT}/api/goals/:id`);
    console.log(`   PUT    http://localhost:${PORT}/api/goals/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/goals/:id`);
    console.log(`   GET    http://localhost:${PORT}/api/user-goals`);
    console.log(`   POST   http://localhost:${PORT}/api/user-goals`);
    console.log(`   GET    http://localhost:${PORT}/api/user-goals/:id`);
    console.log(`   PUT    http://localhost:${PORT}/api/user-goals/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/user-goals/:id\n`);
    console.log('Presiona Ctrl+C para detener el servidor\n');
});
