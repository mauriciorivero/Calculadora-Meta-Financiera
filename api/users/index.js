/**
 * ============================================
 * API DE USUARIOS
 * Endpoint: /api/users
 * Métodos: GET (listar), POST (crear)
 * ============================================
 */

const db = require('../_lib/db');
const { success, error, serverError, setCorsHeaders } = require('../_lib/response');
const { hashPassword } = require('../_lib/auth');

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
                return await getUsers(req, res);
            case 'POST':
                return await createUser(req, res);
            default:
                return error(res, 'Método no permitido', 405);
        }
    } catch (err) {
        return serverError(res, err);
    }
};

/**
 * Obtiene la lista de todos los usuarios
 * GET /api/users
 */
async function getUsers(req, res) {
    const users = await db.query(
        'SELECT id, nombre, email, fecha_creacion, fecha_actualizacion FROM usuarios ORDER BY fecha_creacion DESC'
    );
    return success(res, users);
}

/**
 * Crea un nuevo usuario
 * POST /api/users
 * Body: { nombre, email, password }
 */
async function createUser(req, res) {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || nombre.trim().length < 2) {
        return error(res, 'El nombre debe tener al menos 2 caracteres');
    }

    if (!email || !isValidEmail(email)) {
        return error(res, 'Ingresa un correo electrónico válido');
    }

    if (!password || password.length < 6) {
        return error(res, 'La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el email ya existe
    const existingUser = await db.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email.toLowerCase()]
    );

    if (existingUser.length > 0) {
        return error(res, 'Este correo ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar usuario
    const result = await db.query(
        'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id',
        [nombre.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    // Obtener usuario creado
    const newUser = await db.query(
        'SELECT id, nombre, email, fecha_creacion FROM usuarios WHERE id = $1',
        [result[0].id]
    );

    return success(res, newUser[0], 201);
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
