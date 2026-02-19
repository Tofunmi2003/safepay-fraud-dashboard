import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables if .env exists
dotenv.config();

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Empty password as seen in .env
    database: 'transactions', // Database name from .env
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
