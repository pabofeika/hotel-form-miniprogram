const api = require('../../utils/api');
const { backWithGuard } = require('../../utils/navigate');
const theme = require('../../utils/theme');

Page({
  data: {
    formId: null,
    formValues: {},
    previewItems: [],
    loading: true,
    theme: 'light',
  },

  onLoad() {
    console.log('[form-preview] onLoad');
    this.setData({ theme: theme.getTheme() });

    const previewData = wx.getStorageSync('form_preview_data') || {};
    const formValues = previewData.formValues || {};
    const fields = previewData.fields || [];

    console.log('[form-preview] 读取预览数据 keys:', Object.keys(formValues).length + '个', '字段定义:', fields.length + '个');

    const previewItems = fields
      .filter(f => {
        const val = formValues[f.field_key];
        return val !== undefined && val !== null && val !== '' &&
          !(Array.isArray(val) && val.length === 0);
      })
      .map(f => ({
        key: f.field_key,
        label: f.label || f.title || f.name || f.field_key,
        value: this.formatDisplayValue(formValues[f.field_key], f),
      }));

    console.log('[form-preview] 预览条目数:', previewItems.length);

    this.setData({
      formId: previewData.formId || '',
      formValues,
      previewItems,
      loading: false,
    });
  },

  formatDisplayValue(value, field) {
    if (Array.isArray(value)) {
      if (field.options) {
        return value.map(v => {
          const opt = field.options.find(o => o.value === v || o.id === v);
          return opt ? (opt.label || opt.name || v) : v;
        }).join('、');
      }
      return value.join('、');
    }
    if (field.options && Array.isArray(field.options)) {
      const opt = field.options.find(o => o.value === value || o.id === value);
      if (opt) return opt.label || opt.name || value;
    }
    return value;
  },

  goBack() {
    backWithGuard(this, 1);
  },

  async submitForm() {
    if (this._submitting) return;
    this._submitting = true;

    const { formValues, formId, previewItems } = this.data;
    const keys = Object.keys(formValues);
    console.log('[form-preview] 提交 keys:', keys);
    console.log('[form-preview] previewItems:', previewItems.length, '条');

    if (keys.length === 0) {
      wx.showToast({ title: '表单数据为空，请重新填写', icon: 'none' });
      this._submitting = false;
      return;
    }

    wx.showLoading({ title: '提交中...' });
    try {
      const record = await api.post('/records', {
        form_template_id: formId,
        action: 'submit',
        values: formValues,
      });
      console.log('[form-preview] 提交成功 record:', record);

      wx.hideLoading();
      wx.showToast({ title: '提交成功', icon: 'success', duration: 2000 });

      // 保存完整订单数据到本地，详情页直接读取（零网络请求）
      const order = {
        id: record.id || 'order_' + Date.now(),
        formId,
        formValues,
        previewItems,
        createdAt: Date.now(),
      };
      wx.setStorageSync('last_order_detail', order);
      console.log('[form-preview] 订单已保存到 storage:', order.id);

      setTimeout(() => {
        wx.redirectTo({ url: `/pages/record-detail/record-detail?orderId=${order.id}` });
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '提交失败', icon: 'none' });
    } finally {
      setTimeout(() => { this._submitting = false; }, 1000);
    }
  },

  toggleTheme() {
    theme.toggleTheme();
    const t = theme.getTheme();
    this.setData({ theme: t });
    theme.syncTabBar(t);
  },

  setTheme(t) {
    this.setData({ theme: t });
    theme.syncTabBar(t);
  },

  onShow() {
    this.setData({ theme: theme.getTheme() });
    theme.syncTabBar(theme.getTheme());
  },
});
