/**
 * ============================================
 * SQL HELPER
 * Utilidades para convertir consultas MySQL a PostgreSQL
 * ============================================
 */

/**
 * Convierte placeholders de MySQL (?) a PostgreSQL ($1, $2, etc.)
 * @param {string} sql - Consulta SQL con placeholders de MySQL
 * @returns {string} - Consulta SQL con placeholders de PostgreSQL
 */
function convertPlaceholders(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

/**
 * Convierte LIMIT con OFFSET de MySQL a PostgreSQL
 * MySQL: LIMIT offset, count
 * PostgreSQL: LIMIT count OFFSET offset
 */
function convertLimitOffset(sql) {
    // Patrón: LIMIT número, número
    const limitPattern = /LIMIT\s+(\d+)\s*,\s*(\d+)/gi;
    return sql.replace(limitPattern, 'LIMIT $2 OFFSET $1');
}

/**
 * Convierte NOW() a CURRENT_TIMESTAMP para PostgreSQL
 */
function convertNow(sql) {
    return sql.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
}

/**
 * Convierte consultas INSERT con RETURNING para PostgreSQL
 * PostgreSQL requiere RETURNING para obtener el ID insertado
 */
function addReturningClause(sql) {
    if (sql.trim().toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
        return sql.trim() + ' RETURNING id';
    }
    return sql;
}

/**
 * Convierte una consulta completa de MySQL a PostgreSQL
 * @param {string} sql - Consulta SQL de MySQL
 * @returns {string} - Consulta SQL compatible con PostgreSQL
 */
function convertQuery(sql) {
    let converted = sql;
    converted = convertPlaceholders(converted);
    converted = convertLimitOffset(converted);
    converted = convertNow(converted);
    return converted;
}

module.exports = {
    convertPlaceholders,
    convertLimitOffset,
    convertNow,
    addReturningClause,
    convertQuery
};
