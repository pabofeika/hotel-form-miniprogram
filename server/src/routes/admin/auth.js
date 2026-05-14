const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/authController');

// POST /api/v1/admin/auth/login - 管理员登录
router.post('/login', adminAuthController.login);

module.exports = router;
