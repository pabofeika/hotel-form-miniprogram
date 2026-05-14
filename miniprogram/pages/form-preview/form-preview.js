const api = require('../../utils/api');
const { evaluateConditions } = require('../../utils/condition-engine');
const { formatFieldValue } = require('../../utils/util');

Page({
  data: {
    formId: null,
    formValues: {},
    steps: [],
    loading: true,
  },

  onLoad(options) {
    const formId = parseInt(options.formId);
    const formValues = JSON.parse(decodeURIComponent(options.formValues));

    this.setData({ formId, formValues });
    this.loadFormDetail();
  },

  async loadFormDetail() {
    try {
      const template = await api.get(`/forms/${this.data.formId}`);

      // Build visible fields for each step
      const steps = template.steps.map(step => {
        const fields = (step.fields || []).map(f => {
          let conditionsObj = null;
          if (typeof f.conditions === 'string') {
            try { conditionsObj = JSON.parse(f.conditions); } catch (e) {}
          } else {
            conditionsObj = f.conditions;
          }
          const visible = !conditionsObj || evaluateConditions(conditionsObj, this.data.formValues);
          return { ...f, visible };
        });
        return { ...step, fields };
      });

      this.setData({ steps, loading: false });
    } catch (err) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  formatValue(field) {
    return formatFieldValue(field, this.data.formValues[field.field_key]);
  },

  goBack() {
    wx.navigateBack();
  },

  async submitForm() {
    wx.showLoading({ title: '提交中...' });
    try {
      const record = await api.post('/records', {
        form_template_id: this.data.formId,
        action: 'submit',
        values: this.data.formValues,
      });

      // Subscribe message
      try {
        const { requestSubscribe } = require('../../utils/notify');
        const result = await requestSubscribe(['your_template_id_here']);
        await api.post('/notifications/subscribe', {
          record_id: record.id,
          tmplIds: result,
        });
      } catch (e) {
        // Subscription is optional
      }

      wx.hideLoading();
      wx.showToast({ title: '提交成功', icon: 'success', duration: 2000 });

      // Redirect to record detail
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/record-detail/record-detail?id=${record.id}` });
      }, 2000);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '提交失败', icon: 'none' });
    }
  },
});
