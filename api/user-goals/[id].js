/**
 * ============================================
 * API DE ASIGNACIÓN METAS-USUARIO - OPERACIONES POR ID
 * Endpoint: /api/user-goals/[id]
 * Métodos: GET (obtener), PUT (actualizar), DELETE (eliminar)
 * ============================================
 */

const db = require('../_lib/db');
const { success, error, serverError, notFound, setCorsHeaders } = require('../_lib/response');

module.exports = async (req, res) => {
    // Configurar CORS
    setCorsHeaders(res);

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Obtener ID de la asignación de la URL
    const { id } = req.query;

    if (!id || isNaN(parseInt(id))) {
        return error(res, 'ID de asignación inválido');
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getUserGoalById(req, res, id);
            case 'PUT':
                return await updateUserGoal(req, res, id);
            case 'DELETE':
                return await deleteUserGoal(req, res, id);
            default:
                return error(res, 'Método no permitido', 405);
        }
    } catch (err) {
        return serverError(res, err);
    }
};

/**
 * Obtiene una asignación por su ID
 * GET /api/user-goals/[id]
 */
async function getUserGoalById(req, res, id) {
    const assignments = await db.query(
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
         WHERE um.id = $1`,
        [id]
    );

    if (assignments.length === 0) {
        return notFound(res, 'Asignación no encontrada');
    }

    return success(res, assignments[0]);
}

/**
 * Actualiza una asignación (principalmente el monto acumulado)
 * PUT /api/user-goals/[id]
 * Body: { monto_acumulado }
 */
async function updateUserGoal(req, res, id) {
    const { monto_acumulado } = req.body;

    // Verificar que la asignación existe
    const existingAssignment = await db.query(
        'SELECT id FROM usuario_metas WHERE id = $1',
        [id]
    );

    if (existingAssignment.length === 0) {
        return notFound(res, 'Asignación no encontrada');
    }

    // Validar monto
    if (monto_acumulado === undefined || monto_acumulado === null) {
        return error(res, 'El monto acumulado es requerido');
    }

    if (isNaN(parseFloat(monto_acumulado)) || parseFloat(monto_acumulado) < 0) {
        return error(res, 'El monto acumulado debe ser un número mayor o igual a 0');
    }

    // Actualizar asignación
    await db.query(
        'UPDATE usuario_metas SET monto_acumulado = $1, fecha_actualizacion = NOW() WHERE id = $2',
        [parseFloat(monto_acumulado), id]
    );

    // Obtener asignación actualizada
    const updatedAssignment = await db.query(
        `SELECT 
            um.id,
            um.usuario_id,
            um.meta_id,
            um.monto_acumulado,
            um.fecha_asignacion,
            um.fecha_actualizacion,
            m.nombre as meta_nombre,
            m.monto_meta,
            m.fecha_objetivo,
            u.nombre as usuario_nombre
         FROM usuario_metas um
         INNER JOIN metas m ON um.meta_id = m.id
         INNER JOIN usuarios u ON um.usuario_id = u.id
         WHERE um.id = $1`,
        [id]
    );

    return success(res, updatedAssignment[0]);
}

/**
 * Elimina una asignación
 * DELETE /api/user-goals/[id]
 */
async function deleteUserGoal(req, res, id) {
    // Verificar que la asignación existe
    const existingAssignment = await db.query(
        'SELECT id FROM usuario_metas WHERE id = $1',
        [id]
    );

    if (existingAssignment.length === 0) {
        return notFound(res, 'Asignación no encontrada');
    }

    // Eliminar asignación
    await db.query('DELETE FROM usuario_metas WHERE id = $1', [id]);

    return success(res, { message: 'Asignación eliminada correctamente' });
}
