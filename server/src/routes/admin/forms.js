const express = require('express');
const router = express.Router();
const adminFormController = require('../../controllers/admin/formController');
const { adminAuthMiddleware } = require('../../middleware/auth');

router.use(adminAuthMiddleware);

// 模板 CRUD
router.get('/form-templates', adminFormController.list);
router.post('/form-templates', adminFormController.create);
router.get('/form-templates/:id', adminFormController.detail);
router.put('/form-templates/:id', adminFormController.update);
router.delete('/form-templates/:id', adminFormController.delete);
router.post('/form-templates/:id/clone', adminFormController.clone);
router.put('/form-templates/:id/publish', adminFormController.publish);
router.put('/form-templates/:id/unpublish', adminFormController.unpublish);

// 步骤 CRUD
router.post('/form-templates/:id/steps', adminFormController.addStep);
router.put('/form-templates/:id/steps/:stepId', adminFormController.updateStep);
router.delete('/form-templates/:id/steps/:stepId', adminFormController.deleteStep);
router.put('/form-templates/:id/steps/reorder', adminFormController.reorderSteps);

// 字段 CRUD
router.post('/form-templates/:id/steps/:stepId/fields', adminFormController.addField);
router.put('/form-templates/:id/fields/:fieldId', adminFormController.updateField);
router.delete('/form-templates/:id/fields/:fieldId', adminFormController.deleteField);
router.put('/form-templates/:id/fields/:fieldId/reorder', adminFormController.reorderFields);

module.exports = router;
