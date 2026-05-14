const auth = require('./utils/auth');

App({
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: 'http://localhost:3000/api/v1',
  },

  onLaunch() {
    // Auto login when app starts
    const token = wx.getStorageSync('user_token');
    if (token) {
      this.globalData.token = token;
    }
  },

  async login() {
    try {
      const { token, user } = await auth.login(this.globalData.apiBaseUrl);
      this.globalData.token = token;
      this.globalData.userInfo = user;
      wx.setStorageSync('user_token', token);
      return user;
    } catch (err) {
      console.error('Login failed:', err);
      return null;
    }
  },
});
