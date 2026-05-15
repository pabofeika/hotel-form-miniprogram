/**
 * 用户认证模块
 * 离线模式：直接生成 mock token，不请求网络
 */

function login(apiBaseUrl) {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        const code = loginRes.code || 'dev_mock';
        // 生成本地 mock token（开发/离线用）
        const mockUser = {
          id: 1,
          openid: 'mock_' + code,
          nickname: '离线用户',
          avatar: '',
        };
        const mockToken = 'mock_' + code + '_' + Date.now();
        wx.setStorageSync('user_token', mockToken);
        wx.setStorageSync('user_info', JSON.stringify(mockUser));
        resolve({ token: mockToken, user: mockUser });
      },
      fail() {
        // wx.login 失败时也返回 mock 数据，保证不阻塞
        const mockUser = { id: 1, openid: 'mock_fallback', nickname: '离线用户', avatar: '' };
        const mockToken = 'mock_fallback_' + Date.now();
        wx.setStorageSync('user_token', mockToken);
        wx.setStorageSync('user_info', JSON.stringify(mockUser));
        resolve({ token: mockToken, user: mockUser });
      },
    });
  });
}

module.exports = { login };
