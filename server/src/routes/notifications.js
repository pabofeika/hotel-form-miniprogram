const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/v1/notifications/subscribe - 保存订阅结果
router.post('/subscribe', authMiddleware, notificationController.saveSubscription);

module.exports = router;
