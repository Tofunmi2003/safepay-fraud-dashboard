import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Change this to your MySQL password
  database: 'transactions'   // Change this to your DB name
});

export default pool;