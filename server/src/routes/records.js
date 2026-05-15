const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { optionalAuth } = require('../middleware/auth');

// 可选认证：有 token 就用，没有就使用默认用户
router.use(optionalAuth);

// POST /api/v1/records - 创建/提交记录
router.post('/', recordController.createOrSubmit);

// PUT /api/v1/records/:id - 更新草稿
router.put('/:id', recordController.updateDraft);

// GET /api/v1/records - 用户提交记录列表
router.get('/', recordController.getUserRecords);

// GET /api/v1/records/:id - 记录详情
router.get('/:id', recordController.getRecordDetail);

module.exports = router;
