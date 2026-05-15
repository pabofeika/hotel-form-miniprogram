const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// GET /api/v1/forms - 已发布的表单模板列表（无需登录即可查看）
router.get('/', formController.getPublishedForms);

// GET /api/v1/forms/:id - 表单完整结构（无需登录即可查看）
router.get('/:id', formController.getFormDetail);

module.exports = router;
