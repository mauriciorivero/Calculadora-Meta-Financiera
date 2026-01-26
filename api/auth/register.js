/**
 * ============================================
 * API DE AUTENTICACIÓN - REGISTRO
 * Endpoint: /api/auth/register
 * Método: POST
 * ============================================
 */

const db = require('../_lib/db');
const { success, error, serverError, setCorsHeaders } = require('../_lib/response');
const { hashPassword, generateToken } = require('../_lib/auth');

module.exports = async (req, res) => {
    // Configurar CORS
    setCorsHeaders(res);

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo permitir POST
    if (req.method !== 'POST') {
        return error(res, 'Método no permitido', 405);
    }

    try {
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

        // Insertar usuario y retornar el ID
        const result = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id',
            [nombre.trim(), email.toLowerCase().trim(), hashedPassword]
        );

        // Generar token JWT (PostgreSQL retorna el ID en result[0].id)
        const userId = result[0].id;
        const token = generateToken({
            id: userId,
            email: email.toLowerCase().trim(),
            nombre: nombre.trim()
        });

        // Responder con token y datos del usuario
        return success(res, {
            token,
            user: {
                id: userId,
                nombre: nombre.trim(),
                email: email.toLowerCase().trim()
            }
        }, 201);

    } catch (err) {
        return serverError(res, err);
    }
};

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
