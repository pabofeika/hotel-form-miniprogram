const api = require('../../utils/api');
const { backWithGuard } = require('../../utils/navigate');

Page({
  data: {
    formId: null,
    formValues: {},
    previewItems: [],
    loading: true,
  },

  onLoad() {
    console.log('[form-preview] onLoad');

    const previewData = wx.getStorageSync('form_preview_data') || {};
    const formValues = previewData.formValues || {};
    const fields = previewData.fields || [];

    console.log('[form-preview] 读取预览数据 keys:', Object.keys(formValues).length + '个', '字段定义:', fields.length + '个');

    // 构建预览条目
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
    // 数组转中文顿号分隔
    if (Array.isArray(value)) {
      if (field.options) {
        return value.map(v => {
          const opt = field.options.find(o => o.value === v || o.id === v);
          return opt ? (opt.label || opt.name || v) : v;
        }).join('、');
      }
      return value.join('、');
    }

    // 单选：显示 label 而非 value
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

    const { formValues, formId } = this.data;
    const keys = Object.keys(formValues);
    console.log('[form-preview] 提交 keys:', keys);

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

      wx.hideLoading();
      wx.showToast({ title: '提交成功', icon: 'success', duration: 2000 });

      setTimeout(() => {
        wx.redirectTo({ url: `/pages/record-detail/record-detail?id=${record.id}` });
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '提交失败', icon: 'none' });
    } finally {
      setTimeout(() => { this._submitting = false; }, 1000);
    }
  },
});
