const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const config = require('../../config');

/**
 * POST /api/v1/admin/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '请输入用户名和密码' });
    }

    const admin = await db('admins').where({ username }).first();
    if (!admin) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      config.jwt.adminSecret,
      { expiresIn: config.jwt.adminExpiresIn }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        admin: { id: admin.id, username: admin.username, role: admin.role },
      },
    });
  } catch (err) {
    next(err);
  }
};
