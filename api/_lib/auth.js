/**
 * ============================================
 * UTILIDADES DE AUTENTICACIÓN
 * Funciones para JWT y verificación de tokens
 * ============================================
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Genera un hash de la contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Hash de la contraseña
 */
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña con su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} True si coinciden
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Genera un token JWT para el usuario
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT
 */
function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Extrae el token del header Authorization
 * @param {Object} req - Objeto request
 * @returns {string|null} Token extraído o null
 */
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

/**
 * Middleware para verificar autenticación
 * @param {Object} req - Objeto request
 * @returns {Object|null} Usuario decodificado o null
 */
function authenticateRequest(req) {
    const token = extractToken(req);
    if (!token) {
        return null;
    }
    return verifyToken(token);
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    extractToken,
    authenticateRequest
};
