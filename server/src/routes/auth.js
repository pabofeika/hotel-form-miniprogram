const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/v1/auth/login - 微信登录
router.post('/login', authController.login);

// POST /api/v1/auth/refresh - 刷新 token
router.post('/refresh', authController.refresh);

module.exports = router;
