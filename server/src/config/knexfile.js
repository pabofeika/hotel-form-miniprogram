require('dotenv').config();
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'better-sqlite3',
    connection: {
      filename: path.resolve(baseDir, '..', process.env.DB_FILENAME || './data/hotel-form.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(baseDir, 'migrations'),
    },
    seeds: {
      directory: path.join(baseDir, 'seeds'),
    },
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: path.join(baseDir, 'migrations'),
    },
    seeds: {
      directory: path.join(baseDir, 'seeds'),
    },
  },
};
