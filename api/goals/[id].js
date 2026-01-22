/**
 * ============================================
 * API DE METAS FINANCIERAS - OPERACIONES POR ID
 * Endpoint: /api/goals/[id]
 * Métodos: GET (obtener), PUT (actualizar), DELETE (eliminar)
 * ============================================
 */

const db = require('../lib/db');
const { success, error, serverError, notFound, setCorsHeaders } = require('../lib/response');

module.exports = async (req, res) => {
    // Configurar CORS
    setCorsHeaders(res);

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Obtener ID de la meta de la URL
    const { id } = req.query;

    if (!id || isNaN(parseInt(id))) {
        return error(res, 'ID de meta inválido');
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getGoalById(req, res, id);
            case 'PUT':
                return await updateGoal(req, res, id);
            case 'DELETE':
                return await deleteGoal(req, res, id);
            default:
                return error(res, 'Método no permitido', 405);
        }
    } catch (err) {
        return serverError(res, err);
    }
};

/**
 * Obtiene una meta por su ID
 * GET /api/goals/[id]
 */
async function getGoalById(req, res, id) {
    const goals = await db.query(
        `SELECT id, nombre, descripcion, monto_meta, fecha_objetivo, fecha_creacion, fecha_actualizacion 
         FROM metas WHERE id = $1`,
        [id]
    );

    if (goals.length === 0) {
        return notFound(res, 'Meta no encontrada');
    }

    return success(res, goals[0]);
}

/**
 * Actualiza una meta
 * PUT /api/goals/[id]
 * Body: { nombre?, descripcion?, monto_meta?, fecha_objetivo? }
 */
async function updateGoal(req, res, id) {
    const { nombre, descripcion, monto_meta, fecha_objetivo } = req.body;

    // Verificar que la meta existe
    const existingGoal = await db.query(
        'SELECT id FROM metas WHERE id = $1',
        [id]
    );

    if (existingGoal.length === 0) {
        return notFound(res, 'Meta no encontrada');
    }

    // Construir query de actualización dinámicamente
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
        if (nombre.trim().length < 1) {
            return error(res, 'El nombre de la meta es requerido');
        }
        updates.push(`nombre = $${paramIndex++}`);
        params.push(nombre.trim());
    }

    if (descripcion !== undefined) {
        updates.push(`descripcion = $${paramIndex++}`);
        params.push(descripcion ? descripcion.trim() : null);
    }

    if (monto_meta !== undefined) {
        if (isNaN(parseFloat(monto_meta)) || parseFloat(monto_meta) < 0) {
            return error(res, 'El monto de la meta debe ser un número mayor o igual a 0');
        }
        updates.push(`monto_meta = $${paramIndex++}`);
        params.push(parseFloat(monto_meta));
    }

    if (fecha_objetivo !== undefined) {
        if (fecha_objetivo === null || fecha_objetivo === '') {
            updates.push('fecha_objetivo = NULL');
        } else {
            const fechaObj = new Date(fecha_objetivo);
            if (isNaN(fechaObj.getTime())) {
                return error(res, 'La fecha objetivo no es válida');
            }
            updates.push(`fecha_objetivo = $${paramIndex++}`);
            params.push(fechaObj);
        }
    }

    if (updates.length === 0) {
        return error(res, 'No se proporcionaron datos para actualizar');
    }

    // Agregar fecha de actualización y el ID al final
    updates.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    params.push(id);

    await db.query(
        `UPDATE metas SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
    );

    // Obtener meta actualizada
    const updatedGoal = await db.query(
        `SELECT id, nombre, descripcion, monto_meta, fecha_objetivo, fecha_creacion, fecha_actualizacion 
         FROM metas WHERE id = $1`,
        [id]
    );

    return success(res, updatedGoal[0]);
}

/**
 * Elimina una meta
 * DELETE /api/goals/[id]
 */
async function deleteGoal(req, res, id) {
    // Verificar que la meta existe
    const existingGoal = await db.query(
        'SELECT id FROM metas WHERE id = $1',
        [id]
    );

    if (existingGoal.length === 0) {
        return notFound(res, 'Meta no encontrada');
    }

    // Eliminar meta (las asignaciones se eliminarán por CASCADE si está configurado)
    await db.query('DELETE FROM metas WHERE id = $1', [id]);

    return success(res, { message: 'Meta eliminada correctamente' });
}
