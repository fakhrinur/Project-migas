// db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // untuk Azure
        trustServerCertificate: true, // untuk development local
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

let pool = null;

const getConnection = async () => {
    try {
        if (pool && pool.connected) {
            return pool;
        }

        pool = await sql.connect(config);
        
        console.log('✅ Connected to SQL Server');
        console.log(`   Database: ${config.database}`);
        console.log(`   Server: ${config.server}`);
        
        return pool;
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        throw err;
    }
};

// Handle connection errors
sql.on('error', err => {
    console.error('SQL Error:', err);
});

module.exports = { 
    sql, 
    getConnection,
    closeConnection: async () => {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Database connection closed');
        }
    }
};
