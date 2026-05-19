// const auth = require('./utils/auth');

App({
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: 'http://192.168.32.245:3000/api/v1', // 测试环境；上线后切回正式地址
  },

  onLaunch() {
    // 登录模块已注释（小程序无需登录）
    // const token = wx.getStorageSync('user_token');
    // if (token) {
    //   this.globalData.token = token;
    // }
  },

  onError(err) {
    console.error('[App onError] 全局异常捕获:', err);
  },

  onUnhandledRejection(res) {
    console.error('[App onUnhandledRejection] 未处理 Promise 异常:', res.reason || res);
  },

  // login() 已注释，保留代码以便后续恢复
  // async login() {
  //   try {
  //     const { token, user } = await auth.login(this.globalData.apiBaseUrl);
  //     this.globalData.token = token;
  //     this.globalData.userInfo = user;
  //     wx.setStorageSync('user_token', token);
  //     return user;
  //   } catch (err) {
  //     console.error('Login failed:', err);
  //     return null;
  //   }
  // },
});
