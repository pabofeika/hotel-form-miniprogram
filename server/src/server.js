const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});
