const express = require('express');
const router = express.Router();
const adminRecordController = require('../../controllers/admin/recordController');
const { adminAuthMiddleware } = require('../../middleware/auth');

router.use(adminAuthMiddleware);

// GET /api/v1/admin/records - 所有记录列表
router.get('/', adminRecordController.list);

// GET /api/v1/admin/records/:id - 记录详情
router.get('/:id', adminRecordController.detail);

// PUT /api/v1/admin/records/:id/status - 更新状态
router.put('/:id/status', adminRecordController.updateStatus);

// POST /api/v1/admin/records/:id/feedback - 填写反馈
router.post('/:id/feedback', adminRecordController.addFeedback);

// GET /api/v1/admin/records/:id/feedback - 查看反馈
router.get('/:id/feedback', adminRecordController.getFeedback);

module.exports = router;
