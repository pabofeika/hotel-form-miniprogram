/**
 * API 请求封装
 * 表单数据直接从本地加载，不发起网络请求
 * 仅提交记录、登录等操作需要网络
 */
const config = require('../config');
const { defaultFormTemplate } = require('./mock-data');

const apiBaseUrl = () => config.apiBaseUrl;

function getToken() {
  return wx.getStorageSync('user_token') || '';
}

function request(method, url, data = {}) {
  const token = getToken();
  return new Promise((resolve, reject) => {
    wx.request({
      url: apiBaseUrl() + url,
      method,
      data,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      success(res) {
        if (res.data.code === 0) resolve(res.data.data);
        else reject({ message: res.data.message || '请求失败', code: res.data.code });
      },
      fail(err) {
        reject({ message: '网络请求失败' });
      },
    });
  });
}

module.exports = {
  // 表单相关：直接从本地加载，零网络请求
  get(url) {
    if (url === '/forms') {
      return Promise.resolve([
        { id: defaultFormTemplate.id, title: defaultFormTemplate.title,
          description: defaultFormTemplate.description, version: defaultFormTemplate.version }
      ]);
    }
    const match = url.match(/^\/forms\/(\d+)$/);
    if (match) {
      return Promise.resolve(defaultFormTemplate);
    }
    // 其他 GET 请求走网络
    return request('GET', url);
  },

  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  del: (url) => request('DELETE', url),
};
