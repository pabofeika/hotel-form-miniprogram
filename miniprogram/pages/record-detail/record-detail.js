const api = require('../../utils/api');
const { formatDate, formatStatus, formatFieldValue } = require('../../utils/util');
const { evaluateConditions } = require('../../utils/condition-engine');

Page({
  data: {
    record: null,
    formSteps: [],
    feedbacks: [],
    loading: true,
  },

  onLoad(options) {
    const id = options.id;
    this.loadDetail(id);
  },

  async loadDetail(id) {
    try {
      const data = await api.get(`/records/${id}`);
      const record = data.record;

      // 直接用 field_key 映射，避免前后端 field_id 不一致
      const mappedValues = {};
      (data.values || []).forEach(v => {
        const key = v.field ? v.field.field_key : v.field_key;
        if (key) {
          let val = v.value;
          try { val = JSON.parse(val); } catch (e) { /* string */ }
          mappedValues[key] = val;
        }
      });

      // 获取模板结构
      const template = await api.get(`/forms/${record.form_template_id}`);

      const formSteps = template.steps.map(step => {
        const fields = (step.fields || []).map(f => {
          let conditionsObj = null;
          if (typeof f.conditions === 'string') {
            try { conditionsObj = JSON.parse(f.conditions); } catch (e) {}
          } else {
            conditionsObj = f.conditions;
          }
          const visible = !conditionsObj || evaluateConditions(conditionsObj, mappedValues);
          return { ...f, visible, value: mappedValues[f.field_key] };
        });
        return { ...step, fields };
      });

      this.setData({
        record,
        formSteps,
        feedbacks: data.feedbacks,
        loading: false,
      });
    } catch (err) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  formatValue(field) {
    return formatFieldValue(field, field.value);
  },

  formatDate,
  formatStatus,
});
