const db = require('../config/database');

/**
 * GET /api/v1/forms - 已发布的表单模板列表
 */
exports.getPublishedForms = async (req, res, next) => {
  try {
    const forms = await db('form_templates')
      .where({ status: 'published' })
      .select('id', 'title', 'description', 'version', 'created_at')
      .orderBy('created_at', 'desc');

    res.json({ code: 0, data: forms });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/forms/:id - 表单完整结构（steps + fields）
 */
exports.getFormDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await db('form_templates')
      .where({ id })
      .whereIn('status', ['published'])
      .first();

    if (!template) {
      return res.status(404).json({ code: 404, message: '表单模板不存在' });
    }

    const steps = await db('form_steps')
      .where({ template_id: id })
      .orderBy('step_number', 'asc');

    const stepIds = steps.map(s => s.id);
    const fields = await db('form_fields')
      .whereIn('step_id', stepIds)
      .orderBy('sort_order', 'asc');

    // Build structure
    const structure = {
      ...template,
      steps: steps.map(step => ({
        ...step,
        fields: fields.filter(f => f.step_id === step.id),
      })),
    };

    res.json({ code: 0, data: structure });
  } catch (err) {
    next(err);
  }
};
