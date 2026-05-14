const db = require('../../config/database');

/**
 * GET /api/v1/admin/records - 所有记录列表
 */
exports.list = async (req, res, next) => {
  try {
    const { status, keyword, page = 1, page_size = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(page_size);

    let query = db('records')
      .leftJoin('users', 'records.user_id', 'users.id')
      .leftJoin('form_templates', 'records.form_template_id', 'form_templates.id');

    if (status) query = query.where('records.status', status);
    if (keyword) {
      query = query.where(function () {
        this.where('records.record_sn', 'like', `%${keyword}%`)
          .orWhere('users.openid', 'like', `%${keyword}%`);
      });
    }

    const [{ count }] = await query.clone().count('* as count');
    const records = await query
      .select(
        'records.id', 'records.record_sn', 'records.status',
        'records.current_step', 'records.created_at', 'records.updated_at',
        'users.openid', 'users.nickname',
        'form_templates.title as form_title'
      )
      .orderBy('records.created_at', 'desc')
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
 * GET /api/v1/admin/records/:id - 记录详情
 */
exports.detail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await db('records')
      .leftJoin('users', 'records.user_id', 'users.id')
      .leftJoin('form_templates', 'records.form_template_id', 'form_templates.id')
      .select(
        'records.*',
        'users.openid', 'users.nickname',
        'form_templates.title as form_title', 'form_templates.version'
      )
      .where('records.id', id)
      .first();

    if (!record) {
      return res.status(404).json({ code: 404, message: '记录不存在' });
    }

    const values = await db('record_values').where({ record_id: id });
    const steps = await db('form_steps').where({ template_id: record.form_template_id }).orderBy('step_number');
    const allFields = await db('form_fields')
      .whereIn('step_id', steps.map(s => s.id))
      .orderBy('sort_order');
    const feedbacks = await db('feedback').where({ record_id: id })
      .leftJoin('admins', 'feedback.admin_id', 'admins.id')
      .select('feedback.*', 'admins.username as admin_name')
      .orderBy('feedback.created_at', 'asc');

    res.json({
      code: 0,
      data: {
        record,
        steps,
        fields: allFields,
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

/**
 * PUT /api/v1/admin/records/:id/status - 更新状态
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'submitted', 'reviewing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的状态值' });
    }

    await db('records').where({ id }).update({ status, updated_at: new Date() });

    res.json({ code: 0, message: '状态已更新' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/records/:id/feedback - 添加反馈（自动触发通知）
 */
exports.addFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ code: 400, message: '反馈内容不能为空' });
    }

    const [feedbackId] = await db('feedback').insert({
      record_id: id,
      admin_id: adminId,
      content: content.trim(),
      created_at: new Date(),
    });

    // Also update record status to 'reviewing' if it's submitted
    await db('records').where({ id }).update({
      status: 'reviewing',
      updated_at: new Date(),
    });

    // TODO: Trigger WeChat subscribe message notification
    // This will be implemented when WeChat API is configured

    const feedback = await db('feedback').where({ id: feedbackId }).first();

    res.json({ code: 0, message: '反馈已提交', data: feedback });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/records/:id/feedback - 查看反馈
 */
exports.getFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedbacks = await db('feedback').where({ record_id: id })
      .leftJoin('admins', 'feedback.admin_id', 'admins.id')
      .select('feedback.*', 'admins.username as admin_name')
      .orderBy('feedback.created_at', 'asc');

    res.json({ code: 0, data: feedbacks });
  } catch (err) {
    next(err);
  }
};
