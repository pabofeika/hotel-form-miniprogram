const db = require('../config/database');

/**
 * POST /api/v1/notifications/subscribe
 * 用户提交订阅消息授权结果
 */
exports.saveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { record_id, tmplIds } = req.body;

    if (!record_id || !tmplIds) {
      return res.status(400).json({ code: 400, message: '缺少参数' });
    }

    // Save subscription status for each template
    const logs = Object.entries(tmplIds).map(([tmplId, status]) => ({
      record_id,
      user_id: userId,
      template_id: tmplId,
      subscription_status: status === 'accept' ? 'subscribed' : 'rejected',
      created_at: new Date(),
    }));

    if (logs.length > 0) {
      await db('notification_logs').insert(logs);
    }

    res.json({ code: 0, message: '订阅状态已保存' });
  } catch (err) {
    next(err);
  }
};
