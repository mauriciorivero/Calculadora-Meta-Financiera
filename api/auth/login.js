/**
 * ============================================
 * API DE AUTENTICACIÓN - LOGIN
 * Endpoint: /api/auth/login
 * Método: POST
 * ============================================
 */

const db = require('../lib/db');
const { success, error, serverError, setCorsHeaders } = require('../lib/response');
const { comparePassword, generateToken } = require('../lib/auth');

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
        const { email, password } = req.body;

        // Validaciones
        if (!email || !password) {
            return error(res, 'Email y contraseña son requeridos');
        }

        // Buscar usuario por email
        const users = await db.query(
            'SELECT id, nombre, email, password FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return error(res, 'Credenciales inválidas', 401);
        }

        const user = users[0];

        // Verificar contraseña
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return error(res, 'Credenciales inválidas', 401);
        }

        // Generar token JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            nombre: user.nombre
        });

        // Responder con token y datos del usuario (sin contraseña)
        return success(res, {
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email
            }
        });

    } catch (err) {
        return serverError(res, err);
    }
};
