/**
 * 用户认证模块
 * 微信静默登录，无需用户注册
 */

function login(apiBaseUrl) {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (loginRes.code) {
          wx.request({
            url: apiBaseUrl + '/auth/login',
            method: 'POST',
            data: { code: loginRes.code },
            success(res) {
              if (res.data.code === 0) {
                resolve(res.data.data);
              } else {
                reject(res.data.message);
              }
            },
            fail: reject,
          });
        } else {
          reject('微信登录失败，code为空');
        }
      },
      fail: reject,
    });
  });
}

module.exports = { login };
