const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/v1/forms - 已发布的表单模板列表
router.get('/', authMiddleware, formController.getPublishedForms);

// GET /api/v1/forms/:id - 表单完整结构
router.get('/:id', authMiddleware, formController.getFormDetail);

module.exports = router;
