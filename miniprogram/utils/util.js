/**
 * 工具函数
 */

/**
 * 格式化字段值用于展示
 */
function formatFieldValue(field, value) {
  if (value === undefined || value === null || value === '') {
    return '未填写';
  }

  switch (field.field_type) {
    case 'select':
      // Find label from options
      if (field.options) {
        let options = field.options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch (e) {}
        }
        if (Array.isArray(options)) {
          const opt = options.find(o => o.value === value);
          if (opt) return opt.label;
        }
      }
      return value;

    case 'multi_select':
      if (Array.isArray(value)) {
        if (field.options) {
          let options = field.options;
          if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch (e) {}
          }
          if (Array.isArray(options)) {
            return value.map(v => {
              const opt = options.find(o => o.value === v);
              return opt ? opt.label : v;
            }).join('、');
          }
        }
        return value.join('、');
      }
      return value;

    case 'file':
    case 'image':
      return value ? '已上传文件' : '未上传';

    case 'number':
      return value;

    default:
      return value;
  }
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

/**
 * 格式化记录状态
 */
function formatStatus(status) {
  const map = {
    draft: '草稿',
    submitted: '已提交',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
  };
  return map[status] || status;
}

module.exports = { formatFieldValue, formatDate, formatStatus };
