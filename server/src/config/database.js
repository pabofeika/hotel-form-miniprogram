const knex = require('knex');
const config = require('./index');
const knexConfig = require('./knexfile');
const logger = require('./logger');

const env = config.nodeEnv === 'production' ? 'production' : 'development';
const db = knex(knexConfig[env]);

// Test connection
db.raw('SELECT 1')
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => logger.error('Database connection failed:', err));

module.exports = db;
