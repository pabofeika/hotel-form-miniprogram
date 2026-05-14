const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/v1/upload - 文件上传
router.post('/', authMiddleware, uploadController.uploadFile);

module.exports = router;
