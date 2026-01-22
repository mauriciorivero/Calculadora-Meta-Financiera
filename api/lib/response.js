/**
 * ============================================
 * UTILIDADES DE RESPUESTA HTTP
 * Funciones helper para respuestas estandarizadas
 * ============================================
 */

/**
 * Envía una respuesta exitosa
 * @param {Object} res - Objeto response de Vercel
 * @param {Object} data - Datos a enviar
 * @param {number} statusCode - Código de estado HTTP (default: 200)
 */
function success(res, data, statusCode = 200) {
    res.status(statusCode).json({
        success: true,
        data
    });
}

/**
 * Envía una respuesta de error
 * @param {Object} res - Objeto response de Vercel
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP (default: 400)
 */
function error(res, message, statusCode = 400) {
    res.status(statusCode).json({
        success: false,
        error: message
    });
}

/**
 * Envía una respuesta de error del servidor
 * @param {Object} res - Objeto response de Vercel
 * @param {Error} err - Error capturado
 */
function serverError(res, err) {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
}

/**
 * Envía una respuesta de no autorizado
 * @param {Object} res - Objeto response de Vercel
 * @param {string} message - Mensaje de error
 */
function unauthorized(res, message = 'No autorizado') {
    res.status(401).json({
        success: false,
        error: message
    });
}

/**
 * Envía una respuesta de no encontrado
 * @param {Object} res - Objeto response de Vercel
 * @param {string} message - Mensaje de error
 */
function notFound(res, message = 'Recurso no encontrado') {
    res.status(404).json({
        success: false,
        error: message
    });
}

/**
 * Configura los headers CORS para la respuesta
 * @param {Object} res - Objeto response de Vercel
 */
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
}

module.exports = {
    success,
    error,
    serverError,
    unauthorized,
    notFound,
    setCorsHeaders
};
