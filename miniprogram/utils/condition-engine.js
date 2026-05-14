/**
 * 条件引擎 - 判断字段是否应该显示
 * 根据 conditions JSON 和当前表单值判断
 */

/**
 * 判断单个条件是否满足
 */
function evaluateRule(rule, formValues) {
  const fieldValue = formValues[rule.field];
  switch (rule.operator) {
    case 'eq':
      return fieldValue === rule.value;
    case 'neq':
      return fieldValue !== rule.value;
    case 'in':
      return Array.isArray(rule.value) && rule.value.includes(fieldValue);
    case 'not_in':
      return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(rule.value);
    case 'gt':
      return Number(fieldValue) > Number(rule.value);
    case 'lt':
      return Number(fieldValue) < Number(rule.value);
    default:
      return true;
  }
}

/**
 * 判断一组条件是否满足
 * conditions 格式：
 * {
 *   logic: 'and' | 'or',
 *   rules: [{ field, operator, value }]
 * }
 */
function evaluateConditions(conditions, formValues) {
  if (!conditions || !conditions.rules || conditions.rules.length === 0) {
    return true; // 无条件 = 始终显示
  }

  if (conditions.logic === 'or') {
    return conditions.rules.some(rule => evaluateRule(rule, formValues));
  }

  // Default: and
  return conditions.rules.every(rule => evaluateRule(rule, formValues));
}

module.exports = { evaluateConditions, evaluateRule };
