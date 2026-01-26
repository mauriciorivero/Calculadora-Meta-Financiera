/**
 * ============================================
 * API DE ASIGNACIÓN METAS-USUARIO
 * Endpoint: /api/user-goals
 * Métodos: GET (listar), POST (crear asignación)
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

    try {
        switch (req.method) {
            case 'GET':
                return await getUserGoals(req, res);
            case 'POST':
                return await assignGoalToUser(req, res);
            default:
                return error(res, 'Método no permitido', 405);
        }
    } catch (err) {
        return serverError(res, err);
    }
};

/**
 * Obtiene las metas asignadas a un usuario
 * GET /api/user-goals?user_id=X
 * También puede filtrar por usuario autenticado si no se proporciona user_id
 */
async function getUserGoals(req, res) {
    const { user_id } = req.query;

    // Si no se proporciona user_id, intentar obtener del token
    let userId = user_id;
    if (!userId) {
        const authUser = authenticateRequest(req);
        if (authUser) {
            userId = authUser.id;
        }
    }

    if (!userId) {
        return error(res, 'Se requiere user_id o autenticación');
    }

    const userGoals = await db.query(
        `SELECT 
            um.id,
            um.usuario_id,
            um.meta_id,
            um.monto_acumulado,
            um.fecha_asignacion,
            um.fecha_actualizacion,
            m.nombre as meta_nombre,
            m.descripcion as meta_descripcion,
            m.monto_meta,
            m.fecha_objetivo,
            u.nombre as usuario_nombre,
            u.email as usuario_email
         FROM usuario_metas um
         INNER JOIN metas m ON um.meta_id = m.id
         INNER JOIN usuarios u ON um.usuario_id = u.id
         WHERE um.usuario_id = $1
         ORDER BY um.fecha_asignacion DESC`,
        [userId]
    );

    return success(res, userGoals);
}

/**
 * Asigna una meta a un usuario
 * POST /api/user-goals
 * Body: { usuario_id, meta_id, monto_acumulado? }
 */
async function assignGoalToUser(req, res) {
    const { usuario_id, meta_id, monto_acumulado } = req.body;

    // Validaciones
    if (!usuario_id || isNaN(parseInt(usuario_id))) {
        return error(res, 'ID de usuario inválido');
    }

    if (!meta_id || isNaN(parseInt(meta_id))) {
        return error(res, 'ID de meta inválido');
    }

    // Verificar que el usuario existe
    const user = await db.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (user.length === 0) {
        return error(res, 'Usuario no encontrado');
    }

    // Verificar que la meta existe
    const goal = await db.query('SELECT id FROM metas WHERE id = $1', [meta_id]);
    if (goal.length === 0) {
        return error(res, 'Meta no encontrada');
    }

    // Verificar que la asignación no existe ya
    const existingAssignment = await db.query(
        'SELECT id FROM usuario_metas WHERE usuario_id = $1 AND meta_id = $2',
        [usuario_id, meta_id]
    );

    if (existingAssignment.length > 0) {
        return error(res, 'Esta meta ya está asignada a este usuario');
    }

    // Crear asignación
    const montoInicial = monto_acumulado !== undefined ? parseFloat(monto_acumulado) : 0;

    const result = await db.query(
        'INSERT INTO usuario_metas (usuario_id, meta_id, monto_acumulado) VALUES ($1, $2, $3) RETURNING id',
        [usuario_id, meta_id, montoInicial]
    );

    // Obtener asignación creada con datos completos
    const newAssignment = await db.query(
        `SELECT 
            um.id,
            um.usuario_id,
            um.meta_id,
            um.monto_acumulado,
            um.fecha_asignacion,
            m.nombre as meta_nombre,
            m.monto_meta,
            u.nombre as usuario_nombre
         FROM usuario_metas um
         INNER JOIN metas m ON um.meta_id = m.id
         INNER JOIN usuarios u ON um.usuario_id = u.id
         WHERE um.id = $1`,
        [result[0].id]
    );

    return success(res, newAssignment[0], 201);
}
