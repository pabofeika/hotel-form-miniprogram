const cache = require('../../utils/cache');
const theme = require('../../utils/theme');

Page({
  data: {
    userName: '酒店配置用户',
    userDesc: '创维商用智慧酒店',
    theme: 'light',
  },

  onLoad() {
    this.setData({ theme: theme.getTheme() });
  },

  onShow() {
    this.setData({ theme: theme.getTheme() });
    theme.syncTabBar(theme.getTheme());

    const app = getApp();
    if (app.globalData && app.globalData.userInfo) {
      this.setData({ userName: app.globalData.userInfo.nickname || '酒店配置用户' });
    }
  },

  toggleTheme() {
    theme.toggleTheme();
    const t = theme.getTheme();
    this.setData({ theme: t });
    theme.syncTabBar(t);
  },

  goToRecords() {
    wx.switchTab({ url: '/pages/record-list/record-list' });
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定清除所有本地缓存数据（含草稿）？',
      success: (res) => {
        if (res.confirm) {
          cache.clearExpiredDrafts();
          wx.clearStorageSync();
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      },
    });
  },
});
