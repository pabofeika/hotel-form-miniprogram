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

      // Build form steps with values
      const template = await api.get(`/forms/${record.form_template_id}`);
      const formValues = {};
      data.values.forEach(v => {
        try {
          formValues[v.field_id] = JSON.parse(v.value);
        } catch (e) {
          formValues[v.field_id] = v.value;
        }
      });

      // Map field_id to field_key
      const allFields = [];
      template.steps.forEach(s => {
        (s.fields || []).forEach(f => allFields.push(f));
      });

      const mappedValues = {};
      data.values.forEach(v => {
        const field = allFields.find(f => f.id === v.field_id);
        if (field) {
          mappedValues[field.field_key] = formValues[v.field_id];
        }
      });

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
