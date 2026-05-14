const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');
const { adminAuthMiddleware } = require('../../middleware/auth');

// GET /api/v1/admin/dashboard - 统计看板
router.get('/dashboard', adminAuthMiddleware, dashboardController.getStats);

module.exports = router;
