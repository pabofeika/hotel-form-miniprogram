const db = require('../../config/database');

/**
 * GET /api/v1/admin/dashboard - 统计看板
 */
exports.getStats = async (req, res, next) => {
  try {
    const [userCount] = await db('users').count('* as count');
    const [recordCount] = await db('records').count('* as count');
    const [pendingCount] = await db('records').where({ status: 'submitted' }).count('* as count');
    const [feedbackToday] = await db('feedback')
      .whereRaw("date(created_at) = date('now')")
      .count('* as count');

    // Recent records
    const recentRecords = await db('records')
      .leftJoin('users', 'records.user_id', 'users.id')
      .select('records.id', 'records.record_sn', 'records.status', 'records.created_at', 'users.openid')
      .orderBy('records.created_at', 'desc')
      .limit(10);

    res.json({
      code: 0,
      data: {
        stats: {
          total_users: userCount.count,
          total_records: recordCount.count,
          pending_records: pendingCount.count,
          feedback_today: feedbackToday.count,
        },
        recent_records: recentRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};
