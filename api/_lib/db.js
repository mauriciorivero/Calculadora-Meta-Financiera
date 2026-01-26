/**
 * ============================================
 * CLASE DATABASE (SINGLETON)
 * Gestiona la conexión a PostgreSQL usando pg
 * ============================================
 */

const { Pool } = require('pg');

/**
 * Clase para gestionar la conexión a PostgreSQL
 * Implementa el patrón Singleton para reutilizar conexiones
 */
class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.pool = null;
        Database.instance = this;
    }

    /**
     * Obtiene o crea el pool de conexiones
     */
    getPool() {
        if (!this.pool) {
            // Usar DATABASE_URL si está disponible (Supabase)
            if (process.env.DATABASE_URL) {
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            } else {
                // Usar variables individuales
                this.pool = new Pool({
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT) || 5432,
                    user: process.env.DB_USER || 'postgres',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'postgres',
                    ssl: {
                        rejectUnauthorized: false
                    },
                    max: 10,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000
                });
            }

            console.log('Pool de conexiones PostgreSQL creado');
        }

        return this.pool;
    }

    /**
     * Ejecuta una consulta SQL
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros de la consulta
     * @returns {Promise<Array>} - Resultados de la consulta
     */
    async query(sql, params = []) {
        const pool = this.getPool();
        try {
            // PostgreSQL usa $1, $2, etc. en lugar de $1
            const result = await pool.query(sql, params);
            return result.rows;
        } catch (error) {
            console.error('Error en consulta SQL:', error);
            throw error;
        }
    }

    /**
     * Obtiene una conexión del pool para transacciones
     * @returns {Promise<PoolConnection>} Conexión del pool
     */
    async getConnection() {
        const pool = await this.getPool();
        return await pool.connect();
    }

    /**
     * Cierra el pool de conexiones
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

// Exportar instancia única (Singleton)
const db = new Database();
module.exports = db;
