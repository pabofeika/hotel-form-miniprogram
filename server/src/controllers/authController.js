const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/database');
const config = require('../config');
const logger = require('../config/logger');

/**
 * POST /api/v1/auth/login
 * wx.code → exchange for openid → create/find user → return JWT
 */
exports.login = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ code: 400, message: '缺少 code 参数' });
    }

    // Call WeChat API to exchange code for openid
    let openid;
    if (config.wechat.appid && config.wechat.appsecret) {
      const wxResp = await axios.get(config.wechat.loginUrl, {
        params: {
          appid: config.wechat.appid,
          secret: config.wechat.appsecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      if (wxResp.data.errcode) {
        logger.error('WeChat login failed:', wxResp.data);
        return res.status(400).json({ code: 400, message: '微信登录失败: ' + wxResp.data.errmsg });
      }
      openid = wxResp.data.openid;
    } else {
      // Dev mode: use a mock openid if WeChat not configured
      openid = `mock_${code || 'dev_user'}`;
      logger.warn('WeChat API not configured, using mock openid:', openid);
    }

    // Find or create user
    let user = await db('users').where({ openid }).first();
    if (!user) {
      const [id] = await db('users').insert({
        openid,
        created_at: new Date(),
        updated_at: new Date(),
      });
      user = await db('users').where({ id }).first();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, openid: user.openid },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          avatar: user.avatar,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Refresh JWT token
 */
exports.refresh = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }

    const oldToken = header.split(' ')[1];
    const decoded = jwt.verify(oldToken, config.jwt.secret);

    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    const token = jwt.sign(
      { id: user.id, openid: user.openid },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({ code: 0, message: '刷新成功', data: { token } });
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token 无效或已过期' });
  }
};
