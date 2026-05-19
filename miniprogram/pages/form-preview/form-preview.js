const api = require('../../utils/api');
const { evaluateConditions } = require('../../utils/condition-engine');
const { formatFieldValue } = require('../../utils/util');
const { safeBack, backWithGuard } = require('../../utils/navigate');

Page({
  data: {
    formId: null,
    formValues: {},
    steps: [],
    loading: true,
  },

  onLoad(options) {
    console.log('[form-preview] onLoad');

    const previewData = wx.getStorageSync('form_preview_data') || {};
    console.log('[form-preview] 读取预览数据:', previewData.formValues ? Object.keys(previewData.formValues) : '空');

    this.setData({
      formId: previewData.formId || '',
      formValues: previewData.formValues || {},
    });
    this.loadFormDetail();
  },

  onShow() { console.log('[form-preview] onShow'); },

  onUnload() { console.log('[form-preview] onUnload'); },

  async loadFormDetail() {
    try {
      const template = await api.get(`/forms/${this.data.formId}`);

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
    backWithGuard(this, 1);
  },

  async submitForm() {
    if (this._submitting) return;
    this._submitting = true;

    const formValues = this.data.formValues;
    const keys = Object.keys(formValues);
    console.log('[form-preview] 提交数据 keys:', keys);

    if (keys.length === 0) {
      wx.hideLoading();
      wx.showToast({ title: '表单数据为空，请重新填写', icon: 'none' });
      this._submitting = false;
      return;
    }

    wx.showLoading({ title: '提交中...' });
    try {
      const record = await api.post('/records', {
        form_template_id: this.data.formId,
        action: 'submit',
        values: formValues,
      });

      // Subscribe message (optional)
      try {
        const { requestSubscribe } = require('../../utils/notify');
        const result = await requestSubscribe(['your_template_id_here']);
        await api.post('/notifications/subscribe', {
          record_id: record.id,
          tmplIds: result,
        });
      } catch (e) { /* optional */ }

      wx.hideLoading();
      wx.showToast({ title: '提交成功', icon: 'success', duration: 2000 });

      setTimeout(() => {
        wx.redirectTo({ url: `/pages/record-detail/record-detail?id=${record.id}` });
      }, 2000);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '提交失败', icon: 'none' });
    } finally {
      setTimeout(() => { this._submitting = false; }, 1000);
    }
  },
});
