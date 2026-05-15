const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/v1/records - 创建新记录 或 提交草稿
 * body: { form_template_id, action: 'draft'|'submit', values: {}, current_step }
 */
exports.createOrSubmit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { form_template_id, action, values, current_step } = req.body;

    if (!form_template_id) {
      return res.status(400).json({ code: 400, message: '缺少 form_template_id' });
    }

    const recordSn = `HF${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const status = action === 'submit' ? 'submitted' : 'draft';

    const [recordId] = await db('records').insert({
      user_id: userId,
      form_template_id,
      record_sn: recordSn,
      status,
      current_step: current_step || 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Save field values if provided
    if (values && Object.keys(values).length > 0) {
      // Look up field IDs by field_key
      const templateFields = await db('form_fields')
        .join('form_steps', 'form_fields.step_id', 'form_steps.id')
        .where('form_steps.template_id', form_template_id)
        .select('form_fields.id', 'form_fields.field_key');
      const keyToId = {};
      templateFields.forEach(f => { keyToId[f.field_key] = f.id; });

      const valueEntries = Object.entries(values).map(([key, value]) => ({
        record_id: recordId,
        field_id: keyToId[key] || parseInt(key), // support both field_key and field_id
        value: typeof value === 'object' ? JSON.stringify(value) : String(value || ''),
      })).filter(v => v.field_id); // skip unknown fields

      if (valueEntries.length > 0) {
        await db('record_values').insert(valueEntries);
      }
    }

    const record = await db('records').where({ id: recordId }).first();

    res.json({
      code: 0,
      message: action === 'submit' ? '提交成功' : '草稿已保存',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/records/:id - 更新草稿
 */
exports.updateDraft = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { values, current_step, action } = req.body;

    const record = await db('records').where({ id, user_id: userId }).first();
    if (!record) {
      return res.status(404).json({ code: 404, message: '记录不存在' });
    }
    if (record.status === 'submitted') {
      return res.status(400).json({ code: 400, message: '已提交的记录无法修改' });
    }

    const newStatus = action === 'submit' ? 'submitted' : record.status;

    await db('records').where({ id }).update({
      status: newStatus,
      current_step: current_step || record.current_step,
      updated_at: new Date(),
    });

    // Delete old values and re-insert
    if (values) {
      await db('record_values').where({ record_id: id }).delete();
      // Look up field IDs by field_key
      const templateFields = await db('form_fields')
        .join('form_steps', 'form_fields.step_id', 'form_steps.id')
        .where('form_steps.template_id', record.form_template_id)
        .select('form_fields.id', 'form_fields.field_key');
      const keyToId = {};
      templateFields.forEach(f => { keyToId[f.field_key] = f.id; });

      const valueEntries = Object.entries(values).map(([key, value]) => ({
        record_id: id,
        field_id: keyToId[key] || parseInt(key),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value || ''),
      })).filter(v => v.field_id);

      if (valueEntries.length > 0) {
        await db('record_values').insert(valueEntries);
      }
    }

    res.json({
      code: 0,
      message: newStatus === 'submitted' ? '提交成功' : '草稿已更新',
      data: { id, status: newStatus },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/records - 用户提交记录列表
 */
exports.getUserRecords = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, page_size = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(page_size);

    let query = db('records').where({ user_id: userId });
    if (status) {
      query = query.where({ status });
    }

    const [{ count }] = await query.clone().count('* as count');
    const records = await query
      .select('id', 'record_sn', 'form_template_id', 'status', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc')
      .limit(parseInt(page_size))
      .offset(offset);

    res.json({
      code: 0,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          page_size: parseInt(page_size),
          total: count,
          total_pages: Math.ceil(count / parseInt(page_size)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/records/:id - 记录详情（含字段值 + 反馈）
 */
exports.getRecordDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const record = await db('records').where({ id, user_id: userId }).first();
    if (!record) {
      return res.status(404).json({ code: 404, message: '记录不存在' });
    }

    const values = await db('record_values').where({ record_id: id });
    const feedbacks = await db('feedback').where({ record_id: id })
      .leftJoin('admins', 'feedback.admin_id', 'admins.id')
      .select('feedback.*', 'admins.username as admin_name')
      .orderBy('feedback.created_at', 'asc');

    // Get form structure
    const template = await db('form_templates').where({ id: record.form_template_id }).first();
    const steps = await db('form_steps').where({ template_id: record.form_template_id }).orderBy('step_number');
    const allFields = await db('form_fields')
      .whereIn('step_id', steps.map(s => s.id))
      .orderBy('sort_order');

    res.json({
      code: 0,
      data: {
        record,
        template: template ? { id: template.id, title: template.title } : null,
        values: values.map(v => ({
          field_id: v.field_id,
          value: v.value,
          field: allFields.find(f => f.id === v.field_id) || null,
        })),
        feedbacks,
      },
    });
  } catch (err) {
    next(err);
  }
};
