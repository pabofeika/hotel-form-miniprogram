// const auth = require('./utils/auth');

App({
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: 'http://127.0.0.1:3000/api/v1',
  },

  onLaunch() {
    // 登录模块已注释（小程序无需登录）
    // const token = wx.getStorageSync('user_token');
    // if (token) {
    //   this.globalData.token = token;
    // }
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
