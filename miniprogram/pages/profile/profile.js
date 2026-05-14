const cache = require('../../utils/cache');

Page({
  data: {
    userName: '酒店配置用户',
    userDesc: '创维商用智慧酒店',
  },

  onShow() {
    const app = getApp();
    if (app.globalData && app.globalData.userInfo) {
      this.setData({ userName: app.globalData.userInfo.nickname || '酒店配置用户' });
    }
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
