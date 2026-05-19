const api = require('../../utils/api');
const cache = require('../../utils/cache');
const theme = require('../../utils/theme');

Page({
  data: {
    forms: [],
    loading: true,
    hasDraft: false,
    draftFormId: null,
    theme: 'light',
  },

  onLoad() {
    console.log('[index] onLoad');
    this.setData({ theme: theme.getTheme() });
    theme.syncTabBar(theme.getTheme());
    this.loadForms();
    this.checkDraft();
  },

  onShow() {
    this.setData({ theme: theme.getTheme() });
    theme.syncTabBar(theme.getTheme());
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
});
