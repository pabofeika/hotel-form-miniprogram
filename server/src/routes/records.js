const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/v1/records - 创建/提交记录
router.post('/', recordController.createOrSubmit);

// PUT /api/v1/records/:id - 更新草稿
router.put('/:id', recordController.updateDraft);

// GET /api/v1/records - 用户提交记录列表
router.get('/', recordController.getUserRecords);

// GET /api/v1/records/:id - 记录详情
router.get('/:id', recordController.getRecordDetail);

module.exports = router;
