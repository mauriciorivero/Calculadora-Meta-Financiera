/**
 * ============================================
 * API DE METAS FINANCIERAS
 * Endpoint: /api/goals
 * Métodos: GET (listar), POST (crear)
 * ============================================
 */

const db = require('../_lib/db');
const { success, error, serverError, setCorsHeaders } = require('../_lib/response');

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
                return await getGoals(req, res);
            case 'POST':
                return await createGoal(req, res);
            default:
                return error(res, 'Método no permitido', 405);
        }
    } catch (err) {
        return serverError(res, err);
    }
};

/**
 * Obtiene la lista de todas las metas financieras
 * GET /api/goals
 */
async function getGoals(req, res) {
    const goals = await db.query(
        `SELECT id, nombre, descripcion, monto_meta, fecha_objetivo, fecha_creacion, fecha_actualizacion 
         FROM metas 
         ORDER BY fecha_creacion DESC`
    );
    return success(res, goals);
}

/**
 * Crea una nueva meta financiera
 * POST /api/goals
 * Body: { nombre, descripcion$1, monto_meta, fecha_objetivo$2 }
 */
async function createGoal(req, res) {
    const { nombre, descripcion, monto_meta, fecha_objetivo } = req.body;

    // Validaciones
    if (!nombre || nombre.trim().length < 1) {
        return error(res, 'El nombre de la meta es requerido');
    }

    if (monto_meta === undefined || monto_meta === null || isNaN(parseFloat(monto_meta))) {
        return error(res, 'El monto de la meta es requerido y debe ser un número');
    }

    if (parseFloat(monto_meta) < 0) {
        return error(res, 'El monto de la meta no puede ser negativo');
    }

    // Validar fecha si se proporciona
    let fechaObjetivo = null;
    if (fecha_objetivo) {
        fechaObjetivo = new Date(fecha_objetivo);
        if (isNaN(fechaObjetivo.getTime())) {
            return error(res, 'La fecha objetivo no es válida');
        }
    }

    // Insertar meta y retornar ID
    const result = await db.query(
        `INSERT INTO metas (nombre, descripcion, monto_meta, fecha_objetivo) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
            nombre.trim(),
            descripcion ? descripcion.trim() : null,
            parseFloat(monto_meta),
            fechaObjetivo
        ]
    );

    // Obtener meta creada
    const newGoal = await db.query(
        `SELECT id, nombre, descripcion, monto_meta, fecha_objetivo, fecha_creacion 
         FROM metas WHERE id = $1`,
        [result[0].id]
    );

    return success(res, newGoal[0], 201);
}
