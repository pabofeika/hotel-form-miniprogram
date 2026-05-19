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
    console.log('[record-detail] onLoad id:', id);
    this.loadDetail(id);
  },

  async loadDetail(id) {
    try {
      console.log('[record-detail] loading record:', id);
      const data = await api.get(`/records/${id}`);
      console.log('[record-detail] API response:', {
        record: data.record ? data.record.record_sn : 'null',
        values: (data.values || []).length,
        feedbacks: (data.feedbacks || []).length,
      });

      const record = data.record;

      // 按 field_key 映射值
      const mappedValues = {};
      (data.values || []).forEach((v, idx) => {
        const key = v.field ? v.field.field_key : v.field_key;
        if (key) {
          let val = v.value;
          try { val = JSON.parse(val); } catch (e) {}
          mappedValues[key] = val;
          if (idx < 3) console.log('[record-detail] value:', key, '=', val);
        }
      });
      console.log('[record-detail] mappedValues keys:', Object.keys(mappedValues));

      // 获取模板结构
      const template = await api.get(`/forms/${record.form_template_id}`);
      console.log('[record-detail] template steps:', (template.steps || []).length);

      const formSteps = template.steps.map(step => {
        const fields = (step.fields || []).map(f => ({
          ...f,
          visible: true,
          value: mappedValues[f.field_key],
        }));
        return { ...step, fields };
      });
      console.log('[record-detail] formSteps:', formSteps.length, 'steps');

      this.setData({
        record,
        formSteps,
        feedbacks: data.feedbacks,
        loading: false,
      });
    } catch (err) {
      console.error('[record-detail] load error:', err);
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
