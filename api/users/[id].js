/**
 * ============================================
 * API DE USUARIOS - OPERACIONES POR ID
 * Endpoint: /api/users/[id]
 * Métodos: GET (obtener), PUT (actualizar), DELETE (eliminar)
 * ============================================
 */

const db = require('../lib/db');
const { success, error, serverError, notFound, setCorsHeaders } = require('../lib/response');
const { hashPassword } = require('../lib/auth');

module.exports = async (req, res) => {
    // Configurar CORS
    setCorsHeaders(res);

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Obtener ID del usuario de la URL
    const { id } = req.query;

    if (!id || isNaN(parseInt(id))) {
        return error(res, 'ID de usuario inválido');
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getUserById(req, res, id);
            case 'PUT':
                return await updateUser(req, res, id);
            case 'DELETE':
                return await deleteUser(req, res, id);
            default:
                return error(res, 'Método no permitido', 405);
        }
    } catch (err) {
        return serverError(res, err);
    }
};

/**
 * Obtiene un usuario por su ID
 * GET /api/users/[id]
 */
async function getUserById(req, res, id) {
    const users = await db.query(
        'SELECT id, nombre, email, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id = $1',
        [id]
    );

    if (users.length === 0) {
        return notFound(res, 'Usuario no encontrado');
    }

    return success(res, users[0]);
}

/**
 * Actualiza un usuario
 * PUT /api/users/[id]
 * Body: { nombre$1, email$2, password$3 }
 */
async function updateUser(req, res, id) {
    const { nombre, email, password } = req.body;

    // Verificar que el usuario existe
    const existingUser = await db.query(
        'SELECT id FROM usuarios WHERE id = $1',
        [id]
    );

    if (existingUser.length === 0) {
        return notFound(res, 'Usuario no encontrado');
    }

    // Construir query de actualización dinámicamente
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
        if (nombre.trim().length < 2) {
            return error(res, 'El nombre debe tener al menos 2 caracteres');
        }
        updates.push(`nombre = $${paramIndex++}`);
        params.push(nombre.trim());
    }

    if (email !== undefined) {
        if (!isValidEmail(email)) {
            return error(res, 'Ingresa un correo electrónico válido');
        }
        // Verificar que el email no esté en uso por otro usuario
        const emailInUse = await db.query(
            'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
            [email.toLowerCase(), id]
        );
        if (emailInUse.length > 0) {
            return error(res, 'Este correo ya está en uso por otro usuario');
        }
        updates.push(`email = $${paramIndex++}`);
        params.push(email.toLowerCase().trim());
    }

    if (password !== undefined) {
        if (password.length < 6) {
            return error(res, 'La contraseña debe tener al menos 6 caracteres');
        }
        const hashedPassword = await hashPassword(password);
        updates.push(`password = $${paramIndex++}`);
        params.push(hashedPassword);
    }

    if (updates.length === 0) {
        return error(res, 'No se proporcionaron datos para actualizar');
    }

    // Agregar fecha de actualización y el ID al final
    updates.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    params.push(id);

    await db.query(
        `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
    );

    // Obtener usuario actualizado
    const updatedUser = await db.query(
        'SELECT id, nombre, email, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id = $1',
        [id]
    );

    return success(res, updatedUser[0]);
}

/**
 * Elimina un usuario
 * DELETE /api/users/[id]
 */
async function deleteUser(req, res, id) {
    // Verificar que el usuario existe
    const existingUser = await db.query(
        'SELECT id FROM usuarios WHERE id = $1',
        [id]
    );

    if (existingUser.length === 0) {
        return notFound(res, 'Usuario no encontrado');
    }

    // Eliminar usuario (las metas asociadas se eliminarán por CASCADE si está configurado)
    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);

    return success(res, { message: 'Usuario eliminado correctamente' });
}

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
