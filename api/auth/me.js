/**
 * ============================================
 * API DE AUTENTICACIÓN - USUARIO ACTUAL
 * Endpoint: /api/auth/me
 * Método: GET
 * ============================================
 */

const db = require('../_lib/db');
const { success, error, serverError, unauthorized, setCorsHeaders } = require('../_lib/response');
const { authenticateRequest } = require('../_lib/auth');

module.exports = async (req, res) => {
    // Configurar CORS
    setCorsHeaders(res);

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo permitir GET
    if (req.method !== 'GET') {
        return error(res, 'Método no permitido', 405);
    }

    try {
        // Verificar autenticación
        const authUser = authenticateRequest(req);

        if (!authUser) {
            return unauthorized(res, 'Token inválido o expirado');
        }

        // Buscar usuario por ID del token
        const users = await db.query(
            'SELECT id, nombre, email, fecha_creacion FROM usuarios WHERE id = $1',
            [authUser.id]
        );

        if (users.length === 0) {
            return unauthorized(res, 'Usuario no encontrado');
        }

        return success(res, users[0]);

    } catch (err) {
        return serverError(res, err);
    }
};
