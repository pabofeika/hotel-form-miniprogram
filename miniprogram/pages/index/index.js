const api = require('../../utils/api');
const cache = require('../../utils/cache');

Page({
  data: {
    forms: [],
    loading: true,
    hasDraft: false,
    draftFormId: null,
  },

  onLoad() {
    console.log('[index] onLoad');
    this.loadForms();
    this.checkDraft();
  },

  onShow() {
    this.checkDraft();
  },

  async loadForms() {
    this.setData({ loading: true });
    try {
      const forms = await api.get('/forms');
      this.setData({ forms });
    } catch (err) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  checkDraft() {
    // Check if there's any draft saved
    const keys = wx.getStorageInfoSync().keys;
    const draftKeys = keys.filter(k => k.startsWith('draft_form_'));
    if (draftKeys.length > 0) {
      const draft = wx.getStorageSync(draftKeys[0]);
      this.setData({ hasDraft: true, draftFormId: draft.formId });
    } else {
      this.setData({ hasDraft: false });
    }
  },

  startForm(e) {
    const formId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/form-edit/form-edit?formId=${formId}` });
  },

  resumeDraft() {
    if (this.data.draftFormId) {
      wx.navigateTo({
        url: `/pages/form-edit/form-edit?formId=${this.data.draftFormId}&resume=true`,
      });
    }
  },
});
