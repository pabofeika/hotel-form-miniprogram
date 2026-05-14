/**
 * 本地草稿缓存模块
 * 自动保存表单填写进度，防止用户数据丢失
 */

const DRAFT_PREFIX = 'draft_form_';
const DRAFT_RECORD_PREFIX = 'draft_record_';
const FORM_CACHE_PREFIX = 'form_cache_';

module.exports = {
  /**
   * 保存新表单草稿
   */
  saveFormDraft(formId, data) {
    const key = DRAFT_PREFIX + formId;
    const draft = {
      formId,
      data,
      currentStep: data.currentStep || 1,
      updatedAt: Date.now(),
    };
    wx.setStorageSync(key, draft);
  },

  /**
   * 获取新表单草稿
   */
  getFormDraft(formId) {
    const key = DRAFT_PREFIX + formId;
    return wx.getStorageSync(key) || null;
  },

  /**
   * 保存已有记录草稿
   */
  saveRecordDraft(recordId, data) {
    const key = DRAFT_RECORD_PREFIX + recordId;
    const draft = {
      recordId,
      data,
      currentStep: data.currentStep || 1,
      updatedAt: Date.now(),
    };
    wx.setStorageSync(key, draft);
  },

  /**
   * 获取已有记录草稿
   */
  getRecordDraft(recordId) {
    const key = DRAFT_RECORD_PREFIX + recordId;
    return wx.getStorageSync(key) || null;
  },

  /**
   * 清除草稿
   */
  clearDraft(formId, recordId) {
    if (formId) wx.removeStorageSync(DRAFT_PREFIX + formId);
    if (recordId) wx.removeStorageSync(DRAFT_RECORD_PREFIX + recordId);
  },

  /**
   * 缓存表单结构（30分钟过期）
   */
  cacheFormStructure(formId, structure) {
    const key = FORM_CACHE_PREFIX + formId;
    wx.setStorageSync(key, {
      data: structure,
      expiry: Date.now() + 30 * 60 * 1000,
    });
  },

  /**
   * 获取缓存的表单结构
   */
  getCachedFormStructure(formId) {
    const key = FORM_CACHE_PREFIX + formId;
    const cached = wx.getStorageSync(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      wx.removeStorageSync(key);
      return null;
    }
    return cached.data;
  },

  /**
   * 清理过期草稿（7天以上）
   */
  clearExpiredDrafts() {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const keys = wx.getStorageInfoSync().keys;
    keys.forEach(key => {
      if (key.startsWith(DRAFT_PREFIX) || key.startsWith(DRAFT_RECORD_PREFIX)) {
        const draft = wx.getStorageSync(key);
        if (draft && now - draft.updatedAt > sevenDays) {
          wx.removeStorageSync(key);
        }
      }
    });
  },
};
