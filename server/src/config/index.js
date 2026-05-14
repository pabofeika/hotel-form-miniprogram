require('dotenv').config();
const path = require('path');

module.exports = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'hotel-form-dev-secret',
    adminSecret: process.env.JWT_ADMIN_SECRET || 'hotel-form-admin-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    adminExpiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '8h',
  },

  db: {
    client: process.env.DB_CLIENT || 'better-sqlite3',
    filename: process.env.DB_FILENAME || './data/hotel-form.db',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hotel_form',
    },
  },

  wechat: {
    appid: process.env.WX_APPID || '',
    appsecret: process.env.WX_APPSECRET || '',
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session',
    tokenUrl: 'https://api.weixin.qq.com/cgi-bin/token',
    subscribeSendUrl: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send',
  },

  upload: {
    dir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'),
    allowedTypes: ['.apk', '.zip', '.png', '.jpg', '.jpeg', '.pdf'],
  },

  isDev: () => process.env.NODE_ENV === 'development',
  isProd: () => process.env.NODE_ENV === 'production',
};
