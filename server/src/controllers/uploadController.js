const upload = require('../middleware/upload');
const db = require('../config/database');

/**
 * POST /api/v1/upload - 文件上传
 */
exports.uploadFile = (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ code: 400, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择要上传的文件' });
    }

    try {
      const userId = req.user.id;
      const { record_id } = req.body;

      const [attachmentId] = await db('attachments').insert({
        record_id: record_id || null,
        user_id: userId,
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        created_at: new Date(),
      });

      res.json({
        code: 0,
        message: '上传成功',
        data: {
          id: attachmentId,
          file_name: req.file.originalname,
          file_size: req.file.size,
          url: `/uploads/${req.file.filename}`,
        },
      });
    } catch (dbErr) {
      next(dbErr);
    }
  });
};
