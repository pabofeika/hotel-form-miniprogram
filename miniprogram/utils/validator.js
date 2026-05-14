/**
 * 表单验证模块
 * 根据字段配置和条件引擎跳过隐藏字段
 */

const { evaluateConditions } = require('./condition-engine');

/**
 * 验证表单值
 * @param {Object} formValues - 当前表单值 { fieldId: value }
 * @param {Array} fields - 所有字段定义
 * @param {boolean} skipConditionCheck - 是否跳过条件检查（预览时使用）
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateForm(formValues, fields, skipConditionCheck = false) {
  const errors = [];

  for (const field of fields) {
    // 检查条件 - 如果字段隐藏则跳过验证
    if (!skipConditionCheck) {
      let conditionsObj = null;
      if (typeof field.conditions === 'string') {
        try { conditionsObj = JSON.parse(field.conditions); } catch (e) { conditionsObj = null; }
      } else {
        conditionsObj = field.conditions;
      }

      if (conditionsObj && !evaluateConditions(conditionsObj, formValues)) {
        continue; // 隐藏字段不验证
      }
    }

    const value = formValues[field.field_key];
    const isRequired = field.is_required === 1 || field.is_required === true;

    // 必填检查
    if (isRequired) {
      if (value === undefined || value === null || value === '') {
        errors.push({ field: field.field_key, label: field.label, message: `${field.label} 为必填项` });
        continue;
      }
      // 多选检查
      if (field.field_type === 'multi_select' && Array.isArray(value) && value.length === 0) {
        errors.push({ field: field.field_key, label: field.label, message: `请选择${field.label}` });
        continue;
      }
    }

    // 类型特定验证
    if (value !== undefined && value !== null && value !== '') {
      let validationObj = null;
      if (typeof field.validation === 'string') {
        try { validationObj = JSON.parse(field.validation); } catch (e) { validationObj = null; }
      } else {
        validationObj = field.validation;
      }

      if (validationObj) {
        // 最大长度
        if (validationObj.maxLength && typeof value === 'string' && value.length > validationObj.maxLength) {
          errors.push({ field: field.field_key, label: field.label, message: `${field.label} 不能超过 ${validationObj.maxLength} 个字符` });
        }
        // 最小值
        if (validationObj.min !== undefined && Number(value) < validationObj.min) {
          errors.push({ field: field.field_key, label: field.label, message: `${field.label} 不能小于 ${validationObj.min}` });
        }
        // 邮箱格式
        if (validationObj.pattern === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({ field: field.field_key, label: field.label, message: `请输入正确的邮箱格式` });
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateForm };
