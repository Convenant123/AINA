const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aina',
  socketPath: process.env.DB_SOCKET || '/tmp/opencode/mysql.sock',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
