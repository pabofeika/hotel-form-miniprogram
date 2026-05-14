const db = require('../../config/database');

// ===================== 模板 CRUD =====================

/**
 * GET /api/v1/admin/form-templates - 模板列表
 */
exports.list = async (req, res, next) => {
  try {
    const templates = await db('form_templates')
      .select('id', 'title', 'description', 'status', 'version', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc');

    // Count records for each template
    const result = await Promise.all(templates.map(async (tpl) => {
      const [{ count }] = await db('records').where({ form_template_id: tpl.id }).count('* as count');
      return { ...tpl, record_count: count };
    }));

    res.json({ code: 0, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/form-templates - 创建模板
 */
exports.create = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空' });
    }

    const [id] = await db('form_templates').insert({
      title,
      description: description || '',
      status: 'draft',
      version: '1.0',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Auto-create a default first step
    await db('form_steps').insert({
      template_id: id,
      step_number: 1,
      title: '基本信息',
      description: '',
    });

    const template = await db('form_templates').where({ id }).first();
    res.json({ code: 0, message: '创建成功', data: template });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/form-templates/:id - 查看模板完整结构
 */
exports.detail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await db('form_templates').where({ id }).first();
    if (!template) {
      return res.status(404).json({ code: 404, message: '模板不存在' });
    }

    const steps = await db('form_steps')
      .where({ template_id: id })
      .orderBy('step_number', 'asc');

    const stepIds = steps.map(s => s.id);
    const fields = stepIds.length > 0
      ? await db('form_fields').whereIn('step_id', stepIds).orderBy('sort_order', 'asc')
      : [];

    res.json({
      code: 0,
      data: {
        ...template,
        steps: steps.map(step => ({
          ...step,
          fields: fields.filter(f => f.step_id === step.id),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/form-templates/:id - 编辑模板
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const template = await db('form_templates').where({ id }).first();
    if (!template) {
      return res.status(404).json({ code: 404, message: '模板不存在' });
    }

    // If published, create new version
    let newVersion = template.version;
    if (template.status === 'published') {
      const versionParts = template.version.split('.').map(Number);
      newVersion = `${versionParts[0]}.${(versionParts[1] || 0) + 1}`;
    }

    await db('form_templates').where({ id }).update({
      title: title || template.title,
      description: description !== undefined ? description : template.description,
      version: newVersion,
      status: template.status === 'published' ? 'draft' : template.status,
      updated_at: new Date(),
    });

    res.json({ code: 0, message: '更新成功', data: { id, version: newVersion } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/form-templates/:id - 删除模板
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await db('form_templates').where({ id }).first();
    if (!template) {
      return res.status(404).json({ code: 404, message: '模板不存在' });
    }
    if (template.status === 'published') {
      return res.status(400).json({ code: 400, message: '已发布的模板不能删除，请先下架' });
    }

    // Delete all related data in order
    const steps = await db('form_steps').where({ template_id: id });
    const stepIds = steps.map(s => s.id);
    if (stepIds.length > 0) {
      await db('form_fields').whereIn('step_id', stepIds).del();
    }
    await db('form_steps').where({ template_id: id }).del();
    await db('form_templates').where({ id }).del();

    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/form-templates/:id/clone - 克隆模板
 */
exports.clone = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await db('form_templates').where({ id }).first();
    if (!template) {
      return res.status(404).json({ code: 404, message: '模板不存在' });
    }

    // Clone template
    const [newId] = await db('form_templates').insert({
      title: `${template.title}(副本)`,
      description: template.description,
      status: 'draft',
      version: '1.0',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clone steps and fields
    const steps = await db('form_steps').where({ template_id: id }).orderBy('step_number');
    for (const step of steps) {
      const [newStepId] = await db('form_steps').insert({
        template_id: newId,
        step_number: step.step_number,
        title: step.title,
        description: step.description,
      });

      const fields = await db('form_fields').where({ step_id: step.id }).orderBy('sort_order');
      if (fields.length > 0) {
        await db('form_fields').insert(
          fields.map(f => ({
            step_id: newStepId,
            field_key: f.field_key,
            label: f.label,
            field_type: f.field_type,
            is_required: f.is_required,
            placeholder: f.placeholder,
            help_text: f.help_text,
            options: f.options,
            validation: f.validation,
            conditions: f.conditions,
            sort_order: f.sort_order,
          }))
        );
      }
    }

    res.json({ code: 0, message: '克隆成功', data: { id: newId } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/form-templates/:id/publish - 发布
 */
exports.publish = async (req, res, next) => {
  try {
    const { id } = req.params;

    const steps = await db('form_steps').where({ template_id: id });
    if (steps.length === 0) {
      return res.status(400).json({ code: 400, message: '请至少添加一个步骤再发布' });
    }

    await db('form_templates').where({ id }).update({
      status: 'published',
      updated_at: new Date(),
    });

    res.json({ code: 0, message: '发布成功' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/form-templates/:id/unpublish - 下架
 */
exports.unpublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db('form_templates').where({ id }).update({
      status: 'unpublished',
      updated_at: new Date(),
    });
    res.json({ code: 0, message: '已下架' });
  } catch (err) {
    next(err);
  }
};

// ===================== 步骤 CRUD =====================

/**
 * POST /api/v1/admin/form-templates/:id/steps - 添加步骤
 */
exports.addStep = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ code: 400, message: '步骤标题不能为空' });
    }

    // Get max step number
    const maxStep = await db('form_steps')
      .where({ template_id: id })
      .max('step_number as max_num')
      .first();

    const [stepId] = await db('form_steps').insert({
      template_id: id,
      step_number: (maxStep?.max_num || 0) + 1,
      title,
      description: description || '',
    });

    // Update template timestamp
    await db('form_templates').where({ id }).update({ updated_at: new Date() });

    const step = await db('form_steps').where({ id: stepId }).first();
    res.json({ code: 0, message: '步骤已添加', data: step });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/form-templates/:id/steps/:stepId - 编辑步骤
 */
exports.updateStep = async (req, res, next) => {
  try {
    const { stepId } = req.params;
    const { title, description, step_number } = req.body;

    const updateData = { updated_at: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (step_number !== undefined) updateData.step_number = step_number;

    await db('form_steps').where({ id: stepId }).update(updateData);

    res.json({ code: 0, message: '步骤已更新' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/form-templates/:id/steps/:stepId - 删除步骤
 */
exports.deleteStep = async (req, res, next) => {
  try {
    const { stepId } = req.params;

    // Delete all fields in this step first
    await db('form_fields').where({ step_id: stepId }).del();
    await db('form_steps').where({ id: stepId }).del();

    res.json({ code: 0, message: '步骤已删除' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/form-templates/:id/steps/reorder - 重排步骤顺序
 * body: { stepIds: [3, 1, 2] } (按照新顺序排列的 step id 数组)
 */
exports.reorderSteps = async (req, res, next) => {
  try {
    const { stepIds } = req.body;
    if (!Array.isArray(stepIds)) {
      return res.status(400).json({ code: 400, message: 'stepIds 必须是数组' });
    }

    for (let i = 0; i < stepIds.length; i++) {
      await db('form_steps').where({ id: stepIds[i] }).update({ step_number: i + 1 });
    }

    res.json({ code: 0, message: '排序已更新' });
  } catch (err) {
    next(err);
  }
};

// ===================== 字段 CRUD =====================

const VALID_FIELD_TYPES = [
  'text', 'textarea', 'number', 'email', 'phone',
  'select', 'multi_select', 'date', 'file', 'image',
];

/**
 * POST /api/v1/admin/form-templates/:id/steps/:stepId/fields - 添加字段
 */
exports.addField = async (req, res, next) => {
  try {
    const { stepId } = req.params;
    const {
      field_key, label, field_type, is_required,
      placeholder, help_text, options, validation, conditions,
    } = req.body;

    if (!field_key || !label || !field_type) {
      return res.status(400).json({ code: 400, message: 'field_key, label, field_type 为必填' });
    }
    if (!VALID_FIELD_TYPES.includes(field_type)) {
      return res.status(400).json({ code: 400, message: `无效的字段类型: ${field_type}，允许: ${VALID_FIELD_TYPES.join(', ')}` });
    }

    // Get max sort order
    const maxSort = await db('form_fields')
      .where({ step_id: stepId })
      .max('sort_order as max')
      .first();

    const [fieldId] = await db('form_fields').insert({
      step_id: stepId,
      field_key,
      label,
      field_type,
      is_required: is_required ? 1 : 0,
      placeholder: placeholder || '',
      help_text: help_text || '',
      options: options ? JSON.stringify(options) : null,
      validation: validation ? JSON.stringify(validation) : null,
      conditions: conditions ? JSON.stringify(conditions) : null,
      sort_order: (maxSort?.max || 0) + 1,
    });

    const field = await db('form_fields').where({ id: fieldId }).first();
    res.json({ code: 0, message: '字段已添加', data: field });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/form-templates/:id/fields/:fieldId - 编辑字段
 */
exports.updateField = async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const {
      field_key, label, field_type, is_required,
      placeholder, help_text, options, validation, conditions, sort_order,
    } = req.body;

    const field = await db('form_fields').where({ id: fieldId }).first();
    if (!field) {
      return res.status(404).json({ code: 404, message: '字段不存在' });
    }

    const updateData = {};
    if (field_key !== undefined) updateData.field_key = field_key;
    if (label !== undefined) updateData.label = label;
    if (field_type !== undefined) {
      if (!VALID_FIELD_TYPES.includes(field_type)) {
        return res.status(400).json({ code: 400, message: `无效的字段类型: ${field_type}` });
      }
      updateData.field_type = field_type;
    }
    if (is_required !== undefined) updateData.is_required = is_required ? 1 : 0;
    if (placeholder !== undefined) updateData.placeholder = placeholder;
    if (help_text !== undefined) updateData.help_text = help_text;
    if (options !== undefined) updateData.options = JSON.stringify(options);
    if (validation !== undefined) updateData.validation = JSON.stringify(validation);
    if (conditions !== undefined) updateData.conditions = JSON.stringify(conditions);
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    await db('form_fields').where({ id: fieldId }).update(updateData);

    res.json({ code: 0, message: '字段已更新' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/form-templates/:id/fields/:fieldId - 删除字段
 */
exports.deleteField = async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    await db('form_fields').where({ id: fieldId }).del();
    res.json({ code: 0, message: '字段已删除' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/form-templates/:id/fields/:fieldId/reorder - 重排字段
 * body: { fieldIds: [5, 3, 7, 1] }
 */
exports.reorderFields = async (req, res, next) => {
  try {
    const { fieldIds } = req.body;
    if (!Array.isArray(fieldIds)) {
      return res.status(400).json({ code: 400, message: 'fieldIds 必须是数组' });
    }

    for (let i = 0; i < fieldIds.length; i++) {
      await db('form_fields').where({ id: fieldIds[i] }).update({ sort_order: i + 1 });
    }

    res.json({ code: 0, message: '排序已更新' });
  } catch (err) {
    next(err);
  }
};
