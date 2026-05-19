const theme = require('./utils/theme');

App({
  globalData: {
    userInfo: null,
    token: '',
    theme: 'light',
    apiBaseUrl: 'http://127.0.0.1:3000/api/v1',
  },

  onLaunch() {
    // 初始化主题
    const t = theme.getTheme();
    this.globalData.theme = t;
  },

  onError(err) {
    console.error('[App onError] 全局异常捕获:', err);
  },

  onUnhandledRejection(res) {
    console.error('[App onUnhandledRejection] 未处理 Promise 异常:', res.reason || res);
  },
});
